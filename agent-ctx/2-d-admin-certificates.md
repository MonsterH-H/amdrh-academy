# Task 2-d: Admin Certificates & Badges Management Module

## Summary

Created a complete Admin Certificates & Badges management module for the Académie AMDRH e-learning platform.

## Files Created

### API Routes

1. **`src/app/api/admin/certificates/route.ts`**
   - `GET`: List all certificates with user/course info, pagination, search by name/code/course, date range filter, and stats (total, thisMonth, valid, expired)
   - `POST`: Create certificate manually — selects user & course, auto-generates code `AMDRH-2026-XXXXX`, creates notification for user

2. **`src/app/api/admin/badges/route.ts`**
   - `GET`: List all badges with `_count.userBadges` (earned count)
   - `POST`: Create new badge with name, description, level (BadgeLevel enum), icon, criteria

3. **`src/app/api/admin/badges/[id]/route.ts`**
   - `GET`: Get single badge with all userBadges (users who earned it)
   - `PATCH`: Update badge fields
   - `DELETE`: Delete badge (cascades to UserBadge records)

4. **`src/app/api/admin/badges/award/route.ts`**
   - `POST`: Award badge to user — validates uniqueness (`userId_badgeId`), creates UserBadge record + notification

### Frontend

5. **`src/components/amdrh/admin-certificates.tsx`** — `AdminCertificatesPage`
   - Two tabs: "Certificats" and "Badges" using shadcn Tabs
   - **Certificates Tab**: Stats cards (total, this month, valid, expired), search bar, date range filter, paginated table with code (monospace), user, course, score, status badges, detail dialog, create certificate dialog
   - **Badges Tab**: Card grid with badge icons/levels/colors, actions dropdown (view users, edit, delete), create badge dialog, edit badge dialog, award badge dialog (select user + badge), badge holders dialog, delete confirmation AlertDialog
   - Badge level colors: BRONZE (amber-700), ARGENT (gray-300), OR (yellow-400), PLATINE (cyan-400) from constants
   - All text in French, loading skeletons, error toasts

## Files Modified

6. **`src/app/page.tsx`** — Added import for `AdminCertificatesPage` and `case "admin-certificates"` in switch
7. **`src/components/amdrh/layout.tsx`** — Added "Certificats & Badges" to adminNavItems and getViewTitle

## Verification
- ESLint: clean (0 errors, 0 warnings)
- Dev server: GET / 200, ready
