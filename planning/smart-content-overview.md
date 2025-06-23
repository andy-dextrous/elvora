# Smart Routing Engine - Overview

> **The Vision**: A unified, intelligent routing and caching system that "just works" like WordPress but with modern performance and type safety.

## 🎯 **The Core Problem**

**Current State: 8+ Different Caching Patterns**

```
❌ getPageBySlug()    ❌ getPostBySlug()      ❌ getCachedDocument()
❌ getCachedGlobal()  ❌ getRecentPosts()     ❌ getDefaultTemplate()
❌ Custom per collection ❌ Inconsistent cache keys ❌ Broken tag mapping
```

**Target State: Smart Routing Engine (Cache + GraphQL + Universal Routing)**

```
✅ cache.getByURI()     ✅ cache.getBySlug()     ✅ cache.getCollection()
✅ cache.getGlobal()    ✅ GraphQL queries       ✅ Smart auto-invalidation
✅ Universal URI system ✅ WordPress-like routing ✅ First-match-wins resolution
```

---

## 🏗️ **System Architecture Overview**

### Module Structure

```
Smart Routing Engine
├── 🧠 Core Engine (Foundation)
│   ├── cache.ts (Universal Cache API)
│   ├── cache-config.ts (Configuration)
│   ├── cache-tags.ts (Tag Management)
│   └── uri-engine.ts (Unified URI System) 🔄 TO BE CREATED
├── 🔄 Smart Revalidation
│   ├── revalidation.ts (Invalidation Engine)
│   └── universal-hooks.ts (Collection Hooks - in payload/hooks/)
├── 🛣️ Universal Routing ✅ FOUNDATION IMPLEMENTED
│   ├── routing.ts (WordPress-like document resolution) ✅
│   ├── create-uri.ts (URI generation) ✅
│   ├── slug field enhancement (URI pre-computation) ✅
│   └── uri-engine.ts (Unified creation + parsing) 🔄 NEEDS INTEGRATION
├── 🗺️ URI-Based Sitemaps
│   ├── sitemap-generator.ts (Generator)
│   ├── sitemap-config.ts (Configuration)
│   └── sitemap-route-factory.ts (Routes)
├── 🔗 GraphQL Query Layer
│   ├── client.ts (Client-side GraphQL setup)
│   ├── resolvers.ts (Cache-powered resolvers)
│   ├── queries/ (Complex, reusable queries)
│   ├── fragments/ (Reusable field fragments)
│   ├── mutations/ (Form submissions)
│   └── types/ (Generated TypeScript types)
└── 🔧 Migration Tools
    ├── API replacements
    └── Legacy cleanup
```

---

## 📋 **Implementation Modules**

### **MODULE 1: Foundation Layer**

_Build the core universal cache system + unified URI engine_

```
Foundation Layer
├── Universal Cache API
│   ├── ✅ Single cache interface
│   ├── ✅ Standardized cache keys
│   └── ✅ TypeScript interfaces
├── Configuration System
│   ├── ✅ Collection-specific configs
│   ├── ✅ Smart defaults
│   └── ✅ Auto-discovery
├── Unified URI Engine 🔄 NEEDS INTEGRATION
│   ├── ✅ URI creation system (create-uri.ts) ✅ DONE
│   ├── ✅ URI parsing system (routing.ts) ✅ DONE
│   ├── 🔄 Unified URI engine (merge creation + parsing)
│   ├── 🔄 Shared settings caching between systems
│   ├── 🔄 Bidirectional validation (creation ↔ parsing)
│   └── 🔄 Enhanced conflict detection with caching
└── Tag Management
    ├── ✅ Hierarchical tags
    ├── ✅ Dependency resolution
    └── ✅ Debug utilities
```

**Key Files to Create:**

- `src/lib/payload/cache.ts` - Universal API
- `src/lib/payload/cache-config.ts` - Configuration
- `src/lib/payload/cache-tags.ts` - Tag system
- `src/lib/payload/uri-engine.ts` - 🔄 **TO CREATE**: Unify existing URI systems
- `src/payload/hooks/universal-hooks.ts` - Collection hooks

**Universal Routing Foundation Already Built:**

- `src/lib/payload/routing.ts` - ✅ Universal document resolver (parsing side)
- `src/payload/fields/slug/create-uri.ts` - ✅ URI generation system (creation side)
- `src/payload/fields/slug/index.ts` - ✅ Enhanced slug field with URI support
- Enhanced slug field across all collections with pre-computed URIs ✅

**Integration Work Needed:**

- **URI Engine**: Create unified system that brings together existing creation + parsing logic
- **Settings Caching**: Share routing configuration between creation and parsing systems
- **Conflict Detection**: Enhance existing validation with universal cache integration
- **Performance**: Optimize the loose coupling between creation and parsing systems

