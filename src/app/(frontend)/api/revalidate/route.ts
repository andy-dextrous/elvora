import { revalidatePath, revalidateTag } from "next/cache"

export async function GET() {
  // Revalidate all paths
  revalidatePath("/")

  // Revalidate all tags (updated to use correct naming convention)
  revalidateTag("sitemap:all") // Simplified sitemap invalidation
  revalidateTag("redirects")
  revalidateTag("global:header") // Fixed naming convention
  revalidateTag("global:footer") // Fixed naming convention
  revalidateTag("global:settings") // Fixed naming convention

  return new Response("All caches revalidated", { status: 200 })
}
