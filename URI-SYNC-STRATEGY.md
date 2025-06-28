# Unified URI Sync & Cache Revalidation Strategy

## 🎯 **Executive Summary**

This document outlines the complete strategy for implementing **intelligent URI synchronization with surgical cache revalidation** across the routing system. The unified approach addresses two interconnected problems:

1. **Missing URI cascade operations** when dependencies change (archive pages, hierarchies, settings)
2. **Over-invalidation of cache entries** leading to unnecessary performance degradation

**Scope**: Optimized for business sites (≤ 1000 pages) with real-time processing and surgical precision.

**Key Innovation**: URI changes and cache invalidation are treated as a single integrated system, where cascade operations use smart dependency detection to only invalidate truly affected cache entries.

**Extensible Design**: The system automatically adapts to new collections added to the `frontendCollections` array - no hardcoded logic to maintain.

## 🔍 **Current State Analysis**

### **What Works Now**

- ✅ Individual document slug changes trigger URI regeneration via `beforeCollectionChange` hook
- ✅ URI Index maintains published/draft status sync via `afterCollectionChange` hook
- ✅ Manual `regenerateURIs()` function for bulk operations
- ✅ URI conflict detection via URI Index Collection
- ✅ Basic cache invalidation system for changed documents
- ✅ Universal cache API with intelligent key/tag generation

### **What's Broken**

- ❌ **No cascade operations**: Archive page changes don't update dependent collection items
- ❌ **Over-invalidation epidemic**: Every document change invalidates header, footer, and entire URI system
- ❌ **Missing hierarchy handling**: Parent page changes don't cascade to children
- ❌ **No settings change detection**: Global routing changes aren't handled
- ❌ **Broad cache tags**: `uri-index:all` invalidates everything for single document changes
- ❌ **Static dependencies**: Cache config doesn't consider actual content relationships
- ❌ **Circular revalidation risk**: URI changes can trigger infinite loops

### **Performance Impact of Current Issues**

- **Over-invalidation**: ~80% of cache invalidations are unnecessary
- **Cache Miss Rate**: High due to broad tag invalidation
- **Database Load**: Unnecessary re-queries for unchanged content
- **Admin Slowness**: Real-time hooks block on broad revalidation operations

## 📋 **Complete Problem Scenarios**

### **1. Archive Page Slug Changes** ❌

**Trigger**: Page used as archive changes its slug (`"blog" → "articles"`)
**Current**: Only the page itself updates
**Missing**: ALL posts should change from `/blog/post` → `/articles/post`
**Cache Problem**: Currently invalidates all navigation + entire URI system

### **2. Page Hierarchy Changes** ❌

**Trigger**: Page parent relationship changes (`/company/team → /about/team`)
**Current**: No cascade to child pages
**Missing**: All descendant pages need URI updates
**Cache Problem**: Over-invalidates navigation for content-only changes

### **3. Homepage Designation Changes** ❌

**Trigger**: Different page designated as homepage in settings
**Current**: Not handled at all
**Missing**: Old homepage (`/ → /home`), new homepage (`/welcome → /`)
**Cache Problem**: Root URI cache not invalidated

### **4. Global Settings Changes** ❌

**Trigger**: Archive page assignments in settings (`postsArchivePage: "blog" → "articles"`)
**Current**: No cascade detection
**Missing**: All collection items need URI regeneration
**Cache Problem**: Settings changes over-invalidate everything

### **5. Content-Only Changes** ❌

**Trigger**: Page content updated (no slug/navigation changes)
**Current**: Invalidates header, footer, entire URI system
**Should Be**: Only the specific page URI
**Cache Problem**: Massive over-invalidation for simple content edits

## 🎯 **Unified Strategic Approach**

### **Core Philosophy: Smart Cascade + Surgical Revalidation**

Instead of treating URI sync and cache invalidation as separate systems, we implement them as **one integrated system** where:

