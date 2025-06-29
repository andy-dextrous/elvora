import {
  getCollectionsUsingArchive,
  getCollectionItemsForArchive,
  findDescendantPages,
} from "./dependency-analyzer"
import { updateURI } from "./index-manager"
import { routingEngine } from "./uri-engine"
import { batchRevalidate } from "@/lib/cache"
import { detectChanges } from "@/lib/cache/change-detection"
import { cache } from "@/lib/cache"

/*************************************************************************/
/*  CASCADE OPERATION TYPES
/*************************************************************************/

export interface CascadeResult {
  success: boolean
  documentsUpdated: number
  redirectsCreated: number
  cacheEntriesCleared: number
  errors: string[]
  operation: string
}

export interface CascadeAdditionalData {
  oldSlug?: string
  newSlug?: string
  oldParent?: string
  newParent?: string
  affectedCollections?: string[]
  oldHomepage?: string
}

/*************************************************************************/
/*  ARCHIVE PAGE UPDATE PROCESSING
/*************************************************************************/

export async function processArchivePageUpdate(pageId: string): Promise<CascadeResult> {
  const result: CascadeResult = {
    success: false,
    documentsUpdated: 0,
    redirectsCreated: 0,
    cacheEntriesCleared: 0,
    errors: [],
    operation: "archive-page-update",
  }

  try {
    // Get all collections that use this page as their archive
    const dependencies = await getCollectionsUsingArchive(pageId)

    if (dependencies.length === 0) {
      console.log(`[URI Cascade] No collections use page ${pageId} as archive`)
      result.success = true
      return result
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
          const changes = detectChanges(
            { ...item, uri: newURI },
            { ...item, uri: oldURI }
          )

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
      // Convert to batchRevalidate format
      const operations = batchUpdates.map(update => ({
        collection: update.collection,
        doc: update.doc,
        previousDoc: { ...update.doc, uri: update.changes.oldUri },
        action: "update" as const,
      }))

      const invalidationResults = await batchRevalidate({ operations })
      result.cacheEntriesCleared = invalidationResults.operations.reduce(
        (total: number, res: any) => total + (res.tagsInvalidated?.length || 0),
        0
      )
    }

    result.success = true
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error))
    console.error(`[URI Cascade] Archive page update failed:`, error)
  }

  return result
}

/*************************************************************************/
/*  PAGE HIERARCHY UPDATE PROCESSING
/*************************************************************************/

export async function processPageHierarchyUpdate(pageId: string): Promise<CascadeResult> {
  const result: CascadeResult = {
    success: false,
    documentsUpdated: 0,
    redirectsCreated: 0,
    cacheEntriesCleared: 0,
    errors: [],
    operation: "page-hierarchy-update",
  }

  try {
    // Find all descendant pages
    const descendants = await findDescendantPages(pageId)

    if (descendants.length === 0) {
      console.log(`[URI Cascade] No descendants found for page ${pageId}`)
      result.success = true
      return result
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
      // Convert to batchRevalidate format
      const operations = batchUpdates.map(update => ({
        collection: update.collection,
        doc: update.doc,
        previousDoc: { ...update.doc, uri: update.changes.oldUri },
        action: "update" as const,
      }))

      const invalidationResults = await batchRevalidate({ operations })
      result.cacheEntriesCleared = invalidationResults.operations.reduce(
        (total: number, res: any) => total + (res.tagsInvalidated?.length || 0),
        0
      )
    }

    result.success = true
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error))
    console.error(`[URI Cascade] Page hierarchy update failed:`, error)
  }

  return result
}

/*************************************************************************/
/*  HOMEPAGE CHANGE PROCESSING
/*************************************************************************/

export async function processHomepageChange(
  newHomepageId: string,
  additionalData?: CascadeAdditionalData
): Promise<CascadeResult> {
  const result: CascadeResult = {
    success: false,
    documentsUpdated: 0,
    redirectsCreated: 0,
    cacheEntriesCleared: 0,
    errors: [],
    operation: "homepage-change",
  }

  try {
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
      // Convert to batchRevalidate format
      const operations = batchUpdates.map(update => ({
        collection: update.collection,
        doc: update.doc,
        previousDoc: { ...update.doc, uri: update.changes.oldUri },
        action: "update" as const,
      }))

      const invalidationResults = await batchRevalidate({ operations })
      result.cacheEntriesCleared = invalidationResults.operations.reduce(
        (total: number, res: any) => total + (res.tagsInvalidated?.length || 0),
        0
      )
    }

    result.success = true
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error))
    console.error(`[URI Cascade] Homepage change failed:`, error)
  }

  return result
}

/*************************************************************************/
/*  SETTINGS CHANGE PROCESSING
/*************************************************************************/

export async function processSettingsChange(
  settingsId: string,
  additionalData?: CascadeAdditionalData
): Promise<CascadeResult> {
  const result: CascadeResult = {
    success: false,
    documentsUpdated: 0,
    redirectsCreated: 0,
    cacheEntriesCleared: 0,
    errors: [],
    operation: "settings-change",
  }

  try {
    if (!additionalData?.affectedCollections) {
      console.log(`[URI Cascade] No affected collections specified for settings change`)
      result.success = true
      return result
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
          const changes = detectChanges(
            { ...item, uri: newURI },
            { ...item, uri: oldURI }
          )

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
      // Convert to batchRevalidate format
      const operations = batchUpdates.map(update => ({
        collection: update.collection,
        doc: update.doc,
        previousDoc: { ...update.doc, uri: update.changes.oldUri },
        action: "update" as const,
      }))

      const invalidationResults = await batchRevalidate({ operations })
      result.cacheEntriesCleared = invalidationResults.operations.reduce(
        (total: number, res: any) => total + (res.tagsInvalidated?.length || 0),
        0
      )
    }

    result.success = true
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error))
    console.error(`[URI Cascade] Settings change failed:`, error)
  }

  return result
}
