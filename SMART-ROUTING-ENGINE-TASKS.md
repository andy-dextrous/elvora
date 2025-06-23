# Smart Routing Engine - Implementation Tasklist

> **Important**: This is an iterative implementation plan. Before starting any task, consult with me to finalize the "how" and approach. We'll refine this plan together as we progress.

## 🎯 **Current Status**

**✅ Phase 1.1 - Universal Cache API: COMPLETE**

- Universal cache interface with `getByURI()`, `getBySlug()`, `getCollection()`, `getGlobal()`
- Standardized cache key generation system
- TypeScript interfaces for all operations
- Payload logger integration for cache debugging
- Removed redundant `getComputed()` (replaced by GraphQL approach)

**🔄 Next Up: Phase 1.2 - Cache Configuration System**

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
   └── Build GraphQL layer on top of universal cache for complex queries

🗺️ Phase 6: URI-Based Sitemaps
   └── Generate sitemaps using universal routing URIs instead of hardcoded paths

🔧 Phase 7: Collection Integration
   └── Migrate all collections to use universal system, remove legacy code

🚀 Phase 8: Advanced Features
   └── Add cache warming, performance monitoring, and smart invalidation

🧪 Phase 9: Testing & Validation
   └── Comprehensive testing strategy for all system components

🏁 Phase 10: Final Integration
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

## 🏗️ **Phase 1: Foundation Layer**

### Universal Cache API ✅ **COMPLETE**

- [x] Create `src/lib/payload/cache.ts` with unified cache interface
- [x] Build standardized cache key generation system
- [x] Implement TypeScript interfaces for all cache operations
- [x] Add cache hit/miss debug logging (with Payload logger integration)
- [x] Remove `getComputed()` method (redundant with GraphQL plans)

### Cache Configuration System

- [ ] Create `src/lib/payload/cache-config.ts` with CACHE_CONFIG object
- [ ] Implement `getCacheConfig()` with fallback defaults
- [ ] Add `hasURISupport()` auto-detection function
- [ ] Create `getSitemapForCollection()` mapping function
- [ ] Add validation for cache configuration

### Universal Tag System

- [ ] Create `src/lib/payload/cache-tags.ts` with tag generation functions
- [ ] Implement hierarchical tag system (collection, item, uri, global)
- [ ] Add tag validation and normalization
- [ ] Create tag dependency resolution logic
- [ ] Build tag debugging utilities

### Universal Revalidation Engine

- [ ] Create `src/lib/payload/revalidation.ts` with `smartRevalidate()` function
- [ ] Implement change detection logic (URI, status, content changes)
- [ ] Add cascade invalidation for hierarchical content
- [ ] Create batch revalidation for bulk operations

## 🔄 **Phase 2: URI Engine Integration**

### Unified URI Engine

- [ ] Create `src/lib/payload/uri-engine.ts` that unifies existing creation + parsing
- [ ] Merge logic from `create-uri.ts` and `routing.ts` into single system
- [ ] Implement shared settings caching between creation and resolution
- [ ] Add bidirectional validation (creation ↔ parsing)
- [ ] Create enhanced conflict detection with caching

### URI Engine Features

- [ ] Implement `URIEngine.generate()` for creation
- [ ] Implement `URIEngine.resolve()` for parsing
- [ ] Add `URIEngine.getRoutingConfig()` with caching
- [ ] Create `URIEngine.checkConflicts()` with performance optimization
- [ ] Build URI validation and error handling

## 🔗 **Phase 3: Smart Revalidation System**

### Universal Collection Hooks

- [ ] Create `src/payload/hooks/universal-hooks.ts`
- [ ] Build `createUniversalHooks(collection)` factory function
- [ ] Implement smart `afterChange` hook using cache config
- [ ] Implement smart `afterDelete` hook
- [ ] Add support for related content invalidation

### Fix Sitemap Tag Mapping

- [ ] Update services collection to use `sitemap:pages` tag
- [ ] Remove orphaned `services-sitemap`, `team-sitemap` tags
- [ ] Update posts to use correct `sitemap:posts` tag
- [ ] Fix `/next/revalidate` route with correct tag mappings

### URI-Aware Revalidation

- [ ] Update URI generation hook to use universal revalidation
- [ ] Implement old URI → new URI transition logic
- [ ] Add support for hierarchical page URI changes
- [ ] Handle archive page setting changes with cascade invalidation

## 📊 **Phase 4: API Migration**

### Replace Core Cache Functions

- [ ] Migrate `getPageBySlug()` to `cache.getBySlug("pages", slug)`
- [ ] Migrate `getPostBySlug()` to `cache.getBySlug("posts", slug)`
- [ ] Migrate `getCachedDocument()` to universal cache API
- [ ] Migrate `getCachedGlobal()` to `cache.getGlobal()`
- [ ] Update all route handlers to use new API

### Replace Specialized Caching

- [ ] Migrate `getRecentPosts()` to GraphQL query
- [ ] Migrate `getDefaultTemplate()` to universal cache
- [ ] Migrate `getTestimonials()` to universal cache
- [ ] Update homepage data loading to use new system

## 🔗 **Phase 5: GraphQL Integration**

### GraphQL Organization

- [ ] Create `src/lib/payload/graphql/client.ts` for client-side setup
- [ ] Create `src/lib/payload/graphql/resolvers.ts` using universal cache
- [ ] Create `src/lib/payload/graphql/fragments/` folder structure
- [ ] Create `src/lib/payload/graphql/queries/` folder structure
- [ ] Create `src/lib/payload/graphql/mutations/` folder structure
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

## 🗺️ **Phase 6: URI-Based Sitemaps**

### Sitemap Configuration

- [ ] Create `src/lib/payload/sitemap-config.ts` with SITEMAP_CONFIG
- [ ] Define collection-to-sitemap mappings
- [ ] Add SEO filtering configuration
- [ ] Include archive page detection logic

### Universal Sitemap Generator

- [ ] Create `src/lib/payload/sitemap-generator.ts`
- [ ] Implement `generateSitemap()` using universal cache + URI engine
- [ ] Add SEO-aware filtering (noIndex, canonical URLs)
- [ ] Use URI field instead of slug concatenation
- [ ] Add automatic new collection support

### Sitemap Route Factory

- [ ] Create `src/lib/payload/sitemap-route-factory.ts`
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

### Universal Hook Migration

- [ ] Replace `revalidatePage.ts` with universal hooks
- [ ] Replace `revalidatePost.ts` with universal hooks
- [ ] Replace `createRevalidationHooks()` with universal hooks
- [ ] Update all collection configurations to use universal hooks

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

## 🧪 **Phase 9: Testing & Validation**

### Unit Testing

- [ ] Test cache key generation functions
- [ ] Test tag generation and validation
- [ ] Test URI engine bidirectional validation
- [ ] Test revalidation logic and change detection

### Integration Testing

- [ ] Test universal cache API with all collections
- [ ] Test revalidation hooks with real Payload operations
- [ ] Test URI generation + caching integration
- [ ] Test sitemap generation with universal cache

### Performance Testing

- [ ] Measure cache hit rate and optimize
- [ ] Compare response times (before/after migration)
- [ ] Monitor memory usage and create alerts
- [ ] Test bulk operation performance

### End-to-End Testing

- [ ] Test full content lifecycle (create → edit → publish → cache)
- [ ] Test slug/URI changes properly update cache
- [ ] Test hierarchical page changes cascade correctly
- [ ] Test live preview works with universal caching

## 🏁 **Phase 10: Final Integration**

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
