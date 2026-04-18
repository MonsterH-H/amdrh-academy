"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search, ChevronLeft, ChevronRight, Award, Star, Plus, Loader2,
  Calendar, FileCheck, Clock, Users, Eye, MoreHorizontal, Pencil,
  Trash2, Gift, ShieldCheck, AlertCircle, X, ExternalLink,
  Download, Copy, Ban, Undo2, CheckCircle, ClipboardCheck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  BADGE_LEVEL_LABELS, BADGE_LEVEL_COLORS,
  CERTIFICATE_TYPE_LABELS, CERTIFICATE_TYPE_COLORS,
  CERTIFICATE_STATUS_LABELS, CERTIFICATE_STATUS_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

// ───────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────

interface CertificateItem {
  id: string;
  code: string;
  type: string;
  status: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  userName: string;
  score: number;
  maxScore: number;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
  qrCodeUrl: string | null;
  pdfUrl: string | null;
  user: { id: string; nom: string; prenom: string; email: string; role: string } | null;
  course: { id: string; title: string } | null;
}

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  level: string;
  icon: string;
  criteria: string;
  createdAt: string;
  _count: { userBadges: number };
}

interface CertStats {
  total: number;
  thisMonth: number;
  valid: number;
  expired: number;
}

// ───────────────────────────────────────────────────────────
// Main Component
// ───────────────────────────────────────────────────────────

export function AdminCertificatesPage() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Certificats & Badges</h2>
        <p className="text-muted-foreground mt-1">Gérez les certificats et badges de la plateforme</p>
      </div>
      <Tabs defaultValue="certificates" className="space-y-6">
        <TabsList className="bg-white border border-border/60 rounded-lg p-1">
          <TabsTrigger value="certificates" className="rounded-md gap-1.5 text-sm">
            <Award className="w-4 h-4" />
            Certificats
          </TabsTrigger>
          <TabsTrigger value="badges" className="rounded-md gap-1.5 text-sm">
            <Star className="w-4 h-4" />
            Badges
          </TabsTrigger>
        </TabsList>
        <TabsContent value="certificates">
          <CertificatesTab />
        </TabsContent>
        <TabsContent value="badges">
          <BadgesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Certificates Tab
// ───────────────────────────────────────────────────────────