---

### **MODULE 2: Smart Revalidation**

_Replace manual hooks with intelligent invalidation_

```
Smart Revalidation
├── Revalidation Engine
│   ├── ✅ Change detection (URI, status, content)
│   ├── ✅ Cascade invalidation (parent→child)
│   └── ✅ Batch operations
├── Universal Hooks (src/payload/hooks/)
│   ├── ✅ Factory: createUniversalHooks()
│   ├── ✅ Config-driven behavior
│   ├── ✅ Related content invalidation
│   └── ✅ Replaces existing revalidateCollection.ts
└── Sitemap Integration
    ├── ✅ Correct tag mapping
    ├── ✅ Fix services → pages-sitemap
    └── ✅ Remove orphaned tags
```

**Key Fixes:**

- ❌ Services use `services-sitemap` tag but belong in `pages-sitemap`
- ❌ Posts hardcode `/blog/{slug}` paths vs universal URIs
- ❌ No cascade invalidation for hierarchical pages

---

### **MODULE 3: API Migration**

_Replace all existing cache functions with universal API + GraphQL layer_

```
API Migration (8 Functions → Universal Cache + GraphQL)
├── Direct Cache API (Server Components)
│   ├── getPageBySlug() → cache.getBySlug("pages", slug)
│   ├── getPostBySlug() → cache.getBySlug("posts", slug)
│   ├── getCachedDocument() → cache.getBySlug()
│   └── getCachedGlobal() → cache.getGlobal()
├── GraphQL Layer (Complex Queries)
│   ├── getRecentPosts() → GraphQL query
│   ├── Homepage data → GraphQL query
│   └── Multi-collection queries → GraphQL query
└── Universal Routing
    └── getDocumentByURI() → cache.getByURI()
```

**Migration Strategy:**

1. Create universal cache alongside existing functions
2. Build GraphQL resolvers using universal cache
3. Update components based on use case (direct cache vs GraphQL)
4. Remove legacy functions once migration complete

---

### **MODULE 4: Collection Integration**

_Update all collections to use universal system_

```
Collection Integration
├── Replace Collection Hooks
│   ├── ❌ revalidatePage.ts → ✅ Universal hooks
│   ├── ❌ revalidatePost.ts → ✅ Universal hooks
│   ├── ❌ createRevalidationHooks() → ✅ Universal hooks
│   └── ❌ Manual tag management → ✅ Config-driven
├── Fix Tag Mapping
│   ├── Services: services-sitemap → sitemap:pages
│   ├── Team: team-sitemap → (remove, no sitemap)
│   └── Posts: posts-sitemap → sitemap:posts
└── Universal Routing Integration
    ├── ✅ URI-first caching
    ├── ✅ Cache warming on URI generation
    └── ✅ Performance optimization
```

---

### **MODULE 5: URI-Based Sitemaps**

_Generate sitemaps using universal routing URIs_

```
URI-Based Sitemaps
├── Current Problems
│   ├── ❌ Hardcoded: /blog/{slug}, /services/{slug}
│   ├── ❌ Ignores: universal routing URIs
│   ├── ❌ Manual: collection queries per sitemap
│   └── ❌ Missing: SEO fields (noIndex, canonical)
├── Universal Solution
│   ├── ✅ Configuration-driven sitemap assignment
│   ├── ✅ URI field instead of slug concatenation
│   ├── ✅ SEO-aware filtering
│   └── ✅ Automatic new collection support
└── Enhanced Features
    ├── ✅ Archive page detection
    ├── ✅ Canonical URL handling
    └── ✅ Performance optimization
```

**Key Sitemap Routes:**

- `pages-sitemap.xml` → Pages + Services (using URIs)
- `posts-sitemap.xml` → Posts (using URIs)

---

### **MODULE 6: URI Engine Integration**

_Unified URI system that works with universal cache_

```
URI Engine Integration
├── Current Problems
│   ├── ❌ URI creation and parsing are separate systems
│   ├── ❌ Settings fetched independently by both systems
│   ├── ❌ Debugging complexity across two systems
│   └── ❌ Logic duplication and drift risk
├── Unified URI Engine
│   ├── ✅ Single system for creation AND parsing
│   ├── ✅ Shared settings caching via universal cache
│   ├── ✅ Bidirectional validation (creation ↔ parsing)
│   └── ✅ Enhanced conflict detection with caching
├── Integration Points
│   ├── ✅ URIEngine.getRoutingConfig() → cache.getGlobal()
│   ├── ✅ URIEngine.resolve() → cache.getBySlug()
│   ├── ✅ URIEngine.checkConflicts() → cached queries
│   └── ✅ URI changes → universal revalidation
└── Advanced Features
    ├── ✅ URI migration system (old → new redirects)
    ├── ✅ Bulk URI operations
    ├── ✅ Performance monitoring
    └── ✅ Analytics and debugging tools
```

