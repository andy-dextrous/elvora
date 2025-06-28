import { getPayload } from "payload"
import { unstable_cache } from "next/cache"
import configPromise from "@payload-config"
import type { Config } from "@/payload/payload-types"
import { getCacheConfig } from "./cache-config"
import { isFrontendCollection } from "@/payload/collections/frontend"

/*************************************************************************/
/*  UNIVERSAL CACHE API - TYPES & INTERFACES
/*************************************************************************/

type Collection = keyof Config["collections"]
type Global = keyof Config["globals"]

// Simplified interface that matches what Payload's find method actually accepts
export interface QueryOptions {
  limit?: number
  page?: number
  sort?: string | string[]
  where?: any
  depth?: number
  draft?: boolean
  locale?: string
  overrideAccess?: boolean
  select?: Record<string, boolean>
}

export interface ResolvedDocument {
  document: any
  collection: string
}

export interface CacheKeyOptions {
  collection?: string
  slug?: string
  uri?: string
  globalSlug?: string
  draft?: boolean
  queryHash?: string
  type?: string
  params?: string[]
}

export interface CacheOptions {
  tags?: string[]
  revalidate?: number
}

/*************************************************************************/
/*  CACHE KEY GENERATION SYSTEM
/*************************************************************************/

function generateCacheKey(options: CacheKeyOptions): string[] {
  const {
    collection,
    slug,
    uri,
    globalSlug,
    draft,
    queryHash,
    type,
    params = [],
  } = options

  /*************************************************************************/
  /*  INDIVIDUAL COLLECTION ITEMS BY SLUG

      Used for: cache.getBySlug("pages", "about")
      Tags: collection:pages, item:pages:about, [dependencies]
      Revalidated by: Smart revalidation when the specific document changes

      Cache Key Structure: [collection, "item", slug, status]
      Example: ["pages", "item", "about", "published"]
  /*************************************************************************/

  if (collection && slug) {
    return [collection, "item", slug, draft ? "draft" : "published"]
  }

  /*************************************************************************/
  /*  INDIVIDUAL COLLECTION ITEMS BY ID

      Used for: cache.getByID("pages", "64f8b9c1e4b0c7d8a9e0f1g2")
      Tags: collection:pages, item:pages:[id], [dependencies]
      Revalidated by: Smart revalidation when the specific document changes

      Cache Key Structure: [collection, "item", id, status]
      Example: ["pages", "item", "64f8b9c1e4b0c7d8a9e0f1g2", "published"]
  /*************************************************************************/

  if (collection && params.length > 0 && !queryHash && !type) {
    return [collection, "item", params[0], draft ? "draft" : "published"]
  }

  /*************************************************************************/
  /*  URI-BASED LOOKUPS (PRIMARY ROUTING ENGINE METHOD)

      Used for: cache.getByURI("/about") - Universal routing system
      Tags: uri:/about (normalized without trailing slash)
      Revalidated by: URI changes, slug changes, document status changes

      This is the PRIMARY method for the smart routing engine. When users
      visit any URL, this cache key is used to find the corresponding document.

      Cache Key Structure: ["uri", normalizedURI, status]
      Examples:
      - Homepage: ["uri", "", "published"]
      - About page: ["uri", "/about", "published"]
  /*************************************************************************/

  if (uri !== undefined) {
    const normalizedURI = uri === "/" ? "" : uri.replace(/\/+$/, "")
    return ["uri", normalizedURI, draft ? "draft" : "published"]
  }

  /*************************************************************************/
  /*  COLLECTION QUERIES WITH FILTERS/PAGINATION

      Used for: cache.getCollection("posts", { limit: 10, page: 1 })
      Tags: collection:posts, [dependencies]
      Revalidated by: Any change to documents in the collection

      The queryHash includes all query parameters (where clauses, sorting, etc.)
      to ensure different queries are cached separately.

      Cache Key Structure: [collection, "list", queryHash, status]
      Example: ["posts", "list", "{\"limit\":10,\"page\":1}", "published"]
  /*************************************************************************/

  if (collection && queryHash) {
    return [collection, "list", queryHash, draft ? "draft" : "published"]
  }

  /*************************************************************************/
  /*  GLOBAL SINGLETONS

      Used for: cache.getGlobal("header") or cache.getGlobal("settings")
      Tags: global:header, global:settings
      Revalidated by: Changes to the specific global document

      Globals are singleton documents (header, footer, settings) that appear
      across the entire site and need immediate revalidation when changed.

      Cache Key Structure: ["global", globalSlug]
      Examples: ["global", "header"], ["global", "footer"]
  /*************************************************************************/

  if (globalSlug) {
    return ["global", globalSlug]
  }

  /*************************************************************************/
  /*  COMPUTED/RELATED CONTENT

      Used for: Template calculations, computed values, or related content
      Tags: computed:[type]
      Revalidated by: Dependencies defined in the computed logic

      This handles cached results of complex computations, template applications,
      or derived content that doesn't fit other patterns.

      Cache Key Structure: ["computed", type, ...additionalParams]
      Example: ["computed", "template", "default-page-template"]
  /*************************************************************************/

  if (type) {
    return ["computed", type, ...params]
  }

  throw new Error("Invalid cache key options provided")
}

