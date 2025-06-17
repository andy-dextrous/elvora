# Universal Dynamic Routing Implementation

## Core Implementation Requirements

### **Objective**

Single dynamic route `[[...slug]]` that sources content from any collection with a unified query system and mandatory collection prefixes for unique slugs.

### **Slug Strategy**

- **Pages**: Direct slugs (e.g., `/about`, `/contact`)
- **All Other Collections**: Collection-prefixed slugs (e.g., `/services/web-development`, `/team/john-doe`)
- **Uniqueness**: Enforced via collection prefix system

---

## 🔧 Implementation Tasks

### **1. Universal Route Handler**

**File**: `src/app/(frontend)/[[...slug]]/page.tsx`

```typescript
import { notFound } from 'next/navigation'
import { findUniversalDocument } from '@/lib/queries/universal-document'
import { UniversalRenderer } from '@/components/renderers/UniversalRenderer'
import { generateUniversalMeta } from '@/utilities/generateUniversalMeta'

interface PageProps {
  params: {
    slug?: string[]
  }
}

export default async function UniversalPage({ params }: PageProps) {
  const { slug = [] } = params
  const slugPath = slug.join('/')

  // Handle root path
  if (slugPath === '') {
    const homeDoc = await findUniversalDocument('', 'pages')
    if (!homeDoc) notFound()
    return <UniversalRenderer document={homeDoc.document} collection="pages" />
  }

  // Try to find document in any collection
  const result = await findUniversalDocument(slugPath)

  if (!result) {
    notFound()
  }

  return (
    <UniversalRenderer
      document={result.document}
      collection={result.collection}
    />
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug = [] } = params
  const slugPath = slug.join('/')

  const result = await findUniversalDocument(slugPath)

  if (!result) {
    return {}
  }

  return generateUniversalMeta(result.document, result.collection)
}

export async function generateStaticParams() {
  const { getAllUniversalDocuments } = await import('@/lib/queries/universal-documents')
  const documents = await getAllUniversalDocuments()

  return documents.map((doc) => ({
    slug: doc.fullSlug.split('/').filter(Boolean)
  }))
}
```

### **2. Universal Document Query System**

**File**: `src/lib/queries/universal-document.ts`

```typescript
import { getPayloadHMR } from "@payloadcms/next/utilities"
import { unstable_cache } from "next/cache"

interface UniversalDocument {
  document: any
  collection: string
  fullSlug: string
}

// Get all frontend-eligible collections
async function getFrontendCollections(): Promise<string[]> {
  const payload = await getPayloadHMR()

  return payload.config.collections
    .filter(collection => collection.custom?.frontend === true)
    .map(collection => collection.slug)
}

// Main universal document finder
export const findUniversalDocument = unstable_cache(
  async (
    slug: string,
    specificCollection?: string
  ): Promise<UniversalDocument | null> => {
    const payload = await getPayloadHMR()

    // If specific collection provided, search only there
    if (specificCollection) {
      const result = await payload.find({
        collection: specificCollection,
        where: {
          slug: {
            equals: slug,
          },
        },
        limit: 1,
        depth: 2,
      })

      if (result.docs[0]) {
        return {
          document: result.docs[0],
          collection: specificCollection,
          fullSlug:
            specificCollection === "pages" ? slug : `${specificCollection}/${slug}`,
        }
      }
      return null
    }

    // Get all frontend collections
    const collections = await getFrontendCollections()

    // Add pages collection (no prefix)
    const allCollections = ["pages", ...collections]

    // Search each collection
    for (const collectionSlug of allCollections) {
      let searchSlug = slug

      // For non-pages collections, extract the actual slug from the path
      if (collectionSlug !== "pages") {
        const parts = slug.split("/")
        if (parts[0] === collectionSlug && parts.length > 1) {
          searchSlug = parts.slice(1).join("/")
        } else {
          continue // Skip if path doesn't match collection prefix
        }
      }

      const result = await payload.find({
        collection: collectionSlug,
        where: {
          slug: {
            equals: searchSlug,
          },
        },
        limit: 1,
        depth: 2,
      })

      if (result.docs[0]) {
        return {
          document: result.docs[0],
          collection: collectionSlug,
          fullSlug:
            collectionSlug === "pages" ? searchSlug : `${collectionSlug}/${searchSlug}`,
        }
      }
    }

    return null
  },
  ["universal-document"],
  {
    tags: ["universal-routing"],
    revalidate: 60,
  }
)

// Get all documents for static generation
export const getAllUniversalDocuments = unstable_cache(
  async (): Promise<UniversalDocument[]> => {
    const payload = await getPayloadHMR()
    const collections = await getFrontendCollections()
    const allCollections = ["pages", ...collections]

    const documents: UniversalDocument[] = []

    for (const collectionSlug of allCollections) {
      const result = await payload.find({
        collection: collectionSlug,
        where: {
          _status: {
            equals: "published",
          },
        },
        limit: 1000,
        depth: 0,
      })

      result.docs.forEach((doc: any) => {
        documents.push({
          document: doc,
          collection: collectionSlug,
          fullSlug:
            collectionSlug === "pages" ? doc.slug : `${collectionSlug}/${doc.slug}`,
        })
      })
    }

    return documents
  },
  ["all-universal-documents"],
  {
    tags: ["universal-routing"],
    revalidate: 3600,
  }
)
```

