"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  File,
  FileQuestion,
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  Edit3,
  Trash2,
  Link2,
  X,
  Plus,
  HardDrive,
  FolderOpen,
  MoreVertical,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  RESOURCE_TYPE_LABELS,
  RESOURCE_TYPE_COLORS,
  RESOURCE_TYPE_ICONS,
  RESOURCE_CATEGORY_LABELS,
  RESOURCE_CATEGORY_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

interface ResourceItem {
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

interface CourseOption {
  id: string;
  title: string;
}

interface ResourceStats {
  total: number;
  totalSize: number;
  byType: Record<string, number>;
  lastUpload: string | null;
}

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 octets";
  const units = ["octets", "Ko", "Mo", "Go"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
  return `${value} ${units[i]}`;
}

function formatRelativeTime(dateStr: string): string {
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

function guessResourceType(fileName: string, mimeType: string): string {
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

function ResourceTypeIcon({
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

// ────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────

export function AdminResourcesPage() {
  const { user } = useAppStore();

  // Resources state
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ResourceStats | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Courses (for dropdowns)
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Upload state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCategory, setUploadCategory] = useState("SUPPORT_COURS");
  const [uploadCourseId, setUploadCourseId] = useState("NONE");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit dialog
  const [editResource, setEditResource] = useState<ResourceItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCourseId, setEditCourseId] = useState("NONE");
  const [editDownloadable, setEditDownloadable] = useState(true);

  // Delete dialog
  const [deleteResource, setDeleteResource] = useState<ResourceItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ────────────────────────────────────────────
  // Fetch courses for dropdowns
  // ────────────────────────────────────────────

  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const res = await fetch("/api/courses?admin=true");
      const data = await res.json();
      setCourses(
        (data.courses || []).map((c: CourseOption) => ({
          id: c.id,
          title: c.title,
        }))
      );
    } catch {
      // silently fail
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  // ────────────────────────────────────────────
  // Fetch resources
  // ────────────────────────────────────────────

  const fetchResources = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
      });
      if (search) params.set("search", search);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (courseFilter !== "ALL") params.set("courseId", courseFilter);

      const res = await fetch(`/api/resources?${params}`);
      const data = await res.json();
      setResources(data.resources || []);
      setTotal(data.total || 0);
      setTotalPages(
        Math.ceil((data.total || 0) / 12) || 1
      );
      if (data.stats) setStats(data.stats);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les ressources",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, categoryFilter, courseFilter]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchResources();
    fetchCourses();
  }, [user, fetchResources, fetchCourses]);

  // ────────────────────────────────────────────
  // Upload handlers
  // ────────────────────────────────────────────

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setUploadFiles((prev) => [...prev, ...newFiles]);
      if (!uploadTitle && newFiles.length === 1) {
        setUploadTitle(newFiles[0].name.replace(/\.[^.]+$/, ""));
      }
    }
  }, [uploadTitle]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadFiles((prev) => [...prev, ...newFiles]);
      if (!uploadTitle && newFiles.length === 1) {
        setUploadTitle(newFiles[0].name.replace(/\.[^.]+$/, ""));
      }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetUploadForm = () => {
    setUploadFiles([]);
    setUploadTitle("");
    setUploadDescription("");
    setUploadCategory("SUPPORT_COURS");
    setUploadCourseId("NONE");
    setUploadProgress(0);
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      toast({
        title: "Fichier requis",
        description: "Veuillez sélectionner au moins un fichier.",
        variant: "destructive",
      });
      return;
    }
    if (!uploadTitle) {
      toast({
        title: "Titre requis",
        description: "Veuillez entrer un titre pour la ressource.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      if (uploadFiles.length === 1) {
        formData.append("file", uploadFiles[0]);
      } else {
        uploadFiles.forEach((f) => formData.append("files", f));
      }
      formData.append("userId", user?.id || "");
      formData.append("role", user?.role || "ADMIN");
      formData.append("title", uploadTitle);
      if (uploadDescription) formData.append("description", uploadDescription);
      formData.append("category", uploadCategory);
      if (uploadCourseId !== "NONE") formData.append("courseId", uploadCourseId);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (res.ok) {
        setUploadProgress(100);
        toast({
          title: "Téléchargement réussi",
          description: `${uploadFiles.length} fichier${uploadFiles.length > 1 ? "s" : ""} ajouté${uploadFiles.length > 1 ? "s" : ""} avec succès.`,
        });
        resetUploadForm();
        setUploadOpen(false);
        fetchResources();
      } else {
        const data = await res.json();
        toast({
          title: "Erreur",
          description: data.error || "Impossible de télécharger le fichier",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur serveur",
        description: "Une erreur est survenue lors du téléchargement.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ────────────────────────────────────────────
  // Edit handlers
  // ────────────────────────────────────────────

  const openEdit = (resource: ResourceItem) => {
    setEditResource(resource);
    setEditTitle(resource.title);
    setEditDescription(resource.description || "");
    setEditCategory(resource.category);
    setEditCourseId(resource.courseId || "NONE");
    setEditDownloadable(resource.isDownloadable);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editResource) return;
    if (!editTitle) {
      toast({
        title: "Titre requis",
        description: "Le titre est obligatoire.",
        variant: "destructive",
      });
      return;
    }

    setEditLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: editTitle,
        description: editDescription || null,
        category: editCategory,
        courseId: editCourseId === "NONE" ? null : editCourseId,
        isDownloadable: editDownloadable,
      };

      const res = await fetch(`/api/resources/${editResource.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({
          title: "Ressource mise à jour",
          description: `"${editTitle}" a été enregistré.`,
        });
        setEditOpen(false);
        fetchResources();
      } else {
        const data = await res.json();
        toast({
          title: "Erreur",
          description: data.error || "Impossible de sauvegarder",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Erreur serveur", variant: "destructive" });
    } finally {
      setEditLoading(false);
    }
  };

  // ────────────────────────────────────────────
  // Delete handlers
  // ────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteResource) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/resources/${deleteResource.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({
          title: "Ressource supprimée",
          description: `"${deleteResource.title}" a été supprimé définitivement.`,
        });
        setDeleteResource(null);
        fetchResources();
      } else {
        const data = await res.json();
        toast({
          title: "Erreur",
          description: data.error || "Impossible de supprimer la ressource",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Erreur serveur", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  // ────────────────────────────────────────────
  // Download handler
  // ────────────────────────────────────────────

  const handleDownload = async (resource: ResourceItem) => {
    try {
      const res = await fetch(`/api/resources/${resource.id}?download=true`);
      if (!res.ok) {
        toast({
          title: "Erreur",
          description: "Impossible de télécharger la ressource",
          variant: "destructive",
        });
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resource.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      // Refresh to update download count
      fetchResources();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la ressource",
        variant: "destructive",
      });
    }
  };

  // ────────────────────────────────────────────
  // Clear filters
  // ────────────────────────────────────────────

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
    setCategoryFilter("ALL");
    setCourseFilter("ALL");
    setPage(1);
  };

  const hasActiveFilters =
    search || typeFilter !== "ALL" || categoryFilter !== "ALL" || courseFilter !== "ALL";

  // ────────────────────────────────────────────
  // Loading skeleton
  // ────────────────────────────────────────────

  if (loading) return <AdminResourcesSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Médiathèque
          </h2>
          <p className="text-muted-foreground mt-1">
            Gestion des ressources pédagogiques
          </p>
        </div>
        <Button
          onClick={() => {
            resetUploadForm();
            setUploadOpen(true);
          }}
          className="rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une ressource
        </Button>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total resources */}
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#1D4ED8]/10 text-[#1D4ED8]">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{stats?.total ?? total}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Ressources
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total storage */}
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">
                {stats?.totalSize ? formatFileSize(stats.totalSize) : "0 octets"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Espace utilisé
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Type breakdown */}
        <Card className="border-border/60 col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">
              Par type
            </p>
            <div className="flex flex-wrap gap-1.5">
              {stats?.byType
                ? Object.entries(stats.byType).map(([type, count]) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className={cn("text-[10px] font-medium", RESOURCE_TYPE_COLORS[type])}
                    >
                      {RESOURCE_TYPE_LABELS[type] || type} ({count})
                    </Badge>
                  ))
                : resources.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {resources.length} ressource{resources.length > 1 ? "s" : ""}
                    </span>
                  )}
              {(!stats?.byType || Object.keys(stats.byType).length === 0) && (
                <span className="text-xs text-muted-foreground">Aucune donnée</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Last upload */}
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Upload className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-none truncate">
                {stats?.lastUpload
                  ? formatRelativeTime(stats.lastUpload)
                  : "—"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Dernier ajout
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Search + Filters ─── */}
      <Card className="border-border/60">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-3 flex-wrap">
            {/* Search input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre ou description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 rounded-lg h-9"
              />
            </div>

            {/* Type filter */}
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[150px] rounded-lg text-xs">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les types</SelectItem>
                {Object.entries(RESOURCE_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category filter */}
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[170px] rounded-lg text-xs">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Toutes catégories</SelectItem>
                {Object.entries(RESOURCE_CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Course filter */}
            <Select
              value={courseFilter}
              onValueChange={(v) => {
                setCourseFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[180px] rounded-lg text-xs">
                <SelectValue placeholder="Cours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les cours</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="truncate">{c.title}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg text-xs text-muted-foreground h-9"
                onClick={clearFilters}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Effacer filtres
              </Button>
            )}
          </div>

          {/* View toggle + count */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {total} ressource{total > 1 ? "s" : ""} trouvée{total > 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-1 border border-border/60 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-[#1D4ED8] text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Vue grille"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-[#1D4ED8] text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Vue liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Resource Grid / List ─── */}
      {resources.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            Aucune ressource trouvée
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {hasActiveFilters
              ? "Essayez de modifier vos filtres de recherche"
              : "Commencez par ajouter votre première ressource"}
          </p>
          {!hasActiveFilters && (
            <Button
              onClick={() => {
                resetUploadForm();
                setUploadOpen(true);
              }}
              className="rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une ressource
            </Button>
          )}
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onDownload={() => handleDownload(resource)}
                  onEdit={() => openEdit(resource)}
                  onDelete={() => setDeleteResource(resource)}
                />
              ))}
            </div>
          ) : (
            <div className="border border-border/60 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border/60">
                      <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">
                        Ressource
                      </th>
                      <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                        Catégorie
                      </th>
                      <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                        Cours
                      </th>
                      <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                        Taille
                      </th>
                      <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                        Date
                      </th>
                      <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden xl:table-cell">
                        Téléchargements
                      </th>
                      <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 w-12">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {resources.map((resource) => (
                      <ResourceRow
                        key={resource.id}
                        resource={resource}
                        onDownload={() => handleDownload(resource)}
                        onEdit={() => openEdit(resource)}
                        onDelete={() => setDeleteResource(resource)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Pagination ─── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg h-9"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Précédent</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Show first, last, current, and neighbors
                    return (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - page) <= 1
                    );
                  })
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-xs text-muted-foreground"
                      >
                        …
                      </span>
                    ) : (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p as number)}
                        className={cn(
                          "rounded-lg h-9 w-9 p-0 text-sm font-medium",
                          page === p && "bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"
                        )}
                      >
                        {p}
                      </Button>
                    )
                  )}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-lg h-9"
              >
                <span className="hidden sm:inline mr-1">Suivant</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* ─── Upload Dialog ─── */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
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
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
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
                onChange={handleFileChange}
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
                            removeUploadFile(idx);
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
              onClick={() => setUploadOpen(false)}
              disabled={uploading}
              className="rounded-lg"
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpload}
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

      {/* ─── Edit Dialog ─── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
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

          {editResource && (
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/40">
                <ResourceTypeIcon
                  type={editResource.type}
                  className="w-5 h-5 text-muted-foreground"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {editResource.fileName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatFileSize(editResource.fileSize)} ·{" "}
                    {RESOURCE_TYPE_LABELS[editResource.type] || editResource.type}
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Titre *</Label>
                <Input
                  className="h-10 rounded-lg"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Description</Label>
                <Textarea
                  className="rounded-lg min-h-[80px] text-sm"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>

              {/* Category + Course */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Catégorie</Label>
                  <Select
                    value={editCategory}
                    onValueChange={setEditCategory}
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
                    value={editCourseId}
                    onValueChange={setEditCourseId}
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

              {/* Downloadable toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/40">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Téléchargeable
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Autoriser les utilisateurs à télécharger cette ressource
                  </p>
                </div>
                <Switch
                  checked={editDownloadable}
                  onCheckedChange={setEditDownloadable}
                />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  disabled={editLoading}
                  className="rounded-lg"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleEditSave}
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

      {/* ─── Delete Confirmation Dialog ─── */}
      <Dialog
        open={!!deleteResource}
        onOpenChange={() => setDeleteResource(null)}
      >
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
          {deleteResource && (
            <>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2">
                  <ResourceTypeIcon
                    type={deleteResource.type}
                    className="w-4 h-4 text-muted-foreground flex-shrink-0"
                  />
                  <p className="text-sm font-medium text-foreground truncate">
                    {deleteResource.title}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(deleteResource.fileSize)} ·{" "}
                  {deleteResource.downloadCount} téléchargement
                  {deleteResource.downloadCount > 1 ? "s" : ""}
                </p>
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteResource(null)}
                  disabled={deleteLoading}
                  className="rounded-lg"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="rounded-lg bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteLoading ? (
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
    </div>
  );
}

// ────────────────────────────────────────────
// Resource Card (Grid View)
// ────────────────────────────────────────────

function ResourceCard({
  resource,
  onDownload,
  onEdit,
  onDelete,
}: {
  resource: ResourceItem;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="border-border/60 hover:border-border/90 hover:shadow-sm transition-all group">
      <CardContent className="p-4 flex flex-col h-full">
        {/* Top: icon + actions */}
        <div className="flex items-start justify-between mb-3">
          <div
            className={cn(
              "p-2.5 rounded-lg",
              RESOURCE_TYPE_COLORS[resource.type]
            )}
          >
            <ResourceTypeIcon
              type={resource.type}
              className="w-5 h-5"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {resource.isDownloadable && (
                <DropdownMenuItem onClick={onDownload} className="cursor-pointer">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                <Edit3 className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title + Description */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold text-foreground truncate"
            title={resource.title}
          >
            {resource.title}
          </h3>
          {resource.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {resource.description}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <Badge
            variant="secondary"
            className={cn("text-[10px]", RESOURCE_TYPE_COLORS[resource.type])}
          >
            {RESOURCE_TYPE_LABELS[resource.type] || resource.type}
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px]",
              RESOURCE_CATEGORY_COLORS[resource.category]
            )}
          >
            {RESOURCE_CATEGORY_LABELS[resource.category] || resource.category}
          </Badge>
        </div>

        {/* Course link */}
        {resource.course && (
          <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
            <Link2 className="w-3 h-3" />
            <span className="truncate">{resource.course.title}</span>
          </div>
        )}

        {/* Footer: meta info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground">
              {formatFileSize(resource.fileSize)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatRelativeTime(resource.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Download className="w-3 h-3" />
            {resource.downloadCount}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────
// Resource Row (List / Table View)
// ────────────────────────────────────────────

function ResourceRow({
  resource,
  onDownload,
  onEdit,
  onDelete,
}: {
  resource: ResourceItem;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="hover:bg-muted/30 transition-colors group">
      {/* Resource info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "p-2 rounded-lg flex-shrink-0",
              RESOURCE_TYPE_COLORS[resource.type]
            )}
          >
            <ResourceTypeIcon
              type={resource.type}
              className="w-4 h-4"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {resource.title}
            </p>
            {resource.description && (
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                {resource.description}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {resource.uploader
                ? `${resource.uploader.prenom} ${resource.uploader.nom}`
                : "Inconnu"}
            </p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3 hidden md:table-cell">
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px]",
            RESOURCE_CATEGORY_COLORS[resource.category]
          )}
        >
          {RESOURCE_CATEGORY_LABELS[resource.category] || resource.category}
        </Badge>
      </td>

      {/* Course */}
      <td className="px-4 py-3 hidden lg:table-cell">
        {resource.course ? (
          <div className="flex items-center gap-1 text-xs text-foreground">
            <Link2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="truncate max-w-[120px]">
              {resource.course.title}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>

      {/* Size */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-xs text-muted-foreground">
          {formatFileSize(resource.fileSize)}
        </span>
      </td>

      {/* Date */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <span
          className="text-xs text-muted-foreground"
          title={formatDate(resource.createdAt)}
        >
          {formatRelativeTime(resource.createdAt)}
        </span>
      </td>

      {/* Downloads */}
      <td className="px-4 py-3 hidden xl:table-cell">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Download className="w-3 h-3" />
          {resource.downloadCount}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {resource.isDownloadable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ────────────────────────────────────────────
// Loading Skeleton
// ────────────────────────────────────────────

function AdminResourcesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border/60">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <Skeleton className="h-9 flex-1 max-w-md rounded-lg" />
            <Skeleton className="h-9 w-[150px] rounded-lg" />
            <Skeleton className="h-9 w-[170px] rounded-lg" />
            <Skeleton className="h-9 w-[180px] rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="w-7 h-7 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="pt-3 border-t border-border/40">
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
