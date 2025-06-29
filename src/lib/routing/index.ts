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

// Dependent Updates Operations - Business logic for URI dependent updates
export {
  processArchivePageUpdate,
  processPageHierarchyUpdate,
  processHomepageChange,
  processSettingsChange,
  type DependentUpdatesResult,
  type DependentUpdatesAdditionalData,
} from "./dependency-updates"

// Dependency Analysis - Relationship and impact analysis
export {
  getCollectionsUsingArchive,
  getCollectionItemsForArchive,
  findDescendantPages,
  getDependentUpdatesImpactSize,
  detectArchiveChanges,
  detectHierarchyChanges,
  detectHomepageChange,
  detectAllSettingsChanges,
} from "./dependency-analyzer"
