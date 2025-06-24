import type { CollectionConfig } from "payload"

import { sectionBlocks } from "@/components/sections/config"
import { authenticated } from "@/payload/access/authenticated"
import { authenticatedOrPublished } from "@/payload/access/authenticatedOrPublished"
import { createApplyDefaultTemplateHook } from "@/payload/collections/pages/hooks/applyDefaultTemplate"
import { slugField } from "@/payload/fields/slug"
import { populatePublishedAt } from "@/payload/hooks/populate-published-at"
import {
  beforeCollectionChangeURIGeneration,
  afterCollectionChange,
  afterCollectionDelete,
} from "@/payload/hooks/revalidation"
import { generatePreviewPath } from "@/utilities/generate-preview-path"

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from "@payloadcms/plugin-seo/fields"

const applyDefaultTemplate = createApplyDefaultTemplateHook("services")

export const Services: CollectionConfig<"services"> = {
  slug: "services",
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ["title", "featuredImage", "slug", "updatedAt", "id", "status"],
    description:
      "Services represent the core business offerings of the company that should have a page dedicated to them for converting specific leads and customers. They are a great addition for SEO and marketing.",
    hideAPIURL: process.env.NODE_ENV === "production",
    livePreview: {
      url: ({ data, req }) => {
        const path = generatePreviewPath({
          slug: typeof data?.slug === "string" ? data.slug : "",
          collection: "services",
          req,
        })

        return path
      },
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: typeof data?.slug === "string" ? data.slug : "",
        collection: "services",
        req,
      }),
    useAsTitle: "title",
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
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
      admin: {
        position: "sidebar",
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
        {
          name: "meta",
          label: "SEO",
          fields: [
            OverviewField({
              titlePath: "meta.title",
              descriptionPath: "meta.description",
              imagePath: "meta.image",
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: "media",
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: "meta.title",
              descriptionPath: "meta.description",
            }),
            {
              name: "noIndex",
              label: "No Index Page",
              type: "checkbox",
              defaultValue: false,
            },
            {
              name: "canonicalUrl",
              label: "Canonical URL",
              type: "text",
            },
          ],
        },
      ],
    },
    ...slugField(),
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
    afterChange: [afterCollectionChange],
    beforeChange: [
      populatePublishedAt,
      applyDefaultTemplate,
      beforeCollectionChangeURIGeneration,
    ],
    afterDelete: [afterCollectionDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
