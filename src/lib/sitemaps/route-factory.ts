import { unstable_cache } from "next/cache"
import { generateSitemap } from "./generator"
import { getSitemapCacheTags, getSitemapCollections } from "./config"

/*************************************************************************/
/*  APP ROUTER SITEMAP ROUTE FACTORY
/*************************************************************************/

/**
 * Create a cached sitemap generation function for App Router
 */
function createCachedAppRouterSitemapGenerator(sitemapName: string) {
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

      return result.entries
    },
    [`sitemap-${sitemapName}`],
    {
      tags: Array.from(tags),
      revalidate: 3600, // 1 hour cache by default
    }
  )
}

/**
 * Generate XML sitemap content from entries
 */
function generateSitemapXML(entries: any[]): string {
  const siteUrl = (
    process.env.NEXT_PUBLIC_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "https://example.com"
  ).replace(/\/$/, "")

  const urlEntries = entries
    .map(entry => {
      const url = entry.loc || `${siteUrl}${entry.url || ""}`
      const lastmod = entry.lastmod || new Date().toISOString()
      const changefreq = entry.changefreq || "weekly"
      const priority = entry.priority || 0.5

      return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    })
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}

/**
 * Factory function to create App Router sitemap route handlers
 */
export function createAppRouterSitemapRoute(sitemapName: string) {
  const getCachedSitemap = createCachedAppRouterSitemapGenerator(sitemapName)

  return async function GET(): Promise<Response> {
    try {
      const entries = await getCachedSitemap()
      const xml = generateSitemapXML(entries)

      return new Response(xml, {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      })
    } catch (error) {
      console.error(`Failed to generate sitemap ${sitemapName}:`, error)

      // Return empty sitemap on error
      const emptyXml = generateSitemapXML([])
      return new Response(emptyXml, {
        headers: {
          "Content-Type": "application/xml",
          "Cache-Control": "public, max-age=300", // Shorter cache on error
        },
      })
    }
  }
}

/*************************************************************************/
/*  BACKWARD COMPATIBILITY LAYER
/*************************************************************************/

/**
 * Legacy factory function (for compatibility)
 * @deprecated Use createAppRouterSitemapRoute instead
 */
export function createSitemapRoute(sitemapName: string) {
  console.warn(
    `createSitemapRoute is deprecated. Use createAppRouterSitemapRoute instead.`
  )
  return createAppRouterSitemapRoute(sitemapName)
}

/*************************************************************************/
/*  SPECIFIC SITEMAP ROUTE CREATORS
/*************************************************************************/

/**
 * Create pages sitemap route (includes static entries)
 */
export function createPagesSitemapRoute() {
  return createAppRouterSitemapRoute("pages-sitemap.xml")
}

/**
 * Create posts sitemap route
 */
export function createPostsSitemapRoute() {
  return createAppRouterSitemapRoute("posts-sitemap.xml")
}

/**
 * Generic sitemap route creator for any collection
 */
export function createCollectionSitemapRoute(collectionName: string) {
  return createAppRouterSitemapRoute(`${collectionName}-sitemap.xml`)
}

/*************************************************************************/
/*  DYNAMIC SITEMAP ROUTE FACTORY
/*************************************************************************/

/**
 * Create a universal sitemap route handler that can handle any sitemap
 * dynamically based on configuration
 */
export function createUniversalSitemapRoute() {
  return async function GET(
    request: Request,
    { params }: { params: { sitemap: string } }
  ): Promise<Response> {
    const sitemapName = `${params.sitemap}.xml`

    // Verify this is a valid sitemap
    const { getActiveSitemaps } = await import("./config")
    const activeSitemaps = getActiveSitemaps()

    if (!activeSitemaps.includes(sitemapName)) {
      return new Response("Sitemap not found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      })
    }

    // Create and execute the sitemap route handler
    const handler = createAppRouterSitemapRoute(sitemapName)
    return handler()
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
