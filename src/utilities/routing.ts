import type { Field } from "payload"
import { frontendCollections } from "@/payload/collections"

/*************************************************************************/
/*  DISCOVER FRONTEND COLLECTIONS WITH SLUG FIELDS (DYNAMIC AUTO-DISCOVERY)
/*************************************************************************/

export function getFrontendCollections(): Array<{
  slug: string
  label: string
}> {
  return frontendCollections
}

/*************************************************************************/
/*  GENERATE READING SETTINGS FIELDS
/*************************************************************************/

export function generateReadingSettingsFields(): Field[] {
  return [
    {
      type: "group",
      label: "Reading Settings",
      fields: [
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
          name: "pagesDefaultTemplate",
          type: "relationship",
          relationTo: "templates",
          label: "Default Page Template",
          admin: {
            description: "Default template for new pages (if no template is specified)",
          },
        },
      ],
    },
  ]
}

/*************************************************************************/
/*  GENERATE COLLECTION ROUTING FIELDS
/*************************************************************************/

export function generateCollectionRoutingFields(): Field[] {
  const frontendCollections = getFrontendCollections()

  const fields: Field[] = frontendCollections
    .filter(collection => collection.slug !== "pages")
    .map(collection => {
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
