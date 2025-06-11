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
  unstable_cache(async () => getPostsInternal(), ["all-posts"], {
    tags: ["posts"],
  })()
