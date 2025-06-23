import type { MetadataRoute } from "next"
import { getActiveSitemaps } from "@/lib/sitemaps/config"

/*************************************************************************/
/*  DYNAMIC ROBOTS.TXT GENERATION (APP ROUTER NATIVE)
/*************************************************************************/

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = (
    process.env.NEXT_PUBLIC_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "https://example.com"
  ).replace(/\/$/, "")

  try {
    // Get all active sitemaps from configuration
    const activeSitemaps = getActiveSitemaps()

    // Build robots object
    return generateRobotsObject(siteUrl, activeSitemaps)
  } catch (error) {
    console.warn("Failed to generate robots.txt:", error)

    // Fallback robots configuration
    return generateFallbackRobots(siteUrl)
  }
}

/*************************************************************************/
/*  ROBOTS OBJECT GENERATION
/*************************************************************************/

function generateRobotsObject(siteUrl: string, sitemaps: string[]): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === "production"
  const isVercelProduction = process.env.VERCEL_ENV === "production"

  // Determine if we should allow crawling
  const allowCrawling = isProduction && isVercelProduction

  if (allowCrawling) {
    // Production: Allow crawling with sitemaps
    const sitemapUrls = [
      `${siteUrl}/sitemap.xml`, // Main sitemap index
      ...sitemaps.map(sitemapName => `${siteUrl}/${sitemapName}`), // Individual sitemaps
    ]

    return {
      rules: {
        userAgent: "*",
        allow: "/",
        crawlDelay: 1, // Be respectful to crawlers
      },
      sitemap: sitemapUrls,
      host: siteUrl,
    }
  } else {
    // Non-production: Block all crawling
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    }
  }
}

function generateFallbackRobots(siteUrl: string): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === "production"

  if (isProduction) {
    // Production fallback with hardcoded sitemaps
    return {
      rules: {
        userAgent: "*",
        allow: "/",
        crawlDelay: 1,
      },
      sitemap: [
        `${siteUrl}/sitemap.xml`,
        `${siteUrl}/pages-sitemap.xml`,
        `${siteUrl}/posts-sitemap.xml`,
      ],
      host: siteUrl,
    }
  } else {
    // Non-production: Block crawling
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    }
  }
}
