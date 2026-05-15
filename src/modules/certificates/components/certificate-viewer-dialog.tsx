"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Copy, Share2, ShieldCheck, CheckCircle, ExternalLink, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { CERTIFICATE_TYPE_LABELS, CERTIFICATE_TYPE_COLORS } from "@/lib/constants";
import { formatDateLong } from "@/utils/format";
import type { CertificateData } from "./certificate-card";

interface CertificateViewerDialogProps {
  cert: CertificateData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadPdf?: (cert: CertificateData) => void;
}

function getCertTypeIcon(type: string) {
  switch (type) {
    case "ATTESTATION": return "📋";
    case "DIPLOME": return "🎓";
    default: return "🏆";
  }
}

function getScoreColor(score: number, maxScore: number): string {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (pct >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (pct >= 70) return "text-green-600 dark:text-green-400";
  if (pct >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function ScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div>
          <span className={cn("text-3xl font-bold", getScoreColor(score, maxScore))}>
            {score}
          </span>
          <span className="text-lg text-muted-foreground">/{maxScore}</span>
        </div>
        <span className={cn("text-sm font-semibold", getScoreColor(score, maxScore))}>
          {pct}%
        </span>
      </div>
      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            pct >= 70 ? "bg-gradient-to-r from-green-400 to-emerald-500" :
              pct >= 50 ? "bg-gradient-to-r from-amber-400 to-amber-500" :
                "bg-gradient-to-r from-red-400 to-red-500"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function CertificateViewerDialog({
  cert, open, onOpenChange, onDownloadPdf,
}: CertificateViewerDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!cert) return null;

  const isRevoked = cert.status === "REVOKED";
  const isExpired = cert.expiresAt && new Date(cert.expiresAt) < new Date();
  const isValid = !isRevoked && !isExpired;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(cert.code);
      setCopied(true);
      toast({ title: "Copié", description: "Le code a été copié dans le presse-papiers." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Erreur", description: "Impossible de copier", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    const text = `Je viens d'obtenir mon certificat "${cert.courseTitle}" sur AMDRH Academy ! Code: ${cert.code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Certificat AMDRH Academy", text, url: `https://academie.amdrh.ma/verify/${cert.code}` });
      } catch {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        toast({ title: "Copié", description: "Texte de partage copié dans le presse-papiers." });
      } catch {
        toast({ title: "Erreur", description: "Impossible de copier", variant: "destructive" });
      }
    }
  };

  const handleVerify = () => {
    window.open(`https://academie.amdrh.ma/verify/${cert.code}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Certificate Card */}
        <div className="relative">
          {/* Header band */}
          <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 px-6 py-5 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-xl">{getCertTypeIcon(cert.type)}</span>
                </div>
                <div>
                  <p className="text-xs font-medium opacity-80">AMDRH Academy</p>
                  <p className="font-bold text-sm">
                    {CERTIFICATE_TYPE_LABELS[cert.type] || "Certificat"}
                  </p>
                </div>
              </div>
              {isValid && (
                <div className="flex items-center gap-1.5 bg-emerald-400/20 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                  <span className="text-[10px] font-medium text-emerald-200">Vérifié</span>
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="px-6 pb-6 pt-5 space-y-5">
            <DialogHeader className="sr-only">
              <DialogTitle>Certificat — {cert.courseTitle}</DialogTitle>
              <DialogDescription>Aperçu complet du certificat</DialogDescription>
            </DialogHeader>

            {/* Course title */}
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Certificat de réussite</p>
              <h3 className="font-bold text-lg text-foreground leading-tight">{cert.courseTitle}</h3>
            </div>

            <Separator className="bg-border/60" />

            {/* Recipient */}
            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">Délivré à</p>
              <p className="font-semibold text-foreground">{cert.userName || "Apprenant"}</p>
            </div>

            {/* Score */}
            <div className="bg-muted/40 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 text-center">Score obtenu</p>
              <ScoreBar score={cert.score} maxScore={cert.maxScore} />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-3 text-center">
                <p className="text-[10px] text-muted-foreground mb-1">Date de délivrance</p>
                <p className="text-xs font-medium text-foreground">{formatDateLong(cert.issuedAt)}</p>
              </div>
              {cert.expiresAt ? (
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1">Date d&apos;expiration</p>
                  <p className={cn("text-xs font-medium", isExpired ? "text-red-600 dark:text-red-400" : "text-foreground")}>
                    {formatDateLong(cert.expiresAt)}
                  </p>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1">Validité</p>
                  <p className="text-xs font-medium text-green-600 dark:text-green-400">Illimitée</p>
                </div>
              )}
            </div>

            {/* Certificate code */}
            <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground mb-0.5">Code du certificat</p>
                <p className="text-xs font-mono font-bold text-foreground truncate">{cert.code}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 flex-shrink-0 text-[10px] rounded-lg"
                onClick={handleCopyCode}
              >
                {copied ? <CheckCircle className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copié" : "Copier"}
              </Button>
            </div>

            {/* QR Code placeholder */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 bg-muted/20">
                <QrCode className="w-8 h-8 text-muted-foreground/40" />
                <span className="text-[8px] text-muted-foreground/60">QR Code</span>
              </div>
            </div>

            {/* Revocation notice */}
            {isRevoked && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-lg p-3">
                <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">⚠️ Certificat révoqué</p>
                {cert.revokeReason && <p className="text-[10px] text-red-600 dark:text-red-400">{cert.revokeReason}</p>}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              {onDownloadPdf && (
                <Button variant="outline" size="sm" className="flex-1 rounded-lg text-xs gap-1.5" onClick={() => onDownloadPdf(cert)}>
                  <Download className="w-3.5 h-3.5" /> Télécharger
                </Button>
              )}
              <Button variant="outline" size="sm" className="flex-1 rounded-lg text-xs gap-1.5" onClick={handleShare}>
                <Share2 className="w-3.5 h-3.5" /> Partager
              </Button>
              <Button variant="outline" size="sm" className="flex-1 rounded-lg text-xs gap-1.5" onClick={handleVerify}>
                <ExternalLink className="w-3.5 h-3.5" /> Vérifier
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
