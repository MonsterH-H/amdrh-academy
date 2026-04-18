"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle, Award, CheckCircle2, Download, Copy, ExternalLink, ShieldCheck, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  CERTIFICATE_TYPE_LABELS, CERTIFICATE_TYPE_COLORS,
  CERTIFICATE_STATUS_LABELS, CERTIFICATE_STATUS_COLORS,
} from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CertificateData {
  id: string;
  code: string;
  type: string;
  status: string;
  courseTitle: string;
  userName: string;
  score: number;
  maxScore: number;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
  userId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function getCertStatus(cert: CertificateData): { label: string; color: string } {
  if (cert.status === "REVOKED") return { label: "Révoqué", color: "bg-red-100 text-red-700" };
  if (cert.expiresAt && new Date(cert.expiresAt) < new Date()) return { label: "Expiré", color: "bg-amber-100 text-amber-700" };
  return { label: "Valide", color: "bg-green-100 text-green-700" };
}

function getCertTypeIcon(type: string) {
  switch (type) {
    case "ATTESTATION": return "📋";
    case "DIPLOME": return "🎓";
    default: return "🏆";
  }
}

// ─── Certificates Page ────────────────────────────────────────────────────────

export function CertificatesPage() {
  const { user } = useAppStore();
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/certificates?userId=" + user.id);
        if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        const d = await res.json();
        if (d.error) throw new Error(d.error);
        setCertificates(d.certificates || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Impossible de charger les certificats";
        setError(message);
        toast({ title: "Erreur", description: message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [user]);

  const handleOpenDetail = (cert: CertificateData) => {
    setSelectedCert(cert);
    setDetailOpen(true);
  };

  const handleDownloadPdf = (cert: CertificateData) => {
    window.open(`/api/certificates/${cert.id}/pdf?userId=${cert.userId}`, "_blank");
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copié", description: "Le code a été copié dans le presse-papiers." });
  };

  const handleCopyLink = (code: string) => {
    const link = `https://academie.amdrh.ma/verify/${code}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Copié", description: "Le lien de vérification a été copié." });
  };

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
          {certificates.map((cert) => {
            const statusInfo = getCertStatus(cert);
            return (
              <Card
                key={cert.id}
                className={cn(
                  "border-2 bg-gradient-to-br cursor-pointer transition-all hover:shadow-md",
                  cert.status === "REVOKED"
                    ? "border-red-200 from-red-50/50 to-white"
                    : cert.type === "DIPLOME"
                      ? "border-amber-200 from-amber-50/50 to-white"
                      : cert.type === "ATTESTATION"
                        ? "border-emerald-200 from-emerald-50/50 to-white"
                        : "border-amber-200 from-amber-50/50 to-white"
                )}
                onClick={() => handleOpenDetail(cert)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                      cert.type === "DIPLOME"
                        ? "bg-gradient-to-br from-amber-400 to-amber-600"
                        : cert.type === "ATTESTATION"
                          ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                          : "bg-gradient-to-br from-blue-400 to-blue-600"
                    )}>
                      <span className="text-2xl">{getCertTypeIcon(cert.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground text-sm truncate">{cert.courseTitle}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        <Badge variant="secondary" className={cn("text-[9px]", CERTIFICATE_TYPE_COLORS[cert.type] || "bg-blue-100 text-blue-700")}>
                          {CERTIFICATE_TYPE_LABELS[cert.type] || "Certificat"}
                        </Badge>
                        <Badge variant="secondary" className={cn("text-[9px]", statusInfo.color)}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Score : <span className="font-semibold text-foreground">{cert.score}/{cert.maxScore}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Délivré le {formatDate(cert.issuedAt)}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {cert.code}
                        </Badge>
                      </div>

                      {/* Revocation reason */}
                      {cert.status === "REVOKED" && cert.revokeReason && (
                        <p className="text-[10px] text-red-600 mt-2 bg-red-50 rounded px-2 py-1">
                          {cert.revokeReason}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] rounded-md flex items-center gap-1"
                          onClick={() => handleDownloadPdf(cert)}
                        >
                          <Download className="w-3 h-3" />
                          Télécharger PDF
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] rounded-md flex items-center gap-1 text-primary hover:text-primary/80"
                          onClick={() => handleCopyLink(cert.code)}
                        >
                          <ExternalLink className="w-3 h-3" />
                          Vérifier
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Certificate Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          {selectedCert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Détails du certificat
                </DialogTitle>
                <DialogDescription>Informations complètes de votre certificat</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Header */}
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="font-mono text-lg font-bold text-primary">{selectedCert.code}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="secondary" className={cn("text-[9px]", CERTIFICATE_TYPE_COLORS[selectedCert.type] || "")}>
                      {CERTIFICATE_TYPE_LABELS[selectedCert.type] || "Certificat"}
                    </Badge>
                    <Badge variant="secondary" className={cn("text-[9px]", getCertStatus(selectedCert).color)}>
                      {getCertStatus(selectedCert).label}
                    </Badge>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Cours</p>
                    <p className="font-medium">{selectedCert.courseTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Score</p>
                    <p className={cn("font-bold text-lg", selectedCert.maxScore > 0 && (selectedCert.score / selectedCert.maxScore) >= 0.7 ? "text-green-700" : "text-amber-700")}>
                      {selectedCert.score}/{selectedCert.maxScore}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      ({selectedCert.maxScore > 0 ? Math.round((selectedCert.score / selectedCert.maxScore) * 100) : 0}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Délivré le</p>
                    <p className="font-medium">{formatDate(selectedCert.issuedAt)}</p>
                  </div>
                  {selectedCert.expiresAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Expiration</p>
                      <p className={cn("font-medium", new Date(selectedCert.expiresAt) < new Date() ? "text-red-600" : "text-green-700")}>
                        {formatDate(selectedCert.expiresAt)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Revocation */}
                {selectedCert.status === "REVOKED" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-red-700 mb-1">Révocation</p>
                    {selectedCert.revokedAt && (
                      <p className="text-[10px] text-red-600">Le {formatDate(selectedCert.revokedAt)}</p>
                    )}
                    {selectedCert.revokeReason && (
                      <p className="text-xs text-red-600 mt-1">{selectedCert.revokeReason}</p>
                    )}
                  </div>
                )}

                {/* Verification Link */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Lien de vérification</p>
                  <p className="text-xs text-primary font-mono break-all">
                    https://academie.amdrh.ma/verify/{selectedCert.code}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg text-xs"
                    onClick={() => handleDownloadPdf(selectedCert)}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Télécharger PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg text-xs"
                    onClick={() => handleCopyCode(selectedCert.code)}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copier le code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg text-xs"
                    onClick={() => handleCopyLink(selectedCert.code)}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    Copier le lien
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Badges Page ──────────────────────────────────────────────────────────────

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
        if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
        const d = await res.json();
        if (d.error) throw new Error(d.error);
        setEarnedBadges(d.earnedBadges || []);
        setAllBadges(d.allBadges || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Impossible de charger les badges";
        setError(message);
        toast({ title: "Erreur", description: message, variant: "destructive" });
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
