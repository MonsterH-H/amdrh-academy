"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ActivityItem {
  id: string;
  date: string;
  userName: string;
  action: string;
  details: string;
  status: string;
}

// ─── Recent Activity Table ───────────────────────────────────────────────────

export function DashboardActivity() {
  const { user } = useAppStore();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollRes, quizRes, certRes] = await Promise.all([
          fetch(`/api/admin/enrollments?limit=5&userId=${user?.id}&role=${user?.role}`).catch(() => null),
          fetch(`/api/admin/quiz-attempts?limit=5&userId=${user?.id}&role=${user?.role}`).catch(() => null),
          fetch(`/api/admin/certificates?limit=3&userId=${user?.id}&role=${user?.role}`).catch(() => null),
        ]);

        const all: ActivityItem[] = [];

        if (enrollRes?.ok) {
          const d = await enrollRes.json();
          for (const e of (d.enrollments || []).slice(0, 5)) {
            all.push({
              id: e.id,
              date: e.createdAt,
              userName: e.userName || "Utilisateur",
              action: "Inscription",
              details: e.courseTitle || "Cours",
              status: e.status || "en_cours",
            });
          }
        }

        if (quizRes?.ok) {
          const d = await quizRes.json();
          for (const a of (d.attempts || []).slice(0, 5)) {
            all.push({
              id: a.id,
              date: a.submittedAt,
              userName: a.userName || "Utilisateur",
              action: "Soumission quiz",
              details: `${a.quizTitle || "Quiz"} — ${a.score || 0}%`,
              status: a.status || "SOUMIS",
            });
          }
        }

        if (certRes?.ok) {
          const d = await certRes.json();
          for (const c of ((d.certificates || d) || []).slice(0, 3)) {
            all.push({
              id: c.id,
              date: c.issuedAt,
              userName: c.userName || "Utilisateur",
              action: "Certificat délivré",
              details: c.courseTitle || "Cours",
              status: "ACTIVE",
            });
          }
        }

        // Sort by date descending and take top 10
        all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setItems(all.slice(0, 10));
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Activité récente
        </h3>
        {loading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-lg" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucune activité récente</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] text-muted-foreground border-b border-border/40">
                  <th className="text-left py-2.5 px-3 font-medium">Date</th>
                  <th className="text-left py-2.5 px-3 font-medium">Utilisateur</th>
                  <th className="text-left py-2.5 px-3 font-medium hidden sm:table-cell">Action</th>
                  <th className="text-left py-2.5 px-3 font-medium">Détails</th>
                  <th className="text-left py-2.5 px-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border/15 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 text-xs text-muted-foreground whitespace-nowrap">
                      {item.date ? new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "—"}
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="text-sm font-medium text-foreground truncate max-w-[140px]">{item.userName}</p>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-muted-foreground hidden sm:table-cell">{item.action}</td>
                    <td className="py-2.5 px-3">
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{item.details}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={item.status} action={item.action} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status, action }: { status: string; action: string }) {
  let className = "bg-muted text-foreground";
  let label = status;

  if (action === "Certificat délivré") {
    className = "bg-amber-50 dark:bg-amber-500/10 text-amber-700";
    label = "Actif";
  } else if (action === "Soumission quiz") {
    if (status === "REUSSI") { className = "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700"; label = "Réussi"; }
    else if (status === "ECHOUE") { className = "bg-red-50 dark:bg-red-500/10 text-red-700"; label = "Échoué"; }
    else { className = "bg-sky-50 dark:bg-sky-500/10 text-sky-700"; label = "Soumis"; }
  } else if (status === "termine") {
    className = "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700";
    label = "Terminé";
  } else if (status === "abandonne") {
    className = "bg-red-50 dark:bg-red-500/10 text-red-700";
    label = "Abandonné";
  } else if (status === "en_cours") {
    className = "bg-sky-50 dark:bg-sky-500/10 text-sky-700";
    label = "En cours";
  }

  return <Badge variant="secondary" className={cn("text-[10px] font-medium", className)}>{label}</Badge>;
}
