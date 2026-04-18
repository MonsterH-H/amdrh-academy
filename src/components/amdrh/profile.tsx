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
import { BookOpen, Award, HelpCircle, Star, Save, Loader2 } from "lucide-react";

export function ProfilePage() {
  const { user, navigate } = useAppStore();
  const [loading, setLoading] = useState(false);

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
                {user.prenom.charAt(0)}{user.nom.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-bold text-foreground">{user.prenom} {user.nom}</h3>
              <Badge variant="secondary" className={cn("text-[10px]", ROLE_COLORS[user.role || "ARBITRE"])}>
                {ROLE_LABELS[user.role || "ARBITRE"]}
              </Badge>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Email</Label>
              <Input value={user.email} disabled className="h-10 rounded-lg bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Téléphone</Label>
              <Input defaultValue={user.telephone || ""} className="h-10 rounded-lg" placeholder="+212 6XX-XXXXXX" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Prénom</Label>
              <Input defaultValue={user.prenom} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Nom</Label>
              <Input defaultValue={user.nom} className="h-10 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Club</Label>
              <Input defaultValue={user.club || ""} className="h-10 rounded-lg" placeholder="Nom du club" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Région</Label>
              <select defaultValue={user.region || ""} className="w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm">
                <option value="">Sélectionner</option>
                {REGIONS_MAROC.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm">Bio</Label>
              <textarea defaultValue={user.bio || ""} className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-none" placeholder="Décrivez-vous..." />
            </div>
          </div>

          <Button className="mt-6 rounded-lg text-sm">
            <Save className="w-4 h-4 mr-2" /> Enregistrer
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

function cn(...args: unknown[]) {
  return args.filter(Boolean).join(" ");
}
