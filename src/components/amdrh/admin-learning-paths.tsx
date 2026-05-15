"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  BookOpen,
  Clock,
  Users,
  Plus,
  Loader2,
  Trash2,
  Pencil,
  Eye,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ArrowUp,
  ArrowDown,
  X,
  UserCheck,
  Award,
  PlayCircle,
  Search,
  Route,
  Target,
  BarChart3,
} from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, DIFFICULTY_LABELS, CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

const MODE_LABELS: Record<string, string> = {
  sequentiel: "Séquentiel",
  flexible: "Flexible",
  hybride: "Hybride",
};

const MODE_COLORS: Record<string, string> = {
  sequentiel: "bg-emerald-100 text-emerald-700",
  flexible: "bg-amber-100 text-amber-700",
  hybride: "bg-violet-100 text-violet-700",
};

const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  en_cours: "En cours",
  termine: "Terminé",
};

const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
  en_cours: "bg-blue-100 text-blue-700",
  termine: "bg-green-100 text-green-700",
};

interface PathCourse {
  id: string;
  courseId: string;
  order: number;
  isRequired: boolean;
  minScore: number;
  course: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    duration: number;
    status: string;
    coverImage?: string | null;
    instructor?: { id: string; nom: string; prenom: string } | null;
  };
}

interface PathEnrollment {
  id: string;
  progress: number;
  status: string;
  currentCourseOrder: number;
  startedAt: string;
  completedAt: string | null;
  user: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
    avatar?: string | null;
    isActive: boolean;
  };
}

interface LearningPathItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  targetRole: string;
  mode: string;
  isMandatory: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
  courses: PathCourse[];
  totalDuration: number;
  courseCount: number;
  enrollmentCount: number;
}

interface PublishedCourse {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: number;
  status: string;
}

