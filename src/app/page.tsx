"use client";

import { useEffect, lazy, Suspense, type ComponentType } from "react";
import { useAppStore, type AppView } from "@/store/app";
import { TopBar, MobileBottomNav } from "@/components/amdrh/layout";

// Eagerly loaded components (small, needed immediately)
import { LandingPage } from "@/components/amdrh/landing";
import { LoginPage } from "@/components/amdrh/login";
import { RegisterPage } from "@/components/amdrh/register";
import { ForgotPasswordPage } from "@/components/amdrh/forgot-password";
import { ResetPasswordPage } from "@/components/amdrh/reset-password";

// Lazy loaded components (larger, loaded on demand)
const lazyLoad = <T extends ComponentType>(loader: () => Promise<{ default: T }>) =>
  lazy(loader);

const DashboardPage = lazyLoad(() => import("@/components/amdrh/dashboard").then(m => ({ default: m.DashboardPage as ComponentType })));
const CourseCatalogPage = lazyLoad(() => import("@/components/amdrh/course-catalog").then(m => ({ default: m.CourseCatalogPage as ComponentType })));
const CourseDetailPage = lazyLoad(() => import("@/components/amdrh/course-detail").then(m => ({ default: m.CourseDetailPage as ComponentType })));
const LearningPathsPage = lazyLoad(() => import("@/components/amdrh/learning-paths").then(m => ({ default: m.LearningPathsPage as ComponentType })));
const QuizPage = lazyLoad(() => import("@/components/amdrh/quiz").then(m => ({ default: m.QuizPage as ComponentType })));
const CertificatesPage = lazyLoad(() => import("@/components/amdrh/certificates-badges").then(m => ({ default: m.CertificatesPage as ComponentType })));
const BadgesPage = lazyLoad(() => import("@/components/amdrh/certificates-badges").then(m => ({ default: m.BadgesPage as ComponentType })));
const MessagesPage = lazyLoad(() => import("@/components/amdrh/messages").then(m => ({ default: m.MessagesPage as ComponentType })));
const ConversationPage = lazyLoad(() => import("@/components/amdrh/messages").then(m => ({ default: m.ConversationPage as ComponentType })));
const NotificationsPage = lazyLoad(() => import("@/components/amdrh/notifications").then(m => ({ default: m.NotificationsPage as ComponentType })));
const ProfilePage = lazyLoad(() => import("@/components/amdrh/profile").then(m => ({ default: m.ProfilePage as ComponentType })));
const LearnerTraceabilityPage = lazyLoad(() => import("@/components/amdrh/learner-traceability").then(m => ({ default: m.LearnerTraceabilityPage as ComponentType })));
const CourseCreatePage = lazyLoad(() => import("@/components/amdrh/course-create").then(m => ({ default: m.CourseCreatePage as ComponentType })));

// Admin pages (lazy loaded)
const AdminUsersPage = lazyLoad(() => import("@/components/amdrh/admin-users").then(m => ({ default: m.AdminUsersPage as ComponentType })));
const AdminUserDetailPage = lazyLoad(() => import("@/components/amdrh/admin-users").then(m => ({ default: m.AdminUserDetailPage as ComponentType })));
const AdminCertificatesPage = lazyLoad(() => import("@/components/amdrh/admin-certificates").then(m => ({ default: m.AdminCertificatesPage as ComponentType })));
const AdminCoursesPage = lazyLoad(() => import("@/components/amdrh/admin-courses").then(m => ({ default: m.AdminCoursesPage as ComponentType })));
const AdminNotificationsPage = lazyLoad(() => import("@/components/amdrh/admin-notifications").then(m => ({ default: m.AdminNotificationsPage as ComponentType })));
const AdminSyncPage = lazyLoad(() => import("@/components/amdrh/admin-sync").then(m => ({ default: m.AdminSyncPage as ComponentType })));
const AdminLearningPathsPage = lazyLoad(() => import("@/components/amdrh/admin-learning-paths").then(m => ({ default: m.AdminLearningPathsPage as ComponentType })));
const AdminAnalyticsPage = lazyLoad(() => import("@/components/amdrh/admin-analytics").then(m => ({ default: m.AdminAnalyticsPage as ComponentType })));
const AdminQuizzesPage = lazyLoad(() => import("@/components/amdrh/admin-quizzes").then(m => ({ default: m.AdminQuizzesPage as ComponentType })));
const AdminResourcesPage = lazyLoad(() => import("@/components/amdrh/admin-resources").then(m => ({ default: m.AdminResourcesPage as ComponentType })));
const AdminTraceabilityPage = lazyLoad(() => import("@/components/amdrh/admin-traceability").then(m => ({ default: m.AdminTraceabilityPage as ComponentType })));

