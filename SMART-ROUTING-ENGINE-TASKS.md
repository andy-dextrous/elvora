# Smart Routing Engine - Implementation Tasklist

> **Important**: This is an iterative implementation plan. Before starting any task, consult with me to finalize the "how" and approach. We'll refine this plan together as we progress.

## 🎯 **Current Status**

**✅ Phase 1.1 - Universal Cache API: COMPLETE**

- Universal cache interface with `getByURI()`, `getBySlug()`, `getCollection()`, `getGlobal()`
- Standardized cache key generation system
- TypeScript interfaces for all operations
- Payload logger integration for cache debugging
- Removed redundant `getComputed()` (replaced by GraphQL approach)

**✅ Phase 1 - Foundation Layer: COMPLETE**

**✅ Phase 2 - Routing Engine Integration: COMPLETE**

**✅ Phase 3 - Smart Revalidation System: COMPLETE**

- Configuration-driven dependency system implemented
- Universal hooks for collections and globals
- Cache system organized in `src/lib/payload/cache/` with comprehensive documentation
- Tag mapping standardized: `global:*` naming convention, `sitemap:all` simplification
- Hardcoded logic removed and replaced with scalable solutions

**✅ Phase 4 - API Migration: COMPLETE**

- Migrated all active legacy cache functions to universal cache API
- Removed unused and redundant functions (getCachedDocument, testimonial functions)
- Updated PayloadRedirects component to use universal cache directly
- Cleaned up function naming (removed "cache" prefixes - caching is assumed)
- Preserved complex functions for GraphQL phase (getRelatedPosts, getDefaultTemplate)

**✅ Phase 4 - API Migration: COMPLETE**

**✅ Phase 5 - URI-Based Sitemaps: COMPLETE**

**✅ Phase 6 - Collection Integration: COMPLETE**

**✅ Phase 6.5 - Routing Module Organization: COMPLETE**

**🔄 Next Up: Phase 7 - Component & Code Migration to URI System**

## 📋 Table of Contents - Logical Construction Process

```
🏗️ Phase 1: Foundation Layer
   └── Build core cache API, configuration system, tags, and revalidation engine

🔄 Phase 2: URI Engine Integration
   └── Unify existing URI creation + parsing into single intelligent system

🔗 Phase 3: Smart Revalidation System
   └── Replace manual hooks with intelligent, configuration-driven invalidation

📊 Phase 4: API Migration
   └── Replace scattered cache functions with universal API

🗺️ Phase 5: URI-Based Sitemaps
   └── Create organized sitemaps module with universal routing URIs

🔧 Phase 6: Collection Integration
   └── Migrate all collections to use universal system, remove legacy code

🛣️ Phase 6.5: Routing Module Organization
   └── Organize routing system into clean, documented module structure

🔄 Phase 7: Component & Code Migration to URI System
   └── Update all components, links, and code to use URI fields instead of manual path construction

🚀 Phase 8: Advanced Features
   └── Add cache warming, performance monitoring, and smart invalidation

🏁 Phase 9: Final Integration
   └── Complete migration, cleanup, and production readiness
```

### Construction Logic Flow

**Foundation → Integration → Migration → Enhancement → Validation → Production**

1. **Foundation** - Core systems that everything else depends on
2. **URI Integration** - Unify the routing backbone
3. **Smart Revalidation** - Intelligent cache invalidation
4. **API Migration** - Replace old with new systematically
5. **Sitemap Integration** - URI-aware sitemap generation
6. **Collection Updates** - Apply universal system across all content
7. **Advanced Features** - Performance and monitoring
8. **Testing** - Validate entire system works correctly
9. **Production** - Final cleanup and deployment readiness

## 📚 Reference Documents

The complete planning history and architecture details are in:

- `planning/smart-content-engine.md` - Complete architecture and implementation strategy
- `planning/smart-content-overview.md` - System overview and current status

### **Module Documentation**

- `src/lib/cache/README.md` - **Cache System** - Universal cache, configuration-driven dependencies, and smart revalidation
- `src/lib/sitemaps/README.md` - **URI-Based Sitemaps** - Universal sitemap generation with SEO compliance _(to be created)_
- `src/lib/routing/README.md` - **URI Engine** - Unified URI creation, parsing, and conflict detection _(to be created)_

