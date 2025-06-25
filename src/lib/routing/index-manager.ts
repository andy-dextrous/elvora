import configPromise from "@payload-config"
import { getPayload } from "payload"
import { frontendCollections } from "@/payload/collections/frontend"

/*************************************************************************/
/*  URI INDEX MANAGER - MINIMAL IMPLEMENTATION

    Core functions for maintaining the URI index collection:
    - updateURIIndex() - Real-time updates from hooks
    - deleteFromURIIndex() - Cleanup when documents are deleted
    - getByURI() - Single-query URI resolution (replaces collection loop)

    No population, validation, or migration functions - keeping it simple.
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

    // Check if entry already exists
    const existing = await payload.find({
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

    if (existing.docs.length > 0) {
      // Update existing entry
      const existingDoc = existing.docs[0]

      // Handle previousURIs - add old URI if it's changing
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
      // Create new entry
      await payload.create({
        collection: "uri-index",
        data: indexData,
      })
    }
  } catch (error) {
    // Log error but don't throw - we don't want to break content saves
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

    // Find and delete the index entry
    const existing = await payload.find({
      collection: "uri-index",
      where: {
        and: [
          { sourceCollection: { equals: collection } },
          { documentId: { equals: documentId } },
        ],
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      await payload.delete({
        collection: "uri-index",
        id: existing.docs[0].id,
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
    const normalizedURI = uri === "/" ? "" : uri.replace(/\/+$/, "")

    const conflicts = await payload.find({
      collection: "uri-index",
      where: {
        uri: { equals: normalizedURI },
      },
      limit: 10,
    })

    // Filter out the document being updated
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

    // Find the highest priority conflicting collection based on frontend collections order
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
