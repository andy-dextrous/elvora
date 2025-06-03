import type { Metadata } from "next/types"

import { CollectionArchive } from "@/payload/components/frontend/collection-archive"
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
  })

  return (
    <main className={cn(user ? "relative !mt-[32px]" : "")}>
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Posts</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </main>
  )
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise

  const settings = await getSettings()

  return {
    title: `Posts Page ${pageNumber || ""} | ${settings?.general?.siteName || "Wild Child"}`,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: "posts",
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / 10)

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
