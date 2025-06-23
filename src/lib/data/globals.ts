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
/* Get Homepage From Settings - MIGRATED TO UNIVERSAL CACHE
/*******************************************************/

export const getHomepage = async () => {
  try {
    const settings = await cache.getGlobal("settings", 5)
    const homepage = settings.routing?.homepage

    if (homepage?.id) {
      return cache.getBySlug("pages", homepage.slug || homepage.id)
    }
  } catch (error) {
    // Settings not found, using fallback homepage detection
  }

  return null
}
