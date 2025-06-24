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
    dependencies: ["global:settings"],
  },
  posts: {
    ttl: 1800,
    dependencies: ["global:settings", "collection:categories"],
  },
  services: {
    ttl: 7200,
    dependencies: ["global:settings"],
  },
  team: {
    ttl: 86400,
    dependencies: [],
  },
  testimonials: {
    ttl: 86400,
    dependencies: [],
  },
  categories: {
    ttl: 7200,
    dependencies: [],
  },
  templates: {
    ttl: 86400,
    dependencies: ["global:settings"],
  },

  // Globals (using proper naming convention)
  "global:settings": {
    ttl: 7200,
    dependencies: [],
  },
  "global:header": {
    ttl: 7200,
    dependencies: [],
  },
  "global:footer": {
    ttl: 7200,
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
 */
export function getInvalidationTargets(changedItem: string): string[] {
  return Object.entries(CACHE_CONFIG)
    .filter(([collection, config]) => {
      if (collection === "default") return false

      return config.dependencies.includes(changedItem)
    })
    .map(([collection]) => {
      if (collection.startsWith("global:")) {
        return collection
      }
      return `collection:${collection}`
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
