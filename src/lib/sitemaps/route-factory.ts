import { getServerSideSitemap } from "next-sitemap"
import { unstable_cache } from "next/cache"
import { generateSitemap, toNextSitemapFormat } from "./generator"
import { getSitemapCacheTags, getSitemapCollections } from "./config"

/*************************************************************************/
/*  SITEMAP ROUTE FACTORY
/*************************************************************************/

/**
 * Create a cached sitemap generation function
 */
function createCachedSitemapGenerator(sitemapName: string) {
  // Generate cache tags based on collections in this sitemap
  const collections = getSitemapCollections(sitemapName)
  const tags = new Set<string>()

  // Add sitemap-specific tags
  tags.add("sitemap:all")
  const sitemapKey = sitemapName.replace(".xml", "").replace("-", ":")
  tags.add(`sitemap:${sitemapKey}`)

  // Add collection-specific tags
  collections.forEach(collection => {
    const collectionTags = getSitemapCacheTags(collection)
    collectionTags.forEach(tag => tags.add(tag))
  })

  return unstable_cache(
    async () => {
      const result = await generateSitemap({
        sitemapName,
        includeStatic: sitemapName === "pages-sitemap.xml",
      })

      return toNextSitemapFormat(result)
    },
    [`sitemap-${sitemapName}`],
    {
      tags: Array.from(tags),
      revalidate: 3600, // 1 hour cache by default
    }
  )
}

/**
 * Factory function to create sitemap route handlers
 */
export function createSitemapRoute(sitemapName: string) {
  const getCachedSitemap = createCachedSitemapGenerator(sitemapName)

  return async function GET() {
    try {
      const sitemap = await getCachedSitemap()
      return getServerSideSitemap(sitemap)
    } catch (error) {
      console.error(`Failed to generate sitemap ${sitemapName}:`, error)

      // Return empty sitemap on error
      return getServerSideSitemap([])
    }
  }
}

/*************************************************************************/
/*  SPECIFIC SITEMAP ROUTE CREATORS
/*************************************************************************/

/**
 * Create pages sitemap route (includes static entries)
 */
export function createPagesSitemapRoute() {
  return createSitemapRoute("pages-sitemap.xml")
}

/**
 * Create posts sitemap route
 */
export function createPostsSitemapRoute() {
  return createSitemapRoute("posts-sitemap.xml")
}

/**
 * Generic sitemap route creator for any collection
 */
export function createCollectionSitemapRoute(collectionName: string) {
  return createSitemapRoute(`${collectionName}-sitemap.xml`)
}

/*************************************************************************/
/*  SITEMAP INDEX GENERATOR (FUTURE ENHANCEMENT)
/*************************************************************************/

/**
 * Create a sitemap index that lists all available sitemaps
 * This can be used to create a main sitemap.xml that references all sub-sitemaps
 */
export function createSitemapIndexRoute() {
  return async function GET() {
    try {
      const { getActiveSitemaps } = await import("./config")
      const activeSitemaps = getActiveSitemaps()

      const siteUrl =
        process.env.NEXT_PUBLIC_URL ||
        process.env.VERCEL_PROJECT_PRODUCTION_URL ||
        "https://example.com"

      const sitemapIndex = activeSitemaps.map(sitemapName => ({
        loc: `${siteUrl}/${sitemapName}`,
        lastmod: new Date().toISOString(),
      }))

      return getServerSideSitemap(sitemapIndex)
    } catch (error) {
      console.error("Failed to generate sitemap index:", error)
      return getServerSideSitemap([])
    }
  }
}

/*************************************************************************/
/*  ROUTE VALIDATION & DEBUGGING
/*************************************************************************/

/**
 * Test a sitemap route for debugging purposes
 */
export async function testSitemapRoute(sitemapName: string): Promise<{
  success: boolean
  entryCount: number
  collections: string[]
  errors: string[]
}> {
  try {
    const result = await generateSitemap({
      sitemapName,
      includeStatic: sitemapName === "pages-sitemap.xml",
    })

    return {
      success: true,
      entryCount: result.entries.length,
      collections: result.collections,
      errors: [],
    }
  } catch (error) {
    return {
      success: false,
      entryCount: 0,
      collections: [],
      errors: [error instanceof Error ? error.message : "Unknown error"],
    }
  }
}
