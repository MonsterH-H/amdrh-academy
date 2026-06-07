"use client";

import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useState,
  useEffect,
  useCallback,
} from "react";
import { ROLE_LABELS, ROLE_COLORS, REGIONS_MAROC } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Award,
  HelpCircle,
  Star,
  Save,
  Loader2,
  Shield,
  Bell,
  Clock,
  CheckCircle2,
  Circle,
  Trophy,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  User,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import type { AppView } from "@/store/app";

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface ProfileStats {
  enrollments: number;
  completedEnrollments: number;
  certificates: number;
  badges: number;
  quizAttempts: number;
}

interface CompletenessDetail {
  field: string;
  done: boolean;
  weight: number;
}

interface ProfileCompleteness {
  percentage: number;
  details: CompletenessDetail[];
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
}

interface ExtendedUser {
  emailVerified?: Date | string | null;
  createdAt?: Date | string | null;
}

// ──────────────────────────────────────────────────────────
// Time ago helper
// ──────────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ──────────────────────────────────────────────────────────
// Profile Page
// ──────────────────────────────────────────────────────────

export function ProfilePage() {
  const { user, setUser, navigate } = useAppStore();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  // Profile edit state
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [club, setClub] = useState("");
  const [region, setRegion] = useState("");
  const [bio, setBio] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Notification preferences
  const [notifCourse, setNotifCourse] = useState(true);
  const [notifQuiz, setNotifQuiz] = useState(true);
  const [notifCertificate, setNotifCertificate] = useState(true);
  const [notifMessage, setNotifMessage] = useState(true);

  // Stats & data
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  // Extended user data from stats API (includes emailVerified, createdAt)
  const [extendedUser, setExtendedUser] = useState<ExtendedUser>({});

  // Sync form state with user data from store
  useEffect(() => {
    if (user) {
      setPrenom(user.prenom);
      setNom(user.nom);
      setTelephone(user.telephone || "");
      setClub(user.club || "");
      setRegion(user.region || "");
      setBio(user.bio || "");
    }
  }, [user]);

  // Fetch profile stats
  const fetchStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/profile/stats?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setCompleteness(data.completeness);
        setActivity(data.recentActivity || []);
        // Store extended user data
        if (data.user) {
          setExtendedUser({
            emailVerified: data.user.emailVerified,
            createdAt: data.user.createdAt,
          });
        }
      }
    } catch {
      // Silent fail for stats
    } finally {
      setLoadingStats(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const hasChanges =
    user &&
    (prenom !== user.prenom ||
      nom !== user.nom ||
      telephone !== (user.telephone || "") ||
      club !== (user.club || "") ||
      region !== (user.region || "") ||
      bio !== (user.bio || ""));

  const handleSave = async () => {
    if (!user) return;

    if (!prenom.trim() || !nom.trim()) {
      toast({
        title: "Champs requis",
        description: "Le prénom et le nom sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    if (prenom.trim().length < 2 || nom.trim().length < 2) {
      toast({
        title: "Validation échouée",
        description: "Le prénom et le nom doivent contenir au moins 2 caractères.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          prenom: prenom.trim(),
          nom: nom.trim(),
          telephone: telephone.trim(),
          club: club.trim(),
          region: region.trim(),
          bio: bio.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de mettre à jour le profil.",
          variant: "destructive",
        });
        return;
      }

      setUser({
        ...user,
        prenom: data.user.prenom,
        nom: data.user.nom,
        telephone: data.user.telephone,
        club: data.user.club,
        region: data.user.region,
        bio: data.user.bio,
      });

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });

      // Refresh stats after save
      fetchStats();
    } catch {
      toast({
        title: "Erreur réseau",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Champs requis",
        description: "Tous les champs sont requis.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Mot de passe faible",
        description: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Confirmation incorrecte",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Erreur",
          description: data.error || "Impossible de changer le mot de passe.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast({
        title: "Erreur réseau",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "CERTIFICAT": return <Award className="w-4 h-4 text-amber-500" />;
      case "QUIZ": return <HelpCircle className="w-4 h-4 text-emerald-500" />;
      case "COURS": return <BookOpen className="w-4 h-4 text-sky-500" />;
      case "BADGE": return <Star className="w-4 h-4 text-yellow-500" />;
      case "MESSAGE": return <Mail className="w-4 h-4 text-violet-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const isLearnerRole = user?.role && ["ARBITRE", "ENTRAINEUR", "JOUEUR"].includes(user.role);

  // Resolve emailVerified and createdAt from extended user data first, then store user
  const emailVerified = extendedUser.emailVerified ?? user?.emailVerified ?? false;
  const createdAt = extendedUser.createdAt ?? user?.createdAt ?? null;

  if (!user) return null;

  const completenessPercent = completeness?.percentage || 0;
  const completenessColor =
    completenessPercent >= 80 ? "bg-emerald-500" :
    completenessPercent >= 50 ? "bg-amber-500" :
    completenessPercent >= 25 ? "bg-orange-500" :
    "bg-red-500";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mon Profil</h2>
          <p className="text-muted-foreground mt-1">Gérez vos informations et paramètres</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchStats()}
          disabled={loadingStats}
          className="rounded-lg"
        >
          <Activity className="w-4 h-4 mr-1.5" />
          Actualiser
        </Button>
      </div>

      {/* Profile Header Card with Completeness */}
      <Card className="border-border/60 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {prenom.charAt(0)}{nom.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-foreground">{prenom} {nom}</h3>
                <Badge variant="secondary" className={cn("text-[10px]", ROLE_COLORS[user.role || "ARBITRE"])}>
                  {ROLE_LABELS[user.role || "ARBITRE"]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                {user.telephone && (
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{user.telephone}</span>
                )}
                {user.region && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.region}</span>
                )}
                {isLearnerRole && user.licenceNumber && (
                  <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" />Licence {user.licenceNumber}</span>
                )}
                {user.club && (
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" />{user.club}</span>
                )}
              </div>
            </div>
          </div>

          {/* Completeness Indicator */}
          {completeness && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Complétude du profil
                </span>
                <span className={cn(
                  "text-sm font-bold",
                  completenessPercent >= 80 ? "text-emerald-600" :
                  completenessPercent >= 50 ? "text-amber-600" :
                  "text-orange-600"
                )}>
                  {completenessPercent}%
                </span>
              </div>
              <div className="relative">
                <div className="bg-muted rounded-full h-2.5 w-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", completenessColor)}
                    style={{ width: `${completenessPercent}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {completeness.details.map((d) => (
                  <span key={d.field} className="flex items-center gap-1 text-xs">
                    {d.done ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Circle className="w-3 h-3 text-muted-foreground/40" />
                    )}
                    <span className={d.done ? "text-muted-foreground" : "text-muted-foreground/50"}>
                      {d.field}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:inline-flex">
          <TabsTrigger value="info" className="text-xs sm:text-sm">
            <User className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
            Informations
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-xs sm:text-sm">
            <Trophy className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
            Statistiques
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
            Activité
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">
            <Lock className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        {/* TAB: Profile Info / Edit */}
        <TabsContent value="info" className="animate-fadeIn">
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Informations personnelles</CardTitle>
              <CardDescription>Modifiez vos informations de profil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-prenom" className="text-sm">Prénom *</Label>
                  <Input
                    id="profile-prenom"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="h-10 rounded-lg"
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-nom" className="text-sm">Nom *</Label>
                  <Input
                    id="profile-nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="h-10 rounded-lg"
                    placeholder="Votre nom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="text-sm">
                    <span className="flex items-center gap-1.5">
                      Email
                      {emailVerified && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0">
                          Vérifié
                        </Badge>
                      )}
                    </span>
                  </Label>
                  <Input
                    id="profile-email"
                    value={user.email}
                    disabled
                    className="h-10 rounded-lg bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-telephone" className="text-sm">Téléphone</Label>
                  <Input
                    id="profile-telephone"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="h-10 rounded-lg"
                    placeholder="+212 6XX-XXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-club" className="text-sm">
                    <span className="flex items-center gap-1.5">
                      Club
                      {!user.club && (
                        <span className="text-[10px] text-muted-foreground">(améliore votre profil)</span>
                      )}
                    </span>
                  </Label>
                  <Input
                    id="profile-club"
                    value={club}
                    onChange={(e) => setClub(e.target.value)}
                    className="h-10 rounded-lg"
                    placeholder="Nom du club"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-region" className="text-sm">
                    <span className="flex items-center gap-1.5">
                      Région
                      {!user.region && (
                        <span className="text-[10px] text-muted-foreground">(améliore votre profil)</span>
                      )}
                    </span>
                  </Label>
                  <select
                    id="profile-region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">Sélectionner</option>
                    {REGIONS_MAROC.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="profile-bio" className="text-sm">
                    <span className="flex items-center gap-1.5">
                      Bio
                      {!user.bio && (
                        <span className="text-[10px] text-muted-foreground">(améliore votre profil)</span>
                      )}
                    </span>
                  </Label>
                  <textarea
                    id="profile-bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full min-h-[100px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none"
                    placeholder="Parlez-nous de votre expérience dans le handball..."
                  />
                </div>
              </div>

              {/* Role-specific info display */}
              {isLearnerRole && (
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Informations sportives
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">N° de licence :</span>
                      <span className="font-medium text-foreground">
                        {user.licenceNumber || (
                          <span className="text-muted-foreground/50 italic">Non renseigné</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Club :</span>
                      <span className="font-medium text-foreground">
                        {user.club || (
                          <span className="text-muted-foreground/50 italic">Non renseigné</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                className="rounded-lg text-sm"
                onClick={handleSave}
                disabled={saving || !hasChanges}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Statistics */}
        <TabsContent value="stats" className="animate-fadeIn">
          {loadingStats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-border/60">
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  {
                    label: "Cours inscrits",
                    value: stats?.enrollments ?? 0,
                    icon: BookOpen,
                    color: "text-sky-500",
                    bg: "bg-sky-50",
                    action: "courses" as AppView,
                  },
                  {
                    label: "Cours terminés",
                    value: stats?.completedEnrollments ?? 0,
                    icon: GraduationCap,
                    color: "text-emerald-500",
                    bg: "bg-emerald-50",
                    action: "learner-traceability" as AppView,
                  },
                  {
                    label: "Certificats obtenus",
                    value: stats?.certificates ?? 0,
                    icon: Award,
                    color: "text-amber-500",
                    bg: "bg-amber-50",
                    action: "certificates" as AppView,
                  },
                  {
                    label: "Badges gagnés",
                    value: stats?.badges ?? 0,
                    icon: Star,
                    color: "text-yellow-500",
                    bg: "bg-yellow-50",
                    action: "badges" as AppView,
                  },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.label}
                      onClick={() => navigate(s.action)}
                      className="bg-white border border-border/60 rounded-xl p-4 text-left hover:shadow-md transition-all group"
                    >
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", s.bg)}>
                        <Icon className={cn("w-5 h-5", s.color)} />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                    </button>
                  );
                })}
              </div>

              {/* Quiz Attempts Card */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                    Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-foreground">
                      {stats?.quizAttempts ?? 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      quiz soumis au total
                    </p>
                  </div>
                  {stats && stats.enrollments > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Taux de complétion</span>
                        <span className="font-semibold text-foreground">
                          {Math.round(((stats.completedEnrollments || 0) / stats.enrollments) * 100)}%
                        </span>
                      </div>
                      <Progress value={Math.round(((stats.completedEnrollments || 0) / stats.enrollments) * 100)} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick navigation */}
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {[
                  { label: "Voir mes certificats", icon: Award, action: "certificates" as AppView, desc: "Consulter et télécharger" },
                  { label: "Voir mes badges", icon: Star, action: "badges" as AppView, desc: "Mes accomplissements" },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.label}
                      onClick={() => navigate(s.action)}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:bg-muted/30 transition-all text-left group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        {/* TAB: Activity Timeline */}
        <TabsContent value="activity" className="animate-fadeIn">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Activité récente
              </CardTitle>
              <CardDescription>Vos dernières actions sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="space-y-4 py-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-48" />
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-2.5 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Aucune activité récente</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Commencez une formation pour voir votre activité ici
                  </p>
                </div>
              ) : (
                <div className="space-y-0 max-h-[400px] overflow-y-auto pr-1">
                  {activity.map((item, idx) => (
                    <div key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
                      {/* Timeline line */}
                      {idx < activity.length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                      )}
                      {/* Icon */}
                      <div className="relative z-10 w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        {getActivityIcon(item.type)}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-sm font-medium text-foreground leading-tight">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {item.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {formatTimeAgo(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Settings */}
        <TabsContent value="settings" className="space-y-4 animate-fadeIn">
          {/* Change Password */}
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Changer le mot de passe
              </CardTitle>
              <CardDescription>Modifiez votre mot de passe pour sécuriser votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-pw" className="text-sm">Mot de passe actuel</Label>
                <div className="relative">
                  <Input
                    id="current-pw"
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="h-10 rounded-lg pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-pw" className="text-sm">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="new-pw"
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-10 rounded-lg pr-10"
                      placeholder="Min. 8 caractères"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength indicator */}
                  {newPassword.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-colors",
                              i < Math.ceil(newPassword.length / 4)
                                ? newPassword.length >= 12
                                  ? "bg-emerald-500"
                                  : newPassword.length >= 8
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                                : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                      <p className={cn(
                        "text-[10px]",
                        newPassword.length >= 12
                          ? "text-emerald-600"
                          : newPassword.length >= 8
                            ? "text-amber-600"
                            : "text-red-600"
                      )}>
                        {newPassword.length >= 12 ? "Fort" : newPassword.length >= 8 ? "Moyen" : "Trop court"}
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pw" className="text-sm">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm-pw"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 rounded-lg"
                    placeholder="Confirmer"
                  />
                  {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                    <p className="text-[10px] text-red-500">Les mots de passe ne correspondent pas</p>
                  )}
                  {confirmPassword.length > 0 && newPassword === confirmPassword && (
                    <p className="text-[10px] text-emerald-500">Les mots de passe correspondent ✓</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-lg text-sm"
                onClick={handleChangePassword}
                disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Modification...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Mettre à jour le mot de passe
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Préférences de notification
              </CardTitle>
              <CardDescription>Choisissez quelles notifications vous souhaitez recevoir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  id: "notif-course",
                  label: "Nouveaux cours et mises à jour",
                  description: "Soyez notifié lors de la publication de nouveaux cours",
                  checked: notifCourse,
                  onChange: setNotifCourse,
                },
                {
                  id: "notif-quiz",
                  label: "Résultats des quiz",
                  description: "Recevez les résultats et rappels de quiz",
                  checked: notifQuiz,
                  onChange: setNotifQuiz,
                },
                {
                  id: "notif-certificate",
                  label: "Certificats et badges",
                  description: "Notifications pour les certificats obtenus et badges gagnés",
                  checked: notifCertificate,
                  onChange: setNotifCertificate,
                },
                {
                  id: "notif-message",
                  label: "Messages",
                  description: "Notifications pour les nouveaux messages reçus",
                  checked: notifMessage,
                  onChange: setNotifMessage,
                },
              ].map((pref) => (
                <div key={pref.id} className="flex items-center justify-between py-1">
                  <div className="space-y-0.5 pr-4">
                    <label htmlFor={pref.id} className="text-sm font-medium text-foreground cursor-pointer">
                      {pref.label}
                    </label>
                    <p className="text-xs text-muted-foreground">{pref.description}</p>
                  </div>
                  <Switch
                    id={pref.id}
                    checked={pref.checked}
                    onCheckedChange={pref.onChange}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Informations du compte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Rôle</span>
                  <p className="font-medium text-foreground">
                    {ROLE_LABELS[user.role || "ARBITRE"]}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Statut du compte</span>
                  <p className="font-medium text-foreground">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px]">
                      Actif
                    </Badge>
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Email vérifié</span>
                  <p className="font-medium text-foreground">
                    {emailVerified ? (
                      <span className="text-emerald-600">Oui ✓</span>
                    ) : (
                      <span className="text-amber-600">Non vérifié</span>
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Inscrit le</span>
                  <p className="font-medium text-foreground">
                    {createdAt
                      ? new Date(createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
