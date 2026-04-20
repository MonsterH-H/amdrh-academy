"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { QuestionFormFields, defaultQuestionForm, type QuestionFormState } from "./question-form-fields";
import type { QuestionItem } from "../types";

export { QuestionFormFields, defaultQuestionForm, type QuestionFormState } from "./question-form-fields";

export function AddQuestionDialog({
  quizId, open, onOpenChange, onCreated,
}: {
  quizId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<QuestionFormState>(defaultQuestionForm());

  useEffect(() => {
    if (form.type === "VRAI_FAUX") {
      setForm((f) => ({ ...f, options: ["Vrai", "Faux"], correctAnswer: [] }));
    } else if (form.options.length === 2 && form.options[0] === "Vrai") {
      setForm((f) => ({ ...f, options: ["", ""], correctAnswer: [] }));
    }
  }, [form.type]);

  const handleSubmit = async () => {
    setError("");
    if (!form.text.trim()) { setError("Le texte de la question est requis"); return; }
    const filled = form.options.filter((o) => o.trim());
    if (filled.length < 2) { setError("Au moins 2 options sont requises"); return; }
    if (form.correctAnswer.length === 0) { setError("Sélectionnez au moins une réponse correcte"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: form.text, type: form.type, options: filled,
          correctAnswer: form.correctAnswer, explanation: form.explanation || null,
          points: parseInt(form.points) || 1,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la création"); return;
      }
      toast({ title: "Question ajoutée" });
      setForm(defaultQuestionForm());
      onCreated();
    } catch { setError("Erreur serveur"); } finally { setLoading(false); }
  };

  return (
    <Dialog open={!!open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Ajouter une question
          </DialogTitle>
          <DialogDescription>Remplissez les informations de la question.</DialogDescription>
        </DialogHeader>
        <QuestionFormFields form={form} setForm={setForm} error={error} />
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Ajouter la question
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditQuestionDialog({
  quizId, questionId, onOpenChange, questions, onUpdated,
}: {
  quizId: string;
  questionId: string | null;
  onOpenChange: (id: string | null) => void;
  questions: QuestionItem[];
  onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<QuestionFormState>(defaultQuestionForm());

  useEffect(() => {
    if (!questionId) return;
    const q = questions.find((qu) => qu.id === questionId);
    if (!q) return;
    let opts: string[] = [];
    let ca: number[] = [];
    try { opts = JSON.parse(q.options); } catch { opts = []; }
    try { ca = JSON.parse(q.correctAnswer); } catch { ca = []; }
    setForm({
      type: q.type, text: q.text, options: opts,
      correctAnswer: ca, explanation: q.explanation || "",
      points: String(q.points),
    });
  }, [questionId, questions]);

  const handleSubmit = async () => {
    setError("");
    if (!form.text.trim()) { setError("Le texte de la question est requis"); return; }
    const filled = form.options.filter((o) => o.trim());
    if (filled.length < 2) { setError("Au moins 2 options sont requises"); return; }
    if (form.correctAnswer.length === 0) { setError("Sélectionnez au moins une réponse correcte"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}/questions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId, text: form.text, type: form.type, options: filled,
          correctAnswer: form.correctAnswer, explanation: form.explanation || null,
          points: parseInt(form.points) || 1,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la modification"); return;
      }
      toast({ title: "Question modifiée" });
      onUpdated();
    } catch { setError("Erreur serveur"); } finally { setLoading(false); }
  };

  if (!questionId) return null;

  return (
    <Dialog open={!!questionId} onOpenChange={() => onOpenChange(null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" /> Modifier la question
          </DialogTitle>
          <DialogDescription>Modifiez les informations de la question.</DialogDescription>
        </DialogHeader>
        <QuestionFormFields form={form} setForm={setForm} error={error} />
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(null)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
