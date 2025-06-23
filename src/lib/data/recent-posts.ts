import { cache } from "@/lib/cache"

/*************************************************************************/
/*  GET RECENT POSTS FOR LATEST ARTICLES - MIGRATED TO UNIVERSAL CACHE
/*************************************************************************/

export const getRecentPosts = async () => {
  return cache.getCollection("posts", {
    limit: 3,
    sort: "-publishedAt",
    where: {
      _status: {
        equals: "published",
      },
    },
    depth: 1,
    overrideAccess: false,
  })
}
