"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, BookOpen, ChevronLeft, ChevronRight,
  Award, Globe, FileText, Archive, X, Filter,
  Eye, Loader2, AlertTriangle, Trash2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  CATEGORY_LABELS, DIFFICULTY_LABELS, COURSE_STATUS_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { STATUS_FILTERS } from "./course-list";
import type { CourseItem, CourseDetail } from "./course-list";
import { CourseRow } from "./course-list";
import { CourseFormDialog } from "./course-form-dialog";
import { CourseDetailContent } from "./section-manager";
import { AdminCoursesSkeleton } from "./skeletons";

export function AdminCoursesPage() {
  const { user } = useAppStore();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<{
    total: number; published: number; drafts: number; archived: number;
  } | null>(null);

  const [detailCourse, setDetailCourse] = useState<CourseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteCourse, setDeleteCourse] = useState<CourseItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string | number | boolean>>({});

  const fetchCourses = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12", admin: "true" });
      if (user?.role) params.set("role", user.role);
      if (user?.id) params.set("instructorId", user.id);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (difficultyFilter !== "ALL") params.set("difficulty", difficultyFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/courses?${params}`);
      const data = await res.json();
      setCourses(data.courses || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
      if (data.stats) setStats(data.stats);
    } catch { toast({ title: "Erreur", description: "Impossible de charger les cours", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [statusFilter, categoryFilter, difficultyFilter, page, search, user]);

  useEffect(() => { if (!user) return; setLoading(true); fetchCourses(); }, [user, fetchCourses]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); setLoading(true); fetchCourses(); };

  const handleStatusChange = async (courseId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}?userId=${user?.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      if (res.ok) { toast({ title: "Statut mis à jour", description: `Le cours est maintenant "${COURSE_STATUS_LABELS[newStatus]}".` }); fetchCourses(); }
      else { const data = await res.json(); toast({ title: "Erreur", description: data.error || "Impossible de modifier le statut", variant: "destructive" }); }
    } catch { toast({ title: "Erreur", description: "Erreur serveur", variant: "destructive" }); }
  };

  const handleDelete = async () => {
    if (!deleteCourse) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/courses/${deleteCourse.id}?userId=${user?.id}`, { method: "DELETE" });
      if (res.ok) { toast({ title: "Cours supprimé", description: `"${deleteCourse.title}" a été supprimé définitivement.` }); setDeleteCourse(null); fetchCourses(); }
      else { const data = await res.json(); toast({ title: "Erreur", description: data.error || "Impossible de supprimer le cours", variant: "destructive" }); }
    } catch { toast({ title: "Erreur serveur", variant: "destructive" }); }
    finally { setDeleteLoading(false); }
  };

  const openDetail = useCallback(async (courseId: string) => {
    setDetailOpen(true); setDetailLoading(true); setDetailCourse(null);
    try {
      const res = await fetch(`/api/courses/${courseId}?userId=${user?.id}`);
      const data = await res.json();
      setDetailCourse(data.course);
    } catch { toast({ title: "Erreur", description: "Impossible de charger les détails", variant: "destructive" }); }
    finally { setDetailLoading(false); }
  }, []);

  const refreshDetail = useCallback(async () => {
    if (!detailCourse?.id) return;
    try {
      const res = await fetch(`/api/courses/${detailCourse.id}?userId=${user?.id}`);
      const data = await res.json();
      setDetailCourse(data.course);
    } catch { toast({ title: "Erreur", description: "Impossible de rafraîchir les détails.", variant: "destructive" }); }
  }, [detailCourse?.id]);

  const openEdit = (course: CourseItem) => {
    setEditCourse(course);
    setEditForm({ title: course.title, description: course.description, category: course.category, difficulty: course.difficulty, duration: String(course.duration), isCertifying: course.isCertifying, passingScore: String(course.passingScore), maxAttempts: String(course.maxAttempts) });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editCourse || !editForm.title || !editForm.description) {
      toast({ title: "Champs requis", description: "Le titre et la description sont obligatoires.", variant: "destructive" });
      return;
    }
    setEditLoading(true);
    try {
      const payload: Record<string, unknown> = { title: editForm.title, description: editForm.description, category: editForm.category, difficulty: editForm.difficulty, duration: Number(editForm.duration) || 0, isCertifying: Boolean(editForm.isCertifying), passingScore: Number(editForm.passingScore) || 70, maxAttempts: Number(editForm.maxAttempts) || 3 };
      const res = await fetch(`/api/courses/${editCourse.id}?userId=${user?.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { toast({ title: "Cours mis à jour", description: `"${editForm.title}" a été enregistré.` }); setEditOpen(false); fetchCourses(); }
      else { const data = await res.json(); toast({ title: "Erreur", description: data.error || "Impossible de sauvegarder", variant: "destructive" }); }
    } catch { toast({ title: "Erreur serveur", variant: "destructive" }); }
    finally { setEditLoading(false); }
  };

  const totalSections = courses.reduce((acc, c) => acc + (c._count?.sections || 0), 0);
  if (loading) return <AdminCoursesSkeleton />;
  const isFormateur = user?.role === "FORMATEUR";

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{isFormateur ? "Mes cours" : "Gestion des cours"}</h2>
          <p className="text-muted-foreground mt-1">{total} cours au total{totalSections > 0 && ` · ${totalSections} sections`}</p>
        </div>
        {(categoryFilter !== "ALL" || difficultyFilter !== "ALL" || statusFilter !== "ALL") && (
          <Button variant="ghost" size="sm" className="rounded-lg text-xs text-muted-foreground" onClick={() => { setCategoryFilter("ALL"); setDifficultyFilter("ALL"); setStatusFilter("ALL"); setPage(1); }}>
            <X className="w-3.5 h-3.5 mr-1" />Réinitialiser filtres
          </Button>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total cours", value: stats.total, icon: BookOpen, color: "bg-primary/10 text-primary" },
            { label: "Publiés", value: stats.published, icon: Globe, color: "bg-green-500/10 text-green-600" },
            { label: "Brouillons", value: stats.drafts, icon: FileText, color: "bg-muted text-muted-foreground" },
            { label: "Archivés", value: stats.archived, icon: Archive, color: "bg-red-500/10 text-red-500" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2.5 rounded-lg", stat.color)}><stat.icon className="w-5 h-5" /></div>
                <div>
                  <p className="text-xl font-bold leading-none">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher par titre..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-lg" />
          </div>
        </form>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button key={f.value} onClick={() => { setStatusFilter(f.value); setPage(1); setLoading(true); }}
              className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5", statusFilter === f.value ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border/60 hover:border-border")}>
              {statusFilter === f.value && <span className={cn("w-1.5 h-1.5 rounded-full bg-white")} />}{f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); setLoading(true); }}>
              <SelectTrigger className="h-8 w-[150px] rounded-lg text-xs"><SelectValue placeholder="Catégorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Toutes catégories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Select value={difficultyFilter} onValueChange={(v) => { setDifficultyFilter(v); setPage(1); setLoading(true); }}>
            <SelectTrigger className="h-8 w-[150px] rounded-lg text-xs"><SelectValue placeholder="Difficulté" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes difficultés</SelectItem>
              {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucun cours trouvé</h3>
          <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres de recherche</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {courses.map((course) => (
              <CourseRow key={course.id} course={course} onView={() => openDetail(course.id)} onEdit={() => openEdit(course)} onDelete={() => setDeleteCourse(course)} onStatusChange={(status) => handleStatusChange(course.id, status)} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(page - 1); setLoading(true); }} className="rounded-lg"><ChevronLeft className="w-4 h-4" /></Button>
              <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(page + 1); setLoading(true); }} className="rounded-lg"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          )}
        </>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-primary" />Détails du cours</DialogTitle>
            <DialogDescription>Contenu et structure du cours</DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-4 py-4"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-32 w-full" /><Skeleton className="h-24 w-full" /></div>
          ) : detailCourse ? (
            <CourseDetailContent course={detailCourse} onRefresh={refreshDetail} />
          ) : (
            <div className="text-center py-10"><AlertTriangle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" /><p className="text-sm text-muted-foreground">Cours introuvable</p></div>
          )}
        </DialogContent>
      </Dialog>

      <CourseFormDialog open={editOpen} onOpenChange={setEditOpen} editCourse={editCourse} editForm={editForm} setEditForm={setEditForm} loading={editLoading} onSave={handleEditSave} />

      <Dialog open={!!deleteCourse} onOpenChange={() => setDeleteCourse(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600"><AlertTriangle className="w-5 h-5" />Supprimer le cours</DialogTitle>
            <DialogDescription>Cette action est irréversible. Toutes les sections, leçons et données associées seront supprimées.</DialogDescription>
          </DialogHeader>
          {deleteCourse && (
            <>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-foreground">{deleteCourse.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{deleteCourse._count?.sections || 0} section(s) · {deleteCourse._count?.enrollments || 0} inscription(s)</p>
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button variant="outline" onClick={() => setDeleteCourse(null)} className="rounded-lg">Annuler</Button>
                <Button onClick={handleDelete} disabled={deleteLoading} className="rounded-lg bg-red-600 hover:bg-red-700 text-white">
                  {deleteLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}Supprimer définitivement
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