### **3. Universal Renderer Component**

**File**: `src/components/renderers/UniversalRenderer.tsx`

```typescript
import { RenderSections } from '@/components/sections/RenderSections'
import { PostBody } from '@/components/posts/post-body'

interface UniversalRendererProps {
  document: any
  collection: string
}

export function UniversalRenderer({ document, collection }: UniversalRendererProps) {
  // Pages use sections-based rendering
  if (collection === 'pages') {
    return <RenderSections sections={document.sections} />
  }

  // Posts use post-specific rendering
  if (collection === 'posts') {
    return <PostBody post={document} />
  }

  // Services use custom service rendering
  if (collection === 'services') {
    return <ServiceRenderer service={document} />
  }

  // Team members use custom team rendering
  if (collection === 'team') {
    return <TeamMemberRenderer member={document} />
  }

  // Default fallback renderer
  return <DefaultRenderer document={document} collection={collection} />
}

// Service-specific renderer
function ServiceRenderer({ service }: { service: any }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{service.title}</h1>
      {service.description && (
        <div className="prose max-w-none mb-8"
             dangerouslySetInnerHTML={{ __html: service.description }} />
      )}
      {service.sections && <RenderSections sections={service.sections} />}
    </div>
  )
}

// Team member renderer
function TeamMemberRenderer({ member }: { member: any }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{member.name}</h1>
      {member.position && <p className="text-xl mb-4">{member.position}</p>}
      {member.bio && (
        <div className="prose max-w-none"
             dangerouslySetInnerHTML={{ __html: member.bio }} />
      )}
    </div>
  )
}

// Default fallback renderer
function DefaultRenderer({ document, collection }: { document: any; collection: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">
        {document.title || document.name || 'Untitled'}
      </h1>
      {document.content && (
        <div className="prose max-w-none"
             dangerouslySetInnerHTML={{ __html: document.content }} />
      )}
      <p className="text-sm text-gray-500 mt-8">
        Content Type: {collection}
      </p>
    </div>
  )
}
```

### **4. Collection Configuration System**

**File**: `src/payload/collections/services.ts` (Example)

```typescript
import { CollectionConfig } from "payload/types"

export const Services: CollectionConfig = {
  slug: "services",
  custom: {
    frontend: true, // Enable frontend routing
  },
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      admin: {
        position: "sidebar",
        description: "URL will be: /services/your-slug",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data.title) {
              return data.title.toLowerCase().replace(/\s+/g, "-")
            }
            return value
          },
        ],
      },
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "sections",
      type: "blocks",
      blocks: [
        // Your section blocks
      ],
    },
  ],
}
```

### **5. Universal Slug Validation Hook**

**File**: `src/payload/hooks/validateUniversalSlug.ts`

```typescript
import { FieldHook } from "payload/types"

export const validateUniversalSlug: FieldHook = async ({
  data,
  req,
  value,
  collection,
}) => {
  if (!value) return value

  const { payload } = req
  const collections = await getFrontendCollectionsFromConfig()

  // Check slug uniqueness within collection
  const existingInCollection = await payload.find({
    collection: collection?.slug,
    where: {
      slug: { equals: value },
      id: { not_equals: data?.id },
    },
    limit: 1,
  })

  if (existingInCollection.docs.length > 0) {
    throw new Error("Slug must be unique within this collection")
  }

  // For pages, check against all other collections with prefixes
  if (collection?.slug === "pages") {
    for (const collectionSlug of collections) {
      const conflictingSlug = `${collectionSlug}/${value}`
      const existing = await payload.find({
        collection: collectionSlug,
        where: { slug: { equals: value } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        throw new Error(`Slug conflicts with /${conflictingSlug}`)
      }
    }
  }

  return value
}

async function getFrontendCollectionsFromConfig() {
  const payload = await getPayloadHMR()
  return payload.config.collections
    .filter(collection => collection.custom?.frontend === true)
    .map(collection => collection.slug)
}
```

