import { RenderSections } from "@/components/sections/RenderSections"
import { getHomepageFromSettings } from "@/lib/queries/page"
import { getAllRoutes, getRoute } from "@/lib/queries/route"
import { LivePreviewListener } from "@/payload/components/frontend/live-preview-listener"
import { PayloadRedirects } from "@/payload/components/frontend/payload-redirects"
import { generateMeta } from "@/utilities/generateMeta"
import { Metadata } from "next"
import { draftMode } from "next/headers"
import { notFound, redirect } from "next/navigation"

type Args = {
  params: Promise<{
    slug?: string[]
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = [] } = await paramsPromise
  const slugPath = slug.join("/")

  if (slugPath) {
    const homepage = await getHomepageFromSettings()

    if (homepage?.slug === slugPath) {
      redirect("/")
    }
  }

  const routeDocument = await getRoute(slugPath)

  if (!routeDocument) {
    return notFound()
  }

  const { document, collection, type, sections = [] } = routeDocument

  return (
    <main data-collection={collection} data-single-type={type} data-id={document.id}>
      <PayloadRedirects disableNotFound url={`/${slugPath}`} />
      {draft && <LivePreviewListener />}
      <RenderSections sections={sections} />
    </main>
  )
}

/*******************************************************/
/* Generate Static Params
/*******************************************************/

export async function generateStaticParams() {
  const routes = await getAllRoutes()

  return routes.map(route => ({
    slug: route.split("/").filter(Boolean),
  }))
}

/*******************************************************/
/* Generate Metadata
/*******************************************************/

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { slug = [] } = await paramsPromise
  const slugPath = slug.join("/")
  const route = await getRoute(slugPath)

  return route ? generateMeta({ doc: route.document as any }) : {}
}
