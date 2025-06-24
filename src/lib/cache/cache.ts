import { getPayload } from "payload"
import { unstable_cache } from "next/cache"
import configPromise from "@payload-config"
import type { Config } from "@/payload/payload-types"
import { getCacheConfig } from "./cache-config"

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

  // Individual items by slug
  if (collection && slug) {
    return [collection, "item", slug, draft ? "draft" : "published"]
  }

  // Individual items by ID (when params contains the ID)
  if (collection && params.length > 0 && !queryHash && !type) {
    return [collection, "item", params[0], draft ? "draft" : "published"]
  }

  // URI-based lookups
  if (uri !== undefined) {
    const normalizedURI = uri === "/" ? "" : uri.replace(/\/+$/, "")
    return ["uri", normalizedURI, draft ? "draft" : "published"]
  }

  // Collection queries
  if (collection && queryHash) {
    return [collection, "list", queryHash, draft ? "draft" : "published"]
  }

  // Globals
  if (globalSlug) {
    return ["global", globalSlug]
  }

  // Computed/related content
  if (type) {
    return ["computed", type, ...params]
  }

  throw new Error("Invalid cache key options provided")
}

/*************************************************************************/
/*  CACHE TAGS GENERATION
/*************************************************************************/

function generateCacheTags(
  options: CacheKeyOptions,
  includeDependencies: boolean = true
): string[] {
  const { collection, slug, uri, globalSlug, type, params = [] } = options
  const tags: string[] = []

  // Universal tag that applies to ALL cached items - only for caching, not invalidation
  if (includeDependencies) {
    tags.push("all")
  }

  // Individual items by slug
  if (collection && slug) {
    tags.push(`collection:${collection}`)
    tags.push(`item:${collection}:${slug}`)

    // Add dependencies from cache config - only for caching, not invalidation
    if (includeDependencies) {
      const config = getCacheConfig(collection)
      tags.push(...config.dependencies)
    }
  }

  // Individual items by ID (when params contains the ID)
  if (collection && params.length > 0 && !slug && !type) {
    tags.push(`collection:${collection}`)
    tags.push(`item:${collection}:${params[0]}`)

    // Add dependencies from cache config - only for caching, not invalidation
    if (includeDependencies) {
      const config = getCacheConfig(collection)
      tags.push(...config.dependencies)
    }
  }

  // URI-based lookups
  if (uri !== undefined) {
    const normalizedURI = uri === "/" ? "" : uri.replace(/\/+$/, "")
    tags.push(`uri:${normalizedURI}`)
  }

  // Collection queries
  if (collection && !slug && params.length === 0) {
    tags.push(`collection:${collection}`)

    // Add dependencies from cache config - only for caching, not invalidation
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
    const { operation, cacheKey, tags, timestamp, hit } = event
    const status = hit !== undefined ? (hit ? "HIT" : "MISS") : "EXEC"

    // Use non-blocking logging to prevent circular dependencies
    setImmediate(async () => {
      try {
        const payload = await getPayload({ config: configPromise })
        payload.logger.info(
          {
            cache_operation: operation,
            cache_key: cacheKey,
            cache_tags: tags,
            cache_status: status,
            timestamp,
          },
          `🗄️ [CACHE ${status}] ${operation}`
        )
      } catch (error) {
        console.error("Cache logging error:", error)
      }
    })
  }
}

/*************************************************************************/
/*  UNIVERSAL CACHE API
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

    return unstable_cache(
      async () => {
        const payload = await getPayload({ config: configPromise })
        const normalizedURI = uri === "/" ? "" : uri.replace(/\/+$/, "")

        const { frontendCollections } = await import("@/payload/collections/frontend")

        for (const collection of frontendCollections) {
          try {
            const result = await payload.find({
              collection: collection.slug as any,
              where: { uri: { equals: normalizedURI } },
              limit: 1,
              depth: 5,
              draft,
              overrideAccess: true,
            })

            if (result.docs?.[0]) {
              const document = result.docs[0]

              // If document doesn't have sections, apply template sections
              if (!document.sections || document.sections.length === 0) {
                try {
                  const { getDefaultTemplate } = await import("@/lib/data/templates")
                  const template = await getDefaultTemplate(collection.slug)

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
                collection: collection.slug,
              }
            }
          } catch (error) {
            continue
          }
        }

        return null
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
}

/*************************************************************************/
/*  CACHE UTILITIES
/*************************************************************************/

/**
 * Generate standardized cache key for any cache operation
 */
export function createCacheKey(options: CacheKeyOptions): string[] {
  return generateCacheKey(options)
}

/**
 * Generate standardized cache tags for any cache operation
 */
export function createCacheTags(
  options: CacheKeyOptions,
  includeDependencies: boolean = false
): string[] {
  return generateCacheTags(options, includeDependencies)
}

/**
 * Enable cache debugging by setting CACHE_DEBUG=true in environment
 */
export async function enableCacheDebug() {
  process.env.CACHE_DEBUG = "true"
  try {
    const payload = await getPayload({ config: configPromise })
    payload.logger.info("🗄️ Cache debugging enabled")
  } catch (error) {
    // payload.logger.info("🗄️  Cache debugging enabled")
  }
}
