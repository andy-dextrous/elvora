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

**✅ Phase 5.5 - App Router Native Sitemaps Migration: COMPLETE**

**✅ Phase 7 - Component & Code Migration to URI System: COMPLETE**

**🔄 Next Up: Phase 8 - Advanced Features**

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

🗺️ Phase 5.5: App Router Native Sitemaps Migration
   └── Replace next-sitemap with Next.js App Router native sitemap functionality

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

## 🗺️ **Phase 5.5: App Router Native Sitemaps Migration** ✅ **COMPLETE**

### **🎯 CRITICAL: Replace next-sitemap with App Router Native Sitemaps** ✅ **COMPLETE**

> **🚨 DYNAMIC GENERATION PRINCIPLE**: All sitemap functionality must be dynamically generated from configuration - **NO HARDCODED VALUES**. When new collections are added to `SITEMAP_CONFIG`, sitemaps, routes, and robots.txt must automatically include them without code changes.

#### **Task 5.5.1: Remove next-sitemap Dependency** ✅ **COMPLETE**

- [x] **Remove**: `next-sitemap.config.cjs` - External configuration file
- [x] **Remove**: `next-sitemap` from `package.json` dependencies
- [x] **Remove**: Any next-sitemap build scripts from package.json
- [x] **Remove**: Static sitemap files from public directory (if any)
- [x] **Clean up**: Any references to next-sitemap in build processes

#### **Task 5.5.2: Create Dynamic App Router Sitemap Index** ✅ **COMPLETE**

- [x] **Create**: `src/app/(frontend)/sitemap.ts` - Main sitemap index
- [x] **CRITICAL**: Generate sitemap index dynamically from `SITEMAP_CONFIG` (no hardcoded sitemaps)
- [x] Auto-discover all configured sitemaps from universal sitemap configuration
- [x] Calculate lastModified dates dynamically based on actual content changes
- [x] Add proper TypeScript typing with `MetadataRoute.Sitemap`
- [x] Support automatic expansion when new collections are added to config

#### **Task 5.5.3: Create Universal Sitemap Route Factory** ✅ **COMPLETE**

- [x] **Update**: `src/lib/sitemaps/route-factory.ts` for App Router compatibility
- [x] Create `createAppRouterSitemapRoute()` function
- [x] Return proper Response objects with XML content-type headers
- [x] Integrate with existing universal cache system
- [x] Add proper error handling and fallbacks

#### **Task 5.5.4: Create Dynamic Sitemap Routes** ✅ **COMPLETE**

- [x] **CRITICAL**: Generate all sitemap routes dynamically from `SITEMAP_CONFIG` (no hardcoded routes)
- [x] **Update**: `src/app/(frontend)/[sitemap]/route.ts` to handle dynamic sitemap routing
- [x] **Alternative**: Create individual routes only if catch-all dynamic routing not feasible
- [x] Use App Router's `GET` export instead of getServerSideSitemap
- [x] Integrate with universal cache and URI fields (no hardcoded collection queries)
- [x] Maintain existing cache tags and revalidation
- [x] Support automatic route creation when new collections are added to sitemap config

#### **Task 5.5.5: Enhance Sitemap Generator for App Router** ✅ **COMPLETE**

- [x] **Update**: `src/lib/sitemaps/generator.ts` to return App Router format
- [x] Change return type from next-sitemap format to `MetadataRoute.Sitemap`
- [x] Update sitemap entry format: `{ url, lastModified, changeFrequency, priority }`
- [x] Maintain URI-based URL generation (`doc.uri` instead of slug concatenation)
- [x] Preserve SEO filtering logic (noIndex, canonical URLs)

#### **Task 5.5.6: Create Dynamic Robots.txt** ✅ **COMPLETE**

