"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Award, HelpCircle, Star, BookOpen, Mail, MapPin, Phone, User, Lock,
  Bell, Clock, CheckCircle2, Circle, Shield, Activity,
} from "lucide-react";
import type { AppView } from "@/store/app";
import { formatTimeAgo } from "@/utils/format";
import { ProfileForm } from "./profile-form";
import { PasswordForm } from "./password-form";
import { ProfileStats } from "./profile-stats";

interface ProfileStatsData { enrollments: number; completedEnrollments: number; certificates: number; badges: number; quizAttempts: number; }
interface CompletenessDetail { field: string; done: boolean; weight: number; }
interface ProfileCompleteness { percentage: number; details: CompletenessDetail[]; }
interface ActivityItem { id: string; type: string; title: string; message: string; createdAt: string; }
interface ExtendedUser { emailVerified?: Date | string | null; createdAt?: Date | string | null; }



function getActivityIcon(type: string) {
  const m: Record<string, React.ReactNode> = {
    CERTIFICAT: <Award className="w-4 h-4 text-amber-500" />,
    QUIZ: <HelpCircle className="w-4 h-4 text-emerald-500" />,
    COURS: <BookOpen className="w-4 h-4 text-sky-500" />,
    BADGE: <Star className="w-4 h-4 text-yellow-500" />,
    MESSAGE: <Mail className="w-4 h-4 text-violet-500" />,
  };
  return m[type] || <Activity className="w-4 h-4 text-gray-500" />;
}

const NOTIF_PREFS = [
  { id: "notif-course", label: "Nouveaux cours et mises à jour", desc: "Soyez notifié lors de la publication de nouveaux cours" },
  { id: "notif-quiz", label: "Résultats des quiz", desc: "Recevez les résultats et rappels de quiz" },
  { id: "notif-certificate", label: "Certificats et badges", desc: "Notifications pour les certificats obtenus et badges gagnés" },
  { id: "notif-message", label: "Messages", desc: "Notifications pour les nouveaux messages reçus" },
] as const;

