import type { LatestArticlesBlock } from "@/payload/payload-types"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ArrowRightIcon from "@/components/icons/arrow-right"
import { SectionCta } from "@/components/layout/section-cta"
import { SectionIntro } from "@/components/layout/section-intro"
import { getRecentPosts } from "@/lib/queries/recent-posts"
import { Media as PayloadMedia } from "@/payload/components/frontend/media"
import type { Media, Post } from "@/payload/payload-types"

/*************************************************************************/
/*  LATEST ARTICLES COMPONENT
/*************************************************************************/

export const LatestArticlesComponent: React.FC<LatestArticlesBlock> = async props => {
  const { heading, description, text, button } = props

  // Load the most recent 3 posts from CMS
  const posts = await getRecentPosts()

  return (
    <section className="bg-dark side-border-light flicker-mask">
      <SectionIntro
        heading={heading || undefined}
        description={description}
        headingClassName="text-white"
        descriptionClassName="font-light text-white"
      />
      <div className="border-dark-border w-full border-t">
        <div className="py-section-md md:container-md">
          <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {posts.map(post => (
              <article
                key={post.id}
                className="border-light-border flex flex-col border-t border-b md:border"
              >
                <div className="relative mb-4 aspect-[4/3] overflow-hidden md:mb-6">
                  {post.heroImage && typeof post.heroImage === "object" && (
                    <PayloadMedia
                      resource={post.heroImage as Media}
                      alt={post.title}
                      fill
                      imgClassName="object-cover"
                    />
                  )}
                  <div className="article-image-gradient absolute inset-0" />
                </div>
                <div className="flex flex-1 flex-col px-6 pt-8 pb-12 md:p-6 lg:p-8">
                  <h5 className="mb-3 text-white md:mb-4">{post.title}</h5>
                  <p className="mb-4 flex-1 text-sm font-light text-white/80 md:mb-6">
                    {post.meta?.description || "Read more about this topic..."}
                  </p>
                  <Button
                    variant="outlineGradient"
                    size="md"
                    asChild
                    className="self-start"
                  >
                    <Link href={`/blog/${post.slug || ""}`}>
                      Read More
                      <ArrowRightIcon className="!h-[7px] !w-[12px]" />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-section-x">
        <SectionCta text={text} button={button} containerClassName="text-white" />
      </div>
    </section>
  )
}
