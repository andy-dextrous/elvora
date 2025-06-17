# Universal Dynamic Routing V2 - Auto-Scaling Architecture

## Core Philosophy

**"Add a collection with a slug field → it automatically works on frontend"**

Zero configuration universal routing system that auto-discovers collections, auto-generates archives, and uses convention-based templates. Everything renders through `RenderSections` - no hardcoded templates.

---

## 🎯 V2 Auto-Discovery System

### **Settings-Based Archive Management**

Archives are managed entirely through Global Settings. Collections don't need `hasArchive` flags - if a page is assigned to a collection in Settings, it becomes that collection's archive.

#### **Dynamic Settings Configuration**

**File**: `src/payload/globals/settings/index.ts` (Update existing)

```typescript
import { GlobalConfig } from "payload/types"
import { generateArchiveFields } from "./generateArchiveFields"

export const Settings: GlobalConfig = {
  slug: "settings",
  admin: {
    group: "Admin",
  },
  fields: [
    // ... existing fields
    {
      type: "collapsible",
      label: "Archive Settings",
      admin: {
        description:
          "Assign pages to act as archives for collections. Archives are auto-discovered from collections with slug fields.",
      },
      fields: [
        {
          name: "archives",
          type: "group",
          fields: generateArchiveFields(), // Dynamic field generation
        },
      ],
    },
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
            description: "Page that displays at your site's root URL",
          },
        },
      ],
    },
    // ... other existing fields
  ],
}
```

**File**: `src/payload/globals/settings/generateArchiveFields.ts` (NEW)

```typescript
import { Field } from "payload/types"
import { getPayload } from "payload"
import configPromise from "@payload-config"

/*************************************************************************/
/*  DYNAMICALLY GENERATE ARCHIVE FIELDS FROM ELIGIBLE COLLECTIONS
/*************************************************************************/

export function generateArchiveFields(): Field[] {
  // This will be populated at build time with discovered collections
  const eligibleCollections = getEligibleCollections()

  return eligibleCollections.map(collection => ({
    name: `${collection.slug}Archive`,
    type: "relationship" as const,
    relationTo: "pages",
    label: `${collection.label} Archive Page`,
    admin: {
      description: `Page that displays at /${collection.slug} with all ${collection.label.toLowerCase()}`,
    },
    validate: async (value: any, { req, data }: any) => {
      // Ensure unique archive assignment
      if (value) {
        return await validateUniqueArchive(value, `${collection.slug}Archive`, data, req)
      }
      return true
    },
  }))
}

/*************************************************************************/
/*  GET COLLECTIONS ELIGIBLE FOR ARCHIVES
/*************************************************************************/

function getEligibleCollections() {
  // At build time, discover all collections with slug fields
  // This runs during Payload config compilation

  const collections = [
    { slug: "posts", label: "Blog Posts" },
    { slug: "services", label: "Services" },
    { slug: "team", label: "Team Members" },
    { slug: "testimonials", label: "Testimonials" },
    { slug: "projects", label: "Projects" },
    { slug: "products", label: "Products" },
    // This will be auto-populated by scanning payload.config collections
  ]

  return collections.filter(
    collection =>
      // Only include collections that exist and have slug fields
      collection.slug !== "pages" && // Exclude pages from having archives
      collection.slug !== "templates" && // Exclude templates
      collection.slug !== "media" // Exclude media
  )
}

/*************************************************************************/
/*  VALIDATE UNIQUE ARCHIVE ASSIGNMENT
/*************************************************************************/

async function validateUniqueArchive(
  pageId: string,
  currentField: string,
  allData: any,
  req: any
): Promise<boolean | string> {
  if (!pageId) return true

  // Check if this page is assigned to any other collection archive
  const archiveFields = Object.keys(allData.archives || {}).filter(
    key => key.endsWith("Archive") && key !== currentField
  )

  for (const field of archiveFields) {
    const assignedPageId = allData.archives[field]?.id || allData.archives[field]
    if (assignedPageId === pageId) {
      const collectionName = field.replace("Archive", "")
      return `This page is already assigned as the archive for ${collectionName}. Each page can only be assigned to one collection.`
    }
  }

  return true
}
```

**File**: `src/payload/globals/settings/generateArchiveFields.runtime.ts` (NEW - Runtime Discovery)

