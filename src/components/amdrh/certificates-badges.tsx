"use client";

import { useEffect, useState } from "react";
import { useAppStore, type AppView } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Download,
  Copy,
  ExternalLink,
  ShieldCheck,
  Clock,
  Star,
  Lock,
  Medal,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  CERTIFICATE_TYPE_LABELS,
  CERTIFICATE_TYPE_COLORS,
  CERTIFICATE_STATUS_LABELS,
  CERTIFICATE_STATUS_COLORS,
  BADGE_LEVEL_LABELS,
  BADGE_LEVEL_COLORS,
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

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: string;
  criteria: string;
  createdAt: string;
}

interface UserBadgeData {
  id: string;
  badgeId: string;
  earnedAt: string;
  badge: BadgeData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCertStatus(cert: CertificateData): {
  label: string;
  color: string;
} {
  if (cert.status === "REVOKED")
    return { label: "Révoqué", color: "bg-red-100 text-red-700" };
  if (cert.expiresAt && new Date(cert.expiresAt) < new Date())
    return { label: "Expiré", color: "bg-amber-100 text-amber-700" };
  return { label: "Valide", color: "bg-green-100 text-green-700" };
}

function getCertTypeIcon(type: string) {
  switch (type) {
    case "ATTESTATION":
      return "📋";
    case "DIPLOME":
      return "🎓";
    default:
      return "🏆";
  }
}

function getBadgeLevelStyle(level: string): {
  gradient: string;
  border: string;
  bg: string;
} {
  switch (level) {
    case "PLATINE":
      return {
        gradient: "from-cyan-400 to-cyan-600",
        border: "border-cyan-300",
        bg: "bg-cyan-50",
      };
    case "OR":
      return {
        gradient: "from-yellow-400 to-amber-500",
        border: "border-amber-300",
        bg: "bg-amber-50",
      };
    case "ARGENT":
      return {
        gradient: "from-gray-300 to-gray-500",
        border: "border-gray-300",
        bg: "bg-gray-50",
      };
    default:
      return {
        gradient: "from-amber-600 to-amber-800",
        border: "border-amber-600",
        bg: "bg-amber-50",
      };
  }
}

// ─── Manager Guard ────────────────────────────────────────────────────────────

function ManagerGuard({
  title,
  description,
  icon: Icon,
  navigateTo,
}: {
  title: string;
  description: string;
  icon: typeof Award;
  navigateTo: string;
}) {
  const { navigate } = useAppStore();
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground mt-1">
          Certificats reconnus par l&apos;AMDRH et la FRMHB
        </p>
      </div>
      <div className="text-center py-20">
        <Icon className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">{description}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Accédez à la gestion depuis le panneau d&apos;administration.
        </p>
        <Button
          onClick={() => navigate(navigateTo as AppView)}
          className="rounded-lg"
        >
          Aller à la gestion
        </Button>
      </div>
    </div>
  );
}

// ─── Certificates Page ────────────────────────────────────────────────────────

