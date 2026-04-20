"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Award, Ban, CheckCircle, Copy, Download, Loader2, ExternalLink,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  CERTIFICATE_TYPE_LABELS, CERTIFICATE_TYPE_COLORS,
  CERTIFICATE_STATUS_LABELS, CERTIFICATE_STATUS_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CertificateItem } from "../types";

// ─── Props ───────────────────────────────────────────────────────────

interface CertificateDetailDialogsProps {
  selectedCert: CertificateItem | null;
  detailOpen: boolean;
  onDetailOpenChange: (v: boolean) => void;
  verifyOpen: boolean;
  onVerifyOpenChange: (v: boolean) => void;
  revokeOpen: boolean;
  onRevokeOpenChange: (v: boolean) => void;
  onRevoked: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

const isExpired = (expiresAt: string | null) =>
  expiresAt ? new Date(expiresAt) < new Date() : false;

// ─── Certificate Detail Dialogs ─────────────────────────────────────

export function CertificateDetailDialogs({
  selectedCert, detailOpen, onDetailOpenChange,
  verifyOpen, onVerifyOpenChange,
  revokeOpen, onRevokeOpenChange, onRevoked,
}: CertificateDetailDialogsProps) {
  return (
    <>
      <DetailDialog cert={selectedCert} open={detailOpen} onOpenChange={onDetailOpenChange} onVerify={() => { onDetailOpenChange(false); onVerifyOpenChange(true); }} />
      <VerifyDialog cert={selectedCert} open={verifyOpen} onOpenChange={onVerifyOpenChange} />
      <RevokeDialog cert={selectedCert} open={revokeOpen} onOpenChange={onRevokeOpenChange} onRevoked={onRevoked} />
    </>
  );
}

// ─── Detail Dialog ──────────────────────────────────────────────────

function DetailDialog({ cert, open, onOpenChange, onVerify }: {
  cert: CertificateItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onVerify: () => void;
}) {
  if (!cert) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Détails du certificat
          </DialogTitle>
          <DialogDescription>Informations complètes du certificat</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="font-mono text-lg font-bold text-primary">{cert.code}</p>
            <Badge variant="secondary" className={cn("text-[9px] mt-2", CERTIFICATE_TYPE_COLORS[cert.type] || "")}>
              {CERTIFICATE_TYPE_LABELS[cert.type] || cert.type}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Utilisateur</p>
              <p className="font-medium">{cert.userName}</p>
              {cert.user && <p className="text-xs text-muted-foreground">{cert.user.email}</p>}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cours</p>
              <p className="font-medium">{cert.courseTitle}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Score</p>
              <p className={cn("font-bold text-lg", cert.maxScore > 0 && (cert.score / cert.maxScore) >= 0.7 ? "text-green-700" : "text-amber-700")}>
                {cert.score}/{cert.maxScore}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Statut</p>
              <Badge variant="secondary" className={cn("text-[9px]", CERTIFICATE_STATUS_COLORS[cert.status] || "")}>
                {CERTIFICATE_STATUS_LABELS[cert.status] || cert.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Délivré le</p>
              <p className="font-medium">{formatDate(cert.issuedAt)}</p>
            </div>
            {cert.expiresAt && (
              <div>
                <p className="text-xs text-muted-foreground">Expiration</p>
                <p className={cn("font-medium", isExpired(cert.expiresAt) ? "text-red-600" : "text-green-700")}>
                  {formatDate(cert.expiresAt)}
                  {isExpired(cert.expiresAt) && " (expiré)"}
                </p>
              </div>
            )}
          </div>
          {cert.revokeReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-medium text-red-700">Raison de révocation</p>
              <p className="text-xs text-red-600 mt-1">{cert.revokeReason}</p>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => window.open(`/api/certificates/${cert.id}/pdf?userId=${cert.userId}`, "_blank")} className="flex-1 rounded-lg text-xs">
              <Download className="w-3.5 h-3.5 mr-1" /> Télécharger PDF
            </Button>
            <Button variant="outline" size="sm" onClick={onVerify} className="flex-1 rounded-lg text-xs">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Vérifier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Verify Dialog ──────────────────────────────────────────────────

function VerifyDialog({ cert, open, onOpenChange }: {
  cert: CertificateItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!cert) return null;
  const verifyUrl = `https://academie.amdrh.ma/verify/${cert.code}`;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Vérification du certificat
          </DialogTitle>
          <DialogDescription>Informations de vérification</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="font-mono text-sm font-bold text-foreground mb-2">{cert.code}</p>
            <Button variant="outline" size="sm" className="h-7 text-[10px] rounded-md"
              onClick={() => { navigator.clipboard.writeText(cert.code); toast({ title: "Copié", description: "Le code a été copié." }); }}>
              <Copy className="w-3 h-3 mr-1" /> Copier le code
            </Button>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Lien de vérification</p>
            <p className="text-xs text-primary font-mono break-all">{verifyUrl}</p>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] mt-1 rounded-md"
              onClick={() => { navigator.clipboard.writeText(verifyUrl); toast({ title: "Copié", description: "Le lien a été copié." }); }}>
              <Copy className="w-3 h-3 mr-1" /> Copier le lien
            </Button>
          </div>
          <div className="border border-dashed border-border/60 rounded-lg p-6 text-center bg-muted/20">
            <div className="w-16 h-16 bg-muted/60 rounded-lg mx-auto flex items-center justify-center mb-2">
              <ExternalLink className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-[10px] text-muted-foreground">QR Code</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Revoke Dialog ──────────────────────────────────────────────────

function RevokeDialog({ cert, open, onOpenChange, onRevoked }: {
  cert: CertificateItem | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRevoked: () => void;
}) {
  const { user } = useAppStore();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (open) setReason(""); }, [open]);

  const handleRevoke = async () => {
    if (!cert) return;
    if (!reason.trim()) { setError("La raison de révocation est requise"); return; }
    setLoading(true); setError("");
    try {
      const p = new URLSearchParams();
      if (user) { p.set("userId", user.id); p.set("role", user.role); }
      const res = await fetch(`/api/admin/certificates/${cert.id}?${p}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REVOKED", revokeReason: reason }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Erreur lors de la révocation"); return; }
      toast({ title: "Certificat révoqué", description: `Le certificat ${cert.code} a été révoqué.` });
      onOpenChange(false); onRevoked();
    } catch { setError("Erreur serveur"); } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Ban className="w-5 h-5" /> Révoquer le certificat
          </DialogTitle>
          <DialogDescription>Cette action est irréversible.</DialogDescription>
        </DialogHeader>
        {cert && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">{cert.code}</p>
                  <p className="text-xs text-muted-foreground">{cert.userName} — {cert.courseTitle}</p>
                </div>
              </div>
            </div>
            {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">{error}</div>}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Raison de la révocation *</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Décrivez la raison de la révocation..." rows={3} className="rounded-lg" />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
              <Button onClick={handleRevoke} disabled={loading} className="rounded-lg bg-red-600 hover:bg-red-700">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ban className="w-4 h-4 mr-2" />} Révoquer
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