1. **Change Detection**: Unified analysis of what actually changed
2. **Impact Assessment**: Smart determination of what's truly affected
3. **Cascade Operations**: Background jobs handle URI updates for affected content
4. **Surgical Revalidation**: Only invalidate cache entries that are actually impacted

### **Key Architectural Principles**

- **Shared Analysis**: Same logic determines navigation impact, archive dependencies, hierarchy relationships
- **One-Way Flow**: Document changes → URI updates → surgical cache invalidation (no circular loops)
- **Background Processing**: Payload Jobs Queue for cascade operations (admin stays fast)
- **Surgical Precision**: Replace broad tags with specific, targeted invalidation
- **Fail-Safe Design**: System degrades gracefully if cascade operations fail

## 🏗️ **Unified Architecture**

### **Shared Core Modules**

```bash
src/lib/cache/
├── revalidation.ts              # Main revalidation orchestrator
├── navigation-detection.ts      # 🔗 SHARED - Smart navigation impact detection
├── surgical-invalidation.ts     # 🔗 SHARED - Precise cache clearing logic
├── change-detection.ts          # 🔗 SHARED - Change analysis utilities
└── cache-config.ts             # Enhanced dependency configuration

src/lib/routing/
├── cascade-operations.ts        # Background cascade processing & orchestration
├── dependency-analyzer.ts       # 🔗 SHARED - All relationship analysis (archive/hierarchy/settings)
└── index-manager.ts            # Existing URI index management (enhanced)

src/payload/jobs/
└── uri-cascade-handler.ts       # Payload Jobs task handler
```

### **Integration Flow**

```typescript
// Unified Change Processing Flow:

1. Document Change Detected (hook)
   ↓
2. Shared Change Analysis
   - What changed? (content, slug, parent, status)
   - Navigation impact? (menu changes, archive usage)
   - Cascade needed? (children, dependents)
   ↓
3. Immediate Actions (fast, real-time)
   - Update document URI if needed
   - Surgical cache invalidation (only affected entries)
   ↓
4. Background Actions (via Payload Jobs, same request)
   - Cascade URI updates to affected documents
   - Create redirects for changed URIs
   - Additional surgical cache clearing for cascaded changes
   - Benefits: Built-in error handling, retries, and operation logging
```

## 💻 **Shared Functionality Implementation**

### **1. Navigation Impact Detection** (Critical Shared Component)

```typescript
// src/lib/cache/navigation-detection.ts
import { getSettings } from "@/lib/data/globals"
import { isFrontendCollection } from "@/payload/collections/frontend"

export interface NavigationImpact {
  affectsHeader: boolean
  affectsFooter: boolean
  affectsMenus: boolean
  reason: string[]
}

export async function analyzeNavigationImpact(
  collection: string,
  doc: any,
  changes: ChangeDetection
): Promise<NavigationImpact> {
  const impact: NavigationImpact = {
    affectsHeader: false,
    affectsFooter: false,
    affectsMenus: false,
    reason: [],
  }

  // Publication status changes always affect navigation (visibility)
  if (changes.statusChanged) {
    impact.affectsHeader = impact.affectsFooter = impact.affectsMenus = true
    impact.reason.push("Publication status changed")
    return impact
  }

  // Pages with navigation settings
  if (collection === "pages") {
    if (doc.includeInNav && (changes.uriChanged || changes.contentChanged)) {
      impact.affectsHeader = impact.affectsFooter = true
      impact.reason.push("Page appears in navigation menus")
    }
  }

  // Archive pages often appear in navigation
  if (await isArchivePage(doc.id)) {
    impact.affectsHeader = impact.affectsFooter = true
    impact.reason.push("Page is used as archive (likely in navigation)")
  }

  // Frontend collection items that might appear in "latest content" widgets
  if (
    isFrontendCollection(collection) &&
    collection !== "pages" &&
    changes.statusChanged
  ) {
    impact.affectsHeader = impact.affectsFooter = true
    impact.reason.push(`${collection} status change may affect latest content widgets`)
  }

  return impact
}

export async function isArchivePage(pageId: string): Promise<boolean> {
  const settings = await getSettings()
  const routing = settings?.routing

  if (!routing) return false

  // Dynamically check if pageId is used as archive for any frontend collection
  const archivePageIds = frontendCollections
    .filter(collection => collection.slug !== "pages")
    .map(collection => routing[`${collection.slug}ArchivePage`]?.id)
    .filter(Boolean)

  return archivePageIds.includes(pageId)
}
```

