export interface ChangeDetection {
  uriChanged: boolean
  statusChanged: boolean
  contentChanged: boolean
  slugChanged: boolean
  parentChanged: boolean
  titleChanged: boolean
  oldUri?: string
  newUri?: string
  oldSlug?: string
  newSlug?: string
  oldParent?: string
  newParent?: string
  oldStatus?: string
  newStatus?: string
}

export interface CollectionChange {
  collection: string
  doc: any
  previousDoc?: any
  changes: ChangeDetection
  operation: "create" | "update" | "delete"
}

/*************************************************************************/
/*  UNIFIED CHANGE DETECTION
/*************************************************************************/

export function detectChanges(
  doc: any,
  previousDoc?: any,
  operation: "create" | "update" | "delete" = "update"
): ChangeDetection {
  const changes: ChangeDetection = {
    uriChanged: false,
    statusChanged: false,
    contentChanged: false,
    slugChanged: false,
    parentChanged: false,
    titleChanged: false,
  }

  /**
   * Handle create operations
   */
  if (operation === "create" || !previousDoc) {
    changes.contentChanged = true
    changes.newUri = doc.uri || (doc.slug ? `/${doc.slug}` : undefined)
    changes.newSlug = doc.slug
    changes.newStatus = doc._status
    changes.newParent = doc.parent?.id || doc.parent
    return changes
  }

  /**
   * Handle delete operations
   */
  if (operation === "delete") {
    changes.contentChanged = true
    changes.oldUri =
      previousDoc.uri || (previousDoc.slug ? `/${previousDoc.slug}` : undefined)
    changes.oldSlug = previousDoc.slug
    changes.oldStatus = previousDoc._status
    changes.oldParent = previousDoc.parent?.id || previousDoc.parent
    return changes
  }

  /**
   * Handle update operations - detailed change detection
   */
  const oldUri =
    previousDoc.uri || (previousDoc.slug ? `/${previousDoc.slug}` : undefined)
  const newUri = doc.uri || (doc.slug ? `/${doc.slug}` : undefined)
  const oldSlug = previousDoc.slug
  const newSlug = doc.slug
  const oldStatus = previousDoc._status
  const newStatus = doc._status
  const oldParent = previousDoc.parent?.id || previousDoc.parent
  const newParent = doc.parent?.id || doc.parent
  const oldTitle = previousDoc.title || previousDoc.name
  const newTitle = doc.title || doc.name

  /**
   * URI changes
   */
  if (oldUri !== newUri) {
    changes.uriChanged = true
    changes.oldUri = oldUri
    changes.newUri = newUri
  }

  /**
   * Slug changes
   */
  if (oldSlug !== newSlug) {
    changes.slugChanged = true
    changes.oldSlug = oldSlug
    changes.newSlug = newSlug
  }

  /**
   * Status changes
   */
  if (oldStatus !== newStatus) {
    changes.statusChanged = true
    changes.oldStatus = oldStatus
    changes.newStatus = newStatus
  }

  /**
   * Parent changes (for hierarchical content)
   */
  if (oldParent !== newParent) {
    changes.parentChanged = true
    changes.oldParent = oldParent
    changes.newParent = newParent
  }

  /**
   * Title changes (affects navigation display)
   */
  if (oldTitle !== newTitle) {
    changes.titleChanged = true
  }

  /**
   * Content changes (deep comparison excluding system fields)
   */
  if (hasContentChanges(doc, previousDoc)) {
    changes.contentChanged = true
  }

  return changes
}

/*************************************************************************/
/*  CONTENT CHANGE DETECTION
/*************************************************************************/

function hasContentChanges(doc: any, previousDoc: any): boolean {
  // Fields to exclude from content change detection
  const excludeFields = [
    "id",
    "_status",
    "createdAt",
    "updatedAt",
    "__v",
    "uri",
    "slug",
    "parent",
    "title",
    "name",
  ]

  // Create clean objects for comparison
  const cleanDoc = { ...doc }
  const cleanPreviousDoc = { ...previousDoc }

  excludeFields.forEach(field => {
    delete cleanDoc[field]
    delete cleanPreviousDoc[field]
  })

  return JSON.stringify(cleanDoc) !== JSON.stringify(cleanPreviousDoc)
}

