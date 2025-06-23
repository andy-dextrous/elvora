import { RenderSections } from "@/components/sections/RenderSections"
import { cache } from "@/lib/payload/cache"
import { routingEngine } from "@/lib/payload/routing-engine"
import { LivePreviewListener } from "@/payload/components/frontend/live-preview-listener"
import { PayloadRedirects } from "@/payload/components/frontend/payload-redirects"
import { generateMeta } from "@/utilities/generate-meta"
import { notFound, redirect } from "next/navigation"
import { getHomepage } from "@/lib/payload/page"
import { draftMode } from "next/headers"
import { Metadata } from "next"

type Args = {
  params: Promise<{
    slug?: string[]
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = [] } = await paramsPromise

  if (slug.length > 0) {
    const homepage = await getHomepage()
    const slugPath = slug.join("/")

    if (homepage?.slug === slugPath) {
      redirect("/")
    }
  }

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
      <RenderSections sections={document.sections} />
    </main>
  )
}

/*******************************************************/
/* Generate Static Params
/*******************************************************/

export async function generateStaticParams() {
  const routes = await routingEngine.getAllURIs()

  return routes.map((route: string) => ({
    slug: routingEngine.uriToSlug(route),
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
