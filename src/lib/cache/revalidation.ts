import { cache } from "@/lib/cache"
import { revalidatePath, revalidateTag } from "next/cache"
import { createCacheTags } from "./cache"
import { getInvalidationTargets } from "./cache-config"

/*************************************************************************/
/*  UNIVERSAL REVALIDATION ENGINE - TYPES & INTERFACES
/*************************************************************************/

export interface RevalidateOptions {
  collection: string
  doc: any
  previousDoc?: any
  action: "create" | "update" | "delete"
  logger?: any
}

export interface ChangeDetection {
  uriChanged: boolean
  statusChanged: boolean
  contentChanged: boolean
  oldUri?: string
  newUri?: string
}

/*************************************************************************/
/*  SMART REVALIDATION FUNCTION
/*************************************************************************/

/**
 * Smart revalidation that uses cache config dependencies and enhanced tags
 */
export async function revalidate(options: RevalidateOptions): Promise<void> {
  const { collection, doc, previousDoc, logger } = options

  try {
    const changes = detectChanges(doc, previousDoc)

    if (shouldSkipRevalidation(doc, changes, previousDoc)) {
      return
    }

    const tagsToInvalidate = await generateRevalidationTags(
      collection,
      doc,
      previousDoc,
      changes
    )

    await revalidatePaths(doc, previousDoc, changes, logger)
    await revalidateTags(tagsToInvalidate, logger)

    logger?.info(`Cache revalidated: ${collection}/${doc.slug || doc.id}`)
  } catch (error) {
    logger?.error(`Smart revalidation failed for ${collection}:`, error)
    throw error
  }
}

/*************************************************************************/
/*  REVALIDATION DECISION LOGIC
/*************************************************************************/

/**
 * Determines if revalidation should be skipped for performance
 * Only revalidate when changes affect public-facing content (publish events)
 */
function shouldSkipRevalidation(
  doc: any,
  changes: ChangeDetection,
  previousDoc?: any
): boolean {
  if (!doc) {
    return false
  }

  // Only revalidate on publish events - same pattern as lockSlugAfterPublish
  const isPublishEvent = doc._status === "published"

  return !isPublishEvent
}

/*************************************************************************/
/*  CHANGE DETECTION LOGIC
/*************************************************************************/

function detectChanges(doc: any, previousDoc?: any): ChangeDetection {
  const changes: ChangeDetection = {
    uriChanged: false,
    statusChanged: false,
    contentChanged: false,
  }

  if (!previousDoc) {
    changes.contentChanged = true
    changes.newUri = doc.uri || (doc.slug ? `/${doc.slug}` : undefined)
    return changes
  }

  const oldUri =
    previousDoc.uri || (previousDoc.slug ? `/${previousDoc.slug}` : undefined)
  const newUri = doc.uri || (doc.slug ? `/${doc.slug}` : undefined)

  if (oldUri !== newUri) {
    changes.uriChanged = true
    changes.oldUri = oldUri
    changes.newUri = newUri
  }

  if (doc._status !== previousDoc._status) {
    changes.statusChanged = true
  }

  if (JSON.stringify(doc) !== JSON.stringify(previousDoc)) {
    changes.contentChanged = true
  }

  return changes
}

/*************************************************************************/
/*  TAG GENERATION FOR REVALIDATION
/*************************************************************************/

async function generateRevalidationTags(
  collection: string,
  doc: any,
  previousDoc: any,
  changes: ChangeDetection
): Promise<string[]> {
  const tags = new Set<string>()

  if (collection.startsWith("global:")) {
    const globalSlug = collection.replace("global:", "")
    const globalTags = createCacheTags({ globalSlug })
    globalTags.forEach(tag => tags.add(tag))
  } else {
    if (doc.slug) {
      const itemTags = createCacheTags({ collection, slug: doc.slug })
      itemTags.forEach(tag => tags.add(tag))
    }

    if (changes.uriChanged && changes.oldUri && previousDoc?.slug) {
      const oldItemTags = createCacheTags({ collection, slug: previousDoc.slug })
      oldItemTags.forEach(tag => tags.add(tag))
    }

    const collectionTags = createCacheTags({ collection })
    collectionTags.forEach(tag => tags.add(tag))
  }

  await addCascadeInvalidation(collection, doc, previousDoc, changes, tags)

  return Array.from(tags)
}

/*************************************************************************/
/*  CASCADE INVALIDATION FOR HIERARCHICAL CONTENT
/*************************************************************************/

/**
 * Check if a collection supports URIs (has slug field and appears in sitemaps)
 */
function hasURISupport(collection: string): boolean {
  return ["pages", "posts", "services"].includes(collection)
}

