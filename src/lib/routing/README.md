# URI Engine & Index Manager Documentation

The Smart Routing Engine provides intelligent, hierarchical URI generation and O(1) URI resolution through a centralized URI Index Collection.

## 🎯 **Key Features**

- **O(1) URI Resolution**: Single database query via URI Index Collection
- **Hierarchical URI Generation**: Supports parent/child page relationships
- **Archive Page Integration**: Uses designated archive pages for collection items
- **Conflict Detection**: Prevents URI collisions with priority-based resolution
- **Settings-Driven**: Configuration through global settings
- **Real-time Index Maintenance**: Automatic updates via Payload hooks
- **Bulk Operations**: Efficient population and management tools

## 📚 **Quick Start**

### Basic Usage

```typescript
import { routingEngine } from "@/lib/routing"

// Generate URI programmatically
const uri = await routingEngine.generate({
  collection: "pages",
  slug: "about-us",
  data: { parent: parentPageId },
})

// Get all URIs for static generation
const allURIs = await routingEngine.getAllURIs()

// Check for conflicts
const conflict = await routingEngine.checkConflicts("/about-us")
```

### URI Index Management

```typescript
import { updateURIIndex, populateURIIndex } from "@/lib/routing"

// Update single entry (used by hooks)
await updateURIIndex({
  uri: "/about/team",
  collection: "pages",
  documentId: "doc123",
  status: "published",
  previousURI: "/about/staff", // Optional for redirects
})

// Bulk populate for migrations
const stats = await populateURIIndex()
console.log(`Populated ${stats.populated} URIs`)
```

### URI Generation Rules

```typescript
// Homepage (pages collection, slug "home")
"home" → "/"

// Top-level pages
"about-us" → "/about-us"

// Hierarchical pages
"about-us" + parent="/company" → "/company/about-us"

// Collection items with archive page
"my-post" + postsArchivePage="/blog" → "/blog/my-post"

// Collection items without archive page
"web-design" (services) → "/services/web-design"
```

## 🏗️ **Architecture**

### Core Components

```
src/lib/routing/
├── index.ts              # Clean exports and types
├── uri-engine.ts         # URI generation logic
├── index-manager.ts      # URI index maintenance
└── README.md            # This documentation
```

### Integration Points

- **URI Index Collection**: `src/payload/collections/uri-index.ts`
- **Universal Cache**: O(1) URI resolution through `cache.getByURI()`
- **Global Settings**: Archive page configuration
- **Payload Hooks**: Automatic URI generation and index updates
- **Static Generation**: Build-time URI collection for Next.js

## ⚙️ **URI Generation Logic**

### 1. Homepage Handling

```typescript
// Special case: home page gets root URI
if (collection === "pages" && slug === "home") {
  return "/" // Results in site.com/
}
```

### 2. Hierarchical Pages

```typescript
// Pages can have parent relationships
const parent = data?.parent || originalDoc?.parent
if (parent) {
  const parentDoc = await payload.findByID({ collection: "pages", id: parent })
  return `${parentDoc.uri}/${slug}`
}
```

### 3. Collection Items with Archive Pages

```typescript
// Use designated archive page from settings
const archivePageField = `${collection}ArchivePage` // e.g., "postsArchivePage"
if (settings[archivePageField]) {
  const archivePage = await payload.findByID({
    collection: "pages",
    id: settings[archivePageField],
  })
  return `/${archivePage.slug}/${slug}`
}
```

### 4. Fallback Collection URIs

```typescript
// Default: use collection name as prefix
return `/${collection}/${slug}`
```

## 🗂️ **URI Index Collection**

The URI Index Collection is the central database table that enables O(1) URI resolution.

### Schema Structure

```typescript
interface URIIndex {
  uri: string // The actual URI path (e.g., "/about/team")
  sourceCollection: string // Source collection slug (e.g., "pages")
  documentId: string // ID of the source document
  document: Relationship // Polymorphic relationship to source
  status: "published" | "draft" // Publication status
  previousURIs: Array<{
    // Automatic redirect history
    uri: string
  }>
}
```