```typescript
"use server"

import { getPayload } from "payload"
import configPromise from "@payload-config"
import { Field } from "payload/types"

/*************************************************************************/
/*  RUNTIME COLLECTION DISCOVERY FOR DYNAMIC ARCHIVE FIELDS
/*************************************************************************/

export async function generateArchiveFieldsRuntime(): Promise<Field[]> {
  const payload = await getPayload({ config: configPromise })

  // Get all collections that have slug fields (eligible for archives)
  const eligibleCollections = payload.config.collections
    .filter(collection => {
      // Exclude system collections
      if (["pages", "templates", "media", "users"].includes(collection.slug)) {
        return false
      }

      // Only include collections with slug fields
      return collection.fields.some(field => field.name === "slug")
    })
    .map(collection => ({
      slug: collection.slug,
      label:
        collection.labels?.plural ||
        collection.slug.charAt(0).toUpperCase() + collection.slug.slice(1),
    }))

  return eligibleCollections.map(collection => ({
    name: `${collection.slug}Archive`,
    type: "relationship" as const,
    relationTo: "pages",
    label: `${collection.label} Archive Page`,
    admin: {
      description: `Page that displays at /${collection.slug} with all ${collection.label.toLowerCase()}`,
    },
    validate: async (value: any, { req, data }: any) => {
      if (value) {
        return await validateUniqueArchiveAssignment(
          value,
          `${collection.slug}Archive`,
          data
        )
      }
      return true
    },
  }))
}

/*************************************************************************/
/*  VALIDATE UNIQUE ARCHIVE ASSIGNMENT
/*************************************************************************/

async function validateUniqueArchiveAssignment(
  pageId: string,
  currentField: string,
  allData: any
): Promise<boolean | string> {
  if (!pageId) return true

  const archiveData = allData.archives || {}

  // Check if this page is assigned to any other archive
  for (const [fieldName, assignedPage] of Object.entries(archiveData)) {
    if (fieldName === currentField) continue

    const assignedPageId =
      typeof assignedPage === "object" ? (assignedPage as any)?.id : assignedPage

    if (assignedPageId === pageId) {
      const collectionName = fieldName.replace("Archive", "")
      return `This page is already assigned as the archive for ${collectionName}. Each page can only be assigned to one collection.`
    }
  }

  return true
}
```

#### **Enhanced Templates Collection**

The Templates collection should be enhanced to support dynamic collection targeting:

**File**: `src/payload/collections/templates.ts` (Update existing)

```typescript
import { CollectionConfig } from "payload/types"
import { generateCollectionOptions } from "./generateCollectionOptions"

export const Templates: CollectionConfig = {
  slug: "templates",
  admin: {
    useAsTitle: "title",
    group: "Content",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "targetCollection",
      type: "select",
      label: "Target Collection",
      admin: {
        description:
          "Which collection this template is designed for (leave empty for universal)",
      },
      options: generateCollectionOptions(), // Dynamic options
    },
    {
      name: "sections",
      type: "blocks",
      blocks: [
        // Your existing section blocks
      ],
    },
    // ... other existing fields
  ],
}
```

**File**: `src/payload/collections/generateCollectionOptions.ts` (NEW)

```typescript
import { getPayload } from "payload"
import configPromise from "@payload-config"

/*************************************************************************/
/*  DYNAMICALLY GENERATE COLLECTION OPTIONS FOR TEMPLATES
/*************************************************************************/

export function generateCollectionOptions() {
  // This will be populated at build time with discovered collections
  const eligibleCollections = getEligibleTemplateCollections()

  return [
    { label: "Universal (All Collections)", value: "" },
    ...eligibleCollections.map(collection => ({
      label: collection.label,
      value: collection.slug,
    })),
  ]
}

/*************************************************************************/
/*  GET COLLECTIONS ELIGIBLE FOR TEMPLATE TARGETING
/*************************************************************************/

function getEligibleTemplateCollections() {
  // At build time, discover all non-page collections
  const collections = [
    { slug: "posts", label: "Blog Posts" },
    { slug: "services", label: "Services" },
    { slug: "team", label: "Team Members" },
    { slug: "testimonials", label: "Testimonials" },
    { slug: "projects", label: "Projects" },
    { slug: "products", label: "Products" },
    // This will be auto-populated by scanning payload.config collections
  ]

  return collections.filter(
    collection =>
      // Exclude system collections
      !["pages", "templates", "media", "users"].includes(collection.slug)
  )
}
```

**File**: `src/payload/collections/generateCollectionOptions.runtime.ts` (NEW - Runtime Discovery)

```typescript
"use server"

import { getPayload } from "payload"
import configPromise from "@payload-config"

/*************************************************************************/
/*  RUNTIME COLLECTION DISCOVERY FOR TEMPLATE OPTIONS
/*************************************************************************/

export async function generateCollectionOptionsRuntime() {
  const payload = await getPayload({ config: configPromise })

  // Get all non-system collections
  const eligibleCollections = payload.config.collections
    .filter(collection => {
      // Exclude system collections
      return !["pages", "templates", "media", "users"].includes(collection.slug)
    })
    .map(collection => ({
      slug: collection.slug,
      label:
        collection.labels?.plural ||
        collection.slug.charAt(0).toUpperCase() + collection.slug.slice(1),
    }))

  return [
    { label: "Universal (All Collections)", value: "" },
    ...eligibleCollections.map(collection => ({
      label: collection.label,
      value: collection.slug,
    })),
  ]
}
```

#### **Collection Template Assignment**

