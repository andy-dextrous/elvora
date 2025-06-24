/*************************************************************************/
/*  CACHE CONFIGURATION SYSTEM - TYPES & INTERFACES
/*************************************************************************/

export interface CacheCollectionConfig {
  ttl: number
  dependencies: string[]
}

export interface CacheConfig {
  default: CacheCollectionConfig
  [collection: string]: CacheCollectionConfig
}

/*************************************************************************/
/*  CACHE CONFIGURATION OBJECT
/*************************************************************************/

export const CACHE_CONFIG: CacheConfig = {
  default: {
    ttl: 3600,
    dependencies: [],
  },

  // Collections
  pages: {
    ttl: 3600,
    dependencies: ["global:settings", "collection:templates"],
  },
  posts: {
    ttl: 1800,
    dependencies: ["global:settings", "collection:categories", "collection:templates"],
  },
  services: {
    ttl: 7200,
    dependencies: ["global:settings", "collection:templates"],
  },
  team: {
    ttl: 86400,
    dependencies: ["collection:templates"],
  },
  testimonials: {
    ttl: 86400,
    dependencies: ["collection:templates"],
  },
  categories: {
    ttl: 7200,
    dependencies: [],
  },
  templates: {
    ttl: 86400, // Templates change infrequently
    dependencies: ["global:settings"], // Templates depend on routing settings
  },

  // Globals (using proper naming convention)
  "global:settings": {
    ttl: 7200, // Settings change less frequently
    dependencies: [],
  },
  "global:header": {
    ttl: 7200, // Header changes less frequently
    dependencies: [],
  },
  "global:footer": {
    ttl: 7200, // Footer changes less frequently
    dependencies: [],
  },
}

/*************************************************************************/
/*  CACHE CONFIGURATION FUNCTIONS
/*************************************************************************/

/**
 * Get cache configuration for a collection with fallback defaults
 */
export function getCacheConfig(collection: string): CacheCollectionConfig {
  return {
    ...CACHE_CONFIG.default,
    ...CACHE_CONFIG[collection],
  }
}

/**
 * Get all collections/globals that depend on a specific item
 * This enables configuration-driven cascade invalidation
 */
export function getInvalidationTargets(changedItem: string): string[] {
  return Object.entries(CACHE_CONFIG)
    .filter(([collection, config]) => {
      // Skip the default config entry
      if (collection === "default") return false

      // Check if this collection/global has the changed item as a dependency
      return config.dependencies.includes(changedItem)
    })
    .map(([collection]) => {
      // Convert collection names to proper tag format
      if (collection.startsWith("global:")) {
        return collection // Already in global: format
      }
      return `collection:${collection}` // Convert to collection: format
    })
}

/**
 * Get all dependency relationships for debugging/visualization
 */
export function getDependencyGraph(): Record<string, string[]> {
  const graph: Record<string, string[]> = {}

  Object.entries(CACHE_CONFIG).forEach(([collection, config]) => {
    if (collection !== "default" && config.dependencies.length > 0) {
      config.dependencies.forEach(dependency => {
        if (!graph[dependency]) {
          graph[dependency] = []
        }
        graph[dependency].push(collection)
      })
    }
  })

  return graph
}
