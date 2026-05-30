"use client";

import React, { useEffect, useState, useCallback, lazy, Suspense, type ComponentType } from "react";
import { useAppStore, type AppView } from "@/store/app";
import { TopBar, MobileBottomNav } from "@/modules/shared/layout";
import { useRealtime } from "@/hooks/use-realtime";
import { motion } from "framer-motion";
import { CircleDot, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

import { LandingPage } from "@/modules/landing";
import { LoginPage } from "@/modules/auth";
import { ForgotPasswordPage } from "@/modules/auth";
import { ResetPasswordPage } from "@/modules/auth";

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
const AnnouncementsPage = lazyLoad(() => import("@/modules/announcements").then(m => ({ default: m.AnnouncementsPage as ComponentType })));
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
const AdminPermissionsPage = lazyLoad(() => import("@/modules/admin/permissions").then(m => ({ default: m.AdminPermissionsPage as ComponentType })));
const AdminAnnouncementsPage = lazyLoad(() => import("@/modules/admin/announcements").then(m => ({ default: m.AdminAnnouncementsPage as ComponentType })));
const AdminSettingsPage = lazyLoad(() => import("@/modules/admin/settings").then(m => ({ default: m.AdminSettingsPage as ComponentType })));
const AdminDashboardPage = lazyLoad(() => import("@/modules/admin/dashboard").then(m => ({ default: m.AdminDashboardPage as ComponentType })));
const FormateurDashboardPage = lazyLoad(() => import("@/modules/formateur").then(m => ({ default: m.FormateurDashboardPage as ComponentType })));
const SidebarLazy = lazyLoad(() => import("@/modules/shared/layout").then(m => ({ default: m.Sidebar as ComponentType })));

const viewComponentMap: Record<string, ComponentType> = {
  dashboard: DashboardPage,
  "admin-dashboard": AdminDashboardPage,
  "formateur-dashboard": FormateurDashboardPage,
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
  "admin-permissions": AdminPermissionsPage,
  "admin-announcements": AdminAnnouncementsPage,
  "admin-settings": AdminSettingsPage,
  "course-create": CourseCreatePage,
  "learner-traceability": LearnerTraceabilityPage,
  profile: ProfilePage,
  announcements: AnnouncementsPage,
};

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        {/* Premium blue spinner */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-primary/15" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin shadow-[0_0_12px_rgba(37,99,235,0.3)]" />
          <div className="absolute inset-1.5 rounded-full border-2 border-transparent border-b-blue-300/60 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
        </div>
        <p className="text-sm text-muted-foreground/70 font-medium">Chargement...</p>
      </div>
    </div>
  );
}

function AppFooter() {
  const { user } = useAppStore();
  return (
    <footer className="hidden lg:block border-t-2 border-t-primary/20 border-b border-b-border/40 bg-card/60 backdrop-blur-md mt-auto">
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
            <span className="text-muted-foreground/70">{user?.prenom} {user?.nom}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

type EBProps = { children: React.ReactNode; onError?: (error: Error) => void };
type EBState = { hasError: boolean; error: Error | null };
class ErrorBoundary extends React.Component<EBProps, EBState> {
  constructor(props: EBProps) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error) { console.error("[View Error]", error); this.props.onError?.(error); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Erreur d&apos;affichage</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">Cette page n&apos;a pas pu se charger correctement.</p>
          <Button variant="outline" size="sm" onClick={() => this.setState({ hasError: false, error: null })} className="gap-2 cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5" />Réessayer
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function SidebarWrapper() {
  return (
    <Suspense fallback={null}>
      <SidebarLazy />
    </Suspense>
  );
}

function AppContent() {
  const { currentView, user, isAuthenticated, sidebarCollapsed, setUnreadCount, navigate } = useAppStore();
  const { subscribeNotifications } = useRealtime();
  const [viewError, setViewError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${user.id}&unreadOnly=true`);
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      } catch { /* silent */ }
    };
    fetchUnread();
    subscribeNotifications();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, setUnreadCount, subscribeNotifications]);

  const handleRetry = useCallback(() => { setViewError(null); }, []);

  // Redirect register view to login (registration disabled)
  useEffect(() => {
    if (currentView === "register") {
      navigate("login");
    }
  }, [currentView, navigate]);

  const renderView = () => {
    if (viewError) return (
      <motion.div
        key="error"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Erreur d&apos;affichage</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">Cette page n&apos;a pas pu se charger correctement.</p>
          <Button variant="outline" size="sm" onClick={handleRetry} className="gap-2 cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5" />Réessayer
          </Button>
        </div>
      </motion.div>
    );
    if (currentView === "landing") return <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}><LandingPage /></motion.div>;
    if (currentView === "login") return <motion.div key="login" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}><LoginPage /></motion.div>;
    if (currentView === "forgot-password") return <motion.div key="forgot-password" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}><ForgotPasswordPage /></motion.div>;
    if (currentView === "reset-password") return <motion.div key="reset-password" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}><ResetPasswordPage /></motion.div>;
    if (!isAuthenticated) return <motion.div key="landing-fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}><LandingPage /></motion.div>;

    const Component = viewComponentMap[currentView];
    if (Component) {
      return (
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <ErrorBoundary key={currentView} onError={setViewError}>
            <Suspense fallback={<PageLoader />}><Component /></Suspense>
          </ErrorBoundary>
        </motion.div>
      );
    }
    return (
      <motion.div
        key="default"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <ErrorBoundary key={currentView} onError={setViewError}>
          <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>
        </ErrorBoundary>
      </motion.div>
    );
  };

  const isAuthPage = ["landing", "login", "register", "forgot-password", "reset-password"].includes(currentView);

  return (
    <div className="min-h-screen bg-[#FAFAFA] overflow-x-hidden flex flex-col">
      {!isAuthPage && <SidebarWrapper />}
      {!isAuthPage && <TopBar />}
      <main className={`transition-all duration-300 min-w-0 flex-1 ${!isAuthPage ? (sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[280px]") : ""}`}>
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

export default function Home() {
  return <AppContent />;
}
