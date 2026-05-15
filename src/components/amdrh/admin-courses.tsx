"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Search, BookOpen, ChevronLeft, ChevronRight, ArrowLeft,
  Users, Clock, Award, MoreHorizontal, Eye, Edit3, Trash2,
  Archive, Send, CheckCircle2, Globe, FileText, Layers, Play,
  Loader2, AlertTriangle, GraduationCap, BarChart3, X, Filter,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  COURSE_STATUS_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  category: string;
  difficulty: string;
  status: string;
  duration: number;
  isCertifying: boolean;
  passingScore: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  instructorId: string | null;
  instructor: { id: string; nom: string; prenom: string; avatar: string | null } | null;
  _count: { enrollments: number; sections: number };
}

interface CourseDetail extends CourseItem {
  sections: Array<{
    id: string;
    title: string;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      type: string;
      duration: number;
      order: number;
    }>;
  }>;
  quiz: {
    id: string;
    title: string;
    duration: number;
    passingScore: number;
    maxAttempts: number;
    _count: { questions: number; attempts: number };
  } | null;
}

// ────────────────────────────────────────────
// Status badge colors
// ────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  BROUILLON: "bg-gray-100 text-gray-700",
  EN_REVISION: "bg-amber-100 text-amber-700",
  VALIDE: "bg-blue-100 text-blue-700",
  PUBLIE: "bg-green-100 text-green-700",
  ARCHIVE: "bg-red-100 text-red-600",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  BROUILLON: "bg-gray-400",
  EN_REVISION: "bg-amber-400",
  VALIDE: "bg-blue-400",
  PUBLIE: "bg-green-500",
  ARCHIVE: "bg-red-400",
};

// ────────────────────────────────────────────
// Status filter options
// ────────────────────────────────────────────

const STATUS_FILTERS = [
  { value: "ALL", label: "Tous" },
  { value: "BROUILLON", label: "Brouillons" },
  { value: "EN_REVISION", label: "En révision" },
  { value: "VALIDE", label: "Validés" },
  { value: "PUBLIE", label: "Publiés" },
  { value: "ARCHIVE", label: "Archivés" },
];

// ────────────────────────────────────────────
// Lesson type icons
// ────────────────────────────────────────────

const LESSON_TYPE_ICONS: Record<string, string> = {
  VIDEO: "🎬",
  PDF: "📄",
  TEXTE: "📝",
  INTERACTIF: "🎯",
};

