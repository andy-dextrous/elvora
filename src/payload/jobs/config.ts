import { PayloadRequest } from "payload"

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
      retries: 2,
      slug: "uri-sync",

      handler: async ({ job }: { job: any }) => {
        console.log("uri-syncing baby", job)

        // Do your URI sync logic here

        // Always return output object
        return {
          output: {
            success: true,
            processedAt: new Date().toISOString(),
          },
        }
      },
    },
  ],
}

export default jobs
