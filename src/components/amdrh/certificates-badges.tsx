"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Award, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function CertificatesPage() {
  const { user } = useAppStore();
  const [certificates, setCertificates] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/certificates?userId=" + user.id);
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        }
        const d = await res.json();
        if (d.error) {
          throw new Error(d.error);
        }
        setCertificates(d.certificates || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Impossible de charger les certificats";
        setError(message);
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [user]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" />{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>;

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mes Certificats</h2>
          <p className="text-muted-foreground mt-1">Certificats reconnus par l&apos;AMDRH et la FRMHB</p>
        </div>
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Erreur de chargement</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mes Certificats</h2>
        <p className="text-muted-foreground mt-1">Certificats reconnus par l&apos;AMDRH et la FRMHB</p>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-20">
          <Award className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucun certificat</h3>
          <p className="text-sm text-muted-foreground">Complétez un cours certifiant pour obtenir votre premier certificat</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 stagger-children">
          {certificates.map((cert) => (
            <Card key={cert.id as string} className="border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-sm">{cert.courseTitle as string}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Score : {cert.score as number}/{cert.maxScore as number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Délivré le {new Date(cert.issuedAt as string).toLocaleDateString("fr-FR")}
                    </p>
                    <Badge variant="outline" className="text-[10px] mt-2 font-mono">
                      {cert.code as string}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function BadgesPage() {
  const { user } = useAppStore();
  const [earnedBadges, setEarnedBadges] = useState<Array<Record<string, unknown>>>([]);
  const [allBadges, setAllBadges] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchBadges = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/badges?userId=" + user.id);
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        }
        const d = await res.json();
        if (d.error) {
          throw new Error(d.error);
        }
        setEarnedBadges(d.earnedBadges || []);
        setAllBadges(d.allBadges || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Impossible de charger les badges";
        setError(message);
        toast({
          title: "Erreur",
          description: message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [user]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-48" />{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>;

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mes Badges</h2>
        </div>
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Erreur de chargement</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  const earnedIds = new Set(earnedBadges.map((b) => b.badgeId as string));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mes Badges</h2>
        <p className="text-muted-foreground mt-1">{earnedBadges.length} / {allBadges.length} badges obtenus</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 stagger-children">
        {allBadges.map((badge) => {
          const earned = earnedIds.has(badge.id as string);
          return (
            <Card
              key={badge.id as string}
              className={cn(
                "border-2 transition-all duration-200 text-center",
                earned ? "border-primary/30 bg-primary/5" : "border-border/60 opacity-40"
              )}
            >
              <CardContent className="p-5">
                <span className="text-4xl mb-3 block">{badge.icon as string}</span>
                <h3 className="font-semibold text-sm text-foreground">{badge.name as string}</h3>
                <p className="text-[10px] text-muted-foreground mt-1">{badge.description as string}</p>
                {earned && (
                  <Badge className="mt-2 bg-primary/10 text-primary text-[10px]">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Obtenu
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