// ────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────

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
    total: number;
    published: number;
    drafts: number;
    archived: number;
  } | null>(null);

  // Detail dialog
  const [detailCourse, setDetailCourse] = useState<CourseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // Delete dialog
  const [deleteCourse, setDeleteCourse] = useState<CourseItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit dialog
  const [editCourse, setEditCourse] = useState<CourseItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string | number | boolean>>({});

  const fetchCourses = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
        admin: "true",
      });
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
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les cours",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, difficultyFilter, page, search]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchCourses();
  }, [user, fetchCourses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setLoading(true);
    fetchCourses();
  };

  const handleStatusChange = async (courseId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast({
          title: "Statut mis à jour",
          description: `Le cours est maintenant "${COURSE_STATUS_LABELS[newStatus]}".`,
        });
        fetchCourses();
      } else {
        const data = await res.json();
        toast({
          title: "Erreur",
          description: data.error || "Impossible de modifier le statut",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur serveur",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteCourse) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/courses/${deleteCourse.id}`, { method: "DELETE" });
      if (res.ok) {
        toast({
          title: "Cours supprimé",
          description: `"${deleteCourse.title}" a été supprimé définitivement.`,
        });
        setDeleteCourse(null);
        fetchCourses();
      } else {
        const data = await res.json();
        toast({
          title: "Erreur",
          description: data.error || "Impossible de supprimer le cours",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Erreur serveur", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDetail = async (courseId: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailCourse(null);
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      setDetailCourse(data.course);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les détails", variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  const openEdit = (course: CourseItem) => {
    setEditCourse(course);
    setEditForm({
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      duration: String(course.duration),
      isCertifying: course.isCertifying,
      passingScore: String(course.passingScore),
      maxAttempts: String(course.maxAttempts),
    });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editCourse) return;
    if (!editForm.title || !editForm.description) {
      toast({
        title: "Champs requis",
        description: "Le titre et la description sont obligatoires.",
        variant: "destructive",
      });
      return;
    }
    setEditLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        difficulty: editForm.difficulty,
        duration: Number(editForm.duration) || 0,
        isCertifying: Boolean(editForm.isCertifying),
        passingScore: Number(editForm.passingScore) || 70,
        maxAttempts: Number(editForm.maxAttempts) || 3,
      };
      const res = await fetch(`/api/courses/${editCourse.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast({ title: "Cours mis à jour", description: `"${editForm.title}" a été enregistré.` });
        setEditOpen(false);
        fetchCourses();
      } else {
        const data = await res.json();
        toast({ title: "Erreur", description: data.error || "Impossible de sauvegarder", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur serveur", variant: "destructive" });
    } finally {
      setEditLoading(false);
    }
  };

  const totalSections = courses.reduce((acc, c) => acc + (c._count?.sections || 0), 0);
  const totalLessons = courses.reduce((acc, c) => acc + (c._count?.sections || 0) * 3, 0);

  if (loading) return <AdminCoursesSkeleton />;

  const isFormateur = user?.role === "FORMATEUR";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isFormateur ? "Mes cours" : "Gestion des cours"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {total} cours au total
            {totalSections > 0 && ` · ${totalSections} sections`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(categoryFilter !== "ALL" || difficultyFilter !== "ALL" || statusFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-lg text-xs text-muted-foreground"
              onClick={() => {
                setCategoryFilter("ALL");
                setDifficultyFilter("ALL");
                setStatusFilter("ALL");
                setPage(1);
              }}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Réinitialiser filtres
            </Button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total cours", value: stats.total, icon: BookOpen, color: "bg-primary/10 text-primary" },
            { label: "Publiés", value: stats.published, icon: Globe, color: "bg-green-500/10 text-green-600" },
            { label: "Brouillons", value: stats.drafts, icon: FileText, color: "bg-gray-500/10 text-gray-600" },
            { label: "Archivés", value: stats.archived, icon: Archive, color: "bg-red-500/10 text-red-500" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2.5 rounded-lg", stat.color)}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl font-bold leading-none">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search + Filters */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-lg"
            />
          </div>
        </form>

        {/* Status filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1); setLoading(true); }}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5",
                statusFilter === f.value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border/60 hover:border-border"
              )}
            >
              {statusFilter === f.value && (
                <span className={cn("w-1.5 h-1.5 rounded-full bg-white")} />
              )}
              {f.label}
            </button>
          ))}
        </div>

        {/* Category + Difficulty filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); setLoading(true); }}>
              <SelectTrigger className="h-8 w-[150px] rounded-lg text-xs">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Toutes catégories</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select value={difficultyFilter} onValueChange={(v) => { setDifficultyFilter(v); setPage(1); setLoading(true); }}>
            <SelectTrigger className="h-8 w-[150px] rounded-lg text-xs">
              <SelectValue placeholder="Difficulté" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes difficultés</SelectItem>
              {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course list */}
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
              <CourseRow
                key={course.id}
                course={course}
                onView={() => openDetail(course.id)}
                onEdit={() => openEdit(course)}
                onDelete={() => setDeleteCourse(course)}
                onStatusChange={(status) => handleStatusChange(course.id, status)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => { setPage(page - 1); setLoading(true); }}
                className="rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => { setPage(page + 1); setLoading(true); }}
                className="rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Course Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Détails du cours
            </DialogTitle>
            <DialogDescription>
              Contenu et structure du cours
            </DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : detailCourse ? (
            <div className="space-y-4">
              {/* Title + status */}
              <div>
                <h3 className="text-lg font-bold text-foreground">{detailCourse.title}</h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="secondary" className={cn("text-[10px]", STATUS_COLORS[detailCourse.status])}>
                    <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", STATUS_DOT_COLORS[detailCourse.status])} />
                    {COURSE_STATUS_LABELS[detailCourse.status]}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] bg-muted">
                    {CATEGORY_LABELS[detailCourse.category]}
                  </Badge>
                  <Badge variant="secondary" className={cn("text-[10px]", DIFFICULTY_COLORS[detailCourse.difficulty])}>
                    {DIFFICULTY_LABELS[detailCourse.difficulty]}
                  </Badge>
                </div>
              </div>

              {/* Meta info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MiniStat icon={Users} label="Inscrits" value={detailCourse._count?.enrollments || 0} />
                <MiniStat icon={Layers} label="Sections" value={detailCourse.sections?.length || 0} />
                <MiniStat icon={Play} label="Leçons" value={detailCourse.sections?.reduce((a, s) => a + s.lessons.length, 0) || 0} />
                <MiniStat icon={Clock} label="Durée" value={`${detailCourse.duration || 0} min`} />
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground leading-relaxed">{detailCourse.description}</p>
              </div>

              {/* Instructor */}
              {detailCourse.instructor && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Formateur : <span className="text-foreground font-medium">{detailCourse.instructor.prenom} {detailCourse.instructor.nom}</span>
                  </span>
                </div>
              )}

              {/* Certifying info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Certifiant</p>
                  <p className={cn("text-sm font-medium mt-0.5", detailCourse.isCertifying ? "text-green-700" : "text-muted-foreground")}>
                    {detailCourse.isCertifying ? "Oui" : "Non"}
                  </p>
                </div>
                {detailCourse.isCertifying && (
                  <>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Score min.</p>
                      <p className="text-sm font-medium mt-0.5">{detailCourse.passingScore}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tentatives max.</p>
                      <p className="text-sm font-medium mt-0.5">{detailCourse.maxAttempts}</p>
                    </div>
                  </>
                )}
              </div>

              <Separator />

              {/* Sections & Lessons */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Contenu du cours
                </h4>
                {detailCourse.sections.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Aucune section définie
                  </p>
                ) : (
                  <div className="space-y-3">
                    {detailCourse.sections.map((section, idx) => (
                      <div key={section.id} className="border border-border/60 rounded-lg overflow-hidden">
                        <div className="px-4 py-2.5 bg-muted/40 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-foreground">{section.title}</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {section.lessons.length} leçon{section.lessons.length > 1 ? "s" : ""}
                          </span>
                        </div>
                        {section.lessons.length > 0 && (
                          <div className="divide-y divide-border/30">
                            {section.lessons.map((lesson) => (
                              <div key={lesson.id} className="px-4 py-2 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                                <span className="text-sm">{LESSON_TYPE_ICONS[lesson.type] || "📝"}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-foreground truncate">{lesson.title}</p>
                                  <p className="text-[10px] text-muted-foreground">{lesson.type}</p>
                                </div>
                                {lesson.duration > 0 && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {lesson.duration} min
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quiz info */}
              {detailCourse.quiz && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      Quiz d&apos;évaluation
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <MiniStat icon={BarChart3} label="Questions" value={detailCourse.quiz._count.questions} />
                      <MiniStat icon={Users} label="Tentatives" value={detailCourse.quiz._count.attempts} />
                      <MiniStat icon={CheckCircle2} label="Score min." value={`${detailCourse.quiz.passingScore}%`} />
                      <MiniStat icon={Clock} label="Durée" value={`${detailCourse.quiz.duration} min`} />
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <AlertTriangle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Cours introuvable</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              Modifier le cours
            </DialogTitle>
            <DialogDescription>
              Mettez à jour les informations du cours
            </DialogDescription>
          </DialogHeader>

          {editCourse && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Titre *</Label>
                <Input
                  className="h-10 rounded-lg"
                  value={editForm.title as string}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Description *</Label>
                <Textarea
                  className="rounded-lg min-h-[100px] text-sm"
                  value={editForm.description as string}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Catégorie</Label>
                  <Select value={editForm.category as string} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                    <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Difficulté</Label>
                  <Select value={editForm.difficulty as string} onValueChange={(v) => setEditForm({ ...editForm, difficulty: v })}>
                    <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Durée (minutes)</Label>
                  <Input
                    type="number"
                    className="h-10 rounded-lg"
                    value={editForm.duration as string}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Cours certifiant</Label>
                  <Select
                    value={editForm.isCertifying ? "true" : "false"}
                    onValueChange={(v) => setEditForm({ ...editForm, isCertifying: v === "true" })}
                  >
                    <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Oui</SelectItem>
                      <SelectItem value="false">Non</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {editForm.isCertifying && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Score minimum (%)</Label>
                    <Input
                      type="number"
                      className="h-10 rounded-lg"
                      value={editForm.passingScore as string}
                      onChange={(e) => setEditForm({ ...editForm, passingScore: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Tentatives max.</Label>
                    <Input
                      type="number"
                      className="h-10 rounded-lg"
                      value={editForm.maxAttempts as string}
                      onChange={(e) => setEditForm({ ...editForm, maxAttempts: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-lg">
                  Annuler
                </Button>
                <Button onClick={handleEditSave} disabled={editLoading} className="rounded-lg">
                  {editLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Enregistrer
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteCourse} onOpenChange={() => setDeleteCourse(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Supprimer le cours
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes les sections, leçons et données associées seront supprimées.
            </DialogDescription>
          </DialogHeader>
          {deleteCourse && (
            <>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-foreground">{deleteCourse.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {deleteCourse._count?.sections || 0} section(s) · {deleteCourse._count?.enrollments || 0} inscription(s)
                </p>
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button variant="outline" onClick={() => setDeleteCourse(null)} className="rounded-lg">
                  Annuler
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="rounded-lg bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
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
// Course Row Component
// ────────────────────────────────────────────

function CourseRow({
  course,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  course: CourseItem;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}) {
  return (
    <Card className="border-border/60 hover:border-border/90 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Category icon */}
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 text-lg",
            course.category === "ARBITRAGE" && "bg-blue-50",
            course.category === "ENTRAINEMENT" && "bg-emerald-50",
            course.category === "JOUEURS" && "bg-amber-50",
            course.category === "ADMINISTRATION" && "bg-violet-50",
          )}>
            {course.category === "ARBITRAGE" && "🟦"}
            {course.category === "ENTRAINEMENT" && "🟩"}
            {course.category === "JOUEURS" && "🟨"}
            {course.category === "ADMINISTRATION" && "🟪"}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <button
                  onClick={onView}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors text-left truncate block w-full"
                >
                  {course.title}
                </button>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {course.description}
                </p>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onView} className="cursor-pointer">
                    <Eye className="w-4 h-4 mr-2" /> Voir les détails
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                    <Edit3 className="w-4 h-4 mr-2" /> Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Changer le statut</DropdownMenuLabel>
                  {course.status !== "PUBLIE" && (
                    <DropdownMenuItem onClick={() => onStatusChange("PUBLIE")} className="cursor-pointer">
                      <Globe className="w-4 h-4 mr-2 text-green-600" /> Publier
                    </DropdownMenuItem>
                  )}
                  {course.status !== "EN_REVISION" && course.status !== "PUBLIE" && (
                    <DropdownMenuItem onClick={() => onStatusChange("EN_REVISION")} className="cursor-pointer">
                      <Send className="w-4 h-4 mr-2 text-amber-600" /> Envoyer en révision
                    </DropdownMenuItem>
                  )}
                  {course.status !== "VALIDE" && course.status !== "PUBLIE" && (
                    <DropdownMenuItem onClick={() => onStatusChange("VALIDE")} className="cursor-pointer">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-blue-600" /> Valider
                    </DropdownMenuItem>
                  )}
                  {course.status !== "ARCHIVE" && (
                    <DropdownMenuItem onClick={() => onStatusChange("ARCHIVE")} className="cursor-pointer">
                      <Archive className="w-4 h-4 mr-2 text-red-600" /> Archiver
                    </DropdownMenuItem>
                  )}
                  {course.status !== "BROUILLON" && (
                    <DropdownMenuItem onClick={() => onStatusChange("BROUILLON")} className="cursor-pointer">
                      <FileText className="w-4 h-4 mr-2 text-gray-600" /> Repasser en brouillon
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-red-600 focus:text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="secondary" className={cn("text-[10px]", STATUS_COLORS[course.status])}>
                <span className={cn("w-1.5 h-1.5 rounded-full mr-1", STATUS_DOT_COLORS[course.status])} />
                {COURSE_STATUS_LABELS[course.status]}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {CATEGORY_LABELS[course.category]}
              </Badge>
              <Badge variant="secondary" className={cn("text-[10px]", DIFFICULTY_COLORS[course.difficulty])}>
                {DIFFICULTY_LABELS[course.difficulty]}
              </Badge>
              {course.isCertifying && (
                <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                  <Award className="w-3 h-3 mr-1" /> Certifiant
                </Badge>
              )}
              <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                <Users className="w-3 h-3" />
                {course._count?.enrollments || 0}
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {course._count?.sections || 0} sections
              </span>
              {course.duration > 0 && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {course.duration} min
                </span>
              )}
            </div>

            {/* Instructor */}
            {course.instructor && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Par {course.instructor.prenom} {course.instructor.nom}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────
// Mini Stat Component
// ────────────────────────────────────────────

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div>
        <p className="text-sm font-semibold leading-none">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Loading Skeleton
// ────────────────────────────────────────────

function AdminCoursesSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-32 mt-2" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search skeleton */}
      <Skeleton className="h-10 max-w-md w-full rounded-lg" />

      {/* Filter pills skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Course rows skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
