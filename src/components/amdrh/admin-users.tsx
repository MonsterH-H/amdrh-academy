"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search, Users, ChevronLeft, ChevronRight, ArrowLeft,
  Eye, UserCog, Shield,
} from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AdminUsersPage() {
  const { user, navigate } = useAppStore();
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      try {
        const params = new URLSearchParams({ page: String(page), limit: "12" });
        if (roleFilter !== "ALL") params.set("role", roleFilter);
        if (search) params.set("search", search);
        const res = await fetch(`/api/users?${params}`);
        const data = await res.json();
        setUsers(data.users || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user, roleFilter, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    // Re-fetch with search
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: "1", limit: "12" });
        if (roleFilter !== "ALL") params.set("role", roleFilter);
        if (search) params.set("search", search);
        const res = await fetch(`/api/users?${params}`);
        const data = await res.json();
        setUsers(data.users || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  };

  const roleFilters = [
    { value: "ALL", label: "Tous" },
    { value: "ADMIN", label: "Admins" },
    { value: "FORMATEUR", label: "Formateurs" },
    { value: "ARBITRE", label: "Arbitres" },
    { value: "ENTRAINEUR", label: "Entraîneurs" },
    { value: "JOUEUR", label: "Joueurs" },
  ];

  if (loading) return <AdminUsersSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des utilisateurs</h2>
          <p className="text-muted-foreground mt-1">{users.length} utilisateurs</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-lg" />
      </form>

      <div className="flex gap-1 flex-wrap">
        {roleFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setRoleFilter(f.value); setPage(1); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              roleFilter === f.value ? "bg-primary text-white" : "bg-white text-muted-foreground border border-border/60"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {users.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucun utilisateur trouvé</h3>
        </div>
      ) : (
        <>
          <Card className="border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 text-xs text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Rôle</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Club</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Statut</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id as string} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                              {(u.prenom as string)?.charAt(0)}{(u.nom as string)?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{u.prenom as string} {u.nom as string}</p>
                            <p className="text-[10px] text-muted-foreground sm:hidden">{u.email as string}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">{u.email as string}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary" className={cn("text-[10px]", ROLE_COLORS[(u.role as string) || "ARBITRE"])}>
                          {ROLE_LABELS[(u.role as string) || "ARBITRE"]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{u.club as string || "—"}</td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <Badge variant={u.isActive ? "default" : "secondary"} className={cn("text-[10px]", u.isActive ? "bg-green-100 text-green-700" : "")}>
                          {u.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost" size="sm" className="h-8 rounded-lg"
                          onClick={() => navigate("admin-user-detail", { id: u.id as string })}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

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

export function AdminUserDetailPage() {
  const { viewParams, navigate } = useAppStore();
  const userId = viewParams?.id;
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((d) => setUserData(d.user))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <AdminUsersSkeleton />;
  if (!userData) return <div className="text-center py-20"><p className="text-muted-foreground">Utilisateur introuvable</p></div>;

  const enrollments = userData.enrollments as Array<Record<string, unknown>> || [];
  const certificates = userData.certificates as Array<Record<string, unknown>> || [];
  const quizAttempts = userData.quizAttempts as Array<Record<string, unknown>> || [];
  const counts = userData._count as Record<string, unknown> || {};

  return (
    <div className="space-y-6 animate-fadeIn">
      <button onClick={() => navigate("admin-users")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* Profile card */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {(userData.prenom as string)?.charAt(0)}{(userData.nom as string)?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-foreground">{userData.prenom} {userData.nom}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={cn("text-[10px]", ROLE_COLORS[(userData.role as string) || "ARBITRE"])}>
                  {ROLE_LABELS[(userData.role as string) || "ARBITRE"]}
                </Badge>
                <Badge variant={userData.isActive ? "default" : "secondary"} className={cn("text-[10px]", userData.isActive ? "bg-green-100 text-green-700" : "")}>
                  {userData.isActive ? "Actif" : "Inactif"}
                </Badge>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>{userData.email as string}</span>
                {userData.club && <span>• {userData.club as string}</span>}
                {userData.region && <span>• {userData.region as string}</span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Cours", value: counts.enrollments || 0, icon: UserCog },
          { label: "Certificats", value: counts.certificates || 0, icon: Shield },
          { label: "Quiz", value: counts.quizAttempts || 0, icon: Eye },
          { label: "Badges", value: counts.userBadges || 0, icon: Star },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border/60">
              <CardContent className="p-4 text-center">
                <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xl font-bold">{s.value as number}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent enrollments */}
      {enrollments.length > 0 && (
        <Card className="border-border/60">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-3">Cours suivis</h3>
            <div className="space-y-2">
              {enrollments.slice(0, 5).map((e) => {
                const course = e.course as Record<string, unknown>;
                return (
                  <div key={e.id as string} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{course.title as string}</p>
                      <p className="text-[10px] text-muted-foreground">{course.category as string}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={e.status === "termine" ? "default" : "secondary"} className={cn("text-[10px]", e.status === "termine" ? "bg-green-100 text-green-700" : "")}>
                        {e.status === "termine" ? "Terminé" : `${e.progress}%`}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { Star } from "lucide-react";

function AdminUsersSkeleton() {
  return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-10 w-64" /><Skeleton className="h-96 rounded-xl" /></div>;
}