/*************************************************************************/
/*  CACHE TAGS GENERATION

    UNDERSTANDING CACHE KEYS VS CACHE TAGS:

    🔑 CACHE KEYS = The unique identifier for a specific cached item
       - Generated by generateCacheKey()
       - Example: ["pages", "item", "about", "published"]
       - Used by Next.js to store/retrieve the exact cached value
       - Each key stores ONE specific piece of data

    🏷️ CACHE TAGS = Labels attached to cached items for batch invalidation
       - Generated by generateCacheTags()
       - Example: ["all", "collection:pages", "item:pages:about", "global:header"]
       - Used by Next.js revalidateTag() to invalidate MULTIPLE cache entries
       - Multiple cache entries can share the same tag

    RELATIONSHIP BETWEEN KEYS AND TAGS:

    One Cache Key → Multiple Cache Tags

    =====================================

      Cache Key: ["pages", "item", "about", "published"]

      Cache Tags: [
      "all",                  ← Universal tag
      "collection:pages",     ← Collection-level tag
      "item:pages:about",     ← Item-specific tag
      "global:settings"       ← Dependency tag
      ]

    ====================================

    REVALIDATION POWER:

    When you call revalidateTag("collection:pages"), it invalidates ALL
    cached items that have that tag, regardless of their individual keys:

    - cache.getBySlug("pages", "about")     ← Invalidated
    - cache.getBySlug("pages", "contact")   ← Invalidated
    - cache.getCollection("pages", {...})   ← Invalidated
    - cache.getByURI("/about")              ← Invalidated

    This allows surgical cache invalidation - you can clear related content
    without knowing every individual cache key that might be affected.

    Note: Next.js treats an array of strings as one single cache key.

/*************************************************************************/

function generateCacheTags(
  options: CacheKeyOptions,
  includeDependencies: boolean = true
): string[] {
  const { collection, slug, uri, globalSlug, type, params = [] } = options
  const tags: string[] = []

  /*************************************************************************/
  /*  UNIVERSAL "ALL" TAG FOR EMERGENCY CACHE CLEARING

      This tag is added to EVERY cached item so that when revalidateTag("all")
      is called, it will clear ALL cached content across the entire site.

      Usage:
      - Emergency cache clearing via revalidateAll() function
      - Admin "Clear All Cache" buttons
      - Manual cache clearing in API routes

      NOTE: This tag should NEVER be used in everyday revalidation operations.
      It's only for manual clearing of the entire cache.
  /*************************************************************************/

  tags.push("all")

  // Individual items by slug
  if (collection && slug) {
    tags.push(`collection:${collection}`)
    tags.push(`item:${collection}:${slug}`)

    // Add URI index tags for frontend collections
    if (isFrontendCollection(collection)) {
      tags.push(`uri-index:${collection}`) // Specific collection in URI index
      tags.push("uri-index:item") // Individual item in URI index
    }

    // Add dependencies from cache config
    if (includeDependencies) {
      const config = getCacheConfig(collection)
      tags.push(...config.dependencies)
    }
  }

  // Individual items by ID (when params contains the ID)
  if (collection && params.length > 0 && !slug && !type) {
    tags.push(`collection:${collection}`)
    tags.push(`item:${collection}:${params[0]}`)

    // Add URI index tags for frontend collections
    if (isFrontendCollection(collection)) {
      tags.push(`uri-index:${collection}`) // Specific collection in URI index
      tags.push("uri-index:item") // Individual item in URI index
    }

    // Add dependencies from cache config
    if (includeDependencies) {
      const config = getCacheConfig(collection)
      tags.push(...config.dependencies)
    }
  }

  // URI-based lookups
  if (uri !== undefined) {
    const normalizedURI = uri === "/" ? "" : uri.replace(/\/+$/, "")
    tags.push(`uri:${normalizedURI}`)

    // Add URI index specific tags
    tags.push("uri-index:lookup") // For URI resolution caches
    tags.push("uri-index:dependent") // For anything that depends on URI resolution
  }

  // Collection queries
  if (collection && !slug && params.length === 0) {
    tags.push(`collection:${collection}`)

    // Add URI index tags for frontend collections
    if (isFrontendCollection(collection)) {
      tags.push(`uri-index:${collection}`) // Specific collection in URI index
      tags.push("uri-index:all") // General URI index tag
    }

    // Add dependencies from cache config
    if (includeDependencies) {
      const config = getCacheConfig(collection)
      tags.push(...config.dependencies)
    }
  }

  // Globals
  if (globalSlug) {
    tags.push(`global:${globalSlug}`)
  }

  // Computed/related content
  if (type) {
    tags.push(`computed:${type}`)
  }

  return tags
}

