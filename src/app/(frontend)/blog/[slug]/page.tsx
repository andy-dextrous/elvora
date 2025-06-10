import type { Metadata } from "next"
import { PayloadRedirects } from "@/payload/components/frontend/payload-redirects"
import { draftMode } from "next/headers"
import PostBody from "@/components/posts/post-body"
import { PostHero } from "@/components/posts/post-hero"
import { getPostBySlug, getPosts } from "@/lib/queries/post"
import { LivePreviewListener } from "@/payload/components/frontend/live-preview-listener"
import { generateMeta } from "@/utilities/generateMeta"
import { getCurrentUser } from "@/lib/queries/user"
import { cn } from "@/utilities/ui"
import { FullwidthCtaComponent } from "@/components/sections/fullwidth-cta/Component"
import { fullwidthCtaDefault } from "@/payload/fields/default-values/fullwidth-cta"

/*************************************************************************/
/*  INDIVIDUAL BLOG POST PAGE COMPONENT
/*************************************************************************/

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = "" } = await paramsPromise
  const url = "/blog/" + slug
  const post = await getPostBySlug({ slug })
  const user = await getCurrentUser()

  if (!post) return <PayloadRedirects url={url} />

  return (
    <main
      data-collection="posts"
      data-single-type="post"
      data-id={post.id}
      className={cn(user ? "relative !mt-[32px]" : "")}
    >
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}

      <PostHero post={post} />

      <section className="bg-dark side-border-light flicker-mask">
        <article>
          <PostBody post={post} />
        </article>
      </section>

      <FullwidthCtaComponent
        heading="See the Difference in Minutes"
        description="Watch a fast demo and see how intelligent automation transforms your workflow: less effort, more results."
        textAlignment="left"
        colorScheme="gradient"
        backgroundImage="https://res.cloudinary.com/wild-creative/image/upload/v1748834621/meeting_3_hbtmkr.jpg"
        button={{
          variant: "white",
          size: "lg",
          layout: "default",
          icon: false,
          link: {
            type: "custom",
            url: "/demo",
            label: "Watch Demo",
            newTab: false,
          },
        }}
        blockType="fullwidth-cta"
      />
    </main>
  )
}

/*******************************************************/
/* Generate Static Params
/*******************************************************/

export async function generateStaticParams() {
  const posts = await getPosts()

  const params = posts.map(({ slug }) => {
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
  const { slug = "" } = await paramsPromise
  const post = await getPostBySlug({ slug })

  return generateMeta({ doc: post })
}
