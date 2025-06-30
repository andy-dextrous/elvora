import type { CollectionConfig } from "payload"

import { sectionBlocks } from "@/components/sections/config"
import { authenticated } from "@/payload/access/authenticated"
import { authenticatedOrPublished } from "@/payload/access/authenticatedOrPublished"
import { createApplyDefaultTemplateHook } from "@/payload/collections/pages/hooks/applyDefaultTemplate"
import { enableOnFrontend } from "@/payload/collections/frontend"

const applyDefaultTemplate = createApplyDefaultTemplateHook("services")

export const Services: CollectionConfig<"services"> = enableOnFrontend({
  slug: "services",
  labels: {
    singular: "Service",
    plural: "Services",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    description:
      "Services represent the core business offerings of the company that should have a page dedicated to them for converting specific leads and customers. They are a great addition for SEO and marketing.",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "Brief description of the service",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Service Content",
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
