"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app";
import { Sidebar, TopBar, MobileBottomNav } from "@/components/amdrh/layout";
import { LandingPage } from "@/components/amdrh/landing";
import { LoginPage } from "@/components/amdrh/login";
import { RegisterPage } from "@/components/amdrh/register";
import { ForgotPasswordPage } from "@/components/amdrh/forgot-password";
import { ResetPasswordPage } from "@/components/amdrh/reset-password";
import { DashboardPage } from "@/components/amdrh/dashboard";
import { CourseCatalogPage } from "@/components/amdrh/course-catalog";
import { CourseDetailPage } from "@/components/amdrh/course-detail";
import { LearningPathsPage } from "@/components/amdrh/learning-paths";
import { QuizPage } from "@/components/amdrh/quiz";
import { CertificatesPage, BadgesPage } from "@/components/amdrh/certificates-badges";
import { MessagesPage, ConversationPage } from "@/components/amdrh/messages";
import { NotificationsPage } from "@/components/amdrh/notifications";
import { AdminUsersPage, AdminUserDetailPage } from "@/components/amdrh/admin-users";
import { AdminSyncPage } from "@/components/amdrh/admin-sync";
import { CourseCreatePage } from "@/components/amdrh/course-create";
import { ProfilePage } from "@/components/amdrh/profile";
import { cn } from "@/lib/utils";

function AppContent() {
  const { currentView, user, isAuthenticated, sidebarCollapsed, setUnreadCount } = useAppStore();

  // Fetch unread count periodically when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${user.id}&unreadOnly=true`);
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      } catch {
        // silently fail
      }
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

    switch (currentView) {
      case "dashboard": return <DashboardPage />;
      case "courses": return <CourseCatalogPage />;
      case "course-detail": return <CourseDetailPage />;
      case "learning-paths": return <LearningPathsPage />;
      case "quiz": return <QuizPage />;
      case "certificates": return <CertificatesPage />;
      case "badges": return <BadgesPage />;
      case "messages": return <MessagesPage />;
      case "conversation": return <ConversationPage />;
      case "notifications": return <NotificationsPage />;
      case "admin-users": return <AdminUsersPage />;
      case "admin-user-detail": return <AdminUserDetailPage />;
      case "admin-sync": return <AdminSyncPage />;
      case "course-create": return <CourseCreatePage />;
      case "profile": return <ProfilePage />;
      default: return <DashboardPage />;
    }
  };

  const isAuthPage = ["landing", "login", "register", "forgot-password", "reset-password"].includes(currentView);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {!isAuthPage && <Sidebar />}
      {!isAuthPage && <TopBar />}
      <main
        className={cn(
          "transition-all duration-300",
          !isAuthPage && sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[280px]"
        )}
      >
        <div className={cn(!isAuthPage && "pt-16 pb-20 lg:pb-6")}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {renderView()}
          </div>
        </div>
      </main>
      {!isAuthPage && <MobileBottomNav />}
    </div>
  );
}

export default function Home() {
  return <AppContent />;
}