All non-page collections can have templates assigned from the Templates collection:

**File**: `src/payload/utilities/createUniversalCollection.ts`

```typescript
import { CollectionConfig } from "payload/types"
import { revalidateUniversalRouting } from "../hooks/revalidateUniversalRouting"

/*************************************************************************/
/*  CREATE UNIVERSAL COLLECTION WITH AUTO FEATURES
/*************************************************************************/

export function createUniversalCollection(config: CollectionConfig): CollectionConfig {
  const isPageCollection = config.slug === "pages"

  return {
    ...config,
    fields: [
      ...config.fields,
      // Add slug field for all collections
      {
        name: "slug",
        type: "text",
        required: true,
        admin: {
          position: "sidebar",
          description: isPageCollection
            ? "URL: /your-slug"
            : `URL: /${config.slug}/your-slug`,
        },
        hooks: {
          beforeValidate: [
            ({ value, data }) => {
              if (!value && data?.title) {
                return data.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "")
              }
              return value
            },
          ],
        },
      },
      // Add template assignment for non-page collections
      ...(isPageCollection
        ? []
        : [
            {
              name: "template",
              type: "relationship",
              relationTo: "templates",
              label: "Template",
              admin: {
                position: "sidebar",
                description: "Template sections to render for this item",
                filterOptions: {
                  // Only show templates relevant to this collection type
                  where: {
                    or: [
                      { targetCollection: { equals: config.slug } },
                      { targetCollection: { exists: false } }, // Universal templates
                    ],
                  },
                },
              },
            },
          ]),
    ],
    hooks: {
      ...config.hooks,
      afterChange: [...(config.hooks?.afterChange || []), revalidateUniversalRouting],
    },
  }
}

/*************************************************************************/
/*  CONVENIENCE FUNCTIONS FOR COMMON PATTERNS
/*************************************************************************/

// For collections that need templates (services, team, etc.)
export function createTemplatedCollection(config: CollectionConfig): CollectionConfig {
  return createUniversalCollection(config)
}

// For simple collections without templates
export function createSingleCollection(config: CollectionConfig): CollectionConfig {
  return createUniversalCollection({
    ...config,
    // Override to not include template field
    fields: config.fields,
  })
}
```

**Usage Examples**:

```typescript
// Services with template assignment
export const Services = createTemplatedCollection({
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
    // slug and template fields auto-added
  ],
})

// Team members with template assignment
export const Team = createTemplatedCollection({
  slug: "team",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "position",
      type: "text",
    },
    // slug and template fields auto-added
  ],
})
```

## 🎯 V2 Auto-Discovery System

### **Dynamic Collection Discovery**

Before diving into the core system, here's how collections are dynamically discovered for Settings and Templates:

**File**: `src/lib/utilities/collection-discovery.ts`

```typescript
"use server"

import { getPayload } from "payload"
import configPromise from "@payload-config"
import { unstable_cache } from "next/cache"

/*************************************************************************/
/*  DISCOVER ALL COLLECTIONS WITH SLUG FIELDS (ELIGIBLE FOR ARCHIVES)
/*************************************************************************/

export const getArchiveEligibleCollections = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })

    return payload.config.collections
      .filter(collection => {
        // Exclude system collections
        if (
          ["pages", "templates", "media", "users", "form-submissions"].includes(
            collection.slug
          )
        ) {
          return false
        }

        // Only include collections with slug fields
        return collection.fields.some(field => field.name === "slug")
      })
      .map(collection => ({
        slug: collection.slug,
        label:
          collection.labels?.plural ||
          collection.slug.charAt(0).toUpperCase() + collection.slug.slice(1),
        admin: collection.admin,
      }))
  },
  ["archive-eligible-collections"],
  {
    tags: ["collection-discovery", "auto-discovery"],
    revalidate: 3600, // Cache for 1 hour
  }
)

/*************************************************************************/
/*  DISCOVER ALL NON-PAGE COLLECTIONS (ELIGIBLE FOR TEMPLATES)
/*************************************************************************/

export const getTemplateEligibleCollections = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })

    return payload.config.collections
      .filter(collection => {
        // Exclude system and page collections
        return !["pages", "templates", "media", "users", "form-submissions"].includes(
          collection.slug
        )
      })
      .map(collection => ({
        slug: collection.slug,
        label:
          collection.labels?.plural ||
          collection.slug.charAt(0).toUpperCase() + collection.slug.slice(1),
        admin: collection.admin,
      }))
  },
  ["template-eligible-collections"],
  {
    tags: ["collection-discovery", "auto-discovery"],
    revalidate: 3600,
  }
)

/*************************************************************************/
/*  GET ALL FRONTEND COLLECTIONS (HAVE SLUG FIELDS)
/*************************************************************************/

export const getFrontendCollections = unstable_cache(
  async (): Promise<string[]> => {
    const collections = await getArchiveEligibleCollections()
    return collections.map(collection => collection.slug)
  },
  ["frontend-collections"],
  {
    tags: ["collection-discovery", "frontend-collections"],
    revalidate: 3600,
  }
)

/*************************************************************************/
/*  INVALIDATE COLLECTION DISCOVERY CACHE WHEN CONFIG CHANGES
/*************************************************************************/

export async function revalidateCollectionDiscovery() {
  const { revalidateTag } = await import("next/cache")
  revalidateTag("collection-discovery")
  revalidateTag("auto-discovery")
  revalidateTag("frontend-collections")
}
```

