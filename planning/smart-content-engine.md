# Universal Caching & Revalidation Strategy

## 🪄 **The Magic Experience: "It Just Works"**

### **Creating New Content Types**

**You want this:**

> "I need a new 'Locations' collection for our office addresses. I create the collection, add a slug field, and... that's it. Done. The system automatically figures out that locations should have URLs like `/locations/new-york` and adds them to the sitemap. No configuration files to touch, no routes to create, no cache invalidation to set up. It just works."

**The magic behind the scenes:**

- Collection gets auto-discovered as "frontend-facing" because it has a slug field
- Universal routing automatically generates URIs: `/locations/chicago`, `/locations/boston`
- Sitemap system sees the new collection and includes it in `pages-sitemap.xml`
- Cache system automatically sets up invalidation when locations change
- Archive page detection looks for a page with slug "locations" and uses it as the archive

### **Hierarchical Content**

**You want this:**

> "I create a 'Services' page, then create sub-pages like 'Web Design' and 'SEO' with 'Services' as their parent. The URLs automatically become `/services`, `/services/web-design`, `/services/seo`. When I publish a new service item in the Services collection, it gets the URL `/services/enterprise-web-design`. Everything just flows naturally."

**The magic:**

- Parent-child relationships automatically generate nested URIs
- Collection items respect the archive page slug configuration
- Breadcrumbs automatically work across pages and collection items
- Sitemaps include all the hierarchical URLs in the right format
- When you change the "Services" page slug to "solutions", ALL the children automatically update to `/solutions/web-design`, etc.

### **SEO That Thinks for Itself**

**You want this:**

> "I check the 'No Index' box on a draft page, and it disappears from the sitemap automatically. I add a canonical URL to point to our main marketing site, and the page stops appearing in our sitemap but still works on our site. I don't have to remember to update anything manually."

**The magic:**

- SEO fields are respected everywhere automatically
- Sitemap generation reads `noIndex` and excludes those pages
- Canonical URLs are honored without breaking internal functionality
- Everything stays in sync without manual intervention

### **Content Publishing Flow**

**You want this:**

> "I write a blog post, hit publish, and within seconds the blog archive updates, the sitemap refreshes, the new post appears in 'Related Posts' sections, and all caches are smart enough to only invalidate what actually changed. I never think about cache management."

**The magic:**

- Publishing triggers smart cascade invalidation
- Related content (archives, recent posts, categories) updates automatically
- Sitemaps regenerate only the affected sections
- Page caches stay intact unless they actually reference the changed content
- Everything feels instant and reliable

### **URL Changes That Don't Break Things**

**You want this:**

> "I decide to rename 'Blog' to 'Insights' in my routing settings. Every blog post URL automatically changes from `/blog/post-name` to `/insights/post-name`. The sitemap updates itself. Old URLs automatically redirect to new ones. Users and search engines never see broken links."

**The magic:**

- URI regeneration happens automatically across all content
- Old URIs are detected and redirects are created
- Sitemaps reflect the new URL structure immediately
- Internal links update to use the new URIs
- Zero manual URL management

### **Archive Pages That Configure Themselves**

**You want this:**

> "I create a page called 'Team Members' and set it as the archive for my 'Team' collection in settings. Instantly, `/team-members` shows the team archive, and individual team member URLs become `/team-members/john-doe`. If I later change the page slug to 'our-team', everything automatically becomes `/our-team/john-doe`."

**The magic:**

- Archive page detection works through routing settings
- Collection items automatically inherit the archive page's slug
- URL changes cascade through all collection items
- Sitemaps understand the archive relationship
- Breadcrumbs work seamlessly between archive and items

### **Developer Experience**

**You want this:**

> "As a developer, I create a new collection config file, add `...slugField()` to the fields array, and immediately that collection has full URL support, sitemap inclusion, proper caching, and smart revalidation. I don't need to wire up routes, configure caches, or set up sitemap entries. The system is intelligent enough to handle it all."

**The magic:**

- One line (`...slugField()`) gives you the entire URL system
- Cache configuration happens automatically with smart defaults
- Sitemap assignment uses intelligent rules (content collections vs utility collections)
- Revalidation hooks are universal and work for any collection
- Performance is optimized without any manual tuning

### **The WordPress Feeling**

**You want this:**

> "It feels like WordPress where you just... create content and everything else works. URLs make sense. SEO works. Sitemaps are accurate. Performance is fast. But unlike WordPress, it's also type-safe, modern, and built on Next.js with all the performance benefits."

**The magic:**

- **Smart defaults** that work 95% of the time
- **Progressive enhancement** where you can customize the 5% that needs it
- **Zero-config startup** for new collections and content types
- **Intelligent behavior** that anticipates what you probably want
- **Self-healing systems** that fix relationships when things change
- **Invisible performance** through automatic caching and optimization

### **The "Aha" Moment**

**You want this:**

> "Six months later, you have 8 collections, 200+ pages, complex hierarchies, multiple archive configurations, and the system is still humming along perfectly. You never had to debug cache issues, fix broken sitemaps, or manually manage URL structures. It just... worked. Like WordPress, but better."

**That's the vision** - a system so intelligent and well-designed that content management feels effortless, URLs are always logical, and technical complexity stays hidden while giving you all the power and performance of modern web development.

## 📊 Current State Analysis

### ⚠️ **Current Problems**

**1. Fragmented Cache APIs (8+ Different Patterns)**

- `getPageBySlug()`, `getPostBySlug()`, `getCachedDocument()`, `getCachedGlobal()`
- Each collection has its own caching logic and patterns
- No consistency in parameter handling or return types

**2. Inconsistent Cache Keys**

```typescript
// Current chaos:
["page", slug, "draft"]                    // pages
["post", slug]                            // posts (no draft state!)
[collection, slug, depth]                 // generic collections
["all-pages"] vs ["posts"] vs ["recent-posts"] // collections
```

**3. Broken Tag Strategy**

- Services revalidate `"services-sitemap"` but are in `"pages-sitemap"`
- Team/testimonials revalidate non-existent sitemap tags
- Mix of `page_slug` vs `post_slug` vs `collection_slug` patterns
- No URI-based tags for universal routing

**4. Manual Revalidation Logic**

- Each collection has custom `afterChange`/`afterDelete` hooks
- Hardcoded path assumptions (`/blog/{slug}` vs URI-based paths)
- Missing related content invalidation
- No cascade invalidation for hierarchical content

---

## 🎯 **Universal Cache Architecture**

### **1. Single Cache API**

Replace all scattered caching functions with **unified cache + GraphQL system**:

```typescript
// src/lib/payload/cache.ts - Universal Cache API
export const cache = {
  // URI-based (primary for universal routing)
  getByURI: (uri: string, draft?: boolean) => Promise<ResolvedDocument | null>

  // Collection-based
  getBySlug: (collection: string, slug: string, draft?: boolean) => Promise<Document | null>
  getCollection: (collection: string, options?: QueryOptions) => Promise<Document[]>

  // Globals
  getGlobal: (slug: string) => Promise<Global>
}

// GraphQL layer for complex queries (uses cache internally)
query PageData($slug: String!) {
  page(slug: $slug) { title, content, meta { title } }
  header { nav { label, url } }
  recentPosts(limit: 3) { title, slug }
}
```

### **2. Standardized Cache Keys**

**Universal Pattern for All Content:**

```typescript
// Individual items
[collection, "item", slug, draft ? "draft" : "published"]

// Collection queries
[collection, "list", queryHash, draft ? "draft" : "published"]

// URI-based lookups
["uri", normalizedURI, draft ? "draft" : "published"]

// Globals
["global", globalSlug]

// Related/computed content
["computed", type, ...params]
```

### **3. Universal Tag Strategy**

