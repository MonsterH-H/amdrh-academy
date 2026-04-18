---
Task ID: 2-a
Agent: Task 2-a Agent
Task: Create Admin Course Management Module - Full CRUD Interface

Work Log:
- Read worklog.md, constants.ts, store/app.ts to understand codebase patterns
- Read existing admin-users.tsx for styling/structure patterns
- Read existing /api/courses/route.ts and /api/courses/[id]/route.ts

Changes Made:

1. **Updated `src/app/api/courses/route.ts` (GET)**
   - Added `admin=true` query param support
   - When `admin=true`: returns ALL courses (any status), no status filter by default
   - When `admin=true`: supports `status` filter param (BROUILLON, EN_REVISION, VALIDE, PUBLIE, ARCHIVE)
   - When `admin=true`: includes `_count.sections` in response
   - When `admin=true`: returns aggregated stats (total, published, drafts, archived)
   - When `admin` is not set: existing behavior preserved (only PUBLIE courses)

2. **Updated `src/app/api/courses/[id]/route.ts` (PATCH + DELETE)**
   - Added PATCH method: updates allowed fields (title, description, category, difficulty, duration, status, isCertifying, passingScore, maxAttempts)
   - Auto-regenerates slug when title is changed
   - Added DELETE method: deletes course with cascade (sections, lessons, quiz via schema onDelete: Cascade)
   - Both methods check course existence first

3. **Created `src/components/amdrh/admin-courses.tsx`**
   - `AdminCoursesPage` named export
   - Stats cards: total courses, published, drafts, archived
   - Search by title with form submission
   - Status filter pills (All, Brouillons, En révision, Validés, Publiés, Archivés)
   - Category and difficulty dropdown filters
   - Filter reset button when filters are active
   - Course list as card rows with:
     - Category color icon
     - Title (clickable to view details)
     - Description preview (line-clamp-1)
     - Status badge with colored dot
     - Category, difficulty, certifying badges
     - Enrollments count, sections count, duration
     - Instructor name
     - Actions dropdown menu
   - Actions: View details, Edit, Change status (Publish, Send to review, Validate, Archive, Back to draft), Delete
   - Detail dialog: full course info, sections/lessons tree, quiz stats, instructor, certifying settings
   - Edit dialog: form with title, description, category, difficulty, duration, certifying toggle, passing score, max attempts
   - Delete confirmation dialog with warning about irreversible action and cascade info
   - Pagination controls
   - Loading skeleton matching the layout
   - All text in French
   - Swiss institutional design (#FAFAFA bg, clean borders, rounded-lg)

4. **Updated `src/app/page.tsx`**
   - Added import for AdminCoursesPage
   - Added `case "admin-courses"` to renderView switch

Stage Summary:
- Full admin course management module with CRUD operations
- 3 files modified, 1 file created
- ESLint clean (0 errors, 0 warnings)
- All data from real API routes, no mock data
- Follows existing admin-users.tsx patterns and Swiss design system
