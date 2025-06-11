import type { CollectionBeforeChangeHook } from "payload"
import { getDefaultTemplate } from "@/lib/templates"

/*************************************************************************/
/*  APPLY DEFAULT TEMPLATE HOOK
/*************************************************************************/

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