### **6. Universal Metadata Generator**

**File**: `src/utilities/generateUniversalMeta.ts`

```typescript
import { Metadata } from "next"

export function generateUniversalMeta(document: any, collection: string): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  // Build URL based on collection
  const url =
    collection === "pages"
      ? `${baseUrl}/${document.slug}`
      : `${baseUrl}/${collection}/${document.slug}`

  // Extract title
  const title = document.title || document.name || "Untitled"

  // Extract description
  const description =
    document.description ||
    document.excerpt ||
    document.meta?.description ||
    "No description available"

  // Extract image
  const image =
    document.featuredImage?.url ||
    document.image?.url ||
    document.meta?.image?.url ||
    `${baseUrl}/og-default.jpg`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image }],
      type: collection === "posts" ? "article" : "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}
```

### **7. Remove Existing Dynamic Routes**

**Tasks**:

- [ ] Delete `src/app/(frontend)/[slug]/page.tsx`
- [ ] Delete `src/app/(frontend)/blog/[slug]/page.tsx`
- [ ] Update any hardcoded route references to use universal system

### **8. Update Collection Configurations**

**Tasks**:

- [ ] Add `custom: { frontend: true }` to all collections that should be web-accessible
- [ ] Add slug validation hook to all frontend collections
- [ ] Add collection prefix description to admin UI
- [ ] Update existing collections: services, team, testimonials, etc.

### **9. Cache Invalidation System**

**File**: `src/payload/hooks/revalidateUniversalRouting.ts`

```typescript
import { CollectionAfterChangeHook } from "payload/types"
import { revalidateTag } from "next/cache"

export const revalidateUniversalRouting: CollectionAfterChangeHook = async ({
  doc,
  collection,
  req,
}) => {
  if (collection.custom?.frontend) {
    // Revalidate universal routing cache
    revalidateTag("universal-routing")

    // Revalidate specific document
    revalidateTag(`document-${collection.slug}-${doc.slug}`)

    // Revalidate all documents cache
    revalidateTag("all-universal-documents")
  }
}
```

### **10. Frontend Collection Wrapper Utility**

**File**: `src/payload/utilities/createFrontendCollection.ts`

```typescript
import { CollectionConfig } from "payload/types"
import { validateUniversalSlug } from "../hooks/validateUniversalSlug"
import { revalidateUniversalRouting } from "../hooks/revalidateUniversalRouting"

export function createFrontendCollection(config: CollectionConfig): CollectionConfig {
  return {
    ...config,
    custom: {
      ...config.custom,
      frontend: true,
    },
    fields: [
      ...config.fields,
      {
        name: "slug",
        type: "text",
        required: true,
        admin: {
          position: "sidebar",
          description: `URL will be: /${config.slug}/your-slug`,
        },
        hooks: {
          beforeValidate: [validateUniversalSlug],
        },
      },
    ],
    hooks: {
      ...config.hooks,
      afterChange: [...(config.hooks?.afterChange || []), revalidateUniversalRouting],
    },
  }
}
```

**Usage Example**:

```typescript
import { createFrontendCollection } from "@/payload/utilities/createFrontendCollection"

export const Services = createFrontendCollection({
  slug: "services",
  admin: {
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "richText",
    },
    // slug field automatically added by wrapper
  ],
})
```

### **11. Homepage Detection System**

**File**: `src/payload/globals/settings/index.ts` (Update existing)

```typescript
import { GlobalConfig } from "payload/types"

export const Settings: GlobalConfig = {
  slug: "settings",
  admin: {
    group: "Admin",
  },
  fields: [
    // ... existing fields
    {
      type: "collapsible",
      label: "Reading Settings",
      fields: [
        {
          name: "homepage",
          type: "relationship",
          relationTo: "pages",
          label: "Homepage",
          admin: {
            description: "Select which page displays as your homepage",
          },
        },
        {
          name: "postsPage",
          type: "relationship",
          relationTo: "pages",
          label: "Posts Page",
          admin: {
            description: "Select which page displays your blog posts (optional)",
          },
        },
      ],
    },
    // ... other existing fields
  ],
}
```

**File**: `src/lib/queries/homepage.ts` (NEW)