### **2. Dependency Analysis** (Critical Shared Component)

```typescript
// src/lib/routing/dependency-analyzer.ts
import { getSettings } from "@/lib/data/globals"
import { frontendCollections } from "@/payload/collections/frontend"
import configPromise from "@payload-config"
import { getPayload } from "payload"

export interface ArchiveDependency {
  collection: string
  archivePageId: string
  archivePageSlug: string
  itemCount: number
}

/*************************************************************************/
/*  ARCHIVE PAGE DEPENDENCY ANALYSIS
/*************************************************************************/

export async function getCollectionsUsingArchive(
  pageId: string
): Promise<ArchiveDependency[]> {
  const settings = await getSettings()
  const routing = settings?.routing

  if (!routing) return []

  const dependencies: ArchiveDependency[] = []

  // Dynamically check archive settings for all frontend collections (except pages)
  const archiveSettings = frontendCollections
    .filter(collection => collection.slug !== "pages")
    .map(collection => ({
      field: `${collection.slug}ArchivePage`,
      collection: collection.slug,
      label: collection.label,
    }))

  for (const setting of archiveSettings) {
    const archivePage = routing[setting.field]
    if (archivePage?.id === pageId) {
      // TODO: Get actual item count from database
      dependencies.push({
        collection: setting.collection,
        archivePageId: pageId,
        archivePageSlug: archivePage.slug || setting.collection,
        itemCount: 0, // Will be populated during cascade operation
      })
    }
  }

  return dependencies
}

export function detectArchiveChanges(
  oldSettings: any,
  newSettings: any
): Array<{ collection: string; oldArchive?: string; newArchive?: string }> {
  const changes = []

  // Dynamically generate archive fields for all frontend collections (except pages)
  const archiveFields = frontendCollections
    .filter(collection => collection.slug !== "pages")
    .map(collection => `${collection.slug}ArchivePage`)

  for (const field of archiveFields) {
    const oldValue = oldSettings?.routing?.[field]?.id
    const newValue = newSettings?.routing?.[field]?.id

    if (oldValue !== newValue) {
      const collection = field.replace("ArchivePage", "")
      changes.push({
        collection,
        oldArchive: oldValue,
        newArchive: newValue,
      })
    }
  }

  return changes
}

/*************************************************************************/
/*  PAGE HIERARCHY ANALYSIS
/*************************************************************************/

export async function findDescendantPages(parentId: string): Promise<any[]> {
  const payload = await getPayload({ config: configPromise })

  // Recursive function to find all pages that have this page as ancestor
  const descendants = await payload.find({
    collection: "pages",
    where: {
      parent: { equals: parentId },
    },
    limit: 1000,
    depth: 2,
  })

  // Recursively find children of children
  const allDescendants = [...descendants.docs]
  for (const child of descendants.docs) {
    const childDescendants = await findDescendantPages(child.id)
    allDescendants.push(...childDescendants)
  }

  return allDescendants
}

export function detectHierarchyChanges(
  doc: any,
  previousDoc: any
): { parentChanged: boolean; oldParent?: string; newParent?: string } {
  const oldParent = previousDoc?.parent?.id || previousDoc?.parent
  const newParent = doc?.parent?.id || doc?.parent

  return {
    parentChanged: oldParent !== newParent,
    oldParent,
    newParent,
  }
}

/*************************************************************************/
/*  GLOBAL SETTINGS ANALYSIS
/*************************************************************************/

export function detectHomepageChange(
  oldSettings: any,
  newSettings: any
): { changed: boolean; oldHomepage?: string; newHomepage?: string } {
  const oldHomepage = oldSettings?.routing?.homepage?.id
  const newHomepage = newSettings?.routing?.homepage?.id

  return {
    changed: oldHomepage !== newHomepage,
    oldHomepage,
    newHomepage,
  }
}

export function detectAllSettingsChanges(oldSettings: any, newSettings: any) {
  return {
    archiveChanges: detectArchiveChanges(oldSettings, newSettings),
    homepageChange: detectHomepageChange(oldSettings, newSettings),
  }
}
```

