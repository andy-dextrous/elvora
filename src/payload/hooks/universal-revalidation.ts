import { revalidate } from "@/lib/cache/revalidation"
import { routingEngine } from "@/lib/routing"
import { updateURI, deleteURI } from "@/lib/routing/index-manager"
import { getTemplateIdForCollection } from "@/lib/routing/index-manager"
import {
  shouldTriggerArchiveCascade,
  shouldTriggerHierarchyCascade,
  getCollectionsUsingArchive,
  detectHierarchyChanges,
  detectHomepageChange,
  detectAllSettingsChanges,
} from "@/lib/routing/dependency-analyzer"
import { isFrontendCollection } from "@/payload/collections/frontend"
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  GlobalAfterChangeHook,
} from "payload"

/*************************************************************************/
/*  UNIVERSAL COLLECTION HOOKS

  Contains the following hooks:
  - beforeCollectionChange
  - afterCollectionChange
  - afterCollectionDelete
  - afterGlobalChange

/*************************************************************************/

/**
 *    BEFORE COLLECTION CHANGE - DATA PREPARATION PHASE
 *
 *    Runs BEFORE document hits database - modifies data being saved
 *
 *    Why "before" is essential:
 *    - Generates URI and attaches to document before save (data.uri = newURI)
 *    - Compares old vs new data to detect cascade needs (using originalDoc)
 *    - Stores cascade plans in request context for after hook
 *    - Sets error flags on document for recovery (data._uriGenerationFailed)
 *
 *    Critical: Must happen before save to ensure URI becomes part of saved document
 */

export const beforeCollectionChange: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req: { payload, context },
  collection,
}) => {
  if (!isFrontendCollection(collection.slug)) {
    return data
  }

  const draftToPublished =
    data._status === "published" && originalDoc?._status !== "published"
  const slugHasChanged =
    data._status === "published" &&
    originalDoc?._status === "published" &&
    data.slug !== originalDoc?.slug

  // URI Generation for published content
  if (draftToPublished || slugHasChanged) {
    try {
      const newURI = await routingEngine.generateURI({
        collection: collection.slug,
        slug: data.slug,
        data,
        originalDoc,
      })

      data.uri = newURI
      data._uriGenerated = true
    } catch (error) {
      payload.logger.error(
        `URI generation failed for ${collection.slug}/${data.slug}:`,
        error
      )
      // Don't fail the save, but flag for later processing
      data._uriGenerationFailed = true
    }
  }

  // Initialize cascade context using utility function
  const cascadeContext = ensureCascadeContext(context)

  // Enhanced Cascade Detection for Pages (ONLY for published content)
  if (collection.slug === "pages" && (draftToPublished || slugHasChanged)) {
    // Archive Page Changes (expanded detection)
    const needsArchiveCascade = await shouldTriggerArchiveCascade(
      collection.slug,
      data,
      originalDoc
    )

    if (needsArchiveCascade) {
      const dependencies = await getCollectionsUsingArchive(data.id)

      console.log(
        `[Cascade Detection] Archive page ${data.slug} change will affect ${dependencies.length} collections`
      )
      cascadeContext.push({
        operation: "archive-page-update",
        entityId: data.id,
        additionalData: {
          oldSlug: originalDoc?.slug,
          newSlug: data.slug,
          affectedCollections: dependencies.map(dep => dep.collection),
        },
      })
    }

    // Hierarchy Changes (expanded detection)
    const needsHierarchyCascade = await shouldTriggerHierarchyCascade(
      collection.slug,
      data,
      originalDoc
    )

    if (needsHierarchyCascade) {
      const hierarchyChanges = detectHierarchyChanges(data, originalDoc)

      console.log(`[Cascade Detection] Page ${data.slug} hierarchy change detected`)
      cascadeContext.push({
        operation: "page-hierarchy-update",
        entityId: data.id,
        additionalData: {
          oldParent: hierarchyChanges.oldParent,
          newParent: hierarchyChanges.newParent,
        },
      })
    }
  }

  return data
}

/**
 *    AFTER COLLECTION CHANGE - INDEX MAINTENANCE & EXECUTION PHASE
 *
 *    Runs AFTER document is safely saved to database - maintains external systems
 *
 *    Why "after" is essential:
 *    - Has real document ID for new documents (doc.id now exists)
 *    - Transaction is complete - safe to update URI index without conflicts
 *    - Executes cascade jobs with final document state
 *    - Handles URI generation failures flagged in before hook
 *    - Performs smart cache revalidation with complete document data
 *
 *    Critical: External system updates happen after primary transaction commits
 */

