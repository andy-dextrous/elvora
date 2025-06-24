import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  GlobalAfterChangeHook,
} from "payload"
import { revalidate } from "@/lib/cache/revalidation"
import { routingEngine } from "@/lib/routing"

/*************************************************************************/
/*  URI GENERATION ON PUBLISH
/*************************************************************************/

/**
 * Universal beforeChange hook for URI generation on publish events
 * Generates URI when content is published or when published content's slug changes
 */
export const beforeCollectionChangeURIGeneration: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req: { payload },
  collection,
}) => {
  // Only generate URI for collections that have slug fields
  if (!data?.slug) {
    return data
  }

  // Check if this is a publish event or published content with slug change
  const isPublishing =
    data._status === "published" && originalDoc?._status !== "published"
  const isPublishedSlugChange =
    data._status === "published" &&
    originalDoc?._status === "published" &&
    data.slug !== originalDoc?.slug

  if (isPublishing || isPublishedSlugChange) {
    try {
      const newURI = await routingEngine.generate({
        collection: collection.slug,
        slug: data.slug,
        data,
        originalDoc,
      })

      // Set the URI in the data being saved
      data.uri = newURI

      payload.logger.info(`Generated URI for ${collection.slug}/${data.slug}: ${newURI}`)
    } catch (error) {
      payload.logger.error(
        `URI generation failed for ${collection.slug}/${data.slug}:`,
        error
      )
      // Don't block the save operation, just log the error
    }
  }

  return data
}

/*************************************************************************/
/*  UNIVERSAL COLLECTION HOOKS
/*************************************************************************/

/**
 * Universal afterChange hook that works for any collection
 * Automatically detects the collection from Payload's context
 * Now handles revalidation AFTER URI has been properly set
 */
export const afterCollectionChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req: { payload, context },
  collection,
}) => {
  if (context.disableRevalidate || doc._status !== "published") {
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
 * Universal afterDelete hook that works for any collection
 * Automatically detects the collection from Payload's context
 */
export const afterCollectionDelete: CollectionAfterDeleteHook = async ({
  doc,
  req: { payload, context },
  collection,
}) => {
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
 * Universal afterChange hook for globals
 * Automatically detects the global from Payload's context
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
    payload.logger.error(`Smart revalidation failed for global ${global.slug}:`, error)
  }

  return doc
}
