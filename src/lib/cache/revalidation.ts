import { cache } from "@/lib/cache"
import { revalidatePath, revalidateTag } from "next/cache"
import { getInvalidationTargets, getCacheConfig } from "./cache-config"
import { shouldIncludeInSitemap } from "@/lib/sitemaps/config"
import { isFrontendCollection } from "@/payload/collections/frontend"
import {
  revalidateForDocumentChange,
  revalidateForBatchChanges,
  revalidateForGlobalChange,
  revalidateAll as surgicalRevalidateAll,
  shouldSkipInvalidation,
  type InvalidationResult,
  type BatchInvalidationSummary,
} from "./surgical-invalidation"
import {
  detectChanges,
  type ChangeDetection,
  type CollectionChange,
  isContentOnlyChange,
} from "./change-detection"

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

/*************************************************************************/
/*  SMART REVALIDATION FUNCTION
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
      "single-change"
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

/*************************************************************************/
/*  REVALIDATION DECISION LOGIC - LEGACY COMPATIBILITY
/*************************************************************************/

/**
 * Legacy compatibility wrapper - now uses surgical invalidation logic
 * @deprecated Use shouldSkipInvalidation from surgical-invalidation instead
 */
function shouldSkipRevalidationLegacy(doc: any): boolean {
  if (!doc) {
    return false
  }

  // Only revalidate on publish events - same pattern as lockSlugAfterPublish
  const isPublishEvent = doc._status === "published"

  return !isPublishEvent
}

/*************************************************************************/
/*  LEGACY TAG GENERATION - DEPRECATED
/*************************************************************************/

/**
 * @deprecated Use surgical invalidation instead - this function has broad invalidation issues
 * Legacy tag generation that always invalidates header/footer (THE PROBLEM WE'RE FIXING)
 */
async function generateRevalidationTagsLegacy(
  collection: string,
  doc: any,
  previousDoc: any,
  changes: ChangeDetection
): Promise<string[]> {
  // This function is kept for legacy compatibility but should not be used
  // It represents the OLD broad invalidation pattern we're replacing
  console.warn(
    "generateRevalidationTagsLegacy is deprecated - use surgical invalidation instead"
  )

  const tags = new Set<string>()

  // Legacy behavior - always invalidate header/footer (THE PROBLEM)
  tags.add("global:header")
  tags.add("global:footer")

  return Array.from(tags)
}

/*************************************************************************/
/*  LEGACY FUNCTIONS - DEPRECATED
/*************************************************************************/

/**
 * @deprecated Use surgical invalidation instead
 * Legacy cascade invalidation with broad dependencies
 */
function hasURISupportLegacy(collection: string): boolean {
  return shouldIncludeInSitemap(collection)
}

/**
 * @deprecated Use surgical invalidation instead
 * Legacy cascade invalidation - replaced by surgical dependency analysis
 */
async function addCascadeInvalidationLegacy(
  collection: string,
  doc: any,
  previousDoc: any,
  changes: ChangeDetection,
  tags: Set<string>
): Promise<void> {
  console.warn(
    "addCascadeInvalidationLegacy is deprecated - use surgical invalidation instead"
  )
  // Legacy broad invalidation logic kept for reference only
}

/**
 * @deprecated Use surgical invalidation instead
 * Legacy path revalidation - now handled by surgical invalidation
 */
async function revalidatePathsLegacy(
  doc: any,
  previousDoc: any,
  changes: ChangeDetection,
  logger?: any
): Promise<void> {
  console.warn("revalidatePathsLegacy is deprecated - use surgical invalidation instead")
}

/**
 * @deprecated Use surgical invalidation instead
 * Legacy tag revalidation - now handled by surgical invalidation
 */
async function revalidateTagsLegacy(tags: string[], logger?: any): Promise<void> {
  console.warn("revalidateTagsLegacy is deprecated - use surgical invalidation instead")
}

/*************************************************************************/
/*  BATCH REVALIDATION FOR BULK OPERATIONS
/*************************************************************************/

export interface BatchRevalidateOptions {
  operations: RevalidateOptions[]
  logger?: any
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
    const result = await revalidateForBatchChanges(updates)

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

/*************************************************************************/
/*  UNIVERSAL CACHE CLEARING - SCALABLE & DYNAMIC
/*************************************************************************/

/**
 * Revalidate all cached data using surgical invalidation emergency mode
 */
export async function revalidateAll(): Promise<{
  success: boolean
  message: string
  result?: InvalidationResult
}> {
  try {
    const result = await surgicalRevalidateAll("manual-clear-all")

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

/*************************************************************************/
/*  GLOBAL SETTINGS REVALIDATION
/*************************************************************************/

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

    const result = await revalidateForGlobalChange(globalSlug, doc, previousDoc, changes)

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

/*************************************************************************/
/*  DYNAMIC TEMPLATE DEPENDENCY RESOLUTION
/*************************************************************************/

/**
 * Get collections that are actually using a specific template
 * This enables precise invalidation instead of blanket invalidation
 */
async function getCollectionsUsingTemplate(templateId: string): Promise<string[]> {
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

    Object.entries(routing).forEach(([key, value]) => {
      if (key.endsWith("SingleTemplate") && (value as any)?.id === templateId) {
        const collectionName = key.replace("SingleTemplate", "")
        assignments.push(collectionName)
      }
    })

    return assignments
  } catch (error) {
    console.warn(`Failed to lookup template assignments for ${templateId}:`, error)

    return []
  }
}
