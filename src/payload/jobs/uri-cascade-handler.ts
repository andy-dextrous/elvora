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
/*************************************************************************/

export async function uriCascadeHandler({
  input,
  job,
  req,
}: {
  input: CascadeJobInput
  job: any
  req: any
}): Promise<{ output: CascadeJobOutput }> {
  const startTime = Date.now()
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
    // Get impact size for logging
    result.impactSize = await getCascadeImpactSize(operation, entityId)

    console.log(
      `[URI Cascade] Starting ${operation} for ${entityId} (estimated impact: ${result.impactSize})`
    )

    // Execute cascade operation using modular business logic
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

    // Map cascade result to job output format
    result.success = cascadeResult.success
    result.documentsUpdated = cascadeResult.documentsUpdated
    result.redirectsCreated = cascadeResult.redirectsCreated
    result.cacheEntriesCleared = cascadeResult.cacheEntriesCleared
    result.errors = cascadeResult.errors

    const duration = Date.now() - startTime
    console.log(
      `[URI Cascade] Completed ${operation} in ${duration}ms - ${result.documentsUpdated} documents updated`
    )
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error))
    console.error(`[URI Cascade] Failed ${operation}:`, error)
  }

  return { output: result }
}
