"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, ChevronLeft, ChevronRight, Award, Clock, Plus,
  Eye, MoreHorizontal, Download, Ban, Undo2, CheckCircle,
  FileCheck, Calendar, ShieldCheck, AlertCircle, X, ClipboardCheck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  CERTIFICATE_TYPE_LABELS, CERTIFICATE_TYPE_COLORS,
  CERTIFICATE_STATUS_LABELS, CERTIFICATE_STATUS_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CertificateItem, CertStats } from "../types";
import { handleReactivate } from "../types";
import { CreateCertificateDialog } from "./create-certificate-dialog";
import { CertificateDetailDialogs } from "./certificate-detail-dialog";
import { BulkIssueDialog } from "./bulk-issue-dialog";

// ─── Skeleton ───────────────────────────────────────────────────────

export function CertificatesSkeleton() {
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

// ─── Helpers ────────────────────────────────────────────────────────

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

const isExpired = (expiresAt: string | null) =>
  expiresAt ? new Date(expiresAt) < new Date() : false;

// ─── Certificates Tab ──────────────────────────────────────────────

export function CertificatesTab() {
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
        ...(search && { search }), ...(dateFrom && { dateFrom }), ...(dateTo && { dateTo }),
      });
      if (user) { params.set("userId", user.id); params.set("role", user.role); }
      const res = await fetch(`/api/admin/certificates?${params}`);
      const data = await res.json();
      setCertificates(data.certificates || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
      setStats(data.stats || null);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les certificats.", variant: "destructive" });
    } finally { setLoading(false); }
  }, [page, search, dateFrom, dateTo, user]);

  useEffect(() => { fetchCertificates(); }, [fetchCertificates]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); setLoading(true); fetchCertificates(); };
  const handleDateFilter = () => { setPage(1); setLoading(true); fetchCertificates(); };
  const handleClearDateFilter = () => {
    setDateFrom(""); setDateTo(""); setPage(1); setLoading(true); fetchCertificates();
  };
  const refresh = () => { setLoading(true); fetchCertificates(); };

  if (loading) return <CertificatesSkeleton />;

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total certificats", value: stats.total, icon: FileCheck, color: "bg-primary/10 text-primary" },
            { label: "Ce mois", value: stats.thisMonth, icon: Calendar, color: "bg-blue-500/10 text-blue-600" },
            { label: "Valides", value: stats.valid, icon: ShieldCheck, color: "bg-green-500/10 text-green-600" },
            { label: "Expirés", value: stats.expired, icon: AlertCircle, color: "bg-red-500/10 text-red-600" },
          ].map((s) => (
            <Card key={s.label} className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2.5 rounded-lg", s.color)}><s.icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-2xl font-bold leading-none">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher par nom, code, cours..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-lg h-10" />
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

      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">{total} certificat{total > 1 ? "s" : ""}</p>
        <div className="flex gap-2">
          <Button onClick={() => setBulkOpen(true)} variant="outline" className="rounded-lg text-sm border-border/60">
            <ClipboardCheck className="w-4 h-4 mr-1.5" /> Délivrer en masse
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary/90 rounded-lg text-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Créer un certificat
          </Button>
        </div>
      </div>

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
                        <td className="py-3 px-4"><span className="font-mono text-xs bg-muted/80 px-2 py-1 rounded-md text-foreground">{c.code}</span></td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7"><AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">{c.userName?.charAt(0) || "?"}</AvatarFallback></Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate max-w-[140px]">{c.userName}</p>
                              <p className="text-[10px] text-muted-foreground sm:hidden">{c.courseTitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell"><p className="text-sm text-muted-foreground truncate max-w-[180px]">{c.courseTitle}</p></td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <Badge variant="secondary" className={cn("text-[9px]", CERTIFICATE_TYPE_COLORS[c.type] || "bg-muted text-muted-foreground")}>{CERTIFICATE_TYPE_LABELS[c.type] || c.type}</Badge>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className={cn("text-sm font-semibold", c.maxScore > 0 && (c.score / c.maxScore) >= 0.7 ? "text-green-700" : "text-amber-700")}>{c.score}/{c.maxScore}</span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <Badge variant="secondary" className={cn("text-[9px]",
                            isRevoked ? CERTIFICATE_STATUS_COLORS.REVOKED : expired ? "bg-red-50 text-red-600" : c.expiresAt ? "bg-green-50 text-green-700" : CERTIFICATE_STATUS_COLORS.ACTIVE
                          )}>{isRevoked ? "Révoqué" : expired ? "Expiré" : c.expiresAt ? "Valide" : "Sans expiration"}</Badge>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{formatDate(c.issuedAt)}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"><MoreHorizontal className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => { setSelectedCert(c); setDetailOpen(true); }}><Eye className="w-4 h-4 mr-2" /> Voir détails</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`/api/certificates/${c.id}/pdf?userId=${c.userId}`, "_blank")}><Download className="w-4 h-4 mr-2" /> Télécharger PDF</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedCert(c); setVerifyOpen(true); }}><CheckCircle className="w-4 h-4 mr-2" /> Vérifier</DropdownMenuItem>
                              {!isRevoked && (
                                <DropdownMenuItem onClick={() => { setSelectedCert(c); setRevokeOpen(true); }} className="text-red-600 focus:text-red-600"><Ban className="w-4 h-4 mr-2" /> Révoquer</DropdownMenuItem>
                              )}
                              {isRevoked && (
                                <DropdownMenuItem onClick={async () => { await handleReactivate(c); refresh(); }}><Undo2 className="w-4 h-4 mr-2" /> Réactiver</DropdownMenuItem>
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
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(page - 1); setLoading(true); }} className="rounded-lg"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(page + 1); setLoading(true); }} className="rounded-lg"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          )}
        </>
      )}

      <CreateCertificateDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={() => { setPage(1); refresh(); }} />
      <CertificateDetailDialogs
        selectedCert={selectedCert}
        detailOpen={detailOpen} onDetailOpenChange={setDetailOpen}
        verifyOpen={verifyOpen} onVerifyOpenChange={setVerifyOpen}
        revokeOpen={revokeOpen} onRevokeOpenChange={setRevokeOpen}
        onRevoked={() => { setRevokeOpen(false); refresh(); }}
      />
      <BulkIssueDialog open={bulkOpen} onOpenChange={setBulkOpen} onIssued={refresh} />
    </div>
  );
}
