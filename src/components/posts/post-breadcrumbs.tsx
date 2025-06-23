import Link from "next/link"
import { Post } from "@/payload/payload-types"
import { cn } from "@/utilities/ui"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

/*************************************************************************/
/*  POST BREADCRUMBS COMPONENT
/*************************************************************************/

interface PostBreadcrumbsProps {
  post: Post
  className?: string
  blogArchiveUri?: string // Archive page URI passed from parent component
}

export function PostBreadcrumbs({
  post,
  className,
  blogArchiveUri = "/blog",
}: PostBreadcrumbsProps) {
  return (
    <Breadcrumb className={cn("mb-20", className)}>
      <BreadcrumbList className="text-sm text-white/70">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="text-sm text-white hover:text-white/80">
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-white/50" />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href={blogArchiveUri}
              className="text-sm text-white hover:text-white/80"
            >
              Blog
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-white/50" />
        <BreadcrumbItem>
          <BreadcrumbPage className="!text-light text-sm text-white">
            {post.title}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
