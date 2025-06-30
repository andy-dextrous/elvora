import type { CollectionConfig } from "payload"

import { sectionBlocks } from "@/components/sections/config"
import { authenticated } from "@/payload/access/authenticated"
import { authenticatedOrPublished } from "@/payload/access/authenticatedOrPublished"
import { applyDefaultTemplate } from "./hooks/applyDefaultTemplate"
import { enableOnFrontend } from "@/payload/collections/frontend"

export const Pages: CollectionConfig<"pages"> = enableOnFrontend({
  slug: "pages",
  labels: {
    singular: "Page",
    plural: "Pages",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ["title", "featuredImage", "slug", "uri", "updatedAt", "status"],
    description:
      "Pages are the primary content type for the website. They represent standalone pages like 'About', 'Contact', 'Services', etc. Each page can have a custom layout using sections and can be nested under other pages for hierarchical navigation.",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "parent",
      type: "relationship",
      relationTo: "pages",
      maxDepth: 0,
      admin: {
        position: "sidebar",
        description: "Select a parent page to create a hierarchical structure",
      },
      filterOptions: ({ id }) => {
        return {
          id: {
            not_equals: id,
          },
        }
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Page Content",
          fields: [
            {
              name: "sections",
              label: "Sections",
              type: "blocks",
              blocks: sectionBlocks,
              required: true,
              admin: {
                initCollapsed: false,
              },
            },
          ],
        },
      ],
    },
    {
      name: "templateControl",
      type: "ui",
      label: "Apply Template",
      admin: {
        position: "sidebar",
        components: {
          Field: "@/payload/components/backend/assign-template",
        },
      },
    },
  ],
  hooks: {
    beforeChange: [applyDefaultTemplate],
  },
})
