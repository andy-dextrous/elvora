import { PayloadRequest } from "payload"
import { uriCascadeHandler } from "./uri-cascade-handler"

const jobs = {
  access: {
    run: ({ req }: { req: PayloadRequest }): boolean => {
      if (req.user) return true
      const authHeader = req.headers.get("authorization")
      return authHeader === `Bearer ${process.env.CRON_SECRET}`
    },
  },
  tasks: [
    {
      retries: 3,
      slug: "cascade-uris",
      handler: uriCascadeHandler,
      inputSchema: [
        {
          name: "operation",
          type: "text",
          required: true,
          label: "Cascade Operation Type",
        },
        {
          name: "entityId",
          type: "text",
          required: true,
          label: "Entity ID",
        },
        {
          name: "additionalData",
          type: "json",
          label: "Additional Data",
        },
      ],
      outputSchema: [
        {
          name: "success",
          type: "checkbox",
          label: "Operation Success",
        },
        {
          name: "documentsUpdated",
          type: "number",
          label: "Documents Updated",
        },
        {
          name: "redirectsCreated",
          type: "number",
          label: "Redirects Created",
        },
        {
          name: "cacheEntriesCleared",
          type: "number",
          label: "Cache Entries Cleared",
        },
        {
          name: "errors",
          type: "json",
          label: "Errors",
        },
        {
          name: "processedAt",
          type: "text",
          label: "Processed At",
        },
        {
          name: "operation",
          type: "text",
          label: "Operation Type",
        },
        {
          name: "impactSize",
          type: "number",
          label: "Impact Size",
        },
      ],
    },
  ],
}

export default jobs
