import configPromise from "@payload-config"
import { getPayload } from "payload"
import { unstable_cache } from "next/cache"

/*******************************************************/
/* Get Page By Slug
/*******************************************************/

async function getPageBySlugInternal({ slug, draft }: { slug: string; draft: boolean }) {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: "pages",
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
}

export const getPageBySlug = ({ slug, draft }: { slug: string; draft: boolean }) =>
  unstable_cache(
    async () => getPageBySlugInternal({ slug, draft }),
    ["page", slug, draft ? "draft" : "published"],
    {
      tags: ["pages", `page_${slug}`],
    }
  )()

/*******************************************************/
/* Get All Pages
/*******************************************************/

async function getAllPagesInternal() {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: "pages",
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return result.docs || []
}

export const getAllPages = () =>
  unstable_cache(async () => getAllPagesInternal(), ["all-pages"], {
    tags: ["pages"],
  })()
