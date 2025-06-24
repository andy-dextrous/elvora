import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload"
import { revalidate } from "@/lib/cache/revalidation"

/*************************************************************************/
/*  UNIVERSAL COLLECTION HOOKS
/*************************************************************************/

/**
 * Universal afterChange hook that works for any collection
 * Automatically detects the collection from Payload's context
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
