"use server"

import { getPayload } from "payload"
import configPromise from "@payload-config"

/*******************************************************/
/* Get Unread Form Submissions Count
/*******************************************************/

export async function getUnreadFormSubmissionsCount(): Promise<number> {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: "form-submissions",
      where: {
        isRead: {
          equals: false,
        },
      },
      limit: 0, // We only need the count
      pagination: false,
    })

    return result.totalDocs
  } catch (error) {
    console.error("Error fetching unread form submissions count:", error)
    return 0
  }
}

/*******************************************************/
/* Mark Form Submissions as Read
/*******************************************************/

export async function markFormSubmissionsAsRead(submissionIds: string[]): Promise<void> {
  try {
    const payload = await getPayload({ config: configPromise })

    for (const id of submissionIds) {
      await payload.update({
        collection: "form-submissions",
        id,
        data: {
          isRead: true,
        },
      })
    }
  } catch (error) {
    console.error("Error marking form submissions as read:", error)
  }
}

/*******************************************************/
/* Mark All Form Submissions as Read
/*******************************************************/

export async function markAllFormSubmissionsAsRead(): Promise<void> {
  try {
    const payload = await getPayload({ config: configPromise })

    // First get all unread submissions
    const unreadSubmissions = await payload.find({
      collection: "form-submissions",
      where: {
        isRead: {
          equals: false,
        },
      },
      limit: 1000, // Reasonable batch size
    })

    // Mark them all as read
    for (const submission of unreadSubmissions.docs) {
      await payload.update({
        collection: "form-submissions",
        id: submission.id,
        data: {
          isRead: true,
        },
      })
    }
  } catch (error) {
    console.error("Error marking all form submissions as read:", error)
  }
}