function CertificatesContent() {
  const { user } = useAppStore();
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(
    null
  );
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
        const message =
          err instanceof Error
            ? err.message
            : "Impossible de charger les certificats";
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
    window.open(
      `/api/certificates/${cert.id}/pdf?userId=${cert.userId}`,
      "_blank"
    );
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copié",
      description: "Le code a été copié dans le presse-papiers.",
    });
  };

  const handleCopyLink = (code: string) => {
    const link = `https://academie.amdrh.ma/verify/${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copié",
      description: "Le lien de vérification a été copié.",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-fadeIn">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mes Certificats</h2>
          <p className="text-muted-foreground mt-1">
            Certificats reconnus par l&apos;AMDRH et la FRMHB
          </p>
        </div>
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            Erreur de chargement
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // Stats
  const validCerts = certificates.filter(
    (c) => c.status === "ACTIVE" && (!c.expiresAt || new Date(c.expiresAt) > new Date())
  ).length;
  const totalCerts = certificates.length;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mes Certificats</h2>
        <p className="text-muted-foreground mt-1">
          Certificats reconnus par l&apos;AMDRH et la FRMHB
        </p>
      </div>

      {/* Stats row */}
      {totalCerts > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{totalCerts}</p>
                <p className="text-[11px] text-muted-foreground">
                  Certificat{totalCerts > 1 ? "s" : ""} obtenu{totalCerts > 1 ? "s" : ""}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{validCerts}</p>
                <p className="text-[11px] text-muted-foreground">
                  Valide{validCerts > 1 ? "s" : ""}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {certificates.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">
            Aucun certificat
          </h3>
          <p className="text-sm text-muted-foreground">
            Complétez un cours certifiant pour obtenir votre premier certificat
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {certificates.map((cert) => {
            const statusInfo = getCertStatus(cert);
            const scorePercent =
              cert.maxScore > 0
                ? Math.round((cert.score / cert.maxScore) * 100)
                : 0;
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
                    <div
                      className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                        cert.type === "DIPLOME"
                          ? "bg-gradient-to-br from-amber-400 to-amber-600"
                          : cert.type === "ATTESTATION"
                            ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                            : "bg-gradient-to-br from-blue-400 to-blue-600"
                      )}
                    >
                      <span className="text-2xl">
                        {getCertTypeIcon(cert.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-foreground text-sm truncate">
                          {cert.courseTitle}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[9px]",
                            CERTIFICATE_TYPE_COLORS[cert.type] ||
                              "bg-blue-100 text-blue-700"
                          )}
                        >
                          {CERTIFICATE_TYPE_LABELS[cert.type] || "Certificat"}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={cn("text-[9px]", statusInfo.color)}
                        >
                          {statusInfo.label}
                        </Badge>
                      </div>

                      {/* Score bar */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              scorePercent >= 70
                                ? "bg-green-500"
                                : scorePercent >= 50
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            )}
                            style={{ width: `${scorePercent}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {cert.score}/{cert.maxScore}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Délivré le {formatDateShort(cert.issuedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono"
                        >
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
                      <div
                        className="flex gap-2 mt-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[10px] rounded-md flex items-center gap-1"
                          onClick={() => handleDownloadPdf(cert)}
                        >
                          <Download className="w-3 h-3" />
                          PDF
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
                <DialogDescription>
                  Informations complètes de votre certificat
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Header */}
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="font-mono text-lg font-bold text-primary">
                    {selectedCert.code}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[9px]",
                        CERTIFICATE_TYPE_COLORS[selectedCert.type] || ""
                      )}
                    >
                      {CERTIFICATE_TYPE_LABELS[selectedCert.type] ||
                        "Certificat"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[9px]",
                        getCertStatus(selectedCert).color
                      )}
                    >
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
                    <p
                      className={cn(
                        "font-bold text-lg",
                        selectedCert.maxScore > 0 &&
                          selectedCert.score / selectedCert.maxScore >= 0.7
                          ? "text-green-700"
                          : "text-amber-700"
                      )}
                    >
                      {selectedCert.score}/{selectedCert.maxScore}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      (
                      {selectedCert.maxScore > 0
                        ? Math.round(
                            (selectedCert.score / selectedCert.maxScore) * 100
                          )
                        : 0}
                      %)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Délivré le</p>
                    <p className="font-medium">
                      {formatDate(selectedCert.issuedAt)}
                    </p>
                  </div>
                  {selectedCert.expiresAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Expiration</p>
                      <p
                        className={cn(
                          "font-medium",
                          new Date(selectedCert.expiresAt) < new Date()
                            ? "text-red-600"
                            : "text-green-700"
                        )}
                      >
                        {formatDate(selectedCert.expiresAt)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Revocation */}
                {selectedCert.status === "REVOKED" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-red-700 mb-1">
                      Révocation
                    </p>
                    {selectedCert.revokedAt && (
                      <p className="text-[10px] text-red-600">
                        Le {formatDate(selectedCert.revokedAt)}
                      </p>
                    )}
                    {selectedCert.revokeReason && (
                      <p className="text-xs text-red-600 mt-1">
                        {selectedCert.revokeReason}
                      </p>
                    )}
                  </div>
                )}

                {/* Verification Link */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Lien de vérification
                  </p>
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

export function CertificatesPage() {
  const { user } = useAppStore();
  if (user && (user.role === "ADMIN" || user.role === "FORMATEUR")) {
    return (
      <ManagerGuard
        title="Mes Certificats"
        description={
          user.role === "ADMIN"
            ? "Gestion des certificats"
            : "Espace formateur"
        }
        icon={Award}
        navigateTo="admin-certificates"
      />
    );
  }
  return <CertificatesContent />;
}

// ─── Badges Page ──────────────────────────────────────────────────────────────

function BadgesContent() {
  const { user } = useAppStore();
  const [earnedBadges, setEarnedBadges] = useState<UserBadgeData[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>("ALL");

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

        // Map API response to typed data
        const earned = (d.earnedBadges || []).map((ub: Record<string, unknown>) => ({
          id: ub.id as string,
          badgeId: ub.badgeId as string,
          earnedAt: ub.earnedAt as string,
          badge: ub.badge as BadgeData,
        }));
        const all = (d.allBadges || []).map((b: Record<string, unknown>) => ({
          id: b.id as string,
          name: b.name as string,
          description: b.description as string,
          icon: b.icon as string,
          level: b.level as string,
          criteria: b.criteria as string,
          createdAt: b.createdAt as string,
        }));

        setEarnedBadges(earned);
        setAllBadges(all);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Impossible de charger les badges";
        setError(message);
        toast({ title: "Erreur", description: message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4 animate-fadeIn">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mes Badges</h2>
        </div>
        <div className="text-center py-20">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            Erreur de chargement
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const earnedMap = new Map<string, UserBadgeData>();
  for (const ub of earnedBadges) {
    earnedMap.set(ub.badgeId, ub);
  }

  const filteredBadges =
    filterLevel === "ALL"
      ? allBadges
      : allBadges.filter((b) => b.level === filterLevel);

  const uniqueLevels = [...new Set(allBadges.map((b) => b.level))];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mes Badges</h2>
          <p className="text-muted-foreground mt-1">
            {earnedBadges.length} / {allBadges.length} badges obtenus
          </p>
        </div>

        {/* Level filter */}
        {uniqueLevels.length > 1 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={filterLevel === "ALL" ? "default" : "outline"}
              className="cursor-pointer text-[10px] rounded-lg px-3 py-1"
              onClick={() => setFilterLevel("ALL")}
            >
              Tous
            </Badge>
            {uniqueLevels.map((level) => (
              <Badge
                key={level}
                variant={filterLevel === level ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-[10px] rounded-lg px-3 py-1",
                  filterLevel === level &&
                    (BADGE_LEVEL_COLORS[level] || "bg-primary")
                )}
                onClick={() => setFilterLevel(level)}
              >
                <Medal className="w-3 h-3 mr-1" />
                {BADGE_LEVEL_LABELS[level] || level}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {allBadges.length > 0 && (
        <div className="max-w-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progression</span>
            <span>
              {earnedBadges.length}/{allBadges.length}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
              style={{
                width: `${allBadges.length > 0 ? (earnedBadges.length / allBadges.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const earned = earnedMap.get(badge.id);
          const levelStyle = getBadgeLevelStyle(badge.level);
          return (
            <Card
              key={badge.id}
              className={cn(
                "border-2 transition-all duration-200 overflow-hidden",
                earned
                  ? cn(levelStyle.border, levelStyle.bg)
                  : "border-border/60 opacity-50"
              )}
            >
              {/* Top gradient bar */}
              {earned && (
                <div
                  className={cn(
                    "h-1 bg-gradient-to-r",
                    levelStyle.gradient
                  )}
                />
              )}
              <CardContent className="p-5 text-center">
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3",
                    earned
                      ? cn("bg-gradient-to-br", levelStyle.gradient)
                      : "bg-muted/60"
                  )}
                >
                  <span className="text-3xl">{badge.icon}</span>
                </div>
                <h3 className="font-semibold text-sm text-foreground">
                  {badge.name}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                  {badge.description}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px]",
                      earned
                        ? BADGE_LEVEL_COLORS[badge.level] || ""
                        : "text-muted-foreground"
                    )}
                  >
                    <Medal className="w-2.5 h-2.5 mr-0.5" />
                    {BADGE_LEVEL_LABELS[badge.level] || badge.level}
                  </Badge>
                </div>
                {earned && (
                  <div className="mt-2">
                    <Badge className="bg-green-100 text-green-800 text-[10px] gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Obtenu
                    </Badge>
                    <p className="text-[9px] text-muted-foreground mt-1">
                      {formatDateShort(earned.earnedAt)}
                    </p>
                  </div>
                )}
                {!earned && (
                  <div className="mt-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] gap-1 bg-muted text-muted-foreground"
                    >
                      <Lock className="w-3 h-3" />
                      Non obtenu
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {allBadges.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
            <Medal className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">
            Aucun badge disponible
          </h3>
          <p className="text-sm text-muted-foreground">
            Les badges seront disponibles dès que vous complétez des formations
          </p>
        </div>
      )}
    </div>
  );
}

export function BadgesPage() {
  const { user } = useAppStore();
  if (user && (user.role === "ADMIN" || user.role === "FORMATEUR")) {
    return (
      <ManagerGuard
        title="Mes Badges"
        description={
          user.role === "ADMIN"
            ? "Gestion des badges"
            : "Espace formateur"
        }
        icon={Medal}
        navigateTo="admin-certificates"
      />
    );
  }
  return <BadgesContent />;
}
