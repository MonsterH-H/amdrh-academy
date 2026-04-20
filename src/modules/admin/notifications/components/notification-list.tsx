"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, BarChart3, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TYPE_COLORS, TYPE_ICON_MAP, NOTIFICATION_TYPES, NOTIFICATION_TYPE_LABELS,
  ROLE_LABELS, ROLE_COLORS, getBadgeBg,
} from "../types";
import type { NotificationWithUser } from "../types";

// ─── Stat Card ───────────────────────────────────────────────────────────────

export function StatCard({ label, value, icon: Icon, colorClass, subtitle }: {
  label: string; value: number | string; icon: typeof Bell; colorClass: string; subtitle?: string;
}) {
  return (
    <Card className="border-border/60"><CardContent className="p-4 flex items-center gap-3">
      <div className={cn("p-2 rounded-lg", colorClass)}><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-xl font-bold leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
        {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
      </div>
    </CardContent></Card>
  );
}

// ─── Type Breakdown Card ─────────────────────────────────────────────────────

export function TypeBreakdownCard({ byType }: { byType: Record<string, number> }) {
  const total = Object.values(byType).reduce((a, b) => a + b, 0);
  if (total === 0) return (
    <Card className="border-border/60"><CardContent className="p-4 flex items-center gap-3">
      <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600"><BarChart3 className="w-5 h-5" /></div>
      <div><p className="text-xl font-bold leading-none">0</p><p className="text-[11px] text-muted-foreground mt-1">Par type</p></div>
    </CardContent></Card>
  );
  const barColorMap: Record<string, string> = {
    COURS: "bg-blue-500", CERTIFICAT: "bg-amber-500", MESSAGE: "bg-green-500",
    QUIZ: "bg-purple-500", BADGE: "bg-pink-500", SYSTEME: "bg-gray-500",
  };
  return (
    <Card className="border-border/60"><CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600"><BarChart3 className="w-4 h-4" /></div>
        <p className="text-[11px] text-muted-foreground font-medium">Répartition par type</p>
      </div>
      <div className="space-y-1">
        {NOTIFICATION_TYPES.filter((t) => (byType[t] || 0) > 0).map((t) => {
          const count = byType[t] || 0;
          return (
            <div key={t} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-16 truncate">{NOTIFICATION_TYPE_LABELS[t]}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", barColorMap[t] || "bg-gray-500")} style={{ width: `${Math.round((count / total) * 100)}%` }} />
              </div>
              <span className="text-[10px] font-medium text-foreground w-6 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </CardContent></Card>
  );
}

// ─── Notification List ───────────────────────────────────────────────────────

export function NotificationList({
  notifications, typeFilter, searchQuery, page, totalPages, loading,
  onTypeFilterChange, onPageChange, onSearch, onSearchChange,
}: {
  notifications: NotificationWithUser[];
  typeFilter: string;
  searchQuery: string;
  page: number;
  totalPages: number;
  loading: boolean;
  onTypeFilterChange: (t: string) => void;
  onPageChange: (p: number) => void;
  onSearch: (e: React.FormEvent) => void;
  onSearchChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h3 className="text-lg font-semibold text-foreground">Historique des notifications</h3>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form onSubmit={onSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher par titre ou message..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="pl-9 rounded-lg" />
        </form>
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => onTypeFilterChange("ALL")} className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
            typeFilter === "ALL" ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-border/60 hover:border-border")}>Toutes</button>
          {NOTIFICATION_TYPES.map((t) => (
            <button key={t} onClick={() => onTypeFilterChange(t)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                typeFilter === t ? "border-transparent text-white" : "bg-white text-muted-foreground border-border/60 hover:border-border")}
              style={typeFilter === t ? { backgroundColor: getBadgeBg(t), color: "#fff" } : undefined}>
              {NOTIFICATION_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : notifications.length === 0 ? (
        <Card className="border-border/60"><CardContent className="py-16 text-center">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h4 className="font-semibold text-foreground mb-1">Aucune notification</h4>
          <p className="text-sm text-muted-foreground">{searchQuery || typeFilter !== "ALL" ? "Aucun résultat pour vos filtres" : "Les notifications envoyées apparaîtront ici"}</p>
        </CardContent></Card>
      ) : (
        <>
          <div className="space-y-2">
            {notifications.map((notif) => {
              const Icon = TYPE_ICON_MAP[notif.type] || Bell;
              const typeColor = TYPE_COLORS[notif.type] || "bg-gray-100 text-gray-700";
              return (
                <Card key={notif.id} className="border-border/60 hover:shadow-sm transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", typeColor)}><Icon className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground">{notif.title}</p>
                          <Badge variant="secondary" className={cn("text-[10px]", typeColor)}>{NOTIFICATION_TYPE_LABELS[notif.type] || notif.type}</Badge>
                          <Badge variant="secondary" className={cn("text-[10px]", notif.isRead ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>{notif.isRead ? "Lue" : "Non lue"}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Avatar className="w-3.5 h-3.5"><AvatarFallback className="text-[6px]">{notif.user?.prenom?.charAt(0) || ""}{notif.user?.nom?.charAt(0) || ""}</AvatarFallback></Avatar>
                            {notif.user?.prenom || ""} {notif.user?.nom || ""}
                          </span>
                          <Badge variant="secondary" className={cn("text-[9px] px-1.5 py-0", ROLE_COLORS[notif.user?.role || ""])}>{ROLE_LABELS[notif.user?.role || ""] || notif.user?.role || ""}</Badge>
                          <span>{new Date(notif.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-lg"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="rounded-lg"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
