"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Clock, Download, ExternalLink, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { CERTIFICATE_TYPE_LABELS, CERTIFICATE_TYPE_COLORS } from "@/lib/constants";

export interface CertificateData {
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

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function getCertStatus(cert: CertificateData): { label: string; color: string } {
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

interface CertificateCardProps {
  cert: CertificateData;
  onOpenDetail: (cert: CertificateData) => void;
  onDownloadPdf: (cert: CertificateData) => void;
  onCopyLink: (code: string) => void;
}

export function CertificateCard({ cert, onOpenDetail, onDownloadPdf, onCopyLink }: CertificateCardProps) {
  const statusInfo = getCertStatus(cert);
  const scorePercent = cert.maxScore > 0 ? Math.round((cert.score / cert.maxScore) * 100) : 0;

  return (
    <Card
      className={cn(
        "border-2 bg-gradient-to-br cursor-pointer transition-all hover:shadow-md",
        cert.status === "REVOKED" ? "border-red-200 from-red-50/50 to-white"
          : cert.type === "DIPLOME" ? "border-amber-200 from-amber-50/50 to-white"
            : cert.type === "ATTESTATION" ? "border-emerald-200 from-emerald-50/50 to-white"
              : "border-amber-200 from-amber-50/50 to-white"
      )}
      onClick={() => onOpenDetail(cert)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
            cert.type === "DIPLOME" ? "bg-gradient-to-br from-amber-400 to-amber-600"
              : cert.type === "ATTESTATION" ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                : "bg-gradient-to-br from-blue-400 to-blue-600"
          )}>
            <span className="text-2xl">{getCertTypeIcon(cert.type)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm truncate">{cert.courseTitle}</h3>
            <div className="flex items-center gap-1.5 flex-wrap mb-2 mt-1">
              <Badge variant="secondary" className={cn("text-[9px]", CERTIFICATE_TYPE_COLORS[cert.type] || "bg-primary/10 text-primary")}>
                {CERTIFICATE_TYPE_LABELS[cert.type] || "Certificat"}
              </Badge>
              <Badge variant="secondary" className={cn("text-[9px]", statusInfo.color)}>{statusInfo.label}</Badge>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full", scorePercent >= 70 ? "bg-green-500" : scorePercent >= 50 ? "bg-amber-500" : "bg-red-500")}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-foreground">{cert.score}/{cert.maxScore}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Délivré le {formatDateShort(cert.issuedAt)}</span>
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-[10px] font-mono">{cert.code}</Badge>
            </div>
            {cert.status === "REVOKED" && cert.revokeReason && (
              <p className="text-[10px] text-red-600 mt-2 bg-red-50 rounded px-2 py-1">{cert.revokeReason}</p>
            )}
            <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-md flex items-center gap-1" onClick={() => onDownloadPdf(cert)}>
                <Download className="w-3 h-3" /> PDF
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] rounded-md flex items-center gap-1 text-primary hover:text-primary/80" onClick={() => onCopyLink(cert.code)}>
                <ExternalLink className="w-3 h-3" /> Vérifier
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CertificateDetailDialogProps {
  cert: CertificateData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadPdf: (cert: CertificateData) => void;
  onCopyCode: (code: string) => void;
  onCopyLink: (code: string) => void;
}

export function CertificateDetailDialog({
  cert, open, onOpenChange, onDownloadPdf, onCopyCode, onCopyLink,
}: CertificateDetailDialogProps) {
  if (!cert) return null;
  const statusInfo = getCertStatus(cert);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">🏆 Détails du certificat</DialogTitle>
          <DialogDescription>Informations complètes de votre certificat</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="font-mono text-lg font-bold text-primary">{cert.code}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="secondary" className={cn("text-[9px]", CERTIFICATE_TYPE_COLORS[cert.type] || "")}>
                {CERTIFICATE_TYPE_LABELS[cert.type] || "Certificat"}
              </Badge>
              <Badge variant="secondary" className={cn("text-[9px]", statusInfo.color)}>{statusInfo.label}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Cours</p>
              <p className="font-medium">{cert.courseTitle}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Score</p>
              <p className={cn("font-bold text-lg", cert.maxScore > 0 && cert.score / cert.maxScore >= 0.7 ? "text-green-700" : "text-amber-700")}>
                {cert.score}/{cert.maxScore}
              </p>
              <p className="text-[10px] text-muted-foreground">({cert.maxScore > 0 ? Math.round((cert.score / cert.maxScore) * 100) : 0}%)</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Délivré le</p>
              <p className="font-medium">{formatDate(cert.issuedAt)}</p>
            </div>
            {cert.expiresAt && (
              <div>
                <p className="text-xs text-muted-foreground">Expiration</p>
                <p className={cn("font-medium", new Date(cert.expiresAt) < new Date() ? "text-red-600" : "text-green-700")}>
                  {formatDate(cert.expiresAt)}
                </p>
              </div>
            )}
          </div>

          {cert.status === "REVOKED" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-medium text-red-700 mb-1">Révocation</p>
              {cert.revokedAt && <p className="text-[10px] text-red-600">Le {formatDate(cert.revokedAt)}</p>}
              {cert.revokeReason && <p className="text-xs text-red-600 mt-1">{cert.revokeReason}</p>}
            </div>
          )}

          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Lien de vérification</p>
            <p className="text-xs text-primary font-mono break-all">https://academie.amdrh.ma/verify/{cert.code}</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1 rounded-lg text-xs" onClick={() => onDownloadPdf(cert)}>
              <Download className="w-3.5 h-3.5 mr-1" /> Télécharger PDF
            </Button>
            <Button variant="outline" size="sm" className="flex-1 rounded-lg text-xs" onClick={() => onCopyCode(cert.code)}>
              <Copy className="w-3.5 h-3.5 mr-1" /> Copier le code
            </Button>
            <Button variant="outline" size="sm" className="flex-1 rounded-lg text-xs" onClick={() => onCopyLink(cert.code)}>
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Copier le lien
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
