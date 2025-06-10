import type { Block } from "payload"
import { defaultLexical } from "@/payload/fields/default-lexical"

export const SimpleText: Block = {
  slug: "simple-text",
  interfaceName: "SimpleTextBlock",
  admin: {
    group: "Content Sections",
  },
  fields: [
    {
      name: "content",
      type: "richText",
      editor: defaultLexical,
      label: "Content",
      required: true,
    },
  ],
}
