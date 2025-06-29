/*************************************************************************/
/*  ROUTING MODULE - MAIN EXPORTS
/*************************************************************************/

// URI Engine - Core routing functionality
export { routingEngine, validateURI, type URIConflictResult } from "./uri-engine"

// URI Index Manager - Index maintenance and population
export {
  updateURI,
  deleteURI,
  checkURIConflict,
  regenerateURIs,
  type URIIndexUpdate,
  type PopulationStats,
} from "./index-manager"

// Cascade Operations - Business logic for URI cascade updates
export {
  processArchivePageUpdate,
  processPageHierarchyUpdate,
  processHomepageChange,
  processSettingsChange,
  type CascadeResult,
  type CascadeAdditionalData,
} from "./cascade-operations"

// Dependency Analysis - Relationship and impact analysis
export {
  getCollectionsUsingArchive,
  getCollectionItemsForArchive,
  findDescendantPages,
  getCascadeImpactSize,
  detectArchiveChanges,
  detectHierarchyChanges,
  detectHomepageChange,
  detectAllSettingsChanges,
} from "./dependency-analyzer"
