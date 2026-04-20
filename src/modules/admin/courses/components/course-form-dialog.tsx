"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Edit3, CheckCircle2, Loader2 } from "lucide-react";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/constants";
import type { CourseItem } from "./course-list";

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCourse: CourseItem | null;
  editForm: Record<string, string | number | boolean>;
  setEditForm: React.Dispatch<React.SetStateAction<Record<string, string | number | boolean>>>;
  loading: boolean;
  onSave: () => void;
}

export function CourseFormDialog({
  open,
  onOpenChange,
  editCourse,
  editForm,
  setEditForm,
  loading,
  onSave,
}: CourseFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            Modifier le cours
          </DialogTitle>
          <DialogDescription>
            Mettez à jour les informations du cours
          </DialogDescription>
        </DialogHeader>

        {editCourse && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Titre *</Label>
              <Input className="h-10 rounded-lg" value={editForm.title as string} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Description *</Label>
              <Textarea className="rounded-lg min-h-[100px] text-sm" value={editForm.description as string} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Catégorie</Label>
                <Select value={editForm.category as string} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                  <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Difficulté</Label>
                <Select value={editForm.difficulty as string} onValueChange={(v) => setEditForm({ ...editForm, difficulty: v })}>
                  <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Durée (minutes)</Label>
                <Input type="number" className="h-10 rounded-lg" value={editForm.duration as string} onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Cours certifiant</Label>
                <Select value={editForm.isCertifying ? "true" : "false"} onValueChange={(v) => setEditForm({ ...editForm, isCertifying: v === "true" })}>
                  <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Oui</SelectItem>
                    <SelectItem value="false">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editForm.isCertifying && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Score minimum (%)</Label>
                  <Input type="number" className="h-10 rounded-lg" value={editForm.passingScore as string} onChange={(e) => setEditForm({ ...editForm, passingScore: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Tentatives max.</Label>
                  <Input type="number" className="h-10 rounded-lg" value={editForm.maxAttempts as string} onChange={(e) => setEditForm({ ...editForm, maxAttempts: e.target.value })} />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
              <Button onClick={onSave} disabled={loading} className="rounded-lg">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