```typescript
import { getPayloadHMR } from "@payloadcms/next/utilities"
import { unstable_cache } from "next/cache"

export const getHomepage = unstable_cache(
  async () => {
    const payload = await getPayloadHMR()

    // Get settings to find homepage reference
    const settings = await payload.findGlobal({
      slug: "settings",
      depth: 2,
    })

    if (settings.homepage) {
      return {
        document: settings.homepage,
        collection: "pages",
        fullSlug: "",
      }
    }

    // Fallback: find page with slug 'home' or first page
    const fallbackPage = await payload.find({
      collection: "pages",
      where: {
        or: [{ slug: { equals: "home" } }, { slug: { equals: "" } }],
      },
      limit: 1,
      depth: 2,
    })

    if (fallbackPage.docs[0]) {
      return {
        document: fallbackPage.docs[0],
        collection: "pages",
        fullSlug: "",
      }
    }

    return null
  },
  ["homepage"],
  {
    tags: ["homepage", "universal-routing"],
    revalidate: 3600,
  }
)

export const getPostsPage = unstable_cache(
  async () => {
    const payload = await getPayloadHMR()

    const settings = await payload.findGlobal({
      slug: "settings",
      depth: 2,
    })

    if (settings.postsPage) {
      return {
        document: settings.postsPage,
        collection: "pages",
        fullSlug: settings.postsPage.slug,
      }
    }

    return null
  },
  ["posts-page"],
  {
    tags: ["posts-page", "universal-routing"],
    revalidate: 3600,
  }
)
```

**Update**: `src/lib/queries/universal-document.ts`

```typescript
import { getPayloadHMR } from "@payloadcms/next/utilities"
import { unstable_cache } from "next/cache"
import { getHomepage } from "./homepage"

interface UniversalDocument {
  document: any
  collection: string
  fullSlug: string
}

// Get all frontend-eligible collections
async function getFrontendCollections(): Promise<string[]> {
  const payload = await getPayloadHMR()

  return payload.config.collections
    .filter(collection => collection.custom?.frontend === true)
    .map(collection => collection.slug)
}

// Main universal document finder
export const findUniversalDocument = unstable_cache(
  async (
    slug: string,
    specificCollection?: string
  ): Promise<UniversalDocument | null> => {
    const payload = await getPayloadHMR()

    // Handle root/homepage request
    if (slug === "" || slug === "/") {
      return await getHomepage()
    }

    // If specific collection provided, search only there
    if (specificCollection) {
      const result = await payload.find({
        collection: specificCollection,
        where: {
          slug: {
            equals: slug,
          },
        },
        limit: 1,
        depth: 2,
      })

      if (result.docs[0]) {
        return {
          document: result.docs[0],
          collection: specificCollection,
          fullSlug:
            specificCollection === "pages" ? slug : `${specificCollection}/${slug}`,
        }
      }
      return null
    }

    // Get all frontend collections
    const collections = await getFrontendCollections()

    // Add pages collection (no prefix)
    const allCollections = ["pages", ...collections]

    // Search each collection
    for (const collectionSlug of allCollections) {
      let searchSlug = slug

      // For non-pages collections, extract the actual slug from the path
      if (collectionSlug !== "pages") {
        const parts = slug.split("/")
        if (parts[0] === collectionSlug && parts.length > 1) {
          searchSlug = parts.slice(1).join("/")
        } else {
          continue // Skip if path doesn't match collection prefix
        }
      }

      const result = await payload.find({
        collection: collectionSlug,
        where: {
          slug: {
            equals: searchSlug,
          },
        },
        limit: 1,
        depth: 2,
      })

      if (result.docs[0]) {
        return {
          document: result.docs[0],
          collection: collectionSlug,
          fullSlug:
            collectionSlug === "pages" ? searchSlug : `${collectionSlug}/${searchSlug}`,
        }
      }
    }

    return null
  },
  ["universal-document"],
  {
    tags: ["universal-routing"],
    revalidate: 60,
  }
)

// Get all documents for static generation
export const getAllUniversalDocuments = unstable_cache(
  async (): Promise<UniversalDocument[]> => {
    const payload = await getPayloadHMR()
    const collections = await getFrontendCollections()
    const allCollections = ["pages", ...collections]

    const documents: UniversalDocument[] = []

    // Add homepage as root route
    const homepage = await getHomepage()
    if (homepage) {
      documents.push(homepage)
    }

    for (const collectionSlug of allCollections) {
      const result = await payload.find({
        collection: collectionSlug,
        where: {
          _status: {
            equals: "published",
          },
        },
        limit: 1000,
        depth: 0,
      })

      result.docs.forEach((doc: any) => {
        // Skip homepage if it's already added as root
        if (collectionSlug === "pages" && homepage && doc.id === homepage.document.id) {
          return
        }

        documents.push({
          document: doc,
          collection: collectionSlug,
          fullSlug:
            collectionSlug === "pages" ? doc.slug : `${collectionSlug}/${doc.slug}`,
        })
      })
    }

    return documents
  },
  ["all-universal-documents"],
  {
    tags: ["universal-routing"],
    revalidate: 3600,
  }
)
```

