import type { FieldHook } from "payload"
import configPromise from "@payload-config"
import { getPayload } from "payload"
import { frontendCollections } from "@/payload/collections"

/*************************************************************************/
/*  UNIVERSAL URI GENERATION HOOK
/*************************************************************************/

export const createURIHook = (): FieldHook => {
  return async ({ data, req, operation, originalDoc, collection }) => {
    // Only generate URI on create or when slug changes
    if (operation !== "create" && operation !== "update") {
      return data?.uri || originalDoc?.uri
    }

    // Don't regenerate if URI is manually set and we're not changing slug
    if (data?.uri && data?.slug === originalDoc?.slug) {
      return data.uri
    }

    const slug = data?.slug || originalDoc?.slug
    if (!slug) {
      return ""
    }

    const collectionSlug = collection?.slug
    if (!collectionSlug) {
      return `/${slug}`
    }

    try {
      const payload = await getPayload({ config: configPromise })

      // Get routing settings from global
      const settings = await payload.findGlobal({
        slug: "settings",
        depth: 1,
      })

      const generatedURI = await generateURI({
        collection: collectionSlug,
        slug,
        data,
        originalDoc,
        settings: settings?.routing || {},
        payload,
      })

      // Check for URI conflicts
      const currentDocId = data?.id || originalDoc?.id
      const conflict = await checkURIConflict({
        uri: generatedURI,
        collection: collectionSlug,
        documentId: currentDocId,
        payload,
      })

      if (conflict) {
        console.warn(
          `⚠️  URI Conflict Detected: ${generatedURI}\n` +
            `   Current: ${collectionSlug}/${slug}\n` +
            `   Conflicts with: ${conflict.collection}/${conflict.slug}\n` +
            `   Using first-match-wins priority`
        )
      }

      return generatedURI
    } catch (error) {
      console.warn(`URI generation failed for ${collectionSlug}/${slug}:`, error)
      // Fallback to basic URI generation
      return generateFallbackURI(collectionSlug, slug, data)
    }
  }
}

/*************************************************************************/
/*  URI GENERATION LOGIC
/*************************************************************************/

interface GenerateURIProps {
  collection: string
  slug: string
  data: any
  originalDoc?: any
  settings: any
  payload: any
}

async function generateURI({
  collection,
  slug,
  data,
  originalDoc,
  settings,
  payload,
}: GenerateURIProps): Promise<string> {
  // Homepage handling
  if (collection === "pages" && slug === "home") {
    return ""
  }

  // Pages collection - handle hierarchy using parent field
  if (collection === "pages") {
    return await generatePageURI({ slug, data, originalDoc, payload })
  }

  // Collection items - use archive page, custom slug, or collection slug
  return await generateCollectionItemURI({
    collection,
    slug,
    settings,
    payload,
  })
}

/*************************************************************************/
/*  PAGE URI GENERATION (HIERARCHICAL)
/*************************************************************************/

async function generatePageURI({
  slug,
  data,
  originalDoc,
  payload,
}: {
  slug: string
  data: any
  originalDoc?: any
  payload: any
}): Promise<string> {
  const parent = data?.parent || originalDoc?.parent

  if (!parent) {
    return `/${slug}`
  }

  try {
    // Get parent document
    const parentDoc = await payload.findByID({
      collection: "pages",
      id: typeof parent === "object" ? parent.id : parent,
      depth: 0,
    })

    if (!parentDoc?.uri) {
      // If parent doesn't have URI yet, generate it recursively
      const parentURI = await generatePageURI({
        slug: parentDoc.slug,
        data: parentDoc,
        payload,
      })
      return `${parentURI}/${slug}`
    }

    return `${parentDoc.uri}/${slug}`
  } catch (error) {
    console.warn("Failed to generate hierarchical page URI:", error)
    return `/${slug}`
  }
}

/*************************************************************************/
/*  COLLECTION ITEM URI GENERATION
/*************************************************************************/

