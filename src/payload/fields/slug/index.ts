import type { CheckboxField, TextField } from "payload"
import { formatSlugHook } from "./format-slug"
import { createURIHook } from "./create-uri"

type Overrides = {
  slugOverrides?: Partial<TextField>
  uriOverrides?: Partial<TextField>
  checkboxOverrides?: Partial<CheckboxField>
}

type Slug = (
  fieldToUse?: string,
  overrides?: Overrides
) => [TextField, TextField, CheckboxField]

export const slugField: Slug = (fieldToUse = "title", overrides = {}) => {
  const { slugOverrides, uriOverrides, checkboxOverrides } = overrides

  const checkBoxField: CheckboxField = {
    name: "slugLock",
    type: "checkbox",
    defaultValue: false,
    admin: {
      hidden: true,
      position: "sidebar",
    },
    ...checkboxOverrides,
  }

  // @ts-expect-error - ts mismatch Partial<TextField> with TextField
  const slugField: TextField = {
    name: "slug",
    type: "text",
    index: true,
    label: "Slug",
    ...(slugOverrides || {}),
    hooks: {
      beforeValidate: [formatSlugHook(fieldToUse)],
    },
    admin: {
      position: "sidebar",
      ...(slugOverrides?.admin || {}),
      components: {
        Field: {
          path: "@/payload/fields/slug/slug-component#SlugComponent",
          clientProps: {
            fieldToUse,
            checkboxFieldPath: checkBoxField.name,
          },
        },
      },
    },
  }

  // @ts-expect-error - ts mismatch Partial<TextField> with TextField
  const uriField: TextField = {
    name: "uri",
    type: "text",
    index: true,
    label: "URI",
    ...(uriOverrides || {}),
    hooks: {
      beforeValidate: [createURIHook()],
    },
    admin: {
      position: "sidebar",
      readOnly: true,
      description: "Auto-generated based on slug and routing settings",
      ...(uriOverrides?.admin || {}),
    },
  }

  return [slugField, uriField, checkBoxField]
}
