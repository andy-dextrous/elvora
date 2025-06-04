import type { Block } from "payload"
import { sectionCta } from "@/payload/fields/section-cta"

export const LatestArticles: Block = {
  slug: "latest-articles",
  admin: {
    group: "Content Sections",
  },
  interfaceName: "LatestArticlesBlock",
  fields: [
    sectionCta({
      collapsibleLabel: "Section CTA",
      textDescription: "Text that appears before the call-to-action button",
      linkDescription: "Button that links to view all articles or related content",
    }),
  ],
}
