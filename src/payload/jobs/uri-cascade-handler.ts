import {
  getCollectionsUsingArchive,
  getCollectionItemsForArchive,
  findDescendantPages,
  getCascadeImpactSize,
} from "@/lib/routing/dependency-analyzer"
import { updateURI } from "@/lib/routing/index-manager"
import { routingEngine } from "@/lib/routing/uri-engine"
import { revalidateForBatchChanges } from "@/lib/cache/surgical-invalidation"
import { detectChanges } from "@/lib/cache/change-detection"
import { cache } from "@/lib/cache"
import { getSettings } from "@/lib/data/globals"

/*************************************************************************/
/*  CASCADE OPERATION TYPES
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
/*  MAIN CASCADE HANDLER
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

    switch (operation) {
      case "archive-page-update":
        await processArchivePageUpdate(entityId, result)
        break

      case "page-hierarchy-update":
        await processPageHierarchyUpdate(entityId, result)
        break

      case "homepage-change":
        await processHomepageChange(entityId, additionalData, result)
        break

      case "settings-change":
        await processSettingsChange(entityId, additionalData, result)
        break

      default:
        throw new Error(`Unknown cascade operation: ${operation}`)
    }

    result.success = true
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

/*************************************************************************/
/*  ARCHIVE PAGE UPDATE PROCESSING
/*************************************************************************/

async function processArchivePageUpdate(
  pageId: string,
  result: CascadeJobOutput
): Promise<void> {
  // Get all collections that use this page as their archive
  const dependencies = await getCollectionsUsingArchive(pageId)

  if (dependencies.length === 0) {
    console.log(`[URI Cascade] No collections use page ${pageId} as archive`)
    return
  }

  // Get the updated page to get the new slug
  const updatedPage = await cache.getByID("pages", pageId)
  if (!updatedPage) {
    throw new Error(`Could not find updated page ${pageId}`)
  }

  const batchUpdates = []

  // Process each collection that uses this archive page
  for (const dependency of dependencies) {
    console.log(
      `[URI Cascade] Processing ${dependency.collection} items for archive ${dependency.archivePageSlug}`
    )

    const items = await getCollectionItemsForArchive(dependency.collection)

    for (const item of items) {
      const oldURI = item.uri
      const newURI = await routingEngine.generateURI({
        collection: dependency.collection,
        slug: item.slug,
        data: item,
      })

      if (oldURI !== newURI) {
        // Update URI in index
        await updateURI({
          uri: newURI,
          collection: dependency.collection,
          documentId: item.id,
          status: item._status || "published",
          previousURI: oldURI,
        })

        // Track for batch cache invalidation
        const changes = detectChanges({ ...item, uri: newURI }, { ...item, uri: oldURI })

        batchUpdates.push({
          collection: dependency.collection,
          doc: { ...item, uri: newURI },
          changes,
        })

        result.documentsUpdated++
        result.redirectsCreated++ // URI update creates automatic redirect
      }
    }
  }

  // Batch process cache invalidation
  if (batchUpdates.length > 0) {
    const invalidationResults = await revalidateForBatchChanges(batchUpdates)
    result.cacheEntriesCleared = invalidationResults.operations.reduce(
      (total: number, res: any) => total + res.tagsInvalidated.length,
      0
    )
  }
}

/*************************************************************************/
/*  PAGE HIERARCHY UPDATE PROCESSING
/*************************************************************************/

async function processPageHierarchyUpdate(
  pageId: string,
  result: CascadeJobOutput
): Promise<void> {
  // Find all descendant pages
  const descendants = await findDescendantPages(pageId)

  if (descendants.length === 0) {
    console.log(`[URI Cascade] No descendants found for page ${pageId}`)
    return
  }

  console.log(`[URI Cascade] Processing ${descendants.length} descendant pages`)

  const batchUpdates = []

  // Process each descendant page
  for (const descendant of descendants) {
    const oldURI = descendant.uri
    const newURI = await routingEngine.generateURI({
      collection: "pages",
      slug: descendant.slug,
      data: descendant,
    })

    if (oldURI !== newURI) {
      // Update URI in index
      await updateURI({
        uri: newURI,
        collection: "pages",
        documentId: descendant.id,
        status: descendant._status || "published",
        previousURI: oldURI,
      })

      // Track for batch cache invalidation
      const changes = detectChanges(
        { ...descendant, uri: newURI },
        { ...descendant, uri: oldURI }
      )

      batchUpdates.push({
        collection: "pages",
        doc: { ...descendant, uri: newURI },
        changes,
      })

      result.documentsUpdated++
      result.redirectsCreated++
    }
  }

  // Batch process cache invalidation
  if (batchUpdates.length > 0) {
    const invalidationResults = await revalidateForBatchChanges(batchUpdates)
    result.cacheEntriesCleared = invalidationResults.operations.reduce(
      (total: number, res: any) => total + res.tagsInvalidated.length,
      0
    )
  }
}

