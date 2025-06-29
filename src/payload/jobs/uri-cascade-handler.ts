import { getCascadeImpactSize } from "@/lib/routing/dependency-analyzer"
import {
  processArchivePageUpdate,
  processPageHierarchyUpdate,
  processHomepageChange,
  processSettingsChange,
  type CascadeResult,
} from "@/lib/routing/cascade-operations"

/*************************************************************************/
/*  CASCADE JOB TYPES
/*************************************************************************/

export interface CascadeJobInput {
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

export interface CascadeJobOutput {
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
/*  MAIN CASCADE HANDLER (ORCHESTRATION LAYER)

    Background job orchestrator for complex URI dependency updates. Handles cascade
    operations that maintain URI consistency across the entire site when foundational
    changes occur:

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

export async function uriCascadeHandler({
  input,
}: {
  input: CascadeJobInput
}): Promise<{ output: CascadeJobOutput }> {
  const { operation, entityId, additionalData } = input

  const result: CascadeJobOutput = {
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
    result.impactSize = await getCascadeImpactSize(operation, entityId)

    let cascadeResult: CascadeResult

    switch (operation) {
      case "archive-page-update":
        cascadeResult = await processArchivePageUpdate(entityId)
        break

      case "page-hierarchy-update":
        cascadeResult = await processPageHierarchyUpdate(entityId)
        break

      case "homepage-change":
        cascadeResult = await processHomepageChange(entityId, additionalData)
        break

      case "settings-change":
        cascadeResult = await processSettingsChange(entityId, additionalData)
        break

      default:
        throw new Error(`Unknown cascade operation: ${operation}`)
    }

    result.success = cascadeResult.success
    result.documentsUpdated = cascadeResult.documentsUpdated
    result.redirectsCreated = cascadeResult.redirectsCreated
    result.cacheEntriesCleared = cascadeResult.cacheEntriesCleared
    result.errors = cascadeResult.errors
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error))
  }

  return { output: result }
}
