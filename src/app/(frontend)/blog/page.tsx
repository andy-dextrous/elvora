import type { Metadata } from "next/types"

import { SectionCta } from "@/components/layout/section-cta"
import { SectionIntro } from "@/components/layout/section-intro"
import { PostCard } from "@/components/posts/post-card"
import { PageRange } from "@/payload/components/frontend/page-range"
import { Pagination } from "@/payload/components/frontend/pagination"
import configPromise from "@payload-config"
import { getPayload } from "payload"

export const dynamic = "force-static"
export const revalidate = 600

/*************************************************************************/
/*  BLOG PAGE COMPONENT
/*************************************************************************/

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts =
    (await payload.find({
      collection: "posts",
      depth: 1,
      limit: 12,
      overrideAccess: false,
      select: {
        title: true,
        slug: true,
        categories: true,
        meta: true,
        heroImage: true,
        updatedAt: true,
        createdAt: true,
      },
    })) || []

  return (
    <main>
      <section className="bg-dark side-border-light flicker-mask-top py-first-section-nav-offset">
        <SectionIntro
          heading="Latest <span>Articles</span>"
          headingClassName="text-white"
        />

        <div className="border-dark-border w-full border-t">
          <div className="md:container-md">
            <div className="container mb-8">
              <PageRange
                collection="posts"
                currentPage={posts.page}
                limit={12}
                totalDocs={posts.totalDocs}
              />
            </div>

            <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {posts.docs?.map(post => (
                <PostCard
                  key={post.id}
                  post={post as any}
                  className="border-x-none border-y md:border-x"
                />
              ))}
            </div>

            <div className="container mt-8">
              {posts.totalPages > 1 && posts.page && (
                <Pagination page={posts.page} totalPages={posts.totalPages} />
              )}
            </div>
          </div>
        </div>

        <div className="mt-section-x">
          <SectionCta
            text="Ready to get started? Let's discuss your project and explore how we can help bring your vision to life."
            button={{
              link: {
                type: "custom",
                url: "/contact",
                label: "Get Started",
              },
            }}
            containerClassName="text-white"
          />
        </div>
      </section>
    </main>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Blog - Latest Articles & Insights`,
    description:
      "Discover insights, trends, and expert perspectives on technology, business, and innovation.",
  }
}
