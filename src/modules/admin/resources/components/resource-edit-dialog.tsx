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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit3, Loader2 } from "lucide-react";
import { RESOURCE_TYPE_LABELS, RESOURCE_CATEGORY_LABELS } from "@/lib/constants";
import type { ResourceItem, CourseOption } from "../types";
import { ResourceTypeIcon, formatFileSize } from "../types";

// ────────────────────────────────────────────
// Edit Dialog Props
// ────────────────────────────────────────────

interface ResourceEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: ResourceItem | null;
  editTitle: string;
  editDescription: string;
  editCategory: string;
  editCourseId: string;
  editDownloadable: boolean;
  editLoading: boolean;
  courses: CourseOption[];
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onCourseIdChange: (v: string) => void;
  onDownloadableChange: (v: boolean) => void;
  onSave: () => void;
}

// ────────────────────────────────────────────
// Edit Dialog
// ────────────────────────────────────────────

export function ResourceEditDialog({
  open,
  onOpenChange,
  resource,
  editTitle,
  editDescription,
  editCategory,
  editCourseId,
  editDownloadable,
  editLoading,
  courses,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onCourseIdChange,
  onDownloadableChange,
  onSave,
}: ResourceEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-[#1D4ED8]" />
            Modifier la ressource
          </DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de la ressource
          </DialogDescription>
        </DialogHeader>
        {resource && (
          <div className="space-y-4">
            {/* File info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/40">
              <ResourceTypeIcon
                type={resource.type}
                className="w-5 h-5 text-muted-foreground"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {resource.fileName}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {formatFileSize(resource.fileSize)} ·{" "}
                  {RESOURCE_TYPE_LABELS[resource.type] || resource.type}
                </p>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Titre *</Label>
              <Input
                className="h-10 rounded-lg"
                value={editTitle}
                onChange={(e) => onTitleChange(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Description</Label>
              <Textarea
                className="rounded-lg min-h-[80px] text-sm"
                value={editDescription}
                onChange={(e) => onDescriptionChange(e.target.value)}
              />
            </div>

            {/* Category + Course */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Catégorie</Label>
                <Select value={editCategory} onValueChange={onCategoryChange}>
                  <SelectTrigger className="h-10 rounded-lg text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(RESOURCE_CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Lier à un cours</Label>
                <Select value={editCourseId} onValueChange={onCourseIdChange}>
                  <SelectTrigger className="h-10 rounded-lg text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Aucun cours</SelectItem>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="truncate">{c.title}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Downloadable toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/40">
              <div>
                <p className="text-sm font-medium text-foreground">Téléchargeable</p>
                <p className="text-[10px] text-muted-foreground">
                  Autoriser les utilisateurs à télécharger cette ressource
                </p>
              </div>
              <Switch
                checked={editDownloadable}
                onCheckedChange={onDownloadableChange}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={editLoading}
                className="rounded-lg"
              >
                Annuler
              </Button>
              <Button
                onClick={onSave}
                disabled={editLoading}
                className="rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"
              >
                {editLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Edit3 className="w-4 h-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