**Hierarchical Tag System:**

```typescript
// Collection level (invalidates all items)
collection:{collection}              // e.g., collection:pages

// Individual items
item:{collection}:{slug}            // e.g., item:pages:about

// URI-based (for universal routing)
uri:{normalized_uri}               // e.g., uri:about, uri:blog/hello

// Globals
global:{slug}                      // e.g., global:settings

// Sitemaps (only real ones)
sitemap:pages                     // pages + services
sitemap:posts                     // posts only

// Computed/related content
computed:{type}                   // e.g., computed:recent-posts
```

### **4. Configuration-Driven Behavior**

**Cache Configuration Object:**

```typescript
// src/lib/payload/cache-config.ts
export const CACHE_CONFIG = {
  // Default configuration for any collection not explicitly defined
  default: {
    ttl: 3600, // 1 hour default cache duration
    dependencies: [], // Tags that invalidate this collection's cache
  },

  // Collection-specific overrides
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
    ttl: 86400, // 24 hours (team rarely changes)
    dependencies: [],
  },
  testimonials: {
    ttl: 86400, // 24 hours (testimonials rarely change)
    dependencies: [],
  },
}

// Helper function to get configuration with fallback
export function getCacheConfig(collection: string): CacheConfig {
  return {
    ...CACHE_CONFIG.default,
    ...CACHE_CONFIG[collection],
  }
}

// Helper function to check if collection has URI support (auto-detected)
export function hasURISupport(collection: string): boolean {
  // Auto-detect from collection config - does it have a slug field?
  const collectionConfig = getPayloadCollectionConfig(collection)
  return collectionConfig.fields.some(field => field.name === "slug")
}

// Helper function to get sitemap for collection (derived from sitemap config)
export function getSitemapForCollection(collection: string): string | null {
  // Look through sitemap configs to find which one includes this collection
  for (const [sitemapName, config] of Object.entries(SITEMAP_CONFIG)) {
    if (config.collections?.includes(collection)) {
      return sitemapName
    }
  }
  return null
}
```

---

## 🗺️ **Universal Sitemap Integration**

### **Current Sitemap Problems**

**1. URI vs Slug Mismatch**

- Sitemaps use hardcoded slug concatenation (`/services/${slug}`)
- Universal routing uses computed `uri` field from documents
- Results in sitemap URLs that don't match actual page URIs

**2. Collection-Sitemap Mapping Issues**

- Services appear in `pages-sitemap` but use generic revalidation hooks
- No automatic sitemap assignment based on collection configuration
- Manual sitemap file creation for each new content type

**3. SEO Field Limitations**

- Missing `uri`, `meta.noIndex`, `meta.canonicalUrl` in sitemap queries
- Can't filter SEO-inappropriate content from sitemaps
- No canonical URL handling or external canonical exclusion

### **Universal Sitemap Solution**

**1. URI-First Sitemap Generation**

```typescript
// Use computed URI field instead of slug concatenation
const sitemap = results.docs.map(doc => ({
  loc: `${SITE_URL}${doc.uri}`, // ✅ Uses universal routing URI
  lastmod: doc.updatedAt || dateFallback,
}))
```

**2. Configuration-Driven Sitemap Assignment**

```typescript
// Automatic sitemap assignment from cache config
export const SITEMAP_CONFIG = {
  pages: {
    route: "/pages-sitemap.xml",
    collections: ["pages", "services"], // Services belong here
    includeArchives: true,
  },
  posts: {
    route: "/posts-sitemap.xml",
    collections: ["posts"],
    includeArchives: false,
  },
}
```

**3. SEO-Aware Sitemap Filtering**

```typescript
// Enhanced field selection for SEO compliance
const sitemapFieldSelection = {
  slug: true,
  uri: true, // ✅ Universal routing URI
  updatedAt: true,
  _status: true,
  meta: {
    noIndex: true, // ✅ Exclude from sitemaps
    canonicalUrl: true, // ✅ Use canonical URLs
  },
}

// Smart filtering logic
const shouldIncludeInSitemap = doc => {
  return (
    doc._status === "published" &&
    doc.uri && // Has valid URI
    !doc.meta?.noIndex && // Not excluded via SEO
    !isExternalCanonical(doc.meta?.canonicalUrl)
  )
}
```

### **Dynamic Sitemap API**

**1. Universal Sitemap Generator**

```typescript
// src/lib/payload/sitemap-generator.ts
export const generateSitemap = async (sitemapKey: string) => {
  const config = SITEMAP_CONFIG[sitemapKey]

  const entries = await Promise.all(
    config.collections.map(collection =>
      getSitemapEntriesForCollection(collection, config)
    )
  )

  return entries.flat()
}

// Auto-discovers collections and generates sitemaps
export const generateAllSitemaps = async () => {
  const configs = Object.keys(SITEMAP_CONFIG)
  return Promise.all(configs.map(generateSitemap))
}
```

**2. Sitemap Route Factory**

```typescript
// src/lib/payload/sitemap-route-factory.ts
export const createSitemapRoute = (sitemapKey: string) => {
  const getSitemap = unstable_cache(
    () => generateSitemap(sitemapKey),
    [`sitemap-${sitemapKey}`],
    { tags: [`sitemap:${sitemapKey}`] }
  )

  return async function GET() {
    const sitemap = await getSitemap()
    return getServerSideSitemap(sitemap)
  }
}

// Usage in route files
export const GET = createSitemapRoute("pages")
```

**3. Smart Tag Integration**

```typescript
// Automatically revalidate correct sitemaps
const getCollectionSitemaps = (collection: string): string[] => {
  return Object.entries(SITEMAP_CONFIG)
    .filter(([_, config]) => config.collections.includes(collection))
    .map(([key]) => `sitemap:${key}`)
}

// In universal revalidation hooks
const sitemapTags = getCollectionSitemaps(collectionSlug)
sitemapTags.forEach(tag => revalidateTag(tag))
```

### **Sitemap Scalability Features**

**1. Automatic New Collection Support**

```typescript
// New collections automatically get sitemaps based on config
export const discoverCollectionSitemaps = () => {
  return Object.entries(CACHE_CONFIG)
    .filter(([_, config]) => config.sitemapInclude)
    .map(([collection, config]) => ({
      collection,
      sitemap: config.sitemap,
    }))
}
```

**2. Bulk Sitemap Operations**

```typescript
// Bulk regenerate all sitemaps
export const regenerateAllSitemaps = async () => {
  const sitemaps = Object.keys(SITEMAP_CONFIG)
  await Promise.all(sitemaps.map(key => revalidateTag(`sitemap:${key}`)))
}

// Warm sitemap caches on deployment
export const warmSitemapCaches = async () => {
  await Promise.all(Object.keys(SITEMAP_CONFIG).map(generateSitemap))
}
```

**3. Sitemap Analytics & Monitoring**

```typescript
// Track sitemap generation performance
export const sitemapMetrics = {
  generationTime: new Map(),
  entryCount: new Map(),
  lastGenerated: new Map(),
}
```

---

## 🔗 **GraphQL Integration Architecture**

### **Layered Architecture**

```typescript
// Layer 1: Database (Payload)
// Layer 2: Universal Cache (our system)
// Layer 3: GraphQL Resolvers (using cache)
// Layer 4: Application (using GraphQL or direct cache)

┌─────────────────────┐
│   Server Components │ ← Direct cache.getBySlug() (fastest)
├─────────────────────┤
│   Client Components │ ← GraphQL queries (network requests)
├─────────────────────┤
│   GraphQL Resolvers │ ← Use universal cache internally
├─────────────────────┤
│   Universal Cache   │ ← Smart invalidation + performance
├─────────────────────┤
│   Payload Database  │ ← Source of truth
└─────────────────────┘
```

