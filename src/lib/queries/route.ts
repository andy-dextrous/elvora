"use server"

import { BlocksField, getPayload } from "payload"
import configPromise from "@payload-config"
import { unstable_cache } from "next/cache"
import { getHomepageFromSettings, getRoutingSettings } from "./page"
import { getEffectiveCollectionSlug, getFrontendCollections } from "@/utilities/routing"
import type { Config, Page } from "@/payload/payload-types"

type CollectionDocument = Config["collections"][keyof Config["collections"]]

interface RouteResult {
  document: CollectionDocument
  collection: string
  fullSlug: string
  type: "homepage" | "page" | "single"
  sections: BlocksField[]
}

/*************************************************************************/
/*  GET ROUTE - MAIN URL RESOLVER
/*************************************************************************/

export const getRoute = unstable_cache(
  async (slug: string): Promise<RouteResult | null> => {
    const routingSettings = await getRoutingSettings()

    // Is homepage?
    if (slug === "") {
      const homepage = await getHomepageFromSettings()

      if (homepage) {
        const sections = homepage.sections as unknown as BlocksField[]

        return {
          document: homepage,
          collection: "pages",
          fullSlug: "",
          type: "homepage",
          sections,
        }
      }
    }

    // Is page?
    const page = await findPageBySlug(slug)

    if (page) {
      const sections = await getTemplateForDocument(page, "pages", routingSettings)
      return {
        document: page,
        collection: "pages",
        fullSlug: slug,
        type: "page",
        sections,
      }
    }

    // Is other collection document?
    const slugParts = slug.split("/").filter(Boolean)

    if (slugParts.length === 2) {
      const [collectionSlug, docSlug] = slugParts
      const collectionResult = await findCollectionDocument(
        collectionSlug,
        docSlug,
        routingSettings
      )
      if (collectionResult) {
        return collectionResult
      }
    }

    return null
  },
  ["route"],
  {
    tags: ["routing", "documents"],
    revalidate: 60,
  }
)

/*************************************************************************/
/*  GET ALL ROUTES FOR STATIC GENERATION
/*************************************************************************/

export const getAllRoutes = unstable_cache(
  async (): Promise<string[]> => {
    const payload = await getPayload({ config: configPromise })
    const routingSettings = await getRoutingSettings()
    const routes: string[] = []

    // Add homepage (empty route)
    routes.push("")

    // Get all pages
    const pagesResult = await payload.find({
      collection: "pages",
      where: {
        _status: { equals: "published" },
      },
      limit: 1000,
      depth: 0,
    })

    // Add page routes
    pagesResult.docs.forEach((page: any) => {
      if (page.slug && page.slug !== "home") {
        routes.push(page.slug)
      }
    })

    // Add collection document routes
    const frontendCollections = getFrontendCollections()
    const collections = frontendCollections.map(collection => collection.slug)

    // Collections that have draft/publish workflow (have _status field)
    const collectionsWithStatus = ["posts", "services"]

    for (const collectionSlug of collections) {
      const effectiveSlug = getEffectiveCollectionSlug(collectionSlug, {
        routing: routingSettings,
      })

      // Add individual document routes with conditional _status filtering
      const hasStatusField = collectionsWithStatus.includes(collectionSlug)

      const collectionResult = await payload.find({
        collection: collectionSlug as keyof Config["collections"],
        where: hasStatusField
          ? {
              _status: { equals: "published" },
            }
          : {},
        limit: 1000,
        depth: 0,
      })

      collectionResult.docs.forEach((doc: any) => {
        if (doc.slug) {
          routes.push(`${effectiveSlug}/${doc.slug}`)
        }
      })
    }

    return routes
  },
  ["all-routes"],
  {
    tags: ["routing", "static-generation"],
    revalidate: 3600,
  }
)

/*************************************************************************/
/*  FIND PAGE BY SLUG (SUPPORTS PARENT/CHILD)
/*************************************************************************/

async function findPageBySlug(slug: string): Promise<Page | null> {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: "pages",
    where: {
      slug: { equals: slug },
    },
    limit: 1,
    depth: 2,
  })

  return result.docs[0] || null
}

/*************************************************************************/
/*  FIND COLLECTION DOCUMENT
/*************************************************************************/

async function findCollectionDocument(
  collectionSlug: string,
  docSlug: string,
  routingSettings: any
): Promise<RouteResult | null> {
  const payload = await getPayload({ config: configPromise })

  // Find which collection this slug belongs to
  const frontendCollections = getFrontendCollections()
  const collections = frontendCollections.map(collection => collection.slug)

  for (const actualCollection of collections) {
    const effectiveSlug = getEffectiveCollectionSlug(actualCollection, {
      routing: routingSettings,
    })

    if (effectiveSlug === collectionSlug) {
      // Found matching collection, query for document
      const result = await payload.find({
        collection: actualCollection as keyof Config["collections"],
        where: {
          slug: { equals: docSlug },
        },
        limit: 1,
        depth: 2,
      })

      if (result.docs[0]) {
        const sections = await getTemplateForDocument(
          result.docs[0],
          actualCollection,
          routingSettings
        )
        return {
          document: result.docs[0],
          collection: actualCollection,
          fullSlug: `${collectionSlug}/${docSlug}`,
          type: "single",
          sections,
        }
      }
    }
  }

  return null
}

/*************************************************************************/
/*  GET TEMPLATE FOR DOCUMENT (WORDPRESS-STYLE HIERARCHY)

/* Template hierarchy (WordPress-style):
  1. Assigned template (highest priority)
  2. Document sections (fallback 1)
  3. Default template (fallback 2)

/*************************************************************************/

async function getTemplateForDocument(
  document: any,
  collectionSlug: string,
  routingSettings: any
): Promise<any> {
  // 1. Check settings for single template (highest priority)
  if (collectionSlug !== "pages") {
    const singleTemplateField = `${collectionSlug}SingleTemplate`
    const settingsTemplate = routingSettings[singleTemplateField]

    if (settingsTemplate && typeof settingsTemplate === "object") {
      return settingsTemplate.sections || []
    }
  }

  // 2. Check document's assigned template
  if (document.template && typeof document.template === "object") {
    return document.template.sections || []
  }

  // 3. Fallback to document sections
  return document.sections || []
}
