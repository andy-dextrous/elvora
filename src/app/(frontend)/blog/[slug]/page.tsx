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
      <article className="pt-16 pb-16">
        <PostHero post={post} />
        <PostBody post={post} />
      </article>
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
