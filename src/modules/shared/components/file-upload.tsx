"use client";

import { useState, useCallback, useRef } from "react";
import { useUploadThing } from "@/lib/uploadthing/client";
import {
  formatFileSize,
  validateFileType,
  isImageFile,
  getAllowedTypesForEndpoint,
  getMaxSizeForEndpoint,
  getMaxFilesForEndpoint,
} from "@/lib/uploadthing/utils";
import {
  Upload,
  X,
  FileText,
  ImageIcon,
  Film,
  Trash2,
  CheckCircle,
  Loader2,
  AlertCircle,
  FileArchive,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface UploadedFile {
  url: string;
  key: string;
  name: string;
  size?: number;
}

interface QueuedFile {
  file: File;
  id: string;
}

interface FileUploadProps {
  endpoint: "avatar" | "document" | "media" | "courseResource";
  onUploadComplete?: (url: string, key: string, name: string) => void;
  onUploadError?: (error: Error) => void;
  onFileRemove?: (key: string) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  currentFiles?: UploadedFile[];
  className?: string;
  compact?: boolean;
  disabled?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext))
    return ImageIcon;
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return Film;
  if (["mp3", "wav", "ogg", "m4a", "flac"].includes(ext)) return Music;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return FileArchive;
  return FileText;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function FileUpload({
  endpoint,
  onUploadComplete,
  onUploadError,
  onFileRemove,
  maxFiles,
  allowedTypes,
  currentFiles: initialFiles = [],
  className,
  compact = false,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // State
  const [isDragOver, setIsDragOver] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialFiles);
  const [error, setError] = useState<string | null>(null);

  // Computed limits
  const resolvedMaxFiles = maxFiles ?? getMaxFilesForEndpoint(endpoint);
  const resolvedMaxSize = getMaxSizeForEndpoint(endpoint);
  const resolvedAllowedTypes = allowedTypes ?? getAllowedTypesForEndpoint(endpoint);

  // UploadThing hook
  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        const newFiles: UploadedFile[] = res.map((r) => ({
          url: r.url,
          key: r.key,
          name: r.name,
        }));
        setUploadedFiles((prev) => [...prev, ...newFiles]);
        setQueuedFiles([]);

        // Call callback for each file
        newFiles.forEach((f) => {
          onUploadComplete?.(f.url, f.key, f.name);
        });
      }
    },
    onUploadError: (err) => {
      console.error("[FileUpload] Upload error:", err);
      setError(err.message || "Erreur lors du téléchargement");
      setQueuedFiles([]);
      onUploadError?.(err);
    },
  });

  // ── File validation ──────────────────────────────────────
  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file count
      const totalFiles = uploadedFiles.length + queuedFiles.length + 1;
      if (totalFiles > resolvedMaxFiles) {
        return `Maximum ${resolvedMaxFiles} fichier(s) autorisé(s)`;
      }

      // Check file size
      if (file.size > resolvedMaxSize) {
        return `Fichier trop volumineux (max ${formatFileSize(resolvedMaxSize)})`;
      }

      // Check file type
      const { valid, type: detectedType } = validateFileType(
        file.name,
        resolvedAllowedTypes
      );
      if (!valid) {
        return `Type de fichier non autorisé. Types acceptés: ${resolvedAllowedTypes.join(", ")}`;
      }

      return null;
    },
    [uploadedFiles.length, queuedFiles.length, resolvedMaxFiles, resolvedMaxSize, resolvedAllowedTypes]
  );

  // ── Add files to queue ────────────────────────────────────
  const addFilesToQueue = useCallback(
    (files: FileList | File[]) => {
      setError(null);
      const newQueue: QueuedFile[] = [];

      for (const file of Array.from(files)) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          continue;
        }
        newQueue.push({
          file,
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        });
      }

      if (newQueue.length > 0) {
        setQueuedFiles((prev) => [...prev, ...newQueue]);
      }
    },
    [validateFile]
  );

  // ── Upload queued files ───────────────────────────────────
  const handleUpload = useCallback(async () => {
    if (queuedFiles.length === 0) return;

    const filesToUpload = queuedFiles.map((q) => q.file);
    startUpload(filesToUpload);
  }, [queuedFiles, startUpload]);

  // ── Remove from queue ─────────────────────────────────────
  const removeFromQueue = useCallback((id: string) => {
    setQueuedFiles((prev) => prev.filter((q) => q.id !== id));
  }, []);

  // ── Remove uploaded file ───────────────────────────────────
  const removeUploadedFile = useCallback(
    (key: string) => {
      setUploadedFiles((prev) => prev.filter((f) => f.key !== key));
      onFileRemove?.(key);
    },
    [onFileRemove]
  );

  // ── Clear all ────────────────────────────────────────────
  const clearAll = useCallback(() => {
    setQueuedFiles([]);
    setUploadedFiles([]);
    setError(null);
  }, []);

  // ── Drag & Drop handlers ──────────────────────────────────
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled && !isUploading) {
        setIsDragOver(true);
      }
    },
    [disabled, isUploading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        addFilesToQueue(files);
      }
    },
    [disabled, isUploading, addFilesToQueue]
  );

  // ── Click to browse ──────────────────────────────────────
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        addFilesToQueue(files);
      }
      // Reset input so same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [addFilesToQueue]
  );

  // ── Has any content ───────────────────────────────────────
  const hasContent = queuedFiles.length > 0 || uploadedFiles.length > 0;

  // ──────────────────────────────────────────────────────────
  // Render — Compact mode (avatar)
  // ──────────────────────────────────────────────────────────
  if (compact) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <div
          onClick={() => !disabled && !isUploading && inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer",
            isDragOver
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
              : "border-muted-foreground/25 hover:border-emerald-400 hover:bg-muted/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{ width: 120, height: 120 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploadedFiles.length > 0 && isImageFile(uploadedFiles[0].name) ? (
            <img
              src={uploadedFiles[0].url}
              alt={uploadedFiles[0].name}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
              <span className="text-[10px] font-medium">
                {isUploading ? "Envoi..." : "Glisser"}
              </span>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled || isUploading}
        />

        {uploadedFiles.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="truncate max-w-[120px]">{uploadedFiles[0].name}</span>
            {!disabled && (
              <button
                onClick={() => removeUploadedFile(uploadedFiles[0].key)}
                className="text-destructive hover:text-destructive/80 ml-auto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {error && (
          <p className="text-[11px] text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // Render — Full mode
  // ──────────────────────────────────────────────────────────
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* ── Drop Zone ─────────────────────────────────────── */}
      {!hasContent && (
        <div
          onClick={() => !disabled && !isUploading && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 transition-all cursor-pointer select-none",
            isDragOver
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 scale-[1.01]"
              : "border-muted-foreground/20 hover:border-emerald-400/60 hover:bg-muted/30",
            disabled && "opacity-50 cursor-not-allowed hover:border-muted-foreground/20 hover:bg-transparent",
            isUploading && "pointer-events-none"
          )}
        >
          <div
            className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors",
              isDragOver
                ? "bg-emerald-100 dark:bg-emerald-900/30"
                : "bg-muted"
            )}
          >
            {isUploading ? (
              <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
            ) : (
              <Upload
                className={cn(
                  "w-7 h-7",
                  isDragOver ? "text-emerald-500" : "text-muted-foreground"
                )}
              />
            )}
          </div>

          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {isDragOver
                ? "Déposer le fichier ici"
                : "Glisser-déposer ou cliquer pour sélectionner"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max {formatFileSize(resolvedMaxSize)} ·{" "}
              {resolvedAllowedTypes.join(", ")} · {resolvedMaxFiles} fichier(s) max
            </p>
          </div>
        </div>
      )}

      {/* ── Hidden file input ─────────────────────────────── */}
      <input
        ref={inputRef}
        type="file"
        multiple={resolvedMaxFiles > 1}
        onChange={handleFileInput}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* ── Queued Files (before upload) ──────────────────── */}
      {queuedFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          {queuedFiles.map((qf) => {
            const Icon = getFileIcon(qf.file.name);
            return (
              <div
                key={qf.id}
                className="flex items-center gap-3 rounded-xl border border-muted-foreground/15 bg-muted/30 px-4 py-3 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{qf.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(qf.file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromQueue(qf.id)}
                  className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/10"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {/* Upload actions */}
          <div className="flex items-center gap-2 justify-end mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              disabled={isUploading}
              className="text-muted-foreground"
            >
              Tout annuler
            </Button>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={isUploading || queuedFiles.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Télécharger{queuedFiles.length > 1 ? ` (${queuedFiles.length})` : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── Uploaded Files ────────────────────────────────── */}
      {uploadedFiles.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Fichiers téléchargés
          </p>
          {uploadedFiles.map((uf) => {
            const Icon = getFileIcon(uf.name);
            const isImg = isImageFile(uf.name);
            return (
              <div
                key={uf.key}
                className="flex items-center gap-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/10 px-4 py-3 transition-colors"
              >
                {isImg ? (
                  <img
                    src={uf.url}
                    alt={uf.name}
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{uf.name}</p>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  </div>
                  {uf.size !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uf.size)}
                    </p>
                  )}
                </div>
                <a
                  href={uf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-muted-foreground hover:text-emerald-600 transition-colors p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                  title="Voir le fichier"
                >
                  <FileText className="w-4 h-4" />
                </a>
                {!disabled && (
                  <button
                    onClick={() => removeUploadedFile(uf.key)}
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1 rounded-lg hover:bg-destructive/10"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add more button */}
          {!disabled && !isUploading && uploadedFiles.length < resolvedMaxFiles && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="w-full mt-1 border-dashed border-muted-foreground/25 text-muted-foreground hover:text-emerald-600 hover:border-emerald-400/40"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Ajouter un autre fichier ({resolvedMaxFiles - uploadedFiles.length} restant
              {resolvedMaxFiles - uploadedFiles.length > 1 ? "s" : ""})
            </Button>
          )}
        </div>
      )}

      {/* ── Error Message ─────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