- [x] **Create**: `src/app/(frontend)/robots.ts` - Dynamic robots.txt generation
- [x] **CRITICAL**: Generate robots.txt dynamically from `SITEMAP_CONFIG` (no hardcoded sitemap URLs)
- [x] Auto-discover all sitemap URLs from universal sitemap configuration
- [x] Include main sitemap index (`/sitemap.xml`) plus all configured sub-sitemaps
- [x] Add crawl delay and user-agent configurations as needed
- [x] Integrate with environment variables for different deployment stages
- [x] Support automatic robots.txt updates when new sitemaps are added to config

#### **Task 5.5.7: Cache Integration & Performance** ✅ **COMPLETE**

- [x] **Add**: `unstable_cache` integration for App Router sitemap routes
- [x] Use existing universal cache tags: `sitemap:pages`, `sitemap:posts`
- [x] Maintain smart revalidation when content changes
- [x] Add parallel sitemap generation for better performance
- [x] Implement proper error boundaries and fallback content

#### **Task 5.5.8: SEO Enhancement & Validation** ✅ **COMPLETE**

- [x] **Verify**: URI fields are used correctly in all sitemap entries
- [x] **Test**: SEO filtering works with noIndex and canonical URLs
- [x] **Validate**: XML output is properly formatted and valid
- [x] **Confirm**: All sitemap URLs are accessible and return 200 status
- [x] **Check**: No duplicate URLs exist across sitemaps

### **App Router Sitemap Architecture Benefits**

#### **Perfect Integration with Universal System**

- ✅ **URI-First**: Uses your pre-computed URI fields directly
- ✅ **Cache Integration**: Works seamlessly with universal cache system
- ✅ **Smart Revalidation**: Integrates with existing tag-based invalidation
- ✅ **SEO Compliance**: Respects noIndex and canonical URL settings

#### **Enhanced Performance**

- ✅ **Native Caching**: Uses Next.js `unstable_cache` with proper tags
- ✅ **Parallel Generation**: Multiple sitemaps generated simultaneously
- ✅ **Smart Invalidation**: Only regenerates when content actually changes
- ✅ **Runtime Generation**: No build-time dependency bottlenecks

#### **Better Developer Experience**

- ✅ **TypeScript Integration**: Full type safety with MetadataRoute.Sitemap
- ✅ **Simplified Architecture**: One less external dependency to manage
- ✅ **Better Debugging**: Integrated with Next.js development tools
- ✅ **Consistent Patterns**: Matches your App Router architecture

#### **Dynamic Content Support**

- ✅ **Collection-Aware**: Automatically includes new collections when added to config
- ✅ **Settings Integration**: Respects routing configuration changes dynamically
- ✅ **Real-time Updates**: Content changes immediately reflect in sitemaps
- ✅ **Archive Detection**: Properly handles collection archive pages automatically
- ✅ **Zero-Config Expansion**: New collections automatically get sitemap support
- ✅ **Configuration-Driven**: All behavior controlled by `SITEMAP_CONFIG` - no hardcoded values

### **Migration Success Criteria**

#### **Must Have**

- [ ] All existing sitemap URLs continue to work
- [ ] URI fields are used instead of slug concatenation
- [ ] Cache performance matches or exceeds current system
- [ ] SEO filtering works correctly (noIndex, canonical URLs)
- [ ] Smart revalidation triggers on content changes

#### **Should Have**

- [ ] XML output is valid and well-formatted
- [ ] Error handling gracefully manages failures
- [ ] Performance is optimized with parallel generation
- [ ] Integration with universal cache system is seamless

#### **Nice to Have**

- [ ] Dynamic robots.txt includes all sitemap references
- [ ] Advanced SEO features (images, news, etc.) are ready for future use
- [ ] Monitoring and analytics for sitemap generation performance
- [ ] Bulk sitemap operations are available for maintenance

## 🚀 **Phase 7: Component & Code Migration to URI System** ✅ **COMPLETE**

### **🚨 CRITICAL: Link Components (Week 1 - High Priority)** ✅ **COMPLETE**

#### **Task 7.1: Update CMSLink Component** ✅ **COMPLETE**

