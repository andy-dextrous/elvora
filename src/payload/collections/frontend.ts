import { slugField } from "@/payload/fields/slug"
import { lockSlugAfterPublish } from "@/payload/hooks/lock-slug"
import {
  afterCollectionChange,
  afterCollectionDelete,
  beforeCollectionChange,
} from "@/payload/hooks/universal-revalidation"
import type { CollectionConfig, CollectionSlug } from "payload"

export type FrontendCollection = {
  slug: string
  label: string
}

/*************************************************************************/
/*  FRONTEND COLLECTION REGISTRY
/*************************************************************************/

const frontendCollectionRegistry = new Map<string, FrontendCollection>()

/**
 * Factory function that wraps a collection config to make it a frontend collection.
 * Automatically adds slug fields and revalidation hooks.
 */
export function enableFrontend<TSlug extends CollectionSlug>(
  config: CollectionConfig<TSlug>,
  label?: string
): CollectionConfig<TSlug> {
  frontendCollectionRegistry.set(config.slug, {
    slug: config.slug,
    label: label || capitalizeFirst(config.slug),
  })

  const enhancedConfig: CollectionConfig<TSlug> = {
    ...config,
    fields: [...config.fields, ...slugField()],
    hooks: {
      ...config.hooks,
      beforeChange: [...(config.hooks?.beforeChange || []), beforeCollectionChange],
      afterChange: [...(config.hooks?.afterChange || []), afterCollectionChange],
      afterDelete: [...(config.hooks?.afterDelete || []), afterCollectionDelete],
      beforeOperation: [...(config.hooks?.beforeOperation || []), lockSlugAfterPublish],
    },
  }

  return enhancedConfig
}

/*************************************************************************/
/*  REGISTRY ACCESS FUNCTIONS
/*************************************************************************/

/**
 * Get all registered frontend collections
 */
export function getFrontendCollections(): FrontendCollection[] {
  return Array.from(frontendCollectionRegistry.values())
}

/**
 * Check if a collection is a frontend collection that should be indexed
 */
export function isFrontendCollection(collectionSlug: string): boolean {
  return frontendCollectionRegistry.has(collectionSlug)
}

/**
 * Get a specific frontend collection by slug
 */
export function getFrontendCollection(slug: string): FrontendCollection | undefined {
  return frontendCollectionRegistry.get(slug)
}

/*************************************************************************/
/*  DYNAMIC EXPORT - BACKWARD COMPATIBILITY
/*************************************************************************/

/**
 * Dynamic array that automatically reflects all registered frontend collections
 */
export const frontendCollections: FrontendCollection[] = new Proxy(
  [] as FrontendCollection[],
  {
    get(_, prop) {
      const registryArray = Array.from(frontendCollectionRegistry.values())

      if (prop === "length") {
        return registryArray.length
      }

      if (typeof prop === "string" && /^\d+$/.test(prop)) {
        const index = parseInt(prop, 10)
        return registryArray[index]
      }

      // Support array methods like map, filter, forEach, etc.
      if (typeof prop === "string" && prop in Array.prototype) {
        const arrayMethod = (Array.prototype as any)[prop]
        if (typeof arrayMethod === "function") {
          return arrayMethod.bind(registryArray)
        }
      }

      return (registryArray as any)[prop]
    },

    has(_, prop) {
      const registryArray = Array.from(frontendCollectionRegistry.values())
      return prop in registryArray
    },

    ownKeys(_) {
      const registryArray = Array.from(frontendCollectionRegistry.values())
      return Object.keys(registryArray)
    },
  }
)

/*************************************************************************/
/*  UTILITIES
/*************************************************************************/

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
