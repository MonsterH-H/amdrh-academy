"use client";

import { useRef } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { formatTimeAgo } from "@/utils/format";
import {
  Camera, MapPin, Phone, Shield, Mail, Calendar, CheckCircle2, XCircle,
} from "lucide-react";
import type { ExtendedUser } from "../types/achievements";

interface ProfileHeaderProps {
  emailVerified: boolean;
  extendedUser: ExtendedUser;
  onAvatarChange?: (url: string) => void;
}

export function ProfileHeader({ emailVerified, extendedUser, onAvatarChange }: ProfileHeaderProps) {
  const { user } = useAppStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const isLearnerRole = ["ARBITRE", "ENTRAINEUR", "JOUEUR"].includes(user.role || "");
  const createdAt = extendedUser.createdAt ?? user?.createdAt ?? null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Format invalide", description: "Veuillez sélectionner une image.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Fichier trop volumineux", description: "La taille maximale est de 2 Mo.", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", user.id);

    try {
      const res = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      if (!res.ok) {
        const d = await res.json();
        toast({ title: "Erreur", description: d.error || "Impossible de télécharger l\u2019avatar.", variant: "destructive" });
        return;
      }
      const data = await res.json();
      onAvatarChange?.(data.avatarUrl);
      toast({ title: "Avatar mis à jour", description: "Votre photo de profil a \u00e9t\u00e9 enregistr\u00e9e." });
    } catch {
      toast({ title: "Erreur r\u00e9seau", description: "Une erreur est survenue.", variant: "destructive" });
    }
  };

  return (
    <Card className="border-border/60 overflow-hidden">
      {/* Banner / Cover */}
      <div className="relative h-28 sm:h-36 bg-gradient-to-br from-emerald-600 via-teal-500 to-amber-500 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)",
        }} />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
      </div>

      <CardContent className="p-4 sm:p-6 -mt-10 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {/* Avatar with edit overlay */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-card shadow-lg">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={`${user.prenom} ${user.nom}`} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-2xl sm:text-3xl font-bold">
                {user.prenom.charAt(0)}{user.nom.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          {/* User info */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">{user.prenom} {user.nom}</h3>
              <Badge variant="secondary" className={cn("text-[10px] font-medium", ROLE_COLORS[user.role || "ARBITRE"])}>
                {ROLE_LABELS[user.role || "ARBITRE"]}
              </Badge>
              {emailVerified ? (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-[10px] gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Vérifié
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-[10px] gap-1">
                  <XCircle className="w-3 h-3" /> Non vérifié
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-1 truncate">{user.email}</p>

            <div className="flex items-center gap-x-4 gap-y-1.5 mt-2 flex-wrap text-xs text-muted-foreground">
              {user.telephone && (
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{user.telephone}</span>
              )}
              {user.region && (
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.region}</span>
              )}
              {user.club && (
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" />{user.club}</span>
              )}
              {isLearnerRole && user.licenceNumber && (
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />Licence {user.licenceNumber}</span>
              )}
              {createdAt && (
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Inscrit {formatTimeAgo(createdAt as string)}</span>
              )}
            </div>
          </div>

          {/* Edit avatar button (mobile) */}
          <Button
            variant="outline"
            size="sm"
            className="sm:hidden rounded-lg text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="w-3.5 h-3.5 mr-1.5" /> Photo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
