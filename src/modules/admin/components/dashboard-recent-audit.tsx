"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Shield } from "lucide-react";
import { useAppStore } from "@/store/app";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuditItem {
  id: string;
  action: string;
  entity: string;
  createdAt: string;
  user: { prenom: string; nom: string; role: string };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RecentAuditActions() {
  const { user } = useAppStore();
  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/audit-logs?limit=5&userId=${user?.id}&role=${user?.role}`);
        if (!res.ok) return;
        const data = await res.json();
        setItems((data.logs || []).slice(0, 5));
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const ACTION_LABELS: Record<string, string> = {
    "user.create": "Utilisateur créé",
    "user.update": "Utilisateur modifié",
    "user.delete": "Utilisateur supprimé",
    "user.import": "Import utilisateurs",
    "course.create": "Cours créé",
    "course.update": "Cours modifié",
    "course.publish": "Cours publié",
    "quiz.create": "Quiz créé",
    "quiz.update": "Quiz modifié",
    "certificate.issue": "Certificat délivré",
    "certificate.revoke": "Certificat révoqué",
    "notification.send": "Notification envoyée",
  };

  return (
    <Card className="border-border/60">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Actions récentes (Audit)
        </h3>
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucune action enregistrée</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    {ACTION_LABELS[item.action] || item.action}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    par {item.user.prenom} {item.user.nom} · {new Date(item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Badge variant="secondary" className="text-[9px] shrink-0 bg-muted/60">{item.entity}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