/*************************************************************************/
/*  CHANGE IMPACT ANALYSIS
/*************************************************************************/

export function getChangeImpact(changes: ChangeDetection): {
  requiresURIRegeneration: boolean
  requiresCascadeOperation: boolean
  requiresNavigationUpdate: boolean
  requiresRedirect: boolean
  severity: "low" | "medium" | "high"
} {
  let severity: "low" | "medium" | "high" = "low"
  let requiresURIRegeneration = false
  let requiresCascadeOperation = false
  let requiresNavigationUpdate = false
  let requiresRedirect = false

  // High impact changes
  if (changes.uriChanged || changes.slugChanged) {
    severity = "high"
    requiresURIRegeneration = true
    requiresRedirect = true
  }

  if (changes.parentChanged) {
    severity = "high"
    requiresCascadeOperation = true
    requiresURIRegeneration = true
  }

  if (changes.statusChanged) {
    severity = "high"
    requiresNavigationUpdate = true
  }

  // Medium impact changes
  if (changes.titleChanged) {
    severity = severity === "low" ? "medium" : severity
    requiresNavigationUpdate = true
  }

  // Low impact (content only)
  if (
    changes.contentChanged &&
    !changes.uriChanged &&
    !changes.statusChanged &&
    !changes.slugChanged
  ) {
    severity = "low"
  }

  return {
    requiresURIRegeneration,
    requiresCascadeOperation,
    requiresNavigationUpdate,
    requiresRedirect,
    severity,
  }
}

/*************************************************************************/
/*  BATCH CHANGE ANALYSIS
/*************************************************************************/

export function analyzeBatchChanges(operations: CollectionChange[]): {
  totalChanges: number
  highImpactChanges: number
  cascadeOperationsNeeded: number
  collectionsAffected: string[]
  summary: string
} {
  const collectionsAffected = new Set<string>()
  let highImpactChanges = 0
  let cascadeOperationsNeeded = 0

  for (const operation of operations) {
    collectionsAffected.add(operation.collection)

    const impact = getChangeImpact(operation.changes)

    if (impact.severity === "high") {
      highImpactChanges++
    }

    if (impact.requiresCascadeOperation) {
      cascadeOperationsNeeded++
    }
  }

  const summary = `${operations.length} changes across ${collectionsAffected.size} collections. ${highImpactChanges} high-impact, ${cascadeOperationsNeeded} requiring cascades.`

  return {
    totalChanges: operations.length,
    highImpactChanges,
    cascadeOperationsNeeded,
    collectionsAffected: Array.from(collectionsAffected),
    summary,
  }
}

/*************************************************************************/
/*  CHANGE DETECTION UTILITIES
/*************************************************************************/

export function isSignificantChange(changes: ChangeDetection): boolean {
  return (
    changes.uriChanged ||
    changes.statusChanged ||
    changes.slugChanged ||
    changes.parentChanged ||
    changes.titleChanged
  )
}

export function isStructuralChange(changes: ChangeDetection): boolean {
  return changes.uriChanged || changes.parentChanged || changes.slugChanged
}

export function isNavigationChange(changes: ChangeDetection): boolean {
  return changes.statusChanged || changes.titleChanged || changes.uriChanged
}

export function isContentOnlyChange(changes: ChangeDetection): boolean {
  return (
    changes.contentChanged &&
    !changes.uriChanged &&
    !changes.statusChanged &&
    !changes.slugChanged &&
    !changes.parentChanged &&
    !changes.titleChanged
  )
}

/*************************************************************************/
/*  CHANGE VALIDATION
/*************************************************************************/

export function validateChanges(changes: ChangeDetection): {
  valid: boolean
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []

  // Check for URI conflicts
  if (changes.uriChanged && changes.newUri === changes.oldUri) {
    warnings.push("URI marked as changed but values are identical")
  }

  // Check for slug conflicts
  if (changes.slugChanged && changes.newSlug === changes.oldSlug) {
    warnings.push("Slug marked as changed but values are identical")
  }

  // Check for invalid URI patterns
  if (changes.newUri && changes.newUri.includes("//")) {
    errors.push("New URI contains double slashes")
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  }
}
