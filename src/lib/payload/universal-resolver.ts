import configPromise from "@payload-config"
import { getPayload } from "payload"
import { unstable_cache } from "next/cache"
import { frontendCollections } from "@/payload/collections"

/*************************************************************************/
/*  UNIVERSAL DOCUMENT RESOLUTION TYPES
/*************************************************************************/

export interface ResolvedDocument {
  document: any
  collection: string
  type: "homepage" | "page" | "collection-archive" | "collection-item"
  segments: string[]
  uri: string
}

export interface URIAnalysis {
  segments: string[]
  pattern: "homepage" | "single-segment" | "multi-segment"
  segmentCount: number
}

/*************************************************************************/
/*  MAIN UNIVERSAL DOCUMENT RESOLVER
/*************************************************************************/

export async function getDocumentByURI(
  uri: string,
  draft: boolean = false
): Promise<ResolvedDocument | null> {
  // Normalize URI
  const normalizedURI = normalizeURI(uri)

  // Analyze URI segments
  const analysis = analyzeURISegments(normalizedURI)

  // Homepage handling (empty URI)
  if (analysis.pattern === "homepage") {
    return await resolveHomepage(draft)
  }

  // Single segment - could be page or collection archive
  if (analysis.pattern === "single-segment") {
    return await resolveSingleSegment(analysis.segments[0], draft)
  }

  // Multi-segment - could be nested page or collection item
  if (analysis.pattern === "multi-segment") {
    return await resolveMultiSegment(analysis.segments, normalizedURI, draft)
  }

  return null
}

/*************************************************************************/
/*  URI SEGMENT ANALYSIS
/*************************************************************************/

export function analyzeURISegments(uri: string): URIAnalysis {
  // Remove leading/trailing slashes and split
  const segments = uri
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)

  const segmentCount = segments.length
  let pattern: URIAnalysis["pattern"]

  if (segmentCount === 0) {
    pattern = "homepage"
  } else if (segmentCount === 1) {
    pattern = "single-segment"
  } else {
    pattern = "multi-segment"
  }

  return {
    segments,
    pattern,
    segmentCount,
  }
}

/*************************************************************************/
/*  HOMEPAGE RESOLUTION
/*************************************************************************/

async function resolveHomepage(draft: boolean): Promise<ResolvedDocument | null> {
  try {
    const payload = await getPayload({ config: configPromise })

    // Get homepage from settings
    const settings = await payload.findGlobal({
      slug: "settings",
      depth: 1,
      draft,
    })

    const homepageId = settings?.routing?.homepage
    if (!homepageId) {
      return null
    }

    // Get homepage document
    const homepage = await payload.findByID({
      collection: "pages",
      id: typeof homepageId === "object" ? homepageId.id : homepageId,
      depth: 5,
      draft,
    })

    if (!homepage) {
      return null
    }

    return {
      document: homepage,
      collection: "pages",
      type: "homepage",
      segments: [],
      uri: "",
    }
  } catch (error) {
    console.error("Homepage resolution failed:", error)
    return null
  }
}

/*************************************************************************/
/*  SINGLE SEGMENT RESOLUTION (FIRST-MATCH-WINS)
/*************************************************************************/

async function resolveSingleSegment(
  segment: string,
  draft: boolean
): Promise<ResolvedDocument | null> {
  const payload = await getPayload({ config: configPromise })
  const targetURI = `/${segment}`

  // Get frontend collections list
  const collections = getFrontendCollectionsList()

  // Search all collections in priority order for matching URI
  for (const collectionConfig of collections) {
    try {
      const result = await payload.find({
        collection: collectionConfig.slug as any,
        where: {
          uri: {
            equals: targetURI,
          },
        },
        limit: 1,
        depth: 5,
        draft,
      })

      if (result.docs.length > 0) {
        const document = result.docs[0]

        // Determine if this is a page or collection archive
        const isPage = collectionConfig.slug === "pages"
        const type = isPage ? "page" : "collection-archive"

        return {
          document,
          collection: collectionConfig.slug,
          type,
          segments: [segment],
          uri: targetURI,
        }
      }
    } catch (error) {
      // Collection might not have URI field, continue to next
      console.debug(`Skipping URI search for ${collectionConfig.slug}:`, error)
      continue
    }
  }

  return null
}

/*************************************************************************/
/*  MULTI-SEGMENT RESOLUTION (FIRST-MATCH-WINS)
/*************************************************************************/

async function resolveMultiSegment(
  segments: string[],
  uri: string,
  draft: boolean
): Promise<ResolvedDocument | null> {
  const payload = await getPayload({ config: configPromise })

  // Get frontend collections list
  const collections = getFrontendCollectionsList()

  // Search all collections in priority order for matching URI
  for (const collectionConfig of collections) {
    try {
      const result = await payload.find({
        collection: collectionConfig.slug as any,
        where: {
          uri: {
            equals: uri,
          },
        },
        limit: 1,
        depth: 5,
        draft,
      })

      if (result.docs.length > 0) {
        const document = result.docs[0]

        // Determine document type based on collection and URI pattern
        let type: ResolvedDocument["type"]

        if (collectionConfig.slug === "pages") {
          type = "page" // Nested page
        } else {
          type = "collection-item" // Collection item with archive prefix
        }

        return {
          document,
          collection: collectionConfig.slug,
          type,
          segments,
          uri,
        }
      }
    } catch (error) {
      // Collection might not have URI field, continue to next
      console.debug(`Skipping URI search for ${collectionConfig.slug}:`, error)
      continue
    }
  }

  return null
}

/*************************************************************************/
/*  ROUTING SETTINGS HELPERS
/*************************************************************************/

export async function getRoutingSettings(draft: boolean = false) {
  const payload = await getPayload({ config: configPromise })

  try {
    const settings = await payload.findGlobal({
      slug: "settings",
      depth: 1,
      draft,
    })

    return settings?.routing || {}
  } catch (error) {
    console.error("Failed to get routing settings:", error)
    return {}
  }
}

/*************************************************************************/
/*  FRONTEND COLLECTIONS ACCESS
/*************************************************************************/

function getFrontendCollectionsList(): Array<{ slug: string; label: string }> {
  return frontendCollections
}

/*************************************************************************/
/*  UTILITY FUNCTIONS
/*************************************************************************/

function normalizeURI(uri: string): string {
  // Remove trailing slash except for root
  if (uri.length > 1 && uri.endsWith("/")) {
    uri = uri.slice(0, -1)
  }

  // Ensure leading slash for non-empty URIs
  if (uri.length > 0 && !uri.startsWith("/")) {
    uri = "/" + uri
  }

  return uri
}

/*************************************************************************/
/*  CACHED RESOLVER (FOR PERFORMANCE)
/*************************************************************************/

export const getCachedDocumentByURI = (uri: string, draft: boolean = false) =>
  unstable_cache(
    async () => getDocumentByURI(uri, draft),
    ["universal-resolver", uri, draft ? "draft" : "published"],
    {
      tags: [...frontendCollections.map(col => col.slug), `uri_${uri}`],
    }
  )()