## 🏗️ **Phase 1: Foundation Layer**

### Universal Cache API ✅ **COMPLETE**

- [x] Create `src/lib/payload/cache.ts` with unified cache interface
- [x] Build standardized cache key generation system
- [x] Implement TypeScript interfaces for all cache operations
- [x] Add cache hit/miss debug logging (with Payload logger integration)
- [x] Remove `getComputed()` method (redundant with GraphQL plans)

### Cache Configuration System ✅ **COMPLETE**

- [x] Create `src/lib/payload/cache-config.ts` with CACHE_CONFIG object
- [x] Implement `getCacheConfig()` with fallback defaults
- [x] ~~Add `hasURISupport()` auto-detection function~~ (removed - not needed yet)
- [x] ~~Create `getSitemapForCollection()` mapping function~~ (removed - not needed yet)
- [x] ~~Add validation for cache configuration~~ (removed - not needed yet)

### Universal Tag System ✅ **COMPLETE**

- [x] Enhance existing `generateCacheTags()` in cache.ts to use cache config dependencies
- [x] Update cache API methods to use enhanced tag generation
- [x] ~~Create separate cache-tags.ts~~ (not needed - using existing system)
- [x] ~~Add tag validation and normalization~~ (not needed yet)
- [x] ~~Build tag debugging utilities~~ (not needed yet)

### Universal Revalidation Engine ✅ **COMPLETE**

- [x] Create `src/lib/payload/revalidation.ts` with `revalidate()` function
- [x] Implement change detection logic (URI, status, content changes)
- [x] Add cascade invalidation for hierarchical content
- [x] Create batch revalidation for bulk operations

## 🔄 **Phase 2: Routing Engine Integration**

### Routing Engine Implementation ✅ **COMPLETE**

- [x] Create `src/lib/payload/routing-engine.ts` that consolidates all URI logic
- [x] Move all URI generation logic from `create-uri.ts` to routing engine
- [x] Add cached routing settings shared between generation and resolution
- [x] Keep routing engine focused on generation, validation, and static params only
- [x] Universal cache handles all document resolution via `cache.getByURI()`

### Update Integration Points ✅ **COMPLETE**

- [x] Update `createURIHook()` to use routing engine
- [x] Update page resolver `[[...slug]]/page.tsx` to use universal cache
- [x] Update slug field imports to use routing engine
- [x] Remove old `routing.ts` and `create-uri.ts` files (cleanup)

## 🔗 **Phase 3: Smart Revalidation System**

### Collection Hooks ✅ **COMPLETE**

- [x] Create `src/payload/hooks/hooks.ts`
- [x] Build `createHooks(collection)` factory function
- [x] Implement smart `afterChange` hook using cache config
- [x] Implement smart `afterDelete` hook
- [x] Add support for related content invalidation

### Global Hooks ✅ **COMPLETE**

- [x] Add `createGlobalHooks(globalSlug)` factory function
- [x] Implement smart `afterChange` hook for globals using cache config
- [x] Handle global dependency cascading (settings → collections)
- [x] Integrate with universal revalidation system

### Fix Tag Mapping (Collections + Globals) ✅ **COMPLETE**

- [x] Update services collection to use `sitemap:pages` tag _(DONE: Now using `sitemap:all`)_
- [x] Remove orphaned `services-sitemap`, `team-sitemap` tags _(DONE: Simplified to `sitemap:all`)_
- [x] Update posts to use correct `sitemap:posts` tag _(DONE: Now using `sitemap:all`)_
- [x] Fix global tag naming: `global_settings` → `global:settings`
- [x] Fix global tag naming: `global_header` → `global:header`
- [x] Fix global tag naming: `global_footer` → `global:footer`
- [x] Fix `/api/revalidate` route with correct tag mappings

### URI-Aware Revalidation + Global Dependencies ✅ **COMPLETE**

