import { getPayload } from "payload"
import { cache } from "react"
import configPromise from "@payload-config"
import { Testimonial } from "@/payload/payload-types"
import { unstable_cache } from "next/cache"

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
  })

/*******************************************************/
/* Get Featured Testimonials
/*******************************************************/

export const getFeaturedTestimonials = cache(async () => {
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
})
