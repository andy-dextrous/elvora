import configPromise from "@payload-config"
import { getPayload } from "payload"
import { frontendCollections } from "@/payload/collections"

/*************************************************************************/
/*  URI PREVIEW API ROUTE (DRY RUN)
/*************************************************************************/

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })

    console.log("\n🔍 URI PREVIEW - DRY RUN")
    console.log("=====================================")

    // Get routing settings
    const settings = await payload.findGlobal({
      slug: "settings",
      depth: 1,
    })

    console.log(`📋 Routing Settings:`)
    console.log(`   Homepage: ${settings?.routing?.homepage || "Not set"}`)
    console.log(`   Full routing object:`, JSON.stringify(settings?.routing, null, 2))
    console.log("")

    let totalDocuments = 0
    let documentsWithoutURI = 0
    let conflictCount = 0
    const allCalculatedURIs: Array<{
      uri: string
      collection: string
      id: string
      title: string
    }> = []
    const detailedResults: Array<{
      collection: string
      title: string
      slug: string
      currentURI: string | null
      calculatedURI: string
      hasURI: boolean
      wouldChange: boolean
    }> = []

    // Loop through all frontend collections
    for (const collectionConfig of frontendCollections) {
      console.log(`📁 Collection: ${collectionConfig.label}`)
      console.log("-----------------------------------")

      try {
        // Get all documents from this collection
        const result = await payload.find({
          collection: collectionConfig.slug as any,
          limit: 1000,
          depth: 0,
          pagination: false,
        })

        if (result.docs.length === 0) {
          console.log(`   ⚪ No documents found`)
          console.log("")
          continue
        }

        for (const doc of result.docs) {
          totalDocuments++

          if (!doc.slug) {
            console.log(`   ❌ ${doc.title || doc.name || doc.id} - No slug field`)
            continue
          }

          // Calculate what the URI would be
          const calculatedURI = await calculateURIForDocument({
            collection: collectionConfig.slug,
            doc,
            settings: settings?.routing || {},
            payload,
          })

          const currentURI = doc.uri || null
          const hasURI = !!currentURI

          if (!hasURI) {
            documentsWithoutURI++
          }

          // Track for conflict detection
          allCalculatedURIs.push({
            uri: calculatedURI,
            collection: collectionConfig.slug,
            id: doc.id,
            title: doc.title || doc.name || doc.slug,
          })

          // Log the document
          const status = hasURI ? "✅" : "🆕"
          const changeIndicator = hasURI && currentURI !== calculatedURI ? "🔄" : ""
          const wouldChange = hasURI && currentURI !== calculatedURI

          console.log(`   ${status} ${doc.title || doc.name || doc.slug} (${doc.slug})`)
          console.log(`      Current URI: ${currentURI || "none"}`)
          console.log(`      Calculated: ${calculatedURI} ${changeIndicator}`)

          if (changeIndicator) {
            console.log(`      ⚠️  URI would change!`)
          }
          console.log("")

          // Add to detailed results
          detailedResults.push({
            collection: collectionConfig.slug,
            title: doc.title || doc.name || doc.slug,
            slug: doc.slug,
            currentURI,
            calculatedURI,
            hasURI,
            wouldChange,
          })
        }
      } catch (error) {
        console.log(`   ❌ Error processing ${collectionConfig.slug}:`, error)
        console.log("")
      }
    }

    // Detect conflicts
    console.log("🔍 CONFLICT DETECTION")
    console.log("=====================================")

    const uriGroups = allCalculatedURIs.reduce(
      (groups, item) => {
        const uri = item.uri
        if (!groups[uri]) groups[uri] = []
        groups[uri].push(item)
        return groups
      },
      {} as Record<string, typeof allCalculatedURIs>
    )

    for (const [uri, items] of Object.entries(uriGroups)) {
      if (items.length > 1) {
        conflictCount++
        console.log(`⚠️  CONFLICT: ${uri}`)
        items.forEach(item => {
          console.log(`   - ${item.collection}: ${item.title} (${item.id})`)
        })
        console.log("")
      }
    }

    if (conflictCount === 0) {
      console.log("✅ No URI conflicts detected!")
      console.log("")
    }

    // Summary
    console.log("📊 SUMMARY")
    console.log("=====================================")
    console.log(`Total documents: ${totalDocuments}`)
    console.log(`Without URIs: ${documentsWithoutURI}`)
    console.log(`Conflicts: ${conflictCount}`)
    console.log(`Collections processed: ${frontendCollections.length}`)
    console.log("")

    return Response.json({
      success: true,
      summary: {
        totalDocuments,
        documentsWithoutURI,
        conflictCount,
        collectionsProcessed: frontendCollections.length,
      },
      routingSettings: settings?.routing || {},
      detailedResults,
      message: "URI preview completed - check server console for details",
    })
  } catch (error) {
    console.error("❌ URI Preview failed:", error)
    return Response.json({ error: "Preview failed" }, { status: 500 })
  }
}

/*************************************************************************/
/*  URI CALCULATION FOR PREVIEW
/*************************************************************************/

async function calculateURIForDocument({
  collection,
  doc,
  settings,
  payload,
}: {
  collection: string
  doc: any
  settings: any
  payload: any
}): Promise<string> {
  const slug = doc.slug

  // Homepage handling
  if (collection === "pages" && slug === "home") {
    return ""
  }

  // Pages collection - handle hierarchy using parent field
  if (collection === "pages") {
    return await calculatePageURI({ slug, doc, payload })
  }

  // Collection items - use archive page, custom slug, or collection slug
  return await calculateCollectionItemURI({
    collection,
    slug,
    settings,
    payload,
  })
}

/*************************************************************************/
/*  PAGE URI CALCULATION (HIERARCHICAL)
/*************************************************************************/

async function calculatePageURI({
  slug,
  doc,
  payload,
}: {
  slug: string
  doc: any
  payload: any
}): Promise<string> {
  const parent = doc.parent

  if (!parent) {
    return `/${slug}`
  }

  try {
    // Get parent document
    const parentDoc = await payload.findByID({
      collection: "pages",
      id: typeof parent === "object" ? parent.id : parent,
      depth: 0,
    })

    if (!parentDoc?.uri) {
      // If parent doesn't have URI yet, calculate it recursively
      const parentURI = await calculatePageURI({
        slug: parentDoc.slug,
        doc: parentDoc,
        payload,
      })
      return `${parentURI}/${slug}`
    }

    return `${parentDoc.uri}/${slug}`
  } catch (error) {
    console.warn("Failed to calculate hierarchical page URI:", error)
    return `/${slug}`
  }
}

/*************************************************************************/
/*  COLLECTION ITEM URI CALCULATION
/*************************************************************************/

async function calculateCollectionItemURI({
  collection,
  slug,
  settings,
  payload,
}: {
  collection: string
  slug: string
  settings: any
  payload: any
}): Promise<string> {
  // The settings structure uses {collection}ArchivePage format
  const archivePageKey = `${collection}ArchivePage`
  const archivePage = settings[archivePageKey]

  // Priority 1: Archive page slug (if collection has designated archive page)
  if (archivePage?.slug) {
    return `/${archivePage.slug}/${slug}`
  }

  // Priority 2: Original collection slug (fallback)
  return `/${collection}/${slug}`
}
