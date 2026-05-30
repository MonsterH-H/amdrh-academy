"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { GraduationCap, BookOpen, Users, Plus, Pencil, Loader2, Route, UserCheck, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, DIFFICULTY_LABELS, CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { LearningPathItem, PublishedCourse, PathFormCourse, PathEnrollment } from "../types";
import { MODE_LABELS, MODE_COLORS, ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUS_COLORS, formatDuration, formatDate } from "../types";
import { PathList } from "./path-list";
import { PathFormFields } from "./path-form-dialog";
import type { PathFormState } from "./path-form-dialog";
import { PathCourseManager } from "./path-course-manager";
import { AdminLearningPathsSkeleton } from "./path-skeleton";

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export function AdminLearningPathsPage() {
  const { user } = useAppStore();
  const [paths, setPaths] = useState<LearningPathItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Detail dialog
  const [detailPath, setDetailPath] = useState<LearningPathItem | null>(null);
  const [detailEnrollments, setDetailEnrollments] = useState<PathEnrollment[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create/Edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [publishedCourses, setPublishedCourses] = useState<PublishedCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [form, setForm] = useState<PathFormState>({ title: "", description: "", targetRole: "ARBITRE", mode: "sequentiel", isMandatory: false });
  const [formCourses, setFormCourses] = useState<PathFormCourse[]>([]);
  const [courseSearch, setCourseSearch] = useState("");

  const fetchPaths = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (roleFilter !== "ALL") params.set("targetRole", roleFilter);
      params.set("userId", user.id);
      const res = await fetch(`/api/admin/learning-paths?${params}`);
      const data = await res.json();
      setPaths(data.paths || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les parcours", variant: "destructive" });
    } finally { setLoading(false); }
  }, [page, roleFilter, user]);

  useEffect(() => { if (!user) return; fetchPaths(); }, [user, fetchPaths]);

  const fetchPublishedCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const res = await fetch("/api/courses?status=PUBLIE&limit=100");
      const data = await res.json();
      setPublishedCourses((data.courses || []).map((c: Record<string, unknown>) => ({
        id: c.id as string, title: c.title as string, category: c.category as string,
        difficulty: c.difficulty as string, duration: c.duration as number, status: c.status as string,
      })));
    } catch { /* silently fail */ } finally { setCoursesLoading(false); }
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", description: "", targetRole: "ARBITRE", mode: "sequentiel", isMandatory: false });
    setFormCourses([]);
    setFormError("");
    setCourseSearch("");
    fetchPublishedCourses();
    setFormOpen(true);
  };

  const openEdit = async (path: LearningPathItem) => {
    setEditingId(path.id);
    setForm({ title: path.title, description: path.description, targetRole: path.targetRole, mode: path.mode, isMandatory: path.isMandatory });
    setFormCourses(path.courses.map((pc) => ({ courseId: pc.courseId, order: pc.order, isRequired: pc.isRequired, minScore: pc.minScore })));
    setFormError("");
    setCourseSearch("");
    fetchPublishedCourses();
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    setFormError("");
    if (!form.title.trim() || !form.description.trim()) { setFormError("Titre et description sont requis"); return; }
    if (formCourses.length === 0) { setFormError("Ajoutez au moins un cours au parcours"); return; }
    if (!user) return;
    setFormLoading(true);
    try {
      const payload = { ...form, courses: formCourses.map((fc, i) => ({ courseId: fc.courseId, order: fc.order ?? i, isRequired: fc.isRequired, minScore: fc.minScore })) };
      let res: Response;
      if (editingId) { res = await fetch(`/api/admin/learning-paths/${editingId}?userId=${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
      else { res = await fetch(`/api/admin/learning-paths?userId=${user.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
      if (!res.ok) { const data = await res.json(); setFormError(data.error || "Erreur lors de l'enregistrement"); return; }
      toast({ title: editingId ? "Parcours mis à jour" : "Parcours créé", description: editingId ? `"${form.title}" a été mis à jour.` : `"${form.title}" a été créé avec succès.` });
      setFormOpen(false);
      fetchPaths();
    } catch { setFormError("Erreur serveur"); } finally { setFormLoading(false); }
  };

  const handleDelete = async (pathId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/admin/learning-paths/${pathId}?userId=${user.id}`, { method: "DELETE" });
      if (!res.ok) { const data = await res.json(); toast({ title: "Erreur", description: data.error || "Impossible de supprimer", variant: "destructive" }); return; }
      toast({ title: "Parcours supprimé", description: "Le parcours a été supprimé avec succès." });
      fetchPaths();
    } catch { toast({ title: "Erreur", description: "Erreur serveur", variant: "destructive" }); }
  };

  const openDetail = async (path: LearningPathItem) => {
    if (!user) return;
    setDetailPath(path);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/learning-paths/${path.id}?userId=${user.id}`);
      const data = await res.json();
      setDetailEnrollments(data.enrollments || []);
    } catch { setDetailEnrollments([]); } finally { setDetailLoading(false); }
  };

  // Stats
  const stats = {
    total,
    byRole: paths.reduce((acc, p) => { acc[p.targetRole] = (acc[p.targetRole] || 0) + 1; return acc; }, {} as Record<string, number>),
    totalEnrollments: paths.reduce((sum, p) => sum + (p.enrollmentCount || 0), 0),
  };

  if (loading) return <AdminLearningPathsSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des parcours</h2>
          <p className="text-muted-foreground mt-1">Créez et gérez les parcours de formation</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 rounded-lg text-sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1.5" /> Nouveau parcours</Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60"><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10 text-primary"><Route className="w-5 h-5" /></div><div><p className="text-xl font-bold leading-none">{stats.total}</p><p className="text-[11px] text-muted-foreground mt-1">Total parcours</p></div></CardContent></Card>
        <Card className="border-border/60"><CardContent className="p-4 flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10 text-blue-600"><UserCheck className="w-5 h-5" /></div><div><p className="text-xl font-bold leading-none">{stats.totalEnrollments}</p><p className="text-[11px] text-muted-foreground mt-1">Inscriptions totales</p></div></CardContent></Card>
        {Object.entries(stats.byRole).slice(0, 2).map(([role, count]) => (
          <Card key={role} className="border-border/60"><CardContent className="p-4 flex items-center gap-3"><div className={cn("p-2 rounded-lg", ROLE_COLORS[role] || "bg-gray-100")}><Target className="w-5 h-5" /></div><div><p className="text-xl font-bold leading-none">{count}</p><p className="text-[11px] text-muted-foreground mt-1">Parcours {ROLE_LABELS[role] || role}</p></div></CardContent></Card>
        ))}
      </div>

      {/* Path list with filters */}
      <PathList paths={paths} roleFilter={roleFilter} onOpenDetail={openDetail} onOpenEdit={openEdit} onDelete={handleDelete} onOpenCreate={openCreate} onRoleFilterChange={(v) => { setRoleFilter(v); setPage(1); }} setLoading={setLoading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(page - 1); setLoading(true); }} className="rounded-lg"><ChevronLeft className="w-4 h-4" /></Button>
          <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(page + 1); setLoading(true); }} className="rounded-lg"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" />{editingId ? "Modifier le parcours" : "Nouveau parcours"}</DialogTitle>
            <DialogDescription>{editingId ? "Modifiez les informations du parcours de formation." : "Configurez un nouveau parcours de formation."}</DialogDescription>
          </DialogHeader>
          <PathFormFields form={form} setForm={setForm} editingId={editingId} formError={formError} />
          <PathCourseManager formCourses={formCourses} setFormCourses={setFormCourses} publishedCourses={publishedCourses} coursesLoading={coursesLoading} courseSearch={courseSearch} setCourseSearch={setCourseSearch} />
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)} className="rounded-lg">Annuler</Button>
            <Button onClick={handleSubmit} disabled={formLoading} className="rounded-lg">
              {formLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : editingId ? <Pencil className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {editingId ? "Enregistrer" : "Créer le parcours"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog (with enrollments) */}
      <Dialog open={!!detailPath} onOpenChange={() => setDetailPath(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {detailPath && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5 text-primary" />{detailPath.title}</DialogTitle>
                <DialogDescription>{detailPath.description}</DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={cn("text-[10px]", ROLE_COLORS[detailPath.targetRole] || "")}>{ROLE_LABELS[detailPath.targetRole]}</Badge>
                <Badge className={cn("text-[10px]", MODE_COLORS[detailPath.mode] || "")}>{MODE_LABELS[detailPath.mode]}</Badge>
                {detailPath.isMandatory && <Badge className="text-[10px] bg-red-100 text-red-700">Obligatoire</Badge>}
                <span className="text-xs text-muted-foreground">Créé le {formatDate(detailPath.createdAt)}</span>
              </div>
              <Separator />
              {/* Courses list */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><BookOpen className="w-4 h-4" />Cours ({detailPath.courseCount}) — {formatDuration(detailPath.totalDuration)}</h4>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {detailPath.courses.map((pc) => (
                    <div key={pc.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 hover:border-border/80 transition-colors">
                      <span className="text-[10px] font-mono text-primary/60 w-5 text-center flex-shrink-0">{pc.order + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{pc.course.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{CATEGORY_LABELS[pc.course.category] || pc.course.category}</span><span>•</span>
                          <span>{DIFFICULTY_LABELS[pc.course.difficulty] || pc.course.difficulty}</span><span>•</span>
                          <span>{formatDuration(pc.course.duration)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {pc.isRequired && <Badge variant="secondary" className="text-[9px] bg-red-50 text-red-600 border-red-200">Obligatoire</Badge>}
                        <Badge variant="outline" className="text-[9px]">Min {pc.minScore}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              {/* Enrollments */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Users className="w-4 h-4" />Utilisateurs inscrits ({detailEnrollments.length})</h4>
                {detailLoading ? (
                  <div className="py-6 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                ) : detailEnrollments.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">Aucun inscrit à ce parcours</div>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {detailEnrollments.map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 hover:border-border/80 transition-colors">
                        <Avatar className="w-8 h-8"><AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">{enrollment.user?.prenom?.charAt(0) || ''}{enrollment.user?.nom?.charAt(0) || ''}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{enrollment.user?.prenom || ''} {enrollment.user?.nom || ''}</p>
                          <p className="text-[10px] text-muted-foreground">{enrollment.user?.email || ''}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="secondary" className={cn("text-[9px]", ENROLLMENT_STATUS_COLORS[enrollment.status] || "")}>{ENROLLMENT_STATUS_LABELS[enrollment.status] || enrollment.status}</Badge>
                          <span className="text-[10px] font-medium text-foreground">{Math.round(enrollment.progress)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