**MODULE 7: GraphQL Integration**

_Build GraphQL layer on top of universal cache_

```
GraphQL Integration
├── File Organization
│   ├── ✅ queries/ - Complex, reusable queries
│   ├── ✅ fragments/ - Reusable field fragments
│   ├── ✅ mutations/ - Form submissions
│   └── ✅ types/ - Generated TypeScript types
├── Cache-Powered Resolvers
│   ├── ✅ Page/Post resolvers use cache.getBySlug()
│   ├── ✅ Global resolvers use cache.getGlobal()
│   └── ✅ Collection resolvers use cache.getCollection()
├── Fragment-First Development
│   ├── ✅ page-fields.ts - Page field fragments
│   ├── ✅ post-fields.ts - Post field fragments
│   ├── ✅ meta-fields.ts - SEO meta fragments
│   └── ✅ media-fields.ts - Media/image fragments
├── Complex Query Examples
│   ├── ✅ homepage-data.ts - Multi-collection homepage
│   ├── ✅ page-data.ts - Page with header/footer
│   ├── ✅ blog-archive.ts - Blog listing with filters
│   └── ✅ search-results.ts - Search functionality
└── Performance Features
    ├── ✅ Single network requests
    ├── ✅ Auto-generated TypeScript types
    └── ✅ Resolver-level caching
```

### **MODULE 8: Advanced Features**

_Performance optimization and monitoring_

```
Advanced Features
├── Cache Warming
│   ├── ✅ Preemptive cache generation
│   ├── ✅ Related content warming
│   └── ✅ Sitemap cache warming
├── Performance Monitoring
│   ├── ✅ Cache hit/miss tracking
│   ├── ✅ Response time monitoring
│   └── ✅ Memory usage optimization
├── Smart Invalidation
│   ├── ✅ Related content invalidation
│   ├── ✅ Category change cascades
│   └── ✅ Parent/child relationships
└── URI Engine Features
    ├── ✅ URI migration and redirect system
    ├── ✅ Bulk URI regeneration tools
    ├── ✅ URI performance analytics
    └── ✅ Advanced conflict resolution
```

---

## 🚀 **High-Level Implementation Plan**

### **Phase 1: Foundation (Week 1)**

```
Day 1-2: Create Universal Cache API + URI Engine
├── cache.ts - Single API interface
├── cache-config.ts - Configuration system
├── cache-tags.ts - Tag management
└── uri-engine.ts - 🔄 TO CREATE: Unify existing URI systems

Day 3-4: Smart Revalidation + URI Integration
├── revalidation.ts - Change detection & invalidation
├── universal-hooks.ts - Collection hook factory (in payload/hooks/)
└── URI Engine integration with cache system 🔄 TO DO

Day 5: Testing & Validation
├── Unit tests for core functions + URI engine
├── URI bidirectional validation tests ✅ WORKING
└── Integration testing with existing system

**STATUS: Universal Routing Foundation Complete** ✅
- WordPress-like routing hierarchy implemented
- URI generation working across all collections (creation side)
- Document resolution working with first-match-wins (parsing side)
- Enhanced slug fields deployed

**NEXT: URI Systems Integration** 🔄
- Create unified URI engine that merges creation + parsing logic
- Implement shared settings caching between systems
- Add enhanced conflict detection with universal cache
- Optimize performance of current loose coupling

Task 1.5: Cache Dependency Engine
├── Create dependency resolution algorithm
├── Implement smart change detection
├── Add cycle detection and prevention
├── Build performance controls (batching, rate limiting)
└── Create dependency visualization tools (dev mode)

Task 1.6: Cross-Collection Dependency Mapping
├── Settings → URI regeneration mapping
├── Category changes → Post invalidation rules
├── Parent page → Child page cascade rules
└── Archive page → Collection items cascade rules
```

### **Phase 2: Migration (Week 2)**

```
Day 1-2: Replace Core Cache Functions
├── Migrate getPageBySlug, getPostBySlug
├── Migrate getCachedDocument, getCachedGlobal
└── Update all route handlers

Day 3-4: Collection Hook Migration
├── Replace all custom revalidation hooks
├── Fix sitemap tag mapping
└── Remove legacy revalidation files

Day 5: Universal Routing Integration
├── Update URI resolver to use universal cache
└── Performance optimization
```

### **Phase 3: URI Engine & GraphQL (Week 3)**