async function addCascadeInvalidation(
  collection: string,
  doc: any,
  previousDoc: any,
  changes: ChangeDetection,
  tags: Set<string>
): Promise<void> {
  // Special handling for templates - use dynamic lookup for precise invalidation
  if (collection === "templates") {
    try {
      const affectedCollections = await getCollectionsUsingTemplate(doc.id)
      if (affectedCollections.length > 0) {
        // Template-specific invalidation
        affectedCollections.forEach(collectionName => {
          tags.add(`collection:${collectionName}`)
        })
      }
    } catch (error) {
      console.warn(`Template invalidation fallback for ${doc.id}:`, error)
      const collectionKey = `collection:${collection}`
      const dependentTargets = getInvalidationTargets(collectionKey)
      dependentTargets.forEach(target => tags.add(target))
    }
  } else {
    const collectionKey = collection.startsWith("global:")
      ? collection
      : `collection:${collection}`

    const dependentTargets = getInvalidationTargets(collectionKey)
    dependentTargets.forEach(target => tags.add(target))
  }

  if (hasURISupport(collection)) {
    tags.add("sitemap:all")
  }

  if (collection === "global:header") {
    tags.add("layout:header")
  }
  if (collection === "global:footer") {
    tags.add("layout:footer")
  }

  if (collection === "pages" && changes.uriChanged) {
    tags.add(`parent-page:${doc.slug}`)
    if (previousDoc?.slug) {
      tags.add(`parent-page:${previousDoc.slug}`)
    }
  }
}

/*************************************************************************/
/*  PATH REVALIDATION
/*************************************************************************/

async function revalidatePaths(
  doc: any,
  previousDoc: any,
  changes: ChangeDetection,
  logger?: any
): Promise<void> {
  if (changes.newUri && doc._status === "published") {
    logger?.info(`Revalidating path: ${changes.newUri}`)
    revalidatePath(changes.newUri)
  }

  if (changes.uriChanged && changes.oldUri && previousDoc?._status === "published") {
    logger?.info(`Revalidating old path: ${changes.oldUri}`)
    revalidatePath(changes.oldUri)
  }
}

/*************************************************************************/
/*  TAG REVALIDATION
/*************************************************************************/

async function revalidateTags(tags: string[], logger?: any): Promise<void> {
  for (const tag of tags) {
    logger?.info(`Revalidating tag: ${tag}`)
    revalidateTag(tag)
  }
}

/*************************************************************************/
/*  BATCH REVALIDATION FOR BULK OPERATIONS
/*************************************************************************/

export interface BatchRevalidateOptions {
  operations: RevalidateOptions[]
  logger?: any
}

/**
 * Batch revalidation to handle multiple changes efficiently.
 */
export async function batchRevalidate(options: BatchRevalidateOptions): Promise<void> {
  const { operations, logger } = options

  logger?.info(`Starting batch revalidation for ${operations.length} operations`)

  const allTags = new Set<string>()
  const pathsToRevalidate = new Set<string>()

  for (const operation of operations) {
    const { collection, doc, previousDoc } = operation
    const changes = detectChanges(doc, previousDoc)

    const tags = await generateRevalidationTags(collection, doc, previousDoc, changes)
    tags.forEach(tag => allTags.add(tag))

    if (changes.newUri && doc._status === "published") {
      pathsToRevalidate.add(changes.newUri)
    }
    if (changes.uriChanged && changes.oldUri && previousDoc?._status === "published") {
      pathsToRevalidate.add(changes.oldUri)
    }
  }

  for (const path of pathsToRevalidate) {
    logger?.info(`Batch revalidating path: ${path}`)
    revalidatePath(path)
  }

  for (const tag of allTags) {
    logger?.info(`Batch revalidating tag: ${tag}`)
    revalidateTag(tag)
  }

  logger?.info(`Batch revalidation completed`)
}

/*************************************************************************/
/*  UNIVERSAL CACHE CLEARING - SCALABLE & DYNAMIC
/*************************************************************************/

/**
 * Revalidate all cached data with a single universal tag
 */
export async function revalidateAll(): Promise<{
  success: boolean
  message: string
}> {
  try {
    revalidateTag("all")
    revalidatePath("/", "layout")

    return {
      success: true,
      message: "All cache cleared successfully using universal 'all' tag",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/*************************************************************************/
/*  DYNAMIC TEMPLATE DEPENDENCY RESOLUTION
/*************************************************************************/

/**
 * Get collections that are actually using a specific template
 * This enables precise invalidation instead of blanket invalidation
 */
async function getCollectionsUsingTemplate(
  templateId: string,
  fallbackToAll: boolean = true
): Promise<string[]> {
  try {
    const settings = await cache.getGlobal("settings", 1)
    const routing = settings?.routing

    if (!routing) {
      throw new Error("No routing settings found")
    }

    const assignments: string[] = []

    // Check pagesDefaultTemplate
    if (routing.pagesDefaultTemplate?.id === templateId) {
      assignments.push("pages")
    }

    // Check all *SingleTemplate fields
    Object.entries(routing).forEach(([key, value]) => {
      if (key.endsWith("SingleTemplate") && (value as any)?.id === templateId) {
        // Extract collection name from field name (e.g., "postsSingleTemplate" → "posts")
        const collectionName = key.replace("SingleTemplate", "")
        assignments.push(collectionName)
      }
    })

    return assignments
  } catch (error) {
    console.warn(`Failed to lookup template assignments for ${templateId}:`, error)

    if (fallbackToAll) {
      // Fallback to all collections that could use templates
      return ["pages", "posts", "services", "team", "testimonials"]
    }

    return []
  }
}