### **When to Use What**

**Direct Cache API (Server Components):**

```typescript
// Simple, fast requests - no network overhead
const page = await cache.getBySlug("pages", "about")
const header = await cache.getGlobal("header")
```

**GraphQL (Complex Queries):**

```typescript
// Complex parallel requests - single network call
const pageData = await graphql`
  query PageData($slug: String!) {
    page(slug: $slug) {
      title
      content
      meta {
        title
      }
    }
    header {
      nav {
        label
        url
      }
    }
    recentPosts(limit: 3) {
      title
      slug
    }
  }
`
```

### **GraphQL Resolver Implementation**

```typescript
// GraphQL resolvers powered by universal cache
const resolvers = {
  Query: {
    page: async (_, { slug }) => {
      return await cache.getBySlug("pages", slug) // Uses our cache system
    },
    recentPosts: async (_, { limit = 3 }) => {
      return await cache.getCollection("posts", {
        limit,
        sort: "-publishedAt",
      })
    },
  },
}

// Benefits:
// ✅ GraphQL gets automatic cache performance
// ✅ Cache invalidation works for GraphQL responses
// ✅ Consistent data layer across all APIs
```

---

## 🚀 **Implementation Plan**

### **Phase 1: Foundation (Universal Cache Layer)**

#### **Task 1.1: Create Universal Cache Utility**

- [ ] **File**: `src/lib/payload/cache.ts`
- [ ] Create `cache` object with unified API methods
- [ ] Implement standardized cache key generation
- [ ] Add debug logging for cache hits/misses
- [ ] Create TypeScript interfaces for all cache operations

#### **Task 1.2: Create Cache Configuration System**

- [ ] **File**: `src/lib/payload/cache-config.ts`
- [ ] Define `CACHE_CONFIG` with default fallback configuration
- [ ] Create helper functions for config lookup with fallback support
- [ ] Add validation for cache configuration
- [ ] Document cache configuration options
- [ ] Implement automatic collection discovery for unlisted collections

#### **Task 1.3: Implement Universal Tag System**

- [ ] **File**: `src/lib/payload/cache-tags.ts`
- [ ] Create tag generation functions (`itemTag()`, `uriTag()`, etc.)
- [ ] Implement tag validation and normalization
- [ ] Create tag dependency resolution
- [ ] Add tag debugging utilities

#### **Task 1.4: Create Universal Revalidation Engine**

- [ ] **File**: `src/lib/payload/revalidation.ts`
- [ ] Implement `smartRevalidate()` function
- [ ] Create change detection logic (URI, status, content)
- [ ] Add cascade invalidation for hierarchical content
- [ ] Implement batch revalidation for bulk operations

### **Phase 2: Smart Revalidation System**

#### **Task 2.1: Universal Collection Hooks**

- [ ] **File**: `src/payload/hooks/universal-hooks.ts`
- [ ] Create `createUniversalHooks(collection)` factory
- [ ] Implement smart `afterChange` hook using cache config
- [ ] Implement smart `afterDelete` hook
- [ ] Add support for related content invalidation

#### **Task 2.2: URI-Aware Revalidation**

- [ ] Update URI generation hook to use universal revalidation
- [ ] Implement old URI → new URI transition logic
- [ ] Add support for hierarchical page URI changes
- [ ] Handle archive page setting changes

#### **Task 2.3: Fix Sitemap Tag Mapping**

- [ ] Update all collections to use correct sitemap tags
- [ ] Remove orphaned sitemap tags (`services-sitemap`, `team-sitemap`)
- [ ] Update sitemap generation to use universal cache
- [ ] Fix `/next/revalidate` route with correct tags

#### **Task 2.4: Universal Sitemap Integration**

- [ ] **Create**: `src/lib/payload/sitemap-generator.ts`
- [ ] **Create**: `src/lib/payload/sitemap-route-factory.ts`
- [ ] **Create**: `src/lib/payload/sitemap-config.ts`
- [ ] Implement `generateSitemap()` using cache config
- [ ] Add SEO-aware filtering with `noIndex` support
- [ ] Use `uri` field instead of slug concatenation
- [ ] Add canonical URL handling logic

### **Phase 3: API Migration**

#### **Task 3.1: Replace Core Cache Functions**

- [ ] **Migrate**: `src/lib/payload/page.ts`
- [ ] Replace `getPageBySlug()` with `cache.getBySlug("pages", slug)`
- [ ] Replace `getAllPages()` with `cache.getCollection("pages")`
- [ ] **Migrate**: `src/lib/payload/post.ts`
- [ ] Replace `getPostBySlug()` with `cache.getBySlug("posts", slug)`
- [ ] **Migrate**: `src/lib/payload/document.ts` and `src/lib/payload/globals.ts`
- [ ] Replace `getCachedDocument()` and `getCachedGlobal()` with universal API

#### **Task 3.2: Build GraphQL Layer & Organization**

- [ ] **Create**: `src/lib/payload/graphql/` folder structure
- [ ] **Create**: `src/lib/payload/graphql/client.ts` - Client-side GraphQL setup
- [ ] **Create**: `src/lib/payload/graphql/resolvers.ts` - Cache-powered resolvers
- [ ] **Create**: `src/lib/payload/graphql/fragments/` for reusable field sets
  - [ ] `page-fields.ts` - Page field fragments
  - [ ] `post-fields.ts` - Post field fragments
  - [ ] `meta-fields.ts` - SEO meta fragments
  - [ ] `media-fields.ts` - Media/image fragments
- [ ] **Create**: `src/lib/payload/graphql/queries/` for complex queries
  - [ ] `homepage-data.ts` - Multi-collection homepage query
  - [ ] `page-data.ts` - Page with header/footer data
  - [ ] `blog-archive.ts` - Blog listing with filters
  - [ ] `search-results.ts` - Search functionality
- [ ] **Create**: `src/lib/payload/graphql/mutations/` for form submissions
  - [ ] `contact-form.ts` - Contact form mutation
  - [ ] `newsletter.ts` - Newsletter signup
- [ ] **Create**: `src/lib/payload/graphql/types/` for generated types
- [ ] **Setup**: GraphQL codegen for TypeScript type generation
- [ ] Build resolvers using universal cache (page, post, global resolvers)
- [ ] Create enhanced GraphQL schema with optimized field selection

#### **Task 3.3: Migrate Complex Queries to GraphQL**

- [ ] **Migrate**: `src/lib/payload/recent-posts.ts` → GraphQL query
- [ ] **Migrate**: Homepage data loading → GraphQL query
- [ ] **Migrate**: Multi-collection queries → GraphQL
- [ ] Update components to use GraphQL for complex parallel requests

#### **Task 3.4: Replace Specialized Caching**

- [ ] **Migrate**: `src/lib/payload/templates.ts`
- [ ] **Migrate**: `src/lib/payload/redirects.ts`
- [ ] **Migrate**: `src/lib/payload/testimonials.ts`

### **Phase 4: Collection Integration**

#### **Task 4.1: Update Collection Hooks**

- [ ] **Pages**: Replace custom `revalidatePage` hook
- [ ] **Posts**: Replace custom `revalidatePost` hook
- [ ] **Services**: Migrate from `createRevalidationHooks`
- [ ] **Team**: Migrate from `createRevalidationHooks`
- [ ] **Testimonials**: Migrate from `createRevalidationHooks`

#### **Task 4.2: Remove Legacy Revalidation**

- [ ] Delete `src/payload/hooks/revalidateCollection.ts` (replaced by universal-hooks.ts)
- [ ] Delete `src/payload/collections/pages/hooks/revalidatePage.ts`
- [ ] Delete `src/payload/collections/posts/hooks/revalidatePost.ts`
- [ ] Update all collection configurations to use universal hooks