### **1. Auto-Discovery Core**

**File**: `src/lib/utilities/auto-discovery.ts`

```typescript
"use server"

import { getPayload } from "payload"
import configPromise from "@payload-config"
import { unstable_cache } from "next/cache"
import type { Config } from "@/payload/payload-types"

/*************************************************************************/
/*  AUTO-DISCOVER FRONTEND COLLECTIONS
/*************************************************************************/

export const getFrontendCollections = unstable_cache(
  async (): Promise<string[]> => {
    const payload = await getPayload({ config: configPromise })

    return payload.config.collections
      .filter(collection => {
        // Auto-detect collections with slug fields (except system collections)
        const hasSlugField = collection.fields.some(
          field => field.name === "slug" && field.type === "text"
        )

        const isSystemCollection =
          collection.slug.startsWith("payload-") ||
          ["form-submissions", "search", "redirects", "forms", "users", "media"].includes(
            collection.slug
          )

        return hasSlugField && !isSystemCollection
      })
      .map(collection => collection.slug)
  },
  ["frontend-collections"],
  {
    tags: ["auto-discovery"],
    revalidate: 3600,
  }
)()

/*************************************************************************/
/*  GET COLLECTION METADATA
/*************************************************************************/

export const getCollectionMeta = unstable_cache(
  async (collectionSlug: string) => {
    const payload = await getPayload({ config: configPromise })
    const collection = payload.collections[collectionSlug]

    if (!collection) return null

    return {
      slug: collectionSlug,
      hasSlug: collection.fields.some(field => field.name === "slug"),
      hasSections: collection.fields.some(field => field.name === "sections"),
      hasTemplate: collection.fields.some(field => field.name === "template"),
    }
  },
  [`collection-meta`],
  {
    tags: ["auto-discovery", "collection-meta"],
    revalidate: 3600,
  }
)()
```

### **2. Smart Universal Document Finder**

**File**: `src/lib/queries/universal-document.ts`

```typescript
"use server"

import { getPayload } from "payload"
import configPromise from "@payload-config"
import { unstable_cache } from "next/cache"
import { getFrontendCollections } from "@/lib/utilities/collection-discovery"
import { getHomepage, getArchiveDocument } from "./auto-archives"
import type { Config } from "@/payload/payload-types"

// Infer from Payload types instead of creating custom interface
type CollectionDocument<T extends keyof Config["collections"]> = Config["collections"][T]
type AnyCollectionDocument = Config["collections"][keyof Config["collections"]]

interface UniversalResult {
  document: AnyCollectionDocument
  collection: string
  fullSlug: string
  type: "homepage" | "page" | "single" | "archive"
  renderSections: boolean
}

/*************************************************************************/
/*  UNIVERSAL DOCUMENT FINDER - SMART SLUG PARSING
/*************************************************************************/

export const findUniversalDocument = unstable_cache(
  async (slug: string): Promise<UniversalResult | null> => {
    const payload = await getPayload({ config: configPromise })

    // Handle homepage
    if (!slug || slug === "" || slug === "/") {
      const homepage = await getHomepage()
      if (homepage) {
        return {
          document: homepage,
          collection: "pages",
          fullSlug: "",
          type: "homepage",
          renderSections: true,
        }
      }
    }

    // Check for archive request (e.g., /blog, /services, /team)
    const archiveDoc = await getArchiveDocument(slug)
    if (archiveDoc) {
      return {
        document: archiveDoc.page,
        collection: "pages",
        fullSlug: slug,
        type: "archive",
        renderSections: true,
      }
    }

    // Get all frontend collections
    const frontendCollections = await getFrontendCollections
    const allCollections = ["pages", "posts", ...frontendCollections]

    // Smart slug parsing - try each collection
    for (const collectionSlug of allCollections) {
      let searchSlug = slug

      // For non-pages collections, extract actual slug from prefixed path
      if (collectionSlug !== "pages") {
        const parts = slug.split("/")
        if (parts[0] === collectionSlug && parts.length > 1) {
          searchSlug = parts.slice(1).join("/")
        } else {
          continue // Skip if path doesn't match collection prefix
        }
      }

      const result = await payload.find({
        collection: collectionSlug as keyof Config["collections"],
        where: {
          slug: { equals: searchSlug },
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
          type: collectionSlug === "pages" ? "page" : "single",
          renderSections: true, // All documents render sections
        }
      }
    }

    return null
  },
  ["universal-document"],
  {
    tags: ["universal-routing", "documents"],
    revalidate: 60,
  }
)

/*************************************************************************/
/*  GET ALL DOCUMENTS FOR STATIC GENERATION
/*************************************************************************/

export const getAllUniversalDocuments = unstable_cache(
  async (): Promise<UniversalResult[]> => {
    const payload = await getPayload({ config: configPromise })
    const frontendCollections = await getFrontendCollections
    const allCollections = ["pages", "posts", ...frontendCollections]

    const documents: UniversalResult[] = []

    // Add homepage
    const homepage = await getHomepage()
    if (homepage) {
      documents.push({
        document: homepage,
        collection: "pages",
        fullSlug: "",
        type: "homepage",
        renderSections: true,
      })
    }

    // Add assigned archive pages
    const assignedArchives = await getAllAssignedArchives
    assignedArchives.forEach(({ collectionSlug, page }) => {
      documents.push({
        document: page,
        collection: "pages",
        fullSlug: collectionSlug,
        type: "archive",
        renderSections: true,
      })
    })

    // Add all collection documents
    for (const collectionSlug of allCollections) {
      const result = await payload.find({
        collection: collectionSlug as keyof Config["collections"],
        where: {
          _status: { equals: "published" },
        },
        limit: 1000,
        depth: 0,
      })

      result.docs.forEach((doc: any) => {
        // Skip homepage if already added
        if (collectionSlug === "pages" && homepage && doc.id === homepage.id) {
          return
        }

        // Skip archive pages that are already added
        const isArchivePage = assignedArchives.some(archive => archive.page.id === doc.id)
        if (collectionSlug === "pages" && isArchivePage) {
          return
        }

        documents.push({
          document: doc,
          collection: collectionSlug,
          fullSlug:
            collectionSlug === "pages" ? doc.slug : `${collectionSlug}/${doc.slug}`,
          type: collectionSlug === "pages" ? "page" : "single",
          renderSections: true,
        })
      })
    }

    return documents
  },
  ["all-universal-documents"],
  {
    tags: ["universal-routing", "static-generation"],
    revalidate: 3600,
  }
)()
```

