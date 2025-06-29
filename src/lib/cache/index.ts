export { cache } from "./cache"

// Main revalidation system - all functions consolidated in one file
export {
  revalidate,
  batchRevalidate,
  revalidateGlobal,
  revalidateAll,
  revalidateCollection,
  shouldSkipInvalidation,
  getInvalidationPriority,
  type RevalidateOptions,
  type InvalidationResult,
  type BatchInvalidationSummary,
  type BatchRevalidateOptions,
} from "./revalidation"
