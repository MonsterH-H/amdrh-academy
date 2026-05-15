"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Plus, HelpCircle, ExternalLink } from "lucide-react";

interface CourseEditorQuizProps {
  courseId?: string;
  hasQuiz: boolean;
  quizId?: string;
  onLinkQuiz?: (quizId: string) => void;
  onNavigateQuiz?: () => void;
}

export function CourseEditorQuiz({
  courseId, hasQuiz, quizId, onNavigateQuiz,
}: CourseEditorQuizProps) {
  if (hasQuiz && quizId) {
    return (
      <div className="space-y-4">
        <Card className="border-emerald-200/60 bg-emerald-50/30 dark:bg-emerald-500/10">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-foreground">Quiz lié</h4>
                  <Badge className="bg-green-100 text-green-700 text-[10px]">Actif</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Un quiz d&apos;évaluation est lié à ce cours. Les apprenants devront le réussir pour obtenir leur certificat.
                </p>
                {onNavigateQuiz && (
                  <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={onNavigateQuiz}>
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Gérer le quiz
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Quiz d&apos;évaluation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
              <HelpCircle className="w-8 h-8 text-amber-400" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Aucun quiz lié</h4>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Créez un quiz d&apos;évaluation pour permettre aux apprenants de valider leurs connaissances.
              Le quiz peut être créé et géré depuis la section Quiz de l&apos;administration.
            </p>
            <div className="flex gap-3">
              {!courseId && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Enregistrez d&apos;abord le cours pour lier un quiz
                </p>
              )}
              {courseId && onNavigateQuiz && (
                <Button variant="outline" className="rounded-lg" onClick={onNavigateQuiz}>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Créer un quiz
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
