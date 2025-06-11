import { RelatedPosts } from "@/payload/blocks/related-posts/Component"
import RichText from "@/payload/components/frontend/rich-text"
import { Post } from "@/payload/payload-types"
import { Fragment } from "react"
import { PostBreadcrumbs } from "./post-breadcrumbs"
import { SectionIntro } from "../layout/section-intro"

/*************************************************************************/
/*  POST BODY COMPONENT
/*************************************************************************/

export default function PostBody({ post }: { post: Post }) {
  return (
    <article>
      <section className="bg-dark side-border-light flicker-mask">
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
      </section>
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <section className="bg-dark side-border-light flicker-mask border-light-border border-t">
          <SectionIntro
            heading="<span>Related</span> Posts"
            headingClassName="text-white"
          />
          <RelatedPosts
            docs={post.relatedPosts.filter(post => typeof post === "object")}
          />
        </section>
      )}
    </article>
  )
}
