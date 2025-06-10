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
}

export function PostBreadcrumbs({ post, className }: PostBreadcrumbsProps) {
  return (
    <Breadcrumb className={cn("mb-20", className)}>
      <BreadcrumbList className="text-sm text-white/70">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href="/"
              className="text-secondary-600 hover:text-secondary-500 text-sm"
            >
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-white/50" />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href="/insights"
              className="text-secondary-600 hover:text-secondary-500 text-sm"
            >
              Blog
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="text-white/50" />
        <BreadcrumbItem>
          <BreadcrumbPage className="text-light text-sm text-white">
            {post.title}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
