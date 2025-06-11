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
    defaultColumns: ["name", "description", "applicableCollections", "updatedAt"],
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
      name: "isDefault",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Use as default template for applicable collections",
      },
    },
  ],
}
