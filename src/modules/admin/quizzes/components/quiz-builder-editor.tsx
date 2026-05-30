"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronUp, ChevronDown, CheckCircle2, XCircle, GripVertical,
  Plus, Trash2, Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QUESTION_TYPE_LABELS, QUESTION_TYPE_COLORS } from "@/lib/constants";

export interface QuizBuilderQuestion {
  _tempId: string;
  id?: string;
  type: string;
  text: string;
  options: string[];
  correctAnswer: number[];
  explanation: string;
  points: number;
  order: number;
}

// ─── Question Editor Card ─────────────────────────────────────────

export function QuestionEditorCard({
  question, index, total,
  onTypeChange, onTextChange, onPointsChange, onExplanationChange,
  onToggleCorrect, onOptionTextChange, onAddOption, onRemoveOption,
  onMoveUp, onMoveDown, onDuplicate, onRemove,
}: {
  question: QuizBuilderQuestion;
  index: number;
  total: number;
  onTypeChange: (type: string) => void;
  onTextChange: (text: string) => void;
  onPointsChange: (points: number) => void;
  onExplanationChange: (explanation: string) => void;
  onToggleCorrect: (optIdx: number) => void;
  onOptionTextChange: (optIdx: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (optIdx: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="border-border/60 overflow-hidden">
      <div className="flex items-center gap-2 p-3 bg-muted/30 border-b border-border/40">
        <GripVertical className="w-4 h-4 text-muted-foreground/40" />
        <button onClick={onMoveUp} disabled={index === 0}
          className="p-0.5 rounded hover:bg-muted disabled:opacity-30">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button onClick={onMoveDown} disabled={index === total - 1}
          className="p-0.5 rounded hover:bg-muted disabled:opacity-30">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-bold text-muted-foreground ml-1">Q{index + 1}</span>
        <Badge variant="secondary" className={cn("text-[9px]", QUESTION_TYPE_COLORS[question.type])}>
          {QUESTION_TYPE_LABELS[question.type]}
        </Badge>
        <Badge variant="outline" className="text-[9px]">{question.points} pt{question.points > 1 ? "s" : ""}</Badge>
        <span className="flex-1 text-xs text-muted-foreground truncate max-w-[200px]">
          {question.text || "Sans titre"}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={onDuplicate} className="p-1.5 rounded hover:bg-muted" title="Dupliquer">
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => setExpanded((e) => !e)} className="p-1.5 rounded hover:bg-muted" title="Plier">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {expanded
                ? <path d="M18 15l-6-6-6 6" />
                : <path d="M6 9l6 6 6-6" />}
            </svg>
          </button>
          <button onClick={onRemove}
            className="p-1.5 rounded hover:bg-red-50 dark:bg-red-500/10 text-muted-foreground hover:text-red-500" title="Supprimer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <CardContent className="p-4 space-y-3">
          {/* Type selector */}
          <div className="flex gap-2">
            {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
              <button key={key} onClick={() => onTypeChange(key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border flex-1 text-center",
                  question.type === key
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-muted-foreground border-border/60 hover:border-border"
                )}>
                {label}
              </button>
            ))}
          </div>

          {/* Question text */}
          <Textarea className="rounded-lg resize-none" rows={2}
            value={question.text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Écrivez votre question ici..." />

          {/* Options */}
          {question.type === "VRAI_FAUX" ? (
            <div className="flex gap-2">
              {question.options.map((opt, i) => (
                <button key={i} onClick={() => onToggleCorrect(i)}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all border",
                    question.correctAnswer.includes(i)
                      ? "bg-blue-50 dark:bg-blue-500/10 text-green-700 border-border"
                      : "bg-card text-muted-foreground border-border/60 hover:border-border"
                  )}>
                  {question.correctAnswer.includes(i) && "✓ "} {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Cliquez sur la lettre pour marquer la bonne réponse
                </span>
                {question.options.length < 8 && (
                  <Button variant="ghost" size="sm" onClick={onAddOption}
                    className="h-6 text-[10px] rounded-lg px-2">
                    <Plus className="w-3 h-3 mr-0.5" /> Option
                  </Button>
                )}
              </div>
              {question.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button type="button" onClick={() => onToggleCorrect(i)}
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all border-2",
                      question.correctAnswer.includes(i)
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-border bg-card hover:border-border"
                    )}>
                    {question.correctAnswer.includes(i)
                      ? <CheckCircle2 className="w-4 h-4" />
                      : <span className="text-[10px] font-bold text-muted-foreground">{String.fromCharCode(65 + i)}</span>}
                  </button>
                  <Input className="h-8 rounded-lg flex-1 text-sm" value={opt}
                    onChange={(e) => onOptionTextChange(i, e.target.value)}
                    placeholder={"Option " + String.fromCharCode(65 + i)} />
                  {question.options.length > 2 && (
                    <button onClick={() => onRemoveOption(i)}
                      className="p-1 rounded hover:bg-red-50 dark:bg-red-500/10 text-muted-foreground hover:text-red-500">
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Points + Explanation */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-medium">Points</Label>
              <Input type="number" min={1} className="h-8 rounded-lg w-20"
                value={question.points}
                onChange={(e) => onPointsChange(parseInt(e.target.value) || 1)} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-medium">Explication</Label>
              <Textarea className="rounded-lg resize-none h-8 text-[11px]" rows={1}
                value={question.explanation}
                onChange={(e) => onExplanationChange(e.target.value)}
                placeholder="Pourquoi cette réponse ?" />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
