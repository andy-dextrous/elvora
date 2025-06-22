import configPromise from "@payload-config"
import { getPayload } from "payload"
import { unstable_cache } from "next/cache"
import { frontendCollections } from "@/payload/collections/frontend"

/*******************************************************/
/* Simple, Universal Route API
/*******************************************************/

async function getDocumentByURIInternal(uri: string, draft: boolean = false) {
  const payload = await getPayload({ config: configPromise })

  // Homepage URI is empty string
  const normalizedURI = uri === "/" ? "" : uri.replace(/\/+$/, "")

  for (const collection of frontendCollections) {
    try {
      const result = await payload.find({
        collection: collection.slug as any,
        where: { uri: { equals: normalizedURI } },
        limit: 1,
        depth: 5,
        draft,
        overrideAccess: true,
      })

      if (result.docs?.[0]) {
        return {
          document: result.docs[0],
          collection: collection.slug,
        }
      }
    } catch (error) {
      continue
    }
  }

  return null
}

/*******************************************************/
/* Static Generation Support
/*******************************************************/

async function getAllURIsInternal(draft: boolean = false) {
  const payload = await getPayload({ config: configPromise })
  const uris: string[] = []

  for (const collection of frontendCollections) {
    try {
      const result = await payload.find({
        collection: collection.slug as any,
        where: {
          uri: { exists: true },
          _status: { equals: "published" },
        },
        limit: 1000,
        depth: 0,
        draft,
        select: { uri: true },
      })

      result.docs.forEach((doc: any) => {
        if (doc.uri) {
          uris.push(doc.uri)
        }
      })
    } catch (error) {
      continue
    }
  }

  return [...new Set(uris)]
}

/*******************************************************/
/* Cached Functions
/*******************************************************/

export const getAllURIs = (draft: boolean = false) =>
  unstable_cache(
    () => getAllURIsInternal(draft),
    ["all-uris", draft ? "draft" : "published"],
    { tags: ["routes"] }
  )()

export const getDocumentByURI = (uri: string, draft: boolean = false) =>
  unstable_cache(
    () => getDocumentByURIInternal(uri, draft),
    ["route", uri, draft ? "draft" : "published"],
    { tags: [`uri:${uri}`] }
  )()
