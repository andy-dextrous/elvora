/*************************************************************************/
/*  SITEMAP CONFIGURATION SYSTEM - TYPES & INTERFACES
/*************************************************************************/

export interface SitemapCollectionConfig {
  sitemap: string
  respectSEO: boolean
  priority: number
  changeFreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  includeInIndex: boolean
}

export interface SitemapConfig {
  default: SitemapCollectionConfig
  [collection: string]: SitemapCollectionConfig
}

/*************************************************************************/
/*  SITEMAP CONFIGURATION OBJECT
/*************************************************************************/

export const SITEMAP_CONFIG: SitemapConfig = {
  default: {
    sitemap: "pages-sitemap.xml",
    respectSEO: true,
    priority: 0.5,
    changeFreq: "weekly",
    includeInIndex: true,
  },

  // Collections
  pages: {
    sitemap: "pages-sitemap.xml",
    respectSEO: true,
    priority: 0.8,
    changeFreq: "weekly",
    includeInIndex: true,
  },
  posts: {
    sitemap: "posts-sitemap.xml",
    respectSEO: true,
    priority: 0.6,
    changeFreq: "weekly",
    includeInIndex: true,
  },
  services: {
    sitemap: "pages-sitemap.xml", // Services appear in pages sitemap
    respectSEO: true,
    priority: 0.7,
    changeFreq: "monthly",
    includeInIndex: true,
  },
  team: {
    sitemap: "", // Team members don't appear in sitemaps
    respectSEO: false,
    priority: 0.3,
    changeFreq: "yearly",
    includeInIndex: false,
  },
  testimonials: {
    sitemap: "", // Testimonials don't appear in sitemaps
    respectSEO: false,
    priority: 0.3,
    changeFreq: "yearly",
    includeInIndex: false,
  },
}

/*************************************************************************/
/*  SITEMAP CONFIGURATION FUNCTIONS
/*************************************************************************/

/**
 * Get sitemap configuration for a collection with fallback defaults
 */
export function getSitemapConfig(collection: string): SitemapCollectionConfig {
  return {
    ...SITEMAP_CONFIG.default,
    ...SITEMAP_CONFIG[collection],
  }
}

/**
 * Get all collections that belong to a specific sitemap
 */
export function getSitemapCollections(sitemapName: string): string[] {
  return Object.entries(SITEMAP_CONFIG)
    .filter(([collection, config]) => {
      // Skip the default config entry
      if (collection === "default") return false

      // Check if this collection belongs to the specified sitemap
      return config.sitemap === sitemapName && config.includeInIndex
    })
    .map(([collection]) => collection)
}

/**
 * Get all active sitemap files (those that have collections assigned)
 */
export function getActiveSitemaps(): string[] {
  const sitemaps = new Set<string>()

  Object.entries(SITEMAP_CONFIG).forEach(([collection, config]) => {
    if (collection !== "default" && config.sitemap && config.includeInIndex) {
      sitemaps.add(config.sitemap)
    }
  })

  return Array.from(sitemaps)
}

/**
 * Check if a collection should appear in sitemaps
 */
export function shouldIncludeInSitemap(collection: string): boolean {
  const config = getSitemapConfig(collection)
  return config.includeInIndex && config.sitemap !== ""
}

/**
 * Get sitemap cache tags for a collection (integrates with universal cache)
 */
export function getSitemapCacheTags(collection: string): string[] {
  const config = getSitemapConfig(collection)
  const tags: string[] = []

  if (config.sitemap) {
    // Add sitemap-specific tag
    const sitemapKey = config.sitemap.replace("-sitemap.xml", "")
    tags.push(`sitemap:${sitemapKey}`)

    // Add general sitemap tag for universal invalidation
    tags.push("sitemap:all")
  }

  return tags
}
