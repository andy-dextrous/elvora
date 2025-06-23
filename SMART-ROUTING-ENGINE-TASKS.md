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

**🔄 Next Up: Phase 5 - GraphQL Integration**

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

🔗 Phase 5: GraphQL Integration
   └── Build organized GraphQL module with cache-powered resolvers

🗺️ Phase 6: URI-Based Sitemaps
   └── Create organized sitemaps module with universal routing URIs

🔧 Phase 7: Collection Integration
   └── Migrate all collections to use universal system, remove legacy code

🛣️ Phase 7.5: Routing Module Organization
   └── Organize routing system into clean, documented module structure

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
5. **GraphQL Layer** - Advanced query capabilities
6. **Sitemap Integration** - URI-aware sitemap generation
7. **Collection Updates** - Apply universal system across all content
8. **Advanced Features** - Performance and monitoring
9. **Testing** - Validate entire system works correctly
10. **Production** - Final cleanup and deployment readiness

## 📚 Reference Documents

The complete planning history and architecture details are in:

- `planning/smart-content-engine.md` - Complete architecture and implementation strategy
- `planning/smart-content-overview.md` - System overview and current status

### **Module Documentation**

- `src/lib/payload/cache/README.md` - **Cache System** - Universal cache, configuration-driven dependencies, and smart revalidation
- `src/lib/payload/graphql/README.md` - **GraphQL Integration** - Cache-powered resolvers, fragments, and complex queries _(to be created)_
- `src/lib/payload/sitemaps/README.md` - **URI-Based Sitemaps** - Universal sitemap generation with SEO compliance _(to be created)_
- `src/lib/payload/routing/README.md` - **URI Engine** - Unified URI creation, parsing, and conflict detection _(to be created)_

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

## 🔗 **Phase 5: GraphQL Integration**

### GraphQL Module Organization

- [ ] Create `src/lib/payload/graphql/` folder structure
- [ ] Create `src/lib/payload/graphql/README.md` - GraphQL integration guide
- [ ] Create `src/lib/payload/graphql/index.ts` - Clean exports for all GraphQL functionality
- [ ] Create `src/lib/payload/graphql/client.ts` for client-side setup
- [ ] Create `src/lib/payload/graphql/resolvers.ts` using universal cache
- [ ] Create `src/lib/payload/graphql/fragments/` folder structure
- [ ] Create `src/lib/payload/graphql/queries/` folder structure
- [ ] Create `src/lib/payload/graphql/mutations/` folder structure
- [ ] Create `src/lib/payload/graphql/types/` folder structure
- [ ] Set up GraphQL codegen for TypeScript type generation

### Fragment Development

- [ ] Create `page-fields.ts` fragment
- [ ] Create `post-fields.ts` fragment
- [ ] Create `meta-fields.ts` fragment for SEO
- [ ] Create `media-fields.ts` fragment

### Complex Query Examples

- [ ] Create `homepage-data.ts` multi-collection query
- [ ] Create `page-data.ts` page with header/footer query
- [ ] Create `blog-archive.ts` blog listing with filters
- [ ] Create `search-results.ts` search functionality

### Cache-Powered Resolvers

- [ ] Build page/post resolvers using `cache.getBySlug()`
- [ ] Build global resolvers using `cache.getGlobal()`
- [ ] Build collection resolvers using `cache.getCollection()`
- [ ] Implement resolver-level caching

### GraphQL Migration Tasks

- [ ] Migrate `getRelatedPosts()` to GraphQL with complex relationship queries
- [ ] Migrate `getDefaultTemplate()` to GraphQL with relationship lookups
- [ ] Create GraphQL queries for multi-collection operations
- [ ] Replace any remaining complex cache functions with GraphQL equivalents

## 🗺️ **Phase 6: URI-Based Sitemaps**

### Sitemaps Module Organization

- [ ] Create `src/lib/payload/sitemaps/` folder structure
- [ ] Create `src/lib/payload/sitemaps/README.md` - How URI-based sitemaps work
- [ ] Create `src/lib/payload/sitemaps/index.ts` - Clean exports for all sitemap functionality
- [ ] Create `src/lib/payload/sitemaps/config.ts` with SITEMAP_CONFIG
- [ ] Create `src/lib/payload/sitemaps/generator.ts` - Universal sitemap generator
- [ ] Create `src/lib/payload/sitemaps/route-factory.ts` - Dynamic route creation
- [ ] Create `src/lib/payload/sitemaps/seo-filters.ts` - noIndex, canonical URL logic

### Sitemap Configuration

- [ ] Define collection-to-sitemap mappings in config
- [ ] Add SEO filtering configuration
- [ ] Include archive page detection logic

### Universal Sitemap Generator

- [ ] Implement `generateSitemap()` using universal cache + URI engine
- [ ] Add SEO-aware filtering (noIndex, canonical URLs)
- [ ] Use URI field instead of slug concatenation
- [ ] Add automatic new collection support

### Sitemap Route Factory

- [ ] Replace hardcoded sitemap routes with factory
- [ ] Migrate `pages-sitemap.xml/route.ts` to use factory
- [ ] Migrate `posts-sitemap.xml/route.ts` to use factory
- [ ] Integrate with universal tag system

### SEO Compliance

- [ ] Add `noIndex` and `canonicalUrl` fields to posts collection
- [ ] Update sitemap field selection to include SEO fields
- [ ] Implement canonical URL handling logic
- [ ] Add external canonical URL detection and exclusion

## 🔧 **Phase 7: Collection Integration**

### Hook Migration

- [ ] Replace `revalidatePage.ts` with new hooks
- [ ] Replace `revalidatePost.ts` with new hooks
- [ ] Replace `createRevalidationHooks()` with new hooks
- [ ] Replace `revalidateSettings.ts`, `revalidateHeader.ts`, `revalidateFooter.ts` with new global hooks
- [ ] Update all collection configurations to use new hooks
- [ ] Update all global configurations to use new global hooks

### Remove Legacy Revalidation

- [ ] Delete `src/payload/hooks/revalidateCollection.ts`
- [ ] Delete `src/payload/collections/pages/hooks/revalidatePage.ts`
- [ ] Delete `src/payload/collections/posts/hooks/revalidatePost.ts`
- [ ] Clean up any remaining manual revalidation code

### Universal Routing Integration

- [ ] Update `universal-resolver.ts` to use universal cache
- [ ] Implement URI-first caching in resolver
- [ ] Add cache warming for newly generated URIs
- [ ] Optimize resolver performance with smart caching

## 🛣️ **Phase 7.5: Routing Module Organization**

### Routing Module Organization

- [ ] Create `src/lib/payload/routing/` folder structure
- [ ] Create `src/lib/payload/routing/README.md` - URI engine documentation
- [ ] Create `src/lib/payload/routing/index.ts` - Clean exports for all routing functionality
- [ ] Move `src/lib/payload/routing-engine.ts` to `src/lib/payload/routing/uri-engine.ts`
- [ ] Move `src/lib/payload/routing.ts` to `src/lib/payload/routing/document-resolver.ts`
- [ ] Create `src/lib/payload/routing/conflict-detection.ts` - Enhanced conflict detection
- [ ] Update all imports to use new routing module structure

## 🚀 **Phase 8: Advanced Features**

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

## 🏁 **Phase 9: Final Integration**

### Complete API Replacement

- [ ] Remove all legacy cache functions
- [ ] Update all components to use universal cache or GraphQL
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
