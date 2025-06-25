import { formBuilderPlugin } from "@payloadcms/plugin-form-builder"
import { nestedDocsPlugin } from "@payloadcms/plugin-nested-docs"
import { redirectsPlugin } from "@payloadcms/plugin-redirects"
import { searchPlugin } from "@payloadcms/plugin-search"
import { seoPlugin } from "@payloadcms/plugin-seo"
import { GenerateTitle, GenerateURL } from "@payloadcms/plugin-seo/types"
import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical"
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob"
import { revalidateTag } from "next/cache"
import { Plugin } from "payload"

import { markAsReadAfterRead } from "@/payload/hooks/form-submissions"
import { Page, Post } from "@/payload/payload-types"
import { beforeSyncWithSearch } from "@/payload/search/beforeSync"
import { searchFields } from "@/payload/search/fieldOverrides"
import { getServerSideURL } from "@/utilities/get-url"

/*************************************************************************/
/*  SEO PLUGIN
/*************************************************************************/

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title}` : "WILD Child Website Template"
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  if ((doc as any)?.uri) {
    return `${url}${(doc as any).uri}`
  }

  return doc?.slug ? `${url}/${doc.slug}` : url
}

const seo = seoPlugin({
  generateTitle,
  generateURL,
  generateImage: ({ doc }) => doc?.meta?.image || doc?.featuredImage,
})

/*************************************************************************/
/*  REDIRECTS PLUGIN
/*************************************************************************/

const redirects = redirectsPlugin({
  collections: ["pages", "posts"],
  overrides: {
    // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
    fields: ({ defaultFields }) => {
      return defaultFields.map(field => {
        if ("name" in field && field.name === "from") {
          return {
            ...field,
            admin: {
              description:
                "You will need to rebuild the website when changing this field.",
            },
          }
        }
        return field
      })
    },
    hooks: {
      afterChange: [
        ({ doc, req: { payload } }) => {
          payload.logger.info(`Revalidating redirects`)

          revalidateTag("redirects")

          return doc
        },
      ],
    },
  },
})

/*************************************************************************/
/*  FORM BUILDER PLUGIN
/*************************************************************************/

const forms = formBuilderPlugin({
  fields: {
    payment: false,
    phone: {
      slug: "phone",
      labels: {
        singular: "Phone Number",
        plural: "Phone Numbers",
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "name",
              type: "text",
              label: "Name (lowercase, no special characters)",
              required: true,
              admin: {
                width: "50%",
              },
            },
            {
              name: "label",
              type: "text",
              label: "Label",
              admin: {
                width: "50%",
              },
            },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "width",
              type: "number",
              label: "Field Width (percentage)",
              admin: {
                width: "50%",
              },
            },
            {
              name: "defaultValue",
              type: "text",
              label: "Default Value",
              admin: {
                width: "50%",
              },
            },
          ],
        },
        {
          name: "required",
          type: "checkbox",
          label: "Required",
        },
      ],
    } as any,
  },
  formOverrides: {
    fields: ({ defaultFields }) => {
      return defaultFields.map(field => {
        if ("name" in field && field.name === "confirmationMessage") {
          return {
            ...field,
            editor: lexicalEditor({
              features: ({ rootFeatures }) => {
                return [
                  ...rootFeatures,
                  FixedToolbarFeature(),
                  HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
                ]
              },
            }),
          }
        }
        return field
      })
    },
  },
  formSubmissionOverrides: {
    fields: ({ defaultFields }) => {
      return [
        ...defaultFields,
        {
          name: "isRead",
          type: "checkbox",
          label: "Read Status",
          defaultValue: false,
          admin: {
            hidden: true,
          },
        },
      ]
    },
    hooks: {
      afterRead: [markAsReadAfterRead],
    },
  },
})

/*************************************************************************/
/*  SEARCH PLUGIN
/*************************************************************************/

const search = searchPlugin({
  collections: ["pages", "posts"],
  defaultPriorities: {
    pages: 10,
    posts: 20,
  },
  beforeSync: beforeSyncWithSearch,
  searchOverrides: {
    fields: ({ defaultFields }) => {
      return [...defaultFields, ...searchFields]
    },
  },
})

/*************************************************************************/
/*  BLOB STORAGE PLUGIN
/*************************************************************************/

const blob = vercelBlobStorage({
  cacheControlMaxAge: 60 * 60 * 24 * 365, // 1 year
  collections: {
    media: true,
  },
  token: process.env.BLOB_READ_WRITE_TOKEN,
})

/*************************************************************************/
/*  NESTED DOCS PLUGIN
/*************************************************************************/

const nestedDocs = nestedDocsPlugin({
  collections: ["pages", "categories"],
  generateLabel: (_, doc) => doc.title as string,
  generateURL: docs => {
    const finalDoc = docs[docs.length - 1]
    if ((finalDoc as any)?.uri) {
      return (finalDoc as any).uri
    }

    return docs.reduce((url, doc) => `${url}/${doc.slug as string}`, "")
  },
})

/*************************************************************************/
/*  PLUGINS
/*************************************************************************/

export const plugins: Plugin[] = [redirects, seo, forms, search, blob, nestedDocs]
