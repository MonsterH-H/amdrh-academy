"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ──────────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────────

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

// ──────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────

export function DeleteConfirmDialog({ open, onClose, onConfirm, title }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Supprimer l&apos;annonce</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer &laquo; {title} &raquo; ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="rounded-lg">
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="rounded-lg">
            Supprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
