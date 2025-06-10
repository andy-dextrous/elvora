import { RelatedPosts } from "@/payload/blocks/related-posts/Component"
import RichText from "@/payload/components/frontend/rich-text"
import { Post } from "@/payload/payload-types"
import { Fragment } from "react"
import { PostBreadcrumbs } from "./post-breadcrumbs"

/*************************************************************************/
/*  POST BODY COMPONENT
/*************************************************************************/

export default function PostBody({ post }: { post: Post }) {
  return (
    <Fragment>
      <div className="container-sm">
        <PostBreadcrumbs post={post} />
        {post.content && (
          <RichText
            data={post.content}
            className="prose prose-xl lg:prose-2xl prose-white gradient-headings !max-w-none"
            enableGutter={false}
            textColor="white"
          />
        )}
      </div>

      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <div className="mt-section-lg">
          <RelatedPosts
            docs={post.relatedPosts.filter(post => typeof post === "object")}
          />
        </div>
      )}
    </Fragment>
  )
}