- [x] Update URI generation hook to use universal revalidation _(already working)_
- [x] Implement old URI → new URI transition logic _(already working)_
- [x] Add support for hierarchical page URI changes _(already working)_
- [x] **Configuration-driven cascade invalidation system** _(NEW: respects cache config dependencies)_
- [x] Handle settings changes with cascade invalidation to all URI-dependent collections
- [x] Handle archive page setting changes with cascade invalidation

## 📊 **Phase 4: API Migration**

### Replace Core Cache Functions ✅ **COMPLETE**

- [x] ~~Migrate `getPageBySlug()` to `cache.getBySlug("pages", slug)`~~ _(REMOVED: Unused)_
- [x] ~~Migrate `getPostBySlug()` to `cache.getBySlug("posts", slug)`~~ _(REMOVED: Unused)_
- [x] ~~Migrate `getCachedDocument()` to universal cache API~~ _(REMOVED: Unused, file deleted)_
- [x] Migrate `getCachedGlobal()` to `cache.getGlobal()` → renamed to `getGlobal()`
- [x] Update PayloadRedirects component to use universal cache API directly

### Replace Specialized Caching ✅ **COMPLETE**

- [x] ~~Migrate `getRecentPosts()` to GraphQL query~~ _(KEPT: Migrated to universal cache, actively used)_
- [x] ~~Migrate `getDefaultTemplate()` to universal cache~~ _(SAVED FOR GRAPHQL: Complex relationship logic)_
- [x] ~~Migrate `getTestimonials()` to universal cache~~ _(REMOVED: Unused, file deleted)_
- [x] Migrate `getHomepage()` to use universal cache _(KEPT: Actively used in main route)_
- [x] Migrate `getSettings()` and `getGlobal()` to use universal cache _(KEPT: Actively used in layout/components)_

### API Cleanup ✅ **COMPLETE**

- [x] Remove "cache" from function names (caching is assumed)
- [x] Delete unused files: `document.ts`, `testimonials.ts`
- [x] Simplify `redirects.ts` - removed `getCachedRedirects` wrapper
- [x] Clean up `page.ts` - kept only `getHomepage()`
- [x] Clean up `post.ts` - kept only `getRelatedPosts()` (for GraphQL phase)
- [x] Preserve complex functions for GraphQL phase: `getRelatedPosts()`, `getDefaultTemplate()`

### Final API Migration Tasks ✅ **COMPLETE**

- [x] Migrate `getRelatedPosts()` to universal cache with relationship queries
- [x] Migrate `getDefaultTemplate()` and `getTemplatesForCollection()` to universal cache
- [x] Add `cache.getByID()` method to universal cache API
- [x] Add templates collection to cache configuration with proper dependencies
- [x] Complete migration of all complex cache functions to universal cache

## 🗺️ **Phase 5: URI-Based Sitemaps** ✅ **COMPLETE**

### Sitemaps Module Organization ✅ **COMPLETE**

- [x] Create `src/lib/sitemaps/` folder structure
- [x] Create `src/lib/sitemaps/README.md` - How URI-based sitemaps work
- [x] Create `src/lib/sitemaps/index.ts` - Clean exports for all sitemap functionality
- [x] Create `src/lib/sitemaps/config.ts` with SITEMAP_CONFIG
- [x] Create `src/lib/sitemaps/generator.ts` - Universal sitemap generator
- [x] Create `src/lib/sitemaps/route-factory.ts` - Dynamic route creation
- [x] Create `src/lib/sitemaps/seo-filters.ts` - noIndex, canonical URL logic

### Sitemap Configuration ✅ **COMPLETE**

- [x] Define collection-to-sitemap mappings in config
- [x] Add SEO filtering configuration
- [x] Include archive page detection logic _(handled by routing engine integration)_

### Universal Sitemap Generator ✅ **COMPLETE**

- [x] Implement `generateSitemap()` using universal cache + URI engine
- [x] Add SEO-aware filtering (noIndex, canonical URLs)
- [x] Use URI field instead of slug concatenation
- [x] Add automatic new collection support

### Sitemap Route Factory ✅ **COMPLETE**

- [x] Replace hardcoded sitemap routes with factory
- [x] Migrate `pages-sitemap.xml/route.ts` to use factory
- [x] Migrate `posts-sitemap.xml/route.ts` to use factory
- [x] Integrate with universal tag system

