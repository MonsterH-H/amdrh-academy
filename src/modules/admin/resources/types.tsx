"use client";

import { Video, FileText, Image as ImageIcon, File, Music, Archive, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

export interface ResourceItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string | null;
  isDownloadable: boolean;
  downloadCount: number;
  courseId: string | null;
  course: { id: string; title: string } | null;
  uploaderId: string;
  uploader: { id: string; nom: string; prenom: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseOption {
  id: string;
  title: string;
}

export interface ResourceStats {
  total: number;
  totalSize: number;
  byType: Record<string, number>;
  lastUpload: string | null;
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 octets";
  const units = ["octets", "Ko", "Mo", "Go"];
  const k = 1024;
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), units.length - 1);
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${value} ${units[i]}`;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "À l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHour < 24) return `il y a ${diffHour}h`;
  if (diffDay < 7) return `il y a ${diffDay}j`;
  if (diffWeek < 4) return `il y a ${diffWeek} sem.`;
  if (diffMonth < 12) return `il y a ${diffMonth} mois`;
  return `il y a ${diffYear} an${diffYear > 1 ? "s" : ""}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export function guessResourceType(fileName: string, mimeType: string): string {
  const ext = getFileExtension(fileName);
  if (["mp4", "webm", "avi", "mov", "mkv"].includes(ext) || mimeType.startsWith("video/"))
    return "VIDEO";
  if (["pdf"].includes(ext) || mimeType === "application/pdf") return "PDF";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"].includes(ext) || mimeType.startsWith("image/"))
    return "IMAGE";
  if (["mp3", "wav", "ogg", "flac", "aac"].includes(ext) || mimeType.startsWith("audio/"))
    return "AUDIO";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext) || mimeType.includes("zip") || mimeType.includes("archive"))
    return "ARCHIVE";
  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf", "odt"].includes(ext))
    return "DOCUMENT";
  return "AUTRE";
}

// ────────────────────────────────────────────
// Icon component mapper
// ────────────────────────────────────────────

export function ResourceTypeIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const iconProps = { className: cn("w-5 h-5", className) };
  switch (type) {
    case "VIDEO":
      return <Video {...iconProps} />;
    case "PDF":
      return <FileText {...iconProps} />;
    case "IMAGE":
      return <ImageIcon {...iconProps} />;
    case "DOCUMENT":
      return <File {...iconProps} />;
    case "AUDIO":
      return <Music {...iconProps} />;
    case "ARCHIVE":
      return <Archive {...iconProps} />;
    default:
      return <FileQuestion {...iconProps} />;
  }
}
