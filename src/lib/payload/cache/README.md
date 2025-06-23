# Smart Routing Engine - Cache System

> **A declarative, configuration-driven caching and revalidation system for Payload CMS with Next.js**

## 🎯 **Overview**

This cache system provides a unified, intelligent approach to caching and revalidation that "just works" like WordPress but with modern performance and type safety. The system is entirely **configuration-driven**, meaning you define dependencies once and the system automatically handles all cache invalidation relationships.

## 📁 **File Structure**

```
src/lib/payload/cache/
├── README.md           # This documentation
├── index.ts           # Clean exports for all cache functionality
├── cache.ts           # Universal cache API
├── cache-config.ts    # Configuration and dependency management
└── revalidation.ts    # Smart revalidation with cascade invalidation
```

## 🏗️ **System Architecture**

### **1. Universal Cache API (`cache.ts`)**

Single interface for all caching operations:

```typescript
// Clean import from cache folder (recommended)
import { cache } from "@/lib/payload/cache"

// Or specific file import
import { cache } from "@/lib/payload/cache/cache"

// Get document by URI (primary method)
const doc = await cache.getByURI("/about")

// Get document by collection and slug
const page = await cache.getBySlug("pages", "about")

// Get collection with query options
const posts = await cache.getCollection("posts", { limit: 10 })

// Get global
const settings = await cache.getGlobal("settings")
```

### **2. Cache Configuration (`cache-config.ts`)**

Declarative dependency management:

```typescript
export const CACHE_CONFIG = {
  pages: {
    ttl: 3600,
    dependencies: ["global:settings"], // Pages depend on settings
  },
  posts: {
    ttl: 1800,
    dependencies: ["global:settings", "collection:categories"],
  },
}
```

### **3. Smart Revalidation (`revalidation.ts`)**

Configuration-driven cascade invalidation:

```typescript
// When global:settings changes → automatically invalidates pages, posts, services
// When collection:categories changes → automatically invalidates posts
// All based on CACHE_CONFIG dependencies!
```

## 🔧 **Configuration-Driven Dependencies**

### **The Problem This Solves**

Traditional cache systems require manual, hardcoded invalidation:

```typescript
// ❌ Old way: Hardcoded and error-prone
if (collection === "settings") {
  revalidateTag("pages")
  revalidateTag("posts")
  revalidateTag("services")
  // Forgot to add new collection? Cache bugs!
}
```

### **Our Solution: Reverse Dependency Lookup**

```typescript
// ✅ New way: Configuration-driven
pages: {
  dependencies: ["global:settings"]
}
posts: {
  dependencies: ["global:settings", "collection:categories"]
}

// System automatically finds what depends on settings:
getInvalidationTargets("global:settings")
// Returns: ["collection:pages", "collection:posts", "collection:services"]
```

### **Key Functions**

**`getInvalidationTargets(changedItem: string): string[]`**
Finds all collections/globals that depend on a specific item:

```typescript
getInvalidationTargets("global:settings")
// Returns: ["collection:pages", "collection:posts", "collection:services"]

getInvalidationTargets("collection:categories")
// Returns: ["collection:posts"]
```

**`getDependencyGraph(): Record<string, string[]>`**
Returns complete dependency visualization for debugging:

```typescript
getDependencyGraph()
// Returns: {
//   "global:settings": ["pages", "posts", "services"],
//   "collection:categories": ["posts"]
// }
```

## 📝 **How to Add New Collections/Globals**

### **1. Add to Cache Config**

```typescript
// In cache-config.ts
export const CACHE_CONFIG = {
  // ... existing config

  "new-collection": {
    ttl: 3600, // Cache duration
    dependencies: ["global:settings"], // What this collection depends on
  },

  "global:new-global": {
    ttl: 7200,
    dependencies: [], // Globals typically don't depend on other items
  },
}
```

### **2. Use Universal Hooks**

```typescript
// In your collection/global config
import { createHooks, createGlobalHooks } from "@/payload/hooks/hooks"

// For collections
const { afterChange, afterDelete } = createHooks("new-collection")

// For globals
const { afterChange } = createGlobalHooks("new-global")

export const NewCollection: CollectionConfig = {
  // ... your fields
  hooks: {
    afterChange,
    afterDelete,
  },
}
```

### **3. That's It!**

The system automatically:

- ✅ Generates proper cache keys
- ✅ Creates cache tags with dependencies
- ✅ Handles cascade invalidation when dependencies change
- ✅ Logs what gets invalidated and why

## 🔄 **Smart Revalidation Examples**

### **Settings Change Scenario**

```
User updates routing settings in admin
↓
universal hooks call revalidate("global:settings")
↓
getInvalidationTargets("global:settings") finds: ["collection:pages", "collection:posts", "collection:services"]
↓
System invalidates all dependent collections
↓
Debug log: "🔄 Configuration-driven invalidation: global:settings → [collection:pages, collection:posts, collection:services]"
```

### **Category Change Scenario**

```
User updates a category
↓
universal hooks call revalidate("collection:categories")
↓
getInvalidationTargets("collection:categories") finds: ["collection:posts"]
↓
System invalidates only posts (posts depend on categories)
↓
Debug log: "🔄 Configuration-driven invalidation: collection:categories → [collection:posts]"
```

## 🎯 **Benefits**

### **1. Declarative**

Define dependencies once in cache config → everything else is automatic

### **2. Dynamic**

Add new collection with dependencies → cascade invalidation works immediately

### **3. Systematic**

Same pattern works for all collections and globals consistently

### **4. Maintainable**

Single source of truth in `CACHE_CONFIG` - no scattered invalidation logic

### **5. Debuggable**

Clear logging shows exactly what gets invalidated and why

### **6. Type Safe**

Full TypeScript support with auto-completion and error checking

## 🚀 **Integration with Smart Routing Engine**

This cache system is the foundation of the Smart Routing Engine:

- **Universal Cache** → handles all data fetching
- **Routing Engine** → generates URIs and resolves documents
- **Smart Revalidation** → keeps everything in sync

Together they provide a WordPress-like "just works" experience with modern performance.

## 🔍 **Debugging**

### **Enable Cache Debugging**

```typescript
import { enableCacheDebug } from "@/lib/payload/cache/cache"
await enableCacheDebug()
```

### **View Dependency Graph**

```typescript
import { getDependencyGraph } from "@/lib/payload/cache/cache-config"
console.log(getDependencyGraph())
```

### **Test Invalidation Targets**

```typescript
import { getInvalidationTargets } from "@/lib/payload/cache/cache-config"
console.log(getInvalidationTargets("global:settings"))
```

## 🎉 **Philosophy**

> **"Configuration over Convention over Code"**

Instead of writing custom invalidation logic for each collection, we define the relationships once and let the system handle the complexity. This approach is:

- More reliable (no forgotten invalidations)
- More maintainable (single source of truth)
- More scalable (works automatically for new collections)
- More debuggable (clear cause and effect)

The result is a caching system that feels magical but is completely predictable and transparent.