async function generateCollectionItemURI({
  collection,
  slug,
  settings,
  payload,
}: {
  collection: string
  slug: string
  settings: any
  payload: any
}): Promise<string> {
  const collectionSettings = settings[collection] || {}

  // Priority 1: Archive page slug
  if (collectionSettings.archivePage) {
    try {
      const archivePage = await payload.findByID({
        collection: "pages",
        id:
          typeof collectionSettings.archivePage === "object"
            ? collectionSettings.archivePage.id
            : collectionSettings.archivePage,
        depth: 0,
      })

      if (archivePage?.slug) {
        return `/${archivePage.slug}/${slug}`
      }
    } catch (error) {
      console.warn(`Failed to fetch archive page for ${collection}:`, error)
    }
  }

  // Priority 2: Custom collection slug
  if (collectionSettings.customSlug) {
    return `/${collectionSettings.customSlug}/${slug}`
  }

  // Priority 3: Default collection slug
  return `/${collection}/${slug}`
}

/*************************************************************************/
/*  FALLBACK URI GENERATION
/*************************************************************************/

function generateFallbackURI(collection: string, slug: string, data: any): string {
  // Simple fallback logic
  if (collection === "pages") {
    if (slug === "home") return ""
    return `/${slug}`
  }

  return `/${collection}/${slug}`
}

/*************************************************************************/
/*  FRONTEND COLLECTIONS ACCESS (USES PRE-COMPUTED LIST)
/*************************************************************************/

function getFrontendCollectionsList(): Array<{ slug: string; label: string }> {
  return frontendCollections
}

/*************************************************************************/
/*  URI CONFLICT DETECTION
/*************************************************************************/

interface URIConflictResult {
  collection: string
  slug: string
  id: string
  title?: string
}

async function checkURIConflict({
  uri,
  collection,
  documentId,
  payload,
}: {
  uri: string
  collection: string
  documentId?: string
  payload: any
}): Promise<URIConflictResult | null> {
  if (!uri || uri === "") return null

  // Get frontend collections from pre-computed list
  const frontendCollectionsList = getFrontendCollectionsList()

  // Check all frontend collections for URI conflicts
  for (const collectionConfig of frontendCollectionsList) {
    if (collectionConfig.slug === collection && documentId) {
      // Skip checking the same document being updated
      continue
    }

    try {
      const result = await payload.find({
        collection: collectionConfig.slug,
        where: {
          uri: {
            equals: uri,
          },
        },
        limit: 1,
        depth: 0,
      })

      if (result.docs.length > 0) {
        const conflictDoc = result.docs[0]

        // If it's the same document being updated, not a conflict
        if (documentId && conflictDoc.id === documentId) {
          continue
        }

        return {
          collection: collectionConfig.slug,
          slug: conflictDoc.slug,
          id: conflictDoc.id,
          title: conflictDoc.title,
        }
      }
    } catch (error) {
      // Collection might not have URI field yet, skip
      console.debug(`Skipping URI conflict check for ${collectionConfig.slug}:`, error)
      continue
    }
  }

  return null
}

/*************************************************************************/
/*  URI VALIDATION UTILITIES
/*************************************************************************/

export function validateURI(uri: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!uri) {
    return { isValid: true, errors: [] } // Empty URI is valid for homepage
  }

  // Must start with / unless it's empty (homepage)
  if (!uri.startsWith("/")) {
    errors.push("URI must start with /")
  }

  // No double slashes
  if (uri.includes("//")) {
    errors.push("URI cannot contain double slashes")
  }

  // No trailing slash except for root
  if (uri.length > 1 && uri.endsWith("/")) {
    errors.push("URI cannot end with /")
  }

  // No spaces or special characters (basic validation)
  if (!/^[a-zA-Z0-9\/-]*$/.test(uri)) {
    errors.push("URI can only contain letters, numbers, hyphens, and forward slashes")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
