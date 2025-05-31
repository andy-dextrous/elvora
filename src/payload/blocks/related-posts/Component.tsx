import { Card } from "@/payload/components/card"
import RichText from "@/payload/components/rich-text"
import type { Post } from "@/payload/payload-types"
import { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"
import clsx from "clsx"
import React from "react"

export type RelatedPostsProps = {
  className?: string
  docs?: Post[]
  introContent?: SerializedEditorState
}

export const RelatedPosts: React.FC<RelatedPostsProps> = props => {
  const { className, docs, introContent } = props

  return (
    <div className={clsx("lg:container", className)}>
      {introContent && <RichText data={introContent} enableGutter={false} />}

      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-8">
        {docs?.map((doc, index) => {
          if (typeof doc === "string") return null

          return <Card key={index} doc={doc} relationTo="blog" showCategories />
        })}
      </div>
    </div>
  )
}
