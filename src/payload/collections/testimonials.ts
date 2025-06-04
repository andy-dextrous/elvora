import { CollectionConfig } from "payload"
import { createRevalidationHooks } from "@/payload/hooks/revalidateCollection"

const { afterChange, afterDelete } = createRevalidationHooks({
  collectionSlug: "testimonials",
})

export const Testimonials: CollectionConfig = {
  slug: "testimonials",
  labels: {
    singular: "Testimonial",
    plural: "Testimonials",
  },
  admin: {
    useAsTitle: "name",
    description:
      "Client testimonials displayed on the website. Each testimonial includes a quote, client information, and company logo.",
  },
  fields: [
    {
      name: "quote",
      type: "textarea",
      required: true,
      admin: {
        description: "The testimonial quote from the client",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          admin: {
            description: "Full name of the person giving the testimonial",
          },
        },
        {
          name: "title",
          type: "text",
          required: true,
          admin: {
            description:
              "Job title of the person (e.g., 'Head of Digital Transformation')",
          },
        },
      ],
    },
    {
      name: "company",
      type: "text",
      required: true,
      admin: {
        description: "Company name",
      },
    },
    {
      name: "companyLogo",
      label: "Company Logo",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description:
          "Company logo image - will be displayed as a small icon in the testimonial",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Mark as featured to prioritize in displays",
      },
    },
  ],
  hooks: {
    afterChange: [afterChange],
    afterDelete: [afterDelete],
  },
}
