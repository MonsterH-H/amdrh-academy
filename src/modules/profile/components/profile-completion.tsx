"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileCompleteness } from "../types/achievements";

interface ProfileCompletionProps {
  completeness: ProfileCompleteness | null;
}

function CircularProgress({ percentage }: { percentage: number }) {
  const radius = 36;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const color = percentage >= 80 ? "#10b981" : percentage >= 50 ? "#f59e0b" : percentage >= 25 ? "#f97316" : "#ef4444";

  return (
    <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        stroke="currentColor"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        className="text-muted/40"
      />
      {/* Progress circle */}
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

export function ProfileCompletionWidget({ completeness }: ProfileCompletionProps) {
  if (!completeness) return null;

  const cp = completeness.percentage || 0;
  const needsImprovement = cp < 80;

  return (
    <Card className="border-border/60">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-5">
          {/* Circular progress */}
          <div className="relative flex-shrink-0">
            <CircularProgress percentage={cp} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={cn(
                "text-lg font-bold",
                cp >= 80 ? "text-blue-600" : cp >= 50 ? "text-amber-600" : "text-orange-600",
              )}>
                {cp}%
              </span>
            </div>
          </div>

          {/* Checklist */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground mb-2.5">
              {cp >= 80 ? "Profil complet" : "Complétez votre profil"}
            </h4>
            <div className="space-y-1.5">
              {completeness.details.map((d) => (
                <div key={d.field} className="flex items-center gap-2">
                  {d.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
                  )}
                  <span className={cn(
                    "text-xs leading-tight",
                    d.done ? "text-muted-foreground" : "text-muted-foreground/50",
                  )}>
                    {d.field}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        {needsImprovement && (
          <div className="mt-4 pt-3 border-t border-border/40">
            <Button variant="outline" size="sm" className="w-full rounded-lg text-xs">
              Complétez votre profil <ArrowRight className="w-3 h-3 ml-1.5" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
