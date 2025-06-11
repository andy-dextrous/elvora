import type { CollectionConfig } from "payload"

import { sectionBlocks } from "@/components/sections/config"
import { authenticated } from "@/payload/access/authenticated"
import { authenticatedOrPublished } from "@/payload/access/authenticatedOrPublished"

export const Templates: CollectionConfig<"templates"> = {
  slug: "templates",
  access: {
    create: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: [
      "name",
      "description",
      "applicableCollections",
      "defaultForCollections",
      "updatedAt",
    ],
    group: "Content Management",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "Template name (e.g. 'Service Page', 'Product Landing')",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "What this template is used for",
      },
    },
    {
      name: "applicableCollections",
      type: "select",
      hasMany: true,
      options: [
        { label: "Pages", value: "pages" },
        { label: "Services", value: "services" },
      ],
      admin: {
        description: "Which content types can use this template",
      },
    },
    {
      name: "sections",
      label: "Template Sections",
      type: "blocks",
      blocks: sectionBlocks,
      required: true,
      admin: {
        description: "Pre-configured sections with default content",
      },
    },
    {
      name: "defaultForCollections",
      label: "Default Template For",
      type: "select",
      hasMany: true,
      options: [
        { label: "Pages", value: "pages" },
        { label: "Services", value: "services" },
      ],
      admin: {
        description: "Set this template as the default for selected collections",
        condition: (data, siblingData) => {
          // Only show if applicableCollections has values
          return siblingData?.applicableCollections?.length > 0
        },
      },
      validate: (value, { siblingData }) => {
        // Ensure defaultForCollections is a subset of applicableCollections
        if (value && value.length > 0 && siblingData) {
          const applicable = (siblingData as any)?.applicableCollections as string[]
          if (applicable) {
            const invalidDefaults = value.filter(
              (collection: string) => !applicable.includes(collection)
            )

            if (invalidDefaults.length > 0) {
              return `Cannot set as default for collections that are not applicable: ${invalidDefaults.join(", ")}`
            }
          }
        }
        return true
      },
    },
  ],
}
