import { getServerSideSitemap } from "next-sitemap"
import { getPayload } from "payload"
import config from "@payload-config"
import { unstable_cache } from "next/cache"

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      "https://example.com"

    const results = await payload.find({
      collection: "pages",
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: "published",
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    // Fetch services
    const services = await payload.find({
      collection: "services",
      overrideAccess: false,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        _status: {
          equals: "published",
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    const defaultSitemap = [
      {
        loc: `${SITE_URL}/search`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/posts`,
        lastmod: dateFallback,
      },
    ]

    const pagesSitemap = results.docs
      ? results.docs
          .filter(page => Boolean(page?.slug))
          .map(page => {
            return {
              loc: page?.slug === "home" ? `${SITE_URL}/` : `${SITE_URL}/${page?.slug}`,
              lastmod: page.updatedAt || dateFallback,
            }
          })
      : []

    // Create sitemap entries for services
    const servicesSitemap = services.docs
      ? services.docs
          .filter(service => Boolean(service?.slug))
          .map(service => {
            return {
              loc: `${SITE_URL}/services/${service?.slug}`,
              lastmod: service.updatedAt || dateFallback,
            }
          })
      : []

    return [...defaultSitemap, ...pagesSitemap, ...servicesSitemap]
  },
  ["pages-sitemap"],
  {
    tags: ["sitemap:all", "pages-sitemap"], // Keep old tag for backward compatibility
  }
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
