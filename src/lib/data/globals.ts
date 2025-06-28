import { cache } from "@/lib/cache"
import type { Config } from "@/payload/payload-types"

type Global = keyof Config["globals"]

/*******************************************************/
/* Get Settings - MIGRATED TO UNIVERSAL CACHE
/*******************************************************/

export const getSettings = () => cache.getGlobal("settings", 4)

/*******************************************************/
/* Get Global - MIGRATED TO UNIVERSAL CACHE
/*******************************************************/

export const getGlobal = (slug: Global, depth = 0) => cache.getGlobal(slug, depth)

/*******************************************************/
/* Get Header
/*******************************************************/

export const getHeader = async () => {
  const settings = await cache.getGlobal("settings", 5)
  return settings.header
}

/*******************************************************/
/* Get Footer
/*******************************************************/

export const getFooter = async () => {
  const settings = await cache.getGlobal("settings", 5)
  return settings.footer
}

/*******************************************************/
/* Get Homepage From Settings - MIGRATED TO UNIVERSAL CACHE
/*******************************************************/

export const getHomepage = async () => {
  try {
    const settings = await cache.getGlobal("settings", 5)
    const homepage = settings.routing?.homepage

    if (homepage?.slug) {
      return cache.getBySlug("pages", homepage.slug)
    }
  } catch (error) {
    console.error(error)
  }

  return null
}
