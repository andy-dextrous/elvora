import { NextRequest, NextResponse } from "next/server"
import { getPayload } from "payload"
import configPromise from "@payload-config"
import { seedPosts } from "@/payload/endpoints/seed/posts-only"

/*************************************************************************/
/*  SEED POSTS API ENDPOINT
/*************************************************************************/

export async function POST(request: NextRequest) {
  console.log("🌱 Starting posts seeding...")

  try {
    console.log("📦 Getting payload instance...")
    const payload = await getPayload({ config: configPromise })
    console.log("✅ Payload instance obtained")

    // Create a mock request object for the seeding function
    const req = {
      payload,
      user: null, // You might want to add proper user authentication here
    } as any

    console.log("🚀 Calling seedPosts function...")
    await seedPosts({ payload, req })
    console.log("✅ Posts seeded successfully!")

    return NextResponse.json({ message: "Posts seeded successfully" }, { status: 200 })
  } catch (error) {
    console.error("❌ Error seeding posts:")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Failed to seed posts",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
