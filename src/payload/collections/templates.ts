import type { CollectionConfig } from "payload"

import { sectionBlocks } from "@/components/sections/config"
import { authenticated } from "@/payload/access/authenticated"
import { authenticatedOrPublished } from "@/payload/access/authenticatedOrPublished"
import {
  afterCollectionChange,
  afterCollectionDelete,
} from "@/payload/hooks/revalidate-after-change"

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
    defaultColumns: ["name", "description", "updatedAt"],
  },
  hooks: {
    afterChange: [afterCollectionChange],
    afterDelete: [afterCollectionDelete],
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
      name: "sections",
      label: "Template Sections",
      type: "blocks",
      blocks: sectionBlocks,
      required: true,
      admin: {
        description: "Pre-configured sections with default content",
      },
    },
  ],
}
