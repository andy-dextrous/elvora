import configPromise from "@payload-config"
import { getPayload } from "payload"
import { frontendCollections } from "@/payload/collections/frontend"
import { routingEngine } from "./uri-engine"

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
}

/*************************************************************************/
/*  UPDATE URI INDEX ENTRY
/*************************************************************************/

export async function updateURIIndex({
  uri,
  collection,
  documentId,
  status,
  previousURI,
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

    const indexData = {
      uri,
      sourceCollection: collection,
      documentId,
      document: {
        relationTo: collection as any,
        value: documentId,
      },
      status,
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

export async function deleteFromURIIndex(
  collection: string,
  documentId: string
): Promise<void> {
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
    const normalizedURI = uri.replace(/\/+$/, "") || "/"

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
/*  POPULATE URI INDEX - BULK MIGRATION
/*************************************************************************/

export interface PopulationStats {
  totalFound: number
  populated: number
  skipped: number
  errors: number
  collections: Record<string, { found: number; populated: number; errors: number }>
}

export async function populateURIIndex(): Promise<PopulationStats> {
  const stats: PopulationStats = {
    totalFound: 0,
    populated: 0,
    skipped: 0,
    errors: 0,
    collections: {},
  }

  try {
    const payload = await getPayload({ config: configPromise })

    for (const collection of frontendCollections) {
      stats.collections[collection.slug] = { found: 0, populated: 0, errors: 0 }

      try {
        let whereClause: any = {
          and: [{ slug: { exists: true } }, { slug: { not_equals: "" } }],
        }

        let hasStatusField = false

        await payload.find({
          collection: collection.slug as any,
          where: { _status: { exists: true } },
          limit: 1,
        })

        whereClause.and.push({ _status: { equals: "published" } })
        hasStatusField = true

        const documents = await payload.find({
          collection: collection.slug as any,
          where: whereClause,
          limit: 2000,
          depth: 1,
        })

        const collectionFound = documents.docs.length
        stats.totalFound += collectionFound
        stats.collections[collection.slug].found = collectionFound

        for (const doc of documents.docs) {
          try {
            const existing = await payload.find({
              collection: "uri-index",
              where: {
                and: [
                  { sourceCollection: { equals: collection.slug } },
                  { documentId: { equals: doc.id } },
                ],
              },
              limit: 1,
            })

            if (existing.docs.length > 0) {
              stats.skipped++
              continue
            }

            const generatedURI = await routingEngine.generateURI({
              collection: collection.slug,
              slug: doc.slug,
              data: doc,
            })

            await payload.create({
              collection: "uri-index",
              data: {
                uri: generatedURI,
                sourceCollection: collection.slug,
                documentId: doc.id,
                document: {
                  relationTo: collection.slug as any,
                  value: doc.id,
                },
                status: hasStatusField ? "published" : "published",
              },
            })

            stats.populated++
            stats.collections[collection.slug].populated++
          } catch (docError) {
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
