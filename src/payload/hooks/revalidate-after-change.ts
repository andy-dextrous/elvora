import { revalidate } from "@/lib/cache/revalidation"
import { routingEngine } from "@/lib/routing"
import { updateURI, deleteURI } from "@/lib/routing/index-manager"
import { isFrontendCollection } from "@/payload/collections/frontend"
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  GlobalAfterChangeHook,
} from "payload"

/*************************************************************************/
/*  UNIVERSAL COLLECTION HOOKS
/*************************************************************************/

/**
 *    BEFORE COLLECTION CHANGE
 *
 *    Universal beforeChange hook for URI generation on publish events
 *    Generates URI when content is published or when published content's slug changes
 */

export const beforeCollectionChange: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req: { payload },
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

  if (draftToPublished || slugHasChanged) {
    const job = await payload.jobs.queue({
      task: "uri-sync",
      input: {},
    })

    await payload.jobs.runByID({ id: job.id! })

    try {
      const newURI = await routingEngine.generateURI({
        collection: collection.slug,
        slug: data.slug,
        data,
        originalDoc,
      })

      data.uri = newURI
    } catch (error) {
      payload.logger.error(
        `URI generation failed for ${collection.slug}/${data.slug}:`,
        error
      )
    }
  }

  return data
}

/**
 *    AFTER COLLECTION CHANGE
 *
 *    Universal afterChange hook that works for any collection by revalidating the document
 *    and any of its dependents as per the smart routing engine.
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
  if (isFrontendCollection(collection.slug) && doc.uri) {
    try {
      if (isPublished) {
        // Update index entry for published documents
        await updateURI({
          uri: doc.uri,
          collection: collection.slug,
          documentId: doc.id,
          status: "published",
          previousURI:
            previousDoc?.uri && previousDoc.uri !== doc.uri ? previousDoc.uri : undefined,
        })
      } else if (wasPreviouslyPublished && !isPublished) {
        // Document was unpublished - remove from index
        await deleteURI(collection.slug, doc.id)
      }

      // Handle draft versions separately if needed
      if (doc._status === "draft") {
        await updateURI({
          uri: doc.uri,
          collection: collection.slug,
          documentId: doc.id,
          status: "draft",
          previousURI:
            previousDoc?.uri && previousDoc.uri !== doc.uri ? previousDoc.uri : undefined,
        })
      }
    } catch (error) {
      payload.logger.error(
        `URI index update failed for ${collection.slug}/${doc.id}:`,
        error
      )
    }
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
 *    AFTER COLLECTION DELETE
 *
 *    Universal afterDelete hook that works for any collection by revalidating the document
 *    and any of its dependents as per the smart routing engine.
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
 *    AFTER GLOBAL CHANGE
 *
 *    Universal afterChange hook for globals by revalidating the document
 *    and any of its dependents as per the smart routing engine.
 */

export const afterGlobalChange: GlobalAfterChangeHook = async ({
  doc,
  previousDoc,
  req: { payload, context },
  global,
}) => {
  if (context.disableRevalidate || doc._status !== "published") {
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
