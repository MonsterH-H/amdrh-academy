"use client";

import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { ROLE_LABELS, ROLE_COLORS, REGIONS_MAROC } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { BookOpen, Award, HelpCircle, Star, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ProfilePage() {
  const { user, setUser, navigate } = useAppStore();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [club, setClub] = useState("");
  const [region, setRegion] = useState("");
  const [bio, setBio] = useState("");

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

      // Update the Zustand store with the new user data
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

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mon Profil</h2>
        <p className="text-muted-foreground mt-1">Gérez vos informations personnelles</p>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {prenom.charAt(0)}{nom.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold text-foreground">{prenom} {nom}</h3>
              <Badge variant="secondary" className={cn("text-[10px]", ROLE_COLORS[user.role || "ARBITRE"])}>
                {ROLE_LABELS[user.role || "ARBITRE"]}
              </Badge>
            </div>
          </div>

          <Separator className="mb-6" />

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
              <Label htmlFor="profile-email" className="text-sm">Email</Label>
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
              <Label htmlFor="profile-club" className="text-sm">Club</Label>
              <Input
                id="profile-club"
                value={club}
                onChange={(e) => setClub(e.target.value)}
                className="h-10 rounded-lg"
                placeholder="Nom du club"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-region" className="text-sm">Région</Label>
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
              <Label htmlFor="profile-bio" className="text-sm">Bio</Label>
              <textarea
                id="profile-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none"
                placeholder="Décrivez-vous..."
              />
            </div>
          </div>

          <Button
            className="mt-6 rounded-lg text-sm"
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
                Enregistrer
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Cours", icon: BookOpen, action: "courses" },
          { label: "Certificats", icon: Award, action: "certificates" },
          { label: "Quiz", icon: HelpCircle, action: "courses" },
          { label: "Badges", icon: Star, action: "badges" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.label}
              onClick={() => navigate(s.action)}
              className="bg-white border border-border/60 rounded-xl p-4 text-center hover:shadow-sm transition-all"
            >
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-foreground">{s.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
