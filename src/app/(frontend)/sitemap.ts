import type { MetadataRoute } from "next"
import { getActiveSitemaps } from "@/lib/sitemaps/config"
import { unstable_cache } from "next/cache"

/*************************************************************************/
/*  GENERATE MULTIPLE SITEMAPS FROM CONFIG
/*************************************************************************/

export async function generateSitemaps() {
  // Dynamically generate sitemap IDs from configuration
  const activeSitemaps = getActiveSitemaps()

  return activeSitemaps.map((_, index) => ({
    id: index,
  }))
}

/*************************************************************************/
/*  DYNAMIC SITEMAP GENERATION BY ID
/*************************************************************************/

export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {
  try {
    const activeSitemaps = getActiveSitemaps()
    const currentSitemapFile = activeSitemaps[id]

    if (!currentSitemapFile) {
      return []
    }

    const getSitemapEntries = unstable_cache(
      async (sitemapFile: string) => {
        const { generateSitemap } = await import("@/lib/sitemaps/generator")
        const result = await generateSitemap({ sitemapName: sitemapFile })

        return result.entries.map(entry => ({
          url: entry.loc,
          lastModified: entry.lastmod,
          changeFrequency:
            entry.changefreq as MetadataRoute.Sitemap[0]["changeFrequency"],
          priority: entry.priority,
        }))
      },
      [`sitemap-${currentSitemapFile}`, "sitemap-generation"],
      {
        tags: [
          `sitemap:${currentSitemapFile.replace("-sitemap.xml", "")}`,
          "sitemap:all",
        ],
        revalidate: 3600,
      }
    )

    return await getSitemapEntries(currentSitemapFile)
  } catch (error) {
    console.error(`Error generating sitemap ${id}:`, error)
    return []
  }
}
