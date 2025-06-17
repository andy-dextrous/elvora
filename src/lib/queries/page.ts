import configPromise from "@payload-config"
import { getPayload } from "payload"
import { unstable_cache } from "next/cache"

/*******************************************************/
/* Get Homepage From Settings
/*******************************************************/

async function getHomepageFromSettingsInternal() {
  const payload = await getPayload({ config: configPromise })

  try {
    const settings = await payload.findGlobal({
      slug: "settings",
      depth: 2,
    })

    if (settings.routing?.homepage && typeof settings.routing.homepage === "object") {
      return settings.routing.homepage
    }
  } catch (error) {
    console.log("Settings not found, using fallback homepage detection")
  }

  return null
}

export const getHomepageFromSettings = () =>
  unstable_cache(
    async () => getHomepageFromSettingsInternal(),
    ["homepage-from-settings"],
    {
      tags: ["settings", "homepage"],
    }
  )()

/*******************************************************/
/* Get Routing Settings
/*******************************************************/

async function getRoutingSettingsInternal() {
  const payload = await getPayload({ config: configPromise })

  try {
    const settings = await payload.findGlobal({
      slug: "settings",
      depth: 1,
    })

    return settings.routing || {}
  } catch (error) {
    console.log("Settings not found, using default routing")
    return {}
  }
}

export const getRoutingSettings = () =>
  unstable_cache(async () => getRoutingSettingsInternal(), ["routing-settings"], {
    tags: ["settings", "routing"],
  })()

/*******************************************************/
/* Get Page By Slug
/*******************************************************/

async function getPageBySlugInternal({ slug, draft }: { slug: string; draft: boolean }) {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: "pages",
    draft,
    depth: 5,
    limit: 1,
    pagination: false,
    overrideAccess: true,
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
    depth: 5,
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
