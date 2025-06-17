import collections from "@/payload/collections"
import type { Field } from "payload"

/*************************************************************************/
/*  DISCOVER FRONTEND COLLECTIONS WITH SLUG FIELDS
/*************************************************************************/

export function getFrontendCollections(): Array<{
  slug: string
  label: string
}> {
  return collections
    .filter(collection => {
      if (["users", "media", "templates", "pages"].includes(collection.slug)) {
        return false
      }

      return collection.fields.some(field => "name" in field && field.name === "slug")
    })
    .map(collection => ({
      slug: collection.slug,
      label: collection.slug.charAt(0).toUpperCase() + collection.slug.slice(1),
    }))
}

/*************************************************************************/
/*  GENERATE DYNAMIC ROUTING FIELDS FOR SETTINGS
/*************************************************************************/

export function generateRoutingFields(): Field[] {
  const frontendCollections = getFrontendCollections()

  const fields: Field[] = frontendCollections.map(collection => {
    return {
      type: "group",
      label: collection.label,
      fields: [
        {
          name: `${collection.slug}CollectionLabel`,
          type: "text",
          defaultValue: collection.label,
          admin: {
            readOnly: true,
            hidden: true,
          },
          label: "Collection",
        },
        {
          name: `${collection.slug}ArchivePage`,
          type: "relationship",
          relationTo: "pages" as const,
          label: "Archive Page",
        },
        {
          name: `${collection.slug}ArchiveTemplate`,
          type: "relationship",
          relationTo: "templates" as const,
          label: "Archive Template",
        },
        {
          name: `${collection.slug}SingleTemplate`,
          type: "relationship",
          relationTo: "templates" as const,
          label: "Single Template",
        },
      ],
    }
  })

  return [
    {
      type: "row",
      admin: {
        components: {
          Field: "@/payload/components/backend/row-grid",
        },
      },
      fields,
    },
  ]
}
