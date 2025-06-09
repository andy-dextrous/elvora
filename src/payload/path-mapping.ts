/*************************************************

Maps Collections to a collection slug which will
always be used as the path for the collection.

ie. posts -> "blog"

url: /blog/post-slug

*************************************************/

export const pathMapping: Record<string, string> = {
  pages: "",
  posts: "blog",
  services: "services",
  team: "team",
  locations: "locations",
  // Add more custom mappings as needed
}