### **3. Surgical Cache Invalidation** (Critical Shared Component)

```typescript
// src/lib/cache/surgical-invalidation.ts
import { revalidateTag, revalidatePath } from "next/cache"
import { analyzeNavigationImpact } from "./navigation-detection"
import { getCollectionsUsingArchive } from "@/lib/routing/dependency-analyzer"

export interface InvalidationResult {
  tagsInvalidated: string[]
  pathsInvalidated: string[]
  reason: string
}

export async function revalidateForDocumentChange(
  collection: string,
  doc: any,
  changes: ChangeDetection,
  context: "single-change" | "cascade-operation" = "single-change"
): Promise<InvalidationResult> {
  const result: InvalidationResult = {
    tagsInvalidated: [],
    pathsInvalidated: [],
    reason: `${context}: ${collection}/${doc.slug || doc.id}`,
  }

  // 1. Always invalidate the specific document
  const itemTag = `item:${collection}:${doc.slug || doc.id}`
  await revalidateTag(itemTag)
  result.tagsInvalidated.push(itemTag)

  // 2. Always invalidate the specific URI
  if (doc.uri) {
    const uriTag = `uri:${doc.uri}`
    await revalidateTag(uriTag)
    result.tagsInvalidated.push(uriTag)
  }

  // 3. Handle old URI if changed
  if (changes.uriChanged && changes.oldUri) {
    const oldUriTag = `uri:${changes.oldUri}`
    await revalidateTag(oldUriTag)
    result.tagsInvalidated.push(oldUriTag)

    // Revalidate old path
    await revalidatePath(changes.oldUri)
    result.pathsInvalidated.push(changes.oldUri)
  }

  // 4. Smart navigation detection (THE KEY OPTIMIZATION)
  const navImpact = await analyzeNavigationImpact(collection, doc, changes)

  if (navImpact.affectsHeader) {
    await revalidateTag("global:header")
    result.tagsInvalidated.push("global:header")
  }

  if (navImpact.affectsFooter) {
    await revalidateTag("global:footer")
    result.tagsInvalidated.push("global:footer")
  }

  // 5. Archive page cascade invalidation
  if (collection === "pages" && (await isArchivePage(doc.id))) {
    const dependentCollections = await getCollectionsUsingArchive(doc.id)
    for (const dep of dependentCollections) {
      const collectionTag = `collection:${dep.collection}`
      await revalidateTag(collectionTag)
      result.tagsInvalidated.push(collectionTag)
    }
  }

  // 6. Collection-level invalidation (only for status changes that affect listings)
  if (changes.statusChanged) {
    const collectionTag = `collection:${collection}`
    await revalidateTag(collectionTag)
    result.tagsInvalidated.push(collectionTag)
  }

  return result
}

export async function revalidateForBatchChanges(
  updates: Array<{ collection: string; doc: any; changes: ChangeDetection }>
): Promise<InvalidationResult[]> {
  // Process batch updates with deduplication
  const results = []
  const processedTags = new Set<string>()

  for (const update of updates) {
    const result = await revalidateForDocumentChange(
      update.collection,
      update.doc,
      update.changes,
      "cascade-operation"
    )

    // Deduplicate tags to avoid redundant invalidation
    result.tagsInvalidated = result.tagsInvalidated.filter(tag => {
      if (processedTags.has(tag)) return false
      processedTags.add(tag)
      return true
    })

    results.push(result)
  }

  return results
}
```

