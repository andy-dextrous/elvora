import { RenderSections } from "@/components/sections/RenderSections"
import { getAllPages, getPageBySlug } from "@/lib/queries/page"
import { getCurrentUser } from "@/lib/queries/user"
import { LivePreviewListener } from "@/payload/components/frontend/live-preview-listener"
import { PayloadRedirects } from "@/payload/components/frontend/payload-redirects"
import { generateMeta } from "@/utilities/generateMeta"
import { cn } from "@/utilities/ui"
import { Metadata } from "next"
import { draftMode } from "next/headers"
import { redirect } from "next/navigation"
import { type RequiredDataFromCollectionSlug } from "payload"

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const [{ isEnabled: draft }, user] = await Promise.all([draftMode(), getCurrentUser()])

  const { slug = "" } = await paramsPromise
  const url = "/" + slug

  // "home" designates the home page by default
  if (slug === "home") {
    redirect("/")
  }

  const page: RequiredDataFromCollectionSlug<"pages"> | null = await getPageBySlug({
    slug: slug === "" ? "home" : slug,
    draft,
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { sections = [] } = page

  return (
    <main
      data-collection="pages"
      data-single-type="page"
      data-id={page.id}
      className={cn(user ? "relative !mt-[32px]" : "")}
    >
      {/* Only use PayloadRedirects for non-home pages to prevent infinite loops */}
      {slug !== "home" && <PayloadRedirects disableNotFound url={url} />}
      {draft && <LivePreviewListener />}
      <RenderSections sections={sections} />
    </main>
  )
}

/*******************************************************/
/* Generate Static Params
/*******************************************************/

export async function generateStaticParams() {
  const pages = await getAllPages()

  if (!pages) {
    return []
  }

  const params = pages
    ?.filter(doc => {
      return doc.slug !== "home"
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

/*******************************************************/
/* Generate Metadata
/*******************************************************/

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { slug = "home" } = await paramsPromise
  const { isEnabled: draft } = await draftMode()
  const page = await getPageBySlug({
    slug,
    draft,
  })

  return generateMeta({ doc: page })
}
