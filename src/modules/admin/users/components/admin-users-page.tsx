"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, UserCog, ToggleLeft, Loader2,
  Mail, Phone, MapPin, CreditCard, ShieldCheck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ROLE_LABELS, ROLE_COLORS, REGIONS_MAROC } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { UserTable } from "./user-table";
import { CreateUserDialog } from "./user-form-dialog";
import {
  UserStatsGrid, LearningPathsCard, QuizAndCoursesCards, CertificatesCard,
} from "./user-activity-sections";
import { AdminUsersSkeleton } from "./skeletons";

// ─── Admin Users List Page ───────────────────────

export function AdminUsersPage() {
  const { user, navigate } = useAppStore();
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch { toast({ title: "Erreur de chargement", description: "Impossible de charger la liste des utilisateurs.", variant: "destructive" }); } finally { setLoading(false); }
  }, [roleFilter, page, search]);

  useEffect(() => { if (!user) return; fetchUsers(); }, [user, fetchUsers]);

  const handleToggleActive = async (u: Record<string, unknown>) => {
    const newActive = !(u.isActive as boolean);
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: newActive }) });
      if (res.ok) { toast({ title: newActive ? "Utilisateur activé" : "Utilisateur désactivé", description: `${u.prenom} ${u.nom} a été ${newActive ? "activé" : "désactivé"}.` }); fetchUsers(); }
    } catch { toast({ title: "Erreur", description: "Impossible de modifier le statut.", variant: "destructive" }); }
  };

  const handleChangeRole = async (u: Record<string, unknown>, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: newRole }) });
      if (res.ok) { toast({ title: "Rôle modifié", description: `${u.prenom} ${u.nom} est maintenant ${ROLE_LABELS[newRole]}.` }); fetchUsers(); }
    } catch { toast({ title: "Erreur", description: "Impossible de modifier le rôle.", variant: "destructive" }); }
  };

  if (loading) return <AdminUsersSkeleton />;

  return (
    <UserTable
      users={users} loading={loading} total={total} page={page} totalPages={totalPages}
      roleFilter={roleFilter} search={search}
      onSearchChange={(v) => setSearch(v)} onSearchSubmit={() => { setLoading(true); fetchUsers(); }}
      onRoleFilterChange={(v) => setRoleFilter(v)} onPageChange={(p) => { setPage(p); setLoading(true); }}
      onToggleActive={handleToggleActive} onChangeRole={handleChangeRole}
      onViewUser={(id) => navigate("admin-user-detail", { id })}
      createButton={<CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchUsers} />}
    />
  );
}

// ─── Admin User Detail Page ─────────────────────

