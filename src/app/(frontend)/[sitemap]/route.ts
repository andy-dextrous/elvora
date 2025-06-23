import { createSitemapRoute } from "@/lib/sitemaps"
import { getActiveSitemaps } from "@/lib/sitemaps/config"
import { notFound } from "next/navigation"

/*************************************************************************/
/*  DYNAMIC SITEMAP ROUTE HANDLER
/*************************************************************************/

export async function GET(request: Request, { params }: { params: { sitemap: string } }) {
  const sitemapName = `${params.sitemap}.xml`

  // Verify this is a valid sitemap
  const activeSitemaps = getActiveSitemaps()
  if (!activeSitemaps.includes(sitemapName)) {
    return notFound()
  }

  // Create and execute the sitemap route handler
  const handler = createSitemapRoute(sitemapName)
  return handler()
}

/*************************************************************************/
/*  STATIC GENERATION SUPPORT
/*************************************************************************/

export async function generateStaticParams() {
  try {
    const activeSitemaps = getActiveSitemaps()

    return activeSitemaps.map(sitemap => ({
      sitemap: sitemap.replace(".xml", ""), // Remove .xml extension for route
    }))
  } catch (error) {
    console.warn("Failed to generate sitemap static params:", error)

    // Fallback to known sitemaps if config fails
    return [{ sitemap: "pages-sitemap" }, { sitemap: "posts-sitemap" }]
  }
}
