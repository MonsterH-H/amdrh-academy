"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Settings,
  Shield,
  Palette,
  Mail,
  BookOpen,
  Bell,
  Database,
} from "lucide-react";
import { PlatformSettingsCard } from "./platform-settings";
import { AppearanceSettingsCard } from "./appearance-settings";
import { EmailSettingsCard } from "./email-settings";
import { SecuritySettingsCard } from "./security-settings";
import { LearningSettingsCard } from "./learning-settings";
import { NotificationSettingsCard } from "./notification-settings";
import { DataManagementCard } from "./data-management";
import type { AllSettings } from "../types";

const DEFAULT_SETTINGS: AllSettings = {
  platform: {
    name: "Académie AMDRH",
    description:
      "Plateforme e-learning de l'Académie AMDRH, partenaire académique officiel de la FRMHB.",
    contactEmail: "contact@amdrh-academie.org",
    frmhbPartnership: "Partenaire académique officiel FRMHB",
    academicYear: "2024-2025",
  },
  appearance: {
    primaryColor: "#0F766E",
    logoUrl: "/logo.svg",
    faviconUrl: "/logo.svg",
    customCSS: "",
  },
  email: {
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "noreply@amdrh-academie.org",
    encryption: "tls",
  },
  security: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
  },
  learning: {
    defaultPassingScore: 70,
    maxQuizAttempts: 3,
    certificateValidity: 24,
    badgeCriteria: "auto",
    autoEnrollment: false,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    notificationRetention: 90,
  },
};

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <Skeleton className="h-10 w-full max-w-2xl" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<AllSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSettings(data.settings || DEFAULT_SETTINGS);
    } catch {
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (loading || !settings) return <SettingsSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Paramètres de la plateforme
          </h1>
          <p className="text-muted-foreground">
            Configurez les paramètres globaux de l&apos;Académie AMDRH
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-muted/60">
          <TabsTrigger
            value="platform"
            className="flex items-center gap-1.5 px-3 data-[state=active]:bg-background"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Plateforme</span>
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="flex items-center gap-1.5 px-3 data-[state=active]:bg-background"
          >
            <Palette className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Apparence</span>
          </TabsTrigger>
          <TabsTrigger
            value="email"
            className="flex items-center gap-1.5 px-3 data-[state=active]:bg-background"
          >
            <Mail className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">E-mail</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex items-center gap-1.5 px-3 data-[state=active]:bg-background"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger
            value="learning"
            className="flex items-center gap-1.5 px-3 data-[state=active]:bg-background"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Apprentissage</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-1.5 px-3 data-[state=active]:bg-background"
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="flex items-center gap-1.5 px-3 data-[state=active]:bg-background"
          >
            <Database className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Données</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform">
          <PlatformSettingsCard initial={settings.platform} />
        </TabsContent>

        <TabsContent value="appearance">
          <AppearanceSettingsCard initial={settings.appearance} />
        </TabsContent>

        <TabsContent value="email">
          <EmailSettingsCard initial={settings.email} />
        </TabsContent>

        <TabsContent value="security">
          <SecuritySettingsCard initial={settings.security} />
        </TabsContent>

        <TabsContent value="learning">
          <LearningSettingsCard initial={settings.learning} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettingsCard initial={settings.notifications} />
        </TabsContent>

        <TabsContent value="data">
          <DataManagementCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
