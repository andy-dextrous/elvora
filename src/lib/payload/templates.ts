"use server"

import { getPayload } from "payload"
import configPromise from "@payload-config"
import { unstable_cache } from "next/cache"

/*************************************************************************/
/*  GET DEFAULT TEMPLATE FOR COLLECTION
/*************************************************************************/

export async function getDefaultTemplate(collection: string) {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })

      // Get routing settings to find assigned template
      const settings = await payload.findGlobal({
        slug: "settings",
        depth: 1,
      })

      const templateField =
        collection === "pages" ? "pagesDefaultTemplate" : `${collection}SingleTemplate`
      const templateId = (settings?.routing as any)?.[templateField]

      if (!templateId) {
        return null
      }

      const template = await payload.findByID({
        collection: "templates",
        id: typeof templateId === "object" ? templateId.id : templateId,
        depth: 2,
      })

      return template || null
    },
    [`default-template-${collection}`],
    {
      tags: ["templates", `default-template-${collection}`, "settings"],
    }
  )()
}

/*************************************************************************/
/*  GET ALL TEMPLATES FOR COLLECTION
/*************************************************************************/

export async function getTemplatesForCollection(collection: string) {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })

      const result = await payload.find({
        collection: "templates",
        depth: 2,
        sort: "name",
        limit: 100,
      })

      const defaultTemplate = await getDefaultTemplate(collection)

      return {
        templates: result.docs,
        defaultTemplate,
      }
    },
    [`templates-${collection}`],
    {
      tags: ["templates", `templates-${collection}`, "settings"],
    }
  )()
}
