import type { Block } from "payload"
import { sectionCta } from "@/payload/fields/section-cta"
import { sectionIntro } from "@/payload/fields/section-intro"

export const LatestArticles: Block = {
  slug: "latest-articles",
  admin: {
    group: "Content Sections",
  },
  interfaceName: "LatestArticlesBlock",
  fields: [
    sectionIntro({
      collapsibleLabel: "Section Content",
      headingDescription:
        "Main heading for the latest articles section. Use <span> tags for gradient text: 'Expert <span>Insights</span>'",
      descriptionDescription:
        "Brief description about your thought leadership and expertise that appears below the heading",
    }),
    sectionCta({
      collapsibleLabel: "Section CTA",
      textDescription: "Text that appears before the call-to-action button",
      buttonDescription: "Button that links to view all articles or related content",
    }),
  ],
}
