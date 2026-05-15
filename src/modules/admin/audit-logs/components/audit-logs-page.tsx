"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, Download, ChevronLeft, ChevronRight, FileText, Shield,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/app";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuditLogRow {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; prenom: string; nom: string; email: string; role: string };
}

// ─── Action / Entity Labels ──────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  "user.create": "Création utilisateur",
  "user.update": "Modification utilisateur",
  "user.delete": "Suppression utilisateur",
  "user.import": "Import utilisateurs",
  "course.create": "Création cours",
  "course.update": "Modification cours",
  "course.delete": "Suppression cours",
  "course.publish": "Publication cours",
  "quiz.create": "Création quiz",
  "quiz.update": "Modification quiz",
  "quiz.delete": "Suppression quiz",
  "certificate.issue": "Délivrance certificat",
  "certificate.revoke": "Révocation certificat",
  "notification.send": "Envoi notification",
  "learning_path.create": "Création parcours",
  "learning_path.update": "Modification parcours",
};

const ENTITY_COLORS: Record<string, string> = {
  User: "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  Course: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  Quiz: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Certificate: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  Notification: "bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
  LearningPath: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
};

// ─── Main Component ──────────────────────────────────────────────────────────

export function AdminAuditLogsPage() {
  const { user } = useAppStore();
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        userId: user.id,
        role: user.role,
      });
      if (actionFilter && actionFilter !== "all") params.set("action", actionFilter);
      if (entityFilter && entityFilter !== "all") params.set("entity", entityFilter);
      if (search) params.set("userIdFilter", search);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
      setActionTypes(data.actionTypes || []);
      setEntityTypes(data.entityTypes || []);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les logs d'audit.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, page, actionFilter, entityFilter, search, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = () => {
    if (logs.length === 0) {
      toast({ title: "Aucune donnée", description: "Il n'y a pas de logs à exporter." });
      return;
    }
    const headers = ["Date", "Utilisateur", "Email", "Rôle", "Action", "Entité", "Détails", "IP"];
    const rows = logs.map((log) => [
      new Date(log.createdAt).toLocaleString("fr-FR"),
      `${log.user.prenom} ${log.user.nom}`,
      log.user.email,
      log.user.role,
      ACTION_LABELS[log.action] || log.action,
      log.entity,
      log.details || "",
      log.ipAddress || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export réussi", description: "Le fichier CSV a été téléchargé." });
  };

  const resetFilters = () => {
    setActionFilter("all");
    setEntityFilter("all");
    setSearch("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  if (loading && logs.length === 0) return <AuditLogsSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Journal d&apos;audit</h2>
          <p className="text-muted-foreground mt-1">{total} actions enregistrées</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetFilters} className="rounded-lg text-xs">
            Réinitialiser
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="rounded-lg text-xs gap-1.5">
            <Download className="w-3.5 h-3.5" /> Exporter CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end flex-wrap">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); }} className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="ID utilisateur..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-lg h-10 text-xs" />
        </form>
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
          <SelectTrigger className="h-10 rounded-lg w-48 text-xs"><SelectValue placeholder="Toutes les actions" /></SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="all">Toutes les actions</SelectItem>
            {actionTypes.map((a) => <SelectItem key={a} value={a}>{ACTION_LABELS[a] || a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
          <SelectTrigger className="h-10 rounded-lg w-40 text-xs"><SelectValue placeholder="Toutes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les entités</SelectItem>
            {entityTypes.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="h-10 rounded-lg w-36 text-xs" placeholder="Début" />
        <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="h-10 rounded-lg w-36 text-xs" placeholder="Fin" />
      </div>

      {/* Table */}
      {logs.length === 0 ? (
        <div className="text-center py-20">
          <Shield className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucun log d&apos;audit</h3>
          <p className="text-sm text-muted-foreground">Les actions administratives apparaîtront ici</p>
        </div>
      ) : (
        <>
          <Card className="border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 text-xs text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Action</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Entité</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">IP</th>
                    <th className="text-right py-3 px-4 font-medium">Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{log.user.prenom} {log.user.nom}</span>
                          <Badge variant="secondary" className={cn("text-[9px]", ROLE_COLORS[log.user.role] || "")}>{ROLE_LABELS[log.user.role] || log.user.role}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{log.user.email}</p>
                      </td>
                      <td className="py-3 px-4 text-xs text-foreground hidden sm:table-cell font-medium">
                        {ACTION_LABELS[log.action] || log.action}
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <Badge variant="secondary" className={cn("text-[10px]", ENTITY_COLORS[log.entity] || "bg-muted text-foreground")}>{log.entity}</Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground hidden lg:table-cell font-mono">{log.ipAddress || "—"}</td>
                      <td className="py-3 px-4 text-right">
                        {log.details ? (
                          <Button variant="ghost" size="sm" className="h-7 rounded-lg text-xs" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                            <FileText className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Expanded detail */}
          {expandedId && (() => {
            const log = logs.find((l) => l.id === expandedId);
            if (!log) return null;
            let parsed: unknown = null;
            try { parsed = log.details ? JSON.parse(log.details) : null; } catch { parsed = log.details; }
            return (
              <Card className="border-border/60">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Détails de l&apos;action :</p>
                  <pre className="text-xs text-foreground bg-muted/50 p-3 rounded-lg overflow-auto max-h-48 font-mono">
                    {typeof parsed === "object" ? JSON.stringify(parsed, null, 2) : String(parsed || "")}
                  </pre>
                </CardContent>
              </Card>
            );
          })()}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function AuditLogsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72" /></div><Skeleton className="h-9 w-28 rounded-lg" /></div>
      <div className="flex gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-36 rounded-lg" />)}</div>
      <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
    </div>
  );
}
