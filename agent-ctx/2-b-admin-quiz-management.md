---
Task ID: 2-b
Agent: Main Agent
Task: Create Admin Quiz Management Module

## Files Created

### Frontend
- `src/components/amdrh/admin-quizzes.tsx` — Complete admin quiz management page

### API Routes
- `src/app/api/admin/quizzes/route.ts` — GET (list quizzes with stats, search/filter), POST (create quiz)
- `src/app/api/admin/quizzes/[id]/route.ts` — GET (quiz detail with questions), PATCH (update settings), DELETE (delete quiz)
- `src/app/api/admin/quizzes/[id]/questions/route.ts` — POST (add question), PATCH (update question), DELETE (delete question + reorder)

### Updated Files
- `src/lib/constants.ts` — Added `QUESTION_TYPE_LABELS` and `QUESTION_TYPE_COLORS`
- `src/app/page.tsx` — Imported `AdminQuizzesPage`, added `admin-quizzes` case to renderView

## Features Implemented

### Quiz List View
- Grid of quiz cards showing: title, course name, category badge
- Stats per card: question count, attempt count, pass rate
- Settings badges: duration, passing score, max attempts, shuffle
- Search by quiz or course title
- Filter by course (dropdown)
- Pagination
- Create new quiz dialog (title, course, description, duration, passing score, max attempts, shuffle, show answers)
- Delete quiz with confirmation dialog

### Quiz Detail View
- Back navigation to list
- 5 stat cards: questions, total points, attempts, pass rate, avg score
- Settings summary card
- Edit settings dialog (title, duration, passing score, max attempts, shuffle, show answers)
- Questions list with:
  - Reorder (move up/down with numbered position)
  - Visual type badge (QCM_SIMPLE, QCM_MULTIPLE, VRAI_FAUX)
  - Options preview with green highlighting for correct answers
  - Points badge
  - Explanation display
  - Edit button → Edit Question dialog
  - Delete with confirmation

### Add/Edit Question Dialogs
- Question type selector (3 types with French labels)
- Question text textarea
- Dynamic options management (add/remove, max 8)
- Click-to-toggle correct answers (single for QCM_SIMPLE, multi for QCM_MULTIPLE)
- Vrai/Faux special handling (pre-set options)
- Points input
- Explanation textarea
- Validation before submit

## Technical Details
- All data from PostgreSQL via Prisma (no mock data)
- Real-time cascade delete for quiz → answers → attempts → questions → quiz
- Question reorder with automatic re-indexing after delete
- ESLint clean (zero errors)
- Dev server running, GET / 200 confirmed
- Follows existing patterns from admin-users.tsx
- Swiss institutional design, all text in French
- Uses shadcn/ui components throughout
