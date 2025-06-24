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

/*************************************************************************/
/*  GET POSTS FOR ARCHIVE WITH PAGINATION - NEW FOR BLOG SECTIONS
/*************************************************************************/

export async function getPostsArchive({
  limit = 12,
  page = 1,
  categoryFilter,
}: {
  limit?: number
  page?: number
  categoryFilter?: string[]
} = {}): Promise<Post[]> {
  // Build where conditions
  const whereConditions: any = {
    _status: {
      equals: "published",
    },
  }

  // Add category filter if provided
  if (categoryFilter && categoryFilter.length > 0) {
    whereConditions.categories = {
      in: categoryFilter,
    }
  }

  return cache.getCollection("posts", {
    limit,
    page,
    sort: "-publishedAt",
    where: whereConditions,
    depth: 1,
    overrideAccess: false,
  })
}

/*************************************************************************/
/*  GET RELATED POSTS FOR SECTION - NEW FOR BLOG SECTIONS
/*************************************************************************/

export async function getRelatedPostsByIds({
  postIds,
  maxPosts = 3,
}: {
  postIds: string[]
  maxPosts?: number
}): Promise<Post[]> {
  if (postIds.length === 0) {
    return []
  }

  const posts = await cache.getCollection("posts", {
    limit: maxPosts,
    where: {
      and: [
        {
          _status: {
            equals: "published",
          },
        },
        {
          id: {
            in: postIds,
          },
        },
      ],
    },
    depth: 1,
    overrideAccess: false,
  })

  return posts
}

export async function getRelatedPostsForSection({
  currentPostId,
  maxPosts = 3,
}: {
  currentPostId: string
  maxPosts?: number
}): Promise<Post[]> {
  // Get the current post to extract its categories
  const currentPost = await cache.getByID("posts", currentPostId)

  if (!currentPost?.categories) {
    return []
  }

  const categoryIds = currentPost.categories
    .filter((cat: any) => typeof cat === "object" && cat !== null)
    .map((cat: any) => cat.id)
    .filter(Boolean)

  if (categoryIds.length === 0) {
    return []
  }

  return getRelatedPosts({
    categories: categoryIds,
    currentPostId,
  })
}

/*************************************************************************/
/*  GET POST BY SLUG - ENHANCED FOR BLOG SECTIONS
/*************************************************************************/

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return cache.getBySlug("posts", slug)
}

/*************************************************************************/
/*  GET POST BY ID - NEW FOR BLOG SECTIONS
/*************************************************************************/

export async function getPostById(id: string): Promise<Post | null> {
  return cache.getByID("posts", id)
}

/*************************************************************************/
/*  GET POSTS WITH PAGINATION - DIRECT PAYLOAD QUERY FOR PAGINATION INFO
/*************************************************************************/

export async function getPostsWithPagination({
  limit = 12,
  page = 1,
  categoryFilter,
}: {
  limit?: number
  page?: number
  categoryFilter?: string[]
} = {}): Promise<{
  docs: Post[]
  totalDocs: number
  totalPages: number
  page: number
}> {
  const { getPayload } = await import("payload")
  const configPromise = await import("@payload-config")
  const payload = await getPayload({ config: configPromise.default })

  const whereConditions: any = {
    _status: {
      equals: "published",
    },
  }

  if (categoryFilter && categoryFilter.length > 0) {
    whereConditions.categories = {
      in: categoryFilter,
    }
  }

  const result = await payload.find({
    collection: "posts",
    limit,
    page,
    sort: "-publishedAt",
    where: whereConditions,
    depth: 1,
    overrideAccess: false,
  })

  return {
    docs: result.docs as Post[],
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page || 1,
  }
}
