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
  collection?: string // Added for sitemap collection-specific config
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
  if (doc._status !== "published") {
    return false
  }

  const noIndex = doc.noIndex || doc.meta?.noIndex
  if (noIndex === true) {
    return false
  }

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

  if (canonicalUrl.startsWith("http://") || canonicalUrl.startsWith("https://")) {
    return true
  }

  if (canonicalUrl.startsWith("//")) {
    return true
  }

  return false
}

/**
 * Get the effective canonical URL for a document
 */
export function getCanonicalUrl(doc: DocumentForSEO, siteUrl: string): string {
  const canonicalUrl = doc.canonicalUrl || doc.meta?.canonicalUrl

  if (canonicalUrl && isExternalCanonical(canonicalUrl)) {
    return canonicalUrl
  }

  if (canonicalUrl && canonicalUrl.startsWith("/")) {
    return `${siteUrl}${canonicalUrl}`
  }

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