export const afterCollectionChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req: { payload, context },
  collection,
}) => {
  const isPublished = doc._status === "published"
  const wasPreviouslyPublished = previousDoc?._status === "published"

  // URI Index Maintenance for Frontend Collections
  if (isFrontendCollection(collection.slug)) {
    try {
      // Get template ID once for all operations in this collection
      const templateId = await getTemplateIdForCollection(collection.slug)

      if (isPublished && doc.uri) {
        // Update index entry for published documents
        await updateURI({
          uri: doc.uri,
          collection: collection.slug,
          documentId: doc.id,
          status: "published",
          templateId: templateId || undefined,
          previousURI:
            previousDoc?.uri && previousDoc.uri !== doc.uri ? previousDoc.uri : undefined,
        })
      } else if (wasPreviouslyPublished && !isPublished) {
        // Document was unpublished - remove from index
        await deleteURI(collection.slug, doc.id)
      } else if (doc._status === "draft" && doc.uri) {
        // Handle draft versions separately if needed
        await updateURI({
          uri: doc.uri,
          collection: collection.slug,
          documentId: doc.id,
          status: "draft",
          templateId: templateId || undefined,
          previousURI:
            previousDoc?.uri && previousDoc.uri !== doc.uri ? previousDoc.uri : undefined,
        })
      }

      // Handle URI generation failures
      if ((doc as any)._uriGenerationFailed) {
        payload.logger.warn(
          `URI generation failed for ${collection.slug}/${doc.id}. Queuing for retry.`
        )
        // Queue retry job for URI generation failures
        try {
          const job = await payload.jobs.queue({
            task: "cascade-uris",
            input: {
              operation: "uri-generation-retry",
              entityId: doc.id,
              additionalData: {
                collection: collection.slug,
                retryAttempt: 1,
              },
            },
          })
          payload.logger.info(
            `Queued URI generation retry job ${job.id} for ${collection.slug}/${doc.id}`
          )
        } catch (jobError) {
          payload.logger.error(`Failed to queue URI generation retry job:`, jobError)
        }
      }
    } catch (error) {
      payload.logger.error(
        `URI index update failed for ${collection.slug}/${doc.id}:`,
        error
      )
    }
  }

  // Process Cascade Jobs from Context
  const cascadeOperations = ensureCascadeContext(context)
  if (cascadeOperations.length > 0) {
    await processCascadeJobs(cascadeOperations, payload, payload.logger)

    // Clear cascade context after processing
    delete (context as any).cascade
  }

  // Skip revalidation for unpublished content or if revalidation is disabled (to prevent publish/revalidate loops)
  if (context.disableRevalidate || !isPublished) {
    return doc
  }

  payload.logger.info(
    `afterCollectionChange: ${collection.slug} - ${previousDoc?.slug} -> ${doc.slug}`
  )

  try {
    await revalidate({
      collection: collection.slug,
      doc,
      previousDoc,
      action: operation === "create" ? "create" : "update",
      logger: payload.logger,
    })
  } catch (error) {
    payload.logger.error(`Smart revalidation failed for ${collection.slug}:`, error)
  }

  return doc
}

/**
 *    AFTER COLLECTION DELETE - CLEANUP PHASE
 *
 *    Runs AFTER document is deleted from database - cleans up external references
 *
 *    Why "after delete" is needed:
 *    - Removes URI index entries for deleted documents
 *    - Cleans up orphaned references in external systems
 *    - Revalidates pages that may have referenced deleted content
 *    - No cascade operations needed (deletion doesn't change other URIs)
 *
 *    Critical: Cleanup happens after deletion to avoid referential integrity issues
 */

export const afterCollectionDelete: CollectionAfterDeleteHook = async ({
  doc,
  req: { payload, context },
  collection,
}) => {
  // URI Index Cleanup for Frontend Collections
  if (isFrontendCollection(collection.slug)) {
    try {
      await deleteURI(collection.slug, doc.id)
    } catch (error) {
      payload.logger.error(
        `URI index cleanup failed for ${collection.slug}/${doc.id}:`,
        error
      )
    }
  }

  if (context.disableRevalidate) {
    return doc
  }

  try {
    await revalidate({
      collection: collection.slug,
      doc,
      action: "delete",
      logger: payload.logger,
    })
  } catch (error) {
    payload.logger.error(
      `Smart revalidation failed for ${collection.slug} delete:`,
      error
    )
  }

  return doc
}

