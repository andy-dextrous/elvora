# Smart Routing Engine - URI Index Collection Architecture

![Smart Routing Engine Architecture](./routing.svg)

## 🎯 **System Overview**

The Smart Routing Engine is a high-performance routing system that provides **O(1) URI resolution** through a centralized URI Index Collection. This system replaces traditional collection-loop routing with a scalable architecture that delivers enterprise-grade performance for Next.js applications powered by Payload CMS.

## 🚀 **Core Innovation: URI Index Collection**

### **Before: Collection Loop Bottleneck**

```typescript
// OLD: N+1 query problem
for (const collection of frontendCollections) {
  const result = await payload.find({ collection, where: { uri } })
  // Multiple database queries per request
}
```

### **After: O(1) URI Resolution**

```typescript
// NEW: Single query lookup
const result = await payload.find({
  collection: "uri-index",
  where: { uri: { equals } },
  populate: { document: true },
})
// One query, instant resolution
```

## 📊 **System Architecture**

### **1. 🎯 URI Index Collection** `src/payload/collections/uri-index.ts`

The central database table that provides O(1) URI resolution for the entire application.

#### **Index Structure**

- **URI Field**: Primary indexed field for instant lookups (`/about`, `/blog/my-post`)
- **Document Relationship**: Direct connection to source documents via polymorphic relationship
- **Collection Metadata**: Source collection tracking (`pages`, `posts`, `services`, etc.)
- **Status Management**: Published/draft state handling
- **Previous URIs**: Automatic redirect history tracking (last 10 URIs)
- **Performance Indexes**: Optimized for fast URI and document ID lookups

#### **Key Features**:

- **Instant URI Resolution**: Single database query for any URI
- **Conflict Prevention**: Unique URI constraint with first-match-wins priority
- **Automatic Maintenance**: Real-time updates via Payload hooks
- **Redirect History**: SEO-safe redirect chains
- **Draft Support**: Separate indexing for preview mode

---

### **2. 🔄 URI Engine** `src/lib/routing/uri-engine.ts`

Core routing logic that generates URIs based on collection type and hierarchy.

#### **URI Generation Logic**

- **Homepage Handling**: Special case for home page (`"home"` slug → `"/"` URI)
- **Hierarchical Pages**: Parent/child relationships (`/company/about` → `/company/team`)
- **Archive-based Collections**: Uses designated archive pages (`/blog/my-post`)
- **Collection Fallbacks**: Default patterns (`/services/web-design`)

#### **Key Operations**:

- **URI Generation**: `routingEngine.generate()` - Creates URIs with hierarchy support
- **Conflict Detection**: Index-based conflict resolution with priority handling
- **Settings Integration**: Archive page configuration from global settings
- **Validation**: URI format validation and normalization

---

### **3. 🗄️ Universal Cache System** `src/lib/cache/`

High-performance caching system optimized for URI Index Collection architecture.

#### **Primary Cache Methods**

```typescript
// URI-based resolution (primary routing method)
const document = await cache.getByURI("/about/team")

// Collection and slug-based access
const page = await cache.getBySlug("pages", "about")

// Collection queries with filtering
const posts = await cache.getCollection("posts", { limit: 10 })

// Global singleton access
const settings = await cache.getGlobal("settings")
```

#### **Cache Architecture**:

- **Configuration-Driven**: Dependencies defined in `cache-config.ts`
- **Smart Invalidation**: Automatic cascade invalidation based on dependencies
- **URI-Optimized**: Direct integration with URI index for fastest resolution
- **Debug Support**: Comprehensive logging for cache hits/misses

---

### **4. 🗂️ Index Manager** `src/lib/routing/index-manager.ts`

Real-time maintenance functions for the URI index collection.

#### **Core Functions**

- **`updateURIIndex()`**: Updates or creates index entries from document hooks
- **`deleteFromURIIndex()`**: Cleanup when documents are deleted
- **`checkURIConflict()`**: O(1) conflict detection using the index
- **`populateURIIndex()`**: Bulk population for migrations and setup

#### **Integration Points**:

- **Payload Hooks**: Automatic updates on document save/delete
- **Conflict Resolution**: Priority-based resolution using collection order
- **Error Handling**: Graceful failure without breaking content saves
- **Batch Operations**: Efficient bulk updates for large datasets

---

### **5. 🔗 Smart Revalidation** `src/payload/hooks/revalidation.ts`

Universal hooks system that maintains URI index and handles cache invalidation.

#### **Hook Functions**

