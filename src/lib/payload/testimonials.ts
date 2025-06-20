import { getPayload } from "payload"
import { unstable_cache } from "next/cache"
import configPromise from "@payload-config"
import { Testimonial } from "@/payload/payload-types"

/*******************************************************/
/* Get All Testimonials
/*******************************************************/

async function getTestimonialsInternal() {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: "testimonials",
    depth: 2,
    limit: 1000,
    pagination: false,
    sort: "-featured",
  })

  return result.docs || ([] as Testimonial[])
}

export const getTestimonials = () =>
  unstable_cache(async () => getTestimonialsInternal(), ["testimonials"], {
    tags: ["testimonials"],
  })()

/*******************************************************/
/* Get Featured Testimonials
/*******************************************************/

async function getFeaturedTestimonialsInternal() {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: "testimonials",
    depth: 2,
    limit: 1000,
    pagination: false,
    where: {
      featured: {
        equals: true,
      },
    },
    sort: "createdAt",
  })

  return result.docs || ([] as Testimonial[])
}

export const getFeaturedTestimonials = () =>
  unstable_cache(
    async () => getFeaturedTestimonialsInternal(),
    ["featured-testimonials"],
    {
      tags: ["testimonials"],
    }
  )()