/*************************************************************************/
/*  HOMEPAGE CHANGE PROCESSING
/*************************************************************************/

async function processHomepageChange(
  newHomepageId: string,
  additionalData: any,
  result: CascadeJobOutput
): Promise<void> {
  const batchUpdates = []

  // Handle old homepage (if exists)
  if (additionalData?.oldHomepage) {
    const oldHomepage = await cache.getByID("pages", additionalData.oldHomepage)
    if (oldHomepage) {
      const oldURI = "/"
      const newURI = await routingEngine.generateURI({
        collection: "pages",
        slug: oldHomepage.slug,
        data: oldHomepage,
      })

      // Update old homepage URI (from "/" to "/page-slug")
      await updateURI({
        uri: newURI,
        collection: "pages",
        documentId: oldHomepage.id,
        status: oldHomepage._status || "published",
        previousURI: oldURI,
      })

      const changes = detectChanges(
        { ...oldHomepage, uri: newURI },
        { ...oldHomepage, uri: oldURI }
      )

      batchUpdates.push({
        collection: "pages",
        doc: { ...oldHomepage, uri: newURI },
        changes,
      })

      result.documentsUpdated++
      result.redirectsCreated++
    }
  }

  // Handle new homepage
  const newHomepage = await cache.getByID("pages", newHomepageId)
  if (newHomepage) {
    const oldURI = newHomepage.uri
    const newURI = "/"

    // Update new homepage URI (from "/page-slug" to "/")
    await updateURI({
      uri: newURI,
      collection: "pages",
      documentId: newHomepage.id,
      status: newHomepage._status || "published",
      previousURI: oldURI,
    })

    const changes = detectChanges(
      { ...newHomepage, uri: newURI },
      { ...newHomepage, uri: oldURI }
    )

    batchUpdates.push({
      collection: "pages",
      doc: { ...newHomepage, uri: newURI },
      changes,
    })

    result.documentsUpdated++
    result.redirectsCreated++
  }

  // Batch process cache invalidation
  if (batchUpdates.length > 0) {
    const invalidationResults = await revalidateForBatchChanges(batchUpdates)
    result.cacheEntriesCleared = invalidationResults.operations.reduce(
      (total: number, res: any) => total + res.tagsInvalidated.length,
      0
    )
  }
}

/*************************************************************************/
/*  SETTINGS CHANGE PROCESSING
/*************************************************************************/

async function processSettingsChange(
  settingsId: string,
  additionalData: any,
  result: CascadeJobOutput
): Promise<void> {
  if (!additionalData?.affectedCollections) {
    console.log(`[URI Cascade] No affected collections specified for settings change`)
    return
  }

  const batchUpdates = []

  // Process each affected collection
  for (const collectionSlug of additionalData.affectedCollections) {
    console.log(`[URI Cascade] Processing settings change impact on ${collectionSlug}`)

    const items = await getCollectionItemsForArchive(collectionSlug)

    for (const item of items) {
      const oldURI = item.uri
      const newURI = await routingEngine.generateURI({
        collection: collectionSlug,
        slug: item.slug,
        data: item,
      })

      if (oldURI !== newURI) {
        // Update URI in index
        await updateURI({
          uri: newURI,
          collection: collectionSlug,
          documentId: item.id,
          status: item._status || "published",
          previousURI: oldURI,
        })

        // Track for batch cache invalidation
        const changes = detectChanges({ ...item, uri: newURI }, { ...item, uri: oldURI })

        batchUpdates.push({
          collection: collectionSlug,
          doc: { ...item, uri: newURI },
          changes,
        })

        result.documentsUpdated++
        result.redirectsCreated++
      }
    }
  }

  // Batch process cache invalidation
  if (batchUpdates.length > 0) {
    const invalidationResults = await revalidateForBatchChanges(batchUpdates)
    result.cacheEntriesCleared = invalidationResults.operations.reduce(
      (total: number, res: any) => total + res.tagsInvalidated.length,
      0
    )
  }
}
