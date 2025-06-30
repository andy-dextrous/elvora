import type { CollectionConfig } from "payload"

import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical"

import { authenticated } from "@/payload/access/authenticated"
import { populateAuthors } from "./hooks/populateAuthors"
import { enableOnFrontend } from "@/payload/collections/frontend"
import { anyone } from "@/payload/access/anyone"

export const Posts: CollectionConfig<"posts"> = enableOnFrontend({
  slug: "posts",
  labels: {
    singular: "Post",
    plural: "Posts",
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  featuredImage: "heroImage",
  admin: {
    defaultColumns: [
      "title",
      "featuredImage",
      "slug",
      "updatedAt",
      "categories",
      "status",
    ],
  },
  defaultPopulate: {
    title: true,
    slug: true,
    uri: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "relatedPosts",
      type: "relationship",
      admin: {
        position: "sidebar",
      },
      filterOptions: ({ id, data }) => {
        const query: any = {
          id: {
            not_in: [id],
          },
        }

        if (
          data?.categories &&
          Array.isArray(data.categories) &&
          data.categories.length > 0
        ) {
          const categoryIds = data.categories.map((cat: any) =>
            typeof cat === "object" ? cat.id : cat
          )

          query.or = [
            // First priority: posts with matching categories
            {
              categories: {
                in: categoryIds,
              },
            },
            // Second priority: all other posts (as fallback)
            {
              categories: {
                not_in: categoryIds,
              },
            },
          ]
        }

        return query
      },
      hasMany: true,
      maxDepth: 2,
      relationTo: "posts",
    },
    {
      name: "categories",
      type: "relationship",
      admin: {
        position: "sidebar",
      },
      hasMany: true,
      relationTo: "categories",
    },
    {
      name: "authors",
      type: "relationship",
      admin: {
        position: "sidebar",
      },
      hasMany: true,
      relationTo: "users",
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    {
      name: "populatedAuthors",
      type: "array",
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: "id",
          type: "text",
        },
        {
          name: "name",
          type: "text",
        },
      ],
    },
    {
      type: "tabs",
      tabs: [
        {
          fields: [
            {
              name: "content",
              type: "richText",
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
            },
          ],
          label: "Content",
        },
      ],
    },
  ],
  hooks: {
    afterRead: [populateAuthors],
  },
})