export function AdminUserDetailPage() {
  const { viewParams, navigate } = useAppStore();
  const userId = viewParams?.id;
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
  const [pathEnrollments, setPathEnrollments] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Erreur");
      const d = await res.json();
      if (!d.user) { setUserData(null); setLoading(false); return; }
      setUserData(d.user);
      setPathEnrollments(d.learningPathEnrollments || []);
      setEditForm({ prenom: d.user.prenom || "", nom: d.user.nom || "", telephone: d.user.telephone || "", club: d.user.club || "", region: d.user.region || "", bio: d.user.bio || "" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger l'utilisateur.", variant: "destructive" });
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  if (loading) return <AdminUsersSkeleton />;
  if (!userData) return <div className="text-center py-20"><p className="text-muted-foreground">Utilisateur introuvable</p></div>;

  const enrollments = (userData.enrollments as Array<Record<string, unknown>>) || [];
  const certificates = (userData.certificates as Array<Record<string, unknown>>) || [];
  const quizAttempts = (userData.quizAttempts as Array<Record<string, unknown>>) || [];
  const counts = (userData._count as Record<string, number>) || {};
  const passedQuizzes = quizAttempts.filter((q) => q.status === "REUSSI").length;

  const handleToggleActive = async () => {
    const newActive = !(userData.isActive as boolean);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: newActive }) });
      if (res.ok) { toast({ title: newActive ? "Utilisateur activé" : "Utilisateur désactivé", description: `Le compte de ${userData.prenom} ${userData.nom} a été ${newActive ? "activé" : "désactivé"}.` }); fetchUser(); }
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const handleChangeRole = async (newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: newRole }) });
      if (res.ok) { toast({ title: "Rôle modifié", description: `${userData.prenom} ${userData.nom} est maintenant ${ROLE_LABELS[newRole]}.` }); fetchUser(); }
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      if (res.ok) { toast({ title: "Profil mis à jour", description: "Les informations ont été enregistrées." }); setEditMode(false); fetchUser(); }
      else { toast({ title: "Erreur", description: "Impossible de sauvegarder.", variant: "destructive" }); }
    } catch { toast({ title: "Erreur serveur", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const handleResetPassword = async () => {
    try {
      const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userData.email }) });
      if (res.ok) { toast({ title: "Lien envoyé", description: `Un email de réinitialisation a été envoyé à ${userData.email}.` }); }
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const profileFields = [
    { key: "prenom", label: "Prénom" }, { key: "nom", label: "Nom" },
    { key: "telephone", label: "Téléphone" }, { key: "club", label: "Club" },
  ] as const;

  return (
    <div className="space-y-6 animate-fadeIn">
      <button onClick={() => navigate("admin-users")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour à la liste
      </button>

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
                <h2 className="text-xl font-bold text-foreground">{String(userData.prenom)} {String(userData.nom)}</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className={cn("text-[10px]", ROLE_COLORS[(userData.role as string) || "ARBITRE"])}>{ROLE_LABELS[(userData.role as string) || "ARBITRE"]}</Badge>
                  <Badge variant={userData.isActive ? "default" : "secondary"} className={cn("text-[10px]", userData.isActive ? "bg-green-100 text-green-700" : "")}>{userData.isActive ? "Actif" : "Inactif"}</Badge>
                  {!!userData.emailVerified && <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary"><ShieldCheck className="w-3 h-3 mr-1" /> Vérifié</Badge>}
                </div>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {userData.email as string}</span>
                  {!!userData.telephone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {userData.telephone as string}</span>}
                  {!!userData.club && <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {userData.club as string}</span>}
                  {!!userData.region && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {userData.region as string}</span>}
                  {!!userData.licenceNumber && <span className="flex items-center gap-1">Licence: {userData.licenceNumber as string}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={handleResetPassword}>Réinitialiser MDP</Button>
              <Button variant={userData.isActive ? "outline" : "default"} size="sm" className="rounded-lg text-xs" onClick={handleToggleActive}>
                <ToggleLeft className="w-4 h-4 mr-1.5" />{userData.isActive ? "Désactiver" : "Activer"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="rounded-lg text-xs"><UserCog className="w-4 h-4 mr-1.5" />Rôle</Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Changer le rôle</DropdownMenuLabel><DropdownMenuSeparator />
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <DropdownMenuItem key={key} onClick={() => handleChangeRole(key)}><span className={cn("w-2 h-2 rounded-full mr-2", key === userData.role ? "bg-primary" : "bg-border")} />{label}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Separator className="my-4" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Informations du profil</h3>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setEditMode(!editMode)}>{editMode ? "Annuler" : "Modifier"}</Button>
          </div>
          {editMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profileFields.map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs font-medium">{label}</Label>
                  <Input className="h-9 rounded-lg text-sm" value={editForm[key] || ""} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} />
                </div>
              ))}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Région</Label>
                <Select value={editForm.region} onValueChange={(v) => setEditForm({ ...editForm, region: v })}>
                  <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>{REGIONS_MAROC.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Bio</Label>
                <Input className="h-9 rounded-lg text-sm" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving} size="sm" className="rounded-lg text-xs">
                  {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}Sauvegarder
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div className="flex justify-between sm:block">
                <span className="text-muted-foreground text-xs">Dernière connexion</span>
                <span className="font-medium">{userData.lastLoginAt ? new Date(userData.lastLoginAt as string).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Jamais"}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-muted-foreground text-xs">Inscrit le</span>
                <span className="font-medium">{new Date(userData.createdAt as string).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              {!!userData.bio && <div className="sm:col-span-2 flex justify-between sm:block"><span className="text-muted-foreground text-xs">Bio</span><span className="font-medium text-right">{userData.bio as string}</span></div>}
            </div>
          )}
        </CardContent>
      </Card>

      <UserStatsGrid counts={counts} passedQuizzes={passedQuizzes} />
      <LearningPathsCard pathEnrollments={pathEnrollments} />
      <QuizAndCoursesCards enrollments={enrollments} quizAttempts={quizAttempts} />
      <CertificatesCard certificates={certificates} />
    </div>
  );
}