### Index Performance

- **URI Field**: Primary index for instant lookups
- **Collection + Document ID**: Composite index for document updates
- **Status**: Filtered index for published/draft queries
- **Unique Constraint**: Prevents URI conflicts

## 🔧 **Index Manager Functions**

### `updateURIIndex(options)`

Real-time index maintenance called by Payload hooks:

```typescript
await updateURIIndex({
  uri: "/about/team",
  collection: "pages",
  documentId: "doc123",
  status: "published",
  previousURI: "/about/staff", // Creates redirect entry
})
```

**Features:**

- Creates new entries or updates existing ones
- Tracks previous URIs for automatic redirects
- Handles published/draft status transitions
- Graceful error handling (doesn't break content saves)

### `deleteFromURIIndex(collection, documentId)`

Cleanup when documents are deleted:

```typescript
await deleteFromURIIndex("pages", "doc123")
```

**Features:**

- Removes index entries for deleted documents
- Called automatically by delete hooks
- Maintains index consistency

### `checkURIConflict(uri, excludeCollection?, excludeDocumentId?)`

O(1) conflict detection using the index:

```typescript
const conflict = await checkURIConflict("/about-us", "pages", "currentDocId")
if (conflict.hasConflict) {
  console.log(`Conflicts with: ${conflict.conflictingCollection}`)
}
```

**Features:**

- Single database query via index
- Priority-based resolution using collection order
- Exclusion support for document updates
- Detailed conflict information

### `populateURIIndex()`

Bulk population for migrations and setup:

```typescript
const stats = await populateURIIndex()
console.log(`
Total found: ${stats.totalFound}
Populated: ${stats.populated}
Skipped: ${stats.skipped}
Errors: ${stats.errors}
`)
```

**Features:**

- Processes all frontend collections
- Skips already-indexed documents
- Handles collections with/without draft workflow
- Detailed progress reporting
- Generates URIs using routing engine

## 🛡️ **Conflict Resolution**

### How It Works

The system uses the URI Index Collection for instant conflict detection:

```typescript
// Single query to check conflicts
const conflicts = await payload.find({
  collection: "uri-index",
  where: { uri: { equals: normalizedURI } },
})
```

### Resolution Strategy

- **Detection**: Index-based lookup (single query)
- **Priority**: First-match-wins based on collection order
- **Logging**: Detailed conflict warnings with document information
- **Prevention**: Validates URIs before saving documents

### Frontend Collections Priority

Defined in `src/payload/collections/frontend.ts`:

```typescript
export const frontendCollections = [
  { slug: "pages" }, // Highest priority
  { slug: "posts" },
  { slug: "services" },
  { slug: "team" },
  { slug: "testimonials" }, // Lowest priority
]
```

### Example Conflict Resolution

```
URI: /about-us

Index Query Results:
- pages/about-us (priority 0)
- services/about-us (priority 2)

Winner: pages/about-us (lower priority number wins)
```

## 📖 **API Reference**

### `routingEngine`

Main API object with all routing functionality:

#### `generate(options)`

Generate URI for a document:

```typescript
const uri = await routingEngine.generate({
  collection: "pages",
  slug: "contact",
  data: { parent: parentId }, // Optional: for hierarchical
  originalDoc, // Optional: for updates
})
```

**Parameters:**

- `collection`: Collection slug
- `slug`: Document slug
- `data`: Document data (for hierarchy/relationships)
- `originalDoc`: Original document (for updates)

**Returns:** Generated URI string

#### `getAllURIs(draft?)`

Get all URIs for static generation:

```typescript
const uris = await routingEngine.getAllURIs()
// Returns: ["/", "/about", "/blog", "/blog/my-post", ...]

const draftUris = await routingEngine.getAllURIs(true)
// Returns draft URIs for preview mode
```

**Parameters:**

- `draft`: Boolean - include draft URIs

**Returns:** Array of URI strings

#### `checkConflicts(uri, excludeId?)`

Check for URI conflicts:

```typescript
const conflict = await routingEngine.checkConflicts("/about-us", currentDocId)
if (conflict) {
  console.log(`Conflicts with: ${conflict.collection}/${conflict.slug}`)
}
```

**Parameters:**

- `uri`: URI to check
- `excludeId`: Document ID to exclude from conflict check

**Returns:** `URIConflictResult | null`

#### `validate(uri)`

Validate URI format:

```typescript
const result = routingEngine.validate("/about-us")
if (!result.isValid) {
  console.log("Errors:", result.errors)
}
```

**Returns:** `{ isValid: boolean, errors: string[] }`

### Types

```typescript
interface URIIndexUpdate {
  uri: string
  collection: string
  documentId: string
  status: "published" | "draft"
  previousURI?: string
}

interface PopulationStats {
  totalFound: number
  populated: number
  skipped: number
  errors: number
  collections: Record<
    string,
    {
      found: number
      populated: number
      errors: number
    }
  >
}

interface URIConflictResult {
  collection: string
  slug: string
  id: string
  title?: string
}
```

## 🔍 **Debugging & Tools**

### API Endpoints

**Populate URI Index:**

```
GET /api/populate-uri-index
```

Bulk populates the URI index with all existing documents.

**Clear URI Index:**

```
DELETE /api/clear-uri-index
```

Clears all URI index entries (development only).

### Index Inspection

Access the URI Index collection in Payload admin:

- Monitor URI assignments
- Check conflict resolution
- Review redirect history
- Debug population issues

### Logging

The system provides detailed logging for:

- URI generation processes
- Index update operations
- Conflict detection and resolution
- Population progress and errors

## 🚀 **Performance Characteristics**

### Before: Collection Loop

```typescript
// N+1 query problem
for (const collection of frontendCollections) {
  const result = await payload.find({
    collection,
    where: { uri: { equals } },
  })
  // 3-8 queries per request
}
```

### After: URI Index

```typescript
// Single query resolution
const result = await payload.find({
  collection: "uri-index",
  where: { uri: { equals } },
  populate: { document: true },
})
// 1 query per request
```

### Performance Gains

- **URI Resolution**: O(n) → O(1) (10-100x faster)
- **Database Queries**: 3-8 → 1-2 per request
- **Cache Efficiency**: Fragmented → Unified indexing
- **Conflict Detection**: Real-time loops → Instant index lookup
- **Static Generation**: Multiple queries → Single index scan

## 🔧 **Integration with Payload Hooks**

The system integrates seamlessly with Payload through universal hooks:

### Before Change Hook

```typescript
export const beforeCollectionChange: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  collection,
}) => {
  // Generate URI when publishing or changing slug
  if (shouldGenerateURI(data, originalDoc)) {
    data.uri = await routingEngine.generate({
      collection: collection.slug,
      slug: data.slug,
      data,
      originalDoc,
    })
  }
  return data
}
```

### After Change Hook

```typescript
export const afterCollectionChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  collection,
}) => {
  // Update URI index for frontend collections
  if (isFrontendCollection(collection.slug) && doc.uri) {
    await updateURIIndex({
      uri: doc.uri,
      collection: collection.slug,
      documentId: doc.id,
      status: doc._status || "published",
      previousURI: previousDoc?.uri !== doc.uri ? previousDoc?.uri : undefined,
    })
  }
  return doc
}
```

### After Delete Hook

```typescript
export const afterCollectionDelete: CollectionAfterDeleteHook = async ({
  doc,
  collection,
}) => {
  // Clean up URI index entry
  if (isFrontendCollection(collection.slug)) {
    await deleteFromURIIndex(collection.slug, doc.id)
  }
  return doc
}
```

This system provides a complete, production-ready routing solution that scales efficiently while maintaining simplicity and reliability.
