"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CheckCircle2, XCircle } from "lucide-react";
import { QUESTION_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface QuestionFormState {
  type: string;
  text: string;
  options: string[];
  correctAnswer: number[];
  explanation: string;
  points: string;
}

export const defaultQuestionForm = (): QuestionFormState => ({
  type: "QCM_SIMPLE", text: "", options: ["", ""],
  correctAnswer: [], explanation: "", points: "1",
});

export function QuestionFormFields({
  form, setForm, error,
}: {
  form: QuestionFormState;
  setForm: React.Dispatch<React.SetStateAction<QuestionFormState>>;
  error: string;
}) {
  const addOption = () => {
    if (form.options.length < 8) setForm((f) => ({ ...f, options: [...f.options, ""] }));
  };

  const removeOption = (index: number) => {
    setForm((f) => ({
      ...f,
      options: f.options.filter((_, i) => i !== index),
      correctAnswer: f.correctAnswer.filter((i) => i !== index).map((i) => i > index ? i - 1 : i),
    }));
  };

  const toggleCorrect = (index: number) => {
    setForm((f) => {
      if (f.type === "QCM_SIMPLE") return { ...f, correctAnswer: [index] };
      return {
        ...f,
        correctAnswer: f.correctAnswer.includes(index)
          ? f.correctAnswer.filter((i) => i !== index)
          : [...f.correctAnswer, index],
      };
    });
  };

  return (
    <>
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
              <button key={key} onClick={() => setForm((f) => ({ ...f, type: key }))}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-medium transition-all border flex-1 text-center",
                  form.type === key
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
          <Textarea className="rounded-lg resize-none" rows={3}
            value={form.text}
            onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            placeholder="Écrivez votre question ici..."
          />
        </div>

        {/* Options (non VRAI_FAUX) */}
        {form.type !== "VRAI_FAUX" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">
                Options * <span className="text-muted-foreground font-normal">(cliquez pour marquer la bonne réponse)</span>
              </Label>
              {form.options.length < 8 && (
                <Button variant="ghost" size="sm" onClick={addOption} className="h-7 text-xs rounded-lg">
                  <Plus className="w-3 h-3 mr-1" /> Option
                </Button>
              )}
            </div>
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button type="button" onClick={() => toggleCorrect(i)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all border-2",
                    form.correctAnswer.includes(i)
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-border bg-white hover:border-green-300"
                  )}
                >
                  {form.correctAnswer.includes(i)
                    ? <CheckCircle2 className="w-4 h-4" />
                    : <span className="text-xs text-muted-foreground font-bold">{String.fromCharCode(65 + i)}</span>
                  }
                </button>
                <Input className="h-9 rounded-lg flex-1 text-sm"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...form.options];
                    newOpts[i] = e.target.value;
                    setForm((f) => ({ ...f, options: newOpts }));
                  }}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                />
                {form.options.length > 2 && (
                  <button onClick={() => removeOption(i)}
                    className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VRAI_FAUX toggle */}
        {form.type === "VRAI_FAUX" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Réponse correcte *</Label>
            <div className="flex gap-2">
              {form.options.map((opt, i) => (
                <button key={i} onClick={() => setForm((f) => ({ ...f, correctAnswer: [i] }))}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border",
                    form.correctAnswer.includes(i)
                      ? "bg-green-100 text-green-700 border-green-300"
                      : "bg-white text-muted-foreground border-border/60 hover:border-border"
                  )}
                >
                  {form.correctAnswer.includes(i) && "✓ "} {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Points + Explanation */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Points</Label>
          <Input type="number" min={1} className="h-10 rounded-lg w-24"
            value={form.points}
            onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Explication</Label>
          <Textarea className="rounded-lg resize-none" rows={2}
            value={form.explanation}
            onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
            placeholder="Expliquez pourquoi cette réponse est correcte..."
          />
        </div>
      </div>
    </>
  );
}
