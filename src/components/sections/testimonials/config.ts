import type { Block } from "payload"
import { sectionIntro } from "@/payload/fields/section-intro"

export const Testimonials: Block = {
  slug: "testimonials",
  interfaceName: "TestimonialsBlock",
  admin: {
    group: "Content Sections",
  },
  fields: [
    sectionIntro({
      collapsibleLabel: "Content",
      headingDescription:
        "Main heading for testimonials. Use <span> tags for gradient text: 'Trusted By <span>Forward-Thinkers</span>'",
      descriptionDescription:
        "Brief description about your testimonials and client success stories",
    }),
  ],
}
