"use client";

import { useEffect, useState } from "react";
import { useAppStore, type AppView } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Award, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  CertificateCard,
  CertificateDetailDialog,
  type CertificateData,
} from "./certificate-card";

// ─── Manager Guard ──────────────────────────────────────────────────────────

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
        <Button onClick={() => navigate(navigateTo as AppView)} className="rounded-lg">
          Aller à la gestion
        </Button>
      </div>
    </div>
  );
}

// ─── Certificates Content ───────────────────────────────────────────────────

function CertificatesContent() {
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
    try {
      navigator.clipboard.writeText(code);
      toast({ title: "Copié", description: "Le code a été copié dans le presse-papiers." });
    } catch {
      toast({ title: "Erreur", description: "Impossible de copier", variant: "destructive" });
    }
  };

  const handleCopyLink = (code: string) => {
    try {
      navigator.clipboard.writeText(`${window.location.origin}/verify/${code}`);
      toast({ title: "Copié", description: "Le lien de vérification a été copié." });
    } catch {
      toast({ title: "Erreur", description: "Impossible de copier", variant: "destructive" });
    }
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
          <h3 className="font-semibold text-foreground mb-2">Erreur de chargement</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

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
          <h3 className="font-semibold text-foreground mb-2">Aucun certificat</h3>
          <p className="text-sm text-muted-foreground">
            Complétez un cours certifiant pour obtenir votre premier certificat
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              cert={cert}
              onOpenDetail={handleOpenDetail}
              onDownloadPdf={handleDownloadPdf}
              onCopyLink={handleCopyLink}
            />
          ))}
        </div>
      )}

      <CertificateDetailDialog
        cert={selectedCert}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onDownloadPdf={handleDownloadPdf}
        onCopyCode={handleCopyCode}
        onCopyLink={handleCopyLink}
      />
    </div>
  );
}

// ─── Exported Page ──────────────────────────────────────────────────────────

export function CertificatesPage() {
  const { user } = useAppStore();
  if (user && (user.role === "ADMIN" || user.role === "FORMATEUR")) {
    return (
      <ManagerGuard
        title="Mes Certificats"
        description={user.role === "ADMIN" ? "Gestion des certificats" : "Espace formateur"}
        icon={Award}
        navigateTo="admin-certificates"
      />
    );
  }
  return <CertificatesContent />;
}
