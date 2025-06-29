import { revalidateTag, revalidatePath } from "next/cache"
import {
  analyzeNavigationImpact,
  getCollectionsUsingArchive,
} from "./navigation-detection"
import { routingEngine } from "@/lib/routing"
import { detectChanges, type ChangeDetection } from "./change-detection"

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

export interface BatchRevalidateOptions {
  operations: RevalidateOptions[]
  logger?: any
}

/*************************************************************************/
/*  PUBLIC API FUNCTIONS
/*************************************************************************/

/**
 * Smart revalidation using surgical invalidation system
 */
export async function revalidate(
  options: RevalidateOptions
): Promise<InvalidationResult> {
  const { collection, doc, previousDoc, action = "update", logger } = options

  try {
    const changes = detectChanges(doc, previousDoc, action)

    if (shouldSkipInvalidation(doc, changes)) {
      logger?.info(`Skipping revalidation for ${collection}/${doc.slug || doc.id}`)
      return {
        tagsInvalidated: [],
        pathsInvalidated: [],
        reason: `skipped: ${collection}/${doc.slug || doc.id}`,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 0,
      }
    }

    // Use surgical invalidation for precise cache clearing
    const result = await revalidateForDocumentChange(
      collection,
      doc,
      changes,
      "single-change",
      logger
    )

    logger?.info(`Cache revalidated: ${collection}/${doc.slug || doc.id}`, {
      tagsInvalidated: result.tagsInvalidated.length,
      pathsInvalidated: result.pathsInvalidated.length,
      duration: result.duration,
    })

    return result
  } catch (error) {
    logger?.error(`Smart revalidation failed for ${collection}:`, error)
    throw error
  }
}

/**
 * Batch revalidation using surgical invalidation with deduplication
 */
export async function batchRevalidate(
  options: BatchRevalidateOptions
): Promise<BatchInvalidationSummary> {
  const { operations, logger } = options

  try {
    logger?.info(`Starting batch revalidation for ${operations.length} operations`)

    // Convert operations to CollectionChange format
    const updates: Array<{ collection: string; doc: any; changes: ChangeDetection }> = []

    for (const operation of operations) {
      const { collection, doc, previousDoc, action = "update" } = operation
      const changes = detectChanges(doc, previousDoc, action)

      if (!shouldSkipInvalidation(doc, changes)) {
        updates.push({ collection, doc, changes })
      }
    }

    // Use surgical batch invalidation
    const result = await revalidateForBatchChanges(updates, logger)

    logger?.info(`Batch revalidation completed`, {
      totalOperations: result.totalOperations,
      uniqueTagsInvalidated: result.uniqueTagsInvalidated,
      pathsInvalidated: result.pathsInvalidated,
      totalDuration: result.totalDuration,
    })

    return result
  } catch (error) {
    logger?.error("Batch revalidation failed:", error)
    throw error
  }
}

/**
 * Revalidate global settings using surgical invalidation
 */
export async function revalidateGlobal(
  globalSlug: string,
  doc: any,
  previousDoc: any,
  logger?: any
): Promise<InvalidationResult> {
  try {
    const changes = detectChanges(doc, previousDoc, "update")

    const result = await revalidateForGlobalChange(
      globalSlug,
      doc,
      previousDoc,
      changes,
      logger
    )

    logger?.info(`Global revalidated: ${globalSlug}`, {
      tagsInvalidated: result.tagsInvalidated.length,
      pathsInvalidated: result.pathsInvalidated.length,
      duration: result.duration,
    })

    return result
  } catch (error) {
    logger?.error(`Global revalidation failed for ${globalSlug}:`, error)
    throw error
  }
}

/**
 * Revalidate all cached data using surgical invalidation emergency mode
 */
