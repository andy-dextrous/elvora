import { RenderSections } from "@/components/sections/RenderSections"
import { cache } from "@/lib/cache"
import { routingEngine } from "@/lib/routing"
import { LivePreviewListener } from "@/payload/components/frontend/live-preview-listener"
import { PayloadRedirects } from "@/payload/components/frontend/payload-redirects"
import { generateMeta } from "@/utilities/generate-meta"
import { Metadata } from "next"
import { draftMode } from "next/headers"
import { notFound } from "next/navigation"

type Args = {
  params: Promise<{
    slug?: string[]
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = [] } = await paramsPromise

  const URI = routingEngine.slugToURI(slug)
  const routeResponse = await cache.getByURI(URI)

  if (!routeResponse?.document) {
    return notFound()
  }

  const { document, collection } = routeResponse

  return (
    <main data-collection={collection} data-id={document.id}>
      <PayloadRedirects disableNotFound url={URI} />
      {draft && <LivePreviewListener />}
      <RenderSections
        sections={document.sections}
        document={document}
        collection={collection}
      />
    </main>
  )
}

/*******************************************************/
/* Generate Static Params
/*******************************************************/

export async function generateStaticParams() {
  const uris = await cache.getAllURIs()

  return uris.map((uri: string) => ({
    slug: routingEngine.uriToSlug(uri),
  }))
}

/*******************************************************/
/* Generate Metadata
/*******************************************************/

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { slug = [] } = await paramsPromise
  const URI = routingEngine.slugToURI(slug)
  const route = await cache.getByURI(URI)

  return generateMeta({ doc: route?.document }) || {}
}