#### **Task 4.3: Universal Routing Integration**

- [ ] Update `universal-resolver.ts` to use universal cache
- [ ] Implement URI-first caching in resolver
- [ ] Add cache warming for newly generated URIs
- [ ] Optimize resolver performance with smart caching

#### **Task 4.4: Sitemap Route Migration**

- [ ] **Migrate**: `src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.ts`
- [ ] **Migrate**: `src/app/(frontend)/(sitemaps)/posts-sitemap.xml/route.ts`
- [ ] Replace hardcoded sitemap routes with factory
- [ ] Integrate with universal tag system
- [ ] Add automatic cache invalidation
- [ ] Fix collection-sitemap mapping (move services to correct sitemap)
- [ ] Update services revalidation to use `sitemap:pages` tag
- [ ] Remove orphaned `services-sitemap` references

### **Phase 5: Advanced Features**

#### **Task 5.1: Cache Warming**

- [ ] Implement cache warming on publish
- [ ] Add preemptive cache generation for related content
- [ ] Create cache warming for sitemap generation
- [ ] Add bulk cache warming utilities

#### **Task 5.2: Cache Analytics**

- [ ] Add cache hit/miss tracking
- [ ] Implement performance monitoring
- [ ] Create cache size monitoring
- [ ] Add cache debugging dashboard (dev only)

#### **Task 5.3: Related Content Invalidation**

- [ ] Implement smart related post invalidation
- [ ] Add category change cascade invalidation
- [ ] Create parent/child page invalidation
- [ ] Add archive page dependency invalidation

#### **Task 5.4: Performance Optimization**

- [ ] Implement batch revalidation for bulk operations
- [ ] Add intelligent cache TTL based on change frequency
- [ ] Create memory usage optimization
- [ ] Add cache compression for large objects

### **Phase 6: Sitemap Enhancement**

#### **Task 6.1: Enhanced Field Selection**

- [ ] Add `uri`, `meta.noIndex`, `meta.canonicalUrl` to sitemap queries
- [ ] Implement SEO filtering logic
- [ ] Add external canonical URL detection
- [ ] Update TypeScript types for enhanced selection

#### **Task 6.2: Dynamic Sitemap Management**

- [ ] Add new collections automatically based on cache config
- [ ] Generate sitemap index dynamically
- [ ] Update `next-sitemap.config.cjs` to use dynamic routes
- [ ] Add sitemap validation and testing utilities

#### **Task 6.3: Sitemap Scalability Features**

- [ ] Implement automatic new collection support
- [ ] Add bulk sitemap operations (regenerate all, warm caches)
- [ ] Create sitemap analytics and monitoring
- [ ] Add sitemap performance tracking

---

## 🔗 **URI Architecture & Coupling Strategy**

### **Current URI System Analysis**

**URI Creation Side** (`src/payload/fields/slug/create-uri.ts`):

- **Process**: `createURIHook()` → Database queries → Settings lookup → URI generation
- **Logic**: Hierarchical pages, archive page configuration, conflict detection
- **Output**: Pre-computed URI stored in document's `uri` field

**URI Parsing Side** (`src/lib/payload/routing.ts`):

- **Process**: Request URI → Database lookup → Document match
- **Logic**: Simple `where: { uri: { equals: normalizedURI } }` across collections
- **Output**: `{ document, collection }` or `null`

**Current Coupling Level**: **LOOSE**

### **Problems with Current Architecture**

**1. Logic Duplication & Drift Risk**

```typescript
// ❌ Creation logic doesn't match parsing expectations
// Creation: Complex settings-based URI generation
// Parsing: Simple database lookup (assumes generation was correct)
```

**2. Settings Dependency Scattered**

```typescript
// ❌ Both systems independently fetch and interpret routing settings
// Creation: await payload.findGlobal({ slug: "settings" })
// Parsing: No settings integration (relies on pre-computed URIs)
```

**3. Debugging Complexity**

```typescript
// ❌ Two separate systems to debug when URIs don't work
// Hard to trace whether issue is in generation or resolution
```

### **Recommended Solution: Unified URI Engine**

**Tighter Coupling Architecture**:

```typescript
// src/lib/payload/uri-engine.ts
export const URIEngine = {
  // Creation (used by hooks)
  generate: (inputs: GenerateURIInputs) => Promise<string>

  // Parsing (used by routing)
  resolve: (uri: string) => Promise<DocumentMatch | null>

  // Validation (used by both)
  validate: (uri: string) => { isValid: boolean, errors: string[] }

  // Settings integration (used by both)
  getRoutingConfig: () => Promise<RoutingSettings>

  // Conflict detection (used by creation)
  checkConflicts: (uri: string, excludeId?: string) => Promise<Conflict[]>
}
```

**Benefits of Unified Engine**:

- ✅ **Single source of URI logic** prevents creation/parsing drift
- ✅ **Shared settings caching** between creation and resolution
- ✅ **Bidirectional validation** ensures generation matches parsing
- ✅ **Better debugging** - one system to trace and test
- ✅ **Performance optimization** - intelligent caching at engine level

### **Integration with Universal Cache System**

**URI Engine + Universal Cache Architecture**:

```typescript
// Layer 1: URI Engine (routing logic)
URIEngine.resolve("/blog/hello-world") → { collection: "posts", slug: "hello-world" }

// Layer 2: Universal Cache (performance)
cache.getBySlug("posts", "hello-world") → Document

// Layer 3: GraphQL/Direct API (application)
GraphQL Query or Direct Cache Access
```

**Cache Integration Points**:

```typescript
// URI Engine uses universal cache for settings
const settings = await cache.getGlobal("settings")

// URI resolution caches routing decisions
const resolveURI = unstable_cache(uri => URIEngine.resolve(uri), ["uri-resolve", uri], {
  tags: [`uri:${uri}`, "routing-settings"],
})

// URI generation uses conflict detection cache
const conflicts = await cache.checkURIConflicts(uri, excludeId)
```

### **URI Engine Implementation Tasks**

#### **Phase 1: Create Unified Engine (Week 1)**

**Task URI1: Extract Shared Logic**

- [ ] **Create**: `src/lib/payload/uri-engine.ts`
- [ ] Move URI generation logic from `create-uri.ts`
- [ ] Move URI parsing logic from `routing.ts`
- [ ] Create shared routing configuration cache
- [ ] Add bidirectional validation utilities

**Task URI2: Settings Integration**

- [ ] **Create**: `URIEngine.getRoutingConfig()` with caching
- [ ] Replace scattered settings queries with unified API
- [ ] Add settings change detection and URI regeneration
- [ ] Integrate with universal revalidation system

**Task URI3: Maintain Backward Compatibility**

- [ ] Keep existing `createURIHook()` and `getDocumentByURI()` APIs
- [ ] Use facade pattern to redirect to URI Engine
- [ ] Ensure no breaking changes to current functionality
- [ ] Add deprecation warnings for direct API usage

#### **Phase 2: Enhanced Features (Week 2)**

**Task URI4: Advanced Conflict Detection**

- [ ] **Create**: `URIEngine.checkConflicts()` with caching
- [ ] Add conflict resolution strategies (warnings, auto-numbering)
- [ ] Implement bulk conflict checking for collections
- [ ] Add conflict resolution UI components

**Task URI5: Performance Optimization**

- [ ] Add intelligent caching at URI Engine level
- [ ] Implement batch URI operations (generation, validation)
- [ ] Cache routing settings with smart invalidation
- [ ] Add URI resolution performance monitoring

**Task URI6: Better Error Handling**

- [ ] Create unified URI error types and handling
- [ ] Add detailed error messages for debugging
- [ ] Implement error recovery strategies
- [ ] Create URI debugging utilities

