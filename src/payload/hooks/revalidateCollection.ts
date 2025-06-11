import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload"
import { revalidatePath, revalidateTag } from "next/cache"

/*************************************************************************/
/*  TYPE DECLARATIONS
/*************************************************************************/

interface RevalidationOptions {
  /** Collection slug for tagging */
  collectionSlug: string
  /** Optional path pattern for revalidatePath - use {slug} as placeholder */
  pathPattern?: string
  /** Whether to handle publish status logic (drafts) */
  handlePublishStatus?: boolean
  /** Additional tags to revalidate */
  additionalTags?: string[]
}

type CollectionDoc = {
  id: string
  slug?: string
  _status?: "published" | "draft"
}

/*************************************************************************/
/*  REVALIDATION HOOK FACTORY
/*************************************************************************/

export function createRevalidationHooks<T extends CollectionDoc = CollectionDoc>(
  options: RevalidationOptions
) {
  const {
    collectionSlug,
    pathPattern,
    handlePublishStatus = false,
    additionalTags = [],
  } = options

  /*************************************************************************/
  /*  AFTER CHANGE HOOK
  /*************************************************************************/

  const afterChange: CollectionAfterChangeHook<T> = ({
    doc,
    previousDoc,
    req: { payload, context },
  }) => {
    if (context.disableRevalidate) {
      return doc
    }

    setTimeout(() => {
      try {
        if (handlePublishStatus) {
          handlePublishStatusRevalidation(
            doc,
            previousDoc,
            pathPattern,
            collectionSlug,
            payload
          )
        } else {
          handleStandardRevalidation(doc, pathPattern, collectionSlug, payload)
        }

        revalidateCollectionTags(collectionSlug, additionalTags, payload)
      } catch (error) {
        payload.logger.error(`Failed to revalidate ${collectionSlug}:`, error)
      }
    }, 0)

    return doc
  }

  /*************************************************************************/
  /*  AFTER DELETE HOOK
  /*************************************************************************/

  const afterDelete: CollectionAfterDeleteHook<T> = ({
    doc,
    req: { payload, context },
  }) => {
    if (!context.disableRevalidate) {
      setTimeout(() => {
        try {
          if (pathPattern && doc?.slug) {
            const path = pathPattern.replace("{slug}", doc.slug)
            payload.logger.info(`Revalidating deleted ${collectionSlug} at path: ${path}`)
            revalidatePath(path)
          }

          revalidateCollectionTags(collectionSlug, additionalTags, payload)
        } catch (error) {
          payload.logger.error(
            `Failed to revalidate ${collectionSlug} after delete:`,
            error
          )
        }
      }, 0)
    }

    return doc
  }

  return {
    afterChange,
    afterDelete,
  }
}

/*************************************************************************/
/*  UTILITY FUNCTIONS
/*************************************************************************/

function handlePublishStatusRevalidation<T extends CollectionDoc>(
  doc: T,
  previousDoc: T | undefined,
  pathPattern: string | undefined,
  collectionSlug: string,
  payload: any
) {
  if (doc._status === "published") {
    if (pathPattern && doc.slug) {
      const path = pathPattern.replace("{slug}", doc.slug)
      payload.logger.info(`Revalidating ${collectionSlug} at path: ${path}`)
      revalidatePath(path)
    }
  }

  if (previousDoc?._status === "published" && doc._status !== "published") {
    if (pathPattern && previousDoc.slug) {
      const oldPath = pathPattern.replace("{slug}", previousDoc.slug)
      payload.logger.info(`Revalidating old ${collectionSlug} at path: ${oldPath}`)
      revalidatePath(oldPath)
    }
  }
}

function handleStandardRevalidation<T extends CollectionDoc>(
  doc: T,
  pathPattern: string | undefined,
  collectionSlug: string,
  payload: any
) {
  if (pathPattern && doc.slug) {
    const path = pathPattern.replace("{slug}", doc.slug)
    payload.logger.info(`Revalidating ${collectionSlug} at path: ${path}`)
    revalidatePath(path)
  }
}

function revalidateCollectionTags(
  collectionSlug: string,
  additionalTags: string[],
  payload: any
) {
  payload.logger.info(`Revalidating ${collectionSlug} collection cache`)
  revalidateTag(collectionSlug)

  additionalTags.forEach(tag => {
    payload.logger.info(`Revalidating additional tag: ${tag}`)
    revalidateTag(tag)
  })
}