/*************************************************************************/
/*  DEBUG LOGGING UTILITIES
/*************************************************************************/

interface CacheEvent {
  operation: string
  cacheKey: string[]
  tags: string[]
  timestamp: string
  hit?: boolean
}

function logCacheEvent(event: CacheEvent) {
  if (process.env.CACHE_DEBUG === "true") {
    const { operation, cacheKey, tags, hit } = event
    const status = hit !== undefined ? (hit ? "HIT" : "MISS") : "EXEC"

    // Use non-blocking logging to prevent circular dependencies
    setImmediate(async () => {
      const payload = await getPayload({ config: configPromise })
      payload.logger.info(
        `🗄️ [CACHE ${status}] ${operation} - tags: ${tags.join(", ")} - key: ${cacheKey.join(
          ","
        )}`
      )
    })
  }
}

/*************************************************************************/
/*  UNIVERSAL CACHE API

    Single interface for all content retrieval with intelligent caching and revalidation.

    Primary Methods:
    - cache.getByURI("/about/team/andrew")           → Universal routing (powers [[...slug]]/page.tsx)
    - cache.getBySlug("team", "andrew")  → Individual documents
    - cache.getCollection("team", {...}) → Filtered collections
    - cache.getGlobal("settings")          → Site-wide content

    Each method wraps Next.js unstable_cache() with standardized keys, tags,
    and dependency-based invalidation configured in cache-config.ts.
/*************************************************************************/

