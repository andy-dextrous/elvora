import { CollectionConfig } from "payload"
import { anyone } from "@/payload/access/anyone"
import { canEditContent } from "@/payload/access/editor"
import { enableOnFrontend } from "@/payload/collections/frontend"

export const Team: CollectionConfig = enableOnFrontend({
  slug: "team",
  labels: {
    singular: "Team Member",
    plural: "Team Members",
  },
  access: {
    create: canEditContent,
    delete: canEditContent,
    read: anyone,
    update: canEditContent,
  },
  // Data collection - disable content-focused features
  seo: false, // No SEO needed for team members
  publishedAt: false, // No publishing workflow needed
  featuredImage: false, // Has custom "image" field instead
  livePreview: false, // No preview needed
  admin: {
    useAsTitle: "name", // Override default "title"
    description:
      "Team members are used to display the team on the website. They are different to users, which are used for the admin panel.",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "Job title or role within the company",
      },
    },
    {
      name: "bio",
      type: "textarea",
      admin: {
        description: "Brief biography or description of the team member",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Profile photo of the team member",
      },
    },
    {
      name: "email",
      type: "email",
      admin: {
        description: "Professional email address (optional)",
      },
    },
    {
      name: "socialLinks",
      type: "group",
      fields: [
        {
          name: "linkedin",
          type: "text",
          admin: {
            description: "LinkedIn profile URL",
          },
        },
        {
          name: "twitter",
          type: "text",
          admin: {
            description: "Twitter/X profile URL",
          },
        },
        {
          name: "website",
          type: "text",
          admin: {
            description: "Personal website URL",
          },
        },
      ],
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Display order (lower numbers appear first)",
        position: "sidebar",
      },
    },
  ],
})
