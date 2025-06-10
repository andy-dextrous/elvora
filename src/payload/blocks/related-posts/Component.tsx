import { PostCard } from "@/components/posts/PostCard"
import RichText from "@/payload/components/frontend/rich-text"
import type { Post } from "@/payload/payload-types"
import { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"
import clsx from "clsx"
import React from "react"

/*************************************************************************/
/*  RELATED POSTS COMPONENT
/*************************************************************************/

export type RelatedPostsProps = {
  className?: string
  docs?: Post[]
  introContent?: SerializedEditorState
}

export const RelatedPosts: React.FC<RelatedPostsProps> = props => {
  const { className, docs, introContent } = props

  return (
    <div className={clsx("lg:container", className)}>
      {introContent && (
        <div className="container-sm mb-section-sm">
          <RichText data={introContent} enableGutter={false} />
        </div>
      )}

      <div className="border-dark-border w-full border-t">
        <div className="py-section-md md:container-md">
          <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-8">
            {docs?.map((doc, index) => {
              if (typeof doc === "string") return null

              return (
                <PostCard
                  key={index}
                  post={doc}
                  className="border-x-none border-y md:border-x"
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
