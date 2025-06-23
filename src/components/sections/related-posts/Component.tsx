import { SectionIntro } from "@/components/layout/section-intro"
import { RelatedPosts as RelatedPostsBlock } from "@/payload/blocks/related-posts/Component"
import { getRelatedPostsByIds } from "@/lib/data/post"
import type { RelatedPostsBlock as RelatedPostsBlockType } from "@/payload/payload-types"

/*************************************************************************/
/*  RELATED POSTS SECTION COMPONENT
/*************************************************************************/

export const RelatedPostsComponent: React.FC<
  RelatedPostsBlockType & { currentDocument?: any }
> = async props => {
  const { heading, description, currentDocument, maxPosts = 3 } = props

  const currentPostData = currentDocument

  if (!currentPostData) {
    return (
      <section className="bg-dark side-border-light flicker-mask-top border-light-border border-t py-16">
        <div className="container">
          <p className="text-white">Current post not found</p>
        </div>
      </section>
    )
  }

  const relatedPostIds = currentPostData.relatedPosts || []

  if (relatedPostIds.length === 0) {
    return null
  }

  const relatedPosts = await getRelatedPostsByIds({
    postIds: relatedPostIds
      .map((post: any) => (typeof post === "string" ? post : post.id))
      .filter(Boolean),
    maxPosts: maxPosts || 3,
  })

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <section className="bg-dark side-border-light flicker-mask-top border-light-border border-t">
      {/* Section Intro */}
      <SectionIntro
        heading={heading || undefined}
        description={description || undefined}
        headingClassName="text-white"
      />

      {/* Related Posts */}
      <RelatedPostsBlock docs={relatedPosts} />
    </section>
  )
}
