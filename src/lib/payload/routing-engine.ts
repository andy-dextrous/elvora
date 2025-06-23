import { getPayload } from "payload"
import { unstable_cache } from "next/cache"
import configPromise from "@payload-config"
import { frontendCollections } from "@/payload/collections/frontend"
import type { FieldHook } from "payload"

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
    ["routing-settings"],
    { tags: ["global:settings"], revalidate: 3600 }
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

  // Check all frontend collections for URI conflicts
  for (const collectionConfig of frontendCollections) {
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
   * Get all URIs for static generation
   */
  getAllURIs: async (draft: boolean = false): Promise<string[]> => {
    const cacheKey = ["all-uris", draft ? "draft" : "published"]
    const tags = ["routes"]

    return unstable_cache(
      async () => {
        const payload = await getPayload({ config: configPromise })
        const uris: string[] = []

        for (const collection of frontendCollections) {
          try {
            const result = await payload.find({
              collection: collection.slug as any,
              where: {
                uri: { exists: true },
                _status: { equals: "published" },
              },
              limit: 1000,
              depth: 0,
              draft,
              select: { uri: true },
            })

            result.docs.forEach((doc: any) => {
              if (doc.uri) {
                uris.push(doc.uri)
              }
            })
          } catch (error) {
            continue
          }
        }

        return [...new Set(uris)]
      },
      cacheKey,
      { tags }
    )()
  },

  /**
   * Check conflicts (used during generation)
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

/*************************************************************************/
/*  PAYLOAD FIELD HOOK (REPLACES create-uri.ts)
/*************************************************************************/

export const createURIHook = (): FieldHook => {
  return async ({ data, req, operation, originalDoc, collection }) => {
    // Only generate URI on create or when slug changes
    if (operation !== "create" && operation !== "update") {
      return data?.uri || originalDoc?.uri
    }

    // Always regenerate URI when slug changes
    // Only skip regeneration if slug hasn't changed
    if (data?.slug === originalDoc?.slug && originalDoc?.uri) {
      return originalDoc.uri
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
      // Use the routing engine
      return await routingEngine.generate({
        collection: collectionSlug,
        slug,
        data,
        originalDoc,
      })
    } catch (error) {
      req.payload.logger.warn(
        `URI generation failed for ${collectionSlug}/${slug}:`,
        error
      )
      // Fallback to basic URI generation
      return generateFallbackURI(collectionSlug, slug, data)
    }
  }
}
