- A URI creation system for this site that is inspired by Wordpress.
- It should operate as a "first match wins" hierarchy across the app in this order:

🏠 1. HOMEPAGE
├─ URI: "" (empty)
└─ Source: Settings → homepage field

📄 2. PAGES (Any Depth)
├─ URI: /about -----> simple page
├─ URI: /services/web-design -----> page with parent page
├─ URI: /company/team/leadership -----> page with multiple parent pages

📂 3. DESIGNATED COLLECTION ARCHIVES (Single Segment)
├─ URI: /blog (posts collection, effectiveSlug = "blog")
├─ URI: /services (services collection, effectiveSlug = "services")
├─ URI: /articles (posts collection, effectiveSlug = "articles")

📑 4. COLLECTION SINGLES (Two Segments)
├─ URI: /posts/my-first-post -----> Matches a post where the post collection has no blog archive set
├─ URI: /blog/my-first-post -----> Matches a post where the post collection has a designated page and its slug is "blog"
├─ URI: /insights/my-first-post -----> Matches a post where the post collection has a designated page and its slug is "insights"
├─ URI: /services/web-development

## URI Segment Construction Logic

### How settings work.

- The app is made up of collections
- Any collection that should be exposed to the front end via a URL needs to have a slug field in order to be matched
- Pages are the top level, fundamental collection and are the only collection type that can have a single segment as the slug. All others must have at least one parent segment.
- All other frontend collections (those with a slug), will calculate their URIs using the logic below.
- The site has a payload global called settings. In settings, there is a tab called routing. Routing is dedicated to slug matching and template assignment.
- At the top there is a Homepage select field and a Posts Page (like wordpress) select field.
- The

### For Collection Items (Non-Pages)

```
┌─ Collection Item URI Construction ─┐
│                                    │
├─ Does collection have archive page? ─┐
│  ├─ YES → Use archive page slug      │
│  └─ NO ─┐                           │
│         ├─ Has custom collection slug? ─┐
│         │  ├─ YES → Use custom slug     │
│         │  └─ NO → Use original collection slug
│         └─ Final: /[determined-slug]/[item-slug]
└────────────────────────────────────┘
```

### For Pages

```
┌─ Page URI Construction ─┐
│                         │
├─ Does page have parent? ─┐
│  ├─ YES ─┐               │
│  │       ├─ Does parent have parent? ─┐
│  │       │  ├─ YES → /grandparent/parent/page
│  │       │  └─ NO → /parent/page
│  │       └─ (recursive for any depth)
│  └─ NO → /page
└─────────────────────────┘
```

### Complete URI Decision Matrix

```
REQUEST URI: /segment1/segment2/segment3/...

🔍 SEGMENT ANALYSIS:
├─ segment1 = "" (empty) → HOMEPAGE
├─ segment1 only → PAGE
│  ├─ Match page slug? → PAGE
│  └─ Match collection archive? → COLLECTION ARCHIVE
└─ segment1 + segment2+ → NESTED PAGE or COLLECTION ITEM
   ├─ Does segment1/segment2/... build valid page path? → NESTED PAGE
   └─ Does segment1 = collection + segment2 = item? → COLLECTION ITEM

🏗️ CONSTRUCTION RULES:
├─ PAGES: Inherit full parent chain
│  └─ /parent/subparent/page
├─ COLLECTION ARCHIVES: Use designated page slug or collection default
│  └─ /[archive-page-slug OR collection-slug]
└─ COLLECTION ITEMS: Collection prefix + item slug
   └─ /[archive-page-slug OR custom-collection-slug OR collection-slug]/[item-slug]
```

### URI Segment Priority Chain

**For determining segment1:**

1. Archive page slug (if collection has designated archive page)
2. Custom collection slug (if set)
3. Original collection slug (fallback)
4. Page slug (for pages)
5. Parent page slug (for nested pages)

**For determining segment2+:**

1. Item slug (for collection items)
2. Child page slug (for nested pages)
3. Grandchild page slug (for deeply nested pages)
4. ...continues recursively

## URI Construction Via Hooks

- Eligible collections must have a hook that creates or updates the URI field.
- Needs to be pre-computed at build time, not run time.
- URI will live on the document itself as a hidden field.
- logic for determining a URI will live in a server action

## Rules

- URIs can potentially be duplicated in different parts of a site. For instance a collection could be called team-members and have a member called nancy ----> team-members/nancy. But a page could also be created with a slug of nancy and a parent page of team-members.
- For this reason we use a first-match-wins model. Priority order is determined by the order that collections are added to the payload config.
- A warning should appear when duplicates are created
- Optional redirects should be created when a slug/uri changes

## How breadcrumbs relate

- Breadcrumbs in the app will use the URI field to navigate up the tree
- It is technically possible for a collection to have no archive. This should be detected and the archive slug should be removed from the breadcrumbs to avoid a broken link
