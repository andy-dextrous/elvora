import { revalidate } from "@/lib/cache/revalidation"
import { routingEngine } from "@/lib/routing"
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
  if (!data?.slug) {
    return data
  }

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
