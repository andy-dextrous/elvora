# URI Engine Documentation

The URI Engine provides intelligent, hierarchical URI generation and conflict detection for the Smart Routing Engine.

## 🎯 **Key Features**

- **Hierarchical URI Generation**: Supports parent/child page relationships
- **Archive Page Integration**: Uses designated archive pages for collection items
- **Conflict Detection**: Prevents URI collisions with detailed logging
- **Settings-Driven**: Configuration through global settings
- **Cache Integration**: Works seamlessly with universal cache system
- **Static Generation**: Provides all URIs for build-time optimization

## 📚 **Quick Start**

### Basic Usage

```typescript
import { routingEngine, createURIHook } from "@/lib/routing"

// Generate URI programmatically
const uri = await routingEngine.generate({
  collection: "pages",
  slug: "about-us",
  data: { parent: parentPageId },
})

// Use in Payload field hook
export const MyCollection = {
  fields: [
    {
      name: "uri",
      type: "text",
      hooks: {
        beforeChange: [createURIHook()],
      },
    },
  ],
}
```

### URI Generation Rules

```typescript
// Homepage (pages collection, slug "home")
"home" → ""

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
├── uri-engine.ts    # Main URI generation engine
├── index.ts         # Clean exports and convenience functions
└── README.md        # This documentation
```

### Integration Points

- **Universal Cache**: URI resolution through `cache.getByURI()`
- **Global Settings**: Archive page configuration
- **Payload Hooks**: Automatic URI generation on document save
- **Static Generation**: Build-time URI collection for Next.js

## ⚙️ **URI Generation Logic**

### 1. Homepage Handling

```typescript
// Special case: home page gets empty URI
if (collection === "pages" && slug === "home") {
  return "" // Results in site.com/
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

## 🛡️ **Conflict Detection**

### How It Works

The system checks for URI conflicts across all frontend collections:

```typescript
const conflict = await routingEngine.checkConflicts(uri, excludeDocId)
if (conflict) {
  // Logs detailed conflict information
  // Uses first-match-wins priority
  // Returns the conflicting document details
}
```

### Conflict Resolution

- **Detection**: Checks all frontend collections for matching URIs
- **Logging**: Detailed conflict warnings with document information
- **Strategy**: First-match-wins (existing URIs take priority)
- **Prevention**: Validates URIs before saving

### Example Conflict Log

```
⚠️  URI Conflict Detected: /about-us
   Current: pages/about-us
   Conflicts with: services/about-us
   Using first-match-wins priority
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

#### `getAllURIs(draft?)`

Get all URIs for static generation:

```typescript
const uris = await routingEngine.getAllURIs()
// Returns: ["/", "/about", "/blog", "/blog/my-post", ...]

const draftUris = await routingEngine.getAllURIs(true)
// Returns draft URIs for preview mode
```

#### `checkConflicts(uri, excludeId?)`

Check for URI conflicts:

```typescript
const conflict = await routingEngine.checkConflicts("/about-us", currentDocId)
if (conflict) {
  console.log(`Conflicts with: ${conflict.collection}/${conflict.slug}`)
}
```

#### `validate(uri)`

Validate URI format:

```typescript
const result = routingEngine.validate("/about-us")
// Returns: { isValid: true, errors: [] }

const invalid = routingEngine.validate("invalid uri")
// Returns: { isValid: false, errors: ["URI must start with /", ...] }
```

#### `slugToURI(slugArray)` & `uriToSlug(uri)`

Convert between Next.js slug arrays and URIs:

```typescript
const uri = routingEngine.slugToURI(["blog", "my-post"])
// Returns: "/blog/my-post"

const slugArray = routingEngine.uriToSlug("/blog/my-post")
// Returns: ["blog", "my-post"]
```

### `createURIHook()`

Payload field hook for automatic URI generation:

```typescript
{
  name: "uri",
  type: "text",
  hooks: {
    beforeChange: [createURIHook()],
  },
}
```

### `validateURI(uri)`

Standalone URI validation:

```typescript
const result = validateURI("/my-page")
// Returns: { isValid: boolean, errors: string[] }
```

## 🔧 **Configuration**

### Global Settings

Configure archive pages in your Payload settings global:

```typescript
// settings global
{
  postsArchivePage: { relationTo: "pages", value: "blog-page-id" },
  servicesArchivePage: { relationTo: "pages", value: "services-page-id" },
  // etc...
}
```

### Frontend Collections

Specify which collections are public-facing:

```typescript
// src/payload/collections/frontend.ts
export const frontendCollections = [
  { slug: "pages" },
  { slug: "posts" },
  { slug: "services" },
]
```

## 🚀 **Advanced Usage**

### Custom URI Generation

```typescript
// For custom logic beyond the standard rules
const customURI = await routingEngine.generate({
  collection: "events",
  slug: "conference-2024",
  data: {
    category: "technology",
    customPrefix: "/events/tech", // Could be used in custom logic
  },
})
```

### Batch Operations

```typescript
// Generate multiple URIs efficiently
const documents = await payload.find({ collection: "pages" })
const uris = await Promise.all(
  documents.docs.map(doc =>
    routingEngine.generate({
      collection: "pages",
      slug: doc.slug,
      data: doc,
    })
  )
)
```

### Debug All URIs

```typescript
import { debugAllURIs } from "@/lib/routing"

// Development helper
const allUris = await debugAllURIs()
// Logs all URIs to console and returns array
```

## 🔄 **Integration with Universal Cache**

The URI Engine works seamlessly with the universal cache system:

```typescript
// Document resolution uses generated URIs
const route = await cache.getByURI("/blog/my-post")
// Returns: { document, collection } or null

// Cache invalidation happens automatically when URIs change
// Tags: ["collection:pages", "global:settings", "routes"]
```

## 📝 **Best Practices**

### 1. Use Archive Pages

Set up dedicated archive pages for collections:

- Create a "Blog" page with slug "blog"
- Set it as `postsArchivePage` in settings
- All posts get URIs like `/blog/post-slug`

### 2. Plan URI Structure

```typescript
// Good structure (SEO-friendly, logical)
/about-us
/about-us/team
/about-us/history
/blog
/blog/my-latest-post
/services
/services/web-design

// Avoid deep nesting
/company/about/team/members/john  // Too deep
```

### 3. Handle Conflicts Early

Monitor logs for URI conflicts and resolve them:

- Use unique slugs across collections
- Consider prefixes for different content types
- Set up redirect rules for changed URIs

### 4. Test Static Generation

```typescript
// Verify all URIs generate correctly
export async function generateStaticParams() {
  const routes = await routingEngine.getAllURIs()
  return routes.map(route => ({
    slug: routingEngine.uriToSlug(route),
  }))
}
```

## 🐛 **Troubleshooting**

### Common Issues

**URIs not generating:**

- Check if collection is in `frontendCollections`
- Verify URI field exists in collection schema
- Check Payload logs for error messages

**Conflicts not detected:**

- Ensure all collections have URI fields
- Check if conflict detection is running (logs show warnings)
- Verify document IDs are properly excluded during updates

**Static generation fails:**

- Check if all URIs are valid format
- Ensure published documents have URI field populated
- Review Next.js build logs for specific errors

### Debugging

```typescript
// Enable detailed logging
process.env.NODE_ENV = "development"

// Test specific URI
const result = await routingEngine.checkConflicts("/test-uri")
console.log("Conflict result:", result)

// Validate URI format
const validation = routingEngine.validate("/my-uri")
console.log("Validation:", validation)
```
