import { Button, type ButtonProps } from "@/components/ui/button"
import { pathMapping } from "@/payload/path-mapping"
import { cn } from "@/utilities/ui"
import Link from "next/link"
import React from "react"

type CMSLinkType = {
  appearance?: "inline" | ButtonProps["variant"] // either render as a link or a button
  children?: React.ReactNode // Pass in text and icons like usual
  className?: string
  newTab?: boolean | null
  reference?: {
    relationTo: string // Type of collection the reference is to
    value: any | string | number // The slug of the reference
  } | null
  size?: ButtonProps["size"] | null // The size of the button
  type?: "custom" | "reference" | null // Is this a custom link or a reference to a document in the CMS ?
  url?: string | null // The external URL if type is "custom"
} & Omit<React.ComponentProps<typeof Link>, "href" | "children" | "className" | "type">

export const CMSLink: React.FC<CMSLinkType> = props => {
  const {
    type,
    appearance = "inline",
    children,
    className,
    newTab,
    reference,
    size: sizeFromProps,
    url,
    ...linkProps
  } = props

  // Collection-to-path mapping for custom routing
  const getCollectionPath = (relationTo: string): string => {
    return pathMapping[relationTo] || "" // if no mapping is found, return an empty string which means no path is needed
  }

  const relationToPath = reference?.relationTo
    ? getCollectionPath(reference.relationTo)
    : ""

  const href =
    type === "reference" && typeof reference?.value === "object" && reference.value.slug
      ? reference.value.slug === "home"
        ? `${process.env.NEXT_PUBLIC_URL}/`
        : relationToPath === ""
          ? `${process.env.NEXT_PUBLIC_URL}/${reference.value.slug}`
          : `${process.env.NEXT_PUBLIC_URL}/${relationToPath}/${reference.value.slug}`
      : url

  if (!href) return null

  const size = appearance === "link" ? undefined : sizeFromProps || undefined
  const newTabProps = newTab ? { rel: "noopener noreferrer", target: "_blank" } : {}

  // Render children if provided, otherwise render label
  const content = children

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