### SEO Compliance ✅ **COMPLETE**

- [x] Add `noIndex` and `canonicalUrl` fields to posts collection
- [x] Update sitemap field selection to include SEO fields
- [x] Implement canonical URL handling logic
- [x] Add external canonical URL detection and exclusion

## 🔧 **Phase 6: Collection Integration** ✅ **COMPLETE**

### Hook Migration ✅ **COMPLETE**

- [x] Replace `revalidatePage.ts` with new hooks _(DONE: Using universal afterCollectionChange)_
- [x] Replace `revalidatePost.ts` with new hooks _(DONE: Using universal afterCollectionChange)_
- [x] Replace `createRevalidationHooks()` with new hooks _(DONE: All collections using universal hooks)_
- [x] Replace `revalidateSettings.ts`, `revalidateHeader.ts`, `revalidateFooter.ts` with new global hooks _(DONE: Using universal afterGlobalChange)_
- [x] Update all collection configurations to use new hooks _(DONE: All collections updated)_
- [x] Update all global configurations to use new global hooks _(DONE: All globals updated)_

### Remove Legacy Revalidation ✅ **COMPLETE**

- [x] Delete `src/payload/hooks/revalidateCollection.ts` _(DONE: File already removed)_
- [x] Delete `src/payload/collections/pages/hooks/revalidatePage.ts` _(DONE: File already removed)_
- [x] Delete `src/payload/collections/posts/hooks/revalidatePost.ts` _(DONE: File already removed)_
- [x] Clean up any remaining manual revalidation code _(DONE: All using universal system)_

### Universal Routing Integration ✅ **COMPLETE**

- [x] Update `universal-resolver.ts` to use universal cache _(DONE: [[...slug]]/page.tsx uses cache.getByURI())_
- [x] Implement URI-first caching in resolver _(DONE: Resolver uses URI-first lookup)_
- [x] Add cache warming for newly generated URIs _(DONE: Smart revalidation system handles this)_
- [x] Optimize resolver performance with smart caching _(DONE: Universal cache with proper tags)_

## 🛣️ **Phase 6.5: Routing Module Organization** ✅ **COMPLETE**

### Routing Module Organization ✅ **COMPLETE**

- [x] Create `src/lib/routing/` folder structure _(DONE: Module created)_
- [x] Create `src/lib/routing/README.md` - URI engine documentation _(DONE: Comprehensive docs with examples)_
- [x] Create `src/lib/routing/index.ts` - Clean exports for all routing functionality _(DONE: Clean exports with convenience functions)_
- [x] Move `src/lib/routing-engine.ts` to `src/lib/routing/uri-engine.ts` _(DONE: File moved)_
- [x] ~~Create `src/lib/routing/conflict-detection.ts` - Enhanced conflict detection~~ _(SKIPPED: Over-engineering, existing conflict detection is sufficient)_
- [x] Update all imports to use new routing module structure _(DONE: All imports updated)_

## 🚀 **Phase 7: Component & Code Migration to URI System**

### **🚨 CRITICAL: Link Components (Week 1 - High Priority)**

#### **Task 7.1: Update CMSLink Component**

- [ ] **File**: `src/payload/components/frontend/cms-link/index.tsx`
- [ ] Replace `pathMapping` usage with URI field access
- [ ] Update href construction logic to use `reference.value.uri`
- [ ] Add fallback logic for backward compatibility
- [ ] Remove dependency on `path-mapping.ts`
- [ ] Test with all collection types (pages, posts, services)

#### **Task 7.2: Update Rich Text Internal Links**

- [ ] **File**: `src/payload/components/frontend/rich-text/index.tsx`
- [ ] Replace hardcoded `/blog/` path construction in `internalDocToHref`
- [ ] Update to use `value.uri` field with slug fallback
- [ ] Ensure works for all collection types with relationTo
- [ ] Test rich text links in pages and posts

#### **Task 7.3: Update Post Card Component**