#### **Phase 3: Advanced URI Features (Week 3)**

**Task URI7: URI Migration System**

- [ ] **Create**: URI change detection and redirect creation
- [ ] Implement bulk URI regeneration utilities
- [ ] Add URI history tracking for redirects
- [ ] Create URI migration dashboard

**Task URI8: Analytics & Monitoring**

- [ ] Add URI usage tracking and analytics
- [ ] Create URI performance monitoring
- [ ] Implement URI health checks
- [ ] Add URI optimization suggestions

### **URI Engine Success Criteria**

**Must Have**:

- [ ] Single unified system handles both URI creation and parsing
- [ ] Backward compatibility maintained during migration
- [ ] Settings integration shared between creation and resolution
- [ ] Conflict detection improved with better error messages
- [ ] Performance matches or exceeds current system

**Should Have**:

- [ ] Bidirectional validation prevents creation/parsing drift
- [ ] Advanced conflict resolution with multiple strategies
- [ ] URI migration system for handling URL changes
- [ ] Enhanced debugging and error handling

**Nice to Have**:

- [ ] URI analytics and usage monitoring
- [ ] Bulk URI operations and management tools
- [ ] Predictive URI conflict detection
- [ ] Advanced URI optimization features

---

## 🔍 **Success Criteria**

### **Must Have**

- [ ] Single universal cache API replaces all current scattered functions
- [ ] GraphQL layer for complex queries built on top of cache
- [ ] Consistent cache keys across all collections and operations
- [ ] Correct sitemap tag mapping with no orphaned tags
- [ ] URI changes properly invalidate old and new paths
- [ ] All collections use universal revalidation hooks
- [ ] Universal routing system fully integrated with caching
- [ ] Sitemap URLs match universal routing URIs
- [ ] SEO fields properly filter sitemap content
- [ ] Collection-sitemap mapping is correct and automatic

### **Should Have**

- [ ] Cache hit rates >85% for static content
- [ ] Performance matches or exceeds current system
- [ ] Clear cache debugging and monitoring tools
- [ ] Graceful fallbacks for cache misses
- [ ] Comprehensive error handling and logging

### **Nice to Have**

- [ ] Automatic cache warming on content changes
- [ ] Cache analytics and performance dashboard
- [ ] Advanced related content invalidation
- [ ] Memory usage optimization and monitoring
- [ ] Predictive cache preloading

---

## 🧪 **Testing Strategy**

### **Unit Tests**

- [ ] Cache key generation functions
- [ ] Tag generation and validation
- [ ] Configuration validation and lookup
- [ ] Revalidation logic and change detection

### **Integration Tests**

- [ ] Universal cache API with all collections
- [ ] Revalidation hooks with real Payload operations
- [ ] URI generation + caching integration
- [ ] Sitemap generation with universal cache

### **Performance Tests**

- [ ] Cache hit rate measurement and optimization
- [ ] Response time comparison (before/after migration)
- [ ] Memory usage monitoring and alerts
- [ ] Bulk operation performance testing

### **End-to-End Tests**

- [ ] Full content lifecycle (create → edit → publish → cache)
- [ ] Slug/URI changes properly update cache
- [ ] Hierarchical page changes cascade correctly
- [ ] Live preview works with universal caching

### **Sitemap Tests**

#### **Unit Tests**

- [ ] Sitemap generation with URI fields
- [ ] SEO filtering logic (noIndex, canonical URLs)
- [ ] Collection-to-sitemap mapping
- [ ] Tag generation and invalidation

#### **Integration Tests**

- [ ] Universal cache API with sitemap generation
- [ ] Revalidation hooks with correct sitemap tags
- [ ] URI generation + sitemap integration
- [ ] Dynamic sitemap route factory

#### **SEO Compliance Tests**

- [ ] No `noIndex` documents appear in sitemaps
- [ ] Canonical URLs are properly used when provided
- [ ] External canonical URLs exclude documents from sitemaps
- [ ] All collections have consistent SEO field availability

#### **Sitemap Validation Tests**

- [ ] All sitemap URLs are accessible and return 200
- [ ] No duplicate URLs across sitemaps
- [ ] Canonical URLs in sitemaps match document canonical settings
- [ ] Meta robots directives are respected

---

## 📝 **File Structure**

**New Universal Cache + GraphQL Files:**

```
src/lib/payload/
├── cache.ts                 # Universal cache API
├── cache-config.ts          # Configuration-driven behavior
├── cache-tags.ts           # Tag generation and management
├── revalidation.ts         # Smart revalidation engine
├── cache-debug.ts          # Development debugging tools
├── graphql/                # GraphQL organization
│   ├── client.ts           # Client-side GraphQL setup
│   ├── resolvers.ts        # Cache-powered GraphQL resolvers
│   ├── queries/            # Complex, reusable queries
│   │   ├── homepage-data.ts
│   │   ├── page-data.ts
│   │   ├── blog-archive.ts
│   │   └── search-results.ts
│   ├── fragments/          # Reusable field fragments
│   │   ├── page-fields.ts
│   │   ├── post-fields.ts
│   │   ├── meta-fields.ts
│   │   └── media-fields.ts
│   ├── mutations/          # Form submissions, etc.
│   │   ├── contact-form.ts
│   │   └── newsletter.ts
│   └── types/             # Generated TypeScript types
│       └── generated.ts
├── sitemap-generator.ts    # Universal sitemap generator
├── sitemap-route-factory.ts # Sitemap route factory
└── sitemap-config.ts       # Sitemap configuration

src/payload/hooks/ (updated)
├── universal-hooks.ts      # Universal collection hooks (replaces revalidateCollection.ts)
├── form-submissions.ts     # Existing
├── formatSlug.ts           # Existing
├── populatePublishedAt.ts  # Existing
└── revalidateFooter.ts     # Existing
```

**Files to Migrate/Remove:**

```
src/lib/payload/
├── page.ts                 # ➜ Migrate to universal cache API
├── post.ts                 # ➜ Migrate to universal cache API
├── document.ts             # ➜ Migrate to universal cache API
├── globals.ts              # ➜ Migrate to universal cache API
├── recent-posts.ts         # ➜ Migrate to GraphQL query
├── templates.ts            # ➜ Migrate to universal cache API
├── redirects.ts            # ➜ Migrate to universal cache API
└── testimonials.ts         # ➜ Migrate to universal cache API

src/payload/hooks/
└── revalidateCollection.ts # ❌ Remove (replaced by universal)

src/payload/collections/*/hooks/
└── revalidate*.ts          # ❌ Remove (replaced by universal)
```

This comprehensive strategy transforms the current fragmented caching into a unified, maintainable, and performant system that supports the universal routing architecture.

---

## 🗺️ **Sitemap Architecture Revision**

### **Current Sitemap Issues**

**1. Hardcoded URL Construction**

- Posts hardcoded to `/blog/{slug}` instead of using URI field
- Services hardcoded to `/services/{slug}` but should use universal routing
- No support for hierarchical pages or custom archive configurations

**2. Manual Collection Queries**

- Each sitemap manually queries specific collections
- Duplicate logic between `pages-sitemap.xml` and `posts-sitemap.xml`
- No configuration-driven approach

**3. Missing URI Integration**

- Sitemaps don't use the URI field from universal routing
- No support for custom archive page slugs
- Manual path construction ignores routing configuration

**4. Cache Inefficiency**

- Each sitemap has its own cache function
- No shared caching between sitemaps
- Limited to 1000 items per collection (arbitrary limit)

### **Universal Sitemap Architecture**

#### **1. Configuration-Driven Sitemaps**