export async function revalidateAll(): Promise<{
  success: boolean
  message: string
  result?: InvalidationResult
}> {
  try {
    const result = await revalidateAllInternal("manual-clear-all")

    return {
      success: true,
      message: `All cache cleared successfully. Invalidated ${result.tagsInvalidated.length} tags in ${result.duration}ms`,
      result,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Revalidate specific collection
 */
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
  revalidateTag(collectionTag)
  result.tagsInvalidated.push(collectionTag)

  // URI index invalidation for frontend collections
  const { isFrontendCollection } = await import("@/payload/collections/frontend")
  if (isFrontendCollection(collection)) {
    const uriIndexTag = `uri-index:${collection}`
    revalidateTag(uriIndexTag)
    result.tagsInvalidated.push(uriIndexTag)
  }

  const endTime = new Date().toISOString()
  result.endTime = endTime
  result.duration = new Date(endTime).getTime() - new Date(startTime).getTime()

  return result
}

/*************************************************************************/
/*  CORE INVALIDATION LOGIC
/*************************************************************************/

async function revalidateForDocumentChange(
  collection: string,
  doc: any,
  changes: ChangeDetection,
  context: "single-change" | "cascade-operation" = "single-change",
  logger?: any
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
  revalidateTag(itemTag)
  result.tagsInvalidated.push(itemTag)

  // 2. Always invalidate the specific URI
  if (doc.uri) {
    const normalizedUri = routingEngine.normalizeURI(doc.uri)
    const uriTag = `uri:${normalizedUri}`
    revalidateTag(uriTag)
    result.tagsInvalidated.push(uriTag)

    // Revalidate the path itself
    revalidatePath(doc.uri)
    result.pathsInvalidated.push(doc.uri)
  }

  // 3. Handle old URI if changed
  if (changes.uriChanged && changes.oldUri) {
    const oldNormalizedUri = routingEngine.normalizeURI(changes.oldUri)
    const oldUriTag = `uri:${oldNormalizedUri}`
    revalidateTag(oldUriTag)
    result.tagsInvalidated.push(oldUriTag)

    // Revalidate old path
    revalidatePath(changes.oldUri)
    result.pathsInvalidated.push(changes.oldUri)
  }

  // 4. Smart navigation detection (THE KEY OPTIMIZATION)
  const navImpact = await analyzeNavigationImpact(collection, doc, changes)

  if (navImpact.affectsHeader) {
    revalidateTag("global:header")
    result.tagsInvalidated.push("global:header")
  }

  if (navImpact.affectsFooter) {
    revalidateTag("global:footer")
    result.tagsInvalidated.push("global:footer")
  }

  // 5. Archive page cascade invalidation
  if (collection === "pages") {
    const dependentCollections = await getCollectionsUsingArchive(doc.id)
    for (const dep of dependentCollections) {
      const collectionTag = `collection:${dep.collection}`
      revalidateTag(collectionTag)
      result.tagsInvalidated.push(collectionTag)

      // Also invalidate URI index for affected collections
      const uriIndexTag = `uri-index:${dep.collection}`
      revalidateTag(uriIndexTag)
      result.tagsInvalidated.push(uriIndexTag)
    }
  }

  // 6. Collection-level invalidation (only for status changes that affect listings)
  if (changes.statusChanged) {
    const collectionTag = `collection:${collection}`
    revalidateTag(collectionTag)
    result.tagsInvalidated.push(collectionTag)

    // URI index invalidation for frontend collections
    const { isFrontendCollection } = await import("@/payload/collections/frontend")
    if (isFrontendCollection(collection)) {
      const uriIndexTag = `uri-index:${collection}`
      revalidateTag(uriIndexTag)
      result.tagsInvalidated.push(uriIndexTag)
    }
  }

  // 7. Hierarchy-specific invalidation for pages
  if (collection === "pages" && changes.parentChanged) {
    // Invalidate parent page cache (affects child listing)
    if (changes.newParent) {
      const parentTag = `item:pages:${changes.newParent}`
      revalidateTag(parentTag)
      result.tagsInvalidated.push(parentTag)
    }

    if (changes.oldParent) {
      const oldParentTag = `item:pages:${changes.oldParent}`
      revalidateTag(oldParentTag)
      result.tagsInvalidated.push(oldParentTag)
    }
  }

  const endTime = new Date().toISOString()
  result.endTime = endTime
  result.duration = new Date(endTime).getTime() - new Date(startTime).getTime()

  // Summary logging
  if (logger && result.tagsInvalidated.length > 0) {
    logger.info(`🔄 Cache invalidated for ${collection}/${doc.slug || doc.id}:`)
    logger.info(`   Tags: [${result.tagsInvalidated.join(", ")}]`)
    if (result.pathsInvalidated.length > 0) {
      logger.info(`   Paths: [${result.pathsInvalidated.join(", ")}]`)
    }
    logger.info(`   Duration: ${result.duration}ms`)
  }

  return result
}

async function revalidateForBatchChanges(
  updates: Array<{ collection: string; doc: any; changes: ChangeDetection }>,
  logger?: any
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
      "cascade-operation",
      logger
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

async function revalidateForGlobalChange(
  globalSlug: string,
  doc: any,
  previousDoc: any,
  changes: ChangeDetection,
  logger?: any
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
  revalidateTag(globalTag)
  result.tagsInvalidated.push(globalTag)

  // Settings changes have special handling
  if (globalSlug === "settings") {
    const { detectAllSettingsChanges } = await import("@/lib/routing/dependency-analyzer")
    const settingsChanges = detectAllSettingsChanges(previousDoc, doc)

    // Homepage changes affect root path
    if (settingsChanges.homepageChange.changed) {
      revalidatePath("/")
      result.pathsInvalidated.push("/")

      const rootUriTag = `uri:${routingEngine.normalizeURI("/")}`
      revalidateTag(rootUriTag)
      result.tagsInvalidated.push(rootUriTag)
    }

    // Archive changes affect multiple collections
    for (const archiveChange of settingsChanges.archiveChanges) {
      const collectionTag = `collection:${archiveChange.collection}`
      revalidateTag(collectionTag)
      result.tagsInvalidated.push(collectionTag)

      const uriIndexTag = `uri-index:${archiveChange.collection}`
      revalidateTag(uriIndexTag)
      result.tagsInvalidated.push(uriIndexTag)
    }
  }

  // Header/Footer globals affect layout
  if (globalSlug === "header" || globalSlug === "footer") {
    const layoutTag = `layout:${globalSlug}`
    revalidateTag(layoutTag)
    result.tagsInvalidated.push(layoutTag)
  }

  const endTime = new Date().toISOString()
  result.endTime = endTime
  result.duration = new Date(endTime).getTime() - new Date(startTime).getTime()

  // Summary logging
  if (logger && result.tagsInvalidated.length > 0) {
    logger.info(`🔄 Global cache invalidated for ${globalSlug}:`)
    logger.info(`   Tags: [${result.tagsInvalidated.join(", ")}]`)
    if (result.pathsInvalidated.length > 0) {
      logger.info(`   Paths: [${result.pathsInvalidated.join(", ")}]`)
    }
    logger.info(`   Duration: ${result.duration}ms`)
  }

  return result
}

async function revalidateAllInternal(
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
  revalidateTag("all")
  result.tagsInvalidated.push("all")

  // Revalidate key paths
  const keyPaths = ["/", "/sitemap.xml"]
  for (const path of keyPaths) {
    revalidatePath(path)
    result.pathsInvalidated.push(path)
  }

  const endTime = new Date().toISOString()
  result.endTime = endTime
  result.duration = new Date(endTime).getTime() - new Date(startTime).getTime()

  return result
}

/*************************************************************************/
/*  UTILITY FUNCTIONS
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
