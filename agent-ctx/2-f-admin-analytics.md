# Task 2-f: Admin Analytics Dashboard

## Status: ✅ Complete

## What was built:
- `src/components/amdrh/admin-analytics.tsx` — Full AdminAnalyticsPage component
- Wired into `src/app/page.tsx` under `case "admin-analytics"`

## Component features:

### Overview Cards (6 cards, responsive grid)
- Total Users (active/total)
- Total Courses (published/total)
- Total Enrollments with completion rate
- Total Certificates issued
- Quiz pass rate (with total attempts)
- Total Messages

### Charts Section (5 charts using recharts)
1. **Enrollments by Month** — BarChart (last 6 months from API)
2. **Certificates Issued by Month** — LineChart with dots
3. **Users by Role** — PieChart with legend
4. **Courses by Category** — Horizontal BarChart with colored bars
5. **Completion Rate** — RadialBarChart (half-circle gauge)

### Top Courses Table
- Sorted by enrollment count (top 10)
- Shows rank, title, category badge, enrollments, completion %, pass rate
- Color-coded pass rates (green ≥70%, amber ≥50%, red <50%)

### Recent Activity Tabs
- Enrollments tab — Latest user registrations
- Quiz tab — Latest quiz attempts (with status icons)
- Certificates tab — Latest certificates issued

### Export Button
- Triggers toast "Export en cours..."

## API Integration:
- Primary: `GET /api/stats` (existing route) — overview, usersByRole, enrollmentsByMonth, certificatesByMonth, coursesByCategory
- Secondary: `GET /api/courses` — for top courses table
- Secondary: `GET /api/users` — for recent enrollment activity
- Secondary: `GET /api/certificates` — for recent certificate activity

## Design:
- Swiss institutional style matching existing dashboard
- Color palette: #1D4ED8, #10B981, #F59E0B, #EF4444, #8B5CF6
- `animate-fadeIn` entry animation
- Full skeleton loading state
- Error state with retry suggestion
- Responsive grid (2→3→6 cols for cards, stacked on mobile for charts)
- ROLE_LABELS and CATEGORY_LABELS from constants
- All text in French

## ESLint: Clean (0 errors)
