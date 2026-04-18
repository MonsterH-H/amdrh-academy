---
Task ID: 1
Agent: Main Agent
Task: Build Complete Auth System + Admin Dashboard for Académie AMDRH

Work Log:
- Checked existing project state: Prisma schema, auth.ts, login/register pages, dashboard, layout all existed
- Added PasswordResetToken + VerificationToken models to Prisma schema
- Force-pushed schema to Neon PostgreSQL DB (reset)
- Generated Prisma Client
- Created /api/auth/forgot-password POST route (generates 32-byte hex token, 1hr expiry, email enum prevention)
- Created /api/auth/reset-password POST route (validates token, updates password with bcrypt salt 12, marks token used)
- Built ForgotPasswordPage component (Swiss design, email form, success state, dev token display)
- Built ResetPasswordPage component (password rules indicator, strength meter, success state)
- Updated store/app.ts with forgot-password + reset-password views
- Updated page.tsx to render new auth pages and include them in isAuthPage check
- Enhanced LoginPage with "Mot de passe oublié ?" link, reorganized demo accounts section
- Enhanced AdminUsersPage with: real API calls for toggle active/change role, Create User dialog with full form, better table layout
- Enhanced AdminUserDetailPage with: inline profile editing, reset password button, role change dropdown, comprehensive user info display
- Created comprehensive prisma/seed.ts: 13 users (1 admin, 2 formateurs, 5 arbitres, 2 entraineurs, 3 joueurs), 4 learning paths, 13 courses with sections/lessons, 8 quizzes with questions, 5 badges, enrollments, certificates, notifications
- Seeded database successfully
- Dev server running (GET / 200 confirmed)
- ESLint clean

Stage Summary:
- Complete auth flow: Login → Register → Forgot Password → Reset Password (all connected to real DB)
- Admin user management: Create users, toggle active/inactive, change roles, reset passwords (all with real API calls)
- Production DB seeded with realistic Moroccan handball data
- All pages follow Swiss institutional design (clean, minimal, #FAFAFA background)
- Zero mock data, all data from PostgreSQL Neon