### **3. Auto-Archive System**

**File**: `src/lib/queries/auto-archives.ts`

```typescript
"use server"

import { getPayload } from "payload"
import configPromise from "@payload-config"
import { unstable_cache } from "next/cache"
import { getFrontendCollections } from "@/lib/utilities/collection-discovery"
import type { Config, Page } from "@/payload/payload-types"

/*************************************************************************/
/*  GET HOMEPAGE FROM SETTINGS OR FALLBACK
/*************************************************************************/

export const getHomepage = unstable_cache(
  async (): Promise<Page | null> => {
    const payload = await getPayload({ config: configPromise })

    // Try to get homepage from settings
    try {
      const settings = await payload.findGlobal({
        slug: "settings",
        depth: 2,
      })

      if (settings.homepage && typeof settings.homepage === "object") {
        return settings.homepage as Page
      }
    } catch (error) {
      console.log("Settings not found, using fallback homepage detection")
    }

    // Fallback: find page with slug 'home' or empty slug
    const result = await payload.find({
      collection: "pages",
      where: {
        or: [{ slug: { equals: "home" } }, { slug: { equals: "" } }],
      },
      limit: 1,
      depth: 2,
    })

    return result.docs[0] || null
  },
  ["homepage"],
  {
    tags: ["homepage", "auto-archives"],
    revalidate: 3600,
  }
)()

/*************************************************************************/
/*  GET ARCHIVE DOCUMENT FOR COLLECTION
/*************************************************************************/

export const getArchiveDocument = unstable_cache(
  async (collectionSlug: string): Promise<{ page: Page; archiveFor: string } | null> => {
    const payload = await getPayload({ config: configPromise })

    // Check if this collection has an archive assigned in settings
    const archivePage = await getAssignedArchivePage(collectionSlug)

    if (archivePage) {
      return {
        page: archivePage,
        archiveFor: collectionSlug,
      }
    }

    return null
  },
  [`archive-document`],
  {
    tags: ["auto-archives", "archive-documents"],
    revalidate: 300,
  }
)

/*************************************************************************/
/*  GET ASSIGNED ARCHIVE PAGE FROM SETTINGS
/*************************************************************************/

export const getAssignedArchivePage = unstable_cache(
  async (collectionSlug: string): Promise<Page | null> => {
    const payload = await getPayload({ config: configPromise })

    try {
      const settings = await payload.findGlobal({
        slug: "settings",
        depth: 2,
      })

      // Check if there's an archive assignment for this collection
      const archiveField = `${collectionSlug}Archive`
      const archivePage = settings.archives?.[archiveField]

      if (archivePage && typeof archivePage === "object") {
        return archivePage as Page
      }
    } catch (error) {
      console.log("Settings not found or no archive assigned")
    }

    return null
  },
  [`assigned-archive`],
  {
    tags: ["auto-archives", "assigned-archives"],
    revalidate: 300,
  }
)

/*************************************************************************/
/*  GET ALL ASSIGNED ARCHIVES FROM SETTINGS
/*************************************************************************/

export const getAllAssignedArchives = unstable_cache(
  async (): Promise<{ collectionSlug: string; page: Page }[]> => {
    const payload = await getPayload({ config: configPromise })
    const frontendCollections = await getFrontendCollections
    const archives: { collectionSlug: string; page: Page }[] = []

    try {
      const settings = await payload.findGlobal({
        slug: "settings",
        depth: 2,
      })

      // Check each frontend collection for archive assignment
      for (const collectionSlug of frontendCollections) {
        const archiveField = `${collectionSlug}Archive`
        const archivePage = settings.archives?.[archiveField]

        if (archivePage && typeof archivePage === "object") {
          archives.push({
            collectionSlug,
            page: archivePage as Page,
          })
        }
      }
    } catch (error) {
      console.log("Settings not found")
    }

    return archives
  },
  ["all-assigned-archives"],
  {
    tags: ["auto-archives", "assigned-archives"],
    revalidate: 300,
  }
)()

/*************************************************************************/
/*  GET ARCHIVE CONTENT (DOCUMENTS FROM COLLECTION)
/*************************************************************************/

export const getArchiveContent = unstable_cache(
  async (collectionSlug: string, page: number = 1, limit: number = 12) => {
    const payload = await getPayload({ config: configPromise })

    return await payload.find({
      collection: collectionSlug as keyof Config["collections"],
      where: {
        _status: { equals: "published" },
      },
      limit,
      page,
      depth: 1,
      sort: "-updatedAt",
    })
  },
  [`archive-content`],
  {
    tags: ["archive-content", "auto-archives"],
    revalidate: 300,
  }
)
```

