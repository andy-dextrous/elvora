import { revalidateTag, revalidatePath } from "next/cache"
import {
  analyzeNavigationImpact,
  getCollectionsUsingArchive,
} from "./navigation-detection"
import type { ChangeDetection } from "./change-detection"

export interface InvalidationResult {
  tagsInvalidated: string[]
  pathsInvalidated: string[]
  reason: string
  startTime: string
  endTime?: string
  duration?: number
}

export interface BatchInvalidationSummary {
  totalOperations: number
  uniqueTagsInvalidated: number
  pathsInvalidated: number
  totalDuration: number
  operations: InvalidationResult[]
}

/*************************************************************************/
/*  URI NORMALIZATION UTILITY
/*************************************************************************/

/**
 * Normalizes URIs by removing trailing slashes while preserving the homepage
 * @param uri - The URI to normalize
 * @returns The normalized URI
 */
function normalizeURI(uri: string): string {
  // Homepage should always remain as "/"
  if (uri === "/") return "/"

  // Remove trailing slashes from other paths
  return uri.replace(/\/+$/, "")
}

/*************************************************************************/
/*  SURGICAL DOCUMENT INVALIDATION
/*************************************************************************/

export async function revalidateForDocumentChange(
  collection: string,
  doc: any,
  changes: ChangeDetection,
  context: "single-change" | "cascade-operation" = "single-change"
): Promise<InvalidationResult> {
  const startTime = new Date().toISOString()
  const result: InvalidationResult = {
    tagsInvalidated: [],
    pathsInvalidated: [],
    reason: `${context}: ${collection}/${doc.slug || doc.id}`,
    startTime,
  }

  // 1. Always invalidate the specific document
  const itemTag = `item:${collection}:${doc.slug || doc.id}`
  await revalidateTag(itemTag)
  result.tagsInvalidated.push(itemTag)

  // 2. Always invalidate the specific URI
  if (doc.uri) {
    const normalizedUri = normalizeURI(doc.uri)
    const uriTag = `uri:${normalizedUri}`
    await revalidateTag(uriTag)
    result.tagsInvalidated.push(uriTag)

    // Revalidate the path itself
    await revalidatePath(doc.uri)
    result.pathsInvalidated.push(doc.uri)
  }

  // 3. Handle old URI if changed
  if (changes.uriChanged && changes.oldUri) {
    const oldNormalizedUri = normalizeURI(changes.oldUri)
    const oldUriTag = `uri:${oldNormalizedUri}`
    await revalidateTag(oldUriTag)
    result.tagsInvalidated.push(oldUriTag)

    // Revalidate old path
    await revalidatePath(changes.oldUri)
    result.pathsInvalidated.push(changes.oldUri)
  }

  // 4. Smart navigation detection (THE KEY OPTIMIZATION)
  const navImpact = await analyzeNavigationImpact(collection, doc, changes)

  if (navImpact.affectsHeader) {
    await revalidateTag("global:header")
    result.tagsInvalidated.push("global:header")
  }

  if (navImpact.affectsFooter) {
    await revalidateTag("global:footer")
    result.tagsInvalidated.push("global:footer")
  }

  // 5. Archive page cascade invalidation
  if (collection === "pages") {
    const dependentCollections = await getCollectionsUsingArchive(doc.id)
    for (const dep of dependentCollections) {
      const collectionTag = `collection:${dep.collection}`
      await revalidateTag(collectionTag)
      result.tagsInvalidated.push(collectionTag)

      // Also invalidate URI index for affected collections
      const uriIndexTag = `uri-index:${dep.collection}`
      await revalidateTag(uriIndexTag)
      result.tagsInvalidated.push(uriIndexTag)
    }
  }

  // 6. Collection-level invalidation (only for status changes that affect listings)
  if (changes.statusChanged) {
    const collectionTag = `collection:${collection}`
    await revalidateTag(collectionTag)
    result.tagsInvalidated.push(collectionTag)

    // URI index invalidation for frontend collections
    const { isFrontendCollection } = await import("@/payload/collections/frontend")
    if (isFrontendCollection(collection)) {
      const uriIndexTag = `uri-index:${collection}`
      await revalidateTag(uriIndexTag)
      result.tagsInvalidated.push(uriIndexTag)
    }
  }

  // 7. Hierarchy-specific invalidation for pages
  if (collection === "pages" && changes.parentChanged) {
    // Invalidate parent page cache (affects child listing)
    if (changes.newParent) {
      const parentTag = `item:pages:${changes.newParent}`
      await revalidateTag(parentTag)
      result.tagsInvalidated.push(parentTag)
    }

    if (changes.oldParent) {
      const oldParentTag = `item:pages:${changes.oldParent}`
      await revalidateTag(oldParentTag)
      result.tagsInvalidated.push(oldParentTag)
    }
  }

  const endTime = new Date().toISOString()
  result.endTime = endTime
  result.duration = new Date(endTime).getTime() - new Date(startTime).getTime()

  return result
}

/*************************************************************************/
/*  BATCH INVALIDATION WITH DEDUPLICATION
/*************************************************************************/

