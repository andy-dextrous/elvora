const { SITEMAP_CONFIG, getActiveSitemaps } = require("./config")

/*************************************************************************/
/*  NEXT-SITEMAP INTEGRATION
/*************************************************************************/

/**
 * Generate next-sitemap configuration from our SITEMAP_CONFIG
 * This ensures single source of truth for sitemap configuration
 */
function generateNextSitemapConfig() {
  const SITE_URL =
    process.env.NEXT_PUBLIC_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "https://example.com"

  try {
    // Get active sitemaps from our configuration
    const activeSitemaps = getActiveSitemaps()

    // Generate additional sitemaps list
    const additionalSitemaps = activeSitemaps.map(sitemap => `${SITE_URL}/${sitemap}`)

    // Generate exclude patterns for individual sitemaps (we handle them dynamically)
    const excludePatterns = activeSitemaps.map(sitemap => `/${sitemap}`)

    return {
      siteUrl: SITE_URL,
      generateRobotsTxt: true,

      // Exclude our dynamic sitemaps from next-sitemap's generation
      // We handle these through our dynamic route system
      exclude: [
        ...excludePatterns,
        "/*", // Exclude dynamic routes
        "/admin/*", // Exclude admin
      ],

      robotsTxtOptions: {
        policies: [
          {
            userAgent: "*",
            disallow: "/admin/*",
          },
        ],
        additionalSitemaps,
      },

      // Optional: Transform function for any pages next-sitemap does generate
      transform: async (config, path) => {
        return {
          loc: path,
          changefreq: "weekly",
          priority: 0.5,
          lastmod: new Date().toISOString(),
        }
      },
    }
  } catch (error) {
    console.warn("Failed to generate next-sitemap config from SITEMAP_CONFIG:", error)

    // Fallback configuration
    return {
      siteUrl: SITE_URL,
      generateRobotsTxt: true,
      exclude: ["/pages-sitemap.xml", "/posts-sitemap.xml", "/*", "/admin/*"],
      robotsTxtOptions: {
        policies: [
          {
            userAgent: "*",
            disallow: "/admin/*",
          },
        ],
        additionalSitemaps: [
          `${SITE_URL}/pages-sitemap.xml`,
          `${SITE_URL}/posts-sitemap.xml`,
        ],
      },
    }
  }
}

/*************************************************************************/
/*  VALIDATION HELPERS
/*************************************************************************/

/**
 * Validate that our sitemap configuration is compatible with next-sitemap
 */
function validateSitemapConfig() {
  const activeSitemaps = getActiveSitemaps()
  const issues = []

  if (activeSitemaps.length === 0) {
    issues.push("No active sitemaps found in SITEMAP_CONFIG")
  }

  // Check for duplicate sitemaps
  const duplicates = activeSitemaps.filter(
    (sitemap, index) => activeSitemaps.indexOf(sitemap) !== index
  )
  if (duplicates.length > 0) {
    issues.push(`Duplicate sitemaps found: ${duplicates.join(", ")}`)
  }

  return {
    isValid: issues.length === 0,
    issues,
    activeSitemaps,
  }
}

/*************************************************************************/
/*  EXPORTS
/*************************************************************************/

module.exports = {
  generateNextSitemapConfig,
  validateSitemapConfig,
}
