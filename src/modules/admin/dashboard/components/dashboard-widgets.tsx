"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookPlus, Users, ClipboardList, Award, Megaphone,
  BarChart3, RefreshCw, ScanSearch, HelpCircle,
  UserPlus, CheckCircle, AlertTriangle, MessageSquare, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app";
import type { AppView } from "@/store/app";
import { timeAgo, ROLE_LABELS } from "../types";
import type {
  RecentEnrollment, RecentQuizAttempt, TopPerformer, RecentUser, AdminKpi,
} from "../types";

const MEDALS = ["🥇", "🥈", "🥉"];

export function ActivityFeed({
  enrollments, quizAttempts,
}: {
  enrollments: RecentEnrollment[]; quizAttempts: RecentQuizAttempt[];
}) {
  const items = [
    ...enrollments.map((e) => ({ type: "enrollment" as const, data: e, date: e.startedAt })),
    ...quizAttempts.map((q) => ({ type: "quiz" as const, data: q, date: q.submittedAt })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <ActivityIcon className="h-5 w-5 text-primary" />
        <CardTitle className="text-base">Activité récente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Aucune activité</p>}
        {items.map((item, i) => {
          if (item.type === "enrollment") {
            const e = item.data as RecentEnrollment;
            return (
              <div key={`e-${i}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={e.user.avatar ?? undefined} />
                  <AvatarFallback>{e.user.prenom[0]}{e.user.nom[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate"><span className="font-medium">{e.user.prenom} {e.user.nom}</span> s&apos;est inscrit à <span className="font-medium">{e.course.title}</span></p>
                  <p className="text-xs text-muted-foreground">{timeAgo(e.startedAt)}</p>
                </div>
                <UserPlus className="h-4 w-4 text-green-500 shrink-0" />
              </div>
            );
          }
          const q = item.data as RecentQuizAttempt;
          return (
            <div key={`q-${i}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
              <Avatar className="h-8 w-8">
                <AvatarImage src={q.user.avatar ?? undefined} />
                <AvatarFallback>{q.user.prenom[0]}{q.user.nom[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate"><span className="font-medium">{q.user.prenom} {q.user.nom}</span> — {q.quizTitle}</p>
                <p className="text-xs text-muted-foreground">{q.score}% · {timeAgo(q.submittedAt)}</p>
              </div>
              <Badge variant={q.status === "PASSED" ? "default" : "destructive"} className="text-[10px] px-1.5 shrink-0">
                {q.score}%
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ActivityIcon(props: React.ComponentProps<typeof CheckCircle>) {
  return <CheckCircle {...props} />;
}

export function TopPerformersWidget({ performers }: { performers: TopPerformer[] }) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <Award className="h-5 w-5 text-primary" />
        <CardTitle className="text-base">Meilleurs performeurs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {performers.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Aucun performeur</p>}
        {performers.slice(0, 5).map((p, i) => (
          <div key={p.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
            <span className="text-lg w-7 text-center">{MEDALS[i] ?? <span className="text-muted-foreground text-sm">{i + 1}</span>}</span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={p.user.avatar ?? undefined} />
              <AvatarFallback>{p.user.prenom[0]}{p.user.nom[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{p.user.prenom} {p.user.nom}</p>
              <p className="text-xs text-muted-foreground truncate">{p.quizTitle}</p>
            </div>
            <Badge variant="secondary" className="shrink-0">{p.bestScore}%</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function RecentUsersWidget({ users }: { users: RecentUser[] }) {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <CardTitle className="text-base">Utilisateurs récents</CardTitle>
        <Badge variant="secondary" className="ml-auto">{users.length}</Badge>
      </CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {users.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Aucun utilisateur</p>}
        {users.slice(0, 8).map((u) => (
          <button
            key={u.id}
            onClick={() => navigate("admin-user-detail" as AppView, { id: u.id })}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 w-full text-left transition-colors cursor-pointer"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={u.avatar ?? undefined} />
              <AvatarFallback>{u.prenom[0]}{u.nom[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{u.prenom} {u.nom}</p>
              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0">{ROLE_LABELS[u.role] ?? u.role}</Badge>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

const QUICK_ACTIONS = [
  { label: "Ajouter cours", view: "course-create" as AppView, icon: BookPlus, color: "text-blue-600" },
  { label: "Gérer utilisateurs", view: "admin-users" as AppView, icon: Users, color: "text-sky-600" },
  { label: "Créer quiz", view: "admin-quizzes" as AppView, icon: ClipboardList, color: "text-violet-600" },
  { label: "Émettre certificat", view: "admin-certificates" as AppView, icon: Award, color: "text-amber-600" },
  { label: "Envoyer annonce", view: "admin-notifications" as AppView, icon: Megaphone, color: "text-rose-600" },
  { label: "Voir analytics", view: "admin-analytics" as AppView, icon: BarChart3, color: "text-indigo-600" },
  { label: "Sync fédération", view: "admin-sync" as AppView, icon: RefreshCw, color: "text-cyan-600" },
  { label: "Traçabilité", view: "admin-traceability" as AppView, icon: ScanSearch, color: "text-orange-600" },
];

export function QuickActionsWidget() {
  const navigate = useAppStore((s) => s.navigate);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <CardTitle className="text-base">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Button key={a.view} variant="outline" size="sm"
                onClick={() => navigate(a.view)} className="justify-start gap-2 h-9 text-xs">
                <Icon className={cn("h-4 w-4 shrink-0", a.color)} />
                {a.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function PendingTasksWidget({ kpi }: { kpi: AdminKpi }) {
  const navigate = useAppStore((s) => s.navigate);
  const tasks = [
    { count: kpi.unverifiedUsers, label: "Utilisateurs non vérifiés", view: "admin-users" as AppView, icon: AlertTriangle, color: "text-amber-600" },
    { count: kpi.coursesInReview, label: "Cours en attente de review", view: "admin-courses" as AppView, icon: BookOpen, color: "text-orange-600" },
    { count: kpi.unreadMessages, label: "Messages non lus", view: "messages" as AppView, icon: MessageSquare, color: "text-red-600" },
  ].filter((t) => t.count > 0);

  if (tasks.length === 0) return null;

  return (
    <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/10">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <CardTitle className="text-base">Tâches en attente</CardTitle>
        <Badge variant="destructive" className="ml-auto">{tasks.reduce((s, t) => s + t.count, 0)}</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.label}
              onClick={() => navigate(t.view)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-amber-100/80 dark:hover:bg-amber-900/20 w-full text-left transition-colors cursor-pointer">
              <Icon className={cn("h-4 w-4 shrink-0", t.color)} />
              <span className="text-sm flex-1">{t.label}</span>
              <Badge variant="secondary">{t.count}</Badge>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
