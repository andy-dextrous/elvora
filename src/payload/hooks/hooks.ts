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
  collection, // This is provided by Payload!
}) => {
  if (context.disableRevalidate) {
    return doc
  }

  // Use universal revalidation system
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
  collection, // This is provided by Payload!
}) => {
  if (context.disableRevalidate) {
    return doc
  }

  // Use universal revalidation system
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
  global, // This is provided by Payload!
}) => {
  if (context.disableRevalidate) {
    return doc
  }

  // Use universal revalidation system for globals
  try {
    await revalidate({
      collection: `global:${global.slug}`, // Use proper global naming convention
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
