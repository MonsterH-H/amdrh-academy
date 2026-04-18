"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Bell, BookOpen, Award, MessageSquare, HelpCircle, Star, Settings,
  Search, Send, Eye, ChevronLeft, ChevronRight, Users,
  Loader2, AlertTriangle, X, BarChart3, EyeOff,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  NOTIFICATION_TYPE_LABELS, ROLE_LABELS, ROLE_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface NotificationWithUser {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  user: {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    role: string;
    avatar: string | null;
  };
}

interface NotificationStats {
  total: number;
  byType: Record<string, number>;
  readRate: number;
  readCount: number;
  unreadCount: number;
}

type TargetMode = "all" | "roles" | "user";

const NOTIFICATION_TYPES = Object.keys(NOTIFICATION_TYPE_LABELS) as Array<
  keyof typeof NOTIFICATION_TYPE_LABELS
>;

const TYPE_COLORS: Record<string, string> = {
  COURS: "bg-blue-100 text-blue-700",
  CERTIFICAT: "bg-amber-100 text-amber-700",
  MESSAGE: "bg-green-100 text-green-700",
  QUIZ: "bg-purple-100 text-purple-700",
  BADGE: "bg-pink-100 text-pink-700",
  SYSTEME: "bg-gray-100 text-gray-700",
};

const TYPE_ICON_MAP: Record<string, typeof Bell> = {
  COURS: BookOpen,
  CERTIFICAT: Award,
  MESSAGE: MessageSquare,
  QUIZ: HelpCircle,
  BADGE: Star,
  SYSTEME: Settings,
};

const ROLES_FOR_TARGET = ["ADMIN", "FORMATEUR", "ARBITRE", "ENTRAINEUR", "JOUEUR"] as const;

// ─── Component ──────────────────────────────────────────────────────────────