function CertificatesTab() {
  const { user } = useAppStore();
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<CertStats | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchCertificates = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(page), limit: "15",
        ...(search && { search }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });
      const res = await fetch(`/api/admin/certificates?${params}`);
      const data = await res.json();
      setCertificates(data.certificates || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
      setStats(data.stats || null);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les certificats.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, search, dateFrom, dateTo]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setLoading(true);
    fetchCertificates();
  };

  const handleDateFilter = () => {
    setPage(1);
    setLoading(true);
    fetchCertificates();
  };

  const handleClearDateFilter = () => {
    setDateFrom("");
    setDateTo("");
    setPage(1);
    setLoading(true);
    setTimeout(() => window.location.reload(), 50);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  const isExpired = (expiresAt: string | null) =>
    expiresAt ? new Date(expiresAt) < new Date() : false;

  const refresh = () => {
    setLoading(true);
    fetchCertificates();
  };

  if (loading) return <CertificatesSkeleton />;

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total certificats", value: stats.total, icon: FileCheck, color: "bg-primary/10 text-primary" },
            { label: "Ce mois", value: stats.thisMonth, icon: Calendar, color: "bg-emerald-500/10 text-emerald-600" },
            { label: "Valides", value: stats.valid, icon: ShieldCheck, color: "bg-green-500/10 text-green-600" },
            { label: "Expirés", value: stats.expired, icon: AlertCircle, color: "bg-red-500/10 text-red-600" },
          ].map((s) => (
            <Card key={s.label} className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2.5 rounded-lg", s.color)}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, code, cours..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-lg h-10"
          />
        </form>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Du</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 rounded-lg text-xs w-36" />
          </div>
          <div className="flex items-center gap-1.5">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">Au</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 rounded-lg text-xs w-36" />
          </div>
          <Button variant="outline" size="sm" onClick={handleDateFilter} className="rounded-lg h-9 text-xs">Filtrer</Button>
          {(dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={handleClearDateFilter} className="rounded-lg h-9 text-xs">
              <X className="w-3 h-3 mr-1" /> Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">{total} certificat{total > 1 ? "s" : ""}</p>
        <div className="flex gap-2">
          <Button onClick={() => setBulkOpen(true)} variant="outline" className="rounded-lg text-sm border-border/60">
            <ClipboardCheck className="w-4 h-4 mr-1.5" />
            Délivrer en masse
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary/90 rounded-lg text-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Créer un certificat
          </Button>
        </div>
      </div>

      {/* Table */}
      {certificates.length === 0 ? (
        <div className="text-center py-20">
          <Award className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucun certificat trouvé</h3>
          <p className="text-sm text-muted-foreground">Modifiez vos filtres ou créez un nouveau certificat</p>
        </div>
      ) : (
        <>
          <Card className="border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 text-xs text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">Code</th>
                    <th className="text-left py-3 px-4 font-medium">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Cours</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Type</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Score</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Statut</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Délivré le</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((c) => {
                    const expired = isExpired(c.expiresAt);
                    const isRevoked = c.status === "REVOKED";
                    return (
                      <tr key={c.id} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs bg-muted/80 px-2 py-1 rounded-md text-foreground">
                            {c.code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                {c.userName?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate max-w-[140px]">{c.userName}</p>
                              <p className="text-[10px] text-muted-foreground sm:hidden">{c.courseTitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <p className="text-sm text-muted-foreground truncate max-w-[180px]">{c.courseTitle}</p>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <Badge variant="secondary" className={cn("text-[9px]", CERTIFICATE_TYPE_COLORS[c.type] || "bg-gray-100 text-gray-700")}>
                            {CERTIFICATE_TYPE_LABELS[c.type] || c.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className={cn(
                            "text-sm font-semibold",
                            c.maxScore > 0 && (c.score / c.maxScore) >= 0.7 ? "text-green-700" : "text-amber-700"
                          )}>
                            {c.score}/{c.maxScore}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <Badge variant="secondary" className={cn("text-[9px]",
                            isRevoked ? CERTIFICATE_STATUS_COLORS.REVOKED :
                            expired ? "bg-red-50 text-red-600" :
                            c.expiresAt ? "bg-green-50 text-green-700" :
                            CERTIFICATE_STATUS_COLORS.ACTIVE
                          )}>
                            {isRevoked ? "Révoqué" : expired ? "Expiré" : c.expiresAt ? "Valide" : "Sans expiration"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatDate(c.issuedAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => { setSelectedCert(c); setDetailOpen(true); }}>
                                <Eye className="w-4 h-4 mr-2" /> Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`/api/certificates/${c.id}/pdf?userId=${c.userId}`, "_blank")}>
                                <Download className="w-4 h-4 mr-2" /> Télécharger PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedCert(c); setVerifyOpen(true); }}>
                                <CheckCircle className="w-4 h-4 mr-2" /> Vérifier
                              </DropdownMenuItem>
                              {!isRevoked && (
                                <DropdownMenuItem onClick={() => { setSelectedCert(c); setRevokeOpen(true); }} className="text-red-600 focus:text-red-600">
                                  <Ban className="w-4 h-4 mr-2" /> Révoquer
                                </DropdownMenuItem>
                              )}
                              {isRevoked && (
                                <DropdownMenuItem onClick={() => handleReactivate(c)}>
                                  <Undo2 className="w-4 h-4 mr-2" /> Réactiver
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(page - 1); setLoading(true); }} className="rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(page + 1); setLoading(true); }} className="rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Certificate Dialog */}
      <CreateCertificateDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => { setPage(1); refresh(); }} />

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
                <DialogDescription>Informations complètes du certificat</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="font-mono text-lg font-bold text-primary">{selectedCert.code}</p>
                  <Badge variant="secondary" className={cn("text-[9px] mt-2", CERTIFICATE_TYPE_COLORS[selectedCert.type] || "")}>
                    {CERTIFICATE_TYPE_LABELS[selectedCert.type] || selectedCert.type}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Utilisateur</p>
                    <p className="font-medium">{selectedCert.userName}</p>
                    {selectedCert.user && <p className="text-xs text-muted-foreground">{selectedCert.user.email}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cours</p>
                    <p className="font-medium">{selectedCert.courseTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Score</p>
                    <p className={cn("font-bold text-lg", selectedCert.maxScore > 0 && (selectedCert.score / selectedCert.maxScore) >= 0.7 ? "text-green-700" : "text-amber-700")}>
                      {selectedCert.score}/{selectedCert.maxScore}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Statut</p>
                    <Badge variant="secondary" className={cn("text-[9px]", CERTIFICATE_STATUS_COLORS[selectedCert.status] || "")}>
                      {CERTIFICATE_STATUS_LABELS[selectedCert.status] || selectedCert.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Délivré le</p>
                    <p className="font-medium">{formatDate(selectedCert.issuedAt)}</p>
                  </div>
                  {selectedCert.expiresAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">Expiration</p>
                      <p className={cn("font-medium", isExpired(selectedCert.expiresAt) ? "text-red-600" : "text-green-700")}>
                        {formatDate(selectedCert.expiresAt)}
                        {isExpired(selectedCert.expiresAt) && " (expiré)"}
                      </p>
                    </div>
                  )}
                </div>
                {selectedCert.revokeReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-red-700">Raison de révocation</p>
                    <p className="text-xs text-red-600 mt-1">{selectedCert.revokeReason}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => window.open(`/api/certificates/${selectedCert.id}/pdf?userId=${selectedCert.userId}`, "_blank")} className="flex-1 rounded-lg text-xs">
                    <Download className="w-3.5 h-3.5 mr-1" /> Télécharger PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); setVerifyOpen(true); }} className="flex-1 rounded-lg text-xs">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Vérifier
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent className="max-w-sm">
          {selectedCert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Vérification du certificat
                </DialogTitle>
                <DialogDescription>Informations de vérification</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="font-mono text-sm font-bold text-foreground mb-2">{selectedCert.code}</p>
                  <div className="flex items-center justify-center gap-2">
                    <input type="text" readOnly value={selectedCert.code} className="sr-only" id={`verify-code-${selectedCert.id}`} />
                    <Button
                      variant="outline" size="sm" className="h-7 text-[10px] rounded-md"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedCert.code);
                        toast({ title: "Copié", description: "Le code a été copié." });
                      }}
                    >
                      <Copy className="w-3 h-3 mr-1" /> Copier le code
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Lien de vérification</p>
                  <p className="text-xs text-primary font-mono break-all">
                    https://academie.amdrh.ma/verify/{selectedCert.code}
                  </p>
                  <Button
                    variant="ghost" size="sm" className="h-6 text-[10px] mt-1 rounded-md"
                    onClick={() => {
                      navigator.clipboard.writeText(`https://academie.amdrh.ma/verify/${selectedCert.code}`);
                      toast({ title: "Copié", description: "Le lien a été copié." });
                    }}
                  >
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
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke Dialog */}
      <RevokeDialog
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        cert={selectedCert}
        onRevoked={() => { setRevokeOpen(false); refresh(); }}
      />

      {/* Bulk Issue Dialog */}
      <BulkIssueDialog open={bulkOpen} onOpenChange={setBulkOpen} onIssued={refresh} />
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Revoke Certificate Dialog
// ───────────────────────────────────────────────────────────

function RevokeDialog({
  open, onOpenChange, cert, onRevoked,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cert: CertificateItem | null;
  onRevoked: () => void;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const handleRevoke = async () => {
    if (!cert) return;
    if (!reason.trim()) {
      setError("La raison de révocation est requise");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/certificates/${cert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REVOKED", revokeReason: reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la révocation");
        return;
      }
      toast({ title: "Certificat révoqué", description: `Le certificat ${cert.code} a été révoqué.` });
      onOpenChange(false);
      onRevoked();
    } catch {
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Ban className="w-5 h-5" />
            Révoquer le certificat
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
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">{error}</div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Raison de la révocation *</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Décrivez la raison de la révocation..."
                rows={3}
                className="rounded-lg"
              />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
              <Button onClick={handleRevoke} disabled={loading} className="rounded-lg bg-red-600 hover:bg-red-700">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Ban className="w-4 h-4 mr-2" />}
                Révoquer
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ───────────────────────────────────────────────────────────
// Bulk Issue Dialog
// ───────────────────────────────────────────────────────────

function BulkIssueDialog({
  open, onOpenChange, onIssued,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onIssued: () => void;
}) {
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [eligibleUsers, setEligibleUsers] = useState<Array<{ id: string; prenom: string; nom: string; email: string; checked: boolean }>>([]);
  const [certType, setCertType] = useState("CERTIFICAT");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/api/courses?limit=200")
        .then((r) => r.json())
        .then((d) => setCourses(d.courses || []))
        .catch(() => {});
      setSelectedCourse("");
      setEligibleUsers([]);
      setCertType("CERTIFICAT");
      setError("");
    }
  }, [open]);

  const handleCourseSelect = async (courseId: string) => {
    setSelectedCourse(courseId);
    setLoading(true);
    setError("");
    try {
      // Fetch enrollments for this course that are completed
      const res = await fetch(`/api/admin/traceability?courseId=${courseId}&status=termine&limit=100`);
      const data = await res.json();
      const enrollments = data.enrollments || [];

      // Filter eligible: completed + passed quiz + no existing certificate
      const eligible = enrollments.filter(
        (e: Record<string, unknown>) => !e.certificateId && (e.quizStatus === "REUSSI" || (e as { quizStatus?: string }).quizStatus === "REUSSI")
      );

      // If no passed quiz filter, just use completed without cert
      const users = (eligible.length > 0 ? eligible : enrollments.filter((e: Record<string, unknown>) => !e.certificateId)).map(
        (e: Record<string, unknown>) => ({
          id: e.userId as string,
          prenom: (e.userName as string)?.split(" ")[0] || "",
          nom: (e.userName as string)?.split(" ").slice(1).join(" ") || "",
          email: e.userEmail as string,
          checked: true,
        })
      );
      setEligibleUsers(users);
    } catch {
      setError("Impossible de charger les utilisateurs éligibles");
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    setEligibleUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, checked: !u.checked } : u))
    );
  };

  const toggleAll = () => {
    const allChecked = eligibleUsers.every((u) => u.checked);
    setEligibleUsers((prev) => prev.map((u) => ({ ...u, checked: !allChecked })));
  };

  const handleBulkIssue = async () => {
    const selected = eligibleUsers.filter((u) => u.checked);
    if (selected.length === 0) {
      setError("Sélectionnez au moins un utilisateur");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/certificates/bulk-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse,
          userIds: selected.map((u) => u.id),
          type: certType,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la délivrance");
        return;
      }
      const data = await res.json();
      toast({
        title: "Certificats délivrés",
        description: `${data.summary.succeeded} certificat(s) créé(s), ${data.summary.failed} échoué(s).`,
      });
      onOpenChange(false);
      onIssued();
    } catch {
      setError("Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCount = eligibleUsers.filter((u) => u.checked).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Délivrer en masse
          </DialogTitle>
          <DialogDescription>Sélectionnez un cours et les utilisateurs éligibles</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">{error}</div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Cours *</Label>
            <Select value={selectedCourse} onValueChange={handleCourseSelect}>
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Sélectionner un cours" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground ml-2">Chargement...</span>
            </div>
          ) : eligibleUsers.length > 0 ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Type de certificat</Label>
                <Select value={certType} onValueChange={setCertType}>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATTESTATION">
                      <span className="flex items-center gap-2">
                        <span className={cn("w-2.5 h-2.5 rounded-full bg-emerald-400")} />
                        Attestation de réussite
                      </span>
                    </SelectItem>
                    <SelectItem value="CERTIFICAT_COMPLETION">
                      <span className="flex items-center gap-2">
                        <span className={cn("w-2.5 h-2.5 rounded-full bg-blue-400")} />
                        Certificat de complétion
                      </span>
                    </SelectItem>
                    <SelectItem value="DIPLOME">
                      <span className="flex items-center gap-2">
                        <span className={cn("w-2.5 h-2.5 rounded-full bg-amber-400")} />
                        Diplôme
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">
                  Utilisateurs éligibles ({eligibleUsers.length})
                </Label>
                <Button variant="ghost" size="sm" onClick={toggleAll} className="h-7 text-[10px] rounded-md">
                  {eligibleUsers.every((u) => u.checked) ? "Tout décocher" : "Tout cocher"}
                </Button>
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto border border-border/40 rounded-lg p-2">
                {eligibleUsers.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox checked={u.checked} onCheckedChange={() => toggleUser(u.id)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{u.prenom} {u.nom}</p>
                      <p className="text-[10px] text-muted-foreground">{u.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            </>
          ) : selectedCourse ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aucun utilisateur éligible pour ce cours</p>
              <p className="text-[10px] text-muted-foreground mt-1">Les utilisateurs doivent avoir complété le cours et réussi le quiz</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Sélectionnez un cours pour voir les utilisateurs éligibles</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button
            onClick={handleBulkIssue}
            disabled={submitting || eligibleUsers.length === 0 || selectedCount === 0}
            className="rounded-lg"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Award className="w-4 h-4 mr-2" />
            )}
            Délivrer ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper for reactivate
async function handleReactivate(cert: CertificateItem) {
  try {
    const res = await fetch(`/api/admin/certificates/${cert.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ACTIVE" }),
    });
    if (res.ok) {
      toast({ title: "Certificat réactivé", description: `Le certificat ${cert.code} a été réactivé.` });
    } else {
      toast({ title: "Erreur", description: "Impossible de réactiver", variant: "destructive" });
    }
  } catch {
    toast({ title: "Erreur serveur", variant: "destructive" });
  }
}

// ───────────────────────────────────────────────────────────
// Create Certificate Dialog
// ───────────────────────────────────────────────────────────

function CreateCertificateDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<Array<{ id: string; nom: string; prenom: string; email: string }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [form, setForm] = useState({
    userId: "",
    courseId: "",
    type: "CERTIFICAT",
    score: "",
    maxScore: "100",
    expiryDate: "",
  });

  useEffect(() => {
    if (open) {
      Promise.all([
        fetch("/api/users?limit=200").then((r) => r.json()).then((d) => setUsers(d.users || [])).catch(() => {}),
        fetch("/api/courses?limit=200").then((r) => r.json()).then((d) => setCourses(d.courses || [])).catch(() => {}),
      ]);
      setForm({ userId: "", courseId: "", type: "CERTIFICAT", score: "", maxScore: "100", expiryDate: "" });
    }
  }, [open]);

  const handleSubmit = async () => {
    setError("");
    if (!form.userId || !form.courseId || !form.score || !form.maxScore) {
      setError("Utilisateur, cours, score et score maximum sont requis");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: form.userId,
          courseId: form.courseId,
          type: form.type,
          score: parseInt(form.score),
          maxScore: parseInt(form.maxScore),
          expiryDate: form.expiryDate || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la création");
        return;
      }
      const data = await res.json();
      toast({
        title: "Certificat créé",
        description: `Certificat ${data.certificate.code} a été délivré avec succès.`,
      });
      onOpenChange(false);
      onCreated();
    } catch {
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Créer un certificat
          </DialogTitle>
          <DialogDescription>Délivrez manuellement un certificat à un utilisateur.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">{error}</div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Type de certificat</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ATTESTATION">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    Attestation de réussite
                  </span>
                </SelectItem>
                <SelectItem value="CERTIFICAT_COMPLETION">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    Certificat de complétion
                  </span>
                </SelectItem>
                <SelectItem value="DIPLOME">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Diplôme
                  </span>
                </SelectItem>
                <SelectItem value="CERTIFICAT">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    Certificat
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Utilisateur *</Label>
            <Select value={form.userId} onValueChange={(v) => setForm({ ...form, userId: v })}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Sélectionner un utilisateur" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.prenom} {u.nom} ({u.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Cours *</Label>
            <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Sélectionner un cours" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Score *</Label>
              <Input type="number" className="h-10 rounded-lg" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} placeholder="85" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Score maximum *</Label>
              <Input type="number" className="h-10 rounded-lg" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} placeholder="100" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Date d&apos;expiration (optionnel)</Label>
            <Input type="date" className="h-10 rounded-lg" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Award className="w-4 h-4 mr-2" />}
            Délivrer le certificat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ───────────────────────────────────────────────────────────
// Badges Tab
// ───────────────────────────────────────────────────────────

function BadgesTab() {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [awardOpen, setAwardOpen] = useState(false);
  const [badgeUsersOpen, setBadgeUsersOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [badgeUsers, setBadgeUsers] = useState<Array<Record<string, unknown>>>([]);
  const [badgeUsersLoading, setBadgeUsersLoading] = useState(false);

  const fetchBadges = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/badges");
      const data = await res.json();
      setBadges(data.badges || []);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les badges.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  const handleViewUsers = async (badge: BadgeItem) => {
    setSelectedBadge(badge);
    setBadgeUsersOpen(true);
    setBadgeUsersLoading(true);
    try {
      const res = await fetch(`/api/admin/badges/${badge.id}`);
      const data = await res.json();
      setBadgeUsers(data.badge?.userBadges || []);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les utilisateurs.", variant: "destructive" });
    } finally {
      setBadgeUsersLoading(false);
    }
  };

  const handleEdit = (badge: BadgeItem) => {
    setSelectedBadge(badge);
    setEditOpen(true);
  };

  const handleDelete = (badge: BadgeItem) => {
    setSelectedBadge(badge);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBadge) return;
    try {
      const res = await fetch(`/api/admin/badges/${selectedBadge.id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Badge supprimé", description: `"${selectedBadge.name}" a été supprimé.` });
        fetchBadges();
      } else {
        toast({ title: "Erreur", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur serveur", variant: "destructive" });
    }
    setDeleteOpen(false);
    setSelectedBadge(null);
  };

  if (loading) return <BadgesSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-sm text-muted-foreground">{badges.length} badge{badges.length > 1 ? "s" : ""}</p>
        <div className="flex gap-2">
          <Button onClick={() => setAwardOpen(true)} variant="outline" className="rounded-lg text-sm">
            <Gift className="w-4 h-4 mr-1.5" />
            Attribuer un badge
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary/90 rounded-lg text-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Nouveau badge
          </Button>
        </div>
      </div>

      {badges.length === 0 ? (
        <div className="text-center py-20">
          <Star className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucun badge</h3>
          <p className="text-sm text-muted-foreground">Créez votre premier badge pour récompenser les utilisateurs</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <Card key={badge.id} className="border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", BADGE_LEVEL_COLORS[badge.level] || "bg-gray-200")}>
                      {badge.icon || "🏆"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{badge.name}</h3>
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        {BADGE_LEVEL_LABELS[badge.level] || badge.level}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleViewUsers(badge)}>
                        <Users className="w-4 h-4 mr-2" />
                        Voir les titulaires
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(badge)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(badge)} className="text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{badge.description}</p>
                <Separator className="mb-3" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{badge._count.userBadges} obtenu{badge._count.userBadges > 1 ? "s" : ""}</span>
                  </div>
                  <button
                    onClick={() => handleViewUsers(badge)}
                    className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                  >
                    Voir <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateBadgeDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchBadges} />

      {selectedBadge && (
        <EditBadgeDialog open={editOpen} onOpenChange={setEditOpen} badge={selectedBadge} onUpdated={fetchBadges} />
      )}

      <AwardBadgeDialog open={awardOpen} onOpenChange={setAwardOpen} badges={badges} />

      <Dialog open={badgeUsersOpen} onOpenChange={setBadgeUsersOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedBadge && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-lg", BADGE_LEVEL_COLORS[selectedBadge.level] || "bg-gray-200")}>
                    {selectedBadge.icon}
                  </div>
                  Titulaires du badge
                </DialogTitle>
                <DialogDescription>
                  {selectedBadge.name} — {badgeUsers.length} utilisateur{badgeUsers.length > 1 ? "s" : ""}
                </DialogDescription>
              </DialogHeader>
              {badgeUsersLoading ? (
                <div className="py-8 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : badgeUsers.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Aucun utilisateur n&apos;a encore obtenu ce badge</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {badgeUsers.map((ub: Record<string, unknown>) => {
                    const user = ub.user as Record<string, unknown>;
                    return (
                      <div key={ub.id as string} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                            {(user.prenom as string)?.charAt(0)}{(user.nom as string)?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{String(user.prenom)} {String(user.nom)}</p>
                          <p className="text-[10px] text-muted-foreground">{user.email as string}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(ub.earnedAt as string).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le badge</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le badge &quot;{selectedBadge?.name}&quot; ?
              Cette action est irréversible et supprimera toutes les attributions associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-lg bg-destructive text-white hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Create Badge Dialog
// ───────────────────────────────────────────────────────────

function CreateBadgeDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", description: "", level: "BRONZE", icon: "🏆", criteria: "",
  });

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.description || !form.level) {
      setError("Nom, description et niveau sont requis");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la création");
        return;
      }
      toast({ title: "Badge créé", description: `"${form.name}" a été créé avec succès.` });
      onOpenChange(false);
      setForm({ name: "", description: "", level: "BRONZE", icon: "🏆", criteria: "" });
      onCreated();
    } catch {
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const levelOptions = Object.entries(BADGE_LEVEL_LABELS);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Créer un badge
          </DialogTitle>
          <DialogDescription>Définissez un nouveau badge pour récompenser les utilisateurs.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">{error}</div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Nom *</Label>
            <Input className="h-10 rounded-lg" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Expert en arbitrage" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description *</Label>
            <Textarea className="rounded-lg" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description du badge..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Niveau *</Label>
              <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {levelOptions.map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      <span className="flex items-center gap-2">
                        <span className={cn("w-3 h-3 rounded-full", BADGE_LEVEL_COLORS[k])} />
                        {v}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Icône (emoji)</Label>
              <Input className="h-10 rounded-lg text-center text-xl" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} maxLength={2} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Critères d&apos;obtention</Label>
            <Textarea className="rounded-lg" value={form.criteria} onChange={(e) => setForm({ ...form, criteria: e.target.value })} placeholder="Décrivez les conditions pour obtenir ce badge..." rows={2} />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Créer le badge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ───────────────────────────────────────────────────────────
// Edit Badge Dialog
// ───────────────────────────────────────────────────────────

function EditBadgeDialog({ open, onOpenChange, badge, onUpdated }: { open: boolean; onOpenChange: (v: boolean) => void; badge: BadgeItem; onUpdated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: badge.name,
    description: badge.description,
    level: badge.level,
    icon: badge.icon,
    criteria: badge.criteria,
  });

  useEffect(() => {
    setForm({ name: badge.name, description: badge.description, level: badge.level, icon: badge.icon, criteria: badge.criteria });
  }, [badge]);

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.description) {
      setError("Nom et description sont requis");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/badges/${badge.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la modification");
        return;
      }
      toast({ title: "Badge modifié", description: `"${form.name}" a été modifié.` });
      onOpenChange(false);
      onUpdated();
    } catch {
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const levelOptions = Object.entries(BADGE_LEVEL_LABELS);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            Modifier le badge
          </DialogTitle>
          <DialogDescription>Modifiez les informations du badge.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">{error}</div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Nom *</Label>
            <Input className="h-10 rounded-lg" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description *</Label>
            <Textarea className="rounded-lg" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Niveau</Label>
              <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {levelOptions.map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      <span className="flex items-center gap-2">
                        <span className={cn("w-3 h-3 rounded-full", BADGE_LEVEL_COLORS[k])} />
                        {v}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Icône</Label>
              <Input className="h-10 rounded-lg text-center text-xl" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} maxLength={2} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Critères</Label>
            <Textarea className="rounded-lg" value={form.criteria} onChange={(e) => setForm({ ...form, criteria: e.target.value })} rows={2} />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ───────────────────────────────────────────────────────────
// Award Badge Dialog
// ───────────────────────────────────────────────────────────

function AwardBadgeDialog({ open, onOpenChange, badges }: { open: boolean; onOpenChange: (v: boolean) => void; badges: BadgeItem[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<Array<{ id: string; nom: string; prenom: string; email: string }>>([]);
  const [form, setForm] = useState({ badgeId: "", userId: "" });

  useEffect(() => {
    if (open) {
      fetch("/api/users?limit=200").then((r) => r.json()).then((d) => setUsers(d.users || [])).catch(() => {});
      setForm({ badgeId: "", userId: "" });
    }
  }, [open]);

  const handleSubmit = async () => {
    setError("");
    if (!form.badgeId || !form.userId) {
      setError("Badge et utilisateur sont requis");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/badges/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de l&apos;attribution");
        return;
      }
      toast({ title: "Badge attribué", description: "Le badge a été attribué avec succès." });
      onOpenChange(false);
    } catch {
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Attribuer un badge
          </DialogTitle>
          <DialogDescription>Attribuez un badge à un utilisateur.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">{error}</div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Badge *</Label>
            <Select value={form.badgeId} onValueChange={(v) => setForm({ ...form, badgeId: v })}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Sélectionner un badge" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {badges.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    <span className="flex items-center gap-2">
                      <span>{b.icon}</span>
                      {b.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Utilisateur *</Label>
            <Select value={form.userId} onValueChange={(v) => setForm({ ...form, userId: v })}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Sélectionner un utilisateur" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.prenom} {u.nom} ({u.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Gift className="w-4 h-4 mr-2" />}
            Attribuer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ───────────────────────────────────────────────────────────
// Skeletons
// ───────────────────────────────────────────────────────────

function CertificatesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
      </div>
    </div>
  );
}

function BadgesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
      </div>
    </div>
  );
}
