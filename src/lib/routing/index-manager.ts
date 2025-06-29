import configPromise from "@payload-config"
import { getPayload } from "payload"
import { frontendCollections } from "@/payload/collections/frontend"
import { routingEngine } from "./uri-engine"
import { getSettings } from "@/lib/data/globals"

/*************************************************************************/
/*

  URI INDEX MANAGER

  Used to manage all operations related to the URI index.
  URI Index stores the URI of FRONTEND-ONLY collection documents in the URI index.

  - updateURIIndex() - Real-time updates from hooks
  - deleteFromURIIndex() - Cleanup when documents are deleted
  - checkURIConflict() - Check if a URI is already taken, with priority based on frontend collections order for conflict resolution.
  - populateURIIndex() - Populate the URI index with the documents from the frontend collections.


/*************************************************************************/

export interface URIIndexUpdate {
  uri: string
  collection: string
  documentId: string
  status: "published" | "draft"
  previousURI?: string
  templateId?: string
}

/*************************************************************************/
/*  TEMPLATE ID DETECTION FOR COLLECTIONS
/*************************************************************************/

export async function getTemplateIdForCollection(
  collection: string
): Promise<string | null> {
  try {
    const settings = await getSettings()
    const routing = settings?.routing

    if (!routing) return null

    // Determine template field name based on collection
    const templateField =
      collection === "pages" ? "pagesDefaultTemplate" : `${collection}SingleTemplate`

    const templateValue = routing[templateField]

    // Handle relationship object or direct ID
    if (templateValue) {
      return typeof templateValue === "object" ? templateValue.id : templateValue
    }

    return null
  } catch (error) {
    console.warn(`Failed to get template ID for collection ${collection}:`, error)
    return null
  }
}

/*************************************************************************/
/*  UPDATE URI INDEX ENTRY
/*************************************************************************/

export async function updateURI({
  uri,
  collection,
  documentId,
  status,
  previousURI,
  templateId,
}: URIIndexUpdate): Promise<void> {
  try {
    const payload = await getPayload({ config: configPromise })

    const existingEntry = await payload.find({
      collection: "uri-index",
      where: {
        and: [
          { sourceCollection: { equals: collection } },
          { documentId: { equals: documentId } },
        ],
      },
      limit: 1,
    })

    // Auto-detect template ID if not provided
    const resolvedTemplateId =
      templateId || (await getTemplateIdForCollection(collection))

    const indexData = {
      uri,
      sourceCollection: collection,
      documentId,
      document: {
        relationTo: collection as any,
        value: documentId,
      },
      status,
      templateId: resolvedTemplateId,
      previousURIs: previousURI ? [{ uri: previousURI }] : undefined,
    }

    if (existingEntry.docs.length > 0) {
      const existingDoc = existingEntry.docs[0]
      let updatedPreviousURIs = existingDoc.previousURIs || []

      if (
        previousURI &&
        !updatedPreviousURIs.some((prev: any) => prev.uri === previousURI)
      ) {
        updatedPreviousURIs = [{ uri: previousURI }, ...updatedPreviousURIs].slice(0, 10)
      }

      await payload.update({
        collection: "uri-index",
        id: existingDoc.id,
        data: {
          ...indexData,
          previousURIs: updatedPreviousURIs,
        },
      })
    } else {
      await payload.create({
        collection: "uri-index",
        data: indexData,
      })
    }
  } catch (error) {
    const payload = await getPayload({ config: configPromise })
    payload.logger.error("Failed to update URI index:", error)
  }
}

/*************************************************************************/
/*  DELETE FROM URI INDEX
/*************************************************************************/

export async function deleteURI(collection: string, documentId: string): Promise<void> {
  try {
    const payload = await getPayload({ config: configPromise })

    const existingEntry = await payload.find({
      collection: "uri-index",
      where: {
        and: [
          { sourceCollection: { equals: collection } },
          { documentId: { equals: documentId } },
        ],
      },
      limit: 1,
    })

    if (existingEntry.docs.length > 0) {
      await payload.delete({
        collection: "uri-index",
        id: existingEntry.docs[0].id,
      })
    }
  } catch (error) {
    const payload = await getPayload({ config: configPromise })
    payload.logger.error("Failed to delete from URI index:", error)
  }
}

/*************************************************************************/
/*  URI CONFLICT DETECTION WITH INDEX

    Check if a URI is already taken, with priority based on frontend
    collections order for conflict resolution.
/*************************************************************************/