export function AdminNotificationsPage() {
  const { user } = useAppStore();

  // History state
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [notifications, setNotifications] = useState<NotificationWithUser[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/admin/notifications?${params}`);
      const data = await res.json();
      setStats(data.stats || null);
      setNotifications(data.notifications || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les notifications", variant: "destructive" });
    } finally {
      setHistoryLoading(false);
    }
  }, [typeFilter, searchQuery, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  if (historyLoading && !stats) return <AdminNotificationsSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gestion des notifications</h2>
        <p className="text-muted-foreground mt-1">
          Créer et gérer les notifications pour les utilisateurs
        </p>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total envoyées"
            value={stats.total}
            icon={Bell}
            colorClass="bg-primary/10 text-primary"
          />
          <StatCard
            label="Taux de lecture"
            value={`${stats.readRate}%`}
            icon={Eye}
            colorClass="bg-emerald-500/10 text-emerald-600"
            subtitle={`${stats.readCount} lues / ${stats.unreadCount} non lues`}
          />
          <StatCard
            label="Non lues"
            value={stats.unreadCount}
            icon={EyeOff}
            colorClass="bg-amber-500/10 text-amber-600"
          />
          <TypeBreakdownCard byType={stats.byType} />
        </div>
      )}

      {/* Create Section */}
      <NotificationCreateForm onCreated={fetchHistory} />

      <Separator />

      {/* History Section */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="text-lg font-semibold text-foreground">Historique des notifications</h3>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre ou message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-lg"
            />
          </form>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => { setTypeFilter("ALL"); setPage(1); }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                typeFilter === "ALL"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border/60 hover:border-border"
              )}
            >
              Toutes
            </button>
            {NOTIFICATION_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); setPage(1); }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  typeFilter === t
                    ? cn("border-transparent text-white", TYPE_COLORS[t]?.replace("bg-", "bg-").split(" ")[0] || "bg-primary")
                    : "bg-white text-muted-foreground border-border/60 hover:border-border"
                )}
                style={typeFilter === t ? { backgroundColor: getBadgeBg(t), color: getBadgeText(t) } : undefined}
              >
                {NOTIFICATION_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {historyLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="border-border/60">
            <CardContent className="py-16 text-center">
              <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h4 className="font-semibold text-foreground mb-1">Aucune notification</h4>
              <p className="text-sm text-muted-foreground">
                {searchQuery || typeFilter !== "ALL"
                  ? "Aucun résultat pour vos filtres"
                  : "Les notifications envoyées apparaîtront ici"}
              </p>
            </CardContent>
          </Card>
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
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", typeColor)}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-foreground">{notif.title}</p>
                            <Badge variant="secondary" className={cn("text-[10px]", typeColor)}>
                              {NOTIFICATION_TYPE_LABELS[notif.type] || notif.type}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[10px]",
                                notif.isRead ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                              )}
                            >
                              {notif.isRead ? "Lue" : "Non lue"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Avatar className="w-3.5 h-3.5">
                                <AvatarFallback className="text-[6px]">
                                  {notif.user.prenom?.charAt(0)}{notif.user.nom?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {notif.user.prenom} {notif.user.nom}
                            </span>
                            <Badge variant="secondary" className={cn("text-[9px] px-1.5 py-0", ROLE_COLORS[notif.user.role])}>
                              {ROLE_LABELS[notif.user.role] || notif.user.role}
                            </Badge>
                            <span>
                              {new Date(notif.createdAt).toLocaleDateString("fr-FR", {
                                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="rounded-lg"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="rounded-lg"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
  subtitle,
}: {
  label: string;
  value: number | string;
  icon: typeof Bell;
  colorClass: string;
  subtitle?: string;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", colorClass)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xl font-bold leading-none">{value}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Type Breakdown Card ────────────────────────────────────────────────────

function TypeBreakdownCard({ byType }: { byType: Record<string, number> }) {
  const total = Object.values(byType).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10 text-violet-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold leading-none">0</p>
            <p className="text-[11px] text-muted-foreground mt-1">Par type</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">Répartition par type</p>
        </div>
        <div className="space-y-1">
          {NOTIFICATION_TYPES.filter((t) => (byType[t] || 0) > 0).map((t) => {
            const count = byType[t] || 0;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={t} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-16 truncate">
                  {NOTIFICATION_TYPE_LABELS[t]}
                </span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", getBarColor(t))}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-foreground w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Notification Create Form ───────────────────────────────────────────────

function NotificationCreateForm({ onCreated }: { onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<string>("MESSAGE");
  const [targetMode, setTargetMode] = useState<TargetMode>("all");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<Array<Record<string, unknown>>>([]);
  const [selectedUser, setSelectedUser] = useState<Record<string, unknown> | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchingUser, setSearchingUser] = useState(false);
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null);

  // Estimate recipient count when target changes
  useEffect(() => {
    if (targetMode === "user" && selectedUser) {
      setEstimatedCount(1);
    } else if (targetMode === "roles" && selectedRoles.length > 0) {
      fetch(`/api/users?role=ALL&limit=1`)
        .then((r) => r.json())
        .then((data) => {
          // Quick estimation: count active users by selected roles
          const total = data.pagination?.total || 0;
          // We don't have a multi-role filter, so we just estimate conservatively
          setEstimatedCount(total);
        })
        .catch(() => setEstimatedCount(null));
    } else if (targetMode === "all") {
      fetch(`/api/users?limit=1`)
        .then((r) => r.json())
        .then((data) => {
          setEstimatedCount(data.pagination?.total || 0);
        })
        .catch(() => setEstimatedCount(null));
    } else {
      setEstimatedCount(null);
    }
  }, [targetMode, selectedRoles, selectedUser]);

  // Search for users
  useEffect(() => {
    if (targetMode !== "user" || !userSearch || userSearch.length < 2) {
      setUserResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchingUser(true);
      try {
        const params = new URLSearchParams({ search: userSearch, limit: "10" });
        const res = await fetch(`/api/users?${params}`);
        const data = await res.json();
        setUserResults(data.users || []);
      } catch {
        setUserResults([]);
      } finally {
        setSearchingUser(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [userSearch, targetMode]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: "Champs requis", description: "Le titre et le message sont obligatoires", variant: "destructive" });
      return;
    }
    if (targetMode === "roles" && selectedRoles.length === 0) {
      toast({ title: "Rôle requis", description: "Sélectionnez au moins un rôle", variant: "destructive" });
      return;
    }
    if (targetMode === "user" && !selectedUser) {
      toast({ title: "Utilisateur requis", description: "Sélectionnez un utilisateur", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const body: Record<string, unknown> = { title, message, type };
      if (targetMode === "all") body.targetAll = true;
      if (targetMode === "roles") body.targetRoles = selectedRoles;
      if (targetMode === "user") body.userId = (selectedUser as Record<string, string>)?.id;

      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Erreur", description: data.error || "Impossible d'envoyer la notification", variant: "destructive" });
        return;
      }

      toast({
        title: "Notification envoyée",
        description: data.message || `${data.count} notification(s) créée(s)`,
      });

      // Reset form
      setTitle("");
      setMessage("");
      setType("MESSAGE");
      setTargetMode("all");
      setSelectedRoles([]);
      setSelectedUser(null);
      setUserSearch("");
      setShowPreview(false);
      onCreated();
    } catch {
      toast({ title: "Erreur serveur", description: "Veuillez réessayer", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const getTargetLabel = () => {
    if (targetMode === "all") return "Tous les utilisateurs";
    if (targetMode === "roles") {
      return selectedRoles.length > 0
        ? selectedRoles.map((r) => ROLE_LABELS[r] || r).join(", ")
        : "Aucun rôle sélectionné";
    }
    if (targetMode === "user" && selectedUser) {
      return `${selectedUser.prenom} ${selectedUser.nom}`;
    }
    return "Aucun utilisateur sélectionné";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create Form Card */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="w-4 h-4 text-primary" />
            Créer une notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Titre *</Label>
            <Input
              className="h-10 rounded-lg"
              placeholder="Titre de la notification"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Message *</Label>
            <Textarea
              className="rounded-lg min-h-[100px] resize-none"
              placeholder="Contenu de la notification..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground text-right">{message.length} caractères</p>
          </div>

          {/* Type Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Type</Label>
            <div className="flex gap-2 flex-wrap">
              {NOTIFICATION_TYPES.map((t) => {
                const Icon = TYPE_ICON_MAP[t] || Bell;
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                      type === t
                        ? cn("border-transparent text-white shadow-sm", TYPE_COLORS[t])
                        : "bg-white text-muted-foreground border-border/60 hover:border-border"
                    )}
                    style={type === t ? { backgroundColor: getBadgeBg(t), color: getBadgeText(t) } : undefined}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {NOTIFICATION_TYPE_LABELS[t]}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Target Audience */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Audience cible</Label>

            {/* Target Mode Tabs */}
            <div className="flex gap-1.5">
              {([
                { mode: "all" as const, label: "Tous les utilisateurs", icon: Users },
                { mode: "roles" as const, label: "Par rôle", icon: Star },
                { mode: "user" as const, label: "Utilisateur spécifique", icon: Bell },
              ]).map((opt) => (
                <button
                  key={opt.mode}
                  onClick={() => {
                    setTargetMode(opt.mode);
                    setSelectedUser(null);
                    setUserSearch("");
                    setUserResults([]);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                    targetMode === opt.mode
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-muted-foreground border-border/60 hover:border-border"
                  )}
                >
                  <opt.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              ))}
            </div>

            {/* All users */}
            {targetMode === "all" && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/40">
                <Users className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs font-medium text-foreground">Tous les utilisateurs actifs</p>
                  <p className="text-[10px] text-muted-foreground">
                    {estimatedCount !== null ? `${estimatedCount} utilisateur(s) recevront cette notification` : "Calcul..."}
                  </p>
                </div>
              </div>
            )}

            {/* By Role */}
            {targetMode === "roles" && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ROLES_FOR_TARGET.map((role) => (
                    <label
                      key={role}
                      className={cn(
                        "flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all",
                        selectedRoles.includes(role)
                          ? "bg-primary/5 border-primary/30"
                          : "bg-white border-border/40 hover:border-border/80"
                      )}
                    >
                      <Checkbox
                        checked={selectedRoles.includes(role)}
                        onCheckedChange={() => handleRoleToggle(role)}
                        className="rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{ROLE_LABELS[role]}</p>
                      </div>
                      <Badge variant="secondary" className={cn("text-[9px]", ROLE_COLORS[role])}>
                        {ROLE_LABELS[role]}
                      </Badge>
                    </label>
                  ))}
                </div>
                {selectedRoles.length > 0 && (
                  <p className="text-[10px] text-muted-foreground pl-1">
                    {selectedRoles.length} rôle(s) sélectionné(s)
                  </p>
                )}
              </div>
            )}

            {/* Specific User */}
            {targetMode === "user" && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    className="pl-9 h-9 rounded-lg text-sm"
                    placeholder="Rechercher par nom ou email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  {searchingUser && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>

                {/* Selected user chip */}
                {selectedUser && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                        {(selectedUser.prenom as string)?.charAt(0)}{(selectedUser.nom as string)?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {selectedUser.prenom} {selectedUser.nom}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {selectedUser.email}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="p-1 rounded hover:bg-muted transition-colors"
                    >
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                )}

                {/* Search Results Dropdown */}
                {!selectedUser && userResults.length > 0 && (
                  <div className="border border-border/60 rounded-lg overflow-hidden shadow-sm max-h-48 overflow-y-auto">
                    {userResults.map((u) => (
                      <button
                        key={u.id as string}
                        onClick={() => {
                          setSelectedUser(u);
                          setUserResults([]);
                          setUserSearch("");
                        }}
                        className="w-full flex items-center gap-2.5 p-2.5 hover:bg-muted/50 transition-colors text-left"
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-[9px]">
                            {(u.prenom as string)?.charAt(0)}{(u.nom as string)?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {u.prenom} {u.nom}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {u.email as string}
                          </p>
                        </div>
                        <Badge variant="secondary" className={cn("text-[9px] flex-shrink-0", ROLE_COLORS[(u.role as string) || "ARBITRE"])}>
                          {ROLE_LABELS[(u.role as string) || "ARBITRE"]}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}

                {userSearch.length >= 2 && !searchingUser && userResults.length === 0 && !selectedUser && (
                  <p className="text-[10px] text-muted-foreground pl-1">Aucun résultat trouvé</p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg text-xs"
              onClick={() => setShowPreview(!showPreview)}
              disabled={!title.trim() || !message.trim()}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              Aperçu
            </Button>
            <div className="flex-1" />
            <Button
              size="sm"
              className="rounded-lg text-xs bg-primary hover:bg-primary/90"
              onClick={handleSend}
              disabled={sending || !title.trim() || !message.trim()}
            >
              {sending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 mr-1.5" />
              )}
              Envoyer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="w-4 h-4 text-primary" />
            Aperçu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showPreview ? (
            <div className="space-y-4">
              {/* Preview Notification */}
              <div className="p-4 rounded-lg border border-border/60 bg-white">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", TYPE_COLORS[type] || "bg-gray-100 text-gray-700")}>
                    {(() => {
                      const Icon = TYPE_ICON_MAP[type] || Bell;
                      return <Icon className="w-5 h-5" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{title || "Titre..."}</p>
                      <Badge variant="secondary" className={cn("text-[10px]", TYPE_COLORS[type])}>
                        {NOTIFICATION_TYPE_LABELS[type] || type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                      {message || "Message..."}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {new Date().toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                </div>
              </div>

              <Separator />

              {/* Target Summary */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Détails de l&apos;envoi</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Type</p>
                    <p className="text-xs font-medium mt-0.5">{NOTIFICATION_TYPE_LABELS[type]}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Audience</p>
                    <p className="text-xs font-medium mt-0.5 truncate">{getTargetLabel()}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Destinataires</p>
                    <p className="text-xs font-medium mt-0.5">
                      {estimatedCount !== null ? `${estimatedCount} utilisateur(s)` : "—"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Mode</p>
                    <p className="text-xs font-medium mt-0.5">
                      {targetMode === "all" ? "Diffusion générale" : targetMode === "roles" ? "Par rôle(s)" : "Utilisateur unique"}
                    </p>
                  </div>
                </div>
              </div>

              {estimatedCount !== null && estimatedCount > 10 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200/60">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700">
                    Cette notification sera envoyée à <strong>{estimatedCount} utilisateurs</strong>. 
                    {estimatedCount > 50 && " Assurez-vous que le message est pertinent pour tous les destinataires."}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Remplissez le formulaire et cliquez sur &quot;Aperçu&quot; pour voir un aperçu de la notification
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function AdminNotificationsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[500px] rounded-xl" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getBadgeBg(t: string): string {
  const map: Record<string, string> = {
    COURS: "#3b82f6",
    CERTIFICAT: "#f59e0b",
    MESSAGE: "#22c55e",
    QUIZ: "#a855f7",
    BADGE: "#ec4899",
    SYSTEME: "#6b7280",
  };
  return map[t] || "#6b7280";
}

function getBadgeText(t: string): string {
  return "#ffffff";
}

function getBarColor(t: string): string {
  const map: Record<string, string> = {
    COURS: "bg-blue-500",
    CERTIFICAT: "bg-amber-500",
    MESSAGE: "bg-green-500",
    QUIZ: "bg-purple-500",
    BADGE: "bg-pink-500",
    SYSTEME: "bg-gray-500",
  };
  return map[t] || "bg-gray-500";
}
