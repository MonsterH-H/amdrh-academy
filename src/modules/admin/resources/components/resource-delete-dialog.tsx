"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import type { ResourceItem } from "../types";
import { ResourceTypeIcon, formatFileSize } from "../types";

// ────────────────────────────────────────────
// Delete Dialog Props
// ────────────────────────────────────────────

interface ResourceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: ResourceItem | null;
  loading: boolean;
  onConfirm: () => void;
}

// ────────────────────────────────────────────
// Delete Dialog
// ────────────────────────────────────────────

export function ResourceDeleteDialog({
  open,
  onOpenChange,
  resource,
  loading,
  onConfirm,
}: ResourceDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Supprimer la ressource
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cette ressource ? Cette action
            est irréversible.
          </DialogDescription>
        </DialogHeader>
        {resource && (
          <>
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2">
                <ResourceTypeIcon
                  type={resource.type}
                  className="w-4 h-4 text-muted-foreground flex-shrink-0"
                />
                <p className="text-sm font-medium text-foreground truncate">
                  {resource.title}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatFileSize(resource.fileSize)} ·{" "}
                {resource.downloadCount} téléchargement
                {resource.downloadCount > 1 ? "s" : ""}
              </p>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="rounded-lg"
              >
                Annuler
              </Button>
              <Button
                onClick={onConfirm}
                disabled={loading}
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Supprimer définitivement
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
