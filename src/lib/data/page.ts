import { cache } from "@/lib/cache"

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
