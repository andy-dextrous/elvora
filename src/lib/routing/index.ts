/*************************************************************************/
/*  ROUTING MODULE - MAIN EXPORTS
/*************************************************************************/

// URI Engine - Core routing functionality
export {
  routingEngine,
  createURIHook,
  validateURI,
  type URIConflictResult,
} from "./uri-engine"

/*************************************************************************/
/*  CONVENIENCE FUNCTIONS
/*************************************************************************/

/**
 * Quick function to generate a URI for a document
 */
export async function quickGenerateURI(
  collection: string,
  slug: string,
  data?: any
): Promise<string> {
  const { routingEngine } = await import("./uri-engine")
  return routingEngine.generate({ collection, slug, data })
}

/**
 * Quick function to validate a URI
 */
export async function quickValidateURI(uri: string): Promise<boolean> {
  const { validateURI } = await import("./uri-engine")
  return validateURI(uri).isValid
}

/**
 * Debug function to test all URIs
 */
export async function debugAllURIs(draft = false) {
  const { routingEngine } = await import("./uri-engine")
  const uris = await routingEngine.getAllURIs(draft)

  console.log(`Found ${uris.length} URIs:`)
  uris.forEach(uri => console.log(`  ${uri}`))

  return uris
}
