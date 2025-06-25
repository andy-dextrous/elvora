import type { CollectionSlug } from "payload"

export type FrontendCollection = {
  slug: CollectionSlug
  label: string
}

export const frontendCollections: FrontendCollection[] = [
  {
    slug: "pages",
    label: "Pages",
  },
  {
    slug: "posts",
    label: "Posts",
  },
  {
    slug: "team",
    label: "Team",
  },
  {
    slug: "services",
    label: "Services",
  },
  {
    slug: "testimonials",
    label: "Testimonials",
  },
]

/**
 * Check if a collection is a frontend collection that should be indexed
 */
export function isFrontendCollection(collectionSlug: string): boolean {
  return frontendCollections.some(collection => collection.slug === collectionSlug)
}
