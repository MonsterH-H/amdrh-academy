"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Users, ChevronLeft, ChevronRight, ArrowLeft,
  Eye, BookOpen, Award, Star, Route, Clock, CheckCircle2,
  XCircle, UserCog, ToggleLeft, Trophy,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ROLE_LABELS, ROLE_COLORS, QUIZ_STATUS_LABELS, QUIZ_STATUS_COLORS } from "@/lib/constants";
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
  const [pathEnrollments, setPathEnrollments] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((d) => {
        setUserData(d.user);
        setPathEnrollments(d.learningPathEnrollments || []);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <AdminUsersSkeleton />;
  if (!userData) return <div className="text-center py-20"><p className="text-muted-foreground">Utilisateur introuvable</p></div>;

  const enrollments = userData.enrollments as Array<Record<string, unknown>> || [];
  const certificates = userData.certificates as Array<Record<string, unknown>> || [];
  const quizAttempts = userData.quizAttempts as Array<Record<string, unknown>> || [];
  const counts = userData._count as Record<string, number> || {};

  // Derived stats
  const passedQuizzes = quizAttempts.filter((q) => q.status === "REUSSI").length;

  const handleToggleActive = () => {
    toast({
      title: userData.isActive ? "Désactivation" : "Activation",
      description: `La ${userData.isActive ? "désactivation" : "activation"} de ${(userData.prenom as string)} ${(userData.nom as string)} nécessite une confirmation administrateur en production.`,
    });
  };

  const handleChangeRole = (newRole: string) => {
    toast({
      title: "Changement de rôle",
      description: `Le passage au rôle « ${ROLE_LABELS[newRole]} » pour ${(userData.prenom as string)} ${(userData.nom as string)} nécessite une confirmation administrateur en production.`,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <button onClick={() => navigate("admin-users")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      {/* Profile card with action buttons */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {(userData.prenom as string)?.charAt(0)}{(userData.nom as string)?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-foreground">{userData.prenom} {userData.nom}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className={cn("text-[10px]", ROLE_COLORS[(userData.role as string) || "ARBITRE"])}>
                    {ROLE_LABELS[(userData.role as string) || "ARBITRE"]}
                  </Badge>
                  <Badge variant={userData.isActive ? "default" : "secondary"} className={cn("text-[10px]", userData.isActive ? "bg-green-100 text-green-700" : "")}>
                    {userData.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                  <span>{userData.email as string}</span>
                  {userData.club && <span>• {userData.club as string}</span>}
                  {userData.region && <span>• {userData.region as string}</span>}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant={userData.isActive ? "outline" : "default"}
                size="sm"
                className="rounded-lg"
                onClick={handleToggleActive}
              >
                <ToggleLeft className="w-4 h-4 mr-1.5" />
                {userData.isActive ? "Désactiver" : "Activer"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <UserCog className="w-4 h-4 mr-1.5" />
                    Changer le rôle
                    <ChevronRight className="w-3 h-3 ml-1 rotate-90" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Rôles disponibles</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(ROLE_LABELS).filter(([key]) => key !== userData.role).map(([key, label]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => handleChangeRole(key)}
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid - responsive: 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{counts.enrollments || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Cours suivis</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{counts.certificates || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Certificats</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <CheckCircle2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{passedQuizzes}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Quiz réussis</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Star className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{counts.userBadges || 0}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Badges</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Path Enrollments */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Route className="w-4 h-4 text-primary" />
            Parcours d&apos;apprentissage
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pathEnrollments.length === 0 ? (
            <div className="text-center py-8">
              <Route className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aucun parcours suivi</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pathEnrollments.slice(0, 10).map((pe) => {
                const path = pe.learningPath as Record<string, unknown>;
                const isCompleted = pe.status === "termine";
                const progress = (pe.progress as number) || 0;
                return (
                  <div key={pe.id as string} className="p-3 rounded-lg border border-border/40 hover:border-border/80 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium truncate">{path.title as string}</p>
                          {path.isMandatory && (
                            <Badge variant="secondary" className="text-[9px] bg-red-50 text-red-600 border-red-200">Obligatoire</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Parcours {ROLE_LABELS[path.targetRole as string] || path.targetRole as string}
                        </p>
                      </div>
                      <Badge
                        variant={isCompleted ? "default" : "secondary"}
                        className={cn(
                          "text-[10px] flex-shrink-0",
                          isCompleted ? "bg-green-100 text-green-700" : ""
                        )}
                      >
                        {isCompleted ? "Terminé" : "En cours"}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                        <span>Progression</span>
                        <span className="font-medium text-foreground">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="bg-border/40" />

      {/* Two-column layout: Quiz attempts + Course enrollments on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Attempt History */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="w-4 h-4 text-primary" />
              Tentatives de quiz
              <Badge variant="secondary" className="text-[10px] ml-auto">
                {quizAttempts.length} tentative{quizAttempts.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quizAttempts.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune tentative</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {quizAttempts.slice(0, 10).map((qa) => {
                  const quiz = qa.quiz as Record<string, unknown>;
                  const score = qa.score as number;
                  const maxScore = qa.maxScore as number;
                  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
                  const isPassed = qa.status === "REUSSI";
                  const isFailed = qa.status === "ECHOUE";
                  const submittedAt = qa.submittedAt as string | null;
                  return (
                    <div key={qa.id as string} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                          isPassed ? "bg-green-100" : isFailed ? "bg-red-100" : "bg-gray-100"
                        )}>
                          {isPassed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : isFailed ? (
                            <XCircle className="w-4 h-4 text-red-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{quiz.title as string}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {submittedAt ? new Date(submittedAt).toLocaleDateString("fr-FR") : "En cours"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn(
                          "text-sm font-semibold",
                          isPassed ? "text-green-700" : isFailed ? "text-red-700" : "text-muted-foreground"
                        )}>
                          {percentage}%
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn("text-[9px]", QUIZ_STATUS_COLORS[(qa.status as string)] || "")}
                        >
                          {QUIZ_STATUS_LABELS[(qa.status as string)] || qa.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Enrollments */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-4 h-4 text-primary" />
              Cours suivis
              <Badge variant="secondary" className="text-[10px] ml-auto">
                {enrollments.length} cours
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucun cours suivi</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {enrollments.slice(0, 10).map((e) => {
                  const course = e.course as Record<string, unknown>;
                  const progress = (e.progress as number) || 0;
                  const isCompleted = e.status === "termine";
                  return (
                    <div key={e.id as string} className="p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="min-w-0 mr-2">
                          <p className="text-sm font-medium truncate">{course.title as string}</p>
                          <p className="text-[10px] text-muted-foreground">{course.category as string}</p>
                        </div>
                        <Badge
                          variant={isCompleted ? "default" : "secondary"}
                          className={cn(
                            "text-[10px] flex-shrink-0",
                            isCompleted ? "bg-green-100 text-green-700" : ""
                          )}
                        >
                          {isCompleted ? "Terminé" : `${Math.round(progress)}%`}
                        </Badge>
                      </div>
                      {!isCompleted && (
                        <Progress value={progress} className="h-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Certificates section */}
      {certificates.length > 0 && (
        <>
          <Separator className="bg-border/40" />
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="w-4 h-4 text-emerald-600" />
                Certificats obtenus
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  {certificates.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {certificates.slice(0, 10).map((cert) => (
                  <div key={cert.id as string} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{cert.courseTitle as string}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {cert.code as string} • {new Date(cert.issuedAt as string).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground flex-shrink-0">
                      {cert.score as number}/{cert.maxScore as number}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function AdminUsersSkeleton() {
  return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-10 w-64" /><Skeleton className="h-96 rounded-xl" /></div>;
}