// View component map
const viewComponentMap: Record<string, ComponentType> = {
  dashboard: DashboardPage,
  courses: CourseCatalogPage,
  "course-detail": CourseDetailPage,
  "learning-paths": LearningPathsPage,
  quiz: QuizPage,
  certificates: CertificatesPage,
  badges: BadgesPage,
  messages: MessagesPage,
  conversation: ConversationPage,
  notifications: NotificationsPage,
  "admin-users": AdminUsersPage,
  "admin-user-detail": AdminUserDetailPage,
  "admin-courses": AdminCoursesPage,
  "admin-notifications": AdminNotificationsPage,
  "admin-sync": AdminSyncPage,
  "admin-learning-paths": AdminLearningPathsPage,
  "admin-analytics": AdminAnalyticsPage,
  "admin-certificates": AdminCertificatesPage,
  "admin-quizzes": AdminQuizzesPage,
  "admin-resources": AdminResourcesPage,
  "admin-traceability": AdminTraceabilityPage,
  "course-create": CourseCreatePage,
  "learner-traceability": LearnerTraceabilityPage,
  profile: ProfilePage,
};

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { currentView, user, isAuthenticated, sidebarCollapsed, setUnreadCount } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${user.id}&unreadOnly=true`);
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      } catch { /* silently fail */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, setUnreadCount]);

  const renderView = () => {
    // Auth pages (no sidebar/topbar)
    if (currentView === "landing") return <LandingPage />;
    if (currentView === "login") return <LoginPage />;
    if (currentView === "register") return <RegisterPage />;
    if (currentView === "forgot-password") return <ForgotPasswordPage />;
    if (currentView === "reset-password") return <ResetPasswordPage />;

    // Protected pages (with sidebar/topbar)
    if (!isAuthenticated) {
      return <LandingPage />;
    }

    const Component = viewComponentMap[currentView];
    if (Component) {
      return <Suspense fallback={<PageLoader />}><Component /></Suspense>;
    }
    return <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>;
  };

  const isAuthPage = ["landing", "login", "register", "forgot-password", "reset-password"].includes(currentView);

  return (
    <div className="min-h-screen bg-[#FAFAFA] overflow-x-hidden">
      {!isAuthPage && <SidebarWrapper />}
      {!isAuthPage && <TopBar />}
      <main
        className={`transition-all duration-300 min-w-0 ${!isAuthPage ? (sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[280px]") : ""}`}
      >
        <div className={!isAuthPage ? "pt-14 sm:pt-16 pb-20 lg:pb-6" : ""}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {renderView()}
          </div>
        </div>
      </main>
      {!isAuthPage && <MobileBottomNav />}
    </div>
  );
}

// Lazy load Sidebar since it's also large
const SidebarLazy = lazyLoad(() => import("@/components/amdrh/layout").then(m => ({ default: m.Sidebar as ComponentType })));

function SidebarWrapper() {
  return (
    <Suspense fallback={null}>
      <SidebarLazy />
    </Suspense>
  );
}

export default function Home() {
  return <AppContent />;
}