**Update**: `src/payload/hooks/revalidateUniversalRouting.ts`

```typescript
import { CollectionAfterChangeHook, GlobalAfterChangeHook } from "payload/types"
import { revalidateTag } from "next/cache"

export const revalidateUniversalRouting: CollectionAfterChangeHook = async ({
  doc,
  collection,
  req,
}) => {
  if (collection.custom?.frontend) {
    // Revalidate universal routing cache
    revalidateTag("universal-routing")

    // Revalidate specific document
    revalidateTag(`document-${collection.slug}-${doc.slug}`)

    // Revalidate all documents cache
    revalidateTag("all-universal-documents")
  }
}

// New hook for settings changes
export const revalidateSettingsRouting: GlobalAfterChangeHook = async ({
  doc,
  global,
  req,
}) => {
  if (global.slug === "settings") {
    // Revalidate homepage cache when settings change
    revalidateTag("homepage")
    revalidateTag("posts-page")
    revalidateTag("universal-routing")
    revalidateTag("all-universal-documents")
  }
}
```

**Update**: `src/payload/globals/settings/hooks/revalidateSettings.ts`

```typescript
import { GlobalAfterChangeHook } from "payload/types"
import { revalidateTag } from "next/cache"
import { revalidateSettingsRouting } from "../../hooks/revalidateUniversalRouting"

export const revalidateSettings: GlobalAfterChangeHook = async args => {
  // Existing revalidation logic...

  // Add universal routing revalidation
  await revalidateSettingsRouting(args)
}
```

### **12. WordPress-Style Admin Interface**

**File**: `src/payload/components/backend/homepage-preview/index.tsx` (NEW)

```typescript
"use client"
import React from "react"
import { useConfig } from "payload/components/utilities"

export const HomepagePreview: React.FC = () => {
  const config = useConfig()
  const serverURL = config.serverURL

  return (
    <div className="homepage-preview">
      <p>
        <strong>Homepage URL:</strong>{" "}
        <a href={serverURL} target="_blank" rel="noopener noreferrer">
          {serverURL}
        </a>
      </p>
      <p className="description">
        This page will display at your site's root URL. Visitors will see this when they visit your domain.
      </p>
    </div>
  )
}
```

**File**: `src/payload/components/backend/homepage-preview/index.scss`

```scss
.homepage-preview {
  background: var(--theme-elevation-50);
  border: 1px solid var(--theme-elevation-100);
  border-radius: 4px;
  padding: 1rem;
  margin-top: 0.5rem;

  .description {
    color: var(--theme-elevation-400);
    font-size: 0.875rem;
    margin: 0.5rem 0 0 0;
  }

  a {
    color: var(--theme-success-500);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
```

**Update Settings Global to include preview**:

```typescript
import { HomepagePreview } from "../../components/backend/homepage-preview"

export const Settings: GlobalConfig = {
  slug: "settings",
  admin: {
    group: "Admin",
  },
  fields: [
    // ... existing fields
    {
      type: "collapsible",
      label: "Reading Settings",
      fields: [
        {
          name: "homepage",
          type: "relationship",
          relationTo: "pages",
          label: "Homepage",
          admin: {
            description: "Select which page displays as your homepage",
            components: {
              afterInput: [HomepagePreview],
            },
          },
        },
        {
          name: "postsPage",
          type: "relationship",
          relationTo: "pages",
          label: "Posts Page",
          admin: {
            description: "Select which page displays your blog posts (optional)",
          },
        },
      ],
    },
    // ... other existing fields
  ],
}
```

### **13. WordPress-Style Archive System**

**Strategy**: Archives must be created as Pages and assigned in Settings, then use dedicated archive templates for rendering.

**File**: `src/payload/globals/settings/index.ts` (Update existing)

