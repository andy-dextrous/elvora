import { RenderSections } from "@/components/sections/RenderSections"
import { getAllURIs, getDocumentByURI } from "@/lib/payload/routing"
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
  const slugPath = slug.join("/")

  if (slugPath) {
    const homepage = await getHomepage()

    if (homepage?.slug === slugPath) {
      redirect("/")
    }
  }

  const URI = `/${slugPath}`

  const routeResponse = await getDocumentByURI(URI)

  if (!routeResponse || !routeResponse.document) {
    return notFound()
  }

  const { document, collection } = routeResponse

  return (
    <main data-collection={collection} data-id={document.id}>
      <PayloadRedirects disableNotFound url={`/${slugPath}`} />
      {draft && <LivePreviewListener />}
      <RenderSections sections={document.sections} />
    </main>
  )
}

/*******************************************************/
/* Generate Static Params
/*******************************************************/

export async function generateStaticParams() {
  const routes = await getAllURIs()

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
  const route = await getDocumentByURI(slugPath)

  return generateMeta({ doc: route?.document }) || {}
}
