import { cache } from "@/lib/cache"
import { getSitemapConfig, getSitemapCollections } from "./config"
import {
  filterDocumentsForSitemap,
  createSitemapEntry,
  getSEOFieldSelection,
  validateSEOFields,
  type SitemapEntry,
  type DocumentForSEO,
} from "./seo-filters"

/*************************************************************************/
/*  UNIVERSAL SITEMAP GENERATOR - TYPES & INTERFACES
/*************************************************************************/

export interface GenerateSitemapOptions {
  sitemapName: string
  siteUrl?: string
  includeStatic?: boolean
}

export interface SitemapGenerationResult {
  entries: SitemapEntry[]
  collections: string[]
  totalCount: number
  filteredCount: number
}

/*************************************************************************/
/*  SITE URL RESOLUTION
/*************************************************************************/

function getSiteUrl(providedUrl?: string): string {
  if (providedUrl) return providedUrl.replace(/\/$/, "") // Remove trailing slash

  return (
    process.env.NEXT_PUBLIC_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "https://example.com"
  ).replace(/\/$/, "") // Remove trailing slash
}

/*************************************************************************/
/*  STATIC SITEMAP ENTRIES
/*************************************************************************/

function getStaticSitemapEntries(siteUrl: string): SitemapEntry[] {
  const dateFallback = new Date().toISOString()

  return [
    {
      loc: `${siteUrl}/search`,
      lastmod: dateFallback,
      priority: 0.5,
      changefreq: "weekly",
    },
    {
      loc: `${siteUrl}/posts`,
      lastmod: dateFallback,
      priority: 0.8,
      changefreq: "daily",
    },
  ]
}

/*************************************************************************/
/*  COLLECTION DOCUMENT FETCHING
/*************************************************************************/

async function fetchCollectionDocuments(collection: string): Promise<DocumentForSEO[]> {
  try {
    const documents = await cache.getCollection(collection as any, {
      where: { _status: { equals: "published" } },
      limit: 1000,
      depth: 0,
      select: getSEOFieldSelection(),
    })

    // Filter and validate documents
    return documents.filter(validateSEOFields).filter(doc => doc.uri) // Only include documents with URIs
  } catch (error) {
    console.warn(`Failed to fetch documents for collection ${collection}:`, error)
    return []
  }
}

/*************************************************************************/
/*  UNIVERSAL SITEMAP GENERATOR
/*************************************************************************/

/**
 * Generate sitemap entries for a specific sitemap using universal cache and URI engine
 */
export async function generateSitemap(
  options: GenerateSitemapOptions
): Promise<SitemapGenerationResult> {
  const { sitemapName, includeStatic = false } = options
  const siteUrl = getSiteUrl(options.siteUrl)

  // Get collections that belong to this sitemap
  const collections = getSitemapCollections(sitemapName)
  const allEntries: SitemapEntry[] = []
  let totalCount = 0
  let filteredCount = 0

  // Add static entries for pages-sitemap
  if (includeStatic && sitemapName === "pages-sitemap.xml") {
    const staticEntries = getStaticSitemapEntries(siteUrl)
    allEntries.push(...staticEntries)
  }

  // Process each collection
  for (const collection of collections) {
    const config = getSitemapConfig(collection)
    const documents = await fetchCollectionDocuments(collection)

    totalCount += documents.length

    // Apply SEO filtering
    const seoFilteredDocs = filterDocumentsForSitemap(documents)
    filteredCount += seoFilteredDocs.length

    // Create sitemap entries
    const entries = seoFilteredDocs.map(doc =>
      createSitemapEntry(doc, siteUrl, config.priority, config.changeFreq)
    )

    allEntries.push(...entries)
  }

  // Sort by priority (highest first), then by lastmod (newest first)
  allEntries.sort((a, b) => {
    const priorityDiff = (b.priority || 0.5) - (a.priority || 0.5)
    if (priorityDiff !== 0) return priorityDiff

    return new Date(b.lastmod).getTime() - new Date(a.lastmod).getTime()
  })

  return {
    entries: allEntries,
    collections,
    totalCount,
    filteredCount,
  }
}

/*************************************************************************/
/*  BATCH SITEMAP GENERATION
/*************************************************************************/

/**
 * Generate all active sitemaps at once (useful for cache warming)
 */
export async function generateAllSitemaps(
  siteUrl?: string
): Promise<Record<string, SitemapGenerationResult>> {
  const { getActiveSitemaps } = await import("./config")
  const activeSitemaps = getActiveSitemaps()
  const results: Record<string, SitemapGenerationResult> = {}

  await Promise.all(
    activeSitemaps.map(async sitemapName => {
      try {
        const result = await generateSitemap({
          sitemapName,
          siteUrl,
          includeStatic: sitemapName === "pages-sitemap.xml",
        })
        results[sitemapName] = result
      } catch (error) {
        console.warn(`Failed to generate sitemap ${sitemapName}:`, error)
        results[sitemapName] = {
          entries: [],
          collections: [],
          totalCount: 0,
          filteredCount: 0,
        }
      }
    })
  )

  return results
}

/*************************************************************************/
/*  SITEMAP VALIDATION & DEBUGGING
/*************************************************************************/

/**
 * Validate sitemap generation results
 */
export function validateSitemapResult(result: SitemapGenerationResult): {
  isValid: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  if (result.entries.length === 0) {
    warnings.push("Sitemap is empty")
  }

  if (result.totalCount > 0 && result.filteredCount === 0) {
    warnings.push("All documents were filtered out by SEO settings")
  }

  const duplicateUrls = new Map<string, number>()
  result.entries.forEach(entry => {
    const count = duplicateUrls.get(entry.loc) || 0
    duplicateUrls.set(entry.loc, count + 1)
  })

  const duplicates = Array.from(duplicateUrls.entries())
    .filter(([, count]) => count > 1)
    .map(([url]) => url)

  if (duplicates.length > 0) {
    warnings.push(`Duplicate URLs found: ${duplicates.join(", ")}`)
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  }
}

/*************************************************************************/
/*  APP ROUTER COMPATIBILITY FUNCTIONS
/*************************************************************************/

/**
 * Convert sitemap generation result to App Router MetadataRoute.Sitemap format
 */
export function toAppRouterFormat(result: SitemapGenerationResult): {
  url: string
  lastModified?: Date
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never"
  priority?: number
}[] {
  return result.entries.map(entry => ({
    url: entry.loc,
    lastModified: new Date(entry.lastmod),
    changeFrequency: entry.changefreq as any,
    priority: entry.priority,
  }))
}