```typescript
import { GlobalConfig } from "payload/types"

export const Settings: GlobalConfig = {
  slug: "settings",
  admin: {
    group: "Admin",
  },
  fields: [
    // ... existing fields
    {
      type: "collapsible",
      label: "Reading Settings",
      fields: [
        {
          name: "homepage",
          type: "relationship",
          relationTo: "pages",
          label: "Homepage",
          admin: {
            description: "Select which page displays as your homepage",
          },
        },
        {
          name: "postsPage",
          type: "relationship",
          relationTo: "pages",
          label: "Posts Page (Blog Archive)",
          admin: {
            description: "Select which page displays your blog posts archive",
          },
        },
      ],
    },
    {
      type: "collapsible",
      label: "Archive Settings",
      fields: [
        {
          name: "servicesArchive",
          type: "relationship",
          relationTo: "pages",
          label: "Services Archive Page",
          admin: {
            description: "Select which page displays the services archive at /services",
          },
        },
        {
          name: "teamArchive",
          type: "relationship",
          relationTo: "pages",
          label: "Team Archive Page",
          admin: {
            description: "Select which page displays the team archive at /team",
          },
        },
        {
          name: "testimonialsArchive",
          type: "relationship",
          relationTo: "pages",
          label: "Testimonials Archive Page",
          admin: {
            description:
              "Select which page displays the testimonials archive at /testimonials",
          },
        },
      ],
    },
    // ... other existing fields
  ],
}
```

**File**: `src/lib/queries/archives.ts` (NEW)

```typescript
import { getPayloadHMR } from "@payloadcms/next/utilities"
import { unstable_cache } from "next/cache"

interface ArchiveDocument {
  document: any
  collection: string
  fullSlug: string
  archiveFor: string
}

// Get archive page for a specific collection
export const getArchivePage = unstable_cache(
  async (collectionSlug: string): Promise<ArchiveDocument | null> => {
    const payload = await getPayloadHMR()

    const settings = await payload.findGlobal({
      slug: "settings",
      depth: 2,
    })

    // Map collection slugs to settings fields
    const archiveMapping: Record<string, string> = {
      posts: "postsPage",
      services: "servicesArchive",
      team: "teamArchive",
      testimonials: "testimonialsArchive",
    }

    const settingsField = archiveMapping[collectionSlug]
    if (!settingsField || !settings[settingsField]) {
      return null
    }

    return {
      document: settings[settingsField],
      collection: "pages",
      fullSlug: collectionSlug,
      archiveFor: collectionSlug,
    }
  },
  ["archive-page"],
  {
    tags: ["archive-pages", "universal-routing"],
    revalidate: 3600,
  }
)

// Get archive content (documents from the collection)
export const getArchiveContent = unstable_cache(
  async (collectionSlug: string, page: number = 1, limit: number = 12) => {
    const payload = await getPayloadHMR()

    const result = await payload.find({
      collection: collectionSlug,
      where: {
        _status: {
          equals: "published",
        },
      },
      limit,
      page,
      depth: 1,
      sort: "-updatedAt",
    })

    return result
  },
  ["archive-content"],
  {
    tags: ["archive-content", "universal-routing"],
    revalidate: 300,
  }
)
```

**Update**: `src/lib/queries/universal-document.ts` (Add archive detection)

