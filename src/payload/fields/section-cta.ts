import type { Field } from "payload"
import { link } from "./link"
import { sectionCtaDefault } from "./default-values"

/*************************************************************************/
/*  SECTION CTA FIELD CONFIGURATION
/*************************************************************************/

export const sectionCta = (
  options: {
    textRequired?: boolean
    linkRequired?: boolean
    textDescription?: string
    linkDescription?: string
    collapsibleLabel?: string
    initCollapsed?: boolean
  } = {}
): Field => {
  const {
    textRequired = true,
    linkRequired = true,
    textDescription = "Call-to-action text that appears on the left side",
    linkDescription = "Button link that appears on the right side",
    collapsibleLabel = "Section CTA",
    initCollapsed = false,
  } = options

  return {
    type: "collapsible",
    label: collapsibleLabel,
    admin: {
      initCollapsed,
    },
    fields: [
      {
        name: "text",
        type: "text",
        required: textRequired,
        defaultValue: sectionCtaDefault.text,
        admin: {
          description: textDescription,
        },
      },
      link({
        overrides: {
          name: "link",
          label: "CTA Link",
          defaultValue: sectionCtaDefault.link,
          admin: {
            description: linkDescription,
          },
        },
      }),
    ],
  }
}
