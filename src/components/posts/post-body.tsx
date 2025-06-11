import { RelatedPosts } from "@/payload/blocks/related-posts/Component"
import RichText from "@/payload/components/frontend/rich-text"
import { Post } from "@/payload/payload-types"
import { SectionIntro } from "../layout/section-intro"
import { PostAuthorInfo } from "./post-author-info"
import { PostBreadcrumbs } from "./post-breadcrumbs"

/*************************************************************************/
/*  POST BODY COMPONENT
/*************************************************************************/

export default function PostBody({ post }: { post: Post }) {
  return (
    <article>
      <section className="bg-dark border-light-border side-border-light z-50 translate-y-[-3px] border-t">
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
          <PostAuthorInfo post={post} />
        </div>
      </section>
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <section className="bg-dark side-border-light flicker-mask-top border-light-border border-t">
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