```typescript
// src/lib/payload/sitemap-config.ts
export const SITEMAP_CONFIG = {
  // Default sitemap configuration
  default: {
    priority: 0.5,
    changefreq: "monthly",
    includeHomepage: false,
    includeArchive: false,
    customEntries: [],
  },

  // Specific sitemap configurations
  pages: {
    collections: ["pages", "services"],
    route: "/pages-sitemap.xml",
    priority: 0.8,
    changefreq: "weekly",
    includeHomepage: true,
    customEntries: [{ path: "/search", priority: 0.5 }],
  },
  posts: {
    collections: ["posts"],
    route: "/posts-sitemap.xml",
    priority: 0.7,
    changefreq: "daily",
    includeArchive: true, // Include archive page
  },
}

// Helper function to get sitemap configuration with fallback
export function getSitemapConfig(sitemapName: string): SitemapConfig {
  return {
    ...SITEMAP_CONFIG.default,
    ...SITEMAP_CONFIG[sitemapName],
  }
}
```

#### **2. Universal Sitemap Generator**

```typescript
// src/lib/payload/sitemap.ts
export const sitemap = {
  // Generate sitemap using URI field
  generateByConfig: (config: SitemapConfig) => Promise<SitemapEntry[]>

  // Get collection entries with proper URIs
  getCollectionEntries: (collection: string) => Promise<SitemapEntry[]>

  // Generate archive entries
  getArchiveEntries: () => Promise<SitemapEntry[]>

  // Unified caching
  getCachedSitemap: (sitemapName: string) => Promise<SitemapEntry[]>
}
```

#### **3. URI-Based URL Generation**

Instead of hardcoded paths, use the URI field:

```typescript
// ❌ Current (hardcoded)
loc: `${SITE_URL}/blog/${post.slug}`

// ✅ Universal (URI-based)
loc: `${SITE_URL}${post.uri}`
```

#### **4. Smart Archive Detection**

```typescript
// Automatically detect and include archive pages
const archivePages = await getArchivePages(["posts", "services"])
// Results in entries like:
// - /blog (if posts have archive page with slug "blog")
// - /services (if services have archive page with slug "services")
```

### **Sitemap Implementation Tasks**

#### **Task S1: Universal Sitemap Configuration**

- [ ] **File**: `src/lib/payload/sitemap-config.ts`
- [ ] Define sitemap configurations for all collections
- [ ] Add support for custom entries and priorities
- [ ] Include archive page detection logic
- [ ] Add changefreq and priority settings

#### **Task S2: Universal Sitemap Generator**

- [ ] **File**: `src/lib/payload/sitemap.ts`
- [ ] Create unified sitemap generation using universal cache
- [ ] Implement URI-based URL construction
- [ ] Add automatic archive page detection
- [ ] Support hierarchical pages with proper URIs

#### **Task S3: Replace Hardcoded Sitemaps**

- [ ] **Migrate**: `src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.ts`
- [ ] **Migrate**: `src/app/(frontend)/(sitemaps)/posts-sitemap.xml/route.ts`
- [ ] Use universal sitemap generator
- [ ] Remove hardcoded collection queries
- [ ] Use URI field instead of slug-based paths

#### **Task S4: Dynamic Sitemap Routes**

- [ ] **Consider**: Configuration-driven sitemap routes
- [ ] Support for additional sitemaps (categories, locations, etc.)
- [ ] Automatic sitemap index generation
- [ ] Update `next-sitemap.config.cjs` to use universal system

#### **Task S5: Archive Page Integration**

- [ ] Detect archive pages from settings global
- [ ] Include archive URLs in appropriate sitemaps
- [ ] Handle archive page slug changes
- [ ] Support multiple archive configurations

#### **Task S6: Sitemap Cache Integration**

- [ ] Use universal cache tags: `sitemap:pages`, `sitemap:posts`
- [ ] Implement smart revalidation on content changes
- [ ] Add sitemap-specific cache warming
- [ ] Support batch sitemap regeneration

### **Enhanced Sitemap Features**

#### **1. Multi-Language Support (Future)**

```typescript
// Ready for i18n expansion
const sitemapEntry = {
  loc: `${SITE_URL}${document.uri}`,
  lastmod: document.updatedAt,
  alternates: document.translations?.map(t => ({
    href: `${SITE_URL}${t.uri}`,
    hreflang: t.locale,
  })),
}
```

#### **2. Rich Sitemap Metadata**

```typescript
interface SitemapEntry {
  loc: string
  lastmod: string
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: number
  images?: SitemapImage[]
  news?: SitemapNews[]
}
```

#### **3. Conditional Inclusion**

```typescript
// Only include published content with public URIs
const shouldInclude = (doc: Document) => {
  return (
    doc._status === "published" &&
    doc.uri &&
    !doc.meta?.noIndex &&
    doc.isPubliclyAccessible
  )
}
```

#### **4. Performance Optimization**

- [ ] Streaming sitemap generation for large sites
- [ ] Incremental sitemap updates (only changed content)
- [ ] Compressed sitemap support
- [ ] CDN-friendly cache headers

### **Sitemap Testing Strategy**

#### **Validation Tests**

- [ ] All URIs in sitemaps are valid and accessible
- [ ] No duplicate URLs across sitemaps
- [ ] Proper XML formatting and validation
- [ ] Correct lastmod dates and priorities

#### **Performance Tests**

- [ ] Sitemap generation time under various loads
- [ ] Cache hit rates for sitemap requests
- [ ] Memory usage during large sitemap generation
- [ ] Response time for sitemap index

#### **Integration Tests**

- [ ] Archive page changes update sitemaps correctly
- [ ] Content publish/unpublish updates sitemaps
- [ ] URI changes properly update sitemap URLs
- [ ] Settings changes trigger sitemap regeneration

---

## 🚀 **Implementation Plan**

### **SEO Compliance & Robots Directives**

#### **Current SEO Issues**

**1. Missing SEO Fields in Posts**

- Posts collection lacks `noIndex` and `canonicalUrl` fields
- Pages and Services have these fields, but Posts don't
- Inconsistent SEO capabilities across collections

**2. Sitemap Ignores SEO Directives**

- Current sitemaps don't check `meta.noIndex`
- Canonical URLs are ignored in sitemap generation
- No robots directive respect in URL construction

**3. Incomplete Meta Field Selection**

- Sitemap queries only select `slug` and `updatedAt`
- Missing `meta.noIndex`, `meta.canonicalUrl`, and `uri` fields
- Can't make SEO-informed decisions during generation

#### **SEO-Compliant Sitemap Architecture**

**1. Standardized SEO Fields Across Collections**

```typescript
// Add missing SEO fields to Posts collection
{
  name: "meta",
  label: "SEO",
  fields: [
    // ... existing SEO fields
    {
      name: "noIndex",
      label: "No Index Page",
      type: "checkbox",
      defaultValue: false,
    },
    {
      name: "canonicalUrl",
      label: "Canonical URL",
      type: "text",
    },
  ],
}
```

**2. SEO-Aware Document Filtering**

```typescript
// Universal sitemap inclusion logic
const shouldIncludeInSitemap = (doc: Document): boolean => {
  return (
    doc._status === "published" &&
    doc.uri && // Has valid URI
    !doc.meta?.noIndex && // Not marked noIndex
    !doc.meta?.canonicalUrl // No external canonical (optional)
  )
}
```

**3. Canonical URL Handling**

```typescript
// Use canonical URL if provided, otherwise use generated URI
const getSitemapURL = (doc: Document, siteUrl: string): string => {
  if (doc.meta?.canonicalUrl) {
    // If canonical is external, exclude from sitemap
    if (doc.meta.canonicalUrl.startsWith("http")) {
      return null // Don't include external canonicals
    }
    // Use relative canonical URL
    return `${siteUrl}${doc.meta.canonicalUrl}`
  }

  // Use generated URI
  return `${siteUrl}${doc.uri}`
}
```