export const cache = {
  /**
   * Get document by URI (primary method for universal routing)
   */
  getByURI: async (
    uri: string,
    draft: boolean = false
  ): Promise<ResolvedDocument | null> => {
    const cacheKey = generateCacheKey({ uri, draft })
    const tags = generateCacheTags({ uri }, true)

    const timestamp = new Date().toISOString()
    logCacheEvent({ operation: `getByURI("${uri}")`, cacheKey, tags, timestamp })

    console.log("fetching by uri", uri)

    return unstable_cache(
      async () => {
        const payload = await getPayload({ config: configPromise })

        // Query 1: Fast URI index lookup (indexed, very fast)
        const indexResult = await payload.find({
          collection: "uri-index",
          where: {
            and: [
              { uri: { equals: uri } },
              { status: { equals: draft ? "draft" : "published" } },
            ],
          },
          limit: 1,
        })

        if (indexResult.docs.length === 0) {
          return null
        }

        const indexDoc = indexResult.docs[0]

        // Query 2: Get full document with precise control over draft/depth/access
        const document = await payload.findByID({
          collection: indexDoc.sourceCollection as any,
          id: indexDoc.documentId,
          draft,
          depth: 5,
          overrideAccess: true,
        })

        if (!document) {
          return null
        }

        // If document doesn't have sections, apply template sections
        if (!document.sections || document.sections.length === 0) {
          try {
            const { getDefaultTemplate } = await import("@/lib/data/templates")
            const template = await getDefaultTemplate(indexDoc.sourceCollection)

            if (template?.sections) {
              document.sections = template.sections
            }
          } catch (templateError) {
            // Silently continue without template if loading fails
            // This ensures the page still loads even if template system has issues
          }
        }

        return {
          document,
          collection: indexDoc.sourceCollection,
        }
      },
      cacheKey,
      { tags }
    )()
  },

  /**
   * Get document by collection and ID
   */
  getByID: async (
    collection: Collection,
    id: string,
    draft: boolean = false
  ): Promise<any | null> => {
    const cacheKey = generateCacheKey({ collection, params: [id], draft })
    const tags = generateCacheTags({ collection }, true)

    const timestamp = new Date().toISOString()
    logCacheEvent({
      operation: `getByID("${collection}", "${id}")`,
      cacheKey,
      tags,
      timestamp,
    })

    return unstable_cache(
      async () => {
        const payload = await getPayload({ config: configPromise })

        const result = await payload.findByID({
          collection,
          id,
          draft,
          depth: 5,
          overrideAccess: true,
        })

        return result || null
      },
      cacheKey,
      { tags }
    )()
  },

  /**
   * Get document by collection and slug
   */
  getBySlug: async (
    collection: Collection,
    slug: string,
    draft: boolean = false
  ): Promise<any | null> => {
    const cacheKey = generateCacheKey({ collection, slug, draft })
    const tags = generateCacheTags({ collection, slug }, true)

    const timestamp = new Date().toISOString()
    logCacheEvent({
      operation: `getBySlug("${collection}", "${slug}")`,
      cacheKey,
      tags,
      timestamp,
    })

    return unstable_cache(
      async () => {
        const payload = await getPayload({ config: configPromise })

        const result = await payload.find({
          collection,
          draft,
          depth: 5,
          limit: 1,
          pagination: false,
          overrideAccess: true,
          where: {
            slug: {
              equals: slug,
            },
          },
        })

        return result.docs?.[0] || null
      },
      cacheKey,
      { tags }
    )()
  },

  /**
   * Get collection with query options
   */
  getCollection: async (
    collection: Collection,
    options: QueryOptions = {},
    draft: boolean = false
  ): Promise<any[]> => {
    const queryHash = JSON.stringify(options)
    const cacheKey = generateCacheKey({ collection, queryHash, draft })
    const tags = generateCacheTags({ collection }, true)

    const timestamp = new Date().toISOString()
    logCacheEvent({
      operation: `getCollection("${collection}")`,
      cacheKey,
      tags,
      timestamp,
    })

    return unstable_cache(
      async () => {
        const payload = await getPayload({ config: configPromise })
        const {
          limit,
          page,
          sort,
          where,
          depth = 1,
          locale,
          overrideAccess = true,
        } = options || {}

        const query: any = {
          collection,
          draft,
          depth,
          overrideAccess,
        }

        // Only add optional parameters if they're defined
        if (limit !== undefined) query.limit = limit
        if (page !== undefined) query.page = page
        if (sort !== undefined) query.sort = sort
        if (where !== undefined) query.where = where
        if (locale !== undefined) query.locale = locale

        const result = await payload.find(query)

        return result.docs
      },
      cacheKey,
      { tags }
    )()
  },

  /**
   * Get global by slug
   */
  getGlobal: async (globalSlug: Global, depth: number = 0): Promise<any> => {
    const cacheKey = generateCacheKey({ globalSlug })
    const tags = generateCacheTags({ globalSlug }, true)

    const timestamp = new Date().toISOString()
    logCacheEvent({
      operation: `getGlobal("${globalSlug}")`,
      cacheKey,
      tags,
      timestamp,
    })

    return unstable_cache(
      async () => {
        const payload = await getPayload({ config: configPromise })

        const result = await payload.findGlobal({
          slug: globalSlug,
          depth,
        })

        return result
      },
      cacheKey,
      { tags }
    )()
  },

  /**
   * Get all URIs for static generation (specialized URI index query)
   */
  getAllURIs: async (draft: boolean = false): Promise<string[]> => {
    const cacheKey = generateCacheKey({
      collection: "uri-index",
      type: "all-uris",
      params: [draft ? "draft" : "published"],
    })
    const tags = generateCacheTags({ collection: "uri-index" }, true)

    const timestamp = new Date().toISOString()
    logCacheEvent({
      operation: `getAllURIs(${draft})`,
      cacheKey,
      tags,
      timestamp,
    })

    return unstable_cache(
      async () => {
        const payload = await getPayload({ config: configPromise })

        const result = await payload.find({
          collection: "uri-index",
          where: {
            status: { equals: draft ? "draft" : "published" },
          },
          limit: 2000,
          depth: 0,
          select: { uri: true },
        })

        const uris = result.docs.map((doc: any) => doc.uri).filter(Boolean)
        return [...new Set(uris)]
      },
      cacheKey,
      { tags }
    )()
  },
}