export async function revalidateForBatchChanges(
  updates: Array<{ collection: string; doc: any; changes: ChangeDetection }>
): Promise<BatchInvalidationSummary> {
  const startTime = Date.now()
  const results: InvalidationResult[] = []
  const processedTags = new Set<string>()
  const processedPaths = new Set<string>()

  for (const update of updates) {
    const result = await revalidateForDocumentChange(
      update.collection,
      update.doc,
      update.changes,
      "cascade-operation"
    )

    // Deduplicate tags to avoid redundant invalidation
    result.tagsInvalidated = result.tagsInvalidated.filter(tag => {
      if (processedTags.has(tag)) return false
      processedTags.add(tag)
      return true
    })

    // Deduplicate paths
    result.pathsInvalidated = result.pathsInvalidated.filter(path => {
      if (processedPaths.has(path)) return false
      processedPaths.add(path)
      return true
    })

    results.push(result)
  }

  const totalDuration = Date.now() - startTime

  return {
    totalOperations: updates.length,
    uniqueTagsInvalidated: processedTags.size,
    pathsInvalidated: processedPaths.size,
    totalDuration,
    operations: results,
  }
}

/*************************************************************************/
/*  GLOBAL SETTINGS INVALIDATION
/*************************************************************************/

export async function revalidateForGlobalChange(
  globalSlug: string,
  doc: any,
  previousDoc: any,
  changes: ChangeDetection
): Promise<InvalidationResult> {
  const startTime = new Date().toISOString()
  const result: InvalidationResult = {
    tagsInvalidated: [],
    pathsInvalidated: [],
    reason: `global-change: ${globalSlug}`,
    startTime,
  }

  // Always invalidate the specific global
  const globalTag = `global:${globalSlug}`
  await revalidateTag(globalTag)
  result.tagsInvalidated.push(globalTag)

  // Settings changes have special handling
  if (globalSlug === "settings") {
    const { detectAllSettingsChanges } = await import("@/lib/routing/dependency-analyzer")
    const settingsChanges = detectAllSettingsChanges(previousDoc, doc)

    // Homepage changes affect root path
    if (settingsChanges.homepageChange.changed) {
      await revalidatePath("/")
      result.pathsInvalidated.push("/")

      const rootUriTag = `uri:${normalizeURI("/")}`
      await revalidateTag(rootUriTag)
      result.tagsInvalidated.push(rootUriTag)
    }

    // Archive changes affect multiple collections
    for (const archiveChange of settingsChanges.archiveChanges) {
      const collectionTag = `collection:${archiveChange.collection}`
      await revalidateTag(collectionTag)
      result.tagsInvalidated.push(collectionTag)

      const uriIndexTag = `uri-index:${archiveChange.collection}`
      await revalidateTag(uriIndexTag)
      result.tagsInvalidated.push(uriIndexTag)
    }
  }

  // Header/Footer globals affect layout
  if (globalSlug === "header" || globalSlug === "footer") {
    const layoutTag = `layout:${globalSlug}`
    await revalidateTag(layoutTag)
    result.tagsInvalidated.push(layoutTag)
  }

  const endTime = new Date().toISOString()
  result.endTime = endTime
  result.duration = new Date(endTime).getTime() - new Date(startTime).getTime()

  return result
}

/*************************************************************************/
/*  TARGETED COLLECTION INVALIDATION
/*************************************************************************/

export async function revalidateCollection(
  collection: string,
  reason: string = "collection-update"
): Promise<InvalidationResult> {
  const startTime = new Date().toISOString()
  const result: InvalidationResult = {
    tagsInvalidated: [],
    pathsInvalidated: [],
    reason: `${reason}: ${collection}`,
    startTime,
  }

  // Collection-wide invalidation
  const collectionTag = `collection:${collection}`
  await revalidateTag(collectionTag)
  result.tagsInvalidated.push(collectionTag)

  // URI index invalidation for frontend collections
  const { isFrontendCollection } = await import("@/payload/collections/frontend")
  if (isFrontendCollection(collection)) {
    const uriIndexTag = `uri-index:${collection}`
    await revalidateTag(uriIndexTag)
    result.tagsInvalidated.push(uriIndexTag)
  }

  const endTime = new Date().toISOString()
  result.endTime = endTime
  result.duration = new Date(endTime).getTime() - new Date(startTime).getTime()

  return result
}

/*************************************************************************/
/*  EMERGENCY INVALIDATION
/*************************************************************************/

export async function revalidateAll(
  reason: string = "emergency-clear"
): Promise<InvalidationResult> {
  const startTime = new Date().toISOString()
  const result: InvalidationResult = {
    tagsInvalidated: [],
    pathsInvalidated: [],
    reason: `emergency: ${reason}`,
    startTime,
  }

  // Nuclear option - invalidate everything
  await revalidateTag("all")
  result.tagsInvalidated.push("all")

  // Revalidate key paths
  const keyPaths = ["/", "/sitemap.xml"]
  for (const path of keyPaths) {
    await revalidatePath(path)
    result.pathsInvalidated.push(path)
  }

  const endTime = new Date().toISOString()
  result.endTime = endTime
  result.duration = new Date(endTime).getTime() - new Date(startTime).getTime()

  return result
}

/*************************************************************************/
/*  INVALIDATION UTILITIES
/*************************************************************************/

export function shouldSkipInvalidation(doc: any, changes: ChangeDetection): boolean {
  // Skip if document is draft and no status change
  if (doc._status !== "published" && !changes.statusChanged) {
    return true
  }

  // Skip if no significant changes detected
  if (
    !changes.uriChanged &&
    !changes.statusChanged &&
    !changes.slugChanged &&
    !changes.parentChanged &&
    !changes.titleChanged
  ) {
    return true
  }

  return false
}

export function getInvalidationPriority(
  changes: ChangeDetection
): "low" | "medium" | "high" {
  if (changes.uriChanged || changes.parentChanged) {
    return "high"
  }

  if (changes.statusChanged || changes.slugChanged || changes.titleChanged) {
    return "medium"
  }

  return "low"
}
