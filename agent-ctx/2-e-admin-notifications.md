# Task 2-e: Admin Notification Management Module

## Agent: Main Agent
## Status: Completed

---

## Work Log

1. **Read project context** — Reviewed worklog.md, Prisma schema, constants.ts, auth.ts, app store, page.tsx, and existing components (admin-users.tsx, notifications.tsx, users API route) to understand patterns, design system, and data models.

2. **Created API route** — `src/app/api/admin/notifications/route.ts`
   - **GET**: Returns notification statistics (total, byType breakdown, readRate, readCount, unreadCount) and paginated notification history with user info included. Supports query params: `type`, `page`, `limit`, `search` (searches title and message). Uses Prisma `include` to attach user name/role/email to each notification.
   - **POST**: Creates notifications with three targeting modes:
     - `targetAll: true` — Broadcasts to ALL active users via `createMany`
     - `targetRoles: ["ARBITRE", "ENTRAINEUR"]` — Targets active users matching selected roles
     - `userId: "..."` — Targets a single specific user (validates existence and active status)
   - Returns `{ count, message }` on success with proper error handling for each mode.

3. **Created frontend component** — `src/components/amdrh/admin-notifications.tsx`
   - **Stats section**: 4-card grid showing total sent, read rate, unread count, and type breakdown with colored bar visualization.
   - **Create form**: Title input, message textarea (with char count), type selector with colored badges + icons, target audience selector (3 modes: all users, by role with checkboxes, specific user with search/select), preview button, send button.
   - **Preview card**: Shows notification preview with icon/type/title/message/timestamp, target summary details (type, audience, recipients, mode), and warning for large broadcasts (>10 recipients).
   - **History section**: Search by title/message, filter by notification type with colored pill buttons, paginated list showing title, type badge, read status, message excerpt, user avatar/name, role badge, and date.
   - **Loading skeleton**, error handling with toast notifications, form validation, estimated recipient count.

4. **Wired into page.tsx** — Added `AdminNotificationsPage` import and `case "admin-notifications"` to the view switch.

5. **Lint passed** — ESLint clean, no warnings or errors.

---

## Files Created/Modified

| File | Action | Description |
|------|--------|-------------|
| `src/app/api/admin/notifications/route.ts` | Created | GET stats+history, POST broadcast/targeted |
| `src/components/amdrh/admin-notifications.tsx` | Created | Admin notification management UI |
| `src/app/page.tsx` | Modified | Added import + switch case for admin-notifications view |

---

## Design Decisions

- **Swiss institutional design**: Clean card-based layout, consistent with existing admin pages (admin-users.tsx pattern)
- **Colored type badges**: Each notification type has a unique color for visual differentiation
- **Preview-first UX**: Admin must click "Aperçu" before understanding what will be sent
- **Safety warning**: Amber warning when sending to >10 recipients, extra caution for >50
- **User search with debounce**: 300ms debounce on user search input for performance
- **All French text**: Consistent with the AMDRH Académie platform
- **No mock data**: All data comes from real PostgreSQL via Prisma

---

## API Contract

### GET `/api/admin/notifications`
- Query: `type`, `page`, `limit`, `search`
- Response: `{ stats: { total, byType, readRate, readCount, unreadCount }, notifications: [...], pagination: { page, limit, totalPages, total } }`

### POST `/api/admin/notifications`
- Body: `{ title, message, type, targetAll?: true, targetRoles?: string[], userId?: string }`
- Response: `{ count, message }`
