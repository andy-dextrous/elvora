import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/utilities/ui"
import Link from "next/link"
import React from "react"

type CMSLinkType = {
  appearance?: "inline" | ButtonProps["variant"]
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: string
    value: any | string | number
  } | null
  size?: ButtonProps["size"] | null
  type?: "custom" | "reference" | null
  url?: string | null
} & Omit<React.ComponentProps<typeof Link>, "href" | "children" | "className" | "type">

export const CMSLink: React.FC<CMSLinkType> = props => {
  const {
    type,
    appearance = "inline",
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    url,
    ...linkProps
  } = props

  // Collection-to-path mapping for custom routing
  const getCollectionPath = (relationTo: string): string => {
    const pathMapping: Record<string, string> = {
      pages: "",
      posts: "blog",
      // Add more custom mappings as needed
    }

    return pathMapping[relationTo] || relationTo
  }

  const relationToPath = reference?.relationTo
    ? getCollectionPath(reference.relationTo)
    : ""

  const href =
    type === "reference" && typeof reference?.value === "object" && reference.value.slug
      ? reference.value.slug === "home"
        ? `${process.env.NEXT_PUBLIC_URL}/`
        : `${process.env.NEXT_PUBLIC_URL}/${relationToPath}/${reference.value.slug}`
      : url

  if (!href) return null

  const size = appearance === "link" ? undefined : sizeFromProps || undefined
  const newTabProps = newTab ? { rel: "noopener noreferrer", target: "_blank" } : {}

  // Render children if provided, otherwise render label
  const content = children || label

  /* Ensure we don't break any styles set by richText */
  if (appearance === "inline") {
    return (
      <Link
        className={cn(className)}
        href={href || url || ""}
        {...newTabProps}
        {...linkProps}
      >
        {content}
      </Link>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance}>
      <Link
        className={cn(className)}
        href={href || url || ""}
        {...newTabProps}
        {...linkProps}
      >
        {content}
      </Link>
    </Button>
  )
}
