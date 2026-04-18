---
Task ID: 2-c
Agent: Main Agent
Task: Create Admin Learning Path Management Module

Work Log:
- Read existing worklog, project structure, and all relevant source files (constants, existing learning-paths.tsx, admin-users.tsx, layout.tsx, store/app.ts, schema.prisma, db.ts, page.tsx)
- Analyzed existing patterns: Swiss institutional design, shadcn/ui components, ROLE_LABELS/ROLE_COLORS from constants, Dialog/AlertDialog patterns from admin-users.tsx
- Created API route `src/app/api/admin/learning-paths/route.ts`:
  - GET: List all learning paths with courses, enrollment counts, pagination, role filtering
  - POST: Create new learning path with slug auto-generation, course associations (order/required/minScore)
- Created API route `src/app/api/admin/learning-paths/[id]/route.ts`:
  - GET: Single path with full details + enrolled users
  - PATCH: Update path fields + rebuild course associations (delete + createMany)
  - DELETE: Delete path (cascade handles enrollments and courses)
- Created frontend component `src/components/amdrh/admin-learning-paths.tsx`:
  - `AdminLearningPathsPage` with full CRUD: list, create, edit, delete with confirmation
  - Stats grid: total paths, total enrollments, by-role breakdown
  - Role filter pills matching existing admin pattern
  - Course selection from published courses with search
  - Course ordering (move up/down) with required checkbox and min score per course
  - Detail dialog with enrolled users list (user avatar, name, email, progress, status badge)
  - Mode labels: SEQUENTIEL=Séquentiel, FLEXIBLE=Flexible, HYBRIDE=Hybride
  - Role badges with ROLE_COLORS, mandatory badge, enrollment status badges
  - Skeleton loading state
  - All text in French
- Wired up in `page.tsx`: import + switch case for "admin-learning-paths"
- Added nav item to `layout.tsx`: admin sidebar nav + topbar title
- ESLint clean (zero errors)
- Dev server running (GET / 200)

Files Created:
- `src/app/api/admin/learning-paths/route.ts` — GET (list) + POST (create)
- `src/app/api/admin/learning-paths/[id]/route.ts` — GET + PATCH + DELETE
- `src/components/amdrh/admin-learning-paths.tsx` — AdminLearningPathsPage

Files Modified:
- `src/app/page.tsx` — Added import + switch case
- `src/components/amdrh/layout.tsx` — Added admin nav item + topbar title

Stage Summary:
- Complete admin learning path management module with real DB (Prisma/PostgreSQL)
- All CRUD operations via REST API endpoints
- Swiss institutional design matching existing AMDRH patterns
- No mock data, fully functional with seeded database