```typescript
import { getPayloadHMR } from "@payloadcms/next/utilities"
import { unstable_cache } from "next/cache"
import { getHomepage } from "./homepage"
import { getArchivePage } from "./archives"

interface UniversalDocument {
  document: any
  collection: string
  fullSlug: string
  archiveFor?: string
}

// Get all frontend-eligible collections
async function getFrontendCollections(): Promise<string[]> {
  const payload = await getPayloadHMR()

  return payload.config.collections
    .filter(collection => collection.custom?.frontend === true)
    .map(collection => collection.slug)
}

// Main universal document finder
export const findUniversalDocument = unstable_cache(
  async (
    slug: string,
    specificCollection?: string
  ): Promise<UniversalDocument | null> => {
    const payload = await getPayloadHMR()

    // Handle root/homepage request
    if (slug === "" || slug === "/") {
      return await getHomepage()
    }

    // Check if this is an archive request (e.g., /blog, /services, /team)
    const archivePage = await getArchivePage(slug)
    if (archivePage) {
      return archivePage
    }

    // If specific collection provided, search only there
    if (specificCollection) {
      const result = await payload.find({
        collection: specificCollection,
        where: {
          slug: {
            equals: slug,
          },
        },
        limit: 1,
        depth: 2,
      })

      if (result.docs[0]) {
        return {
          document: result.docs[0],
          collection: specificCollection,
          fullSlug:
            specificCollection === "pages" ? slug : `${specificCollection}/${slug}`,
        }
      }
      return null
    }

    // Get all frontend collections
    const collections = await getFrontendCollections()

    // Add pages and posts collections
    const allCollections = ["pages", "posts", ...collections]

    // Search each collection
    for (const collectionSlug of allCollections) {
      let searchSlug = slug

      // For non-pages collections, extract the actual slug from the path
      if (collectionSlug !== "pages") {
        const parts = slug.split("/")
        if (parts[0] === collectionSlug && parts.length > 1) {
          searchSlug = parts.slice(1).join("/")
        } else {
          continue // Skip if path doesn't match collection prefix
        }
      }

      const result = await payload.find({
        collection: collectionSlug,
        where: {
          slug: {
            equals: searchSlug,
          },
        },
        limit: 1,
        depth: 2,
      })

      if (result.docs[0]) {
        return {
          document: result.docs[0],
          collection: collectionSlug,
          fullSlug:
            collectionSlug === "pages" ? searchSlug : `${collectionSlug}/${searchSlug}`,
        }
      }
    }

    return null
  },
  ["universal-document"],
  {
    tags: ["universal-routing"],
    revalidate: 60,
  }
)

// Get all documents for static generation
export const getAllUniversalDocuments = unstable_cache(
  async (): Promise<UniversalDocument[]> => {
    const payload = await getPayloadHMR()
    const collections = await getFrontendCollections()
    const allCollections = ["pages", "posts", ...collections]

    const documents: UniversalDocument[] = []

    // Add homepage as root route
    const homepage = await getHomepage()
    if (homepage) {
      documents.push(homepage)
    }

    // Add archive pages
    const { getAllArchivePages } = await import("./archives")
    const archivePages = await getAllArchivePages()
    documents.push(...archivePages)

    for (const collectionSlug of allCollections) {
      const result = await payload.find({
        collection: collectionSlug,
        where: {
          _status: {
            equals: "published",
          },
        },
        limit: 1000,
        depth: 0,
      })

      result.docs.forEach((doc: any) => {
        // Skip homepage if it's already added as root
        if (collectionSlug === "pages" && homepage && doc.id === homepage.document.id) {
          return
        }

        // Skip archive pages if they're already added
        const isArchivePage = archivePages.some(archive => archive.document.id === doc.id)
        if (collectionSlug === "pages" && isArchivePage) {
          return
        }

        documents.push({
          document: doc,
          collection: collectionSlug,
          fullSlug:
            collectionSlug === "pages" ? doc.slug : `${collectionSlug}/${doc.slug}`,
        })
      })
    }

    return documents
  },
  ["all-universal-documents"],
  {
    tags: ["universal-routing"],
    revalidate: 3600,
  }
)
```

**Update**: `src/components/renderers/UniversalRenderer.tsx`

```typescript
import { RenderSections } from '@/components/sections/RenderSections'
import { PostBody } from '@/components/posts/post-body'
import { ArchiveRenderer } from './ArchiveRenderer'

interface UniversalRendererProps {
  document: any
  collection: string
  archiveFor?: string
}

export function UniversalRenderer({ document, collection, archiveFor }: UniversalRendererProps) {
  // Archive pages use archive-specific rendering
  if (archiveFor) {
    return <ArchiveRenderer document={document} archiveFor={archiveFor} />
  }

  // Pages use sections-based rendering
  if (collection === 'pages') {
    return <RenderSections sections={document.sections} />
  }

  // Posts use post-specific rendering
  if (collection === 'posts') {
    return <PostBody post={document} />
  }

  // Services use custom service rendering
  if (collection === 'services') {
    return <ServiceRenderer service={document} />
  }

  // Team members use custom team rendering
  if (collection === 'team') {
    return <TeamMemberRenderer member={document} />
  }

  // Default fallback renderer
  return <DefaultRenderer document={document} collection={collection} />
}

// Service-specific renderer
function ServiceRenderer({ service }: { service: any }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{service.title}</h1>
      {service.description && (
        <div className="prose max-w-none mb-8"
             dangerouslySetInnerHTML={{ __html: service.description }} />
      )}
      {service.sections && <RenderSections sections={service.sections} />}
    </div>
  )
}

// Team member renderer
function TeamMemberRenderer({ member }: { member: any }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{member.name}</h1>
      {member.position && <p className="text-xl mb-4">{member.position}</p>}
      {member.bio && (
        <div className="prose max-w-none"
             dangerouslySetInnerHTML={{ __html: member.bio }} />
      )}
    </div>
  )
}

// Default fallback renderer
function DefaultRenderer({ document, collection }: { document: any; collection: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">
        {document.title || document.name || 'Untitled'}
      </h1>
      {document.content && (
        <div className="prose max-w-none"
             dangerouslySetInnerHTML={{ __html: document.content }} />
      )}
      <p className="text-sm text-gray-500 mt-8">
        Content Type: {collection}
      </p>
    </div>
  )
}
```

**File**: `src/components/renderers/ArchiveRenderer.tsx` (NEW)