- [ ] **File**: `src/components/posts/post-card.tsx`
- [ ] Replace hardcoded `/blog/${post.slug}` with `post.uri`
- [ ] Add fallback to slug-based construction if no URI
- [ ] Test post cards in archive listings and related posts
- [ ] Verify proper hover states and interactions

#### **Task 7.4: Delete Path Mapping System**

- [ ] **Remove**: `src/payload/path-mapping.ts` (entire file)
- [ ] Update all imports that reference path mapping
- [ ] Verify no components still depend on pathMapping object
- [ ] Clean up any TypeScript types related to path mapping

### **📋 PREVIEW & ADMIN SYSTEM (Week 1)**

#### **Task 7.5: Update Preview Path Generation**

- [ ] **File**: `src/utilities/generate-preview-path.ts`
- [ ] Replace `collectionPrefixMap` with URI field usage
- [ ] Update function signature to accept URI instead of slug
- [ ] Create fallback logic for documents without URI field
- [ ] Test preview links in admin for all collections

#### **Task 7.6: Update Collection Preview URLs**

- [ ] **File**: `src/payload/collections/pages/index.ts`
- [ ] **File**: `src/payload/collections/posts/index.ts`
- [ ] **File**: `src/payload/collections/services.ts`
- [ ] Update `livePreview.url` to use URI field
- [ ] Update `preview` function to use URI field
- [ ] Test live preview functionality for all collections

#### **Task 7.7: Update Plugin generateURL**

- [ ] **File**: `src/payload/plugins/index.ts`
- [ ] Update `generateURL` function to use URI field with slug fallback
- [ ] Ensure compatibility with nestedDocsPlugin breadcrumbs
- [ ] Test breadcrumb generation in admin interface

### **🗂️ COLLECTION CONFIGURATIONS (Week 1)**

#### **Task 7.8: Add Missing URI Fields to defaultPopulate**

- [ ] **File**: `src/payload/collections/services.ts` - Add `uri: true` to defaultPopulate
- [ ] **File**: `src/payload/collections/team.ts` - Add `uri: true` to defaultPopulate
- [ ] **File**: `src/payload/collections/testimonials.ts` - Add `uri: true` to defaultPopulate
- [ ] Verify all collections with slug fields have URI in defaultPopulate
- [ ] Test admin interface shows URI fields properly

### **🎯 NAVIGATION & BREADCRUMBS (Week 2)**

#### **Task 7.9: Update Post Breadcrumbs**

- [ ] **File**: `src/components/posts/post-breadcrumbs.tsx`
- [ ] Replace hardcoded `/insights` link with dynamic archive page resolution
- [ ] Create `getArchivePageUri("posts")` utility function
- [ ] Use settings global to determine correct archive page URI
- [ ] Add fallback logic if no archive page is configured
- [ ] Test breadcrumbs with different archive page configurations

#### **Task 7.10: Update Pagination Component**

- [ ] **File**: `src/payload/components/frontend/pagination/index.tsx`
- [ ] Replace hardcoded `/blog/page/` paths with dynamic archive URI
- [ ] Integrate with archive page resolution system
- [ ] Update all router.push calls to use dynamic paths
- [ ] Test pagination on blog archive and search results

#### **Task 7.11: Update Card Component**

- [ ] **File**: `src/payload/components/frontend/card/index.tsx`
- [ ] Replace manual `/${relationTo}/${slug}` construction with `doc.uri`
- [ ] Add fallback logic for backward compatibility
- [ ] Test card links in various contexts (related posts, archive listings)

### **🔧 UTILITY FUNCTIONS (Week 2)**

#### **Task 7.12: Update Generate Meta**

- [ ] **File**: `src/utilities/generate-meta.ts`
- [ ] Replace slug array URL construction with URI field usage
- [ ] Update canonical URL generation to use `doc.uri`
- [ ] Ensure proper SEO metadata generation
- [ ] Test meta tags for pages, posts, and collection items

#### **Task 7.13: Update Payload Redirects**

- [ ] **File**: `src/payload/components/frontend/payload-redirects/index.tsx`
- [ ] Replace manual path construction with URI field usage
- [ ] Update redirect URL generation to use document URI field
- [ ] Add fallback logic for documents without URI
- [ ] Test redirect functionality with various redirect configurations

