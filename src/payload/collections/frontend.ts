import { slugField } from "@/payload/fields/slug"
import { lockSlugAfterPublish } from "@/payload/hooks/lock-slug"
import {
  afterCollectionChange,
  afterCollectionDelete,
  beforeCollectionChange,
} from "@/payload/hooks/universal-revalidation"
import { populatePublishedAt } from "@/payload/hooks/populate-published-at"
import { generatePreviewPath } from "@/utilities/generate-preview-path"
import type { CollectionConfig, CollectionSlug, Tab, Field } from "payload"

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from "@payloadcms/plugin-seo/fields"

/*************************************************************************/
/*  TYPES
/*************************************************************************/

export type FrontendCollection = {
  slug: string
  label: string
}

export type FrontendCollectionConfig<TSlug extends CollectionSlug = CollectionSlug> =
  CollectionConfig<TSlug> & {
    seo?: boolean
    publishedAt?: boolean
    featuredImage?: boolean | string
    livePreview?: boolean
  }

/*************************************************************************/
/*  REGISTRY
/*************************************************************************/

const frontendCollectionRegistry = new Map<string, FrontendCollection>()

export function getFrontendCollections(): FrontendCollection[] {
  return Array.from(frontendCollectionRegistry.values())
}

export function isFrontendCollection(collectionSlug: string): boolean {
  return frontendCollectionRegistry.has(collectionSlug)
}

export function getFrontendCollection(slug: string): FrontendCollection | undefined {
  return frontendCollectionRegistry.get(slug)
}

/*************************************************************************/
/*  FIELD BUILDERS
/*************************************************************************/

function buildAdditionalFields(options: {
  publishedAt: boolean
  featuredImage: boolean | string
}): Field[] {
  const fields: Field[] = []

  if (options.publishedAt) {
    fields.push({
      name: "publishedAt",
      type: "date",
      admin: { position: "sidebar" },
    })
  }

  if (options.featuredImage) {
    const fieldName =
      typeof options.featuredImage === "string" ? options.featuredImage : "featuredImage"

    fields.push({
      name: fieldName,
      type: "upload",
      relationTo: "media",
      admin: { position: "sidebar" },
    })
  }

  return fields
}

function buildSEOTab(): Tab {
  return {
    name: "meta",
    label: "SEO",
    fields: [
      OverviewField({
        titlePath: "meta.title",
        descriptionPath: "meta.description",
        imagePath: "meta.image",
      }),
      MetaTitleField({ hasGenerateFn: true }),
      MetaImageField({ relationTo: "media" }),
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
  }
}

function addSEOToFields(fields: Field[], addSEO: boolean): Field[] {
  if (!addSEO) return fields

  const tabsIndex = fields.findIndex(field => field.type === "tabs")

  if (tabsIndex !== -1) {
    const tabsField = fields[tabsIndex] as any
    const updatedTabs = {
      ...tabsField,
      tabs: [...(tabsField.tabs || []), buildSEOTab()],
    }
    return [...fields.slice(0, tabsIndex), updatedTabs, ...fields.slice(tabsIndex + 1)]
  } else {
    return [
      ...fields,
      {
        type: "tabs",
        tabs: [buildSEOTab()],
      },
    ]
  }
}

/*************************************************************************/
/*  ADMIN CONFIG BUILDER
/*************************************************************************/

function buildAdminConfig(
  baseConfig: any,
  userConfig: any,
  options: { livePreview: boolean; slug: string }
) {
  const merged = smartMergeAdmin(baseConfig, userConfig)

  if (options.livePreview) {
    merged.livePreview = {
      url: ({ data, req }: any) =>
        generatePreviewPath({
          slug: typeof data?.slug === "string" ? data.slug : "",
          collection: options.slug as CollectionSlug,
          req,
        }),
      ...userConfig?.livePreview,
    }

    merged.preview = (data: any, { req }: any) =>
      generatePreviewPath({
        slug: typeof data?.slug === "string" ? data.slug : "",
        collection: options.slug as CollectionSlug,
        req,
      })
  }

  return merged
}

function smartMergeAdmin(defaults: any, overrides: any): any {
  if (!defaults && !overrides) return {}
  if (!defaults) return overrides
  if (!overrides) return defaults

  const result = { ...defaults }

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) continue

    if (Array.isArray(value) && Array.isArray(result[key])) {
      result[key] = value
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] =
        result[key] && typeof result[key] === "object"
          ? { ...result[key], ...value }
          : value
    } else {
      result[key] = value
    }
  }

  return result
}

