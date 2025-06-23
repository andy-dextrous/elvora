import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload"
import { revalidate } from "@/lib/cache/revalidation"

/*************************************************************************/
/*  COLLECTION HOOKS FACTORY
/*************************************************************************/

/**
 * Creates universal hooks for any collection
 * Handles smart revalidation using cache config and universal revalidation engine
 */
export function createHooks(collection: string) {
  const afterChange: CollectionAfterChangeHook = async ({
    doc,
    previousDoc,
    operation,
    req: { payload, context },
  }) => {
    if (context.disableRevalidate) {
      return doc
    }

    // Use universal revalidation system
    try {
      await revalidate({
        collection,
        doc,
        previousDoc,
        action: operation === "create" ? "create" : "update",
        logger: payload.logger,
      })
    } catch (error) {
      payload.logger.error(`Smart revalidation failed for ${collection}:`, error)
    }

    return doc
  }

  const afterDelete: CollectionAfterDeleteHook = async ({
    doc,
    req: { payload, context },
  }) => {
    if (context.disableRevalidate) {
      return doc
    }

    // Use universal revalidation system
    try {
      await revalidate({
        collection,
        doc,
        action: "delete",
        logger: payload.logger,
      })
    } catch (error) {
      payload.logger.error(`Smart revalidation failed for ${collection} delete:`, error)
    }

    return doc
  }

  return {
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  }
}

/*************************************************************************/
/*  GLOBAL HOOKS FACTORY
/*************************************************************************/

/**
 * Creates universal hooks for any global
 * Handles smart revalidation with proper tag naming and dependency cascading
 */
export function createGlobalHooks(globalSlug: string) {
  const afterChange: GlobalAfterChangeHook = async ({
    doc,
    previousDoc,
    req: { payload, context },
  }) => {
    if (context.disableRevalidate) {
      return doc
    }

    // Use universal revalidation system for globals
    try {
      await revalidate({
        collection: `global:${globalSlug}`, // Use proper global naming convention
        doc,
        previousDoc,
        action: "update",
        logger: payload.logger,
      })
    } catch (error) {
      payload.logger.error(`Smart revalidation failed for global ${globalSlug}:`, error)
    }

    return doc
  }

  return {
    afterChange: [afterChange],
  }
}
