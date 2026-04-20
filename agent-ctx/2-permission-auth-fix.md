# Task ID: 2 — Permission & Auth Fix Agent

## Summary
Fixed all 403 permission errors, enhanced the permission system with multi-role support, and added a comprehensive role permissions matrix.

## Changes Made

### 1. CreateCertificateDialog (`src/components/amdrh/admin-certificates.tsx`)
- **Status**: Already correctly implemented (lines 969-973) — auth params passed in POST request
- No changes needed

### 2. auth-helpers.ts (`src/lib/auth-helpers.ts`)
- Added `requireRoleOrInstructor()` function that wraps `requireRole()` with `["ADMIN", "FORMATEUR"]`
- Convenience function for routes that should be accessible by both roles

### 3. API Routes Updated
- **`src/app/api/admin/course-stats/route.ts`**: Was completely unauthenticated! Added `requireRole(req, ["ADMIN", "FORMATEUR"])` guard
- **`src/app/api/admin/quizzes/route.ts`**: Already correctly configured with `["ADMIN", "FORMATEUR"]` — no changes needed
- **`src/app/api/admin/courses/route.ts`**: Does not exist — no changes needed
- **`src/app/api/admin/resources/route.ts`**: Does not exist — no changes needed

### 4. ROLE_PERMISSIONS (`src/lib/constants.ts`)
- Added full permission matrix for all 5 roles: ADMIN, FORMATEUR, ARBITRE, ENTRAINEUR, JOUEUR
- ADMIN: Full platform access (16 permissions)
- FORMATEUR: Content creation and management (10 permissions)
- ARBITRE/ENTRAINEUR/JOUEUR: Learner permissions (11 permissions each)

### 5. Worklog
- Appended work record to `/home/z/my-project/worklog.md`