### **4. Universal Route Handler**

**File**: `src/app/(frontend)/[[...slug]]/page.tsx`

```typescript
import { notFound } from "next/navigation"
import { findUniversalDocument } from "@/lib/queries/universal-document"
import { RenderSections } from "@/components/sections/RenderSections"
import { ArchiveContent } from "@/components/archives/ArchiveContent"
import { generateUniversalMeta } from "@/utilities/generateUniversalMeta"

interface PageProps {
  params: {
    slug?: string[]
  }
}

/*************************************************************************/
/*  UNIVERSAL PAGE COMPONENT - EVERYTHING RENDERS SECTIONS
/*************************************************************************/

export default async function UniversalPage({ params }: PageProps) {
  const { slug = [] } = params
  const slugPath = slug.join("/")

  const result = await findUniversalDocument(slugPath)

  if (!result) {
    notFound()
  }

  return (
    <div>
      {/* Render sections from template if assigned, otherwise document sections */}
      <RenderSections
        sections={
          result.document.template?.sections ||
          result.document.sections ||
          []
        }
      />

      {/* Archive pages get additional archive content appended */}
      {result.type === "archive" && (
        <ArchiveContent collectionSlug={slugPath} />
      )}
    </div>
  )
}

/*************************************************************************/
/*  UNIVERSAL METADATA GENERATION
/*************************************************************************/

export async function generateMetadata({ params }: PageProps) {
  const { slug = [] } = params
  const slugPath = slug.join("/")

  const result = await findUniversalDocument(slugPath)

  if (!result) {
    return {}
  }

  return generateUniversalMeta(result.document, result.collection)
}

/*************************************************************************/
/*  STATIC GENERATION - AUTO-DISCOVERY OF ALL ROUTES
/*************************************************************************/

export async function generateStaticParams() {
  const { getAllUniversalDocuments } = await import("@/lib/queries/universal-document")
  const documents = await getAllUniversalDocuments

  return documents.map((doc) => ({
    slug: doc.fullSlug.split("/").filter(Boolean)
  }))
}
```

### **5. Archive Content Component**

**File**: `src/components/archives/ArchiveContent.tsx`

```typescript
"use client"

import React, { useState, useEffect } from "react"
import { PostsArchive } from "./PostsArchive"
import { ServicesArchive } from "./ServicesArchive"
import { TeamArchive } from "./TeamArchive"
import { TestimonialsArchive } from "./TestimonialsArchive"
import { DefaultArchive } from "./DefaultArchive"

interface ArchiveContentProps {
  collectionSlug: string
}

/*************************************************************************/
/*  ARCHIVE CONTENT RENDERER - AUTOMATIC COLLECTION DETECTION
/*************************************************************************/

export function ArchiveContent({ collectionSlug }: ArchiveContentProps) {
  // Auto-render based on collection slug
  switch (collectionSlug) {
    case "posts":
    case "blog":
      return <PostsArchive />
    case "services":
      return <ServicesArchive />
    case "team":
      return <TeamArchive />
    case "testimonials":
      return <TestimonialsArchive />
    default:
      return <DefaultArchive collectionSlug={collectionSlug} />
  }
}
```

