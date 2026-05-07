"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Loader2, FileQuestion } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CATEGORY_LABELS } from "@/lib/constants";
import type { QuizItem, CourseOption } from "../types";

const defaultFormState = {
  title: "", courseId: "", description: "", duration: "30",
  passingScore: "70", shuffleQuestions: true, showAnswers: true, maxAttempts: "3",
};

type QuizFormState = typeof defaultFormState;

function QuizSettingsForm({
  form, onChange, courses, showCourseSelect,
}: {
  form: QuizFormState;
  onChange: (f: QuizFormState) => void;
  courses: CourseOption[];
  showCourseSelect: boolean;
}) {
  const u = (k: keyof QuizFormState, v: QuizFormState[keyof QuizFormState]) =>
    onChange({ ...form, [k]: v });

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">{showCourseSelect ? "Titre du quiz *" : "Titre"}</Label>
        <Input className="h-10 rounded-lg" value={form.title}
          onChange={(e) => u("title", e.target.value)} placeholder="Ex: Quiz final - Arbitrage"
        />
      </div>
      {showCourseSelect && (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Cours *</Label>
            <Select value={form.courseId} onValueChange={(v) => u("courseId", v)}>
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Sélectionner un cours" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title} — {CATEGORY_LABELS[c.category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description</Label>
            <Textarea className="rounded-lg resize-none" rows={2} value={form.description}
              onChange={(e) => u("description", e.target.value)}
              placeholder="Description optionnelle du quiz..."
            />
          </div>
        </>
      )}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Durée (min)</Label>
          <Input type="number" min={5} className="h-10 rounded-lg" value={form.duration}
            onChange={(e) => u("duration", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Score min (%)</Label>
          <Input type="number" min={0} max={100} className="h-10 rounded-lg" value={form.passingScore}
            onChange={(e) => u("passingScore", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Max tentatives</Label>
          <Input type="number" min={1} className="h-10 rounded-lg" value={form.maxAttempts}
            onChange={(e) => u("maxAttempts", e.target.value)}
          />
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-xs font-medium">Mélanger les questions</Label>
          <p className="text-[10px] text-muted-foreground">Ordre aléatoire pour chaque tentative</p>
        </div>
        <Switch checked={form.shuffleQuestions} onCheckedChange={(v) => u("shuffleQuestions", v)} />
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-xs font-medium">Afficher les réponses</Label>
          <p className="text-[10px] text-muted-foreground">Montrer les corrections après soumission</p>
        </div>
        <Switch checked={form.showAnswers} onCheckedChange={(v) => u("showAnswers", v)} />
      </div>
    </div>
  );
}

export function CreateQuizDialog({
  open, onOpenChange, courses, onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courses: CourseOption[];
  onCreated: () => void;
}) {
  const { user } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<QuizFormState>(defaultFormState);

  const handleSubmit = async () => {
    setError("");
    if (!form.title || !form.courseId) { setError("Titre et cours sont requis"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quizzes?userId=${user?.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form, duration: parseInt(form.duration),
          passingScore: parseInt(form.passingScore), maxAttempts: parseInt(form.maxAttempts),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la création"); return;
      }
      toast({ title: "Quiz créé avec succès" });
      setForm(defaultFormState);
      onCreated();
    } catch { setError("Erreur serveur"); } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 rounded-lg text-sm">
          <Plus className="w-4 h-4 mr-1.5" /> Nouveau quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-primary" /> Créer un quiz
          </DialogTitle>
          <DialogDescription>Associez un quiz à un cours pour évaluer les apprenants.</DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">{error}</div>
        )}
        <QuizSettingsForm form={form} onChange={setForm} courses={courses} showCourseSelect />
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Créer le quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditSettingsDialog({
  quiz, open, onOpenChange, onUpdated,
}: {
  quiz: QuizItem;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdated: () => void;
}) {
  const { user } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<QuizFormState>({
    ...defaultFormState,
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
      const res = await fetch(`/api/admin/quizzes/${quiz.id}?userId=${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form, duration: parseInt(form.duration),
          passingScore: parseInt(form.passingScore), maxAttempts: parseInt(form.maxAttempts),
        }),
      });
      if (res.ok) {
        toast({ title: "Paramètres mis à jour" });
        onOpenChange(false);
        onUpdated();
      } else {
        toast({ title: "Erreur", variant: "destructive" });
      }
    } catch { toast({ title: "Erreur serveur", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-lg text-sm">
          <Pencil className="w-4 h-4 mr-1.5" /> Paramètres
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" /> Modifier les paramètres
          </DialogTitle>
          <DialogDescription>Modifiez les paramètres du quiz.</DialogDescription>
        </DialogHeader>
        <QuizSettingsForm form={form} onChange={setForm} courses={[]} showCourseSelect={false} />
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
