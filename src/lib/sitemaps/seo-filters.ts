/*************************************************************************/
/*  SEO FILTERING LOGIC FOR SITEMAPS
/*************************************************************************/

export interface SEOFieldsCheck {
  noIndex?: boolean
  canonicalUrl?: string
}

export interface DocumentForSEO {
  uri: string
  _status: string
  noIndex?: boolean
  canonicalUrl?: string
  meta?: {
    noIndex?: boolean
    canonicalUrl?: string
  }
}

/*************************************************************************/
/*  SEO FILTERING FUNCTIONS
/*************************************************************************/

/**
 * Check if a document should be included in sitemaps based on SEO settings
 */
export function shouldIncludeInSitemap(doc: DocumentForSEO): boolean {
  // Only include published documents
  if (doc._status !== "published") {
    return false
  }

  // Check for noIndex (check both top-level and meta fields for compatibility)
  const noIndex = doc.noIndex || doc.meta?.noIndex
  if (noIndex === true) {
    return false
  }

  // Check for external canonical URLs (exclude from our sitemap)
  const canonicalUrl = doc.canonicalUrl || doc.meta?.canonicalUrl
  if (canonicalUrl && isExternalCanonical(canonicalUrl)) {
    return false
  }

  return true
}

/**
 * Check if a canonical URL is external (points to different domain)
 */
export function isExternalCanonical(canonicalUrl: string): boolean {
  if (!canonicalUrl) return false

  // If it starts with http:// or https://, it's external
  if (canonicalUrl.startsWith("http://") || canonicalUrl.startsWith("https://")) {
    return true
  }

  // If it starts with //, it's protocol-relative external
  if (canonicalUrl.startsWith("//")) {
    return true
  }

  // Otherwise it's internal (relative path or absolute path on our domain)
  return false
}

/**
 * Get the effective canonical URL for a document
 */
export function getCanonicalUrl(doc: DocumentForSEO, siteUrl: string): string {
  const canonicalUrl = doc.canonicalUrl || doc.meta?.canonicalUrl

  // If external canonical is set, use it as-is
  if (canonicalUrl && isExternalCanonical(canonicalUrl)) {
    return canonicalUrl
  }

  // If internal canonical is set, make it absolute
  if (canonicalUrl && canonicalUrl.startsWith("/")) {
    return `${siteUrl}${canonicalUrl}`
  }

  // Default: use the document's URI
  return `${siteUrl}${doc.uri}`
}

/**
 * Filter documents for sitemap inclusion with SEO compliance
 */
export function filterDocumentsForSitemap<T extends DocumentForSEO>(documents: T[]): T[] {
  return documents.filter(shouldIncludeInSitemap)
}

/**
 * Get SEO-compliant sitemap entry for a document
 */
export interface SitemapEntry {
  loc: string
  lastmod: string
  priority?: number
  changefreq?: string
}

export function createSitemapEntry(
  doc: DocumentForSEO,
  siteUrl: string,
  priority?: number,
  changefreq?: string
): SitemapEntry {
  const entry: SitemapEntry = {
    loc: getCanonicalUrl(doc, siteUrl),
    lastmod: (doc as any).updatedAt || new Date().toISOString(),
  }

  if (priority !== undefined) {
    entry.priority = priority
  }

  if (changefreq) {
    entry.changefreq = changefreq
  }

  return entry
}

/*************************************************************************/
/*  UTILITY FUNCTIONS FOR PAYLOAD FIELD SELECTION
/*************************************************************************/

/**
 * Get required fields for SEO filtering (use this in cache queries)
 */
export function getSEOFieldSelection() {
  return {
    uri: true,
    _status: true,
    updatedAt: true,
    noIndex: true,
    canonicalUrl: true,
    // Also include meta fields for backward compatibility
    "meta.noIndex": true,
    "meta.canonicalUrl": true,
  }
}

/**
 * Validate that a document has the required SEO fields for filtering
 */
export function validateSEOFields(doc: any): doc is DocumentForSEO {
  return (
    typeof doc === "object" &&
    doc !== null &&
    typeof doc.uri === "string" &&
    typeof doc._status === "string"
  )
}
