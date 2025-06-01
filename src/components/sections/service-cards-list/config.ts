import type { Block } from "payload"

export const ServiceCardsList: Block = {
  slug: "service-cards-list",
  admin: {
    group: "Homepage",
  },
  interfaceName: "ServiceCardsListBlock",
  fields: [
    {
      name: "placeholder",
      type: "text",
      admin: {
        description: "Placeholder field - to be replaced with actual fields",
      },
    },
  ],
}
