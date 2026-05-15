"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/app";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ImportResult {
  row: number;
  email: string;
  success: boolean;
  error?: string;
}

interface ImportResponse {
  totalRows: number;
  successCount: number;
  errorCount: number;
  results: ImportResult[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UserImportDialog({ onImported }: { onImported: () => void }) {
  const { user } = useAppStore();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith(".csv")) {
      toast({ title: "Format invalide", description: "Veuillez sélectionner un fichier CSV.", variant: "destructive" });
      return;
    }
    setFile(f);
    setResult(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleImport = async () => {
    if (!file || !user) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/users/import?userId=${user.id}&role=${user.role}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Erreur serveur" }));
        throw new Error(data.error || "Erreur serveur");
      }

      const data: ImportResponse = await res.json();
      setResult(data);

      if (data.successCount > 0) {
        toast({
          title: "Import réussi",
          description: `${data.successCount} utilisateur(s) importé(s) sur ${data.totalRows}.`,
        });
        onImported();
      }
    } catch (err) {
      toast({
        title: "Erreur d'import",
        description: err instanceof Error ? err.message : "Impossible d'importer le fichier.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setResult(null);
    setImporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-lg text-xs gap-1.5 border-border/60">
          <Upload className="w-3.5 h-3.5" />
          Importer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Importer des utilisateurs
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Importez un fichier CSV avec les colonnes : email, prenom, nom, role, telephone, club, region, licenceNumber
            </p>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                dragOver
                  ? "border-primary bg-primary/5"
                  : file
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30",
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-emerald-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} Ko</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Glissez-déposez votre CSV ici ou <span className="text-primary font-medium">parcourir</span></p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleImport}
                disabled={!file || importing}
                className="rounded-lg text-xs gap-1.5"
              >
                {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {importing ? "Import en cours..." : "Importer"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="border-border/60"><CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{result.totalRows}</p>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </CardContent></Card>
              <Card className="border-border/60"><CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">{result.successCount}</p>
                <p className="text-[10px] text-muted-foreground">Réussis</p>
              </CardContent></Card>
              <Card className="border-border/60"><CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-red-500">{result.errorCount}</p>
                <p className="text-[10px] text-muted-foreground">Erreurs</p>
              </CardContent></Card>
            </div>

            {/* Error details */}
            {result.errorCount > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Détails des erreurs :</p>
                {result.results
                  .filter((r) => !r.success)
                  .slice(0, 20)
                  .map((r) => (
                    <div key={r.row} className="flex items-start gap-2 text-xs p-2 rounded-lg bg-red-50 dark:bg-red-500/5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-muted-foreground">Ligne {r.row} — {r.email}</span>
                        <p className="text-red-600 dark:text-red-400">{r.error}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleClose} className="rounded-lg text-xs">
                Fermer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