**4. Enhanced Meta Field Selection**

```typescript
// Complete field selection for SEO-aware sitemaps
const sitemapFieldSelection = {
  slug: true,
  uri: true,
  updatedAt: true,
  _status: true,
  meta: {
    noIndex: true,
    canonicalUrl: true,
  },
}
```

### **SEO Implementation Tasks**

#### **Task SEO1: Standardize SEO Fields**

- [ ] **Add to Posts**: Include `noIndex` and `canonicalUrl` fields in posts collection
- [ ] **Verify Pages**: Ensure pages have complete SEO field set
- [ ] **Verify Services**: Ensure services have complete SEO field set
- [ ] **Update Types**: Regenerate Payload types for new fields

#### **Task SEO2: SEO-Aware Sitemap Generation**

- [ ] **Update Field Selection**: Include `meta.noIndex`, `meta.canonicalUrl`, and `uri` in queries
- [ ] **Implement Filtering**: Exclude `noIndex` documents from sitemaps
- [ ] **Canonical URL Logic**: Use canonical URLs when provided, handle external canonicals
- [ ] **URI-Based URLs**: Use `uri` field instead of hardcoded slug construction

#### **Task SEO3: Universal SEO Configuration**

- [ ] **SEO Config Integration**: Add SEO settings to cache configuration
- [ ] **Sitemap SEO Config**: Include SEO behavior in sitemap configuration
- [ ] **Default SEO Behavior**: Define default SEO handling for new collections

#### **Task SEO4: Enhanced Sitemap Metadata**

- [ ] **Rich Sitemap Support**: Add support for image, news, and video sitemaps
- [ ] **Priority Calculation**: Use content type and update frequency for priorities
- [ ] **Changefreq Logic**: Calculate changefreq based on actual content update patterns
- [ ] **Lastmod Accuracy**: Use most recent content change, not just document update

### **Enhanced SEO Configuration**

#### **1. SEO-Aware Cache Config**

```typescript
export const CACHE_CONFIG = {
  default: {
    // ... existing defaults
    respectSEO: true, // Honor noIndex and canonical directives
    sitemapInclude: false, // Safe default - don't include in sitemaps
  },

  pages: {
    // ... existing config
    respectSEO: true,
    sitemapInclude: true,
    seoFields: ["meta.noIndex", "meta.canonicalUrl"],
  },

  posts: {
    // ... existing config
    respectSEO: true,
    sitemapInclude: true,
    seoFields: ["meta.noIndex", "meta.canonicalUrl"], // ✅ Now available
  },
}
```

#### **2. SEO-Aware Sitemap Config**

```typescript
export const SITEMAP_CONFIG = {
  default: {
    // ... existing defaults
    respectNoIndex: true,
    useCanonicalUrls: true,
    excludeExternalCanonicals: true,
  },

  pages: {
    // ... existing config
    respectNoIndex: true,
    useCanonicalUrls: true,
    customCanonicalLogic: doc => {
      // Custom logic for pages if needed
      return doc.meta?.canonicalUrl || doc.uri
    },
  },
}
```

#### **3. SEO Validation & Testing**

```typescript
// SEO compliance testing
const validateSEOCompliance = async (collection: string) => {
  const docs = await getCollection(collection)

  const issues = docs.filter(doc => {
    return (
      doc._status === "published" && doc.meta?.noIndex && doc.appearsInSitemap // Should not appear if noIndex
    )
  })

  return issues
}
```

### **SEO Testing Strategy**

#### **Compliance Tests**

- [ ] No `noIndex` documents appear in sitemaps
- [ ] Canonical URLs are properly used when provided
- [ ] External canonical URLs exclude documents from sitemaps
- [ ] All collections have consistent SEO field availability

#### **Sitemap Validation**

- [ ] All sitemap URLs are accessible and return 200
- [ ] No duplicate URLs across sitemaps
- [ ] Canonical URLs in sitemaps match document canonical settings
- [ ] Meta robots directives are respected

#### **SEO Integration Tests**

- [ ] Publishing document with `noIndex` removes from sitemap
- [ ] Changing canonical URL updates sitemap entry
- [ ] URI changes properly update sitemap URLs
- [ ] SEO field changes trigger appropriate cache invalidation

- A URI creation system for this site that is inspired by Wordpress.
- It should operate as a "first match wins" hierarchy across the app in this order:

🏠 1. HOMEPAGE
├─ URI: "" (empty)
└─ Source: Settings → homepage field

📄 2. PAGES (Any Depth)
├─ URI: /about -----> simple page
├─ URI: /services/web-design -----> page with parent page
├─ URI: /company/team/leadership -----> page with multiple parent pages

📂 3. DESIGNATED COLLECTION ARCHIVES (Single Segment)
├─ URI: /blog (posts collection, effectiveSlug = "blog")
├─ URI: /services (services collection, effectiveSlug = "services")
├─ URI: /articles (posts collection, effectiveSlug = "articles")

📑 4. COLLECTION SINGLES (Two Segments)
├─ URI: /posts/my-first-post -----> Matches a post where the post collection has no blog archive set
├─ URI: /blog/my-first-post -----> Matches a post where the post collection has a designated page and its slug is "blog"
├─ URI: /insights/my-first-post -----> Matches a post where the post collection has a designated page and its slug is "insights"
├─ URI: /services/web-development

## URI Segment Construction Logic

### How settings work.

- The app is made up of collections
- Any collection that should be exposed to the front end via a URL needs to have a slug field in order to be matched
- Pages are the top level, fundamental collection and are the only collection type that can have a single segment as the slug. All others must have at least one parent segment.
- All other frontend collections (those with a slug), will calculate their URIs using the logic below.
- The site has a payload global called settings. In settings, there is a tab called routing. Routing is dedicated to slug matching and template assignment.
- At the top there is a Homepage select field and a Posts Page (like wordpress) select field.
- The

### For Collection Items (Non-Pages)

```
┌─ Collection Item URI Construction ─┐
│                                    │
├─ Does collection have archive page? ─┐
│  ├─ YES → Use archive page slug      │
│  └─ NO → Use original collection slug│
│         └─ Final: /[determined-slug]/[item-slug]
└────────────────────────────────────┘
```

### For Pages

```
┌─ Page URI Construction ─┐
│                         │
├─ Does page have parent? ─┐
│  ├─ YES ─┐               │
│  │       ├─ Does parent have parent? ─┐
│  │       │  ├─ YES → /grandparent/parent/page
│  │       │  └─ NO → /parent/page
│  │       └─ (recursive for any depth)
│  └─ NO → /page
└─────────────────────────┘
```

### Complete URI Decision Matrix

```
REQUEST URI: /segment1/segment2/segment3/...

🔍 SEGMENT ANALYSIS:
├─ segment1 = "" (empty) → HOMEPAGE
├─ segment1 only → PAGE
│  ├─ Match page slug? → PAGE
│  └─ Match collection archive? → COLLECTION ARCHIVE
└─ segment1 + segment2+ → NESTED PAGE or COLLECTION ITEM
   ├─ Does segment1/segment2/... build valid page path? → NESTED PAGE
   └─ Does segment1 = collection + segment2 = item? → COLLECTION ITEM

🏗️ CONSTRUCTION RULES:
├─ PAGES: Inherit full parent chain
│  └─ /parent/subparent/page
├─ COLLECTION ARCHIVES: Use designated page slug or collection default
│  └─ /[archive-page-slug OR collection-slug]
└─ COLLECTION ITEMS: Collection prefix + item slug
   └─ /[archive-page-slug OR collection-slug]/[item-slug]
```

### URI Segment Priority Chain

