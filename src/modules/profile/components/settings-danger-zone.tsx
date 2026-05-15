"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, UserX, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function SettingsDangerZone() {
  const { user, logout, navigate } = useAppStore();
  const { toast } = useToast();

  // Deactivate state
  const [deactivating, setDeactivating] = useState(false);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDeactivate = async () => {
    if (!user) return;
    setDeactivating(true);
    try {
      const res = await fetch("/api/profile/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        toast({
          title: "Compte désactivé",
          description: "Votre compte a été désactivé avec succès.",
        });
        logout();
        navigate("landing");
      } else {
        const data = await res.json();
        toast({
          title: "Erreur",
          description: data.error || "Impossible de désactiver le compte.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur réseau",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setDeactivating(false);
    }
  };

  const handleDelete = async () => {
    if (!user || deleteConfirmText !== "SUPPRIMER") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/profile/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        toast({
          title: "Compte supprimé",
          description: "Votre compte et toutes vos données ont été supprimés.",
        });
        logout();
        navigate("landing");
      } else {
        const data = await res.json();
        toast({
          title: "Erreur",
          description: data.error || "Impossible de supprimer le compte.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur réseau",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteConfirmText("");
    }
  };

  return (
    <Card className="border-destructive/30 bg-destructive/[0.02]">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-4 h-4" />
          Zone dangereuse
        </CardTitle>
        <CardDescription>
          Actions irréversibles sur votre compte. Procédez avec prudence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deactivate Account */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-border/60 bg-background">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <UserX className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-medium text-foreground">Désactiver le compte</p>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Votre compte sera désactivé mais vos données seront conservées. Vous pourrez le réactiver en contactant un administrateur.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg text-xs border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-800 flex-shrink-0"
            onClick={handleDeactivate}
            disabled={deactivating}
          >
            {deactivating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Désactivation...
              </>
            ) : (
              <>
                <UserX className="w-3.5 h-3.5 mr-1.5" />
                Désactiver
              </>
            )}
          </Button>
        </div>

        {/* Delete Account */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/[0.03]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-destructive" />
              <p className="text-sm font-medium text-destructive">Supprimer le compte</p>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Cette action est <strong className="text-destructive">irréversible</strong>. Toutes vos données, certificats et badges seront définitivement supprimés.
            </p>
          </div>
          <AlertDialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteConfirmText(""); }}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="rounded-lg text-xs flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  Supprimer le compte définitivement
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    Cette action est <strong>irréversible</strong>. Les données suivantes seront définitivement supprimées :
                  </p>
                  <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
                    <li>Votre profil et informations personnelles</li>
                    <li>Vos certificats et badges obtenus</li>
                    <li>Votre progression et résultats de quiz</li>
                    <li>Vos messages et conversations</li>
                  </ul>
                  <div className="pt-2">
                    <Label htmlFor="delete-confirm" className="text-xs">
                      Tapez <strong className="font-mono text-destructive">SUPPRIMER</strong> pour confirmer
                    </Label>
                    <Input
                      id="delete-confirm"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="SUPPRIMER"
                      className="mt-1.5 h-9 rounded-lg"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-lg">Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting || deleteConfirmText !== "SUPPRIMER"}
                  className="bg-destructive hover:bg-destructive/90 rounded-lg"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer définitivement
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
