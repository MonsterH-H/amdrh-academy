"use client";

import { useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Loader2 } from "lucide-react";
import { RESOURCE_CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CourseOption } from "../types";
import { ResourceTypeIcon, formatFileSize, guessResourceType } from "../types";

// ────────────────────────────────────────────
// Upload Dialog Props
// ────────────────────────────────────────────

interface ResourceUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: CourseOption[];
  uploadFiles: File[];
  uploadTitle: string;
  uploadDescription: string;
  uploadCategory: string;
  uploadCourseId: string;
  uploading: boolean;
  uploadProgress: number;
  dragActive: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setUploadTitle: (v: string) => void;
  setUploadDescription: (v: string) => void;
  setUploadCategory: (v: string) => void;
  setUploadCourseId: (v: string) => void;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onUpload: () => void;
}

// ────────────────────────────────────────────
// Upload Dialog
// ────────────────────────────────────────────

export function ResourceUploadDialog({
  open,
  onOpenChange,
  courses,
  uploadFiles,
  uploadTitle,
  uploadDescription,
  uploadCategory,
  uploadCourseId,
  uploading,
  uploadProgress,
  dragActive,
  fileInputRef,
  setUploadTitle,
  setUploadDescription,
  setUploadCategory,
  setUploadCourseId,
  onDrag,
  onDrop,
  onFileChange,
  onRemoveFile,
  onUpload,
}: ResourceUploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#1D4ED8]" />
            Ajouter une ressource
          </DialogTitle>
          <DialogDescription>
            Téléchargez un fichier et renseignez ses informations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
              dragActive
                ? "border-[#1D4ED8] bg-[#1D4ED8]/5"
                : "border-border/60 hover:border-[#1D4ED8]/50 hover:bg-muted/30",
              uploading && "pointer-events-none opacity-60"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              onChange={onFileChange}
            />
            <Upload
              className={cn(
                "w-8 h-8 mx-auto mb-3",
                dragActive ? "text-[#1D4ED8]" : "text-muted-foreground/60"
              )}
            />
            <p className="text-sm font-medium text-foreground">
              {dragActive
                ? "Déposez vos fichiers ici"
                : "Glissez-déposez vos fichiers"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ou cliquez pour parcourir
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-2">
              PDF, Vidéo, Image, Document, Audio, Archive
            </p>
          </div>

          {/* Selected files list */}
          {uploadFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {uploadFiles.length} fichier{uploadFiles.length > 1 ? "s" : ""}{" "}
                sélectionné{uploadFiles.length > 1 ? "s" : ""}
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {uploadFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/40"
                  >
                    <ResourceTypeIcon
                      type={guessResourceType(file.name, file.type)}
                      className="w-4 h-4 flex-shrink-0 text-muted-foreground"
                    />
                    <span className="text-xs text-foreground truncate flex-1">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {formatFileSize(file.size)}
                    </span>
                    {!uploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFile(idx);
                        }}
                        className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Téléchargement en cours...
                </span>
                <span className="text-xs font-medium text-[#1D4ED8]">
                  {uploadProgress}%
                </span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Titre *</Label>
            <Input
              className="h-10 rounded-lg"
              placeholder="Titre de la ressource"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description</Label>
            <Textarea
              className="rounded-lg min-h-[80px] text-sm"
              placeholder="Description optionnelle..."
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              disabled={uploading}
            />
          </div>

          {/* Category + Course */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Catégorie</Label>
              <Select
                value={uploadCategory}
                onValueChange={setUploadCategory}
                disabled={uploading}
              >
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
              <Select
                value={uploadCourseId}
                onValueChange={setUploadCourseId}
                disabled={uploading}
              >
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
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
            className="rounded-lg"
          >
            Annuler
          </Button>
          <Button
            onClick={onUpload}
            disabled={uploading || uploadFiles.length === 0 || !uploadTitle}
            className="rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {uploading ? "Envoi en cours..." : "Télécharger"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