export function ProfilePage() {
  const { user, navigate } = useAppStore();
  const [activeTab, setActiveTab] = useState("info");
  const [stats, setStats] = useState<ProfileStatsData | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [extendedUser, setExtendedUser] = useState<ExtendedUser>({});
  const [notif, setNotif] = useState<Record<string, boolean>>({ "notif-course": true, "notif-quiz": true, "notif-certificate": true, "notif-message": true });

  const fetchStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/profile/stats?userId=${user.id}`);
      if (res.ok) {
        const d = await res.json();
        setStats(d.stats); setCompleteness(d.completeness); setActivity(d.recentActivity || []);
        if (d.user) setExtendedUser({ emailVerified: d.user.emailVerified, createdAt: d.user.createdAt });
      }
    } catch { /* silent */ } finally { setLoadingStats(false); }
  }, [user?.id]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (!user) return null;

  const isLearnerRole = ["ARBITRE", "ENTRAINEUR", "JOUEUR"].includes(user.role || "");
  const emailVerified = !!(extendedUser.emailVerified ?? user?.emailVerified ?? false);
  const createdAt = extendedUser.createdAt ?? user?.createdAt ?? null;
  const cp = completeness?.percentage || 0;
  const cpColor = cp >= 80 ? "bg-emerald-500" : cp >= 50 ? "bg-amber-500" : cp >= 25 ? "bg-orange-500" : "bg-red-500";
  const cpTextColor = cp >= 80 ? "text-emerald-600" : cp >= 50 ? "text-amber-600" : "text-orange-600";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mon Profil</h2>
          <p className="text-muted-foreground mt-1">Gérez vos informations et paramètres</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStats} disabled={loadingStats} className="rounded-lg">
          <Activity className="w-4 h-4 mr-1.5" /> Actualiser
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card className="border-border/60 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{user.prenom.charAt(0)}{user.nom.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-foreground">{user.prenom} {user.nom}</h3>
                <Badge variant="secondary" className={cn("text-[10px]", ROLE_COLORS[user.role || "ARBITRE"])}>{ROLE_LABELS[user.role || "ARBITRE"]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                {user.telephone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{user.telephone}</span>}
                {user.region && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.region}</span>}
                {isLearnerRole && user.licenceNumber && <span className="flex items-center gap-1"><Shield className="w-3 h-3" />Licence {user.licenceNumber}</span>}
                {user.club && <span className="flex items-center gap-1"><Shield className="w-3 h-3" />{user.club}</span>}
              </div>
            </div>
          </div>
          {completeness && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Complétude du profil</span>
                <span className={cn("text-sm font-bold", cpTextColor)}>{cp}%</span>
              </div>
              <div className="bg-muted rounded-full h-2.5 w-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-500", cpColor)} style={{ width: `${cp}%` }} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {completeness.details.map((d) => (
                  <span key={d.field} className="flex items-center gap-1 text-xs">
                    {d.done ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Circle className="w-3 h-3 text-muted-foreground/40" />}
                    <span className={d.done ? "text-muted-foreground" : "text-muted-foreground/50"}>{d.field}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
          <TabsTrigger value="info" className="text-xs sm:text-sm"><User className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />Informations</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs sm:text-sm"><Award className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />Statistiques</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm"><Clock className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />Activité</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm"><Lock className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="animate-fadeIn">
          <ProfileForm emailVerified={emailVerified} isLearnerRole={isLearnerRole} onSaved={fetchStats} />
        </TabsContent>

        <TabsContent value="stats" className="animate-fadeIn">
          <ProfileStats stats={stats} loadingStats={loadingStats} onNavigate={navigate} />
        </TabsContent>

        <TabsContent value="activity" className="animate-fadeIn">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Activité récente</CardTitle>
              <CardDescription>Vos dernières actions sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="space-y-4 py-4">{[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-48" /><Skeleton className="h-3 w-32" /><Skeleton className="h-2.5 w-16" /></div>
                  </div>
                ))}</div>
              ) : activity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Commencez une formation pour voir votre activité ici</p>
                </div>
              ) : (
                <div className="space-y-0 max-h-[400px] overflow-y-auto pr-1">
                  {activity.map((item, idx) => (
                    <div key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
                      {idx < activity.length - 1 && <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />}
                      <div className="relative z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">{getActivityIcon(item.type)}</div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm font-medium text-foreground leading-tight">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{formatTimeAgo(item.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 animate-fadeIn">
          <PasswordForm userId={user.id} />
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Préférences de notification</CardTitle>
              <CardDescription>Choisissez quelles notifications vous souhaitez recevoir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {NOTIF_PREFS.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-1">
                  <div className="space-y-0.5 pr-4">
                    <label htmlFor={p.id} className="text-sm font-medium text-foreground cursor-pointer">{p.label}</label>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                  <Switch id={p.id} checked={notif[p.id] ?? true} onCheckedChange={() => setNotif((n) => ({ ...n, [p.id]: !n[p.id] }))} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Informations du compte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1"><span className="text-xs text-muted-foreground">Rôle</span><p className="font-medium text-foreground">{ROLE_LABELS[user.role || "ARBITRE"]}</p></div>
                <div className="space-y-1"><span className="text-xs text-muted-foreground">Statut du compte</span><p className="font-medium text-foreground"><Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px]">Actif</Badge></p></div>
                <div className="space-y-1"><span className="text-xs text-muted-foreground">Email vérifié</span><p className="font-medium text-foreground">{emailVerified ? <span className="text-emerald-600">Oui ✓</span> : <span className="text-amber-600">Non vérifié</span>}</p></div>
                <div className="space-y-1"><span className="text-xs text-muted-foreground">Inscrit le</span><p className="font-medium text-foreground">{createdAt ? new Date(createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
