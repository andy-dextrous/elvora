import { cache } from "@/lib/cache"
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
