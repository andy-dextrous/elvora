import type { CollectionBeforeChangeHook } from "payload"
import { getDefaultTemplate } from "@/lib/payload/templates"

/*************************************************************************/
/*  EXTRACT IDS FROM POPULATED RELATIONSHIPS
/*************************************************************************/

function extractIds(data: any): any {
  if (!data) return data

  if (Array.isArray(data)) {
    return data.map(item => extractIds(item))
  }

  if (typeof data === "object" && data !== null) {
    // If it's a populated relationship (has id AND other media/relationship properties), return just the id
    if (
      data.id &&
      typeof data.id === "string" &&
      (data.filename || data.url || data.alt || data.mimeType)
    ) {
      return data.id
    }

    // Otherwise, recursively process the object's properties
    const result: any = {}
    for (const [key, value] of Object.entries(data)) {
      result[key] = extractIds(value)
    }
    return result
  }

  // Return primitives as-is
  return data
}

/*************************************************************************/
/*  APPLY DEFAULT TEMPLATE HOOK FACTORY
/*************************************************************************/

export function createApplyDefaultTemplateHook(
  collectionName: string
): CollectionBeforeChangeHook {
  return async ({ data, req, operation }) => {
    console.log(
      `🎯 Template Hook - Collection: ${collectionName}, Operation: ${operation}`
    )
    console.log(
      `🎯 Template Hook - Sections exist:`,
      !!data.sections,
      `Length:`,
      data.sections?.length || 0
    )

    // Only apply on create operations when no sections exist
    if (operation === "create" && (!data.sections || data.sections.length === 0)) {
      try {
        console.log(
          `🎯 Template Hook - Looking for default template for ${collectionName}`
        )
        const defaultTemplate = await getDefaultTemplate(collectionName)
        console.log(
          `🎯 Template Hook - Found template:`,
          !!defaultTemplate,
          `Sections:`,
          defaultTemplate?.sections?.length || 0
        )

        if (defaultTemplate?.sections) {
          // Extract IDs from populated relationships for server-side operation
          const sectionsWithIds = extractIds(defaultTemplate.sections)
          data.sections = sectionsWithIds
          console.log(
            `🎯 Template Hook - Applied ${defaultTemplate.sections.length} sections with extracted IDs`
          )
        } else {
          console.log(
            `🎯 Template Hook - No default template found for ${collectionName}`
          )
        }
      } catch (error) {
        console.error(`❌ Error applying default template for ${collectionName}:`, error)
        // Continue without template - don't block content creation
      }
    } else {
      console.log(
        `🎯 Template Hook - Skipping: operation=${operation}, sections=${data.sections?.length || 0}`
      )
    }

    return data
  }
}

/*************************************************************************/
/*  PAGES COLLECTION HOOK
/*************************************************************************/

export const applyDefaultTemplate = createApplyDefaultTemplateHook("pages")
