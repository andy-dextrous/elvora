# Universal Routing Implementation Tasks

## Phase 1: Enhanced Slug Field with URI Generation

### Task 1.1: Enhance Slug Field Structure

- [x] Add hidden `uri` field to the `slugField()` return array in `src/payload/fields/slug/index.ts`
- [x] Create `src/payload/fields/slug/create-uri.ts` with universal URI generation logic
- [x] Update `slugField()` to return `[slugField, uriField, checkBoxField]`
- [x] Leverage existing `nestedDocsPlugin` breadcrumbs for parent hierarchy
- [x] Update TypeScript types for enhanced slug field structure

### Task 1.2: URI Generation Logic in Slug Field

- [x] Implement collection detection within URI hook (using collection context)
- [x] Add Pages-specific URI logic (use nestedDocsPlugin's `generateURL` for parent hierarchy)
- [x] Add Collection items logic (archive page/custom slug/default slug + item slug)
- [x] Create `getCollectionSettings()` function to read routing settings from global
- [x] Add URI validation and conflict detection utilities

### Task 1.3: URI Hook Integration

- [x] Add URI generation hook to slug field's existing hooks array
- [x] Ensure URI updates whenever slug or parent changes
- [x] Handle URI generation on both create and update operations
- [x] Add URI recalculation when routing settings change

### Task 1.4: Automatic Collection Integration

- [x] Verify all existing collections using `slugField()` automatically get URI functionality
- [x] Test URI generation across Pages (hierarchical), Posts, Services, Team, Testimonials
- [x] Confirm nestedDocsPlugin breadcrumbs work with new URI system
- [x] Update payload-types.ts to reflect URI field in all slug-enabled collections

## Phase 2: Universal Document Resolution

### Task 2.1: Build Document Resolution System

- [x] Create `src/lib/payload/universal-resolver.ts`
- [x] Implement `getDocumentByURI()` function with first-match-wins logic
- [x] Implement homepage resolution from settings
- [x] Implement single-segment page resolution (using existing slug field)
- [x] Implement single-segment collection archive resolution
- [x] Implement multi-segment nested page resolution (leverage nestedDocsPlugin)
- [x] Implement two-segment collection item resolution (using enhanced slug field URIs)

### Task 2.2: URI Migration & Bulk Update

- [ ] Create migration utility to populate URI fields for all existing content
- [ ] Add bulk URI regeneration for all collections with slug fields
- [ ] Create safe testing mechanism (database backup/restore)
- [ ] Test URI generation across all existing content
- [ ] Verify no URI conflicts in existing data

## Phase 3: Dynamic Routing Updates

### Task 3.1: Update Main Dynamic Route

- [ ] Modify `src/app/(frontend)/[slug]/page.tsx` to handle single segments
- [ ] Create `src/app/(frontend)/[...slug]/page.tsx` for multi-segment URIs (catch-all)
- [ ] Implement universal document resolution in route handlers
- [ ] Add proper TypeScript typing for resolved documents
- [ ] Update generateStaticParams for all URI patterns

### Task 3.2: Collection Archive Handling

- [ ] Create collection archive page component
- [ ] Update blog page to use universal resolution
- [ ] Create generic archive template system
- [ ] Implement pagination for archives
- [ ] Add SEO metadata generation for archives

### Task 3.3: Error Handling & Redirects

- [ ] Update `PayloadRedirects` component for URI-based redirects
- [ ] Add 404 handling for unresolved URIs
- [ ] Implement redirect creation on URI changes
- [ ] Add conflict resolution warnings in admin

## Phase 4: Enhanced Features

### Task 4.1: Smart Breadcrumbs

- [ ] Update `PostBreadcrumbs` component to use enhanced slug field URIs
- [ ] Leverage existing `nestedDocsPlugin` breadcrumbs for hierarchical pages
- [ ] Create universal `Breadcrumbs` component for all collections using plugin data
- [ ] Handle collection archives in breadcrumb chains
- [ ] Add breadcrumb schema.org markup

### Task 4.2: Link Generation Updates

- [ ] Update `CMSLink` component to use enhanced slug field URIs
- [ ] Modify rich text internal linking to use URIs from slug field
- [ ] Update navigation components for URI-based links
- [ ] Leverage existing `nestedDocsPlugin.generateURL` where possible
- [ ] Create `generateDocumentURL()` utility function as wrapper

### Task 4.3: Preview & Live Preview

- [ ] Update preview path generation to use enhanced slug field URIs
- [ ] Modify live preview listener for URI changes from slug field
- [ ] Test preview functionality across all collections
- [ ] Update admin bar links to use URIs from slug field

## Phase 5: Performance & Polish

### Task 5.1: Caching Strategy

- [x] Implement URI-based caching for document resolution
- [ ] Add cache invalidation on URI changes
- [x] Create cached routing settings retrieval
- [ ] Optimize database queries for URI lookups

### Task 5.2: Validation & Admin UX

- [ ] Add URI conflict detection in admin
- [ ] Create URI preview in collection admin
- [ ] Implement URI validation on save
- [ ] Add bulk URI regeneration utility
- [ ] Create migration script for existing content

### Task 5.3: Testing & Documentation

- [ ] Write unit tests for URI generation logic
- [ ] Write integration tests for document resolution
- [ ] Test all routing scenarios from the plan
- [ ] Create documentation for URI system
- [ ] Test SEO implications and sitemap generation

## Phase 6: Migration & Deployment

### Task 6.1: Data Migration

- [ ] Create migration script to populate URI fields in enhanced slug field for existing documents
- [ ] Update existing redirects to use URI-based paths
- [ ] Verify all existing URLs still work with enhanced slug field
- [ ] Create backup of current routing system

### Task 6.2: Deployment Verification

- [ ] Test static generation with new URI system
- [ ] Verify all collection types render correctly
- [ ] Test nested page hierarchies
- [ ] Confirm breadcrumbs work across all templates
- [ ] Validate SEO metadata generation

## Success Criteria

### Must Have

- [ ] All URI patterns from the plan work correctly
- [ ] First-match-wins priority system functions
- [ ] Homepage, pages, archives, and singles all resolve
- [ ] Nested pages work to any depth
- [ ] Collection archives respect settings configuration
- [ ] Breadcrumbs generate correctly from URI hierarchy

### Should Have

- [ ] URI conflicts are detected and warned
- [ ] Performance matches or exceeds current system
- [ ] Admin UX is intuitive for managing URIs
- [ ] SEO metadata generates correctly for all patterns

### Nice to Have

- [ ] Automatic redirects on URI changes
- [ ] Bulk URI management tools
- [ ] Advanced URI customization options
- [ ] URI analytics and reporting

## Dependencies & Notes

- Requires careful coordination with existing slug fields
- Must maintain backwards compatibility during migration
- Consider impact on existing SEO and indexed URLs
- Test thoroughly with draft/published content states
- Ensure live preview works throughout implementation
