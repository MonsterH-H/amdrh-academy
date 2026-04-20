"use client";

import React, { useEffect, useState, useCallback, lazy, Suspense, type ComponentType } from "react";
import { useAppStore, type AppView } from "@/store/app";
import { TopBar, MobileBottomNav } from "@/modules/shared/layout";
import { useRealtime } from "@/hooks/use-realtime";
import { CircleDot, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Eagerly loaded components (small, needed immediately)
import { LandingPage } from "@/modules/landing";
import { LoginPage } from "@/modules/auth";
import { RegisterPage } from "@/modules/auth";
import { ForgotPasswordPage } from "@/modules/auth";
import { ResetPasswordPage } from "@/modules/auth";

// Lazy loaded components (larger, loaded on demand)
const lazyLoad = <T extends ComponentType>(loader: () => Promise<{ default: T }>) =>
  lazy(loader);

const DashboardPage = lazyLoad(() => import("@/modules/learner").then(m => ({ default: m.LearnerDashboardPage as ComponentType })));
const CourseCatalogPage = lazyLoad(() => import("@/modules/courses").then(m => ({ default: m.CourseCatalogPage as ComponentType })));
const CourseDetailPage = lazyLoad(() => import("@/modules/courses").then(m => ({ default: m.CourseDetailPage as ComponentType })));
const LearningPathsPage = lazyLoad(() => import("@/modules/learning-paths").then(m => ({ default: m.LearningPathsPage as ComponentType })));
const QuizPage = lazyLoad(() => import("@/modules/quiz").then(m => ({ default: m.QuizPage as ComponentType })));
const CertificatesPage = lazyLoad(() => import("@/modules/certificates").then(m => ({ default: m.CertificatesPage as ComponentType })));
const BadgesPage = lazyLoad(() => import("@/modules/certificates").then(m => ({ default: m.BadgesPage as ComponentType })));
const MessagesPage = lazyLoad(() => import("@/modules/messages").then(m => ({ default: m.MessagesPage as ComponentType })));
const ConversationPage = lazyLoad(() => import("@/modules/messages").then(m => ({ default: m.ConversationPage as ComponentType })));
const NotificationsPage = lazyLoad(() => import("@/modules/notifications").then(m => ({ default: m.NotificationsPage as ComponentType })));
const ProfilePage = lazyLoad(() => import("@/modules/profile").then(m => ({ default: m.ProfilePage as ComponentType })));
const LearnerTraceabilityPage = lazyLoad(() => import("@/modules/learner").then(m => ({ default: m.LearnerTraceabilityPage as ComponentType })));
const CourseCreatePage = lazyLoad(() => import("@/modules/courses").then(m => ({ default: m.CourseCreatePage as ComponentType })));

// Admin pages (lazy loaded)
const AdminUsersPage = lazyLoad(() => import("@/modules/admin/users").then(m => ({ default: m.AdminUsersPage as ComponentType })));
const AdminUserDetailPage = lazyLoad(() => import("@/modules/admin/users").then(m => ({ default: m.AdminUserDetailPage as ComponentType })));
const AdminCertificatesPage = lazyLoad(() => import("@/modules/admin/certificates").then(m => ({ default: m.AdminCertificatesPage as ComponentType })));
const AdminCoursesPage = lazyLoad(() => import("@/modules/admin/courses").then(m => ({ default: m.AdminCoursesPage as ComponentType })));
const AdminNotificationsPage = lazyLoad(() => import("@/modules/admin/notifications").then(m => ({ default: m.AdminNotificationsPage as ComponentType })));
const AdminSyncPage = lazyLoad(() => import("@/modules/admin/sync").then(m => ({ default: m.AdminSyncPage as ComponentType })));
const AdminLearningPathsPage = lazyLoad(() => import("@/modules/admin/learning-paths").then(m => ({ default: m.AdminLearningPathsPage as ComponentType })));
const AdminAnalyticsPage = lazyLoad(() => import("@/modules/admin/analytics").then(m => ({ default: m.AdminAnalyticsPage as ComponentType })));
const AdminQuizzesPage = lazyLoad(() => import("@/modules/admin/quizzes").then(m => ({ default: m.AdminQuizzesPage as ComponentType })));
const AdminResourcesPage = lazyLoad(() => import("@/modules/admin/resources").then(m => ({ default: m.AdminResourcesPage as ComponentType })));
const AdminTraceabilityPage = lazyLoad(() => import("@/modules/admin/traceability").then(m => ({ default: m.AdminTraceabilityPage as ComponentType })));

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

// ──────────────────────────────────────────────────
// App Footer (sticky to bottom when content is short)
// ──────────────────────────────────────────────────

function AppFooter() {
  const { user } = useAppStore();

  return (
    <footer className="hidden lg:block border-t border-border/40 bg-white/60 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
              <CircleDot className="w-3 h-3 text-primary" />
            </div>
            <span className="font-medium">Académie AMDRH</span>
            <span className="text-border">|</span>
            <span>Partenaire académique officiel FRMHB</span>
          </div>
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} AMDRH</span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground/70">
              {user?.prenom} {user?.nom}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ──────────────────────────────────────────────────
// In-page Error Fallback (catches render crashes inside views)
// ──────────────────────────────────────────────────

function ViewErrorFallback({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-amber-500" />
      </div>
      <h3 className="text-lg font-semibold mb-1">Erreur d'affichage</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Cette page n'a pas pu se charger correctement.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 cursor-pointer">
        <RotateCcw className="w-3.5 h-3.5" />
        Réessayer
      </Button>
    </div>
  );
}

function AppContent() {
  const { currentView, user, isAuthenticated, sidebarCollapsed, setUnreadCount } = useAppStore();
  // Initialize real-time connection when authenticated
  // The useRealtime hook manages the socket lifecycle internally
  const { subscribeNotifications } = useRealtime();
  const [viewError, setViewError] = useState<Error | null>(null);

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
    // Subscribe to real-time notifications
    subscribeNotifications();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, setUnreadCount, subscribeNotifications]);

  // Clear error when view changes (tracked via useEffect)
  const handleRetry = useCallback(() => { setViewError(null); }, []);

  const renderView = () => {
    if (viewError) return <ViewErrorFallback error={viewError} onRetry={handleRetry} />;

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
      return (
        <ErrorBoundary key={currentView} onError={setViewError}>
          <Suspense fallback={<PageLoader />}><Component /></Suspense>
        </ErrorBoundary>
      );
    }
    return (
      <ErrorBoundary key={currentView} onError={setViewError}>
        <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>
      </ErrorBoundary>
    );
  };

  const isAuthPage = ["landing", "login", "register", "forgot-password", "reset-password"].includes(currentView);

  return (
    <div className="min-h-screen bg-[#FAFAFA] overflow-x-hidden flex flex-col">
      {!isAuthPage && <SidebarWrapper />}
      {!isAuthPage && <TopBar />}
      <main
        className={`transition-all duration-300 min-w-0 flex-1 ${!isAuthPage ? (sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[280px]") : ""}`}
      >
        <div className={!isAuthPage ? "pt-14 sm:pt-16 pb-20 lg:pb-6" : ""}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {renderView()}
          </div>
        </div>
      </main>
      {!isAuthPage && <AppFooter />}
      {!isAuthPage && <MobileBottomNav />}
    </div>
  );
}

// Lazy load Sidebar since it's also large
const SidebarLazy = lazyLoad(() => import("@/modules/shared/layout").then(m => ({ default: m.Sidebar as ComponentType })));

function SidebarWrapper() {
  return (
    <Suspense fallback={null}>
      <SidebarLazy />
    </Suspense>
  );
}

// ──────────────────────────────────────────────────
// Lightweight Error Boundary (class component for catchRender)
// ──────────────────────────────────────────────────

type ErrorBoundaryProps = {
  children: React.ReactNode;
  onError?: (error: Error) => void;
};
type ErrorBoundaryState = { hasError: boolean; error: Error | null };

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("[View Error]", error);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) return null; // Parent handles the fallback via onError
    return this.props.children;
  }
}

export default function Home() {
  return <AppContent />;
}
