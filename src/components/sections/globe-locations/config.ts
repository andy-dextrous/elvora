import type { Block } from "payload"
import { sectionIntro } from "@/payload/fields/section-intro"

export const GlobeLocations: Block = {
  slug: "globe-locations",
  interfaceName: "GlobeLocationsBlock",
  admin: {
    group: "Content Sections",
  },
  fields: [
    sectionIntro({
      collapsibleLabel: "Section Intro",
      headingDescription:
        "Main heading for the locations section. Use <span> tags for gradient text.",
      descriptionDescription:
        "Brief description of your global presence and office locations",
    }),
  ],
}
