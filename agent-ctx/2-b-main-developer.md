# Task 2-b: Learner Dashboard Improvements + Certificate Viewer
Agent: Main Developer
Date: Current session

## Overview
Enhanced the Learner Dashboard with 6 new features and created a premium Certificate Viewer with verification capability.

## Part A: Learner Dashboard Improvements

### Files Created (6 new components):

1. **`src/modules/learner/components/dashboard/motivational-quote.tsx`** (38 lines)
   - Rotating French motivational quotes (10 quotes about learning/sports)
   - Daily rotation based on day-of-year index
   - Styled gradient card with Quote icon watermark
   - AMDRH Academy branding

2. **`src/modules/learner/components/dashboard/streak-counter.tsx`** (112 lines)
   - Learning streak tracking with localStorage persistence
   - `useStreak()` hook with `recordToday()` method
   - `recordActivity()` exported for external calls (called on dashboard fetch)
   - Consecutive day calculation with yesterday detection
   - Longest streak tracking
   - Visual design: flame icon, gradient styling, active/inactive states
   - Dark mode support throughout

3. **`src/modules/learner/components/dashboard/quick-resume.tsx`** (67 lines)
   - "Reprendre" section for last accessed in-progress course
   - Shows course title, difficulty badge, progress bar
   - "Continuer" button navigates to course-detail with params
   - Gradient header with BookOpen icon
   - Responsive layout (stacked on mobile, side-by-side on desktop)

4. **`src/modules/learner/components/dashboard/upcoming-deadlines.tsx`** (87 lines)
   - Lists courses with status "en_cours" sorted by time enrolled
   - Urgency levels: "Urgent" (low progress + old enrollment), "Attention", "En cours"
   - Shows progress bar, days enrolled, status badge
   - Card with AlertTriangle header icon
   - Max 4 items displayed

5. **`src/modules/learner/components/dashboard/animated-stat-card.tsx`** (106 lines)
   - Animated number counter using requestAnimationFrame + easeOutCubic
   - Duration: 1200ms with smooth easing
   - Trend indicators: up/down/neutral arrows with color coding
   - Accepts `trend` and `trendValue` props
   - Dark mode support for all colors

6. **Updated `src/modules/learner/components/dashboard/realtime-feed.tsx`** (74 lines)
   - Added 3 new activity types: `enrollment`, `lesson_completed`, `certificate_earned`
   - Activity-specific icons and color schemes (6 total types)
   - Replaced plain div with ScrollArea for better overflow handling
   - Dark mode support for all activity type styles
   - Updated ConnectionStatusBadge with dark mode

### Files Modified:

7. **`src/modules/learner/components/dashboard/learner-dashboard-page.tsx`** (247 lines)
   - Integrated all 6 new components
   - New dashboard layout: Quote → Welcome + Streak → Stats → Quick Resume → Two-column (Courses + Deadlines) → Activity Feed → Recommended
   - Builds activity feed from both real-time events AND API data (certificates, quiz attempts, enrollments)
   - Combined feed sorted by timestamp, capped at 15 items
   - Uses AnimatedStatCard instead of plain StatCard
   - Calls `recordActivity()` on dashboard fetch for streak tracking
   - Updated skeleton to match new layout

## Part B: Certificate Viewer

### Files Created:

8. **`src/modules/certificates/components/certificate-viewer-dialog.tsx`** (212 lines)
   - Premium certificate viewer dialog with branded header (primary gradient)
   - AMDRH Academy branding with cert type icon
   - Verification badge (green shield for valid certs)
   - Certificate title with "Certificat de réussite" subtitle
   - Recipient name section
   - Animated score bar with color coding (green ≥70%, amber ≥50%, red <50%)
   - Issue date and expiry date grid
   - Certificate code with copy button (shows checkmark on success)
   - QR Code placeholder (styled dashed border div)
   - Revocation notice with reason
   - Action buttons: Download, Share (uses Web Share API with clipboard fallback), Verify
   - Full dark mode support

9. **`src/modules/certificates/components/certificate-verify.tsx`** (131 lines)
   - Input field for certificate code verification
   - Enter key support for quick verification
   - Loading state with spinner
   - Success state: green card with certificate details (name, course, score, date, "Certifié AMDRH" badge)
   - Error state: red card with appropriate message (invalid, revoked, not found)
   - Shows revocation reason if applicable
   - Uses existing GET endpoint `/api/certificates/verify?code=`

### Files Modified:

10. **`src/modules/certificates/components/certificates-page.tsx`** (244 lines)
    - Added "Voir" hover button on each certificate card (opens CertificateViewerDialog)
    - Added CertificateVerify section below certificate list
    - Both dialogs (detail + viewer) managed independently
    - Dark mode support on stat cards

11. **`src/modules/certificates/index.ts`** (4 lines)
    - Added exports: CertificateViewerDialog, CertificateVerify

12. **`src/app/api/certificates/verify/route.ts`** (151 lines)
    - Added POST handler accepting `{ code: string }` in JSON body
    - Same verification logic as GET (find by code, check status/expiry)
    - Input validation (non-empty string)
    - Returns identical response format for consistency

## Technical Notes:
- All components use `"use client"` directive
- All components are under 400 lines
- French labels throughout
- shadcn/ui components exclusively
- Theme-aware: bg-card, bg-muted, text-foreground, border-border/60, dark: variants
- Uses `@/hooks/use-toast` for toast notifications
- Uses `@/utils/format` for date formatting
- Uses `@/lib/constants` for label/color mappings
- `lucide-react` icons throughout
- No external dependencies added
- All existing functionality preserved

## Verification:
- ESLint: 0 errors, 0 warnings ✅
- TypeScript (src/): No new errors ✅ (pre-existing errors in mini-services/skills only)
- Dev server: HTTP 200 on / ✅
- All 12 files created/modified ✅