interface PathFormCourse {
  courseId: string;
  order: number;
  isRequired: boolean;
  minScore: number;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export function AdminLearningPathsPage() {
  const { user } = useAppStore();
  const [paths, setPaths] = useState<LearningPathItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  const [form, setForm] = useState({
    title: "",
    description: "",
    targetRole: "ARBITRE",
    mode: "sequentiel",
    isMandatory: false,
  });
  const [formCourses, setFormCourses] = useState<PathFormCourse[]>([]);
  const [courseSearch, setCourseSearch] = useState("");

  const fetchPaths = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (roleFilter !== "ALL") params.set("targetRole", roleFilter);
      const res = await fetch(`/api/admin/learning-paths?${params}`);
      const data = await res.json();
      setPaths(data.paths || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les parcours", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter]);

  useEffect(() => {
    if (!user) return;
    fetchPaths();
  }, [user, fetchPaths]);

  const fetchPublishedCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const res = await fetch("/api/courses?status=PUBLIE&limit=100");
      const data = await res.json();
      setPublishedCourses((data.courses || []).map((c: Record<string, unknown>) => ({
        id: c.id as string,
        title: c.title as string,
        category: c.category as string,
        difficulty: c.difficulty as string,
        duration: c.duration as number,
        status: c.status as string,
      })));
    } catch {
      // silently fail
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  // Open create dialog
  const openCreate = () => {
    setEditingId(null);
    setForm({ title: "", description: "", targetRole: "ARBITRE", mode: "sequentiel", isMandatory: false });
    setFormCourses([]);
    setFormError("");
    setCourseSearch("");
    fetchPublishedCourses();
    setFormOpen(true);
  };

  // Open edit dialog
  const openEdit = async (path: LearningPathItem) => {
    setEditingId(path.id);
    setForm({
      title: path.title,
      description: path.description,
      targetRole: path.targetRole,
      mode: path.mode,
      isMandatory: path.isMandatory,
    });
    setFormCourses(
      path.courses.map((pc) => ({
        courseId: pc.courseId,
        order: pc.order,
        isRequired: pc.isRequired,
        minScore: pc.minScore,
      }))
    );
    setFormError("");
    setCourseSearch("");
    fetchPublishedCourses();
    setFormOpen(true);
  };

  // Handle form submit (create or update)
  const handleSubmit = async () => {
    setFormError("");
    if (!form.title.trim() || !form.description.trim()) {
      setFormError("Titre et description sont requis");
      return;
    }
    if (formCourses.length === 0) {
      setFormError("Ajoutez au moins un cours au parcours");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        ...form,
        courses: formCourses.map((fc, i) => ({
          courseId: fc.courseId,
          order: fc.order ?? i,
          isRequired: fc.isRequired,
          minScore: fc.minScore,
        })),
      };

      let res: Response;
      if (editingId) {
        res = await fetch(`/api/admin/learning-paths/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/learning-paths", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        setFormError(data.error || "Erreur lors de l'enregistrement");
        return;
      }

      toast({
        title: editingId ? "Parcours mis à jour" : "Parcours créé",
        description: editingId
          ? `"${form.title}" a été mis à jour.`
          : `"${form.title}" a été créé avec succès.`,
      });
      setFormOpen(false);
      fetchPaths();
    } catch {
      setFormError("Erreur serveur");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete path
  const handleDelete = async (pathId: string) => {
    try {
      const res = await fetch(`/api/admin/learning-paths/${pathId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast({ title: "Erreur", description: data.error || "Impossible de supprimer", variant: "destructive" });
        return;
      }
      toast({ title: "Parcours supprimé", description: "Le parcours a été supprimé avec succès." });
      fetchPaths();
    } catch {
      toast({ title: "Erreur", description: "Erreur serveur", variant: "destructive" });
    }
  };

  // View detail with enrollments
  const openDetail = async (path: LearningPathItem) => {
    setDetailPath(path);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/learning-paths/${path.id}`);
      const data = await res.json();
      setDetailEnrollments(data.enrollments || []);
    } catch {
      setDetailEnrollments([]);
    } finally {
      setDetailLoading(false);
    }
  };

  // Add course to form
  const addCourseToForm = (courseId: string) => {
    if (formCourses.some((fc) => fc.courseId === courseId)) return;
    setFormCourses([
      ...formCourses,
      { courseId, order: formCourses.length, isRequired: true, minScore: 70 },
    ]);
  };

  // Remove course from form
  const removeCourseFromForm = (courseId: string) => {
    const filtered = formCourses.filter((fc) => fc.courseId !== courseId);
    setFormCourses(filtered.map((fc, i) => ({ ...fc, order: i })));
  };

  // Move course order up/down
  const moveCourse = (index: number, direction: "up" | "down") => {
    const arr = [...formCourses];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setFormCourses(arr.map((fc, i) => ({ ...fc, order: i })));
  };

  // Filtered published courses (exclude already added)
  const availableCourses = publishedCourses.filter(
    (c) => !formCourses.some((fc) => fc.courseId === c.id)
  );
  const filteredAvailable = courseSearch
    ? availableCourses.filter((c) =>
        c.title.toLowerCase().includes(courseSearch.toLowerCase())
      )
    : availableCourses;

  // Stats
  const stats = {
    total,
    byRole: paths.reduce(
      (acc, p) => {
        acc[p.targetRole] = (acc[p.targetRole] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    totalEnrollments: paths.reduce((sum, p) => sum + (p.enrollmentCount || 0), 0),
  };

  const roleFilters = [
    { value: "ALL", label: "Tous" },
    { value: "ADMIN", label: "Admins" },
    { value: "FORMATEUR", label: "Formateurs" },
    { value: "ARBITRE", label: "Arbitres" },
    { value: "ENTRAINEUR", label: "Entraîneurs" },
    { value: "JOUEUR", label: "Joueurs" },
  ];

  if (loading) return <AdminLearningPathsSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Gestion des parcours
          </h2>
          <p className="text-muted-foreground mt-1">
            Créez et gérez les parcours de formation
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 rounded-lg text-sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          Nouveau parcours
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Route className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{stats.total}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Total parcours</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{stats.totalEnrollments}</p>
              <p className="text-[11px] text-muted-foreground mt-1">Inscriptions totales</p>
            </div>
          </CardContent>
        </Card>
        {Object.entries(stats.byRole).slice(0, 2).map(([role, count]) => (
          <Card key={role} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", ROLE_COLORS[role] || "bg-gray-100")}>
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{count}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Parcours {ROLE_LABELS[role] || role}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap">
        {roleFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setRoleFilter(f.value); setPage(1); setLoading(true); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              roleFilter === f.value
                ? "bg-primary text-white border-primary"
                : "bg-white text-muted-foreground border-border/60 hover:border-border"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Paths list */}
      {paths.length === 0 ? (
        <div className="text-center py-20">
          <GraduationCap className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucun parcours trouvé</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Commencez par créer votre premier parcours de formation
          </p>
          <Button className="rounded-lg" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Créer un parcours
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {paths.map((path) => (
            <Card key={path.id} className="border-border/60">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: path info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge
                        variant="secondary"
                        className={cn("text-[10px]", ROLE_COLORS[path.targetRole] || "")}
                      >
                        {ROLE_LABELS[path.targetRole] || path.targetRole}
                      </Badge>
                      <Badge
                        className={cn("text-[10px]", MODE_COLORS[path.mode] || "")}
                      >
                        {MODE_LABELS[path.mode] || path.mode}
                      </Badge>
                      {path.isMandatory && (
                        <Badge className="text-[10px] bg-red-100 text-red-700">
                          Obligatoire
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-foreground">{path.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {path.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {path.courseCount} cours
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(path.totalDuration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {path.enrollmentCount} inscrits
                      </span>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg"
                      onClick={() => openDetail(path)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg"
                      onClick={() => openEdit(path)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer le parcours ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Le parcours &quot;{path.title}&quot; et ses {path.enrollmentCount} inscription(s) seront définitivement supprimés.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={() => handleDelete(path.id)}
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Course preview chips */}
                {path.courses.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {path.courses.slice(0, 5).map((pc) => (
                      <span
                        key={pc.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/60 text-[11px] text-muted-foreground"
                      >
                        <span className="text-[10px] font-mono text-primary/60">{pc.order + 1}.</span>
                        {pc.course.title}
                      </span>
                    ))}
                    {path.courses.length > 5 && (
                      <span className="px-2 py-1 rounded-md bg-muted/40 text-[11px] text-muted-foreground">
                        +{path.courses.length - 5} autres
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(page - 1); setLoading(true); }} className="rounded-lg">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { setPage(page + 1); setLoading(true); }} className="rounded-lg">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              {editingId ? "Modifier le parcours" : "Nouveau parcours"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Modifiez les informations du parcours de formation."
                : "Configurez un nouveau parcours de formation."}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">
              {formError}
            </div>
          )}

          <div className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Titre *</Label>
              <Input
                className="h-10 rounded-lg"
                placeholder="Ex: Formation initiale Arbitre Niveau 1"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Description *</Label>
              <Textarea
                className="rounded-lg min-h-[80px]"
                placeholder="Décrivez l'objectif et le contenu du parcours..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Two columns: Target Role + Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Rôle cible *</Label>
                <Select value={form.targetRole} onValueChange={(v) => setForm({ ...form, targetRole: v })}>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Mode</Label>
                <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sequentiel">Séquentiel</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                    <SelectItem value="hybride">Hybride</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mandatory toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60">
              <div>
                <p className="text-sm font-medium text-foreground">Parcours obligatoire</p>
                <p className="text-[11px] text-muted-foreground">
                  Les utilisateurs du rôle cible devront suivre ce parcours
                </p>
              </div>
              <Switch
                checked={form.isMandatory}
                onCheckedChange={(v) => setForm({ ...form, isMandatory: v })}
              />
            </div>

            <Separator />

            {/* Course selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-medium">Cours du parcours</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formCourses.length} cours ajouté(s)
                  </p>
                </div>
              </div>

              {/* Course search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-9 rounded-lg text-sm"
                  placeholder="Rechercher un cours publié..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                />
              </div>

              {/* Available courses list */}
              {coursesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto border border-border/40 rounded-lg divide-y divide-border/30">
                  {filteredAvailable.length === 0 ? (
                    <div className="py-6 text-center text-xs text-muted-foreground">
                      {availableCourses.length === 0
                        ? "Aucun cours publié disponible"
                        : "Aucun cours correspondant"}
                    </div>
                  ) : (
                    filteredAvailable.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => addCourseToForm(course.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors text-left"
                      >
                        <Plus className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{course.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <Badge variant="outline" className="text-[9px]">
                              {CATEGORY_LABELS[course.category] || course.category}
                            </Badge>
                            <Badge variant="outline" className="text-[9px]">
                              {DIFFICULTY_LABELS[course.difficulty] || course.difficulty}
                            </Badge>
                            <span>{formatDuration(course.duration)}</span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Selected courses (ordered list) */}
              {formCourses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Ordre des cours :
                  </p>
                  <div className="space-y-1.5">
                    {formCourses.map((fc, i) => {
                      const courseInfo = publishedCourses.find((c) => c.id === fc.courseId);
                      return (
                        <div
                          key={fc.courseId}
                          className="flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-white"
                        >
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => moveCourse(i, "up")}
                              disabled={i === 0}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => moveCourse(i, "down")}
                              disabled={i === formCourses.length - 1}
                              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                          <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                          <span className="text-[10px] font-mono text-primary/60 w-4 text-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {courseInfo?.title || "Cours"}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              {courseInfo && (
                                <>
                                  <span>{CATEGORY_LABELS[courseInfo.category] || courseInfo.category}</span>
                                  <span>•</span>
                                  <span>{formatDuration(courseInfo.duration)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center gap-1">
                              <Checkbox
                                checked={fc.isRequired}
                                onCheckedChange={(v) => {
                                  const arr = [...formCourses];
                                  arr[i] = { ...arr[i], isRequired: !!v };
                                  setFormCourses(arr);
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">Oblig.</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Label className="text-[10px] text-muted-foreground whitespace-nowrap">Score min</Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={fc.minScore}
                                onChange={(e) => {
                                  const arr = [...formCourses];
                                  arr[i] = { ...arr[i], minScore: parseInt(e.target.value, 10) || 0 };
                                  setFormCourses(arr);
                                }}
                                className="w-14 h-7 text-[11px] rounded-md px-2"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-md"
                              onClick={() => removeCourseFromForm(fc.courseId)}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setFormOpen(false)} className="rounded-lg">
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={formLoading} className="rounded-lg">
              {formLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : editingId ? (
                <Pencil className="w-4 h-4 mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
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
                <DialogTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  {detailPath.title}
                </DialogTitle>
                <DialogDescription>{detailPath.description}</DialogDescription>
              </DialogHeader>

              {/* Path meta */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={cn("text-[10px]", ROLE_COLORS[detailPath.targetRole] || "")}>
                  {ROLE_LABELS[detailPath.targetRole]}
                </Badge>
                <Badge className={cn("text-[10px]", MODE_COLORS[detailPath.mode] || "")}>
                  {MODE_LABELS[detailPath.mode]}
                </Badge>
                {detailPath.isMandatory && (
                  <Badge className="text-[10px] bg-red-100 text-red-700">Obligatoire</Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  Créé le {formatDate(detailPath.createdAt)}
                </span>
              </div>

              <Separator />

              {/* Courses list */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Cours ({detailPath.courseCount}) — {formatDuration(detailPath.totalDuration)}
                </h4>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {detailPath.courses.map((pc) => (
                    <div
                      key={pc.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 hover:border-border/80 transition-colors"
                    >
                      <span className="text-[10px] font-mono text-primary/60 w-5 text-center flex-shrink-0">
                        {pc.order + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{pc.course.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{CATEGORY_LABELS[pc.course.category] || pc.course.category}</span>
                          <span>•</span>
                          <span>{DIFFICULTY_LABELS[pc.course.difficulty] || pc.course.difficulty}</span>
                          <span>•</span>
                          <span>{formatDuration(pc.course.duration)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {pc.isRequired && (
                          <Badge variant="secondary" className="text-[9px] bg-red-50 text-red-600 border-red-200">
                            Obligatoire
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[9px]">
                          Min {pc.minScore}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Enrollments */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Utilisateurs inscrits ({detailEnrollments.length})
                </h4>
                {detailLoading ? (
                  <div className="py-6 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : detailEnrollments.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Aucun inscrit à ce parcours
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {detailEnrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 hover:border-border/80 transition-colors"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                            {enrollment.user?.prenom?.charAt(0) || ''}{enrollment.user?.nom?.charAt(0) || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {enrollment.user?.prenom || ''} {enrollment.user?.nom || ''}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {enrollment.user?.email || ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge
                            variant="secondary"
                            className={cn("text-[9px]", ENROLLMENT_STATUS_COLORS[enrollment.status] || "")}
                          >
                            {ENROLLMENT_STATUS_LABELS[enrollment.status] || enrollment.status}
                          </Badge>
                          <span className="text-[10px] font-medium text-foreground">
                            {Math.round(enrollment.progress)}%
                          </span>
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

// ──────────────────────────────────────────────
// Skeleton
// ──────────────────────────────────────────────

function AdminLearningPathsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="flex gap-1.5">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
