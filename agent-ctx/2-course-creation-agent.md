# Task 2 - Course Creation Feature Agent

## Summary
Added a comprehensive course creation and management page for admins and formateurs.

## Changes Made

### 1. Validation Schema (`/src/lib/validations.ts`)
- Added `lessonSchema`: title, type (VIDEO/PDF/TEXTE/INTERACTIF), content, duration
- Added `sectionSchema`: title, lessons array
- Extended `courseCreateSchema` with `instructorId` (required) and `sections` (nested array)
- Exported `LessonInput` and `SectionInput` types

### 2. API Route (`/src/app/api/courses/route.ts`)
- Added POST handler alongside existing GET handler
- Zod validation of request body
- Generates unique slug from title + timestamp
- Verifies instructor has ADMIN or FORMATEUR role
- Creates Course + Sections + Lessons in a Prisma transaction
- New courses default to BROUILLON status
- Returns 201 with full course data including nested sections and lessons

### 3. Course Create Component (`/src/components/amdrh/course-create.tsx`)
- **Step 1 - Basic Info**: title, description (textarea), category (Select), difficulty (Select), duration, isCertifying (Switch), conditional passingScore/maxAttempts
- **Step 2 - Sections & Lessons**: Dynamic sections with add/remove, nested lessons with add/remove, lesson type selector with icons, duration input
- Per-field validation with red border indicators and error messages
- Step indicator with clickable completed steps
- Loading state with Loader2 spinner
- Success/error toast notifications
- Navigates to new course detail page on success
- Swiss Institutional design: #1D4ED8 primary, #F59E0B gold accent, rounded-lg corners

### 4. Wiring
- Added `"course-create"` to AppView type in Zustand store
- Imported and rendered CourseCreatePage in page.tsx view switcher
- Added "Créer un cours" button in course catalog (ADMIN/FORMATEUR only)
- Added "Créer un cours" button in AdminDashboard
- Added "Créer un cours" button in FormateurDashboard

## Verification
- ESLint: zero errors
- Dev server: compiles successfully (GET / 200)