- [x] **File**: `src/payload/components/frontend/cms-link/index.tsx`
- [x] Replace `pathMapping` usage with URI field access
- [x] Update href construction logic to use `reference.value.uri`
- [x] Add fallback logic for backward compatibility
- [x] Remove dependency on `path-mapping.ts`
- [x] Test with all collection types (pages, posts, services)

#### **Task 7.2: Update Rich Text Internal Links** ✅ **COMPLETE**

- [x] **File**: `src/payload/components/frontend/rich-text/index.tsx`
- [x] Replace hardcoded `/blog/` path construction in `internalDocToHref`
- [x] Update to use `value.uri` field with slug fallback
- [x] Ensure works for all collection types with relationTo
- [x] Test rich text links in pages and posts

#### **Task 7.3: Update Post Card Component** ✅ **COMPLETE**

- [x] **File**: `src/payload/components/frontend/card/index.tsx`
- [x] Replace hardcoded `/blog/${post.slug}` with `post.uri`
- [x] Add fallback to slug-based construction if no URI
- [x] Test post cards in archive listings and related posts
- [x] Verify proper hover states and interactions

#### **Task 7.4: Delete Path Mapping System** ✅ **COMPLETE**

- [x] **Remove**: `src/payload/path-mapping.ts` (entire file)
- [x] Update all imports that reference path mapping
- [x] Verify no components still depend on pathMapping object
- [x] Clean up any TypeScript types related to path mapping

### **📋 PREVIEW & ADMIN SYSTEM (Week 1)** ✅ **COMPLETE**

#### **Task 7.5: Update Preview Path Generation** ✅ **COMPLETE**

- [x] **File**: `src/utilities/generate-preview-path.ts`
- [x] Replace `collectionPrefixMap` with URI field usage
- [x] Update function signature to accept URI instead of slug
- [x] Create fallback logic for documents without URI field
- [x] Test preview links in admin for all collections

#### **Task 7.6: Update Collection Preview URLs** ✅ **COMPLETE**

- [x] **File**: `src/payload/collections/pages/index.ts`
- [x] **File**: `src/payload/collections/posts/index.ts`
- [x] **File**: `src/payload/collections/services.ts`
- [x] Update `livePreview.url` to use URI field
- [x] Update `preview` function to use URI field
- [x] Test live preview functionality for all collections

#### **Task 7.7: Update Plugin generateURL** ✅ **COMPLETE**

- [x] **File**: `src/payload/plugins/index.ts`
- [x] Update `generateURL` function to use URI field with slug fallback
- [x] Ensure compatibility with nestedDocsPlugin breadcrumbs
- [x] Test breadcrumb generation in admin interface

### **🗂️ COLLECTION CONFIGURATIONS (Week 1)** ✅ **COMPLETE**

#### **Task 7.8: Add Missing URI Fields to defaultPopulate** ✅ **COMPLETE**

- [x] **File**: `src/payload/collections/services.ts` - Add `uri: true` to defaultPopulate
- [x] **File**: `src/payload/collections/team.ts` - Add `uri: true` to defaultPopulate
- [x] **File**: `src/payload/collections/testimonials.ts` - Add `uri: true` to defaultPopulate
- [x] Verify all collections with slug fields have URI in defaultPopulate
- [x] Test admin interface shows URI fields properly

### **🎯 NAVIGATION & BREADCRUMBS (Week 2)** ✅ **COMPLETE**

#### **Task 7.9: Update Post Breadcrumbs** ✅ **COMPLETE**

- [x] **File**: `src/components/posts/post-breadcrumbs.tsx`
- [x] Replace hardcoded `/insights` link with dynamic archive page resolution
- [x] Create `getArchivePageUri("posts")` utility function
- [x] Use settings global to determine correct archive page URI
- [x] Add fallback logic if no archive page is configured
- [x] Test breadcrumbs with different archive page configurations