### **⚙️ API & ROUTING ENHANCEMENTS (Week 2)**

#### **Task 7.14: Update API Preview Route**

- [ ] **File**: `src/app/(frontend)/api/preview/route.ts`
- [ ] Enhance to validate URIs in addition to existing slug validation
- [ ] Consider URI-based preview path construction
- [ ] Maintain backward compatibility with existing preview system
- [ ] Test preview mode with all collection types

#### **Task 7.15: Archive Page Resolution System**

- [ ] **Create**: `src/lib/routing/archive-resolution.ts`
- [ ] Build `getArchivePageUri(collection)` function
- [ ] Integrate with settings global and routing configuration
- [ ] Add caching for archive page lookups
- [ ] Create fallback logic for collections without archives

### **🧪 TESTING & VALIDATION (Week 2)**

#### **Task 7.16: Component Integration Testing**

- [ ] Test all updated components work together
- [ ] Verify navigation flows use correct URIs throughout
- [ ] Test preview system works with new URI-based logic
- [ ] Validate breadcrumbs work across all content types
- [ ] Test link generation in rich text and CMS links

#### **Task 7.17: Fallback System Validation**

- [ ] Verify graceful fallbacks when URI field is missing
- [ ] Test backward compatibility with existing content
- [ ] Validate error handling for malformed URIs
- [ ] Test performance impact of URI field queries

#### **Task 7.18: SEO & Link Validation**

- [ ] Verify all internal links use proper URI structure
- [ ] Test canonical URL generation with new system
- [ ] Validate no broken internal links exist
- [ ] Test sitemap URLs match component-generated links

### **📚 DOCUMENTATION & CLEANUP (Week 2)**

#### **Task 7.19: Update Component Documentation**

- [ ] Document URI field usage in component documentation
- [ ] Update any README files that reference old path system
- [ ] Create migration guide for future component development
- [ ] Document fallback patterns for URI field usage

#### **Task 7.20: Final Component Cleanup**

- [ ] Remove any remaining references to old path mapping
- [ ] Clean up unused imports and dependencies
- [ ] Verify TypeScript types are updated for URI usage
- [ ] Remove any TODO comments related to path construction

## 🚀 **Phase 8: Advanced Features** _(Previously Phase 7)_

### Cache Warming

- [ ] Implement cache warming on content publish
- [ ] Add preemptive cache generation for related content
- [ ] Create cache warming for sitemap generation
- [ ] Add bulk cache warming utilities

### Performance Monitoring

- [ ] Add cache hit/miss tracking
- [ ] Implement response time monitoring
- [ ] Create cache size monitoring
- [ ] Add memory usage optimization

### Smart Invalidation Enhancement

- [ ] Implement smart related post invalidation
- [ ] Add category change cascade invalidation
- [ ] Create parent/child page invalidation
- [ ] Add archive page dependency invalidation

### URI Engine Advanced Features

- [ ] Implement URI migration system (old → new redirects)
- [ ] Add bulk URI operations and management
- [ ] Create URI analytics and monitoring
- [ ] Build advanced conflict resolution strategies

## 🏁 **Phase 9: Final Integration** _(Previously Phase 8)_

### Complete API Replacement

- [ ] Remove all legacy cache functions
- [ ] Update all components to use universal cache
- [ ] Clean up unused imports and dependencies
- [ ] Verify no legacy cache calls remain

### Production Readiness

- [ ] Performance optimization and monitoring setup
- [ ] Error handling and graceful fallbacks
- [ ] Cache warming strategy for deployment
- [ ] Monitoring and alerting configuration

### Documentation Cleanup

- [ ] Update any inline code documentation
- [ ] Clean up TODO comments
- [ ] Verify TypeScript types are complete
- [ ] Final code review and optimization

---

## 🔄 **Iterative Approach**

**Before starting each task, we will:**

1. Review the specific requirements together
2. Discuss implementation approach and edge cases
3. Confirm the task fits with overall architecture
4. Identify any dependencies or prerequisites
5. Agree on success criteria

**This ensures we build the Smart Routing Engine incrementally and correctly.**
