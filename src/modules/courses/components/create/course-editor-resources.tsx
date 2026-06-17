"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  FolderOpen, Plus, Trash2, FileText, Video, Image, Music, Archive, FileQuestion,
  Download, Loader2, AlertTriangle,
} from "lucide-react";
import {
  RESOURCE_TYPE_LABELS, RESOURCE_CATEGORY_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CourseResource {
  id: string;
  title: string;
  fileType: string;
  category: string;
  fileName: string;
  fileSize: number;
  isDownloadable: boolean;
  downloadCount: number;
}

interface CourseEditorResourcesProps {
  courseId?: string;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  VIDEO: Video, PDF: FileText, IMAGE: Image, DOCUMENT: FileText,
  AUDIO: Music, ARCHIVE: Archive, AUTRE: FileQuestion,
};

const TYPE_COLORS: Record<string, string> = {
  VIDEO: "bg-purple-100 text-purple-700",
  PDF: "bg-red-100 text-red-700",
  IMAGE: "bg-sky-100 text-sky-700",
  DOCUMENT: "bg-blue-100 text-blue-700",
  AUDIO: "bg-pink-100 text-pink-700",
  ARCHIVE: "bg-orange-100 text-orange-700",
  AUTRE: "bg-muted text-muted-foreground",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function CourseEditorResources({ courseId }: CourseEditorResourcesProps) {
  const { toast } = useToast();
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [loading, setLoading] = useState(!!courseId);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", fileType: "PDF", category: "SUPPORT_COURS", fileUrl: "" });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchResources = useCallback(() => {
    if (!courseId) return;
    fetch(`/api/courses/${courseId}?include=resources`)
      .then((res) => res.json())
      .then((data) => { setResources(data.resources || []); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [courseId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleAdd = async () => {
    if (!courseId || !addForm.title.trim()) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (res.ok) {
        const data = await res.json();
        setResources((prev) => [...prev, data.resource]);
        toast({ title: "Ressource ajoutée", description: `"${addForm.title}" a été ajoutée.` });
        setAddOpen(false);
        setAddForm({ title: "", fileType: "PDF", category: "SUPPORT_COURS", fileUrl: "" });
      } else {
        const d = await res.json();
        toast({ title: "Erreur", description: d.error || "Impossible d'ajouter la ressource", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur serveur", variant: "destructive" });
    }
  };

  const handleDelete = async (resId: string) => {
    if (!courseId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/resources?resourceId=${resId}`, { method: "DELETE" });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== resId));
        toast({ title: "Ressource supprimée" });
        setDeleteTarget(null);
      } else {
        const d = await res.json();
        toast({ title: "Erreur", description: d.error || "Impossible de supprimer", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur serveur", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!courseId) {
    return (
      <Card className="border-border/60">
        <CardContent className="flex flex-col items-center text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
            <FolderOpen className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <h4 className="font-semibold text-foreground mb-1">Ressources</h4>
          <p className="text-sm text-muted-foreground max-w-sm">
            Enregistrez d&apos;abord le cours pour ajouter des ressources.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-primary" />
          Ressources ({resources.length})
        </h4>
        <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => setAddOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center text-center py-8">
            <FolderOpen className="w-8 h-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Aucune ressource ajoutée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {resources.map((res) => {
            const Icon = TYPE_ICONS[res.fileType] || FileQuestion;
            return (
              <div key={res.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors group">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", TYPE_COLORS[res.fileType] || TYPE_COLORS.AUTRE)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{res.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{RESOURCE_TYPE_LABELS[res.fileType]}</Badge>
                    {res.fileSize > 0 && <span>{formatSize(res.fileSize)}</span>}
                    {res.downloadCount > 0 && (
                      <span className="flex items-center gap-0.5"><Download className="w-2.5 h-2.5" />{res.downloadCount}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setDeleteTarget(res.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une ressource</DialogTitle>
            <DialogDescription>Liez un fichier à ce cours</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Titre *</Label>
              <Input value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} placeholder="Nom de la ressource" className="rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Type</Label>
                <Select value={addForm.fileType} onValueChange={(v) => setAddForm({ ...addForm, fileType: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(RESOURCE_TYPE_LABELS).map(([k, l]) => (
                      <SelectItem key={k} value={k}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Catégorie</Label>
                <Select value={addForm.category} onValueChange={(v) => setAddForm({ ...addForm, category: v })}>
                  <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(RESOURCE_CATEGORY_LABELS).map(([k, l]) => (
                      <SelectItem key={k} value={k}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">URL du fichier</Label>
              <Input value={addForm.fileUrl} onChange={(e) => setAddForm({ ...addForm, fileUrl: e.target.value })} placeholder="https://..." className="rounded-lg" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)} className="rounded-lg">Annuler</Button>
            <Button onClick={handleAdd} disabled={!addForm.title.trim()} className="rounded-lg">
              <Plus className="w-4 h-4 mr-1.5" /> Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Supprimer cette ressource ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La ressource sera définitivement supprimée du cours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              disabled={deleteLoading}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
