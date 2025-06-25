import { frontendCollections } from "@/payload/collections/frontend"
import configPromise from "@payload-config"
import { unstable_cache } from "next/cache"
import { getPayload } from "payload"
import { checkURIConflict as checkURIConflictWithIndex } from "@/lib/routing/index-manager"
import { cache } from "@/lib/cache/cache"

/*************************************************************************/
/*  CACHED ROUTING SETTINGS
/*************************************************************************/

const getRoutingSettings = () =>
  unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })
      const settings = await payload.findGlobal({
        slug: "settings",
        depth: 1,
      })
      return settings?.routing || {}
    },
    ["global", "settings", "routing"],
    { tags: ["global:settings", "uri-index:dependent"], revalidate: 3600 }
  )()

/*************************************************************************/
/*  CORE URI GENERATION LOGIC
/*************************************************************************/

interface GenerateURIProps {
  collection: string
  slug: string
  data?: any
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
  if (collection === "pages" && slug === "home") {
    return ""
  }

  if (collection === "pages") {
    return await generatePageURI({ slug, data, originalDoc, payload })
  }

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
  data?: any
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
    payload.logger.warn("Failed to generate hierarchical page URI:", error)
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
  // Use the actual settings field names: postsArchivePage, servicesArchivePage, etc.
  const archivePageField = `${collection}ArchivePage`

  // Priority 1: Archive page slug (if collection has designated archive page)
  if (settings[archivePageField]) {
    try {
      const archivePage = await payload.findByID({
        collection: "pages",
        id:
          typeof settings[archivePageField] === "object"
            ? settings[archivePageField].id
            : settings[archivePageField],
        depth: 0,
      })

      if (archivePage?.slug) {
        return `/${archivePage.slug}/${slug}`
      }
    } catch (error) {
      payload.logger.warn(`Failed to fetch archive page for ${collection}:`, error)
    }
  }

  // Priority 2: Original collection slug (fallback)
  return `/${collection}/${slug}`
}

/*************************************************************************/
/*  FALLBACK URI GENERATION
/*************************************************************************/

function generateFallbackURI(collection: string, slug: string, data?: any): string {
  // Simple fallback logic
  if (collection === "pages") {
    if (slug === "home") return ""
    return `/${slug}`
  }

  return `/${collection}/${slug}`
}

/*************************************************************************/
/*  URI CONFLICT DETECTION
/*************************************************************************/

export interface URIConflictResult {
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

  // Use URI index for O(1) conflict detection
  const indexResult = await checkURIConflictWithIndex(uri, collection, documentId)

  if (!indexResult || !indexResult.hasConflict) {
    return null
  }

  // Get the actual document details via the unified cache system
  if (indexResult.conflictingCollection) {
    try {
      const conflictDoc = await cache.getByURI(uri)

      if (conflictDoc?.document) {
        return {
          collection: indexResult.conflictingCollection,
          slug: conflictDoc.document.slug,
          id: conflictDoc.document.id,
          title: conflictDoc.document.title,
        }
      }
    } catch (error) {
      payload.logger.error(`Failed to get conflict document details:`, error)
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

/*************************************************************************/
/*  ROUTING ENGINE API
/*************************************************************************/

export const routingEngine = {
  /**
   * Generate URI for document (used in Payload hooks)
   */
  generate: async ({
    collection,
    slug,
    data,
    originalDoc,
  }: {
    collection: string
    slug: string
    data?: any
    originalDoc?: any
  }): Promise<string> => {
    const payload = await getPayload({ config: configPromise })
    const settings = await getRoutingSettings()

    const generatedURI = await generateURI({
      collection,
      slug,
      data,
      originalDoc,
      settings,
      payload,
    })

    // Check for URI conflicts
    const currentDocId = data?.id || originalDoc?.id
    const conflict = await checkURIConflict({
      uri: generatedURI,
      collection,
      documentId: currentDocId,
      payload,
    })

    if (conflict) {
      payload.logger.warn(
        `⚠️  URI Conflict Detected: ${generatedURI}\n` +
          `   Current: ${collection}/${slug}\n` +
          `   Conflicts with: ${conflict.collection}/${conflict.slug}\n` +
          `   Using first-match-wins priority`
      )
    }

    return generatedURI
  },

  /**
   * Get all URIs for static generation (O(1) via URI index)
   */
  getAllURIs: async (draft: boolean = false): Promise<string[]> => {
    const cacheKey = ["all-uris", draft ? "draft" : "published"]
    const tags = ["routes", "uri-index:all"]

    return unstable_cache(
      async () => {
        const payload = await getPayload({ config: configPromise })

        // Single query to URI index instead of looping collections
        const result = await payload.find({
          collection: "uri-index",
          where: {
            status: { equals: draft ? "draft" : "published" },
          },
          limit: 2000, // Increased limit for larger sites
          depth: 0,
          select: { uri: true },
        })

        const uris = result.docs.map((doc: any) => doc.uri).filter(Boolean) // Remove any null/undefined URIs

        return [...new Set(uris)] // Remove duplicates
      },
      cacheKey,
      { tags }
    )()
  },

  /**
   * Check conflicts (used during generation) - O(1) via URI index
   */
  checkConflicts: async (
    uri: string,
    excludeDocId?: string
  ): Promise<URIConflictResult | null> => {
    const payload = await getPayload({ config: configPromise })
    return await checkURIConflict({
      uri,
      collection: "",
      documentId: excludeDocId,
      payload,
    })
  },

  /**
   * Validate URI format
   */
  validate: validateURI,

  /**
   * Convert Next.js slug array to URI (standardizes slug-to-URI conversion)
   */
  slugToURI: (slugArray: string[]): string => {
    if (!slugArray || slugArray.length === 0) {
      return "/"
    }
    const slugPath = slugArray.join("/")
    return `/${slugPath}`
  },

  /**
   * Convert URI to Next.js slug array (for generateStaticParams)
   */
  uriToSlug: (uri: string): string[] => {
    if (!uri || uri === "/" || uri === "") {
      return []
    }
    return uri.split("/").filter(Boolean)
  },
}
