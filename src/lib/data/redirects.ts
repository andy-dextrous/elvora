import { cache } from "@/lib/cache"

/*******************************************************/
/* Get Redirects - MIGRATED TO UNIVERSAL CACHE
/*******************************************************/

export const getRedirects = (depth = 1) =>
  cache.getCollection("redirects", {
    depth,
    limit: 0,
  })
