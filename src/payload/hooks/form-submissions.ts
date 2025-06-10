import type { CollectionAfterReadHook } from "payload"

/*******************************************************/
/* Mark Form Submissions as Read After Access
/*******************************************************/

export const markAsReadAfterRead: CollectionAfterReadHook = async ({
  doc,
  req: { payload },
}) => {
  // Only mark as read if it's currently unread
  if (!doc.isRead) {
    try {
      await payload.update({
        collection: "form-submissions",
        id: doc.id,
        data: {
          isRead: true,
        },
      })
    } catch (error) {
      console.error("Error marking form submission as read:", error)
    }
  }

  return doc
}