/*************************************************************************/
/*  MAIN FUNCTION
/*************************************************************************/

export function enableOnFrontend<TSlug extends CollectionSlug>(
  config: FrontendCollectionConfig<TSlug>
): CollectionConfig<TSlug> {
  /**
   * Extract options with defaults
   */
  const {
    seo = true,
    publishedAt = true,
    featuredImage = true,
    livePreview = true,
    ...cleanConfig
  } = config

  /**
   * Register collection in registry
   */
  const label =
    typeof config.labels?.plural === "string"
      ? config.labels.plural
      : capitalizeFirst(config.slug)

  frontendCollectionRegistry.set(config.slug, { slug: config.slug, label })

  /**
   * Build components
   */
  const additionalFields = buildAdditionalFields({ publishedAt, featuredImage })
  const fieldsWithSEO = addSEOToFields(
    [...(cleanConfig.fields || []), ...additionalFields],
    seo
  )
  const finalFields = [...fieldsWithSEO, ...slugField()]

  const adminConfig = buildAdminConfig(getDefaultAdminConfig(), cleanConfig.admin, {
    livePreview,
    slug: config.slug,
  })

  const hooks = buildHooks(cleanConfig.hooks, { publishedAt })

  /**
   * Return enhanced frontend-ready config
   */
  return {
    ...getDefaultConfig(),
    ...cleanConfig,
    fields: finalFields,
    admin: adminConfig,
    hooks,
  } as CollectionConfig<TSlug>
}

/*************************************************************************/
/*  DEFAULTS
/*************************************************************************/

function getDefaultAdminConfig() {
  return {
    defaultColumns: ["title", "featuredImage", "slug", "updatedAt", "id", "status"],
    useAsTitle: "title",
    hideAPIURL: process.env.NODE_ENV === "production",
  }
}

function getDefaultConfig() {
  return {
    versions: {
      drafts: {
        autosave: { interval: 100 },
        schedulePublish: true,
      },
      maxPerDoc: 50,
    },
    defaultPopulate: {
      title: true,
      slug: true,
      uri: true,
    },
  }
}

function buildHooks(userHooks: any, options: { publishedAt: boolean }) {
  const beforeChange = [...(userHooks?.beforeChange || []), beforeCollectionChange]

  if (options.publishedAt) {
    beforeChange.push(populatePublishedAt)
  }

  return {
    ...userHooks,
    beforeChange,
    afterChange: [...(userHooks?.afterChange || []), afterCollectionChange],
    afterDelete: [...(userHooks?.afterDelete || []), afterCollectionDelete],
    beforeOperation: [...(userHooks?.beforeOperation || []), lockSlugAfterPublish],
  }
}

/*************************************************************************/
/*  UTILITIES
/*************************************************************************/

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/*************************************************************************/
/*  STATIC PROXY
/*************************************************************************/

export const frontendCollections: FrontendCollection[] = new Proxy(
  [] as FrontendCollection[],
  {
    get(_, prop) {
      const registryArray = Array.from(frontendCollectionRegistry.values())
      if (prop === "length") return registryArray.length
      if (typeof prop === "string" && /^\d+$/.test(prop)) {
        return registryArray[parseInt(prop, 10)]
      }
      if (typeof prop === "string" && prop in Array.prototype) {
        const arrayMethod = (Array.prototype as any)[prop]
        if (typeof arrayMethod === "function") {
          return arrayMethod.bind(registryArray)
        }
      }
      return (registryArray as any)[prop]
    },
    has(_, prop) {
      return prop in Array.from(frontendCollectionRegistry.values())
    },
    ownKeys(_) {
      return Object.keys(Array.from(frontendCollectionRegistry.values()))
    },
  }
)
