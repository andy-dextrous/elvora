import type { Metadata } from "next/types"

import { SectionIntro } from "@/components/layout/section-intro"
import { SectionCta } from "@/components/layout/section-cta"
import { PostCard } from "@/components/posts/post-card"
import { PageRange } from "@/payload/components/frontend/page-range"
import { Pagination } from "@/payload/components/frontend/pagination"
import configPromise from "@payload-config"
import { getPayload } from "payload"
import React from "react"
import { notFound } from "next/navigation"
import { getSettings } from "@/lib/queries/globals"
import { getCurrentUser } from "@/lib/queries/user"
import { cn } from "@/utilities/ui"

export const revalidate = 600

/*************************************************************************/
/*  BLOG PAGINATED PAGE COMPONENT
/*************************************************************************/

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })
  const user = await getCurrentUser()

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: "posts",
    depth: 1,
    limit: 12,
    page: sanitizedPageNumber,
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
  })

  return (
    <main className={cn(user ? "relative !mt-[32px]" : "")}>
      <section className="bg-dark side-border-light flicker-mask">
        <SectionIntro
          heading="Latest <span>Articles</span>"
          description={[
            {
              children: [
                {
                  text: "Discover insights, trends, and expert perspectives on technology, business, and innovation.",
                },
              ],
            },
          ]}
          headingClassName="text-white"
          descriptionClassName="font-light text-white"
        />

        <div className="border-dark-border w-full border-t">
          <div className="py-section-md md:container-md">
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
              {posts?.page && posts?.totalPages > 1 && (
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

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise

  const settings = await getSettings()

  return {
    title: `Blog Page ${pageNumber || ""} - Latest Articles & Insights | ${settings?.general?.siteName || "Wild Child"}`,
    description:
      "Discover insights, trends, and expert perspectives on technology, business, and innovation.",
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: "posts",
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 12)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
