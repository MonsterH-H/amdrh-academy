"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { BookOpen, ImageIcon } from "lucide-react";
import {
  CATEGORY_LABELS, DIFFICULTY_LABELS, COURSE_STATUS_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface CourseGeneralForm {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  coverImage: string;
  duration: string;
  isCertifying: boolean;
  passingScore: string;
  maxAttempts: string;
  status: string;
}

export const defaultGeneralForm = (): CourseGeneralForm => ({
  title: "",
  description: "",
  category: "",
  difficulty: "",
  coverImage: "",
  duration: "",
  isCertifying: false,
  passingScore: "70",
  maxAttempts: "3",
  status: "BROUILLON",
});

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface CourseEditorGeneralProps {
  form: CourseGeneralForm;
  onChange: (form: CourseGeneralForm) => void;
  errors: Record<string, string>;
  clearError: (key: string) => void;
  isEdit: boolean;
  slugPreview: string;
}

export function CourseEditorGeneral({
  form, onChange, errors, clearError, isEdit, slugPreview,
}: CourseEditorGeneralProps) {
  const set = <K extends keyof CourseGeneralForm>(key: K, val: CourseGeneralForm[K]) => {
    onChange({ ...form, [key]: val });
    clearError(key);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#1D4ED8]" />
            Informations générales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="ed-title" className="text-sm font-medium">
              Titre du cours <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ed-title"
              placeholder="Ex: Règles fondamentales de l'arbitrage"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={cn("rounded-lg", errors.title && "border-red-500 focus-visible:ring-red-500")}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            {slugPreview && (
              <p className="text-xs text-muted-foreground truncate">
                Slug : <span className="font-mono bg-muted px-1 rounded">{slugPreview}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="ed-desc" className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="ed-desc"
              placeholder="Décrivez le contenu et les objectifs de ce cours..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className={cn("rounded-lg resize-none", errors.description && "border-red-500 focus-visible:ring-red-500")}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Category & Difficulty */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Catégorie <span className="text-red-500">*</span></Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger className={cn("rounded-lg", errors.category && "border-red-500")}>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([k, l]) => (
                    <SelectItem key={k} value={k}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Difficulté <span className="text-red-500">*</span></Label>
              <Select value={form.difficulty} onValueChange={(v) => set("difficulty", v)}>
                <SelectTrigger className={cn("rounded-lg", errors.difficulty && "border-red-500")}>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DIFFICULTY_LABELS).map(([k, l]) => (
                    <SelectItem key={k} value={k}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.difficulty && <p className="text-xs text-red-500">{errors.difficulty}</p>}
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="ed-cover" className="text-sm font-medium flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Image de couverture (URL)
            </Label>
            <Input
              id="ed-cover"
              placeholder="https://example.com/image.jpg"
              value={form.coverImage}
              onChange={(e) => set("coverImage", e.target.value)}
              className="rounded-lg"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="ed-duration" className="text-sm font-medium">
              Durée totale (minutes)
            </Label>
            <Input
              id="ed-duration"
              type="number"
              min={1}
              placeholder="Ex: 120"
              value={form.duration}
              onChange={(e) => set("duration", e.target.value)}
              className={cn("w-full sm:w-48 rounded-lg", errors.duration && "border-red-500 focus-visible:ring-red-500")}
            />
            {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Certification & Status */}
      <Card className="border-border/60">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/40">
            <div className="space-y-1">
              <Label htmlFor="ed-cert" className="text-sm font-medium cursor-pointer">Cours certifiant</Label>
              <p className="text-xs text-muted-foreground">Les apprenants devront passer un quiz pour obtenir un certificat</p>
            </div>
            <Switch id="ed-cert" checked={form.isCertifying} onCheckedChange={(v) => onChange({ ...form, isCertifying: v })} />
          </div>
          {form.isCertifying && (
            <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg border border-amber-300/30 bg-amber-50/50 dark:bg-amber-500/10">
              <div className="space-y-2">
                <Label htmlFor="ed-pass" className="text-sm font-medium">Score de réussite (%)</Label>
                <Input id="ed-pass" type="number" min={50} max={100} value={form.passingScore} onChange={(e) => onChange({ ...form, passingScore: e.target.value })} className={cn("rounded-lg", errors.passingScore && "border-red-500")} />
                {errors.passingScore && <p className="text-xs text-red-500">{errors.passingScore}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ed-max" className="text-sm font-medium">Nombre max de tentatives</Label>
                <Input id="ed-max" type="number" min={1} max={10} value={form.maxAttempts} onChange={(e) => onChange({ ...form, maxAttempts: e.target.value })} className={cn("rounded-lg", errors.maxAttempts && "border-red-500")} />
                {errors.maxAttempts && <p className="text-xs text-red-500">{errors.maxAttempts}</p>}
              </div>
            </div>
          )}
          {isEdit && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Statut</Label>
              <Select value={form.status} onValueChange={(v) => onChange({ ...form, status: v })}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(COURSE_STATUS_LABELS).map(([k, l]) => (
                    <SelectItem key={k} value={k}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
