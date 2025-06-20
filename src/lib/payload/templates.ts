"use server"

import { getPayload } from "payload"
import configPromise from "@payload-config"
import { unstable_cache } from "next/cache"

/*************************************************************************/
/*  GET DEFAULT TEMPLATE FOR COLLECTION
/*************************************************************************/

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
            { defaultForCollections: { contains: collection } },
          ],
        },
        sort: "name",
      })

      return result.docs?.[0] || null
    },
    [`default-template-${collection}`],
    {
      tags: ["templates", `default-template-${collection}`],
    }
  )()
}

/*************************************************************************/
/*  GET ALL TEMPLATES FOR COLLECTION
/*************************************************************************/

export async function getTemplatesForCollection(collection: string) {
  return unstable_cache(
    async () => {
      const payload = await getPayload({ config: configPromise })

      const result = await payload.find({
        collection: "templates",
        depth: 2,
        where: {
          applicableCollections: { contains: collection },
        },
        sort: "name",
        limit: 100,
      })

      return {
        templates: result.docs,
        defaultTemplate:
          result.docs.find((template: any) =>
            template.defaultForCollections?.includes(collection)
          ) || null,
      }
    },
    [`templates-${collection}`],
    {
      tags: ["templates", `templates-${collection}`],
    }
  )()
}

/*************************************************************************/
/*  VALIDATE NO CONFLICTING DEFAULT TEMPLATES
/*************************************************************************/

export async function validateDefaultTemplates(
  templateId: string,
  defaultForCollections: string[]
) {
  if (!defaultForCollections || defaultForCollections.length === 0) {
    return { isValid: true, conflicts: [] }
  }

  const payload = await getPayload({ config: configPromise })

  const conflicts = []

  for (const collection of defaultForCollections) {
    const existingDefaults = await payload.find({
      collection: "templates",
      where: {
        and: [
          { id: { not_equals: templateId } },
          { defaultForCollections: { contains: collection } },
        ],
      },
      limit: 10,
    })

    if (existingDefaults.docs.length > 0) {
      conflicts.push({
        collection,
        conflictingTemplates: existingDefaults.docs.map((template: any) => ({
          id: template.id,
          name: template.name,
        })),
      })
    }
  }

  return {
    isValid: conflicts.length === 0,
    conflicts,
  }
}
