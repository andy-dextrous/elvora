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
