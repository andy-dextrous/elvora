"use server"

import { cache } from "@/lib/cache"

/*************************************************************************/
/*  GET DEFAULT TEMPLATE FOR COLLECTION - MIGRATED TO UNIVERSAL CACHE
/*************************************************************************/

export async function getDefaultTemplate(collection: string) {
  const settings = await cache.getGlobal("settings", 1)

  const templateField =
    collection === "pages" ? "pagesDefaultTemplate" : `${collection}SingleTemplate`
  const templateId = (settings?.routing as any)?.[templateField]?.id

  if (!templateId) {
    return null
  }

  const template = await cache.getByID("templates", templateId)

  return template || null
}

/*************************************************************************/
/*  GET ALL TEMPLATES FOR COLLECTION - MIGRATED TO UNIVERSAL CACHE
/*************************************************************************/

export async function getTemplatesForCollection(collection: string) {
  const templates = await cache.getCollection("templates", {
    sort: "name",
    limit: 100,
    depth: 2,
  })

  const defaultTemplate = await getDefaultTemplate(collection)

  return {
    templates,
    defaultTemplate,
  }
}
