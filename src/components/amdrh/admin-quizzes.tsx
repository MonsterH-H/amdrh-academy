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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search, ChevronLeft, ChevronRight, ArrowLeft, Plus, Eye, Pencil,
  Trash2, Clock, CheckCircle2, XCircle, Target, BarChart3, HelpCircle,
  Loader2, GripVertical, ChevronUp, ChevronDown, FileQuestion,
  GraduationCap, Copy,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  CATEGORY_LABELS, QUESTION_TYPE_LABELS, QUESTION_TYPE_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================
interface QuizStats {
  passRate: number;
  avgScore: number;
  submittedCount: number;
}

interface QuizItem {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  duration: number;
  passingScore: number;
  shuffleQuestions: boolean;
  showAnswers: boolean;
  maxAttempts: number;
  createdAt: string;
  course: { title: string; category: string; slug?: string };
  questionCount: number;
  attemptCount: number;
  stats: QuizStats;
}

interface QuestionItem {
  id: string;
  quizId: string;
  text: string;
  type: string;
  options: string;
  correctAnswer: string;
  explanation: string | null;
  points: number;
  order: number;
}

interface CourseOption {
  id: string;
  title: string;
  category: string;
}

// ============================================
// Main Page
// ============================================
export function AdminQuizzesPage() {
  const { user } = useAppStore();
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailQuiz, setDetailQuiz] = useState<QuizItem | null>(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (courseFilter !== "ALL") params.set("courseId", courseFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/quizzes?${params}`);
      const data = await res.json();
      setQuizzes(data.quizzes || []);
      setCourses(data.courses || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [courseFilter, page, search]);

  useEffect(() => {
    if (!user) return;
    fetchQuizzes();
  }, [user, fetchQuizzes]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setLoading(true);
    fetchQuizzes();
  };

  const handleCourseFilter = (val: string) => {
    setCourseFilter(val);
    setPage(1);
    setLoading(true);
  };

  // When detailQuiz is set, render detail view
  if (detailQuiz) {
    return (
      <AdminQuizDetailPage
        quizId={detailQuiz.id}
        onBack={() => { setDetailQuiz(null); fetchQuizzes(); }}
      />
    );
  }

  if (loading) return <AdminQuizzesSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Gestion des quiz
          </h2>
          <p className="text-muted-foreground mt-1">{total} quiz au total</p>
        </div>
        <CreateQuizDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          courses={courses}
          onCreated={() => { setCreateOpen(false); fetchQuizzes(); }}
        />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par quiz ou cours..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-lg"
          />
        </form>
        <Select value={courseFilter} onValueChange={handleCourseFilter}>
          <SelectTrigger className="w-full sm:w-64 rounded-lg">
            <SelectValue placeholder="Filtrer par cours" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les cours</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quizzes list */}
      {quizzes.length === 0 ? (
        <div className="text-center py-20">
          <HelpCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            Aucun quiz trouvé
          </h3>
          <p className="text-sm text-muted-foreground">
            Créez un nouveau quiz pour un cours
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onView={() => setDetailQuiz(quiz)}
                onRefresh={fetchQuizzes}
              />
            ))}
          </div>

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
    </div>
  );
}

// ============================================
// Quiz Card Component
// ============================================
function QuizCard({
  quiz,
  onView,
  onRefresh,
}: {
  quiz: QuizItem;
  onView: () => void;
  onRefresh: () => void;
}) {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/quizzes/${quiz.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast({
          title: "Quiz supprimé",
          description: `"${quiz.title}" a été supprimé.`,
        });
        onRefresh();
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer ce quiz.",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Erreur serveur", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Card className="border-border/60 hover:shadow-md transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {quiz.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <GraduationCap className="w-3 h-3" />
              {quiz.course.title}
            </p>
          </div>
          <Badge
            variant="secondary"
            className="text-[10px] flex-shrink-0"
          >
            {CATEGORY_LABELS[quiz.course.category] || quiz.course.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-foreground">{quiz.questionCount}</p>
            <p className="text-[10px] text-muted-foreground">Questions</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold text-foreground">{quiz.attemptCount}</p>
            <p className="text-[10px] text-muted-foreground">Tentatives</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className={cn(
              "text-lg font-bold",
              quiz.stats.passRate >= 70 ? "text-green-600" : quiz.stats.passRate >= 40 ? "text-amber-600" : "text-red-600"
            )}>
              {quiz.attemptCount > 0 ? `${quiz.stats.passRate}%` : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">Réussite</p>
          </div>
        </div>

        {/* Settings badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-[10px] font-normal gap-1">
            <Clock className="w-3 h-3" /> {quiz.duration} min
          </Badge>
          <Badge variant="outline" className="text-[10px] font-normal gap-1">
            <Target className="w-3 h-3" /> {quiz.passingScore}%
          </Badge>
          <Badge variant="outline" className="text-[10px] font-normal">
            Max {quiz.maxAttempts} tent.
          </Badge>
          {quiz.shuffleQuestions && (
            <Badge variant="outline" className="text-[10px] font-normal gap-1">
              <Copy className="w-3 h-3" /> Mélange
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 rounded-lg text-xs"
            onClick={onView}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Gérer
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 p-0"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer le quiz ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Le quiz &quot;{quiz.title}&quot; et toutes ses questions et tentatives seront supprimés définitivement.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Create Quiz Dialog
// ============================================
function CreateQuizDialog({
  open,
  onOpenChange,
  courses,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courses: CourseOption[];
  onCreated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    courseId: "",
    description: "",
    duration: "30",
    passingScore: "70",
    shuffleQuestions: true,
    showAnswers: true,
    maxAttempts: "3",
  });

  const handleSubmit = async () => {
    setError("");
    if (!form.title || !form.courseId) {
      setError("Titre et cours sont requis");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          duration: parseInt(form.duration),
          passingScore: parseInt(form.passingScore),
          maxAttempts: parseInt(form.maxAttempts),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la création");
        return;
      }
      toast({ title: "Quiz créé avec succès" });
      setForm({
        title: "", courseId: "", description: "", duration: "30",
        passingScore: "70", shuffleQuestions: true, showAnswers: true, maxAttempts: "3",
      });
      onCreated();
    } catch {
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const availableCourses = courses.filter(
    (c) => !courses.some((oc) => oc.id === c.id && c.id === form.courseId)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 rounded-lg text-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Nouveau quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-primary" />
            Créer un quiz
          </DialogTitle>
          <DialogDescription>
            Associez un quiz à un cours pour évaluer les apprenants.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Titre du quiz *</Label>
            <Input
              className="h-10 rounded-lg"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Quiz final - Arbitrage"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Cours *</Label>
            <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Sélectionner un cours" />
              </SelectTrigger>
              <SelectContent>
                {availableCourses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title} — {CATEGORY_LABELS[c.category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description</Label>
            <Textarea
              className="rounded-lg resize-none"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description optionnelle du quiz..."
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Durée (min)</Label>
              <Input
                type="number"
                min={5}
                className="h-10 rounded-lg"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Score min (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                className="h-10 rounded-lg"
                value={form.passingScore}
                onChange={(e) => setForm({ ...form, passingScore: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Max tentatives</Label>
              <Input
                type="number"
                min={1}
                className="h-10 rounded-lg"
                value={form.maxAttempts}
                onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Mélanger les questions</Label>
              <p className="text-[10px] text-muted-foreground">Ordre aléatoire pour chaque tentative</p>
            </div>
            <Switch
              checked={form.shuffleQuestions}
              onCheckedChange={(v) => setForm({ ...form, shuffleQuestions: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Afficher les réponses</Label>
              <p className="text-[10px] text-muted-foreground">Montrer les corrections après soumission</p>
            </div>
            <Switch
              checked={form.showAnswers}
              onCheckedChange={(v) => setForm({ ...form, showAnswers: v })}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Créer le quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Quiz Detail Page (Questions + Settings)
// ============================================
function AdminQuizDetailPage({
  quizId,
  onBack,
}: {
  quizId: string;
  onBack: () => void;
}) {
  const [quiz, setQuiz] = useState<Record<string, unknown> | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editSettingsOpen, setEditSettingsOpen] = useState(false);
  const [addQuestionOpen, setAddQuestionOpen] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState<string | null>(null);

  const fetchQuiz = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`);
      const data = await res.json();
      setQuiz(data.quiz);
      setQuestions((data.quiz.questions as QuestionItem[]) || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/quizzes/${quizId}`);
        const data = await res.json();
        if (!cancelled) {
          setQuiz(data.quiz);
          setQuestions((data.quiz.questions as QuestionItem[]) || []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [quizId]);

  if (loading) return <AdminQuizzesSkeleton />;
  if (!quiz) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Quiz introuvable</p>
        <Button variant="outline" onClick={onBack} className="mt-4 rounded-lg">
          Retour
        </Button>
      </div>
    );
  }

  const course = quiz.course as { title: string; category: string };
  const stats = quiz.stats as QuizStats;

  const handleQuestionCreated = () => {
    setAddQuestionOpen(false);
    fetchQuiz();
  };

  const handleQuestionUpdated = () => {
    setEditQuestionId(null);
    fetchQuiz();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Retour à la liste
      </button>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{quiz.title as string}</h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            {course.title}
            <Badge variant="secondary" className="text-[10px]">
              {CATEGORY_LABELS[course.category]}
            </Badge>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EditSettingsDialog
            quiz={quiz as unknown as QuizItem}
            open={editSettingsOpen}
            onOpenChange={setEditSettingsOpen}
            onUpdated={fetchQuiz}
          />
          <Button
            onClick={() => setAddQuestionOpen(true)}
            className="bg-primary hover:bg-primary/90 rounded-lg text-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Ajouter une question
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          icon={FileQuestion}
          label="Questions"
          value={questions.length}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          icon={Target}
          label="Points total"
          value={quiz.totalPoints as number || 0}
          color="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          icon={BarChart3}
          label="Tentatives"
          value={stats.submittedCount}
          color="bg-violet-500/10 text-violet-600"
        />
        <StatCard
          icon={CheckCircle2}
          label="Taux réussite"
          value={`${stats.passRate}%`}
          color="bg-green-500/10 text-green-600"
        />
        <StatCard
          icon={BarChart3}
          label="Score moyen"
          value={`${stats.avgScore}%`}
          color="bg-emerald-500/10 text-emerald-600"
        />
      </div>

      {/* Settings summary */}
      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Paramètres</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Durée</p>
              <p className="font-medium">{quiz.duration} min</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score minimum</p>
              <p className="font-medium">{quiz.passingScore}%</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Max tentatives</p>
              <p className="font-medium">{quiz.maxAttempts}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mélanger</p>
              <p className="font-medium">{quiz.shuffleQuestions ? "Oui" : "Non"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions list */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileQuestion className="w-4 h-4 text-primary" />
            Questions
            <Badge variant="secondary" className="text-[10px] ml-auto">
              {questions.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <FileQuestion className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Aucune question ajoutée
              </p>
              <Button
                onClick={() => setAddQuestionOpen(true)}
                variant="outline"
                size="sm"
                className="rounded-lg"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Ajouter une question
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {questions.map((q, index) => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  index={index}
                  total={questions.length}
                  quizId={quizId}
                  onEdit={() => setEditQuestionId(q.id)}
                  onReorder={fetchQuiz}
                  onDelete={fetchQuiz}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Dialogs */}
      <AddQuestionDialog
        quizId={quizId}
        open={addQuestionOpen}
        onOpenChange={setAddQuestionOpen}
        onCreated={handleQuestionCreated}
        lastOrder={questions.length}
      />

      <EditQuestionDialog
        quizId={quizId}
        questionId={editQuestionId}
        onOpenChange={setEditQuestionId}
        questions={questions}
        onUpdated={handleQuestionUpdated}
      />
    </div>
  );
}

// ============================================
// Question Row Component
// ============================================
function QuestionRow({
  question,
  index,
  total,
  quizId,
  onEdit,
  onReorder,
  onDelete,
}: {
  question: QuestionItem;
  index: number;
  total: number;
  quizId: string;
  onEdit: () => void;
  onReorder: () => void;
  onDelete: () => void;
}) {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [reorderLoading, setReorderLoading] = useState(false);

  let options: string[] = [];
  let correctAnswer: number[] = [];
  try {
    options = JSON.parse(question.options);
  } catch { /* empty */ }
  try {
    correctAnswer = JSON.parse(question.correctAnswer);
  } catch { /* empty */ }

  const handleMove = async (newOrder: number) => {
    setReorderLoading(true);
    try {
      await fetch(`/api/admin/quizzes/${quizId}/questions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, order: newOrder }),
      });
      onReorder();
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setReorderLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(
        `/api/admin/quizzes/${quizId}/questions?questionId=${question.id}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        toast({ title: "Question supprimée" });
        onDelete();
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border/40 hover:border-border/80 transition-colors group">
      {/* Reorder controls */}
      <div className="flex flex-col items-center gap-0.5 pt-1">
        <button
          onClick={() => handleMove(question.order - 1)}
          disabled={index === 0 || reorderLoading}
          className="p-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
        >
          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <span className="text-[10px] font-bold text-muted-foreground">
          {question.order + 1}
        </span>
        <button
          onClick={() => handleMove(question.order + 1)}
          disabled={index === total - 1 || reorderLoading}
          className="p-0.5 rounded hover:bg-muted disabled:opacity-30 transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Question content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <p className="text-sm font-medium text-foreground flex-1">
            {question.text}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Badge
              variant="secondary"
              className={cn("text-[9px]", QUESTION_TYPE_COLORS[question.type] || "")}
            >
              {QUESTION_TYPE_LABELS[question.type] || question.type}
            </Badge>
            <Badge variant="outline" className="text-[9px]">
              {question.points} pt{question.points > 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Options preview */}
        {options.length > 0 && question.type !== "VRAI_FAUX" && (
          <div className="mt-2 flex flex-wrap gap-1">
            {options.map((opt, i) => (
              <span
                key={i}
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-[10px]",
                  correctAnswer.includes(i)
                    ? "bg-green-100 text-green-700 font-medium"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {correctAnswer.includes(i) ? "✓" : ""} {opt}
              </span>
            ))}
          </div>
        )}

        {question.type === "VRAI_FAUX" && options.length >= 2 && (
          <div className="mt-2 flex gap-1">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px]",
                correctAnswer.includes(0) ? "bg-green-100 text-green-700 font-medium" : "bg-muted text-muted-foreground"
              )}
            >
              {correctAnswer.includes(0) ? "✓" : ""} {options[0]}
            </span>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px]",
                correctAnswer.includes(1) ? "bg-green-100 text-green-700 font-medium" : "bg-muted text-muted-foreground"
              )}
            >
              {correctAnswer.includes(1) ? "✓" : ""} {options[1]}
            </span>
          </div>
        )}

        {question.explanation && (
          <p className="text-[11px] text-muted-foreground mt-1.5 italic">
            💡 {question.explanation}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-lg p-0"
          onClick={onEdit}
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-lg p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette question ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Les réponses associées seront supprimées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ============================================
// Add Question Dialog
// ============================================
function AddQuestionDialog({
  quizId,
  open,
  onOpenChange,
  onCreated,
  lastOrder,
}: {
  quizId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
  lastOrder: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState<string>("QCM_SIMPLE");
  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<number[]>([]);
  const [explanation, setExplanation] = useState("");
  const [points, setPoints] = useState("1");

  // When type changes, reset options
  useEffect(() => {
    if (type === "VRAI_FAUX") {
      setOptions(["Vrai", "Faux"]);
      setCorrectAnswer([]);
    } else {
      setOptions(["", ""]);
      setCorrectAnswer([]);
    }
  }, [type]);

  const addOption = () => {
    if (options.length < 8) setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
    setCorrectAnswer(correctAnswer.filter((i) => i !== index).map((i) => i > index ? i - 1 : i));
  };

  const toggleCorrect = (index: number) => {
    if (type === "QCM_SIMPLE") {
      setCorrectAnswer([index]);
    } else {
      setCorrectAnswer(
        correctAnswer.includes(index)
          ? correctAnswer.filter((i) => i !== index)
          : [...correctAnswer, index]
      );
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!text.trim()) {
      setError("Le texte de la question est requis");
      return;
    }
    const filledOptions = options.filter((o) => o.trim());
    if (filledOptions.length < 2) {
      setError("Au moins 2 options sont requises");
      return;
    }
    if (correctAnswer.length === 0) {
      setError("Sélectionnez au moins une réponse correcte");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          type,
          options: filledOptions,
          correctAnswer,
          explanation: explanation || null,
          points: parseInt(points) || 1,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la création");
        return;
      }
      toast({ title: "Question ajoutée" });
      setText("");
      setType("QCM_SIMPLE");
      setOptions(["", ""]);
      setCorrectAnswer([]);
      setExplanation("");
      setPoints("1");
      onCreated();
    } catch {
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Ajouter une question
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations de la question.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Type selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Type de question</Label>
            <div className="flex gap-2">
              {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-medium transition-all border flex-1 text-center",
                    type === key
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-muted-foreground border-border/60 hover:border-border"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Question text */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Texte de la question *</Label>
            <Textarea
              className="rounded-lg resize-none"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Écrivez votre question ici..."
            />
          </div>

          {/* Options */}
          {type !== "VRAI_FAUX" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">
                  Options *{" "}
                  <span className="text-muted-foreground font-normal">
                    (cliquez pour marquer la bonne réponse)
                  </span>
                </Label>
                {options.length < 8 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addOption}
                    className="h-7 text-xs rounded-lg"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Option
                  </Button>
                )}
              </div>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCorrect(i)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all border-2",
                      correctAnswer.includes(i)
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-border bg-white hover:border-green-300"
                    )}
                  >
                    {correctAnswer.includes(i) ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-xs text-muted-foreground font-bold">
                        {String.fromCharCode(65 + i)}
                      </span>
                    )}
                  </button>
                  <Input
                    className="h-9 rounded-lg flex-1 text-sm"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[i] = e.target.value;
                      setOptions(newOpts);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(i)}
                      className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Vrai/Faux correct answer */}
          {type === "VRAI_FAUX" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Réponse correcte *</Label>
              <div className="flex gap-2">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setCorrectAnswer([i])}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border",
                      correctAnswer.includes(i)
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-white text-muted-foreground border-border/60 hover:border-border"
                    )}
                  >
                    {correctAnswer.includes(i) && "✓ "} {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Explanation + Points */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <Label className="text-xs font-medium">Points</Label>
              <Input
                type="number"
                min={1}
                className="h-10 rounded-lg"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Explication</Label>
            <Textarea
              className="rounded-lg resize-none"
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Expliquez pourquoi cette réponse est correcte..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Ajouter la question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Edit Question Dialog
// ============================================
function EditQuestionDialog({
  quizId,
  questionId,
  onOpenChange,
  questions,
  onUpdated,
}: {
  quizId: string;
  questionId: string | null;
  onOpenChange: (id: string | null) => void;
  questions: QuestionItem[];
  onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState<string>("QCM_SIMPLE");
  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<number[]>([]);
  const [explanation, setExplanation] = useState("");
  const [points, setPoints] = useState("1");

  // Load question data when dialog opens
  useEffect(() => {
    if (!questionId) return;
    const q = questions.find((qu) => qu.id === questionId);
    if (!q) return;

    setType(q.type);
    setText(q.text);
    setPoints(String(q.points));
    setExplanation(q.explanation || "");

    try {
      setOptions(JSON.parse(q.options));
    } catch {
      setOptions([]);
    }
    try {
      setCorrectAnswer(JSON.parse(q.correctAnswer));
    } catch {
      setCorrectAnswer([]);
    }
  }, [questionId, questions]);

  const addOption = () => {
    if (options.length < 8) setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
    setCorrectAnswer(correctAnswer.filter((i) => i !== index).map((i) => i > index ? i - 1 : i));
  };

  const toggleCorrect = (index: number) => {
    if (type === "QCM_SIMPLE") {
      setCorrectAnswer([index]);
    } else {
      setCorrectAnswer(
        correctAnswer.includes(index)
          ? correctAnswer.filter((i) => i !== index)
          : [...correctAnswer, index]
      );
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!text.trim()) {
      setError("Le texte de la question est requis");
      return;
    }
    const filledOptions = options.filter((o) => o.trim());
    if (filledOptions.length < 2) {
      setError("Au moins 2 options sont requises");
      return;
    }
    if (correctAnswer.length === 0) {
      setError("Sélectionnez au moins une réponse correcte");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}/questions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          text,
          type,
          options: filledOptions,
          correctAnswer,
          explanation: explanation || null,
          points: parseInt(points) || 1,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la modification");
        return;
      }
      toast({ title: "Question modifiée" });
      onUpdated();
    } catch {
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  if (!questionId) return null;

  return (
    <Dialog open={!!questionId} onOpenChange={() => onOpenChange(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            Modifier la question
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de la question.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Type selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Type de question</Label>
            <div className="flex gap-2">
              {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-medium transition-all border flex-1 text-center",
                    type === key
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-muted-foreground border-border/60 hover:border-border"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Question text */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Texte de la question *</Label>
            <Textarea
              className="rounded-lg resize-none"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Écrivez votre question ici..."
            />
          </div>

          {/* Options */}
          {type !== "VRAI_FAUX" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">
                  Options *{" "}
                  <span className="text-muted-foreground font-normal">
                    (cliquez pour marquer la bonne réponse)
                  </span>
                </Label>
                {options.length < 8 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addOption}
                    className="h-7 text-xs rounded-lg"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Option
                  </Button>
                )}
              </div>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCorrect(i)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all border-2",
                      correctAnswer.includes(i)
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-border bg-white hover:border-green-300"
                    )}
                  >
                    {correctAnswer.includes(i) ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="text-xs text-muted-foreground font-bold">
                        {String.fromCharCode(65 + i)}
                      </span>
                    )}
                  </button>
                  <Input
                    className="h-9 rounded-lg flex-1 text-sm"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[i] = e.target.value;
                      setOptions(newOpts);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(i)}
                      className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Vrai/Faux correct answer */}
          {type === "VRAI_FAUX" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Réponse correcte *</Label>
              <div className="flex gap-2">
                {options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setCorrectAnswer([i])}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border",
                      correctAnswer.includes(i)
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-white text-muted-foreground border-border/60 hover:border-border"
                    )}
                  >
                    {correctAnswer.includes(i) && "✓ "} {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Points */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Points</Label>
            <Input
              type="number"
              min={1}
              className="h-10 rounded-lg w-24"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Explication</Label>
            <Textarea
              className="rounded-lg resize-none"
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Expliquez pourquoi cette réponse est correcte..."
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(null)} className="rounded-lg">
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Edit Settings Dialog
// ============================================
function EditSettingsDialog({
  quiz,
  open,
  onOpenChange,
  onUpdated,
}: {
  quiz: QuizItem;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: quiz.title,
    duration: String(quiz.duration),
    passingScore: String(quiz.passingScore),
    maxAttempts: String(quiz.maxAttempts),
    shuffleQuestions: quiz.shuffleQuestions,
    showAnswers: quiz.showAnswers,
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quizzes/${quiz.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          duration: parseInt(form.duration),
          passingScore: parseInt(form.passingScore),
          maxAttempts: parseInt(form.maxAttempts),
        }),
      });
      if (res.ok) {
        toast({ title: "Paramètres mis à jour" });
        onOpenChange(false);
        onUpdated();
      } else {
        toast({ title: "Erreur", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur serveur", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-lg text-sm">
          <Pencil className="w-4 h-4 mr-1.5" />
          Paramètres
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            Modifier les paramètres
          </DialogTitle>
          <DialogDescription>
            Modifiez les paramètres du quiz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Titre</Label>
            <Input
              className="h-10 rounded-lg"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Durée (min)</Label>
              <Input
                type="number"
                min={5}
                className="h-10 rounded-lg"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Score min (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                className="h-10 rounded-lg"
                value={form.passingScore}
                onChange={(e) => setForm({ ...form, passingScore: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Max tentatives</Label>
              <Input
                type="number"
                min={1}
                className="h-10 rounded-lg"
                value={form.maxAttempts}
                onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })}
              />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Mélanger les questions</Label>
              <p className="text-[10px] text-muted-foreground">Ordre aléatoire</p>
            </div>
            <Switch
              checked={form.shuffleQuestions}
              onCheckedChange={(v) => setForm({ ...form, shuffleQuestions: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Afficher les réponses</Label>
              <p className="text-[10px] text-muted-foreground">Corrections visibles</p>
            </div>
            <Switch
              checked={form.showAnswers}
              onCheckedChange={(v) => setForm({ ...form, showAnswers: v })}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Stat Card Helper
// ============================================
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xl font-bold leading-none">{value}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Skeleton
// ============================================
function AdminQuizzesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 max-w-md rounded-lg" />
        <Skeleton className="h-10 w-64 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2 mt-1" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-14 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
