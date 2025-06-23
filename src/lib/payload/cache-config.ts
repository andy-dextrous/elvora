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
