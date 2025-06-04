import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload"
import { revalidatePath, revalidateTag } from "next/cache"

/*******************************************************/
/* Revalidation Hook Factory
/*******************************************************/

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

export function createRevalidationHooks<T extends CollectionDoc = CollectionDoc>(
  options: RevalidationOptions
) {
  const {
    collectionSlug,
    pathPattern,
    handlePublishStatus = false,
    additionalTags = [],
  } = options

  const afterChange: CollectionAfterChangeHook<T> = ({
    doc,
    previousDoc,
    req: { payload, context },
  }) => {
    if (!context.disableRevalidate) {
      // Handle publish status logic if enabled
      if (handlePublishStatus) {
        if (doc._status === "published") {
          if (pathPattern && doc.slug) {
            const path = pathPattern.replace("{slug}", doc.slug)
            payload.logger.info(`Revalidating ${collectionSlug} at path: ${path}`)
            revalidatePath(path)
          }
        }

        // Revalidate old path if previously published
        if (previousDoc?._status === "published" && doc._status !== "published") {
          if (pathPattern && previousDoc.slug) {
            const oldPath = pathPattern.replace("{slug}", previousDoc.slug)
            payload.logger.info(`Revalidating old ${collectionSlug} at path: ${oldPath}`)
            revalidatePath(oldPath)
          }
        }
      } else {
        // For collections without publish status, always revalidate
        if (pathPattern && doc.slug) {
          const path = pathPattern.replace("{slug}", doc.slug)
          payload.logger.info(`Revalidating ${collectionSlug} at path: ${path}`)
          revalidatePath(path)
        }
      }

      // Always revalidate collection tag
      payload.logger.info(`Revalidating ${collectionSlug} collection cache`)
      revalidateTag(collectionSlug)

      // Revalidate additional tags
      additionalTags.forEach(tag => {
        payload.logger.info(`Revalidating additional tag: ${tag}`)
        revalidateTag(tag)
      })
    }

    return doc
  }

  const afterDelete: CollectionAfterDeleteHook<T> = ({
    doc,
    req: { payload, context },
  }) => {
    if (!context.disableRevalidate) {
      if (pathPattern && doc?.slug) {
        const path = pathPattern.replace("{slug}", doc.slug)
        payload.logger.info(`Revalidating deleted ${collectionSlug} at path: ${path}`)
        revalidatePath(path)
      }

      payload.logger.info(`Revalidating ${collectionSlug} collection cache after delete`)
      revalidateTag(collectionSlug)

      // Revalidate additional tags
      additionalTags.forEach(tag => {
        payload.logger.info(`Revalidating additional tag after delete: ${tag}`)
        revalidateTag(tag)
      })
    }

    return doc
  }

  return {
    afterChange,
    afterDelete,
  }
}