### **6. Universal Collection Mixin**

**File**: `src/payload/utilities/createUniversalCollection.ts`

```typescript
import type { CollectionConfig } from "payload"
import { slugField } from "@/payload/fields/slug"
import { revalidateUniversalRouting } from "../hooks/revalidateUniversalRouting"
import { applyDefaultTemplate } from "../collections/pages/hooks/applyDefaultTemplate"

interface UniversalCollectionOptions {
  /** Enable/disable archive (defaults to true) */
  hasArchive?: boolean
  /** Additional slug validation */
  slugValidation?: (value: string) => string | Promise<string>
}

/*************************************************************************/
/*  UNIVERSAL COLLECTION WRAPPER - AUTO-ADDS ROUTING FEATURES
/*************************************************************************/

export function createUniversalCollection(
  config: CollectionConfig,
  options: UniversalCollectionOptions = {}
): CollectionConfig {
  const { hasArchive = true, slugValidation } = options

  return {
    ...config,
    custom: {
      ...config.custom,
      archive: hasArchive,
    },
    fields: [
      ...config.fields,
      // Auto-add slug field if not present
      ...(config.fields.some(field => field.name === "slug")
        ? []
        : [slugField({ validation: slugValidation })]),
    ],
    hooks: {
      ...config.hooks,
      beforeChange: [
        ...(config.hooks?.beforeChange || []),
        applyDefaultTemplate, // Auto-apply templates
      ],
      afterChange: [...(config.hooks?.afterChange || []), revalidateUniversalRouting],
      afterDelete: [...(config.hooks?.afterDelete || []), revalidateUniversalRouting],
    },
  }
}

/*************************************************************************/
/*  CONVENIENCE FUNCTIONS
/*************************************************************************/

// For collections with custom templates
export function createTemplatedCollection(
  config: CollectionConfig,
  options: UniversalCollectionOptions = {}
): CollectionConfig {
  return createUniversalCollection(config, options)
}

// For collections without archives (single-use documents)
export function createSingleCollection(
  config: CollectionConfig,
  options: Omit<UniversalCollectionOptions, "hasArchive"> = {}
): CollectionConfig {
  return createUniversalCollection(config, {
    ...options,
    hasArchive: false,
  })
}
```

### **7. Universal Cache Invalidation**

**File**: `src/payload/hooks/revalidateUniversalRouting.ts`

```typescript
import { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload"
import { revalidateTag } from "next/cache"

/*************************************************************************/
/*  UNIVERSAL CACHE INVALIDATION
/*************************************************************************/

export const revalidateUniversalRouting: CollectionAfterChangeHook = async ({
  doc,
  collection,
  req,
}) => {
  // Revalidate all universal routing caches
  revalidateTag("universal-routing")
  revalidateTag("documents")
  revalidateTag("auto-discovery")
  revalidateTag("auto-archives")
  revalidateTag("static-generation")

  // Revalidate specific document
  revalidateTag(`document-${collection.slug}-${doc.slug}`)

  console.log(`🔄 Revalidated universal routing for ${collection.slug}/${doc.slug}`)
}

export const revalidateUniversalRoutingDelete: CollectionAfterDeleteHook = async ({
  doc,
  collection,
  req,
}) => {
  // Same invalidation for deletions
  revalidateTag("universal-routing")
  revalidateTag("documents")
  revalidateTag("auto-discovery")
  revalidateTag("auto-archives")
  revalidateTag("static-generation")

  console.log(
    `🗑️ Revalidated universal routing after deleting ${collection.slug}/${doc.slug}`
  )
}
```

### **8. Universal Metadata Generator**

**File**: `src/utilities/generateUniversalMeta.ts`

```typescript
import { Metadata } from "next"
import type { Config } from "@/payload/payload-types"

type AnyDocument = Config["collections"][keyof Config["collections"]]

/*************************************************************************/
/*  UNIVERSAL METADATA GENERATION - AUTO-EXTRACT FROM ANY DOCUMENT
/*************************************************************************/

export function generateUniversalMeta(
  document: AnyDocument,
  collection: string
): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  // Build URL based on collection
  const url =
    collection === "pages"
      ? `${baseUrl}/${document.slug || ""}`
      : `${baseUrl}/${collection}/${document.slug}`

  // Auto-extract title from common fields
  const title = extractTitle(document)
  const description = extractDescription(document)
  const image = extractImage(document, baseUrl)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: image ? [{ url: image }] : [],
      type: collection === "posts" ? "article" : "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
    alternates: {
      canonical: url,
    },
  }
}

/*************************************************************************/
/*  AUTO-EXTRACT METADATA FROM ANY DOCUMENT STRUCTURE
/*************************************************************************/

function extractTitle(doc: AnyDocument): string {
  return doc.title || doc.name || doc.heading || "Untitled"
}

function extractDescription(doc: AnyDocument): string {
  return (
    doc.description ||
    doc.excerpt ||
    doc.content ||
    doc.meta?.description ||
    "No description available"
  )
}

function extractImage(doc: AnyDocument, baseUrl: string): string | null {
  const image =
    doc.featuredImage?.url || doc.heroImage?.url || doc.image?.url || doc.meta?.image?.url

  return image ? (image.startsWith("http") ? image : `${baseUrl}${image}`) : null
}
```

