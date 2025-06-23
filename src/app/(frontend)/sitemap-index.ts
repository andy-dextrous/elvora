import type { MetadataRoute } from "next"
import { getActiveSitemaps } from "@/lib/sitemaps/config"

/*************************************************************************/
/*  SITEMAP INDEX GENERATION
/*************************************************************************/

export default async function sitemapIndex(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (
    process.env.NEXT_PUBLIC_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "https://example.com"
  ).replace(/\/$/, "")

  try {
    // Get all active sitemaps from configuration
    const activeSitemaps = getActiveSitemaps()

    // Generate sitemap index entries
    const sitemapEntries = activeSitemaps.map((_, index) => ({
      url: `${siteUrl}/sitemap/${index}.xml`,
      lastModified: new Date(),
    }))

    return sitemapEntries
  } catch (error) {
    console.error("Error generating sitemap index:", error)

    // Fallback to hardcoded entries
    return [
      {
        url: `${siteUrl}/sitemap/0.xml`,
        lastModified: new Date(),
      },
      {
        url: `${siteUrl}/sitemap/1.xml`,
        lastModified: new Date(),
      },
    ]
  }
}
