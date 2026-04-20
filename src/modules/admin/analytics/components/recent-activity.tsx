"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity, GraduationCap, Award, Target, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RecentEnrollment {
  id: string;
  userName: string;
  userEmail: string;
  courseTitle: string;
  status: string;
  createdAt: string;
}

interface RecentQuiz {
  id: string;
  userName: string;
  quizTitle: string;
  score: number;
  status: string;
  submittedAt: string | null;
}

interface RecentCert {
  id: string;
  userName: string;
  courseTitle: string;
  issuedAt: string;
}

// ─── Recent Activity Section ─────────────────────────────────────────────────

export function RecentActivitySection() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState("enrollments");
  const [enrollments, setEnrollments] = useState<RecentEnrollment[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<RecentQuiz[]>([]);
  const [certificates, setCertificates] = useState<RecentCert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollRes, quizRes, certRes] = await Promise.all([
          fetch(`/api/admin/enrollments?limit=20&userId=${user?.id}&role=${user?.role}`).catch(() => null),
          fetch(`/api/admin/quiz-attempts?limit=20&userId=${user?.id}&role=${user?.role}`).catch(() => null),
          fetch(`/api/admin/certificates?limit=20&userId=${user?.id}&role=${user?.role}`).catch(() => null),
        ]);
        if (enrollRes?.ok) {
          const d = await enrollRes.json();
          setEnrollments((d.enrollments || []).slice(0, 20).map((e: Record<string, unknown>) => ({
            id: e.id as string, userName: e.userName as string, userEmail: e.userEmail as string,
            courseTitle: (e.courseTitle as string) || "Cours", status: (e.status as string) || "en_cours", createdAt: e.createdAt as string,
          })));
        }
        if (quizRes?.ok) {
          const d = await quizRes.json();
          setQuizAttempts((d.attempts || []).slice(0, 20).map((a: Record<string, unknown>) => ({
            id: a.id as string, userName: a.userName as string, quizTitle: a.quizTitle as string,
            score: a.score as number, status: a.status as string, submittedAt: a.submittedAt as string | null,
          })));
        }
        if (certRes?.ok) {
          const d = await certRes.json();
          setCertificates(((d.certificates || d) || []).slice(0, 20).map((c: Record<string, unknown>) => ({
            id: c.id as string, userName: (c.userName as string) || "Utilisateur",
            courseTitle: (c.courseTitle as string) || "Cours", issuedAt: c.issuedAt as string,
          })));
        }
      } catch { /* silently fail */ } finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Activité récente
        </h3>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="enrollments" className="text-xs"><GraduationCap className="w-3.5 h-3.5 mr-1.5" />Inscriptions</TabsTrigger>
            <TabsTrigger value="quizzes" className="text-xs"><Target className="w-3.5 h-3.5 mr-1.5" />Quiz</TabsTrigger>
            <TabsTrigger value="certificates" className="text-xs"><Award className="w-3.5 h-3.5 mr-1.5" />Certificats</TabsTrigger>
          </TabsList>
          <TabsContent value="enrollments">
            {loading ? <LoadingSkeleton /> : enrollments.length === 0 ? <EmptyState message="Aucune inscription récente" /> : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {enrollments.map((item) => <ActivityRow key={item.id} icon={<GraduationCap className="w-4 h-4 text-sky-500" />} title={item.userName} subtitle={item.courseTitle} time={item.createdAt} badge={{
                  label: item.status === "termine" ? "Terminé" : item.status === "abandonne" ? "Abandonné" : "En cours",
                  className: item.status === "termine" ? "bg-green-100 text-green-700" : item.status === "abandonne" ? "bg-red-100 text-red-700" : "bg-sky-100 text-sky-700",
                }} />)}
              </div>
            )}
          </TabsContent>
          <TabsContent value="quizzes">
            {loading ? <LoadingSkeleton /> : quizAttempts.length === 0 ? <EmptyState message="Aucune tentative de quiz récente" /> : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {quizAttempts.map((item) => <ActivityRow key={item.id} icon={
                  item.status === "REUSSI" ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : item.status === "ECHOUE" ? <XCircle className="w-4 h-4 text-red-500" /> : <Clock className="w-4 h-4 text-amber-500" />
                } title={item.userName} subtitle={item.quizTitle} time={item.submittedAt} badge={{
                  label: item.status === "REUSSI" ? `${item.score}% ✓` : item.status === "ECHOUE" ? `${item.score}% ✗` : `${item.score}%`,
                  className: item.status === "REUSSI" ? "bg-green-100 text-green-700" : item.status === "ECHOUE" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700",
                }} />)}
              </div>
            )}
          </TabsContent>
          <TabsContent value="certificates">
            {loading ? <LoadingSkeleton /> : certificates.length === 0 ? <EmptyState message="Aucun certificat récent" /> : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {certificates.map((item) => <ActivityRow key={item.id} icon={<Award className="w-4 h-4 text-amber-500" />} title={item.userName} subtitle={item.courseTitle} time={item.issuedAt} badge={{ label: "Certifié", className: "bg-amber-100 text-amber-700" }} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ActivityRow({ icon, title, subtitle, time, badge }: {
  icon: React.ReactNode; title: string; subtitle: string; time: string | null; badge: { label: string; className: string } | null;
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors">
      <div className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge && <Badge variant="secondary" className={cn("text-[10px]", badge.className)}>{badge.label}</Badge>}
        <span className="text-[10px] text-muted-foreground hidden sm:block">
          {time ? new Date(time).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "—"}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>;
}
