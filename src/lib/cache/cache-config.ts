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
  redirects: {
    ttl: 3600,
    dependencies: [],
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

/**
 * Validate cache configuration for orphaned tags and missing dependencies
 */
export function validateCacheConfig(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for orphaned dependencies
  Object.entries(CACHE_CONFIG).forEach(([collection, config]) => {
    if (collection === "default") return

    config.dependencies.forEach(dependency => {
      if (dependency.startsWith("global:")) {
        const globalSlug = dependency.replace("global:", "")
        if (!CACHE_CONFIG[dependency]) {
          warnings.push(
            `Collection "${collection}" depends on "${dependency}" but it's not in cache config`
          )
        }
      } else if (dependency.startsWith("collection:")) {
        const collectionSlug = dependency.replace("collection:", "")
        if (!CACHE_CONFIG[collectionSlug]) {
          errors.push(
            `Collection "${collection}" depends on "${dependency}" but collection "${collectionSlug}" is not in cache config`
          )
        }
      }
    })
  })

  // Check for circular dependencies
  const visited = new Set<string>()
  const visiting = new Set<string>()

  function checkCircular(collection: string): boolean {
    if (visiting.has(collection)) {
      errors.push(`Circular dependency detected involving "${collection}"`)
      return true
    }
    if (visited.has(collection)) return false

    visiting.add(collection)
    const config = CACHE_CONFIG[collection]

    if (config) {
      for (const dependency of config.dependencies) {
        const depCollection = dependency.replace(/^(global:|collection:)/, "")
        if (checkCircular(depCollection)) return true
      }
    }

    visiting.delete(collection)
    visited.add(collection)
    return false
  }

  Object.keys(CACHE_CONFIG).forEach(collection => {
    if (collection !== "default") {
      checkCircular(collection)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