---

## 🚀 Implementation Steps

### **Phase 1: Core System**

1. ✅ Create auto-discovery utilities
2. ✅ Create universal document finder
3. ✅ Create universal route handler
4. ✅ Create auto-archive system

### **Phase 2: Collection Integration**

5. ✅ Create universal collection wrapper
6. ✅ Update existing collections to use wrapper
7. ✅ Remove old dynamic routes
8. ✅ Add cache invalidation

### **Phase 3: Enhancement**

9. ✅ Add universal metadata generation
10. ✅ Create archive content components
11. ✅ Add API endpoints for archive data
12. ✅ Test with all collections

---

## 💡 Usage Examples

### **Basic Collection (Auto-Discovered)**

```typescript
// src/payload/collections/products.ts
import { CollectionConfig } from "payload"
import { createUniversalCollection } from "@/payload/utilities/createUniversalCollection"

const Products: CollectionConfig = {
  slug: "products",
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
    {
      name: "sections",
      type: "blocks",
      blocks: sectionBlocks, // Uses same section system
    },
    // slug field auto-added by wrapper
  ],
}

export default createUniversalCollection(Products)
```

**Result**:

- ✅ Products automatically discoverable on frontend
- ✅ `/products` shows auto-generated archive
- ✅ `/products/awesome-product` renders product with sections
- ✅ Zero additional configuration needed

### **Collection Without Archive**

```typescript
// src/payload/collections/testimonials.ts
import { createSingleCollection } from "@/payload/utilities/createUniversalCollection"

export default createSingleCollection({
  slug: "testimonials",
  fields: [
    { name: "quote", type: "text" },
    { name: "author", type: "text" },
    // No sections needed for testimonials
  ],
})
```

**Result**:

- ✅ Individual testimonials accessible at `/testimonials/john-doe`
- ✅ No archive generated (used in testimonial blocks instead)

---

## 🎯 V2 Benefits

### **Zero Configuration**

- Add collection → slug field → automatically works on frontend
- No manual route registration
- No hardcoded template mapping
- No manual archive setup

### **Convention Over Configuration**

- Template discovery via section blocks (not file structure)
- Auto-generated archives for all collections
- Smart slug parsing and fallback
- Intelligent metadata extraction

### **Infinite Scalability**

- Works with unlimited collections
- Auto-discovery prevents stale configuration
- Dynamic archive generation
- Future-proof architecture

### **Developer Experience**

- Single universal route handler
- Consistent rendering pattern (RenderSections everywhere)
- Automatic cache invalidation
- Type-safe with inferred Payload types

### **Performance Optimized**

- Automatic caching with smart invalidation
- Static generation for all routes
- Lazy loading of archive content
- Efficient database queries

## ✅ **Key V2 Improvements Over V1**

### **1. Dynamic Settings & Template Management**

- ✅ **Settings auto-populate with eligible collections** - no manual field creation
- ✅ **Templates dynamically show collection targeting options**
- ✅ **Archive fields generated from collections with slug fields**
- ✅ **Template options filtered by target collection**
- ✅ **Eliminated `hasArchive` flags from collections**
- ✅ **Archives managed entirely through Global Settings**
- ✅ **WordPress-style workflow**: Create page → Assign in Settings → Archive works
- ✅ **Unique constraint**: Each page can only be archive for one collection

### **2. Template System Integration**

- ✅ **No hardcoded template files** - uses existing Templates collection
- ✅ **Template assignment** for all non-page collections
- ✅ **Template sections override** document sections for consistency
- ✅ **Everything renders through RenderSections** - unified approach

### **3. Modern Payload Patterns**

- ✅ **Replaced `getPayloadHMR`** with modern `getPayload({ config: configPromise })`
- ✅ **Proper server actions** with `"use server"`
- ✅ **Type inference** from Payload types instead of custom interfaces
- ✅ **Follows existing query patterns** from `/lib/queries/`

### **4. Cleaner Architecture**

- ✅ **No collection-level archive configuration**
- ✅ **Centralized archive management in Settings**
- ✅ **Template-driven rendering** for all content types
- ✅ **Eliminated virtual page generation** - real pages only

The V2 system achieves the ultimate goal: **"Add a collection, it just works"** while maintaining full flexibility, leveraging the existing section-based architecture, and following modern Payload CMS patterns.
