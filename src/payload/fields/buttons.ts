import deepMerge from "@/utilities/deepMerge"
import { link } from "@/payload/fields/link"
import type { Field } from "payload"

export const buttonsGroup = (overrides: Partial<Field> = {}): Field => {
  return deepMerge(
    {
      name: "buttons",
      type: "array",
      fields: [
        {
          name: "button",
          type: "group",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "buttonType",
                  type: "select",
                  label: "Button type",
                  defaultValue: "primary",
                  options: [
                    {
                      label: "Primary",
                      value: "primary",
                    },
                    {
                      label: "Secondary",
                      value: "secondary",
                    },
                    {
                      label: "Neutral",
                      value: "neutral",
                    },
                    {
                      label: "Dark",
                      value: "dark",
                    },
                    {
                      label: "Light",
                      value: "light",
                    },
                    {
                      label: "Outline Dark",
                      value: "outlineDark",
                    },
                    {
                      label: "Outline Light",
                      value: "outlineLight",
                    },
                  ],
                  admin: {
                    description: "Select the button type",
                    width: "50%",
                  },
                },
                {
                  name: "buttonSize",
                  type: "select",
                  label: "Button size",
                  defaultValue: "lg",
                  options: [
                    {
                      label: "Small",
                      value: "sm",
                    },
                    {
                      label: "Medium",
                      value: "md",
                    },
                    {
                      label: "Large",
                      value: "lg",
                    },
                    {
                      label: "Icon",
                      value: "icon",
                    },
                  ],
                  admin: {
                    description: "Select the button size",
                    width: "50%",
                  },
                },
              ],
            },
            link(),
          ],
          defaultValue: [
            {
              button: {
                buttonType: "primary",
                link: {
                  type: "custom",
                  newTab: true,
                  url: "google.com",
                  label: "Button 1",
                },
              },
            },
            {
              button: {
                buttonType: "dark",
                link: {
                  type: "custom",
                  newTab: true,
                  url: "google.com",
                  label: "Button 2",
                },
              },
            },
          ],
        },
      ],
    },
    overrides
  )
}

export const button = (overrides: Partial<Field> = {}): Field => {
  return deepMerge(
    {
      name: "button",
      type: "group",
      fields: [
        {
          name: "buttonType",
          type: "select",
          label: "Button type",
          defaultValue: "primary",
          options: [
            {
              label: "Primary",
              value: "primary",
            },
            {
              label: "Secondary",
              value: "secondary",
            },
            {
              label: "Neutral",
              value: "neutral",
            },
            {
              label: "Dark",
              value: "dark",
            },
            {
              label: "Light",
              value: "light",
            },
            {
              label: "Outline Dark",
              value: "outlineDark",
            },
            {
              label: "Outline Light",
              value: "outlineLight",
            },
          ],
          admin: {
            description: "Select the button type",
            width: "50%",
          },
        },
        link(),
      ],
    },
    overrides
  )
}
