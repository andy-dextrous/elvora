import { getPayload } from "payload"
import { unstable_cache } from "next/cache"
import configPromise from "@payload-config"
import type { Post } from "@/payload/payload-types"

/*************************************************************************/
/*  GET RECENT POSTS FOR LATEST ARTICLES
/*************************************************************************/

async function getRecentPostsInternal() {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: "posts",
    depth: 1,
    draft: false,
    limit: 3,
    overrideAccess: false,
    pagination: false,
    sort: "-publishedAt",
    where: {
      _status: {
        equals: "published",
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      heroImage: true,
      meta: {
        description: true,
      },
      publishedAt: true,
    },
  })

  return result.docs || ([] as Post[])
}

export const getRecentPosts = unstable_cache(getRecentPostsInternal, ["recent-posts"], {
  tags: ["posts"],
  revalidate: 3600, // Revalidate every hour
})
