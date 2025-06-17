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
/*  GET EFFECTIVE COLLECTION SLUG (CUSTOM OR DEFAULT)
/*************************************************************************/

export function getEffectiveCollectionSlug(
  collectionSlug: string,
  settings?: any
): string {
  if (!settings?.routing) {
    return collectionSlug
  }

  const customSlugField = `${collectionSlug}CustomSlug`
  const customSlug = settings.routing[customSlugField]

  // Return custom slug if set, otherwise fallback to original
  return customSlug && customSlug.trim() !== "" ? customSlug : collectionSlug
}

/*************************************************************************/
/*  GENERATE READING SETTINGS FIELDS
/*************************************************************************/

export function generateReadingSettingsFields(): Field[] {
  return [
    {
      name: "homepage",
      type: "relationship",
      relationTo: "pages",
      label: "Homepage",
      admin: {
        description: "Choose which page displays as your site's front page",
      },
    },
    {
      name: "postsPage",
      type: "relationship",
      relationTo: "pages",
      label: "Posts Page",
      admin: {
        description: "Choose which page displays your blog posts",
      },
    },
  ]
}

/*************************************************************************/
/*  GENERATE COLLECTION ROUTING FIELDS
/*************************************************************************/

export function generateCollectionRoutingFields(): Field[] {
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
          name: `${collection.slug}CustomSlug`,
          type: "text",
          label: `Collection Slug -> /${collection.slug}/post-name`,
          defaultValue: collection.slug,
          admin: {
            placeholder: collection.slug,
          },
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

/*************************************************************************/
/*  GENERATE ALL ROUTING FIELDS
/*************************************************************************/

export function generateRoutingFields(): Field[] {
  return [...generateReadingSettingsFields(), ...generateCollectionRoutingFields()]
}
