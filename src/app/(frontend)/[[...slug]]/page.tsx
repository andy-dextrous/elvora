import { RenderSections } from "@/components/sections/RenderSections"
import { getAllPages, getPageBySlug, getHomepageFromSettings } from "@/lib/queries/page"
import { LivePreviewListener } from "@/payload/components/frontend/live-preview-listener"
import { PayloadRedirects } from "@/payload/components/frontend/payload-redirects"
import { type RequiredDataFromCollectionSlug } from "payload"
import { generateMeta } from "@/utilities/generateMeta"
import { Metadata } from "next"
import { draftMode } from "next/headers"
import { redirect } from "next/navigation"

type Args = {
  params: Promise<{
    slug?: string[]
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const [{ isEnabled: draft }] = await Promise.all([draftMode()])

  const { slug = [] } = await paramsPromise
  const slugPath = slug.join("/")
  const url = "/" + slugPath

  // Handle homepage (empty slug)
  if (slugPath === "") {
    const homepage = await getHomepageFromSettings()
    if (homepage) {
      const { sections = [] } = homepage
      return (
        <main data-collection="pages" data-single-type="page" data-id={homepage.id}>
          {draft && <LivePreviewListener />}
          <RenderSections sections={sections} />
        </main>
      )
    }
    // Fallback to "home" slug if no homepage set in settings
    const homePage = await getPageBySlug({ slug: "home", draft })
    if (homePage) {
      const { sections = [] } = homePage
      return (
        <main data-collection="pages" data-single-type="page" data-id={homePage.id}>
          {draft && <LivePreviewListener />}
          <RenderSections sections={sections} />
        </main>
      )
    }
  }

  // Handle "home" redirect
  if (slugPath === "home") {
    redirect("/")
  }

  // Try to find page by slug
  const page: RequiredDataFromCollectionSlug<"pages"> | null = await getPageBySlug({
    slug: slugPath,
    draft,
  })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { sections = [] } = page

  return (
    <main data-collection="pages" data-single-type="page" data-id={page.id}>
      <PayloadRedirects disableNotFound url={url} />
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
      return { slug: (slug || "").split("/").filter(Boolean) }
    })

  return params
}

/*******************************************************/
/* Generate Metadata
/*******************************************************/

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { slug = [] } = await paramsPromise
  const slugPath = slug.join("/")
  const { isEnabled: draft } = await draftMode()

  // Handle homepage metadata
  if (slugPath === "") {
    const homepage = await getHomepageFromSettings()
    if (homepage) {
      return generateMeta({ doc: homepage })
    }
    // Fallback to "home" slug
    const homePage = await getPageBySlug({ slug: "home", draft })
    if (homePage) {
      return generateMeta({ doc: homePage })
    }
  }

  const page = await getPageBySlug({
    slug: slugPath,
    draft,
  })

  return generateMeta({ doc: page })
}
