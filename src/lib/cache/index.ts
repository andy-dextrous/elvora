// Export all cache functionality from a single entry point
export * from "./cache"
export * from "./cache-config"
export * from "./revalidation"

// Convenience exports for commonly used functions
export { cache } from "./cache"
export { revalidateAll } from "./revalidation"
export { validateCacheConfig } from "./cache-config"