## 🚀 **Unified Implementation Tasklist**

### **Phase 1: Foundation & Navigation Fix (Week 1-2)**

**Goal**: Implement shared utilities and fix navigation over-invalidation
**Risk**: LOW | **Impact**: HIGH | **Dependencies**: None

- [ ] **Task 1.1**: Create `src/lib/cache/navigation-detection.ts` with `analyzeNavigationImpact()`
- [ ] **Task 1.2**: Create `src/lib/routing/dependency-analyzer.ts` with all relationship analysis
- [ ] **Task 1.3**: Create `src/lib/cache/change-detection.ts` with unified change analysis
- [ ] **Task 1.4**: Create `src/lib/cache/surgical-invalidation.ts` with precise revalidation
- [ ] **Task 1.5**: Update `src/lib/cache/revalidation.ts` to use surgical invalidation
- [ ] **Task 1.6**: Remove blanket header/footer invalidation from `generateRevalidationTags()`
- [ ] **Task 1.7**: Test content-only changes (should NOT invalidate navigation)
- [ ] **Task 1.8**: Test navigation-affecting changes (SHOULD invalidate navigation)

**Success Criteria**:

- Content-only page edits no longer invalidate header/footer
- Navigation changes still properly invalidate header/footer
- 60-80% reduction in unnecessary cache invalidation

### **Phase 2: Cascade Detection & Jobs Integration (Week 3-4)**

**Goal**: Implement cascade operation detection and Payload Jobs integration
**Risk**: MEDIUM | **Impact**: HIGH | **Dependencies**: Phase 1

- [ ] **Task 2.1**: Enhance `src/lib/routing/dependency-analyzer.ts` with hierarchy and settings analysis
- [ ] **Task 2.2**: Create `src/payload/jobs/uri-cascade-handler.ts` with main job handler
- [ ] **Task 2.3**: Add `cascade-uris` task to Payload config with proper schema
- [ ] **Task 2.4**: Update `beforeCollectionChange` hook to detect cascade scenarios
- [ ] **Task 2.5**: Update `afterCollectionChange` hook to queue cascade jobs
- [ ] **Task 2.6**: Add global settings change hook with cascade detection
- [ ] **Task 2.7**: Test job queuing + execution pattern (`queue()` then `runByID()`)

**Success Criteria**:

- Archive page slug changes trigger cascade job queue and execution
- Page parent changes trigger cascade job queue and execution
- Global settings changes trigger cascade job queue and execution
- Jobs provide proper error handling, retries, and logging
- Admin interface remains fast (< 1 second saves, including cascade operations)

### **Phase 3: Cascade Operations Implementation (Week 5-6)**

**Goal**: Implement actual cascade processing and URI updates
**Risk**: HIGH | **Impact**: HIGH | **Dependencies**: Phase 2

- [ ] **Task 3.1**: Create `src/lib/routing/cascade-operations.ts` with main cascade logic
- [ ] **Task 3.2**: Implement `processPageHierarchyUpdate()` for parent/child cascades
- [ ] **Task 3.3**: Implement `processArchivePageUpdate()` for archive slug changes
- [ ] **Task 3.4**: Implement `processGlobalSettingsUpdate()` for settings changes
- [ ] **Task 3.5**: Implement `processHomepageChange()` for homepage designation
- [ ] **Task 3.6**: Add automatic redirect creation for changed URIs
- [ ] **Task 3.7**: Integrate cascade operations with surgical cache invalidation
- [ ] **Task 3.8**: Add batch processing optimization for large cascades

**Success Criteria**:

- Archive page slug changes update all dependent collection items
- Page parent changes update all descendant pages
- Homepage changes update both old and new homepage URIs
- All changed URIs get automatic 301 redirects created

### **Phase 4: Advanced Revalidation & Optimization (Week 7-8)**

**Goal**: Implement smart dependency detection and surgical tag optimization
**Risk**: MEDIUM | **Impact**: MEDIUM | **Dependencies**: Phase 3

