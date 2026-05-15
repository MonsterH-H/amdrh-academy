"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Save, Eye, Plus, FileQuestion,
  Settings, ListOrdered,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { CourseOption } from "../types";
import type { QuizBuilderQuestion } from "./quiz-builder-editor";
import { QuestionEditorCard } from "./quiz-builder-editor";
import { QuizPreview } from "./quiz-builder-preview";
import type { QuizBuilderData } from "./quiz-builder-preview";

// ─── Defaults ─────────────────────────────────────────────────────

function createDefaultQuiz(): QuizBuilderData {
  return {
    title: "", description: "", courseId: "",
    duration: 30, passingScore: 70,
    shuffleQuestions: true, showAnswers: true, maxAttempts: 3,
    questions: [],
  };
}

function createDefaultQuestion(order: number): QuizBuilderQuestion {
  return {
    _tempId: "temp-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
    type: "QCM_SIMPLE", text: "", options: ["", ""],
    correctAnswer: [], explanation: "", points: 1, order,
  };
}

// ─── Main Component ───────────────────────────────────────────────

export function QuizBuilder({
  quizId, initialData, courses, onBack, onSaved,
}: {
  quizId?: string;
  initialData?: Partial<QuizBuilderData>;
  courses: CourseOption[];
  onBack: () => void;
  onSaved: (id: string) => void;
}) {
  const [quiz, setQuiz] = useState<QuizBuilderData>(() => ({
    ...createDefaultQuiz(), ...initialData,
  }));
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");
  const [previewOpen, setPreviewOpen] = useState(false);

  const updateSetting = <K extends keyof QuizBuilderData>(key: K, value: QuizBuilderData[K]) => {
    setQuiz((q) => ({ ...q, [key]: value }));
  };

  const addQuestion = () => {
    setQuiz((q) => ({ ...q, questions: [...q.questions, createDefaultQuestion(q.questions.length)] }));
    setActiveTab("questions");
  };

  const updateQuestion = (tempId: string, updates: Partial<QuizBuilderQuestion>) => {
    setQuiz((q) => ({ ...q, questions: q.questions.map((qn) => qn._tempId === tempId ? { ...qn, ...updates } : qn) }));
  };

  const removeQuestion = (tempId: string) => {
    setQuiz((q) => ({ ...q, questions: q.questions.filter((qn) => qn._tempId !== tempId).map((qn, i) => ({ ...qn, order: i })) }));
  };

  const moveQuestion = (tempId: string, direction: "up" | "down") => {
    setQuiz((q) => {
      const idx = q.questions.findIndex((qn) => qn._tempId === tempId);
      if (idx === -1) return q;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= q.questions.length) return q;
      const nq = [...q.questions];
      [nq[idx], nq[newIdx]] = [nq[newIdx], nq[idx]];
      return { ...q, questions: nq.map((qn, i) => ({ ...qn, order: i })) };
    });
  };

  const duplicateQuestion = (tempId: string) => {
    setQuiz((q) => {
      const src = q.questions.find((qn) => qn._tempId === tempId);
      if (!src) return q;
      const dup = { ...src, _tempId: "temp-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6), id: undefined };
      const idx = q.questions.findIndex((qn) => qn._tempId === tempId);
      const nq = [...q.questions];
      nq.splice(idx + 1, 0, dup);
      return { ...q, questions: nq.map((qn, i) => ({ ...qn, order: i })) };
    });
  };

  const toggleCorrect = (tempId: string, optIdx: number) => {
    setQuiz((q) => ({
      ...q,
      questions: q.questions.map((qn) => {
        if (qn._tempId !== tempId) return qn;
        if (qn.type === "QCM_SIMPLE") return { ...qn, correctAnswer: [optIdx] };
        const has = qn.correctAnswer.includes(optIdx);
        return { ...qn, correctAnswer: has ? qn.correctAnswer.filter((i) => i !== optIdx) : [...qn.correctAnswer, optIdx] };
      }),
    }));
  };

  const addOption = (tempId: string) => {
    setQuiz((q) => ({ ...q, questions: q.questions.map((qn) => qn._tempId === tempId && qn.options.length < 8 ? { ...qn, options: [...qn.options, ""] } : qn) }));
  };

  const removeOption = (tempId: string, optIdx: number) => {
    setQuiz((q) => ({
      ...q,
      questions: q.questions.map((qn) => {
        if (qn._tempId !== tempId || qn.options.length <= 2) return qn;
        return { ...qn, options: qn.options.filter((_, i) => i !== optIdx), correctAnswer: qn.correctAnswer.filter((i) => i !== optIdx).map((i) => (i > optIdx ? i - 1 : i)) };
      }),
    }));
  };

  const updateOptionText = (tempId: string, optIdx: number, value: string) => {
    setQuiz((q) => ({
      ...q, questions: q.questions.map((qn) => {
        if (qn._tempId !== tempId) return qn;
        const newOpts = [...qn.options]; newOpts[optIdx] = value; return { ...qn, options: newOpts };
      }),
    }));
  };

  const handleTypeChange = (tempId: string, type: string) => {
    setQuiz((q) => ({
      ...q,
      questions: q.questions.map((qn) => {
        if (qn._tempId !== tempId) return qn;
        if (type === "VRAI_FAUX") return { ...qn, type, options: ["Vrai", "Faux"], correctAnswer: [] };
        return { ...qn, type, options: ["", ""], correctAnswer: [] };
      }),
    }));
  };

  // Save quiz
  const handleSave = useCallback(async () => {
    if (!quiz.title.trim()) { toast({ title: "Erreur", description: "Le titre est requis.", variant: "destructive" }); return; }
    if (!quiz.courseId && !quizId) { toast({ title: "Erreur", description: "Le cours est requis.", variant: "destructive" }); return; }
    const validQuestions = quiz.questions.filter((q) => q.text.trim());

    setSaving(true);
    try {
      if (quizId) {
        const res = await fetch("/api/admin/quizzes/" + quizId, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: quiz.title, description: quiz.description, duration: quiz.duration, passingScore: quiz.passingScore, shuffleQuestions: quiz.shuffleQuestions, showAnswers: quiz.showAnswers, maxAttempts: quiz.maxAttempts }) });
        if (!res.ok) throw new Error();
        for (const qn of validQuestions) {
          const payload = { text: qn.text, type: qn.type, options: qn.options.filter((o) => o.trim()), correctAnswer: qn.correctAnswer, explanation: qn.explanation || null, points: qn.points, order: qn.order };
          if (qn.id) {
            await fetch("/api/admin/quizzes/" + quizId + "/questions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: qn.id, ...payload }) });
          } else {
            await fetch("/api/admin/quizzes/" + quizId + "/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
          }
        }
        const currentIds = validQuestions.filter((q) => q.id).map((q) => q.id!);
        const origIds = initialData?.questions?.filter((q) => q.id).map((q) => q.id!) || [];
        for (const delId of origIds) { if (!currentIds.includes(delId)) { await fetch("/api/admin/quizzes/" + quizId + "/questions?questionId=" + delId, { method: "DELETE" }); } }
      } else {
        const res = await fetch("/api/admin/quizzes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: quiz.title, courseId: quiz.courseId, description: quiz.description, duration: quiz.duration, passingScore: quiz.passingScore, shuffleQuestions: quiz.shuffleQuestions, showAnswers: quiz.showAnswers, maxAttempts: quiz.maxAttempts }) });
        if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Erreur"); }
        const data = await res.json();
        const newQuizId = data.quiz.id;
        for (const qn of validQuestions) {
          await fetch("/api/admin/quizzes/" + newQuizId + "/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: qn.text, type: qn.type, options: qn.options.filter((o) => o.trim()), correctAnswer: qn.correctAnswer, explanation: qn.explanation || null, points: qn.points, order: qn.order }) });
        }
        toast({ title: "Quiz créé avec succès !" }); onSaved(newQuizId); return;
      }
      toast({ title: "Quiz enregistré !" }); onSaved(quizId);
    } catch { toast({ title: "Erreur", description: "Impossible d'enregistrer le quiz.", variant: "destructive" }); } finally { setSaving(false); }
  }, [quiz, quizId, initialData, onSaved]);

  const totalPoints = quiz.questions.reduce((s, q) => s + q.points, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition-colors"><ArrowLeft className="w-4 h-4" /></button>
          <div>
            <h2 className="text-xl font-bold text-foreground">{quizId ? "Modifier le quiz" : "Nouveau quiz"}</h2>
            <p className="text-xs text-muted-foreground">{quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""} • {totalPoints} pts total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setPreviewOpen((p) => !p)}>
            <Eye className="w-4 h-4 mr-1.5" /> {previewOpen ? "Masquer" : "Aperçu"}
          </Button>
          <Button size="sm" className="rounded-lg" onClick={handleSave} disabled={saving}>
            {saving ? <span className="w-4 h-4 mr-1.5 border-2 border-current border-t-transparent animate-spin rounded-full" /> : <Save className="w-4 h-4 mr-1.5" />} Enregistrer
          </Button>
        </div>
      </div>

      <div className={cn("grid gap-6", previewOpen ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1")}>
        <div className="min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="settings" className="gap-1.5 rounded-lg"><Settings className="w-3.5 h-3.5" /> Paramètres</TabsTrigger>
              <TabsTrigger value="questions" className="gap-1.5 rounded-lg">
                <ListOrdered className="w-3.5 h-3.5" /> Questions
                {quiz.questions.length > 0 && <Badge variant="secondary" className="text-[10px] ml-1">{quiz.questions.length}</Badge>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="settings">
              <Card className="border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Paramètres du quiz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Titre du quiz *</Label>
                    <Input className="h-10 rounded-lg" value={quiz.title} onChange={(e) => updateSetting("title", e.target.value)} placeholder="Ex: Quiz final - Arbitrage" />
                  </div>
                  {!quizId && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Cours associé *</Label>
                      <Select value={quiz.courseId} onValueChange={(v) => updateSetting("courseId", v)}>
                        <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Sélectionner un cours" /></SelectTrigger>
                        <SelectContent>{courses.map((c) => (<SelectItem key={c.id} value={c.id}>{c.title} — {CATEGORY_LABELS[c.category]}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Description</Label>
                    <Textarea className="rounded-lg resize-none" rows={2} value={quiz.description} onChange={(e) => updateSetting("description", e.target.value)} placeholder="Description optionnelle..." />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1.5"><Label className="text-xs font-medium">Durée (min)</Label><Input type="number" min={5} className="h-10 rounded-lg" value={quiz.duration} onChange={(e) => updateSetting("duration", parseInt(e.target.value) || 30)} /></div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium">Score min (%)</Label><Input type="number" min={0} max={100} className="h-10 rounded-lg" value={quiz.passingScore} onChange={(e) => updateSetting("passingScore", parseInt(e.target.value) || 70)} /></div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium">Max tentatives</Label><Input type="number" min={1} className="h-10 rounded-lg" value={quiz.maxAttempts} onChange={(e) => updateSetting("maxAttempts", parseInt(e.target.value) || 3)} /></div>
                    <div className="space-y-1.5"><Label className="text-xs font-medium">Points total</Label><div className="h-10 rounded-lg bg-muted/50 flex items-center px-3 text-sm font-bold">{totalPoints}</div></div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between"><div className="space-y-0.5"><Label className="text-xs font-medium">Mélanger les questions</Label><p className="text-[10px] text-muted-foreground">Ordre aléatoire pour chaque tentative</p></div><Switch checked={quiz.shuffleQuestions} onCheckedChange={(v) => updateSetting("shuffleQuestions", v)} /></div>
                  <div className="flex items-center justify-between"><div className="space-y-0.5"><Label className="text-xs font-medium">Afficher les réponses</Label><p className="text-[10px] text-muted-foreground">Corrections visibles après soumission</p></div><Switch checked={quiz.showAnswers} onCheckedChange={(v) => updateSetting("showAnswers", v)} /></div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions">
              <div className="space-y-3">
                {quiz.questions.map((qn, idx) => (
                  <QuestionEditorCard key={qn._tempId} question={qn} index={idx} total={quiz.questions.length}
                    onTypeChange={(type) => handleTypeChange(qn._tempId, type)}
                    onTextChange={(text) => updateQuestion(qn._tempId, { text })}
                    onPointsChange={(points) => updateQuestion(qn._tempId, { points })}
                    onExplanationChange={(explanation) => updateQuestion(qn._tempId, { explanation })}
                    onToggleCorrect={(optIdx) => toggleCorrect(qn._tempId, optIdx)}
                    onOptionTextChange={(optIdx, value) => updateOptionText(qn._tempId, optIdx, value)}
                    onAddOption={() => addOption(qn._tempId)} onRemoveOption={(optIdx) => removeOption(qn._tempId, optIdx)}
                    onMoveUp={() => moveQuestion(qn._tempId, "up")} onMoveDown={() => moveQuestion(qn._tempId, "down")}
                    onDuplicate={() => duplicateQuestion(qn._tempId)} onRemove={() => removeQuestion(qn._tempId)}
                  />
                ))}
                {quiz.questions.length === 0 ? (
                  <Card className="border-border/60 border-dashed"><CardContent className="p-12 text-center"><FileQuestion className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-sm text-muted-foreground mb-4">Aucune question ajoutée</p><Button onClick={addQuestion} variant="outline" size="sm" className="rounded-lg"><Plus className="w-4 h-4 mr-1.5" /> Première question</Button></CardContent></Card>
                ) : (
                  <Button onClick={addQuestion} variant="outline" className="w-full rounded-lg border-dashed"><Plus className="w-4 h-4 mr-1.5" /> Ajouter une question</Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {previewOpen && <div className="min-w-0"><QuizPreview quiz={quiz} /></div>}
      </div>
    </div>
  );
}
