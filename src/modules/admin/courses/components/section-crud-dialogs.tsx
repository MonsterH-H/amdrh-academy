"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/app";
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { CourseDetail } from "./course-list";

// ─── Helpers ────────────────────────────────────

function authQuery() {
  const { user } = useAppStore.getState();
  return `userId=${user?.id}&role=${user?.role}`;
}

// ─── Add/Edit Section Dialog ────────────────────

export function SectionDialog({
  open,
  onOpenChange,
  courseId,
  editSection,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courseId: string;
  editSection: { id: string; title: string; order: number } | null;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setTitle(editSection?.title || "");
  }, [open, editSection]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Champ requis", description: "Le titre est obligatoire.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const url = editSection
        ? `/api/courses/${courseId}/sections?${authQuery()}`
        : `/api/courses/${courseId}/sections?${authQuery()}`;
      const method = editSection ? "PATCH" : "POST";
      const body = editSection
        ? { sectionId: editSection.id, title: title.trim() }
        : { title: title.trim() };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast({ title: editSection ? "Section modifiée" : "Section ajoutée" });
        onOpenChange(false);
        onSuccess();
      } else {
        const data = await res.json();
        toast({ title: "Erreur", description: data.error || "Opération échouée", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur serveur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{editSection ? "Modifier la section" : "Ajouter une section"}</DialogTitle>
          <DialogDescription>
            {editSection ? "Modifiez le titre de la section." : "Entrez le titre de la nouvelle section."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Label htmlFor="section-title" className="text-xs">Titre de la section</Label>
          <Input
            id="section-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Introduction"
            className="mt-1.5"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSave} disabled={loading || !title.trim()} className="rounded-lg">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editSection ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add/Edit Lesson Dialog ─────────────────────

export function LessonDialog({
  open,
  onOpenChange,
  sectionId,
  editLesson,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sectionId: string;
  editLesson: { id: string; title: string; type: string; content: string; duration: number } | null;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("TEXTE");
  const [content, setContent] = useState("");
  const [duration, setDuration] = useState("0");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(editLesson?.title || "");
      setType(editLesson?.type || "TEXTE");
      setContent(editLesson?.content || "");
      setDuration(String(editLesson?.duration || 0));
    }
  }, [open, editLesson]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Champ requis", description: "Le titre est obligatoire.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const url = `/api/sections/${sectionId}/lessons?${authQuery()}${
        editLesson ? `&lessonId=${editLesson.id}` : ""
      }`;
      const method = editLesson ? "PATCH" : "POST";
      const body = editLesson
        ? { title: title.trim(), type, content, duration: Number(duration) || 0 }
        : { title: title.trim(), type, content, duration: Number(duration) || 0 };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast({ title: editLesson ? "Leçon modifiée" : "Leçon ajoutée" });
        onOpenChange(false);
        onSuccess();
      } else {
        const data = await res.json();
        toast({ title: "Erreur", description: data.error || "Opération échouée", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur serveur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editLesson ? "Modifier la leçon" : "Ajouter une leçon"}</DialogTitle>
          <DialogDescription>
            {editLesson ? "Modifiez les détails de la leçon." : "Renseignez les informations de la nouvelle leçon."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label htmlFor="lesson-title" className="text-xs">Titre</Label>
            <Input id="lesson-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Présentation du module" className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIDEO">🎬 Vidéo</SelectItem>
                  <SelectItem value="PDF">📄 PDF</SelectItem>
                  <SelectItem value="TEXTE">📝 Texte</SelectItem>
                  <SelectItem value="INTERACTIF">🎯 Interactif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lesson-duration" className="text-xs">Durée (min)</Label>
              <Input id="lesson-duration" type="number" min="0" value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label htmlFor="lesson-content" className="text-xs">Contenu</Label>
            <Textarea id="lesson-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Contenu de la leçon..." rows={3} className="mt-1.5" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSave} disabled={loading || !title.trim()} className="rounded-lg">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editLesson ? "Enregistrer" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ─────────────────

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  loading,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  loading: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-lg">Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading} className="rounded-lg bg-red-600 hover:bg-red-700 text-white">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Lesson Reorder Hook ────────────────────────

export async function reorderLessons(sectionId: string, lessonIds: string[]) {
  const { user } = useAppStore.getState();
  const res = await fetch(`/api/sections/${sectionId}/lessons?${authQuery()}&action=reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lessonIds }),
  });
  return res.ok;
}

// ─── Types ──────────────────────────────────────

export type SectionItem = CourseDetail["sections"][number];
export type LessonItem = CourseDetail["sections"][number]["lessons"][number];
