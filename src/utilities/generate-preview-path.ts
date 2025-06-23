import { PayloadRequest, CollectionSlug } from "payload"

type Props = {
  collection: CollectionSlug
  slug: string
  req: PayloadRequest
}

/*************************************************************************/
/*  PREVIEW PATH GENERATION - URI-FIRST ARCHITECTURE
/*************************************************************************/

export const generatePreviewPath = async ({ collection, slug, req }: Props) => {
  // Try to get the document to access its URI field
  let documentURI = `/${slug}` // fallback

  try {
    const document = await req.payload.find({
      collection,
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
    })

    if (document.docs.length > 0) {
      const doc = document.docs[0] as any // Type assertion for URI field access
      if (doc.uri && typeof doc.uri === "string") {
        documentURI = doc.uri
      }
    }
  } catch (error) {
    // If document lookup fails, use basic slug fallback
    console.warn(
      `Preview path generation: Could not find document for ${collection}/${slug}`
    )
  }

  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: documentURI,
    previewSecret: process.env.PREVIEW_SECRET || "",
  })

  const url = `/api/preview?${encodedParams.toString()}`

  return url
}
