import { getSettings } from "@/lib/data/globals"
import { frontendCollections } from "@/payload/collections/frontend"
import { cache } from "@/lib/cache"

export interface ArchiveDependency {
  collection: string
  archivePageId: string
  archivePageSlug: string
  itemCount: number
}

/*************************************************************************/
/*  ARCHIVE PAGE DEPENDENCY ANALYSIS
/*************************************************************************/

export async function getCollectionsUsingArchive(
  pageId: string
): Promise<ArchiveDependency[]> {
  const settings = await getSettings()
  const routing = settings?.routing

  if (!routing) return []

  const dependencies: ArchiveDependency[] = []

  // Dynamically check archive settings for all frontend collections (except pages)
  const archiveSettings = frontendCollections
    .filter(collection => collection.slug !== "pages")
    .map(collection => ({
      field: `${collection.slug}ArchivePage`,
      collection: collection.slug,
      label: collection.label,
    }))

  for (const setting of archiveSettings) {
    const archivePage = routing[setting.field]
    if (archivePage?.id === pageId) {
      // Get the actual page slug - archivePage only contains id, not slug
      let pageSlug = setting.collection // fallback
      try {
        const fullPage = await cache.getByID("pages", pageId)
        if (fullPage?.slug) {
          pageSlug = fullPage.slug
        }
      } catch (error) {
        // Use collection name as fallback if page fetch fails
        pageSlug = setting.collection
      }

      dependencies.push({
        collection: setting.collection,
        archivePageId: pageId,
        archivePageSlug: pageSlug,
        itemCount: 0, // Will be populated during dependent updates operation
      })
    }
  }

  return dependencies
}

export function detectArchiveChanges(
  oldSettings: any,
  newSettings: any
): Array<{ collection: string; oldArchive?: string; newArchive?: string }> {
  const changes = []

  // Dynamically generate archive fields for all frontend collections (except pages)
  const archiveFields = frontendCollections
    .filter(collection => collection.slug !== "pages")
    .map(collection => `${collection.slug}ArchivePage`)

  for (const field of archiveFields) {
    const oldValue = oldSettings?.routing?.[field]?.id
    const newValue = newSettings?.routing?.[field]?.id

    if (oldValue !== newValue) {
      const collection = field.replace("ArchivePage", "")
      changes.push({
        collection,
        oldArchive: oldValue,
        newArchive: newValue,
      })
    }
  }

  return changes
}

/*************************************************************************/
/*  PAGE HIERARCHY ANALYSIS
/*************************************************************************/

export async function findDescendantPages(parentId: string): Promise<any[]> {
  // Use cache.getCollection for consistent caching pattern
  const descendants = await cache.getCollection("pages", {
    where: {
      parent: { equals: parentId },
    },
    limit: 1000,
    depth: 2,
  })

  // Recursively find children of children
  const allDescendants = [...descendants]
  for (const child of descendants) {
    const childDescendants = await findDescendantPages(child.id)
    allDescendants.push(...childDescendants)
  }

  return allDescendants
}

export function detectHierarchyChanges(
  doc: any,
  previousDoc: any
): { parentChanged: boolean; oldParent?: string; newParent?: string } {
  const oldParent = previousDoc?.parent?.id || previousDoc?.parent
  const newParent = doc?.parent?.id || doc?.parent

  return {
    parentChanged: oldParent !== newParent,
    oldParent,
    newParent,
  }
}

/*************************************************************************/
/*  GLOBAL SETTINGS ANALYSIS
/*************************************************************************/

export function detectHomepageChange(
  oldSettings: any,
  newSettings: any
): { changed: boolean; oldHomepage?: string; newHomepage?: string } {
  const oldHomepage = oldSettings?.routing?.homepage?.id
  const newHomepage = newSettings?.routing?.homepage?.id

  return {
    changed: oldHomepage !== newHomepage,
    oldHomepage,
    newHomepage,
  }
}

export function detectAllSettingsChanges(oldSettings: any, newSettings: any) {
  return {
    archiveChanges: detectArchiveChanges(oldSettings, newSettings),
    homepageChange: detectHomepageChange(oldSettings, newSettings),
  }
}

/*************************************************************************/
/*  COLLECTION ITEMS USING ARCHIVE
/*************************************************************************/

export async function getCollectionItemsForArchive(
  collection: string,
  limit = 1000
): Promise<any[]> {
  // Use cache.getCollection for consistent caching pattern
  const items = await cache.getCollection(collection as any, {
    where: {
      _status: { equals: "published" },
    },
    limit,
    depth: 1,
  })

  return items
}

/*************************************************************************/
/*  DEPENDENCY DETECTION UTILITIES
/*************************************************************************/

export async function shouldTriggerArchiveDependentUpdates(
  collection: string,
  doc: any,
  previousDoc: any
): Promise<boolean> {
  // Only pages can trigger archive dependent updates
  if (collection !== "pages") return false

  // Only trigger dependent updates for published content
  if (doc._status !== "published") return false

  // Check if this page is used as an archive page
  const collections = await getCollectionsUsingArchive(doc.id)
  if (collections.length === 0) return false

  // Check for slug changes
  const oldSlug = previousDoc?.slug
  const newSlug = doc?.slug

  return oldSlug !== newSlug
}

export async function shouldTriggerHierarchyDependentUpdates(
  collection: string,
  doc: any,
  previousDoc: any
): Promise<boolean> {
  // Only pages have hierarchy
  if (collection !== "pages") return false

  // Only trigger dependent updates for published content
  if (doc._status !== "published") return false

  const hierarchyChanges = detectHierarchyChanges(doc, previousDoc)
  return hierarchyChanges.parentChanged
}

/*************************************************************************/
/*  DEPENDENT UPDATES OPERATION UTILITIES
/*************************************************************************/

export async function getDependentUpdatesImpactSize(
  operation: string,
  entityId: string
): Promise<number> {
  let impactSize = 0

  switch (operation) {
    case "archive-page-update":
      const archiveDependencies = await getCollectionsUsingArchive(entityId)
      for (const dep of archiveDependencies) {
        const items = await getCollectionItemsForArchive(dep.collection)
        impactSize += items.length
      }
      break

    case "page-hierarchy-update":
      const descendants = await findDescendantPages(entityId)
      impactSize = descendants.length
      break

    case "homepage-change":
      impactSize = 1 // Just the homepage itself
      break

    default:
      impactSize = 0
  }

  return impactSize
}