/*************************************************************************/
/*  UNIVERSAL GLOBAL HOOKS
/*************************************************************************/

/**
 *    AFTER GLOBAL CHANGE - SETTINGS CASCADE DETECTION PHASE
 *
 *    Runs AFTER global settings are saved - detects site-wide impacts
 *
 *    Why "after global" is needed:
 *    - Detects homepage designation changes (old / → /home, new /welcome → /)
 *    - Identifies archive page assignment changes affecting entire collections
 *    - Queues cascade jobs for site-wide URI regeneration
 *    - Only "after" because globals don't need URI generation (no individual URIs)
 *
 *    Critical: Settings changes can affect hundreds of pages - cascade detection essential
 */

export const afterGlobalChange: GlobalAfterChangeHook = async ({
  doc,
  previousDoc,
  req: { payload, context },
  global,
}) => {
  // Initialize cascade context for global changes
  const cascadeContext = ensureCascadeContext(context)

  // Cascade Detection for Settings Changes
  if (previousDoc && global.slug === "settings") {
    const settingsChanges = detectAllSettingsChanges(previousDoc, doc)

    // Homepage Change Detection
    if (settingsChanges.homepageChange) {
      const homepageChange = detectHomepageChange(previousDoc, doc)

      if (homepageChange.changed) {
        console.log(`[Settings Cascade] Homepage change detected`)
        cascadeContext.push({
          operation: "homepage-change",
          entityId: homepageChange.newHomepage || "unknown",
          additionalData: {
            oldHomepageId: homepageChange.oldHomepage,
            newHomepageId: homepageChange.newHomepage,
          },
        })
      }
    }

    // Archive Settings Change Detection
    if (settingsChanges.archiveChanges && settingsChanges.archiveChanges.length > 0) {
      console.log(`[Settings Cascade] Archive settings changes detected`)
      cascadeContext.push({
        operation: "settings-change",
        entityId: doc.id,
        additionalData: {
          affectedCollections: settingsChanges.archiveChanges.map(
            change => change.collection
          ),
          archiveChanges: settingsChanges.archiveChanges,
        },
      })
    }
  }

  // Process cascade jobs using unified function
  if (cascadeContext.length > 0) {
    await processCascadeJobs(cascadeContext, payload, payload.logger)

    // Clear cascade context after processing
    delete (context as any).cascade
  }

  // Fixed status checking logic (was inverted)
  if (context.disableRevalidate || !doc._status || doc._status !== "published") {
    return doc
  }

  try {
    await revalidate({
      collection: `global:${global.slug}`,
      doc,
      previousDoc,
      action: "update",
      logger: payload.logger,
    })
  } catch (error) {
    payload.logger.error(`Revalidation failed for global ${global.slug}:`, error)
  }

  return doc
}

/*************************************************************************/
/*  UTILITY FUNCTIONS
/*************************************************************************/

/**
 * Ensures cascade context exists and returns it
 */
function ensureCascadeContext(context: any): any[] {
  if (!context.cascade) {
    context.cascade = []
  }
  return context.cascade
}

/**
 * Unified cascade job processing
 */
async function processCascadeJobs(
  cascadeOps: any[],
  payload: any,
  logger: any
): Promise<void> {
  for (const cascadeOp of cascadeOps) {
    try {
      const job = await (payload.jobs as any).queue({
        task: "cascade-uris",
        input: cascadeOp,
      })

      console.log(
        `[Cascade Jobs] Queued ${cascadeOp.operation} job (ID: ${job.id}) for entity ${cascadeOp.entityId}`
      )

      // Execute critical operations immediately (but asynchronously to avoid blocking)
      if (cascadeOp.operation === "homepage-change") {
        // Don't await - let it run in background to avoid race conditions
        payload.jobs.runByID({ id: job.id! }).catch((error: any) => {
          logger.error(`Failed to execute immediate cascade job ${job.id}:`, error)
        })
        console.log(
          `[Cascade Jobs] Dispatched homepage change job for immediate execution`
        )
      } else {
        // Execute all other cascade operations immediately as well
        // This ensures URI synchronicity is maintained in real-time
        payload.jobs.runByID({ id: job.id! }).catch((error: any) => {
          logger.error(`Failed to execute cascade job ${job.id}:`, error)
        })
        console.log(
          `[Cascade Jobs] Dispatched ${cascadeOp.operation} job for immediate execution`
        )
      }
    } catch (error) {
      logger.error(`Failed to queue cascade job for ${cascadeOp.operation}:`, error)
    }
  }
}
