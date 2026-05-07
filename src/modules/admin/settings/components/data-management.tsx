"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Database,
  Download,
  Trash2,
  HardDrive,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/app";

export function DataManagementCard() {
  const user = useAppStore((s) => s.user);
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/settings?userId=${user?.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export-data" }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `amdrh-settings-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export réussi",
        description: "Les données ont été téléchargées.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d&apos;exporter les données.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      const res = await fetch(`/api/admin/settings?userId=${user?.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear-cache" }),
      });
      if (!res.ok) throw new Error();
      toast({
        title: "Cache effacé",
        description: "Le cache de l&apos;application a été vidé avec succès.",
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de vider le cache.",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const res = await fetch(`/api/admin/settings?userId=${user?.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "backup" }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast({
        title: "Sauvegarde créée",
        description: data.message,
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de créer la sauvegarde.",
        variant: "destructive",
      });
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
            <Database className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <CardTitle className="text-base">Gestion des données</CardTitle>
            <CardDescription>
              Export, cache, taille de la base et sauvegarde
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-6 pt-6">
        {/* Database size info */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
            <HardDrive className="h-5 w-5 text-sky-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Taille de la base de données</p>
            <p className="text-xs text-muted-foreground">
              Base SQLite principale — Stockage local
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold font-mono">~2.4 MB</p>
            <p className="text-xs text-muted-foreground">Taille estimée</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
            className="h-auto py-4 flex-col gap-2 cursor-pointer"
          >
            {exporting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            <div className="text-center">
              <span className="text-sm font-semibold">Exporter les données</span>
              <p className="text-[11px] text-muted-foreground font-normal">
                Télécharger en JSON
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={handleClearCache}
            disabled={clearing}
            className="h-auto py-4 flex-col gap-2 cursor-pointer"
          >
            {clearing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
            <div className="text-center">
              <span className="text-sm font-semibold">Vider le cache</span>
              <p className="text-[11px] text-muted-foreground font-normal">
                Réinitialiser le cache
              </p>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={handleBackup}
            disabled={backingUp}
            className="h-auto py-4 flex-col gap-2 cursor-pointer"
          >
            {backingUp ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
            <div className="text-center">
              <span className="text-sm font-semibold">Sauvegarder</span>
              <p className="text-[11px] text-muted-foreground font-normal">
                Créer une copie
              </p>
            </div>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Les opérations de gestion de données sont enregistrées dans les logs d&apos;administration.
        </p>
      </CardContent>
    </Card>
  );
}
