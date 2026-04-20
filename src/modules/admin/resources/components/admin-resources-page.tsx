"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Plus, FolderOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { ResourceItem, CourseOption, ResourceStats } from "../types";
import { ResourceCard, ResourceRow } from "./resource-grid";
import { ResourceUploadDialog } from "./resource-upload-dialog";
import { ResourceEditDialog } from "./resource-edit-dialog";
import { ResourceDeleteDialog } from "./resource-delete-dialog";
import { ResourceFilters } from "./resource-filters";
import { ResourceStatsRow } from "./resource-stats-row";
import { AdminResourcesSkeleton } from "./resource-skeleton";

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

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const res = await fetch("/api/courses?admin=true");
      const data = await res.json();
      setCourses((data.courses || []).map((c: CourseOption) => ({ id: c.id, title: c.title })));
    } catch { /* silently fail */ } finally { setCoursesLoading(false); }
  }, []);

  // Fetch resources
  const fetchResources = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (search) params.set("search", search);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (courseFilter !== "ALL") params.set("courseId", courseFilter);
      const res = await fetch(`/api/resources?${params}`);
      const data = await res.json();
      setResources(data.resources || []);
      setTotal(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / 12) || 1);
      if (data.stats) setStats(data.stats);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les ressources", variant: "destructive" });
    } finally { setLoading(false); }
  }, [page, search, typeFilter, categoryFilter, courseFilter]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchResources();
    fetchCourses();
  }, [user, fetchResources, fetchCourses]);

  // Upload handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setUploadFiles((prev) => [...prev, ...newFiles]);
      if (!uploadTitle && newFiles.length === 1) setUploadTitle(newFiles[0].name.replace(/\.[^.]+$/, ""));
    }
  }, [uploadTitle]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadFiles((prev) => [...prev, ...newFiles]);
      if (!uploadTitle && newFiles.length === 1) setUploadTitle(newFiles[0].name.replace(/\.[^.]+$/, ""));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeUploadFile = (index: number) => setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  const resetUploadForm = () => { setUploadFiles([]); setUploadTitle(""); setUploadDescription(""); setUploadCategory("SUPPORT_COURS"); setUploadCourseId("NONE"); setUploadProgress(0); };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) { toast({ title: "Fichier requis", description: "Veuillez sélectionner au moins un fichier.", variant: "destructive" }); return; }
    if (!uploadTitle) { toast({ title: "Titre requis", description: "Veuillez entrer un titre pour la ressource.", variant: "destructive" }); return; }
    setUploading(true); setUploadProgress(0);
    const formData = new FormData();
    if (uploadFiles.length === 1) formData.append("file", uploadFiles[0]);
    else uploadFiles.forEach((f) => formData.append("files", f));
    formData.append("userId", user?.id || ""); formData.append("role", user?.role || "ADMIN");
    formData.append("title", uploadTitle);
    if (uploadDescription) formData.append("description", uploadDescription);
    formData.append("category", uploadCategory);
    if (uploadCourseId !== "NONE") formData.append("courseId", uploadCourseId);
    const progressInterval = setInterval(() => setUploadProgress((prev) => Math.min(prev + 10, 90)), 300);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        setUploadProgress(100);
        toast({ title: "Téléchargement réussi", description: `${uploadFiles.length} fichier${uploadFiles.length > 1 ? "s" : ""} ajouté${uploadFiles.length > 1 ? "s" : ""} avec succès.` });
        resetUploadForm(); setUploadOpen(false); fetchResources();
      } else { const data = await res.json(); toast({ title: "Erreur", description: data.error || "Impossible de télécharger le fichier", variant: "destructive" }); }
    } catch { toast({ title: "Erreur serveur", description: "Une erreur est survenue lors du téléchargement.", variant: "destructive" }); } finally { clearInterval(progressInterval); setUploading(false); setUploadProgress(0); }
  };

  // Edit handlers
  const openEdit = (resource: ResourceItem) => {
    setEditResource(resource); setEditTitle(resource.title); setEditDescription(resource.description || "");
    setEditCategory(resource.category); setEditCourseId(resource.courseId || "NONE");
    setEditDownloadable(resource.isDownloadable); setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editResource) return;
    if (!editTitle) { toast({ title: "Titre requis", description: "Le titre est obligatoire.", variant: "destructive" }); return; }
    setEditLoading(true);
    try {
      const payload: Record<string, unknown> = { title: editTitle, description: editDescription || null, category: editCategory, courseId: editCourseId === "NONE" ? null : editCourseId, isDownloadable: editDownloadable };
      const res = await fetch(`/api/resources/${editResource.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { toast({ title: "Ressource mise à jour", description: `"${editTitle}" a été enregistré.` }); setEditOpen(false); fetchResources(); }
      else { const data = await res.json(); toast({ title: "Erreur", description: data.error || "Impossible de sauvegarder", variant: "destructive" }); }
    } catch { toast({ title: "Erreur serveur", variant: "destructive" }); } finally { setEditLoading(false); }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteResource) return; setDeleteLoading(true);
    try {
      const res = await fetch(`/api/resources/${deleteResource.id}`, { method: "DELETE" });
      if (res.ok) { toast({ title: "Ressource supprimée", description: `"${deleteResource.title}" a été supprimé définitivement.` }); setDeleteResource(null); fetchResources(); }
      else { const data = await res.json(); toast({ title: "Erreur", description: data.error || "Impossible de supprimer la ressource", variant: "destructive" }); }
    } catch { toast({ title: "Erreur serveur", variant: "destructive" }); } finally { setDeleteLoading(false); }
  };

  // Download handler
  const handleDownload = async (resource: ResourceItem) => {
    try {
      const res = await fetch(`/api/resources/${resource.id}?download=true`);
      if (!res.ok) { toast({ title: "Erreur", description: "Impossible de télécharger la ressource", variant: "destructive" }); return; }
      const blob = await res.blob(); const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = resource.fileName;
      document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
      fetchResources();
    } catch { toast({ title: "Erreur", description: "Impossible de télécharger la ressource", variant: "destructive" }); }
  };

  const clearFilters = () => { setSearch(""); setTypeFilter("ALL"); setCategoryFilter("ALL"); setCourseFilter("ALL"); setPage(1); };
  const hasActiveFilters = search || typeFilter !== "ALL" || categoryFilter !== "ALL" || courseFilter !== "ALL";

  if (loading) return <AdminResourcesSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Médiathèque</h2>
          <p className="text-muted-foreground mt-1">Gestion des ressources pédagogiques</p>
        </div>
        <Button onClick={() => { resetUploadForm(); setUploadOpen(true); }} className="rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white">
          <Plus className="w-4 h-4 mr-2" /> Ajouter une ressource
        </Button>
      </div>

      {/* Stats Row */}
      <ResourceStatsRow stats={stats} total={total} />

      {/* Filters */}
      <ResourceFilters search={search} typeFilter={typeFilter} categoryFilter={categoryFilter} courseFilter={courseFilter} viewMode={viewMode} total={total} hasActiveFilters={!!hasActiveFilters} courses={courses}
        onSearchChange={(v) => { setSearch(v); setPage(1); }} onTypeFilterChange={(v) => { setTypeFilter(v); setPage(1); }}
        onCategoryFilterChange={(v) => { setCategoryFilter(v); setPage(1); }} onCourseFilterChange={(v) => { setCourseFilter(v); setPage(1); }}
        onViewModeChange={setViewMode} onClearFilters={clearFilters} />

      {/* Resource Grid / List */}
      {resources.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucune ressource trouvée</h3>
          <p className="text-sm text-muted-foreground mb-4">{hasActiveFilters ? "Essayez de modifier vos filtres de recherche" : "Commencez par ajouter votre première ressource"}</p>
          {!hasActiveFilters && <Button onClick={() => { resetUploadForm(); setUploadOpen(true); }} className="rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"><Plus className="w-4 h-4 mr-2" /> Ajouter une ressource</Button>}
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {resources.map((resource) => <ResourceCard key={resource.id} resource={resource} onDownload={() => handleDownload(resource)} onEdit={() => openEdit(resource)} onDelete={() => setDeleteResource(resource)} />)}
            </div>
          ) : (
            <div className="border border-border/60 rounded-lg overflow-hidden"><div className="overflow-x-auto"><table className="w-full">
              <thead><tr className="bg-muted/50 border-b border-border/60">
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Ressource</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Catégorie</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Cours</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Taille</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Date</th>
                <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden xl:table-cell">Téléchargements</th>
                <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 w-12">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-border/40">
                {resources.map((resource) => <ResourceRow key={resource.id} resource={resource} onDownload={() => handleDownload(resource)} onEdit={() => openEdit(resource)} onDelete={() => setDeleteResource(resource)} />)}
              </tbody>
            </table></div></div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg h-9"><ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline ml-1">Précédent</span></Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => { if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("..."); acc.push(p); return acc; }, [])
                  .map((p, idx) => p === "..." ? <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground">…</span> : (
                    <Button key={p} variant={page === p ? "default" : "outline"} size="sm" onClick={() => setPage(p as number)} className={cn("rounded-lg h-9 w-9 p-0 text-sm font-medium", page === p && "bg-[#1D4ED8] hover:bg-[#1E40AF] text-white")}>{p}</Button>
                  ))}
              </div>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg h-9"><span className="hidden sm:inline mr-1">Suivant</span><ChevronRight className="w-4 h-4" /></Button>
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <ResourceUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} courses={courses}
        uploadFiles={uploadFiles} uploadTitle={uploadTitle} uploadDescription={uploadDescription}
        uploadCategory={uploadCategory} uploadCourseId={uploadCourseId}
        uploading={uploading} uploadProgress={uploadProgress} dragActive={dragActive}
        fileInputRef={fileInputRef} setUploadTitle={setUploadTitle} setUploadDescription={setUploadDescription}
        setUploadCategory={setUploadCategory} setUploadCourseId={setUploadCourseId}
        onDrag={handleDrag} onDrop={handleDrop} onFileChange={handleFileChange}
        onRemoveFile={removeUploadFile} onUpload={handleUpload} />

      <ResourceEditDialog open={editOpen} onOpenChange={setEditOpen} resource={editResource}
        editTitle={editTitle} editDescription={editDescription} editCategory={editCategory}
        editCourseId={editCourseId} editDownloadable={editDownloadable} editLoading={editLoading} courses={courses}
        onTitleChange={setEditTitle} onDescriptionChange={setEditDescription} onCategoryChange={setEditCategory}
        onCourseIdChange={setEditCourseId} onDownloadableChange={setEditDownloadable} onSave={handleEditSave} />

      <ResourceDeleteDialog open={!!deleteResource} onOpenChange={() => setDeleteResource(null)}
        resource={deleteResource} loading={deleteLoading} onConfirm={handleDelete} />
    </div>
  );
}