**For determining segment1:**

1. Archive page slug (if collection has designated archive page)
2. Original collection slug (fallback)
3. Page slug (for pages)
4. Parent page slug (for nested pages)

**For determining segment2+:**

1. Item slug (for collection items)
2. Child page slug (for nested pages)
3. Grandchild page slug (for deeply nested pages)
4. ...continues recursively

## URI Construction Via Hooks

- Eligible collections must have a hook that creates or updates the URI field.
- Needs to be pre-computed at build time, not run time.
- URI will live on the document itself as a hidden field.
- logic for determining a URI will live in a server action

## Rules

- URIs can potentially be duplicated in different parts of a site. For instance a collection could be called team-members and have a member called nancy ----> team-members/nancy. But a page could also be created with a slug of nancy and a parent page of team-members.
- For this reason we use a first-match-wins model. Priority order is determined by the order that collections are added to the payload config.
- A warning should appear when duplicates are created
- Optional redirects should be created when a slug/uri changes

## How breadcrumbs relate

- Breadcrumbs in the app will use the URI field to navigate up the tree
- It is technically possible for a collection to have no archive. This should be detected and the archive slug should be removed from the breadcrumbs to avoid a broken link

# Universal Routing Implementation Tasks

## Phase 1: Enhanced Slug Field with URI Generation

### Task 1.1: Enhance Slug Field Structure

- [x] Add hidden `uri` field to the `slugField()` return array in `src/payload/fields/slug/index.ts`
- [x] Create `src/payload/fields/slug/create-uri.ts` with universal URI generation logic
- [x] Update `slugField()` to return `[slugField, uriField, checkBoxField]`
- [x] Leverage existing `nestedDocsPlugin` breadcrumbs for parent hierarchy
- [x] Update TypeScript types for enhanced slug field structure

### Task 1.2: URI Generation Logic in Slug Field

- [x] Implement collection detection within URI hook (using collection context)
- [x] Add Pages-specific URI logic (use nestedDocsPlugin's `generateURL` for parent hierarchy)
- [x] Add Collection items logic (archive page/custom slug/default slug + item slug)
- [x] Create `getCollectionSettings()` function to read routing settings from global
- [x] Add URI validation and conflict detection utilities

### Task 1.3: URI Hook Integration

- [x] Add URI generation hook to slug field's existing hooks array
- [x] Ensure URI updates whenever slug or parent changes
- [x] Handle URI generation on both create and update operations
- [x] Add URI recalculation when routing settings change

### Task 1.4: Automatic Collection Integration

- [x] Verify all existing collections using `slugField()` automatically get URI functionality
- [x] Test URI generation across Pages (hierarchical), Posts, Services, Team, Testimonials
- [x] Confirm nestedDocsPlugin breadcrumbs work with new URI system
- [x] Update payload-types.ts to reflect URI field in all slug-enabled collections

## Phase 2: Universal Document Resolution

### Task 2.1: Build Document Resolution System

- [x] Create `src/lib/payload/universal-resolver.ts`
- [x] Implement `getDocumentByURI()` function with first-match-wins logic
- [x] Implement homepage resolution from settings
- [x] Implement single-segment page resolution (using existing slug field)
- [x] Implement single-segment collection archive resolution
- [x] Implement multi-segment nested page resolution (leverage nestedDocsPlugin)
- [x] Implement two-segment collection item resolution (using enhanced slug field URIs)

## Phase 3: Dynamic Routing Updates

### Task 3.1: Update Main Dynamic Route

- [ ] Modify `src/app/(frontend)/[slug]/page.tsx` to handle single segments
- [ ] Create `src/app/(frontend)/[...slug]/page.tsx` for multi-segment URIs (catch-all)
- [ ] Implement universal document resolution in route handlers
- [ ] Add proper TypeScript typing for resolved documents
- [ ] Update generateStaticParams for all URI patterns

### Task 3.2: Collection Archive Handling

- [ ] Create collection archive page component
- [ ] Update blog page to use universal resolution
- [ ] Create generic archive template system
- [ ] Implement pagination for archives
- [ ] Add SEO metadata generation for archives

### Task 3.3: Error Handling & Redirects

- [ ] Update `PayloadRedirects` component for URI-based redirects
- [ ] Add 404 handling for unresolved URIs
- [ ] Implement redirect creation on URI changes
- [ ] Add conflict resolution warnings in admin

## Phase 4: Enhanced Features

### Task 4.1: Smart Breadcrumbs

- [ ] Update `PostBreadcrumbs` component to use enhanced slug field URIs
- [ ] Leverage existing `nestedDocsPlugin` breadcrumbs for hierarchical pages
- [ ] Create universal `Breadcrumbs` component for all collections using plugin data
- [ ] Handle collection archives in breadcrumb chains
- [ ] Add breadcrumb schema.org markup

### Task 4.2: Link Generation Updates

- [ ] Update `CMSLink` component to use enhanced slug field URIs
- [ ] Modify rich text internal linking to use URIs from slug field
- [ ] Update navigation components for URI-based links
- [ ] Leverage existing `nestedDocsPlugin.generateURL` where possible
- [ ] Create `generateDocumentURL()` utility function as wrapper

### Task 4.3: Preview & Live Preview

- [ ] Update preview path generation to use enhanced slug field URIs
- [ ] Modify live preview listener for URI changes from slug field
- [ ] Test preview functionality across all collections
- [ ] Update admin bar links to use URIs from slug field

## Phase 5: Performance & Polish

### Task 5.1: Caching Strategy

- [x] Implement URI-based caching for document resolution
- [ ] Add cache invalidation on URI changes
- [x] Create cached routing settings retrieval
- [ ] Optimize database queries for URI lookups

### Task 5.2: Validation & Admin UX

- [ ] Add URI conflict detection in admin
- [ ] Create URI preview in collection admin
- [ ] Implement URI validation on save
- [ ] Add bulk URI regeneration utility
- [ ] Create migration script for existing content

### Task 5.3: Testing & Documentation

- [ ] Write unit tests for URI generation logic
- [ ] Write integration tests for document resolution
- [ ] Test all routing scenarios from the plan
- [ ] Create documentation for URI system
- [ ] Test SEO implications and sitemap generation

## Phase 6: Migration & Deployment

### Task 6.1: Data Migration

- [ ] Create migration script to populate URI fields in enhanced slug field for existing documents
- [ ] Update existing redirects to use URI-based paths
- [ ] Verify all existing URLs still work with enhanced slug field
- [ ] Create backup of current routing system

### Task 6.2: Deployment Verification

- [ ] Test static generation with new URI system
- [ ] Verify all collection types render correctly
- [ ] Test nested page hierarchies
- [ ] Confirm breadcrumbs work across all templates
- [ ] Validate SEO metadata generation

## Success Criteria

### Must Have

- [ ] All URI patterns from the plan work correctly
- [ ] First-match-wins priority system functions
- [ ] Homepage, pages, archives, and singles all resolve
- [ ] Nested pages work to any depth
- [ ] Collection archives respect settings configuration
- [ ] Breadcrumbs generate correctly from URI hierarchy

### Should Have

- [ ] URI conflicts are detected and warned
- [ ] Performance matches or exceeds current system
- [ ] Admin UX is intuitive for managing URIs
- [ ] SEO metadata generates correctly for all patterns

### Nice to Have

- [ ] Automatic redirects on URI changes
- [ ] Bulk URI management tools
- [ ] Advanced URI customization options
- [ ] URI analytics and reporting

## Dependencies & Notes

- Requires careful coordination with existing slug fields
- Must maintain backwards compatibility during migration
- Consider impact on existing SEO and indexed URLs
- Test thoroughly with draft/published content states
- Ensure live preview works throughout implementation
