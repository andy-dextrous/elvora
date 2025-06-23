/*************************************************************************/
/*  URI VERIFICATION UTILITY - Development Helper
/*************************************************************************/

interface DocumentWithURI {
  slug?: string
  uri?: string
  [key: string]: any
}

/*************************************************************************/
/*  URI USAGE VERIFICATION FUNCTIONS
/*************************************************************************/

/**
 * Verify that a document has a URI field and warn if it's missing
 * Use this in development to ensure components are URI-ready
 */
export function verifyURIField(doc: DocumentWithURI, context: string): string {
  if (process.env.NODE_ENV === "development") {
    if (!doc.uri && doc.slug) {
      console.warn(
        `🚨 URI System Warning [${context}]: Document with slug "${doc.slug}" is missing URI field. Using fallback path construction.`
      )
    }
  }

  return doc.uri || `/${doc.slug || ""}`
}

/**
 * Verify that a collection of documents have URI fields
 * Use this for archive pages and collections
 */
export function verifyCollectionURIs(
  docs: DocumentWithURI[],
  collectionName: string
): void {
  if (process.env.NODE_ENV === "development") {
    const missingURIs = docs.filter(doc => !doc.uri && doc.slug)

    if (missingURIs.length > 0) {
      console.warn(
        `🚨 URI System Warning [${collectionName} Collection]: ${missingURIs.length} documents are missing URI fields:`,
        missingURIs.map(doc => doc.slug).join(", ")
      )
    }
  }
}

/**
 * Log URI migration progress
 * Use this to track which components have been migrated
 */
export function logURIUsage(
  componentName: string,
  uriCount: number,
  fallbackCount: number
): void {
  if (process.env.NODE_ENV === "development") {
    const total = uriCount + fallbackCount
    const percentage = total > 0 ? Math.round((uriCount / total) * 100) : 0

    console.log(
      `✅ URI System Progress [${componentName}]: ${percentage}% using URI fields (${uriCount}/${total})`
    )
  }
}

/**
 * Create a safe URL from document data with proper fallback
 * This is the recommended way to generate URLs in components
 */
export function createSafeURL(doc: DocumentWithURI, context?: string): string {
  // Homepage special case
  if (doc.slug === "home") {
    return "/"
  }

  // Priority 1: Use URI field if available
  if (doc.uri && typeof doc.uri === "string") {
    return doc.uri.startsWith("/") ? doc.uri : `/${doc.uri}`
  }

  // Development warning
  if (process.env.NODE_ENV === "development" && context) {
    console.warn(
      `⚠️ URI System [${context}]: Using fallback URL construction for document with slug "${doc.slug}"`
    )
  }

  // Fallback: Basic slug construction
  if (doc.slug && typeof doc.slug === "string") {
    return `/${doc.slug}`
  }

  return "/"
}

/**
 * Check if a document is ready for the URI system
 */
export function isURIReady(doc: DocumentWithURI): boolean {
  return !!(doc.uri && typeof doc.uri === "string")
}

/**
 * Get URI system migration statistics for a collection
 */
export function getURIStats(docs: DocumentWithURI[]): {
  total: number
  withURI: number
  withoutURI: number
  percentage: number
} {
  const total = docs.length
  const withURI = docs.filter(doc => isURIReady(doc)).length
  const withoutURI = total - withURI
  const percentage = total > 0 ? Math.round((withURI / total) * 100) : 0

  return {
    total,
    withURI,
    withoutURI,
    percentage,
  }
}
