import type { CollectionConfig } from "payload"

import { sectionBlocks } from "@/components/sections/config"
import { authenticated } from "@/payload/access/authenticated"
import { authenticatedOrPublished } from "@/payload/access/authenticatedOrPublished"
import { populatePublishedAt } from "@/payload/hooks/populate-published-at"
import { generatePreviewPath } from "@/utilities/generate-preview-path"
import { applyDefaultTemplate } from "./hooks/applyDefaultTemplate"
import { enableFrontend } from "@/payload/collections/frontend"

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from "@payloadcms/plugin-seo/fields"

export const Pages: CollectionConfig<"pages"> = enableFrontend(
  {
    slug: "pages",
    access: {
      create: authenticated,
      delete: authenticated,
      read: authenticatedOrPublished,
      update: authenticated,
    },
    defaultPopulate: {
      title: true,
      slug: true,
      uri: true,
      breadcrumbs: true,
    },
    admin: {
      defaultColumns: [
        "title",
        "featuredImage",
        "slug",
        "updatedAt",
        "id",
        "categories",
        "status",
      ],
      hideAPIURL: process.env.NODE_ENV === "production",
      livePreview: {
        url: ({ data, req }) => {
          const path = generatePreviewPath({
            slug: typeof data?.slug === "string" ? data.slug : "",
            collection: "pages",
            req,
          })

          return path
        },
      },
      preview: (data, { req }) =>
        generatePreviewPath({
          slug: typeof data?.slug === "string" ? data.slug : "",
          collection: "pages",
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
        name: "featuredImage",
        type: "upload",
        relationTo: "media",
        admin: {
          position: "sidebar",
        },
      },
      {
        name: "categories",
        type: "relationship",
        relationTo: "categories",
        hasMany: true,
        admin: {
          position: "sidebar",
        },
      },
      {
        name: "seo",
        type: "group",
        fields: [
          MetaTitleField({
            hasGenerateFn: true,
          }),
          MetaDescriptionField({}),
          MetaImageField({
            relationTo: "media",
          }),
          OverviewField({
            titlePath: "meta.title",
            descriptionPath: "meta.description",
            imagePath: "meta.image",
          }),
          PreviewField({
            hasGenerateFn: true,
            titlePath: "meta.title",
            descriptionPath: "meta.description",
          }),
        ],
      },
      {
        name: "sections",
        type: "blocks",
        blocks: sectionBlocks,
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
      beforeChange: [populatePublishedAt, applyDefaultTemplate],
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
  },
  "Pages"
)