export async function checkURIConflict(
  uri: string,
  excludeCollection?: string,
  excludeDocumentId?: string
): Promise<{ hasConflict: boolean; conflictingCollection?: string } | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const normalizedURI = routingEngine.normalizeURI(uri)

    const conflicts = await payload.find({
      collection: "uri-index",
      where: {
        uri: { equals: normalizedURI },
      },
      limit: 10,
    })

    const actualConflicts = conflicts.docs.filter((doc: any) => {
      if (excludeCollection && excludeDocumentId) {
        return !(
          doc.sourceCollection === excludeCollection &&
          doc.documentId === excludeDocumentId
        )
      }
      return true
    })

    if (actualConflicts.length === 0) {
      return { hasConflict: false }
    }

    const collectionPriorities = frontendCollections.reduce(
      (acc, collection, index) => {
        acc[collection.slug] = index
        return acc
      },
      {} as Record<string, number>
    )

    const highestPriorityConflict = actualConflicts.reduce((highest, current) => {
      const currentPriority = collectionPriorities[current.sourceCollection] ?? 999
      const highestPriority = collectionPriorities[highest.sourceCollection] ?? 999
      return currentPriority < highestPriority ? current : highest
    })

    return {
      hasConflict: true,
      conflictingCollection: highestPriorityConflict.sourceCollection,
    }
  } catch (error) {
    const payload = await getPayload({ config: configPromise })
    payload.logger.error("Failed to check URI conflict:", error)
    return null
  }
}

/*************************************************************************/
/*  REGENERATE URIs

    Regenerate all URIs for all frontend collections.
    This is used to ensure that all URIs are up to date and consistent.
    It is also used to reset the URI index.

/*************************************************************************/

export interface PopulationStats {
  totalFound: number
  populated: number
  skipped: number
  errors: number
  collections: Record<string, { found: number; populated: number; errors: number }>
}

export async function regenerateURIs(): Promise<PopulationStats> {
  const stats: PopulationStats = {
    totalFound: 0,
    populated: 0,
    skipped: 0,
    errors: 0,
    collections: {},
  }

  try {
    const payload = await getPayload({ config: configPromise })

    // Clear existing URI index entries first (reset functionality)
    console.log("🗑️ Clearing existing URI index entries...")
    await payload.delete({
      collection: "uri-index",
      where: { id: { exists: true } },
    })

    console.log(`   ✅ Cleared all existing entries`)

    for (const collection of frontendCollections) {
      stats.collections[collection.slug] = { found: 0, populated: 0, errors: 0 }

      try {
        const whereClause: any = {
          and: [{ slug: { exists: true } }, { slug: { not_equals: "" } }],
        }

        // Check if collection has _status field for proper status tracking
        let hasStatusField = false
        try {
          await payload.find({
            collection: collection.slug as any,
            where: { _status: { exists: true } },
            limit: 1,
          })
          hasStatusField = true
        } catch (error) {
          // Collection doesn't have _status field
        }

        const documents = await payload.find({
          collection: collection.slug as any,
          where: whereClause,
          limit: 2000,
          depth: 1,
          // Get both published and draft documents
        })

        const collectionFound = documents.docs.length
        stats.totalFound += collectionFound
        stats.collections[collection.slug].found = collectionFound

        for (const doc of documents.docs) {
          try {
            const generatedURI = await routingEngine.generateURI({
              collection: collection.slug,
              slug: doc.slug,
              data: doc,
            })

            console.log(
              `📍 Generated URI for ${collection.slug}/${doc.slug}: "${generatedURI}"`
            )

            // Validate URI before proceeding
            if (!generatedURI || generatedURI.trim() === "") {
              console.error(`❌ Empty URI generated for ${collection.slug}/${doc.slug}`)
              stats.errors++
              stats.collections[collection.slug].errors++
              continue
            }

            // Update the document itself with the new URI (disable hooks to prevent race condition)
            await payload.update({
              collection: collection.slug as any,
              id: doc.id,
              data: {
                uri: generatedURI,
              },
              draft: hasStatusField ? doc._status === "draft" : false, // Preserve original status
              context: {
                disableRevalidate: true, // Prevent afterChange hooks from interfering
              },
            })

            // Get template ID for this collection
            const templateId = await getTemplateIdForCollection(collection.slug)

            // Create URI index entry
            const indexData = {
              uri: generatedURI,
              sourceCollection: collection.slug,
              documentId: doc.id,
              document: {
                relationTo: collection.slug as any,
                value: doc.id,
              },
              status: hasStatusField ? doc._status || "published" : "published",
              templateId,
            }

            console.log(
              `🔍 Creating URI index entry:`,
              JSON.stringify(indexData, null, 2)
            )

            await payload.create({
              collection: "uri-index",
              data: indexData,
            })

            stats.populated++
            stats.collections[collection.slug].populated++
          } catch (docError) {
            console.error(
              `❌ Failed to process document ${doc.slug} in ${collection.slug}:`,
              docError
            )
            stats.errors++
            stats.collections[collection.slug].errors++
          }
        }

        console.log(
          `   📈 Collection ${collection.slug}: ${stats.collections[collection.slug].populated}/${collectionFound} indexed`
        )
      } catch (collectionError) {
        console.error(
          `❌ Failed to process collection ${collection.slug}:`,
          collectionError
        )
        stats.errors++
      }
    }

    return stats
  } catch (error) {
    console.error("💥 Population failed with critical error:", error)
    throw error
  }
}
