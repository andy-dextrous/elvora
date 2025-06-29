import { cache } from "@/lib/cache/cache"
import { checkURIConflict } from "@/lib/routing/index-manager"
import configPromise from "@payload-config"
import { getPayload } from "payload"
import { getHomepage, getSettings } from "../data/globals"

/*************************************************************************/
/*  URI ENGINE

    The URI Engine is the core component of the Smart Routing Engine that handles
    intelligent URI generation and validation for all frontend collections.

    KEY RESPONSIBILITIES:
    - Generate URIs for pages with hierarchical parent/child relationships
    - Generate URIs for collection items using archive page settings
    - Validate URI format and detect conflicts using the URI Index
    - Integrate with the unified cache system for optimal performance
    - Support WordPress-like routing with first-match-wins conflict resolution

    URI GENERATION RULES:
    - Homepage: Always "/" (determined by settings.routing.homepage)
    - Pages: Hierarchical paths based on parent relationships (/parent/child)
    - Collection Items: Use archive page slug or collection name (/blog/post-slug)
    - All URIs validated and checked for conflicts via URI Index Collection

    ARCHITECTURE INTEGRATION:
    - Uses unified cache API (cache.getGlobal, cache.getByID) for all database access
    - Integrates with URI Index Collection for O(1) conflict detection
    - Supports smart revalidation through configuration-driven cache dependencies

/*************************************************************************/

interface GenerateURIProps {
  collection: string
  slug: string
  data?: any
  originalDoc?: any
  settings: any
  payload: any
}

async function generateDocumentURI({
  collection,
  slug,
  data,
  originalDoc,
  settings,
  payload,
}: GenerateURIProps): Promise<string> {
  // In the Smart Site, Pages are a special collection. They are equivalent to "pages" in WordPress
  // All other frontend collections are treated as "custom post types" in WordPress

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

  const homePage = await getHomepage()

  /**
   * Homepage must be the root of the site
   */
  if (slug === homePage?.slug) {
    return "/"
  }

  /**
   * For a normal page with no parent, URI is just the slug with a leading slash
   */
  if (!parent) {
    return `/${slug}`
  }

  /**
   * For a normal page with a parent, URI is the parent URI plus the slug with a leading slash
   */
  try {
    const parentDoc = await cache.getByID(
      "pages",
      typeof parent === "object" ? parent.id : parent
    )

    if (!parentDoc?.uri) {
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

  - This is used for all collections that are not pages
  - Uses a priority system to determine the URI
  - Priority 1: Archive page slug (if collection has designated archive pag in settingse)
  - Priority 2: Original collection slug (fallback)
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
  const archivePageField = `${collection}ArchivePage`

  /**
   * Priority 1: Archive page slug (if collection has designated archive page)
   */
  if (settings[archivePageField]) {
    try {
      const archivePage = await cache.getByID("pages", settings[archivePageField]?.id)

      if (archivePage?.uri) {
        return `${archivePage.uri}/${slug}`
      }
    } catch (error) {
      payload.logger.warn(`Failed to fetch archive page for ${collection}:`, error)
    }
  }

  /**
   * Fallback: Original collection slug
   */
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

async function checkConflict({
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

  const indexResult = await checkURIConflict(uri, collection, documentId)

  if (!indexResult || !indexResult.hasConflict) {
    return null
  }

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

    - Global URI Rules:
      - Must start with /
      - No double slashes
      - No trailing slash except for root
      - No spaces or special characters (basic validation)

/*************************************************************************/

export function validateURI(uri: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!uri) {
    errors.push("URI cannot be empty - use '/' for homepage")
    return { isValid: false, errors }
  }

  if (!uri.startsWith("/")) {
    errors.push("URI must start with /")
  }

  if (uri.includes("//")) {
    errors.push("URI cannot contain double slashes")
  }

  if (uri.length > 1 && uri.endsWith("/")) {
    errors.push("URI cannot end with /")
  }

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
  generateURI: async ({
    collection, // Collection slug
    slug, // Document slug
    data,
    originalDoc,
  }: {
    collection: string
    slug: string
    data?: any
    originalDoc?: any
  }): Promise<string> => {
    const payload = await getPayload({ config: configPromise })
    const settings = await getSettings()
    const routingSettings = settings.routing || {}

    const generatedURI = await generateDocumentURI({
      collection,
      slug,
      data,
      originalDoc,
      settings: routingSettings,
      payload,
    })

    const currentDocId = data?.id || originalDoc?.id
    const conflict = await checkConflict({
      uri: generatedURI,
      collection,
      documentId: currentDocId,
      payload,
    })

    if (conflict) {
      payload.logger.warn(
        `⚠️  URI Conflict Detected: ${generatedURI}\n` +
          `   Current: ${collection}/${slug}\n` +
          `   Conflicts with: ${conflict.collection}/${conflict.slug}\n`
      )
    }

    return generatedURI
  },

  /**
   * Check conflicts (used during generation) - O(1) via URI index
   */
  checkConflicts: async (
    uri: string,
    excludeDocId?: string
  ): Promise<URIConflictResult | null> => {
    const payload = await getPayload({ config: configPromise })

    return await checkConflict({
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
   * Convert Next.js slug array to URI
   */
  slugToURI: (slugArray: string[]): string => {
    if (!slugArray || slugArray.length === 0) {
      return "/"
    }
    const slugPath = slugArray.join("/")
    return `/${slugPath}`
  },

  /**
   * Convert URI to Next.js slug array
   */
  uriToSlug: (uri: string): string[] => {
    if (!uri || uri === "/" || uri === "") {
      return []
    }
    return uri.split("/").filter(Boolean)
  },

  /**
   * Normalize URI by removing trailing slashes while preserving homepage
   */
  normalizeURI: (uri: string): string => {
    // Homepage should always remain as "/"
    if (uri === "/") return "/"

    // Remove trailing slashes from other paths
    return uri.replace(/\/+$/, "")
  },
}