```typescript
import { RenderSections } from '@/components/sections/RenderSections'
import { PostsArchive } from './archives/PostsArchive'
import { ServicesArchive } from './archives/ServicesArchive'
import { TeamArchive } from './archives/TeamArchive'
import { TestimonialsArchive } from './archives/TestimonialsArchive'

interface ArchiveRendererProps {
  document: any
  archiveFor: string
}

export function ArchiveRenderer({ document, archiveFor }: ArchiveRendererProps) {
  return (
    <div>
      {/* Render the page's sections first (intro, hero, etc.) */}
      {document.sections && <RenderSections sections={document.sections} />}

      {/* Then render the archive content */}
      <ArchiveContent archiveFor={archiveFor} />
    </div>
  )
}

function ArchiveContent({ archiveFor }: { archiveFor: string }) {
  switch (archiveFor) {
    case 'posts':
      return <PostsArchive />
    case 'services':
      return <ServicesArchive />
    case 'team':
      return <TeamArchive />
    case 'testimonials':
      return <TestimonialsArchive />
    default:
      return <DefaultArchive collectionSlug={archiveFor} />
  }
}

// Default archive component for any collection
function DefaultArchive({ collectionSlug }: { collectionSlug: string }) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 capitalize">
          {collectionSlug} Archive
        </h2>
        <p className="text-gray-600">
          Archive content for {collectionSlug} collection will be displayed here.
        </p>
      </div>
    </section>
  )
}
```

**File**: `src/app/api/archive/[collection]/route.ts` (NEW)

```typescript
import { getArchiveContent } from "@/lib/queries/archives"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")

    const content = await getArchiveContent(params.collection, page, limit)

    return NextResponse.json(content)
  } catch (error) {
    console.error("Archive API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch archive content" },
      { status: 500 }
    )
  }
}
```

### **14. Archive Page Creation Workflow**

**Admin Interface Enhancement**:

```typescript
// src/payload/components/backend/archive-setup/index.tsx
"use client"
import React from "react"
import { Button } from "@/payload/components/ui/button"

export const ArchiveSetup: React.FC = () => {
  const handleCreateArchivePages = async () => {
    // Create default archive pages for collections
    const archivePages = [
      { title: "Blog", slug: "blog", collection: "posts" },
      { title: "Services", slug: "services", collection: "services" },
      { title: "Team", slug: "team", collection: "team" },
      { title: "Testimonials", slug: "testimonials", collection: "testimonials" },
    ]

    // API call to create pages and assign them in settings
    for (const archive of archivePages) {
      await fetch('/api/setup-archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(archive)
      })
    }

    alert('Archive pages created and assigned!')
  }

  return (
    <div className="archive-setup">
      <h3>Archive Page Setup</h3>
      <p>Create and assign archive pages for all collections.</p>
      <Button onClick={handleCreateArchivePages}>
        Create Archive Pages
      </Button>
    </div>
  )
}
```

## Implementation Order

1. **Create universal document query system** (`universal-document.ts`)
2. **Create universal renderer** (`UniversalRenderer.tsx`)
3. **Create universal route handler** (`[[...slug]]/page.tsx`)
4. **Add slug validation hook** (`validateUniversalSlug.ts`)
5. **Create frontend collection wrapper** (`createFrontendCollection.ts`)
6. **Update existing collections** to use frontend wrapper
7. **Create cache invalidation hooks** (`revalidateUniversalRouting.ts`)
8. **Remove old dynamic routes**
9. **Test with existing content**
10. **Add universal metadata generation** (`generateUniversalMeta.ts`)
11. **Add homepage detection system** (`homepage.ts`)
12. **Update WordPress-style admin interface** (`homepage-preview.tsx`)
13. **Implement archive system** (`archives.ts`, `ArchiveRenderer.tsx`)
14. **Create archive API endpoints** (`/api/archive/[collection]/route.ts`)
15. **Add archive setup tools** for admin interface

## Archive System Benefits

### **WordPress-Style Workflow**:

1. **Content creators** create a "Services" page with intro sections
2. **Assign it** in Settings → Archive Settings → Services Archive Page
3. **URL `/services`** now shows the page content + services archive automatically
4. **Individual services** still accessible at `/services/web-development`

### **Template Flexibility**:

- Archive pages can have **custom sections** (hero, intro, CTA)
- Archive content is **automatically appended**
- Each collection can have **custom archive components**
- **Fallback rendering** for collections without specific templates

### **Developer Benefits**:

- **One system** handles all archives (blog, services, team, etc.)
- **Automatic API endpoints** for archive content
- **Consistent caching** and invalidation
- **Easy to extend** for new collections

This gives you the flexibility of WordPress where any page can become an archive, while maintaining clean separation between page content and archive functionality!
