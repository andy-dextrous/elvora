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
}
