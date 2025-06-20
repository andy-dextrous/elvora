import { Users } from "@/payload/collections/users"
import { Media } from "@/payload/collections/media"
import { Pages } from "@/payload/collections/pages"
import { Posts } from "@/payload/collections/posts"
import { Categories } from "@/payload/collections/categories"
import { Team } from "@/payload/collections/team"
import { Services } from "@/payload/collections/services"
import { Testimonials } from "@/payload/collections/testimonials"
import { Templates } from "@/payload/collections/templates"
import { CollectionConfig } from "payload"

/*************************************************************************/
/*  COLLECTIONS
/*************************************************************************/

const collections: CollectionConfig[] = [
  Pages,
  Posts,
  Team,
  Services,
  Testimonials,
  Templates,
  Media,
  Categories,
  Users,
]

/*************************************************************************/
/*  FRONTEND COLLECTIONS WITH SLUG FIELDS (DYNAMIC AUTO-DISCOVERY)
/*************************************************************************/

export const frontendCollections = collections
  .filter(collection => {
    if (["users", "media", "templates"].includes(collection.slug)) {
      return false
    }

    return collection.fields?.some(field => "name" in field && field.name === "slug")
  })
  .map(collection => ({
    slug: collection.slug,
    label: collection.slug.charAt(0).toUpperCase() + collection.slug.slice(1),
  }))

export default collections
