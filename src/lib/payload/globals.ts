import { Config, getPayload } from "payload"
import { unstable_cache } from "next/cache"
import configPromise from "@payload-config"

type Global = keyof Config["globals"]

/*******************************************************/
/* Get Settings
/*******************************************************/

async function getSettingsInternal() {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.findGlobal({
    slug: "settings",
    depth: 4,
    locale: "all",
    fallbackLocale: false,
    overrideAccess: false,
    showHiddenFields: true,
  })

  return result
}

export const getSettings = () =>
  unstable_cache(async () => getSettingsInternal(), ["settings"], {
    tags: ["global_settings"],
  })()

/*******************************************************/
/* Get Global
/*******************************************************/

async function getGlobal(slug: Global, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug,
    depth,
  })

  return global
}

/*******************************************************/
/* Get cached global
/*******************************************************/

export const getCachedGlobal = (slug: Global, depth = 0) =>
  unstable_cache(async () => getGlobal(slug, depth), [slug], {
    tags: [`global_${slug}`],
  })()
