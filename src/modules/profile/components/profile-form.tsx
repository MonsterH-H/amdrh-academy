"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { REGIONS_MAROC } from "@/lib/constants";
import { Shield, CreditCard, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormProps {
  emailVerified: boolean;
  isLearnerRole: boolean;
  onSaved?: () => void;
}

export function ProfileForm({ emailVerified, isLearnerRole, onSaved }: ProfileFormProps) {
  const { user, setUser } = useAppStore();
  const { toast } = useToast();

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

      if (!data.user) {
        toast({
          title: "Erreur",
          description: "Données utilisateur manquantes",
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

      onSaved?.();
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
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0">
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
  );
}
