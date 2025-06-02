import type { Block } from "payload"

export const FullwidthCta: Block = {
  slug: "fullwidth-cta",
  interfaceName: "FullwidthCtaBlock",
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
