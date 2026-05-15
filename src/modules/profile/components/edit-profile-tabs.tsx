"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { REGIONS_MAROC, ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app";
import { useToast } from "@/hooks/use-toast";
import { formatTimeAgo } from "@/utils/format";
import {
  Save, Loader2, Shield, CreditCard, Bell, Lock, ShieldCheck, Languages, Monitor, Trash2, Info,
} from "lucide-react";
import { PasswordForm } from "./password-form";

interface EditProfileTabsProps {
  emailVerified: boolean;
  isLearnerRole: boolean;
  extendedUser: { createdAt?: Date | string | null };
  onSaved?: () => void;
}

const NOTIF_PREFS = [
  { id: "notif-course", label: "Nouveaux cours et mises à jour", desc: "Soyez notifié lors de la publication de nouveaux cours" },
  { id: "notif-quiz", label: "Résultats des quiz", desc: "Recevez les résultats et rappels de quiz" },
  { id: "notif-certificate", label: "Certificats et badges", desc: "Notifications pour les certificats obtenus et badges gagnés" },
  { id: "notif-message", label: "Messages", desc: "Notifications pour les nouveaux messages reçus" },
] as const;

export function EditProfileTabs({ emailVerified, isLearnerRole, extendedUser, onSaved }: EditProfileTabsProps) {
  const { user, setUser } = useAppStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("info");
  const [notif, setNotif] = useState<Record<string, boolean>>({
    "notif-course": true, "notif-quiz": true, "notif-certificate": true, "notif-message": true,
  });

  // Form fields
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [club, setClub] = useState("");
  const [region, setRegion] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

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

  const hasChanges = user && (
    prenom !== user.prenom ||
    nom !== user.nom ||
    telephone !== (user.telephone || "") ||
    club !== (user.club || "") ||
    region !== (user.region || "") ||
    bio !== (user.bio || "")
  );

  const handleSave = async () => {
    if (!user) return;
    if (!prenom.trim() || !nom.trim()) {
      toast({ title: "Champs requis", description: "Le prénom et le nom sont obligatoires.", variant: "destructive" });
      return;
    }
    if (prenom.trim().length < 2 || nom.trim().length < 2) {
      toast({ title: "Validation échouée", description: "Le prénom et le nom doivent contenir au moins 2 caractères.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id, prenom: prenom.trim(), nom: nom.trim(),
          telephone: telephone.trim(), club: club.trim(), region: region.trim(), bio: bio.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error || "Impossible de mettre à jour le profil.", variant: "destructive" });
        return;
      }
      if (!data.user) {
        toast({ title: "Erreur", description: "Données utilisateur manquantes", variant: "destructive" });
        return;
      }
      setUser({ ...user, prenom: data.user.prenom, nom: data.user.nom, telephone: data.user.telephone, club: data.user.club, region: data.user.region, bio: data.user.bio });
      toast({ title: "Profil mis à jour", description: "Vos informations ont été enregistrées avec succès." });
      onSaved?.();
    } catch {
      toast({ title: "Erreur réseau", description: "Une erreur est survenue. Veuillez réessayer.", variant: "destructive" });
    } finally { setSaving(false); }
  };

  if (!user) return null;

  const createdAt = extendedUser.createdAt ?? user?.createdAt ?? null;

  const tabs = [
    { id: "info", label: "Informations", icon: Shield },
    { id: "security", label: "Sécurité", icon: Lock },
    { id: "preferences", label: "Préférences", icon: Monitor },
  ];

  return (
    <div className="space-y-4">
      {/* Tab nav */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === t.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Informations Tab */}
      {activeTab === "info" && (
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Informations personnelles</CardTitle>
            <CardDescription>Modifiez vos informations de profil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ep-prenom" className="text-sm">Prénom *</Label>
                <Input id="ep-prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="h-10 rounded-lg" placeholder="Votre prénom" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ep-nom" className="text-sm">Nom *</Label>
                <Input id="ep-nom" value={nom} onChange={(e) => setNom(e.target.value)} className="h-10 rounded-lg" placeholder="Votre nom" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ep-email" className="text-sm">
                  <span className="flex items-center gap-1.5">
                    Email
                    {emailVerified && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0">Vérifié</Badge>}
                  </span>
                </Label>
                <Input id="ep-email" value={user.email} disabled className="h-10 rounded-lg bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ep-tel" className="text-sm">Téléphone</Label>
                <Input id="ep-tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} className="h-10 rounded-lg" placeholder="+212 6XX-XXXXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ep-club" className="text-sm">Club</Label>
                <Input id="ep-club" value={club} onChange={(e) => setClub(e.target.value)} className="h-10 rounded-lg" placeholder="Nom du club" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ep-region" className="text-sm">Région</Label>
                <select id="ep-region" value={region} onChange={(e) => setRegion(e.target.value)} className="w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm">
                  <option value="">Sélectionner</option>
                  {REGIONS_MAROC.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ep-bio" className="text-sm">Bio</Label>
                <textarea id="ep-bio" value={bio} onChange={(e) => setBio(e.target.value)} className="w-full min-h-[100px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none" placeholder="Parlez-nous de votre expérience dans le handball..." />
              </div>
            </div>

            {isLearnerRole && (
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" /> Informations sportives
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">N° de licence :</span>
                    <span className="font-medium text-foreground">{user.licenceNumber || <span className="text-muted-foreground/50 italic">Non renseigné</span>}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Club :</span>
                    <span className="font-medium text-foreground">{user.club || <span className="text-muted-foreground/50 italic">Non renseigné</span>}</span>
                  </div>
                </div>
              </div>
            )}

            <Button className="rounded-lg text-sm" onClick={handleSave} disabled={saving || !hasChanges}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</> : <><Save className="w-4 h-4 mr-2" />Enregistrer les modifications</>}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <PasswordForm userId={user.id} />
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Authentification à deux facteurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/40">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Bientôt disponible</p>
                  <p className="text-xs text-muted-foreground">L&apos;authentification à deux facteurs sera disponible dans une prochaine version.</p>
                </div>
                <Badge variant="secondary" className="text-[10px]">Prochainement</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Préférences de notification</CardTitle>
              <CardDescription>Choisissez quelles notifications vous souhaitez recevoir</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {NOTIF_PREFS.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-1">
                  <div className="space-y-0.5 pr-4">
                    <label htmlFor={p.id} className="text-sm font-medium text-foreground cursor-pointer">{p.label}</label>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                  <Switch id={p.id} checked={notif[p.id] ?? true} onCheckedChange={() => setNotif((n) => ({ ...n, [p.id]: !n[p.id] }))} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Languages className="w-4 h-4 text-primary" /> Langue et affichage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-foreground">Langue</p>
                  <p className="text-xs text-muted-foreground">Langue de l&apos;interface</p>
                </div>
                <Badge variant="secondary" className="text-xs">Français</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-foreground">Fuseau horaire</p>
                  <p className="text-xs text-muted-foreground">Heure locale du Maroc</p>
                </div>
                <Badge variant="secondary" className="text-xs">GMT+1</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Informations du compte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1"><span className="text-xs text-muted-foreground">Rôle</span><p className="font-medium text-foreground">{ROLE_LABELS[user.role || "ARBITRE"]}</p></div>
                <div className="space-y-1"><span className="text-xs text-muted-foreground">Statut</span><p className="font-medium text-foreground"><Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px]">Actif</Badge></p></div>
                <div className="space-y-1"><span className="text-xs text-muted-foreground">Email vérifié</span><p className="font-medium text-foreground">{emailVerified ? <span className="text-emerald-600">Oui ✓</span> : <span className="text-amber-600">Non vérifié</span>}</p></div>
                <div className="space-y-1"><span className="text-xs text-muted-foreground">Inscrit le</span><p className="font-medium text-foreground">{createdAt ? new Date(createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}</p></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 border-red-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-red-600">
                <Trash2 className="w-4 h-4" /> Zone dangereuse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50/50 border border-red-200/40">
                <Info className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">Supprimer le compte</p>
                  <p className="text-xs text-red-600/70 mt-0.5">La suppression de compte est désactivée. Contactez un administrateur pour toute demande.</p>
                </div>
                <Button variant="outline" size="sm" disabled className="text-xs opacity-50 cursor-not-allowed">
                  <Trash2 className="w-3 h-3 mr-1" /> Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
