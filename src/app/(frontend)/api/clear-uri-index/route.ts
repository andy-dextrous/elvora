import { getPayload } from "payload"
import config from "@payload-config"

export const maxDuration = 60

/**
 * TEMPORARY API ROUTE - CLEAR URI INDEX
 *
 * Clears all entries from the URI index for testing purposes
 */

export async function DELETE(): Promise<Response> {
  console.log("🗑️ Clearing URI Index...")

  try {
    const payload = await getPayload({ config })

    // Get all URI index entries
    const allEntries = await payload.find({
      collection: "uri-index",
      limit: 5000,
    })

    console.log(`Found ${allEntries.docs.length} URI index entries to delete`)

    // Delete all entries
    for (const entry of allEntries.docs) {
      await payload.delete({
        collection: "uri-index",
        id: entry.id,
      })
    }

    console.log("🗑️ URI Index cleared successfully")

    return Response.json({
      success: true,
      message: "URI Index cleared",
      deletedCount: allEntries.docs.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("💥 Failed to clear URI Index:", error)

    return Response.json(
      {
        success: false,
        error: "Failed to clear URI Index",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
      }
    )
  }
}
