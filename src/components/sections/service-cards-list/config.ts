import type { Block } from "payload"
import { sectionIntro } from "@/payload/fields/section-intro"

export const ServiceCardsList: Block = {
  slug: "service-cards-list",
  admin: {
    group: "Homepage",
  },
  interfaceName: "ServiceCardsListBlock",
  fields: [
    sectionIntro({
      collapsibleLabel: "Content",
      headingDescription:
        "Main heading for the services section. Use <span> tags for gradient text: 'Commercial, Operational <span>& Technology Services</span>'",
      descriptionDescription: "Brief description of your services and value proposition",
    }),
  ],
}
