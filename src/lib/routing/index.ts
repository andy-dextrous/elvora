/*************************************************************************/
/*  ROUTING MODULE - MAIN EXPORTS
/*************************************************************************/

// URI Engine - Core routing functionality
export { routingEngine, validateURI, type URIConflictResult } from "./uri-engine"

// URI Index Manager - Index maintenance and population
export {
  updateURI as updateURIIndex,
  deleteURI as deleteFromURIIndex,
  checkURIConflict,
  regenerateURIs as populateURIIndex,
  type URIIndexUpdate,
  type PopulationStats,
} from "./index-manager"