- **`beforeCollectionChange`**: URI generation on publish/slug changes
- **`afterCollectionChange`**: Index updates and cache invalidation
- **`afterCollectionDelete`**: Index cleanup and dependency revalidation

#### **Integration Features**:

- **URI Index Maintenance**: Real-time updates to the index
- **Status Tracking**: Handles published/draft transitions
- **Previous URI Tracking**: Maintains redirect history
- **Cache Coordination**: Smart invalidation of dependent caches

---

### **6. 🗺️ Optimized Sitemap System** `src/lib/sitemaps/`

Sitemap generation optimized for URI Index Collection architecture.

#### **Index-Based Generation**

```typescript
// Single query to get all published URIs
const uriDocs = await payload.find({
  collection: "uri-index",
  where: { status: { equals: "published" } },
  limit: 10000,
})
```

#### **Performance Benefits**:

- **Single Database Query**: All URIs retrieved in one operation
- **Cache Integration**: Uses universal cache for document details
- **SEO Optimization**: Automatic filtering and validation
- **Fallback Support**: Graceful degradation to collection-based method

---

## 🚀 **Quick Start Guide**

### **1. Using the Routing Engine**

```typescript
import { routingEngine } from "@/lib/routing"

// Generate URI for a document
const uri = await routingEngine.generate({
  collection: "pages",
  slug: "about-us",
  data: { parent: parentPageId }, // Optional for hierarchical
})

// Get all URIs for static generation
const allURIs = await routingEngine.getAllURIs()

// Check for conflicts
const conflict = await routingEngine.checkConflicts("/about-us")
```

### **2. Using the Universal Cache**

```typescript
import { cache } from "@/lib/cache"

// Primary routing method - resolve URI to document
const document = await cache.getByURI("/about/team")

// Collection access
const page = await cache.getBySlug("pages", "about")
const posts = await cache.getCollection("posts", { limit: 10 })

// Global access
const settings = await cache.getGlobal("settings")
```

### **3. URI Index Management**

```typescript
import { updateURIIndex, populateURIIndex } from "@/lib/routing"

// Update single entry (used by hooks)
await updateURIIndex({
  uri: "/about/team",
  collection: "pages",
  documentId: "doc123",
  status: "published",
  previousURI: "/about/staff", // Optional
})

// Bulk populate (for migrations)
const stats = await populateURIIndex()
```

## 🏗️ **Implementation Status**

### **✅ Implemented & Working**

- URI Index Collection with full schema
- URI Engine with hierarchical support
- Universal Cache System with dependency management
- Index Manager with real-time updates
- Universal Payload hooks for automatic maintenance
- Sitemap integration with index-based generation
- API endpoints for index management

### **📝 Configuration Required**

- Archive page settings in global settings
- Collection order for conflict priority
- Cache TTL and dependency configuration

### **🔧 Manual Tasks**

- Run `GET /api/populate-uri-index` to populate existing content
- Configure archive pages in admin settings
- Set up collection hierarchy in frontend collections config

## 🔍 **Debugging & Monitoring**

### **API Endpoints**

- `GET /api/populate-uri-index` - Bulk populate the URI index
- `DELETE /api/clear-uri-index` - Clear all index entries (dev only)

### **Cache Debug**

```typescript
import { enableCacheDebug } from "@/lib/cache"

// Enable detailed cache logging
await enableCacheDebug()
```

### **URI Index Inspection**

Access the URI Index collection in Payload admin to:

- Monitor URI assignments
- Check conflict resolution
- Review redirect history
- Debug index population

## 📁 **File Structure**

```
src/lib/
├── README.md              # This documentation
├── routing/               # Smart routing engine
│   ├── index.ts          # Clean exports
│   ├── uri-engine.ts     # Core URI generation
│   ├── index-manager.ts  # URI index maintenance
│   └── README.md         # Routing-specific docs
├── cache/                # Universal cache system
│   ├── index.ts          # Clean exports
│   ├── cache.ts          # Universal cache API
│   ├── cache-config.ts   # Configuration & dependencies
│   ├── revalidation.ts   # Smart revalidation
│   └── README.md         # Cache-specific docs
├── sitemaps/             # Sitemap generation
│   ├── index.ts          # Clean exports
│   ├── generator.ts      # URI index optimized generation
│   └── README.md         # Sitemap-specific docs
└── data/                 # Data layer abstractions
    ├── posts.ts          # Post-specific queries
    ├── globals.ts        # Global data access
    └── templates.ts      # Template utilities
```

This system provides a solid foundation for high-performance, scalable routing that grows with your application while maintaining WordPress-like ease of use.
