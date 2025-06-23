import { cache } from "@/lib/cache"
import type { Post } from "@/payload/payload-types"

/*************************************************************************/
/*  GET RECENT POSTS FOR LATEST ARTICLES - MIGRATED TO UNIVERSAL CACHE
/*************************************************************************/

export async function getRecentPosts(): Promise<Post[]> {
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

/*************************************************************************/
/*  GET RELATED POSTS BY CATEGORIES - MIGRATED TO UNIVERSAL CACHE
/*************************************************************************/

export async function getRelatedPosts({
  categories,
  currentPostId,
}: {
  categories: string[]
  currentPostId: string
}): Promise<Post[]> {
  // First try to get posts in the same categories
  const categoryPosts = await cache.getCollection("posts", {
    limit: 3,
    sort: "-publishedAt",
    where: {
      and: [
        {
          _status: {
            equals: "published",
          },
        },
        {
          id: {
            not_equals: currentPostId,
          },
        },
        {
          categories: {
            in: categories,
          },
        },
      ],
    },
    depth: 1,
    overrideAccess: false,
  })

  // If we don't have enough posts from same categories, fill with most recent
  if (categoryPosts.length < 3) {
    const remainingNeeded = 3 - categoryPosts.length
    const existingIds = categoryPosts.map((doc: any) => doc.id)

    const additionalPosts = await cache.getCollection("posts", {
      limit: remainingNeeded,
      sort: "-publishedAt",
      where: {
        and: [
          {
            _status: {
              equals: "published",
            },
          },
          {
            id: {
              not_in: [...existingIds, currentPostId],
            },
          },
        ],
      },
      depth: 1,
      overrideAccess: false,
    })

    return [...categoryPosts, ...additionalPosts]
  }

  return categoryPosts
}
