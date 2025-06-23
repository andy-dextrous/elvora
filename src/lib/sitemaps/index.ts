/*************************************************************************/
/*  SITEMAPS MODULE - MAIN EXPORTS
/*************************************************************************/

// Configuration
export {
  SITEMAP_CONFIG,
  getSitemapConfig,
  getSitemapCollections,
  getActiveSitemaps,
  shouldIncludeInSitemap,
  getSitemapCacheTags,
  type SitemapCollectionConfig,
  type SitemapConfig,
} from "./config"

// SEO Filtering
export {
  shouldIncludeInSitemap as shouldIncludeInSitemapSEO,
  isExternalCanonical,
  getCanonicalUrl,
  filterDocumentsForSitemap,
  createSitemapEntry,
  getSEOFieldSelection,
  validateSEOFields,
  type SEOFieldsCheck,
  type DocumentForSEO,
  type SitemapEntry,
} from "./seo-filters"

// Sitemap Generation
export {
  generateSitemap,
  generateAllSitemaps,
  validateSitemapResult,
  toNextSitemapFormat,
  type GenerateSitemapOptions,
  type SitemapGenerationResult,
} from "./generator"

// Route Factory
export {
  createSitemapRoute,
  createPagesSitemapRoute,
  createPostsSitemapRoute,
  createCollectionSitemapRoute,
  createSitemapIndexRoute,
  testSitemapRoute,
} from "./route-factory"

/*************************************************************************/
/*  CONVENIENCE FUNCTIONS
/*************************************************************************/

/**
 * Quick function to generate a sitemap for a collection
 */
export async function quickGenerateSitemap(
  collectionOrSitemapName: string,
  siteUrl?: string
) {
  const { generateSitemap } = await import("./generator")

  // If it ends with .xml, treat as sitemap name, otherwise as collection name
  const sitemapName = collectionOrSitemapName.endsWith(".xml")
    ? collectionOrSitemapName
    : `${collectionOrSitemapName}-sitemap.xml`

  return generateSitemap({
    sitemapName,
    siteUrl,
    includeStatic: sitemapName === "pages-sitemap.xml",
  })
}

/**
 * Debug function to test all active sitemaps
 */
export async function debugAllSitemaps() {
  const { getActiveSitemaps } = await import("./config")
  const { testSitemapRoute } = await import("./route-factory")

  const activeSitemaps = getActiveSitemaps()
  const results: Record<string, any> = {}

  for (const sitemapName of activeSitemaps) {
    try {
      const result = await testSitemapRoute(sitemapName)
      results[sitemapName] = result
    } catch (error) {
      results[sitemapName] = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  return results
}
