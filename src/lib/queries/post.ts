import { getPayload } from "payload"
import { unstable_cache } from "next/cache"
import configPromise from "@payload-config"
import { Post } from "@/payload/payload-types"
import { draftMode } from "next/headers"

/*******************************************************/
/* Get Post By Slug
/*******************************************************/

async function getPostBySlugInternal({ slug }: { slug: string }) {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: "posts",
    draft,
    depth: 2,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
}

export const getPostBySlug = ({ slug }: { slug: string }) =>
  unstable_cache(async () => getPostBySlugInternal({ slug }), ["post", slug], {
    tags: ["posts", `post_${slug}`],
  })()

/*******************************************************/
/* Get All Posts
/*******************************************************/

async function getPostsInternal() {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: "posts",
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return result.docs || ([] as Post[])
}

export const getPosts = () =>
  unstable_cache(async () => getPostsInternal(), ["posts"], {
    tags: ["posts"],
  })()

/*******************************************************/
/* Get Related Posts by Categories
/*******************************************************/

async function getRelatedPostsInternal({
  categories,
  currentPostId,
}: {
  categories: string[]
  currentPostId: string
}) {
  const payload = await getPayload({ config: configPromise })

  // First try to get posts in the same categories
  let result = await payload.find({
    collection: "posts",
    draft: false,
    depth: 1,
    limit: 3,
    overrideAccess: false,
    pagination: false,
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
    select: {
      id: true,
      title: true,
      slug: true,
      heroImage: true,
      categories: true,
      meta: {
        description: true,
      },
      publishedAt: true,
    },
  })

  // If we don't have enough posts from same categories, fill with most recent
  if (result.docs.length < 3) {
    const remainingNeeded = 3 - result.docs.length
    const existingIds = result.docs.map(doc => doc.id)

    const additionalResult = await payload.find({
      collection: "posts",
      draft: false,
      depth: 1,
      limit: remainingNeeded,
      overrideAccess: false,
      pagination: false,
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
      select: {
        id: true,
        title: true,
        slug: true,
        heroImage: true,
        categories: true,
        meta: {
          description: true,
        },
        publishedAt: true,
      },
    })

    result.docs = [...result.docs, ...additionalResult.docs]
  }

  return result.docs || ([] as Post[])
}

export const getRelatedPosts = ({
  categories,
  currentPostId,
}: {
  categories: string[]
  currentPostId: string
}) =>
  unstable_cache(
    async () => getRelatedPostsInternal({ categories, currentPostId }),
    ["related-posts", currentPostId, ...categories.sort()],
    {
      tags: ["posts", "related-posts"],
    }
  )()
