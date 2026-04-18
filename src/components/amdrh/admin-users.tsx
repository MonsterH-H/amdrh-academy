"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, Users, ChevronLeft, ChevronRight, ArrowLeft,
  Eye, BookOpen, Award, Star, Route, Clock, CheckCircle2,
  XCircle, UserCog, ToggleLeft, Trophy, Plus, Loader2, AlertTriangle, UserPlus,
  Mail, Phone, MapPin, CreditCard, ShieldCheck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ROLE_LABELS, ROLE_COLORS, QUIZ_STATUS_LABELS, QUIZ_STATUS_COLORS, REGIONS_MAROC } from "@/lib/constants";
import { cn } from "@/lib/utils";

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
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [roleFilter, page, search]);

  useEffect(() => {
    if (!user) return;
    fetchUsers();
  }, [user, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setLoading(true);
    fetchUsers();
  };

  const handleToggleActive = async (u: Record<string, unknown>) => {
    const newActive = !(u.isActive as boolean);
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });
      if (res.ok) {
        toast({
          title: newActive ? "Utilisateur activé" : "Utilisateur désactivé",
          description: `${u.prenom} ${u.nom} a été ${newActive ? "activé" : "désactivé"}.`,
        });
        fetchUsers();
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier le statut.", variant: "destructive" });
    }
  };

  const handleChangeRole = async (u: Record<string, unknown>, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast({
          title: "Rôle modifié",
          description: `${u.prenom} ${u.nom} est maintenant ${ROLE_LABELS[newRole]}.`,
        });
        fetchUsers();
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier le rôle.", variant: "destructive" });
    }
  };

  const roleFilters = [
    { value: "ALL", label: "Tous", count: total },
    { value: "ADMIN", label: "Admins" },
    { value: "FORMATEUR", label: "Formateurs" },
    { value: "ARBITRE", label: "Arbitres" },
    { value: "ENTRAINEUR", label: "Entraîneurs" },
    { value: "JOUEUR", label: "Joueurs" },
  ];

  if (loading) return <AdminUsersSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des utilisateurs</h2>
          <p className="text-muted-foreground mt-1">{total} utilisateurs inscrits</p>
        </div>
        <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchUsers} />
      </div>

      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher par nom, email, licence..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-lg" />
      </form>

      <div className="flex gap-1.5 flex-wrap">
        {roleFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setRoleFilter(f.value); setPage(1); setLoading(true); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              roleFilter === f.value
                ? "bg-primary text-white border-primary"
                : "bg-white text-muted-foreground border-border/60 hover:border-border"
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
          <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres de recherche</p>
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
                            <AvatarFallback className={cn("text-[10px] font-bold", !u.isActive && "opacity-50")}>
                              {(u.prenom as string)?.charAt(0)}{(u.nom as string)?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className={cn("text-sm font-medium text-foreground", !u.isActive && "text-muted-foreground line-through")}>
                              {u.prenom as string} {u.nom as string}
                            </p>
                            <p className="text-[10px] text-muted-foreground sm:hidden">{u.email as string}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">{u.email as string}</td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="cursor-pointer">
                              <Badge variant="secondary" className={cn("text-[10px]", ROLE_COLORS[(u.role as string) || "ARBITRE"])}>
                                {ROLE_LABELS[(u.role as string) || "ARBITRE"]}
                              </Badge>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Changer le rôle</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {Object.entries(ROLE_LABELS).map(([key, label]) => (
                              <DropdownMenuItem key={key} onClick={() => handleChangeRole(u, key)} className={cn(key === u.role && "bg-muted")}>
                                <span className={cn("w-2 h-2 rounded-full mr-2", key === u.role ? "bg-primary" : "bg-transparent border border-border")} />
                                {label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{u.club as string || "—"}</td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <button onClick={() => handleToggleActive(u)} className="cursor-pointer">
                          <Badge variant={u.isActive ? "default" : "secondary"} className={cn("text-[10px] transition-all", u.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-50 text-red-600 hover:bg-red-100")}>
                            {u.isActive ? "Actif" : "Inactif"}
                          </Badge>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 rounded-lg" onClick={() => navigate("admin-user-detail", { id: u.id as string })}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 rounded-lg", !u.isActive ? "text-green-600 hover:bg-green-50" : "text-red-600 hover:bg-red-50")}
                            onClick={() => handleToggleActive(u)}
                          >
                            {u.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(page - 1); setLoading(true); }} className="rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(page + 1); setLoading(true); }} className="rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CreateUserDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", password: "", role: "ARBITRE",
    telephone: "", club: "", region: "", licenceNumber: "",
  });

  const handleSubmit = async () => {
    setError("");
    if (!form.prenom || !form.nom || !form.email || !form.password) {
      setError("Prénom, nom, email et mot de passe sont requis");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setLoading(true);
    try {
      const bcrypt = await import("bcryptjs");
      const passwordHash = await bcrypt.hash(form.password, 12);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          passwordHash,
          emailVerified: true,
          isActive: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la création");
        return;
      }
      toast({ title: "Utilisateur créé avec succès", description: `${form.prenom} ${form.nom} a été ajouté.` });
      onOpenChange(false);
      setForm({ prenom: "", nom: "", email: "", password: "", role: "ARBITRE", telephone: "", club: "", region: "", licenceNumber: "" });
      onCreated();
    } catch {
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 rounded-lg text-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Nouvel utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            Créer un utilisateur
          </DialogTitle>
          <DialogDescription>Remplissez les informations pour créer un nouveau compte.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">{error}</div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Prénom *</Label>
              <Input className="h-10 rounded-lg" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Nom *</Label>
              <Input className="h-10 rounded-lg" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Email *</Label>
            <Input type="email" className="h-10 rounded-lg" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Mot de passe *</Label>
            <Input type="password" className="h-10 rounded-lg" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 caractères" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Rôle *</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Téléphone</Label>
              <Input className="h-10 rounded-lg" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="+212 6XX-XXXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">N° Licence</Label>
              <Input className="h-10 rounded-lg" value={form.licenceNumber} onChange={(e) => setForm({ ...form, licenceNumber: e.target.value })} placeholder="XXX-2024-XXX" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Club</Label>
              <Input className="h-10 rounded-lg" value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Région</Label>
              <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {REGIONS_MAROC.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
            Créer l&apos;utilisateur
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
    const res = await fetch(`/api/users/${userId}`);
    const d = await res.json();
    setUserData(d.user);
    setPathEnrollments(d.learningPathEnrollments || []);
    setEditForm({
      prenom: d.user.prenom || "",
      nom: d.user.nom || "",
      telephone: d.user.telephone || "",
      club: d.user.club || "",
      region: d.user.region || "",
      bio: d.user.bio || "",
    });
    setLoading(false);
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
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });
      if (res.ok) {
        toast({ title: newActive ? "Utilisateur activé" : "Utilisateur désactivé", description: `Le compte de ${userData.prenom} ${userData.nom} a été ${newActive ? "activé" : "désactivé"}.` });
        fetchUser();
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleChangeRole = async (newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast({ title: "Rôle modifié", description: `${userData.prenom} ${userData.nom} est maintenant ${ROLE_LABELS[newRole]}.` });
        fetchUser();
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        toast({ title: "Profil mis à jour", description: "Les informations ont été enregistrées." });
        setEditMode(false);
        fetchUser();
      } else {
        toast({ title: "Erreur", description: "Impossible de sauvegarder.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur serveur", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email }),
      });
      if (res.ok) {
        toast({ title: "Lien envoyé", description: `Un email de réinitialisation a été envoyé à ${userData.email}.` });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <button onClick={() => navigate("admin-users")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour à la liste
      </button>

      {/* Profile card */}
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
                  <Badge variant="secondary" className={cn("text-[10px]", ROLE_COLORS[(userData.role as string) || "ARBITRE"])}>
                    {ROLE_LABELS[(userData.role as string) || "ARBITRE"]}
                  </Badge>
                  <Badge variant={userData.isActive ? "default" : "secondary"} className={cn("text-[10px]", userData.isActive ? "bg-green-100 text-green-700" : "")}>
                    {userData.isActive ? "Actif" : "Inactif"}
                  </Badge>
                  {!!userData.emailVerified && (
                    <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Vérifié
                    </Badge>
                  )}
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
              <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={handleResetPassword}>
                Réinitialiser MDP
              </Button>
              <Button
                variant={userData.isActive ? "outline" : "default"}
                size="sm"
                className="rounded-lg text-xs"
                onClick={handleToggleActive}
              >
                <ToggleLeft className="w-4 h-4 mr-1.5" />
                {userData.isActive ? "Désactiver" : "Activer"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-lg text-xs">
                    <UserCog className="w-4 h-4 mr-1.5" />
                    Rôle
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Changer le rôle</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <DropdownMenuItem key={key} onClick={() => handleChangeRole(key)}>
                      <span className={cn("w-2 h-2 rounded-full mr-2", key === userData.role ? "bg-primary" : "bg-border")} />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Edit profile section */}
          <Separator className="my-4" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Informations du profil</h3>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setEditMode(!editMode)}>
              {editMode ? "Annuler" : "Modifier"}
            </Button>
          </div>
          {editMode ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Prénom</Label>
                <Input className="h-9 rounded-lg text-sm" value={editForm.prenom} onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Nom</Label>
                <Input className="h-9 rounded-lg text-sm" value={editForm.nom} onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Téléphone</Label>
                <Input className="h-9 rounded-lg text-sm" value={editForm.telephone} onChange={(e) => setEditForm({ ...editForm, telephone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Club</Label>
                <Input className="h-9 rounded-lg text-sm" value={editForm.club} onChange={(e) => setEditForm({ ...editForm, club: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Région</Label>
                <Select value={editForm.region} onValueChange={(v) => setEditForm({ ...editForm, region: v })}>
                  <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {REGIONS_MAROC.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Bio</Label>
                <Input className="h-9 rounded-lg text-sm" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving} size="sm" className="rounded-lg text-xs">
                  {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : null}
                  Sauvegarder
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
              {!!userData.bio && (
                <div className="sm:col-span-2 flex justify-between sm:block">
                  <span className="text-muted-foreground text-xs">Bio</span>
                  <span className="font-medium text-right">{userData.bio as string}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Cours suivis", value: counts.enrollments || 0, icon: BookOpen, color: "bg-primary/10 text-primary" },
          { label: "Certificats", value: counts.certificates || 0, icon: Award, color: "bg-emerald-500/10 text-emerald-600" },
          { label: "Quiz réussis", value: passedQuizzes, icon: CheckCircle2, color: "bg-amber-500/10 text-amber-600" },
          { label: "Badges", value: counts.userBadges || 0, icon: Star, color: "bg-violet-500/10 text-violet-600" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Learning Paths */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Route className="w-4 h-4 text-primary" />
            Parcours d&apos;apprentissage
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pathEnrollments.length === 0 ? (
            <div className="text-center py-8"><Route className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" /><p className="text-sm text-muted-foreground">Aucun parcours suivi</p></div>
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
                          {!!path.isMandatory && <Badge variant="secondary" className="text-[9px] bg-red-50 text-red-600 border-red-200">Obligatoire</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">Parcours {ROLE_LABELS[path.targetRole as string] || (path.targetRole as string)}</p>
                      </div>
                      <Badge variant={isCompleted ? "default" : "secondary"} className={cn("text-[10px] flex-shrink-0", isCompleted ? "bg-green-100 text-green-700" : "")}>
                        {isCompleted ? "Terminé" : "En cours"}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                        <span>Progression</span><span className="font-medium text-foreground">{Math.round(progress)}%</span>
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

      {/* Two columns: Quiz + Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="w-4 h-4 text-primary" />
              Tentatives de quiz
              <Badge variant="secondary" className="text-[10px] ml-auto">{quizAttempts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quizAttempts.length === 0 ? (
              <div className="text-center py-8"><Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" /><p className="text-sm text-muted-foreground">Aucune tentative</p></div>
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
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", isPassed ? "bg-green-100" : isFailed ? "bg-red-100" : "bg-gray-100")}>
                          {isPassed ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : isFailed ? <XCircle className="w-4 h-4 text-red-600" /> : <Clock className="w-4 h-4 text-gray-500" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{quiz.title as string}</p>
                          <p className="text-[10px] text-muted-foreground">{submittedAt ? new Date(submittedAt).toLocaleDateString("fr-FR") : "En cours"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn("text-sm font-semibold", isPassed ? "text-green-700" : isFailed ? "text-red-700" : "text-muted-foreground")}>{percentage}%</span>
                        <Badge variant="secondary" className={cn("text-[9px]", QUIZ_STATUS_COLORS[(qa.status as string)] || "")}>
                          {QUIZ_STATUS_LABELS[(qa.status as string)] || String(qa.status)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-4 h-4 text-primary" />
              Cours suivis
              <Badge variant="secondary" className="text-[10px] ml-auto">{enrollments.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <div className="text-center py-8"><BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" /><p className="text-sm text-muted-foreground">Aucun cours suivi</p></div>
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
                        <Badge variant={isCompleted ? "default" : "secondary"} className={cn("text-[10px] flex-shrink-0", isCompleted ? "bg-green-100 text-green-700" : "")}>
                          {isCompleted ? "Terminé" : `${Math.round(progress)}%`}
                        </Badge>
                      </div>
                      {!isCompleted && <Progress value={progress} className="h-1" />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {certificates.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="w-4 h-4 text-emerald-600" />
              Certificats obtenus
              <Badge variant="secondary" className="text-[10px] ml-auto">{certificates.length}</Badge>
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
                      <p className="text-[10px] text-muted-foreground">{cert.code as string} • {new Date(cert.issuedAt as string).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground flex-shrink-0">{cert.score as number}/{cert.maxScore as number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AdminUsersSkeleton() {
  return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-10 w-64" /><Skeleton className="h-96 rounded-xl" /></div>;
}