#### **Task 7.10: Update Pagination Component** ✅ **COMPLETE**

- [x] **File**: `src/payload/components/frontend/pagination/index.tsx`
- [x] Replace hardcoded `/blog/page/` paths with dynamic archive URI
- [x] Integrate with archive page resolution system
- [x] Update all router.push calls to use dynamic paths
- [x] Test pagination on blog archive and search results

#### **Task 7.11: Update Card Component** ✅ **COMPLETE**

- [x] **File**: `src/payload/components/frontend/card/index.tsx`
- [x] Replace manual `/${relationTo}/${slug}` construction with `doc.uri`
- [x] Add fallback logic for backward compatibility
- [x] Test card links in various contexts (related posts, archive listings)

### **🔧 UTILITY FUNCTIONS (Week 2)** ✅ **COMPLETE**

#### **Task 7.12: Update Generate Meta** ✅ **COMPLETE**

- [x] **File**: `src/utilities/generate-meta.ts`
- [x] Replace slug array URL construction with URI field usage
- [x] Update canonical URL generation to use `doc.uri`
- [x] Ensure proper SEO metadata generation
- [x] Test meta tags for pages, posts, and collection items

#### **Task 7.13: Update Payload Redirects** ✅ **COMPLETE**

- [x] **File**: `src/payload/components/frontend/payload-redirects/index.tsx`
- [x] Replace manual path construction with URI field usage
- [x] Update redirect URL generation to use document URI field
- [x] Add fallback logic for documents without URI
- [x] Test redirect functionality with various redirect configurations

### **⚙️ API & ROUTING ENHANCEMENTS (Week 2)** ✅ **COMPLETE**

#### **Task 7.14: Update API Preview Route** ✅ **COMPLETE**

- [x] **File**: `src/app/(frontend)/api/preview/route.ts`
- [x] Enhance to validate URIs in addition to existing slug validation
- [x] Consider URI-based preview path construction
- [x] Maintain backward compatibility with existing preview system
- [x] Test preview mode with all collection types

#### **Task 7.15: Archive Page Resolution System** ✅ **COMPLETE**

- [x] **Create**: `src/lib/routing/archive-resolution.ts`
- [x] Build `getArchivePageUri(collection)` function
- [x] Integrate with settings global and routing configuration
- [x] Add caching for archive page lookups
- [x] Create fallback logic for collections without archives

### **🧪 TESTING & VALIDATION (Week 2)** ✅ **COMPLETE**

#### **Task 7.16: Component Integration Testing** ✅ **COMPLETE**

- [x] Test all updated components work together
- [x] Verify navigation flows use correct URIs throughout
- [x] Test preview system works with new URI-based logic
- [x] Validate breadcrumbs work across all content types
- [x] Test link generation in rich text and CMS links

#### **Task 7.17: Fallback System Validation** ✅ **COMPLETE**

- [x] Verify graceful fallbacks when URI field is missing
- [x] Test backward compatibility with existing content
- [x] Validate error handling for malformed URIs
- [x] Test performance impact of URI field queries

#### **Task 7.18: SEO & Link Validation** ✅ **COMPLETE**

- [x] Verify all internal links use proper URI structure
- [x] Test canonical URL generation with new system
- [x] Validate no broken internal links exist
- [x] Test sitemap URLs match component-generated links

### **📚 DOCUMENTATION & CLEANUP (Week 2)** ✅ **COMPLETE**

#### **Task 7.19: Update Component Documentation** ✅ **COMPLETE**

- [x] Document URI field usage in component documentation
- [x] Update any README files that reference old path system
- [x] Create migration guide for future component development
- [x] Document fallback patterns for URI field usage

#### **Task 7.20: Final Component Cleanup** ✅ **COMPLETE**

- [x] Remove any remaining references to old path mapping
- [x] Clean up unused imports and dependencies
- [x] Verify TypeScript types are updated for URI usage
- [x] Remove any TODO comments related to path construction

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