```
Day 1-2: URI Engine Advanced Features
├── Advanced conflict detection and resolution
├── URI migration system (old → new redirects)
├── Bulk URI operations and management
└── URI performance monitoring

Day 3-4: URI-Based Sitemaps + GraphQL Integration
├── Create sitemap generator using URI Engine
├── Replace hardcoded sitemap routes
├── Create GraphQL folder structure (queries/, fragments/, mutations/)
├── Build GraphQL resolvers using universal cache + URI Engine
└── Set up client-side GraphQL with type generation

Day 5: Testing & Documentation
├── End-to-end testing (cache + URI + GraphQL)
├── URI bidirectional validation testing
├── Performance benchmarking
└── Clean up legacy code
```

### **Phase 4: Advanced Features (Week 4)**

```
Day 1-2: Cache Warming & URI Analytics
├── Preemptive cache generation
├── URI usage analytics and monitoring
├── Performance monitoring setup
└── Cache + URI analytics dashboard

Day 3-4: Smart Invalidation & URI Migration
├── Related content invalidation
├── Category change cascades
├── Parent/child relationships
└── Advanced URI migration and redirect system

Day 5: Final Polish
├── Performance optimization (cache + URI)
├── Complete documentation
└── Production readiness validation
```

---

## 🧪 **Success Metrics**

### **Must Have** ✅

- [ ] Single universal cache API replaces all 8+ functions
- [ ] Unified URI engine handles both creation and parsing
- [ ] Consistent cache keys across all collections
- [ ] Correct sitemap tag mapping (no orphaned tags)
- [ ] URI changes properly invalidate old and new paths
- [ ] Sitemap URLs match universal routing URIs
- [ ] Bidirectional URI validation prevents drift

### **Performance** 📊

- [ ] Cache hit rates >85% for static content
- [ ] Response times match or exceed current system
- [ ] Memory usage optimized and monitored

### **Developer Experience** 👨‍💻

- [ ] One line (`...slugField()`) enables full URL system
- [ ] Cache configuration happens automatically
- [ ] Zero manual sitemap management
- [ ] Unified URI system prevents creation/parsing bugs
- [ ] GraphQL + direct cache API for all use cases

---

## 🔍 **Configuration Examples**

### **Cache Configuration**

```typescript
// Smart cache configuration (auto-detects URI capabilities)
export const CACHE_CONFIG = {
  default: {
    ttl: 3600, // 1 hour default cache duration
    dependencies: [], // Tags that invalidate this collection's cache
  },
  pages: {
    ttl: 3600, // 1 hour (pages change moderately)
    dependencies: ["global:settings"], // Settings can change archive slugs → affects all URIs
  },
  posts: {
    ttl: 1800, // 30 minutes (posts change frequently)
    dependencies: ["global:settings", "collection:categories"], // Categories affect post URIs
  },
  services: {
    ttl: 7200, // 2 hours (services change rarely)
    dependencies: ["global:settings"],
  },
  team: {
    ttl: 86400, // 24 hours (team rarely changes - auto-detects no URI support)
    dependencies: [],
  },
}

// ✅ Smart detection functions
export function hasURISupport(collection: string): boolean {
  // Auto-detect from collection config - does it have a slug field?
  const collectionConfig = getPayloadCollectionConfig(collection)
  return collectionConfig.fields.some(field => field.name === "slug")
}

export function shouldIncludeInSitemap(collection: string): boolean {
  // Check sitemap config (single source of truth)
  return getSitemapForCollection(collection) !== null
}
```

### **Sitemap Configuration**

```typescript
// Automatic sitemap assignment
export const SITEMAP_CONFIG = {
  pages: {
    collections: ["pages", "services"], // ✅ Services belong here
    route: "/pages-sitemap.xml",
  },
  posts: {
    collections: ["posts"],
    route: "/posts-sitemap.xml",
  },
}
```

---

## 🎉 **The End Result**

**Before: Manual & Fragmented**

```
❌ 8+ different cache functions
❌ Inconsistent cache keys
❌ Manual sitemap management
❌ Hardcoded URL construction
❌ Broken tag relationships
❌ Complex routing setup
```

**After: Smart Routing Engine**

```
✅ One universal cache API
✅ Unified URI engine (creation + parsing) ✅ IMPLEMENTED
✅ WordPress-like routing hierarchy ✅ IMPLEMENTED
✅ First-match-wins resolution ✅ IMPLEMENTED
✅ GraphQL layer for complex queries
✅ Configuration-driven behavior
✅ Automatic sitemap generation
✅ URI-based URL construction ✅ IMPLEMENTED
✅ Smart cascade invalidation
✅ Bidirectional URI validation ✅ IMPLEMENTED
```

**The WordPress Feeling**: Create content → Everything just works. URLs make sense. SEO works. Sitemaps are accurate. Performance is fast. Zero configuration.

**Current Status**: Universal routing system is implemented and working. Next phase focuses on completing the caching layer and GraphQL integration to create the full Smart Routing Engine experience.
