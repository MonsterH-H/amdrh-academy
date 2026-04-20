"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Loader2,
  BookOpen,
} from "lucide-react";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/constants";
import type { SectionInput, LessonInput } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SectionEditor } from "./section-editor";

const emptyLesson = (): LessonInput => ({ title: "", type: "TEXTE", content: "", duration: 10 });
const emptySection = (): SectionInput => ({ title: "", lessons: [] });

export function CourseCreatePage() {
  const { user, navigate, goBack } = useAppStore();
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [duration, setDuration] = useState("");
  const [isCertifying, setIsCertifying] = useState(false);
  const [passingScore, setPassingScore] = useState("70");
  const [maxAttempts, setMaxAttempts] = useState("3");

  const [sections, setSections] = useState<SectionInput[]>([emptySection()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) newErrors.title = "Le titre doit contenir au moins 3 caractères";
    if (!description.trim() || description.trim().length < 10) newErrors.description = "La description doit contenir au moins 10 caractères";
    if (!category) newErrors.category = "Veuillez sélectionner une catégorie";
    if (!difficulty) newErrors.difficulty = "Veuillez sélectionner un niveau de difficulté";
    if (!duration || parseInt(duration) < 1) newErrors.duration = "La durée doit être d'au moins 1 minute";
    if (isCertifying && (!passingScore || parseInt(passingScore) < 50 || parseInt(passingScore) > 100))
      newErrors.passingScore = "Le score de réussite doit être entre 50 et 100";
    if (!maxAttempts || parseInt(maxAttempts) < 1 || parseInt(maxAttempts) > 10)
      newErrors.maxAttempts = "Le nombre de tentatives doit être entre 1 et 10";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    sections.forEach((section, idx) => {
      if (!section.title.trim()) newErrors[`section-${idx}-title`] = "Le titre de la section est requis";
      section.lessons.forEach((lesson, lIdx) => {
        if (!lesson.title.trim()) newErrors[`section-${idx}-lesson-${lIdx}-title`] = "Le titre de la leçon est requis";
        if (!lesson.duration || lesson.duration < 1) newErrors[`section-${idx}-lesson-${lIdx}-duration`] = "La durée doit être d'au moins 1 minute";
      });
    });
    if (sections.some((s) => s.lessons.length === 0)) newErrors["sections-empty"] = "Chaque section doit contenir au moins une leçon";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          difficulty,
          duration: parseInt(duration),
          isCertifying,
          passingScore: isCertifying ? parseInt(passingScore) : 70,
          maxAttempts: parseInt(maxAttempts),
          instructorId: user.id,
          sections: sections.map((s) => ({
            title: s.title.trim(),
            lessons: s.lessons.map((l) => ({
              title: l.title.trim(),
              type: l.type,
              content: l.content,
              duration: l.duration,
            })),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error || "Erreur lors de la création du cours", variant: "destructive" });
        return;
      }
      toast({ title: "Cours créé avec succès", description: `"${title}" a été créé en brouillon.` });
      navigate("course-detail", { id: data.course.id });
    } catch {
      toast({ title: "Erreur", description: "Une erreur réseau est survenue", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const addSection = () => setSections([...sections, emptySection()]);
  const removeSection = (idx: number) => { if (sections.length <= 1) return; setSections(sections.filter((_, i) => i !== idx)); };
  const updateSectionTitle = (idx: number, value: string) => { const updated = [...sections]; updated[idx] = { ...updated[idx], title: value }; setSections(updated); };
  const addLesson = (sectionIdx: number) => { const updated = [...sections]; updated[sectionIdx] = { ...updated[sectionIdx], lessons: [...updated[sectionIdx].lessons, emptyLesson()] }; setSections(updated); };
  const removeLesson = (sectionIdx: number, lessonIdx: number) => { const updated = [...sections]; updated[sectionIdx] = { ...updated[sectionIdx], lessons: updated[sectionIdx].lessons.filter((_, i) => i !== lessonIdx) }; setSections(updated); };
  const updateLesson = (sectionIdx: number, lessonIdx: number, field: keyof LessonInput, value: string | number) => { const updated = [...sections]; const lessons = [...updated[sectionIdx].lessons]; lessons[lessonIdx] = { ...lessons[lessonIdx], [field]: value }; updated[sectionIdx] = { ...updated[sectionIdx], lessons }; setSections(updated); };
  const clearError = (key: string) => setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="shrink-0" onClick={() => goBack()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-foreground">Créer un nouveau cours</h2>
          <p className="text-sm text-muted-foreground mt-1">Configurez votre cours en deux étapes</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[
          { num: 1, label: "Informations générales" },
          { num: 2, label: "Sections & Leçons" },
        ].map((s, idx) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => s.num < step && setStep(s.num as 1 | 2)}
              disabled={s.num > step}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full",
                step === s.num ? "bg-[#1D4ED8] text-white shadow-sm"
                  : step > s.num ? "bg-[#1D4ED8]/10 text-[#1D4ED8] cursor-pointer hover:bg-[#1D4ED8]/20"
                  : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
            >
              <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0", step >= s.num ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")}>
                {s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {idx < 1 && <div className="w-6 h-px bg-border shrink-0" />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#1D4ED8]" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="course-title" className="text-sm font-medium">Titre du cours <span className="text-red-500">*</span></Label>
              <Input id="course-title" placeholder="Ex: Règles fondamentales de l'arbitrage" value={title} onChange={(e) => { setTitle(e.target.value); clearError("title"); }} className={cn("rounded-lg", errors.title && "border-red-500 focus-visible:ring-red-500")} />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-desc" className="text-sm font-medium">Description <span className="text-red-500">*</span></Label>
              <Textarea id="course-desc" placeholder="Décrivez le contenu et les objectifs de ce cours..." value={description} onChange={(e) => { setDescription(e.target.value); clearError("description"); }} rows={4} className={cn("rounded-lg resize-none", errors.description && "border-red-500 focus-visible:ring-red-500")} />
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Catégorie <span className="text-red-500">*</span></Label>
                <Select value={category} onValueChange={(v) => { setCategory(v); clearError("category"); }}>
                  <SelectTrigger className={cn("rounded-lg", errors.category && "border-red-500")}><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (<SelectItem key={key} value={key}>{label}</SelectItem>))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Difficulté <span className="text-red-500">*</span></Label>
                <Select value={difficulty} onValueChange={(v) => { setDifficulty(v); clearError("difficulty"); }}>
                  <SelectTrigger className={cn("rounded-lg", errors.difficulty && "border-red-500")}><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DIFFICULTY_LABELS).map(([key, label]) => (<SelectItem key={key} value={key}>{label}</SelectItem>))}
                  </SelectContent>
                </Select>
                {errors.difficulty && <p className="text-xs text-red-500">{errors.difficulty}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-duration" className="text-sm font-medium">Durée totale (minutes) <span className="text-red-500">*</span></Label>
              <Input id="course-duration" type="number" min={1} placeholder="Ex: 120" value={duration} onChange={(e) => { setDuration(e.target.value); clearError("duration"); }} className={cn("w-full sm:w-48 rounded-lg", errors.duration && "border-red-500 focus-visible:ring-red-500")} />
              {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border/40">
              <div className="space-y-1">
                <Label htmlFor="cert-toggle" className="text-sm font-medium cursor-pointer">Cours certifiant</Label>
                <p className="text-xs text-muted-foreground">Les apprenants devront passer un quiz pour obtenir un certificat</p>
              </div>
              <Switch id="cert-toggle" checked={isCertifying} onCheckedChange={setIsCertifying} />
            </div>
            {isCertifying && (
              <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/5">
                <div className="space-y-2">
                  <Label htmlFor="passing-score" className="text-sm font-medium">Score de réussite (%)</Label>
                  <Input id="passing-score" type="number" min={50} max={100} value={passingScore} onChange={(e) => setPassingScore(e.target.value)} className={cn("rounded-lg", errors.passingScore && "border-red-500")} />
                  {errors.passingScore && <p className="text-xs text-red-500">{errors.passingScore}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-attempts" className="text-sm font-medium">Nombre max de tentatives</Label>
                  <Input id="max-attempts" type="number" min={1} max={10} value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} className={cn("rounded-lg", errors.maxAttempts && "border-red-500")} />
                  {errors.maxAttempts && <p className="text-xs text-red-500">{errors.maxAttempts}</p>}
                </div>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button onClick={() => { if (validateStep1()) setStep(2); }} className="bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 rounded-lg">
                Continuer <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Sections & Lessons */}
      {step === 2 && (
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1D4ED8]" />
                Sections & Leçons
              </CardTitle>
              <Button variant="outline" size="sm" onClick={addSection} className="rounded-lg text-[#1D4ED8] border-[#1D4ED8]/30 hover:bg-[#1D4ED8]/10">
                <Plus className="w-4 h-4 mr-1" /> Ajouter une section
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Organisez votre cours en sections et leçons</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {errors["sections-empty"] && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{errors["sections-empty"]}</div>
            )}
            {sections.map((section, sectionIdx) => (
              <SectionEditor
                key={sectionIdx}
                sectionIdx={sectionIdx}
                section={section}
                totalSections={sections.length}
                errors={errors}
                onUpdateTitle={updateSectionTitle}
                onRemoveSection={removeSection}
                onAddLesson={addLesson}
                onRemoveLesson={removeLesson}
                onUpdateLesson={updateLesson}
                onClearError={clearError}
              />
            ))}
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="rounded-lg">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
              </Button>
              <Button onClick={() => { if (validateStep2()) handleSubmit(); }} disabled={submitting} className="bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 rounded-lg min-w-[160px]">
                {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Création...</>) : "Créer le cours"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
