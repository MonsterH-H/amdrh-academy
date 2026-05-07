"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, ArrowLeft, Plus, HelpCircle, GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CATEGORY_LABELS } from "@/lib/constants";
import { QuizCard, QuizPagination, AdminQuizzesSkeleton } from "./quiz-list";
import { CreateQuizDialog, EditSettingsDialog } from "./quiz-form-dialog";
import { AddQuestionDialog, EditQuestionDialog } from "./question-editor";
import { QuestionBankView } from "./question-bank";
import { QuizAttemptsView } from "./quiz-attempts-view";
import type { QuizItem, QuestionItem, CourseOption, QuizStats } from "../types";

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
      if (user?.role) params.set("role", user.role);
      if (user?.id) params.set("instructorId", user.id);
      if (courseFilter !== "ALL") params.set("courseId", courseFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/quizzes?${params}`);
      const data = await res.json();
      setQuizzes(data.quizzes || []);
      setCourses(data.courses || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les quiz.", variant: "destructive" });
    } finally { setLoading(false); }
  }, [courseFilter, page, search, user?.role, user?.id]);

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

  const isFormateur = user?.role === "FORMATEUR";

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isFormateur ? "Mes quiz" : "Gestion des quiz"}
          </h2>
          <p className="text-muted-foreground mt-1">{total} quiz au total</p>
        </div>
        <CreateQuizDialog
          open={createOpen} onOpenChange={setCreateOpen}
          courses={courses}
          onCreated={() => { setCreateOpen(false); fetchQuizzes(); }}
        />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher par quiz ou cours..."
            value={search} onChange={(e) => setSearch(e.target.value)}
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
              <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quizzes list */}
      {quizzes.length === 0 ? (
        <div className="text-center py-20">
          <HelpCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucun quiz trouvé</h3>
          <p className="text-sm text-muted-foreground">Créez un nouveau quiz pour un cours</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz}
                onView={() => setDetailQuiz(quiz)} onRefresh={fetchQuizzes}
              />
            ))}
          </div>
          <QuizPagination page={page} totalPages={totalPages}
            onPageChange={(p) => { setPage(p); setLoading(true); }}
          />
        </>
      )}
    </div>
  );
}

// ============================================
// Quiz Detail Page (Questions + Settings + Stats)
// ============================================
function AdminQuizDetailPage({
  quizId, onBack,
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
    } catch { setLoading(false); }
  }, [quizId]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/quizzes/${quizId}`);
        const data = await res.json();
        if (!res.ok || !data.quiz) {
          toast({ title: "Erreur", description: "Impossible de charger le quiz.", variant: "destructive" });
          if (!cancelled) { setQuiz(null); setLoading(false); }
          return;
        }
        if (!cancelled) {
          setQuiz(data.quiz);
          setQuestions((data.quiz.questions as QuestionItem[]) || []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          toast({ title: "Erreur", description: "Erreur réseau.", variant: "destructive" });
          setLoading(false);
        }
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
        <Button variant="outline" onClick={onBack} className="mt-4 rounded-lg">Retour</Button>
      </div>
    );
  }

  const course = quiz.course as { title: string; category: string };
  const stats = quiz.stats as QuizStats;

  return (
    <div className="space-y-6 animate-fadeIn">
      <button onClick={onBack}
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
            open={editSettingsOpen} onOpenChange={setEditSettingsOpen}
            onUpdated={fetchQuiz}
          />
          <Button onClick={() => setAddQuestionOpen(true)}
            className="bg-primary hover:bg-primary/90 rounded-lg text-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Ajouter une question
          </Button>
        </div>
      </div>

      {/* Stats & Settings */}
      <QuizAttemptsView
        questionCount={questions.length}
        totalPoints={(quiz.totalPoints as number) || 0}
        stats={stats}
        duration={quiz.duration as number}
        passingScore={quiz.passingScore as number}
        maxAttempts={quiz.maxAttempts as number}
        shuffleQuestions={quiz.shuffleQuestions as boolean}
      />

      {/* Question Bank */}
      <QuestionBankView
        questions={questions} quizId={quizId}
        onEdit={(qId) => setEditQuestionId(qId)}
        onReorder={fetchQuiz}
        onAddClick={() => setAddQuestionOpen(true)}
      />

      {/* Question Dialogs */}
      <AddQuestionDialog
        quizId={quizId}
        open={addQuestionOpen} onOpenChange={setAddQuestionOpen}
        onCreated={() => { setAddQuestionOpen(false); fetchQuiz(); }}
      />
      <EditQuestionDialog
        quizId={quizId}
        questionId={editQuestionId} onOpenChange={setEditQuestionId}
        questions={questions}
        onUpdated={() => { setEditQuestionId(null); fetchQuiz(); }}
      />
    </div>
  );
}