- [ ] **Task 4.1**: Create smart dependency system replacing static `cache-config.ts`
- [ ] **Task 4.2**: Implement condition-based cache dependency evaluation
- [ ] **Task 4.3**: Replace broad tags (`uri-index:all`) with specific tags (`uri:path`)
- [ ] **Task 4.4**: Optimize collection-level invalidation (only when needed)
- [ ] **Task 4.5**: Add circular revalidation prevention safeguards
- [ ] **Task 4.6**: Implement cache tag deduplication for batch operations
- [ ] **Task 4.7**: Add performance monitoring and cache hit rate tracking
- [ ] **Task 4.8**: Create migration script for existing broad cache tags

**Success Criteria**:

- Cache dependencies only trigger when conditions are actually met
- URI-specific tags replace broad URI index invalidation
- No circular revalidation loops occur
- 90%+ reduction in unnecessary cache invalidation

### **Phase 5: Error Handling & Admin Interface (Week 9-10)**

**Goal**: Add robust error handling, monitoring, and admin tools
**Risk**: LOW | **Impact**: MEDIUM | **Dependencies**: Phase 4

- [ ] **Task 5.1**: Add comprehensive error handling to cascade operations
- [ ] **Task 5.2**: Implement rollback capability for failed cascade operations
- [ ] **Task 5.3**: Add cascade operation logging and admin visibility
- [ ] **Task 5.4**: Create admin interface for monitoring cascade job status
- [ ] **Task 5.5**: Add manual cascade trigger to existing URI regeneration tools
- [ ] **Task 5.6**: Implement dry-run mode for testing large cascade operations
- [ ] **Task 5.7**: Add notification system for failed cascade operations
- [ ] **Task 5.8**: Create comprehensive testing suite and documentation

**Success Criteria**:

- Failed cascade operations don't leave system in inconsistent state
- Admins can monitor and retry failed cascade operations
- Comprehensive logging enables debugging of complex scenarios
- System handles edge cases gracefully

### **Phase 6: Performance & Polish (Week 11-12)**

**Goal**: Final optimization, testing, and documentation
**Risk**: LOW | **Impact**: LOW | **Dependencies**: Phase 5

- [ ] **Task 6.1**: Performance optimization of database queries in cascade operations
- [ ] **Task 6.2**: Add caching for expensive operations (settings lookup, etc.)
- [ ] **Task 6.3**: Optimize batch processing for very large cascade operations
- [ ] **Task 6.4**: Add comprehensive integration tests for all scenarios
- [ ] **Task 6.5**: Create load testing for cascade operations under high concurrency
- [ ] **Task 6.6**: Add metrics collection and performance dashboards
- [ ] **Task 6.7**: Complete technical documentation and runbooks
- [ ] **Task 6.8**: Prepare rollback plan and system monitoring

**Success Criteria**:

- System handles 1000+ page sites efficiently
- All edge cases are tested and documented
- Monitoring and alerting is in place
- Team is trained on system operation and troubleshooting

## 📊 **Success Metrics & Performance Targets**

### **Cache Performance Improvements**

- **Unnecessary invalidation reduction**: 80-90% fewer cache tags invalidated
- **Cache hit rate improvement**: 15-25% increase in cache hits
- **Page load time improvement**: 10-20% faster due to better cache retention
- **Admin interface speed**: < 1 second saves even with cascade operations

### **System Reliability Targets**

- **Zero broken links**: 100% redirect coverage for changed URIs
- **Cascade operation success rate**: 99%+ successful completion
- **Error recovery**: Failed operations automatically retried up to 3 times
- **Data consistency**: No documents left in inconsistent URI state

### **Admin Experience Targets**

- **Response time**: All admin saves complete in < 1 second
- **Transparency**: Clear visibility into cascade operations and status
- **Recovery**: Simple recovery from failed operations
- **Predictability**: Consistent behavior across all content types

## 🔧 **Technical Implementation Details**

### **Key Integration Points**

