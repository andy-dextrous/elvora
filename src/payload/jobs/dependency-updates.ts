import { getDependentUpdatesImpactSize } from "@/lib/routing/dependency-analyzer"
import {
  processArchivePageUpdate,
  processPageHierarchyUpdate,
  processHomepageChange,
  processSettingsChange,
  type DependentUpdatesResult,
} from "@/lib/routing/dependency-updates"

/*************************************************************************/
/*  DEPENDENT UPDATES JOB TYPES
/*************************************************************************/

export interface DependentUpdatesJobInput {
  operation:
    | "archive-page-update"
    | "page-hierarchy-update"
    | "homepage-change"
    | "settings-change"
  entityId: string
  additionalData?: {
    oldSlug?: string
    newSlug?: string
    oldParent?: string
    newParent?: string
    affectedCollections?: string[]
    oldHomepage?: string
  }
}

export interface DependentUpdatesJobOutput {
  success: boolean
  documentsUpdated: number
  redirectsCreated: number
  cacheEntriesCleared: number
  errors: string[]
  processedAt: string
  operation: string
  impactSize: number
}

/*************************************************************************/
/*  MAIN DEPENDENT UPDATES HANDLER (ORCHESTRATION LAYER)

    Background job orchestrator for complex URI dependency updates. Handles dependent
    update operations that maintain URI consistency across the entire site when
    foundational changes occur:

    - Archive Page Updates: When archive page slugs change (e.g., /blog → /articles),
      updates all dependent collection items and creates redirects
    - Page Hierarchy Updates: When parent pages change, updates all descendant page URIs
      and maintains proper redirect chains
    - Homepage Changes: When homepage designation changes in settings, handles both
      old homepage (/ → /home) and new homepage (/welcome → /) transitions
    - Settings Changes: When global archive page assignments change, regenerates URIs
      for all affected collection items

    Executed immediately after queueing to maintain real-time URI synchronization
    while keeping admin interface responsive. Includes comprehensive error handling,
    performance tracking, and surgical cache invalidation.

/*************************************************************************/

export async function uriDependentUpdatesHandler({
  input,
}: {
  input: DependentUpdatesJobInput
}): Promise<{ output: DependentUpdatesJobOutput }> {
  const { operation, entityId, additionalData } = input

  const result: DependentUpdatesJobOutput = {
    success: false,
    documentsUpdated: 0,
    redirectsCreated: 0,
    cacheEntriesCleared: 0,
    errors: [],
    processedAt: new Date().toISOString(),
    operation,
    impactSize: 0,
  }

  try {
    result.impactSize = await getDependentUpdatesImpactSize(operation, entityId)

    let dependentUpdatesResult: DependentUpdatesResult

    switch (operation) {
      case "archive-page-update":
        dependentUpdatesResult = await processArchivePageUpdate(entityId)
        break

      case "page-hierarchy-update":
        dependentUpdatesResult = await processPageHierarchyUpdate(entityId)
        break

      case "homepage-change":
        dependentUpdatesResult = await processHomepageChange(entityId, additionalData)
        break

      case "settings-change":
        dependentUpdatesResult = await processSettingsChange(entityId, additionalData)
        break

      default:
        throw new Error(`Unknown dependent updates operation: ${operation}`)
    }

    result.success = dependentUpdatesResult.success
    result.documentsUpdated = dependentUpdatesResult.documentsUpdated
    result.redirectsCreated = dependentUpdatesResult.redirectsCreated
    result.cacheEntriesCleared = dependentUpdatesResult.cacheEntriesCleared
    result.errors = dependentUpdatesResult.errors
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error))
  }

  return { output: result }
}
