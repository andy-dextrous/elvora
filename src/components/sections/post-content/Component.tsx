import RichText from "@/payload/components/frontend/rich-text"
import type { PostContentBlock } from "@/payload/payload-types"
import { PostAuthorInfo } from "@/components/posts/post-author-info"
import { PostBreadcrumbs } from "@/components/posts/post-breadcrumbs"
import { cn } from "@/utilities/ui"

/*************************************************************************/
/*  POST CONTENT SECTION COMPONENT
/*************************************************************************/

export const PostContentComponent: React.FC<
  PostContentBlock & { currentDocument?: any }
> = props => {
  const {
    currentDocument,
    showBreadcrumbs = true,
    showAuthorInfo = true,
    proseSize = "xl",
  } = props

  // Use current document (from template context) as the post data
  const postData = currentDocument

  if (!postData) {
    return (
      <section className="bg-dark border-light-border py-16">
        <div className="container-sm">
          <p className="text-white">Post not found</p>
        </div>
      </section>
    )
  }

  // Use fixed prose classes to match original
  const proseClasses =
    "prose prose-xl lg:prose-2xl prose-white gradient-headings !max-w-none"

  return (
    <section className="bg-dark border-light-border side-border-light z-50 translate-y-[-3px] border-t">
      <div className="container-sm">
        {/* Breadcrumbs */}
        {showBreadcrumbs && <PostBreadcrumbs post={postData} />}

        {/* Post Content */}
        {postData.content && (
          <RichText
            data={postData.content}
            className={proseClasses}
            enableGutter={false}
            textColor="white"
          />
        )}

        {/* Author Info */}
        {showAuthorInfo && <PostAuthorInfo post={postData} />}
      </div>
    </section>
  )
}
