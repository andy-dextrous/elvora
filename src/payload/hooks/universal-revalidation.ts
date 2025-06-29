import { revalidate, revalidateCollection } from "@/lib/cache/revalidation"
import { routingEngine } from "@/lib/routing"
import { updateURI, deleteURI } from "@/lib/routing/index-manager"
import { getTemplateIdForCollection } from "@/lib/routing/index-manager"
import {
  shouldTriggerArchiveDependentUpdates,
  shouldTriggerHierarchyDependentUpdates,
  getCollectionsFromArchive,
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
import { revalidateTag, revalidatePath } from "next/cache"

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
  if (!isFrontendCollection(collection.slug) || !needsURIGeneration(data, originalDoc))
    return data

  // URI Generation - Generate and attach URI before save so it becomes part of the saved document
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
    data._uriGenerationFailed = true
  }

  // Dependent Updates Detection (Pages Only) - Pages can affect other collections via archive/hierarchy relationships
  if (collection.slug !== "pages") return data

  const dependentUpdates = getDependentUpdatesContext(context)

  // Archive Dependent Updates Detection - When archive pages change, all collection items need URI updates
  if (await shouldTriggerArchiveDependentUpdates(collection.slug, data, originalDoc)) {
    const dependencies = await getCollectionsFromArchive(data.id)
    console.log(
      `[Dependent Updates] Archive page ${data.slug} change will affect ${dependencies.length} collections`
    )

    dependentUpdates.push({
      operation: "archive-page-update",
      entityId: data.id,
      additionalData: {
        oldSlug: originalDoc?.slug,
        newSlug: data.slug,
        affectedCollections: dependencies.map(dep => dep.collection),
      },
    })
  }

  // Hierarchy Dependent Updates Detection - When parent pages move, all child pages need URI updates
  if (await shouldTriggerHierarchyDependentUpdates(collection.slug, data, originalDoc)) {
    const hierarchyChanges = detectHierarchyChanges(data, originalDoc)
    console.log(`[Dependent Updates] Page ${data.slug} hierarchy change detected`)

    dependentUpdates.push({
      operation: "page-hierarchy-update",
      entityId: data.id,
      additionalData: {
        oldParent: hierarchyChanges.oldParent,
        newParent: hierarchyChanges.newParent,
      },
    })
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
  if (!isFrontendCollection(collection.slug)) return doc

  // Step 1, update the uri index for the collection with the correct uri, template, and previous uri
  await updateURIIndex(doc, previousDoc, collection, payload)

  // Step 2, process dependent updates - Execute jobs for changes that affect other documents
  const dependentUpdates = getDependentUpdatesContext(context)
  if (dependentUpdates.length > 0) {
    await processDependentUpdates(dependentUpdates, payload)
    clearDependentUpdatesContext(context)
  }

  // Revalidation - Clear Next.js cache for pages affected by this change. This happens after the document is saved to the database.

  const isPublished = doc._status === "published"
  if (context.disableRevalidate || !isPublished) return doc

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

  if (context.disableRevalidate) return doc

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
  if (global.slug === "settings" && previousDoc) {
    const dependentUpdates = getDependentUpdatesContext(context)
    const settingsChanges = detectAllSettingsChanges(previousDoc, doc)

    // Homepage Changes - When homepage designation changes, old/new pages need URI swaps
    if (settingsChanges.homepageChange) {
      const homepageChange = detectHomepageChange(previousDoc, doc)

      if (homepageChange.changed) {
        dependentUpdates.push({
          operation: "homepage-change",
          entityId: homepageChange.newHomepage || "unknown",
          additionalData: {
            oldHomepageId: homepageChange.oldHomepage,
            newHomepageId: homepageChange.newHomepage,
          },
        })
      }
    }

    // Archive Settings Changes - When archive page assignments change, collections need URI updates
    if (settingsChanges.archiveChanges?.length > 0) {
      // Immediately revalidate affected collections
      for (const change of settingsChanges.archiveChanges) {
        await revalidateCollection(change.collection, "archive-page-change")

        // Also revalidate the archive page itself if it exists
        if (change.newArchive) {
          try {
            const archivePage = await payload.findByID({
              collection: "pages",
              id: change.newArchive,
            })
            if (archivePage) {
              await revalidate({
                collection: "pages",
                doc: archivePage,
                action: "update",
                logger: payload.logger,
              })
            }
          } catch (error) {
            payload.logger.error(
              `Failed to revalidate archive page ${change.newArchive}:`,
              error
            )
          }
        }
      }

      // Queue dependent updates for URI regeneration
      dependentUpdates.push({
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

    // Process Dependent Updates - Execute queued jobs for detected changes
    if (dependentUpdates.length > 0) {
      await processDependentUpdates(dependentUpdates, payload)
      clearDependentUpdatesContext(context)
    }
  }

  // Revalidate the settings global itself
  try {
    revalidateTag(`global:${global.slug}`)
    payload.logger.info(`Revalidated global:${global.slug}`)
  } catch (error) {
    payload.logger.error(`Revalidation failed for global ${global.slug}:`, error)
  }

  return doc
}

/*************************************************************************/
/*  UTILITIES
/*************************************************************************/

async function updateURIIndex(doc: any, previousDoc: any, collection: any, payload: any) {
  try {
    const templateId = await getTemplateIdForCollection(collection.slug)
    const isPublished = doc._status === "published"
    const wasPublished = previousDoc?._status === "published"

    // Publishing or updating published content
    if (isPublished && doc.uri) {
      await updateURI(buildURIUpdate(doc, collection, templateId, previousDoc?.uri))
    }

    // Reverting to draft - keep URI but mark as draft
    else if (wasPublished && doc._status === "draft" && doc.uri) {
      await updateURI(
        buildURIUpdate(doc, collection, templateId, previousDoc?.uri, "draft")
      )
    }

    // Unpublishing to non-draft status - delete URI
    else if (wasPublished && !isPublished && doc._status !== "draft") {
      await deleteURI(collection.slug, doc.id)
    }

    // Draft with URI (new drafts)
    else if (doc._status === "draft" && doc.uri) {
      await updateURI(
        buildURIUpdate(doc, collection, templateId, previousDoc?.uri, "draft")
      )
    }

    // Handle URI generation failures
    if ((doc as any)._uriGenerationFailed) {
      payload.logger.warn(
        `URI generation failed for ${collection.slug}/${doc.id}. Queuing for retry.`
      )
      await queueRetryJob(payload, collection.slug, doc.id)
    }
  } catch (error) {
    payload.logger.error(
      `URI index update failed for ${collection.slug}/${doc.id}:`,
      error
    )
  }
}

function needsURIGeneration(data: any, originalDoc: any): boolean {
  const isPublishing =
    data._status === "published" && originalDoc?._status !== "published"
  const isSlugChange =
    data._status === "published" &&
    originalDoc?._status === "published" &&
    data.slug !== originalDoc?.slug

  return isPublishing || isSlugChange
}

function getDependentUpdatesContext(context: any): any[] {
  if (!context.dependentUpdates) {
    context.dependentUpdates = []
  }
  return context.dependentUpdates
}

function clearDependentUpdatesContext(context: any): void {
  delete context.dependentUpdates
}

function buildURIUpdate(
  doc: any,
  collection: any,
  templateId: string | null,
  previousURI?: string,
  status: "published" | "draft" = "published"
) {
  return {
    uri: doc.uri,
    collection: collection.slug,
    documentId: doc.id,
    status,
    templateId: templateId || undefined,
    previousURI: previousURI && previousURI !== doc.uri ? previousURI : undefined,
  }
}

async function queueRetryJob(payload: any, collectionSlug: string, docId: string) {
  try {
    const job = await payload.jobs.queue({
      task: "dependent-uri-updates",
      input: {
        operation: "uri-generation-retry",
        entityId: docId,
        additionalData: {
          collection: collectionSlug,
          retryAttempt: 1,
        },
      },
    })
    payload.logger.info(
      `Queued URI generation retry job ${job.id} for ${collectionSlug}/${docId}`
    )
  } catch (jobError) {
    payload.logger.error(`Failed to queue URI generation retry job:`, jobError)
  }
}

async function processDependentUpdates(
  dependentUpdates: any[],
  payload: any
): Promise<void> {
  for (const update of dependentUpdates) {
    try {
      const job = await payload.jobs.queue({
        task: "dependent-uri-updates",
        input: update,
      })

      console.log(
        `[Dependent Updates] Queued ${update.operation} job (ID: ${job.id}) for entity ${update.entityId}`
      )

      // Execute immediately
      payload.jobs.runByID({ id: job.id! })
      console.log(
        `[Dependent Updates] Dispatched ${update.operation} job for immediate execution`
      )
    } catch (error) {
      payload.logger.error(
        `Failed to queue dependent update job for ${update.operation}:`,
        error
      )
    }
  }
}
