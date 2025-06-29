export { cache } from "./cache"
export { revalidate } from "./revalidation"

// Main surgical invalidation system
export {
  revalidateForDocumentChange,
  revalidateForBatchChanges,
  revalidateForGlobalChange,
  shouldSkipInvalidation,
} from "./surgical-invalidation"
