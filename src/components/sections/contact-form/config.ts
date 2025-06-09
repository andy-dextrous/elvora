import type { Block } from "payload"
import { sectionIntro } from "@/payload/fields/section-intro"

export const ContactForm: Block = {
  slug: "contact-form",
  interfaceName: "ContactFormBlock",
  admin: {
    group: "Content Sections",
  },
  fields: [
    sectionIntro({
      collapsibleLabel: "Section Introduction",
      headingDescription:
        "Main heading for the form section. Use <span> tags for gradient text.",
      descriptionDescription: "Brief description that appears above the form",
    }),
    {
      name: "form",
      type: "relationship",
      relationTo: "forms",
      required: true,
      admin: {
        description: "Select the form to display in this section",
      },
    },
  ],
}
