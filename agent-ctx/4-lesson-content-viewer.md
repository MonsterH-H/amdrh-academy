---
Task ID: 4
Agent: Lesson Content Viewer
Task: Enhance course detail page with a lesson content viewer

Work Log:
- Read existing files: course-detail.tsx, course API route, progress API route, Prisma schema, constants.ts
- Analyzed data structures: Lesson model (id, title, type, content, duration, order, sectionId), LessonProgress, Enrollment
- Added LESSON_TYPE_LABELS, LESSON_TYPE_ICONS, LESSON_TYPE_COLORS to constants.ts for French labels and styling
- Rewrote course-detail.tsx with comprehensive lesson content viewer:
  - Added `activeLessonId` state to track which lesson is being viewed
  - Built flat `allLessons` array from sections/lessons using useMemo for prev/next navigation
  - Added `activeLessonIndex`, `activeLesson`, `prevLesson`, `nextLesson`, `activeSection` computed values
  - Changed lesson click behavior: clicking a lesson now opens the content viewer instead of directly marking complete
  - Created inline content panel that appears above the course outline with:
    - Lesson title, type badge with icon, duration, section name, completion status
    - "Retour au plan du cours" back link and X close button
    - Type-specific content display (TEXTE shows formatted content, VIDEO/PDF/INTERACTIF show styled placeholders)
    - ScrollArea for long text content (max-h 400px)
    - "Marquer comme terminée" green button with loading state
    - "Leçon terminée" completed indicator
    - Previous/Next lesson navigation with lesson counter (X / Y)
  - Highlighted active lesson in the outline with primary ring
  - Added right-pointing chevron to enrolled lesson items for discoverability
  - Updated lesson type badges to use proper French labels and icons from constants
  - Fixed React hooks rule violation: moved all useMemo calls before early returns

Files Modified:
- src/lib/constants.ts - Added LESSON_TYPE_LABELS, LESSON_TYPE_ICONS, LESSON_TYPE_COLORS
- src/components/amdrh/course-detail.tsx - Complete rewrite with lesson content viewer

Testing:
- ESLint passes with zero errors
- Dev server compiles successfully
