# Template System Implementation Plan

## Overview

Create a WordPress-inspired template system for Payload CMS that allows administrators to create reusable page layouts that can be "pasted" onto new content during creation. Templates work as a one-time starter kit rather than ongoing inheritance.

## Why This System

1. **Speed Up Content Creation**: Pre-built layouts for common page types
2. **Ensure Consistency**: Standardized starting points for different content types
3. **Reduce Errors**: Proven layouts with proper structure and default content
4. **Maintain Flexibility**: Full editing freedom after template application
5. **Content Type Specific**: Different templates for different purposes (services, landing pages, etc.)

## Core Concept

Templates are **starter kits** that paste pre-configured sections with default content into new pages/posts. Once applied, the template relationship is severed and all content becomes fully editable.

**Client-Side Template Loading**: Using [Payload's React hooks](https://payloadcms.com/docs/admin/react-hooks), templates load instantly in the admin interface without page refresh - providing a WordPress-like experience where template selection shows immediate visual feedback.

## Technical Architecture

### 1. Templates Collection

**File**: `src/payload/collections/templates/index.ts`

```typescript
export const Templates: CollectionConfig<"templates"> = {
  slug: "templates",
  access: {
    create: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "description", "applicableCollections", "updatedAt"],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "Template name (e.g. 'Service Page', 'Product Landing')",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "What this template is used for",
      },
    },
    {
      name: "applicableCollections",
      type: "select",
      hasMany: true,
      options: [
        { label: "Pages", value: "pages" },
        { label: "Services", value: "services" },
      ],
      admin: {
        description: "Which content types can use this template",
      },
    },
    {
      name: "sections",
      label: "Template Sections",
      type: "blocks",
      blocks: sectionBlocks,
      required: true,
      admin: {
        description: "Pre-configured sections with default content",
      },
    },
    {
      name: "isDefault",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Use as default template for applicable collections",
      },
    },
  ],
}
```

### 2. Template Server Actions

**File**: `src/lib/templates.ts`

```typescript
"use server"

import { getPayload } from "payload"
import configPromise from "@payload-config"
import { unstable_cache } from "next/cache"

export async function getDefaultTemplate(collection: string) {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })

      const result = await payload.find({
        collection: "templates",
        depth: 2,
        limit: 1,
        where: {
          and: [
            { applicableCollections: { contains: collection } },
            { isDefault: { equals: true } },
          ],
        },
      })

      return result.docs?.[0] || null
    },
    [`default-template-${collection}`],
    {
      tags: ["templates", `default-template-${collection}`],
    }
  )()
```

**Key Implementation Notes:**

- **Client-side template loading**: Uses [`usePayloadAPI`](https://payloadcms.com/docs/admin/react-hooks#usepayloadapi) to fetch templates directly from `/api/templates` endpoint
- **Immediate form updates**: Uses [`useAllFormFields`](https://payloadcms.com/docs/admin/react-hooks#useallformfields) to get `dispatchFields` method for instant section updates
- **Real-time visual feedback**: Form state updates immediately using [`dispatchFields`](https://payloadcms.com/docs/admin/react-hooks#updating-other-fields-values) with `UPDATE` action
- **WordPress-like UX**: No server round-trips needed for template selection - instant visual feedback

### 3. Enhanced Admin UI Components

**File**: `src/payload/components/backend/template-sidebar/index.tsx`

```typescript
"use client"

import React, { useState } from "react"
import { useAllFormFields, usePayloadAPI, Button } from "@payloadcms/ui"

export const TemplateSidebar: React.FC<{
  collection: string
}> = ({ collection }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch templates using Payload's usePayloadAPI hook
  const [{ data: templatesResponse, isLoading: templatesLoading }] = usePayloadAPI(
    `/api/templates`,
    {
      initialParams: {
        where: {
          applicableCollections: {
            contains: collection,
          },
        },
        limit: 100,
        sort: "name",
      },
    }
  )

  // Get form dispatch method for updating sections
  const [fields, dispatchFields] = useAllFormFields()

  const handleLoadTemplate = (templateSections: any[]) => {
    setIsLoading(true)

    try {
      // Deep clone sections to avoid reference issues and instantly update form
      const clonedSections = JSON.parse(JSON.stringify(templateSections))

      // Update the sections field in the form immediately (client-side)
      dispatchFields({
        type: "UPDATE",
        path: "sections",
        value: clonedSections,
      })

      setIsModalOpen(false)
    } catch (error) {
      console.error("Error loading template:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const templates = templatesResponse?.docs || []

  return (
    <div className="template-sidebar">
      <Button
        buttonStyle="secondary"
        size="small"
        onClick={() => setIsModalOpen(true)}
        disabled={templatesLoading || templates.length === 0}
      >
        {templatesLoading ? "Loading..." : "Load Template"}
      </Button>

      {isModalOpen && (
        <div className="template-modal">
          <div className="template-modal__content">
            <h3>Choose a Template</h3>
            <div className="template-grid">
              {templates.map((template: any) => (
                <div key={template.id} className="template-card">
                  <h4>{template.name}</h4>
                  <p>{template.description}</p>
                  <p className="template-sections-count">
                    {template.sections?.length || 0} sections
                  </p>
                  <Button
                    buttonStyle="primary"
                    size="small"
                    onClick={() => handleLoadTemplate(template.sections)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Use Template"}
                  </Button>
                </div>
              ))}
            </div>
            <Button
              buttonStyle="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 4. Modified Collections

#### Pages Collection Updates

**File**: `src/payload/collections/pages/index.ts`

Add template sidebar component to admin config:

```typescript
import { TemplateSidebar } from "@/payload/components/backend/template-sidebar"

export const Pages: CollectionConfig<"pages"> = {
  // ... existing config
  admin: {
    // ... existing admin config
    components: {
      views: {
        edit: {
          default: {
            // Add template loader to sidebar
            actions: [
              {
                Component: ({ data, collection }) => (
                  <TemplateSidebar collection="pages" />
                ),
              },
            ],
          },
        },
      },
    },
  },
  // ... rest of config
}
```

#### Services Collection Updates

**File**: `src/payload/collections/services/index.ts`

Similar template sidebar integration for services:

```typescript
import { TemplateSidebar } from "@/payload/components/backend/template-sidebar"

export const Services: CollectionConfig<"services"> = {
  // ... existing config
  admin: {
    // ... existing admin config
    components: {
      views: {
        edit: {
          default: {
            actions: [
              {
                Component: ({ data, collection }) => (
                  <TemplateSidebar collection="services" />
                ),
              },
            ],
          },
        },
      },
    },
  },
  hooks: {
    // ... existing hooks
    beforeChange: [applyDefaultTemplate], // Add default template hook
  },
  // ... rest of config
}
```

### 5. Template Application Hooks

**File**: `src/payload/collections/pages/hooks/applyDefaultTemplate.ts`

```typescript
import type { CollectionBeforeChangeHook } from "payload"
import { getDefaultTemplate } from "@/lib/templates"

export const applyDefaultTemplate: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  // Only apply on create operations when no sections exist
  if (operation === "create" && (!data.sections || data.sections.length === 0)) {
    try {
      const defaultTemplate = await getDefaultTemplate("pages")

      if (defaultTemplate?.sections) {
        data.sections = JSON.parse(JSON.stringify(defaultTemplate.sections))
      }
    } catch (error) {
      console.error("Error applying default template:", error)
      // Continue without template - don't block page creation
    }
  }

  return data
}
```

**File**: `src/payload/collections/services/hooks/applyDefaultTemplate.ts`

```typescript
import type { CollectionBeforeChangeHook } from "payload"
import { getDefaultTemplate } from "@/lib/templates"

export const applyDefaultTemplate: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
}) => {
  // Only apply on create operations when no sections exist
  if (operation === "create" && (!data.sections || data.sections.length === 0)) {
    try {
      const defaultTemplate = await getDefaultTemplate("services")

      if (defaultTemplate?.sections) {
        data.sections = JSON.parse(JSON.stringify(defaultTemplate.sections))
      }
    } catch (error) {
      console.error("Error applying default template:", error)
      // Continue without template - don't block service creation
    }
  }

  return data
}
```

### 6. Template Management

Templates will be created and managed directly through the Payload admin interface. Administrators can:

- Create new templates with predefined sections and default content
- Set applicable collections (pages, services)
- Mark templates as default for automatic application
- Edit template sections using the standard block editor
- Preview template layouts before applying

### 7. Template Integration Hook

**File**: `src/payload/collections/pages/index.ts`

```typescript
import { applyDefaultTemplate } from "./hooks/applyDefaultTemplate"

export const Pages: CollectionConfig<"pages"> = {
  // ... existing config
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt, applyDefaultTemplate], // Add default template hook
    afterDelete: [revalidateDelete],
    beforeOperation: [lockSlugAfterPublish],
  },
  // ... rest of config
}
```

## Implementation Steps

### Phase 1: Core Structure

1. Create Templates collection with basic fields
2. Add template loader UI component to admin
3. Implement template loading API endpoint
4. Test basic template creation and loading

### Phase 2: Integration

1. Integrate template loader into Pages collection
2. Add default template application hook
3. Create template card component
4. Test template application workflow

### Phase 3: Content & Polish

1. Create default templates for common page types
2. Add template preview functionality
3. Implement template management utilities
4. Create documentation for content creators

### Phase 4: Extension

1. Add template support to Posts collection
2. Create templates for different post types
3. Add template import/export functionality
4. Performance optimization

## File Structure

```
src/
├── lib/
│   └── templates.ts                    # Server actions for template operations
├── payload/
│   ├── collections/
│   │   ├── templates/
│   │   │   └── index.ts               # Templates collection config
│   │   ├── pages/
│   │   │   └── hooks/
│   │   │       └── applyDefaultTemplate.ts
│   │   └── services/
│   │       └── hooks/
│   │           └── applyDefaultTemplate.ts
│   └── components/
│       └── backend/
│           └── template-sidebar/
│               └── index.tsx          # Sidebar template loader component
```

## User Workflow

### For Administrators (Creating Templates)

1. Navigate to Templates collection
2. Click "Create New Template"
3. Set name, description, applicable collections
4. Build sections with default content using placeholders like `[Service Name]`
5. Set as default template if desired
6. Save template

### For Content Creators (Using Templates)

1. Create new page/post - default template automatically applies if one exists
2. Use "Load Template" button in sidebar to browse and select different templates
3. Click template to load sections - replaces existing sections with confirmation
4. Sections populate with default content from selected template
5. Edit all content as needed - no connection to original template
6. Template data becomes fully editable page content

## Benefits

1. **One-Time Application**: No ongoing template dependency
2. **Full Editing Freedom**: Complete control after template load
3. **Content Type Aware**: Different templates for different purposes
4. **Default Content**: Starter content reduces blank page syndrome
5. **Consistency**: Standardized layouts across content types
6. **Speed**: Rapid page/post creation with proven layouts

## Success Metrics

- Reduced time to create new pages/posts
- Increased consistency across content
- Higher content creator satisfaction
- Reduced support requests for layout help
- More pages using standardized structures

## Future Considerations

- Template versioning system
- Template sharing between environments
- Analytics on template usage
- A/B testing different template approaches
- Integration with design system updates