#### **Enhanced Hook Integration**

```typescript
// src/payload/hooks/revalidate-after-change.ts - UNIFIED
export const afterCollectionChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
  collection,
}) => {
  // 1. Detect changes using shared analysis
  const changes = detectChanges(doc, previousDoc)

  // 2. Immediate surgical revalidation (fast, real-time)
  if (doc._status === "published") {
    await revalidateForDocumentChange(collection.slug, doc, changes, "single-change")
  }

  // 3. Queue cascade operations if needed (background, non-blocking)
  if (shouldTriggerCascade(collection.slug, doc, changes)) {
    const job = await req.payload.jobs.queue({
      task: "cascade-uris",
      input: {
        operation: determineCascadeType(collection.slug, doc, changes),
        entityId: doc.id,
        previousData: previousDoc,
      },
      queue: "uri-sync",
    })

    // Execute the job immediately (Payload Jobs don't run automatically)
    await req.payload.jobs.runByID({ id: job.id! })
  }

  return doc
}
```

#### **Payload Jobs Task Definition**

```typescript
// In payload.config.ts
jobs: {
  tasks: [
    {
      slug: "cascade-uris",
      handler: uriCascadeHandler,
      inputSchema: [
        { name: "operation", type: "text", required: true },
        { name: "entityId", type: "text", required: true },
        { name: "previousData", type: "json" },
      ],
      outputSchema: [
        { name: "documentsUpdated", type: "number" },
        { name: "redirectsCreated", type: "number" },
        { name: "cacheEntriesCleared", type: "number" },
      ],
      retries: 3,
    },
  ],
}
```

### **Database Considerations**

#### **URI Index Enhancements**

- Add basic indexes for parent/child queries
- Add `redirectFrom` field for automatic redirect tracking
- Optimize for cascade operation queries

#### **Performance Safeguards**

- Maximum cascade operation size limits (500 documents)
- Operation timeouts with cleanup (30 seconds)
- Memory usage monitoring
- Database transaction support for consistency

## 🚨 **Risk Mitigation**

### **High-Risk Scenarios**

- **Large cascade operations**: Implement size limits and batching
- **Circular dependencies**: Add detection and prevention
- **Cascade failures**: Implement rollback and retry logic
- **Performance degradation**: Add monitoring and circuit breakers

### **Rollback Strategy**

- All cascade operations use database transactions
- Failed operations leave system in consistent state
- Manual rollback tools for complex scenarios
- Backup and restore procedures for emergency situations

### **Monitoring & Alerting**

- Cascade operation success/failure rates
- Cache hit rate monitoring
- Performance regression detection
- Failed job queue length alerts

## 📝 **Implementation Notes**

### **File Changes Summary**

#### **New Files Created** (6 files):

```bash
src/lib/cache/navigation-detection.ts     # Smart navigation impact analysis
src/lib/cache/surgical-invalidation.ts    # Precise cache invalidation
src/lib/cache/change-detection.ts         # Unified change analysis
src/lib/routing/dependency-analyzer.ts    # All relationship analysis (archive/hierarchy/settings)
src/lib/routing/cascade-operations.ts     # Main cascade processing & orchestration
src/payload/jobs/uri-cascade-handler.ts   # Payload Jobs task handler
```

#### **Files Modified** (4 files):

```bash
src/lib/cache/revalidation.ts                    # Use surgical invalidation
src/payload/hooks/revalidate-after-change.ts     # Add cascade detection
src/lib/cache/cache-config.ts                    # Enhanced dependencies
src/payload/payload.config.ts                    # Add cascade-uris job task
```

### **Backward Compatibility**

- All existing cache methods continue to work
- Existing URI generation logic remains unchanged
- Gradual migration of broad tags to surgical tags
- Fallback behavior for failed cascade operations

---

**Document Status**: Unified Strategy v2.0
**Last Updated**: January 2024
**Implementation Timeline**: 12 weeks
**Next Review**: After Phase 1 completion
