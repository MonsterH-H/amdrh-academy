"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/app";
import {
  Video, FileText, MousePointerClick, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { formatTime } from "./lesson-item";

// ─── Lesson Type Placeholder ─────────────────────

export function LessonTypePlaceholder({ type }: { type: string }) {
  switch (type) {
    case "VIDEO":
      return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
            <Video className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Contenu vidéo</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            La vidéo de cette leçon sera bientôt disponible. Consultez le contenu textuel en attendant.
          </p>
        </div>
      );
    case "PDF":
      return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Document PDF</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Le document PDF associé à cette leçon sera disponible prochainement.
          </p>
        </div>
      );
    case "INTERACTIF":
      return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
            <MousePointerClick className="w-10 h-10 text-amber-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Exercice interactif</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Un exercice interactif sera bientôt proposé pour cette leçon. Il vous permettra de pratiquer les concepts abordés.
          </p>
        </div>
      );
    default:
      return null;
  }
}

// ─── Text Reader with Scroll Tracking ─────────────

interface TextReaderProps {
  content: string;
  lessonId: string;
  courseId: string;
  initialScrollPercentage: number;
  isCompleted: boolean;
  onComplete: () => void;
  isEnrolled: boolean;
}

export function TextReaderWithTracking({
  content,
  lessonId,
  courseId,
  initialScrollPercentage,
  isCompleted,
  onComplete,
  isEnrolled,
}: TextReaderProps) {
  const { user } = useAppStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollPercentage, setScrollPercentage] = useState(initialScrollPercentage);
  const [sessionTime, setSessionTime] = useState(0);
  const [locallyCompleted, setLocallyCompleted] = useState(isCompleted);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(isCompleted);
  const sessionTimeRef = useRef(0);
  const scrollRef = useRef(0);
  const isEnrolledRef = useRef(isEnrolled);

  const sendProgress = useCallback(async (sp: number, ts: number) => {
    if (!user || !isEnrolled || completedRef.current) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, lessonId, scrollPercentage: sp, timeSpent: ts }),
      });
      const data = await res.json();
      if (data.autoCompleted) {
        completedRef.current = true;
        setLocallyCompleted(true);
        onComplete();
        toast({ title: "Leçon complétée automatiquement !", description: `Texte lu à ${Math.round(sp)}%` });
      }
    } catch {
      // silently fail
    }
  }, [user, courseId, lessonId, onComplete, isEnrolled]);

  useEffect(() => {
    if (!contentRef.current || locallyCompleted || !isEnrolled) return;
    const el = contentRef.current;
    const handleScroll = () => {
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight > 0) {
        setScrollPercentage(Math.min(Math.round((el.scrollTop / scrollHeight) * 100), 100));
      }
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [isCompleted, isEnrolled, locallyCompleted]);

  useEffect(() => {
    if (!isEnrolled || locallyCompleted) return;
    heartbeatRef.current = setInterval(() => { sendProgress(scrollPercentage, 10); }, 10000);
    timerRef.current = setInterval(() => { setSessionTime((prev) => prev + 10); }, 10000);
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isEnrolled, scrollPercentage, sendProgress]);

  useEffect(() => {
    sessionTimeRef.current = sessionTime;
  }, [sessionTime]);

  useEffect(() => {
    scrollRef.current = scrollPercentage;
  }, [scrollPercentage]);

  useEffect(() => {
    isEnrolledRef.current = isEnrolled;
  }, [isEnrolled]);

  useEffect(() => {
    return () => {
      if (sessionTimeRef.current > 0 && user && isEnrolledRef.current && !completedRef.current) {
        sendProgress(scrollRef.current, sessionTimeRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div ref={contentRef} className="max-h-[400px] overflow-y-auto pr-2 scroll-smooth" style={{ scrollbarWidth: "thin" }}>
        <div className="prose prose-sm max-w-none">
          {content.split("\n").map((paragraph, idx) => {
            if (!paragraph.trim()) return <div key={idx} className="h-3" />;
            return <p key={idx} className="text-sm text-foreground/90 leading-relaxed mb-3">{paragraph}</p>;
          })}
        </div>
      </div>
      <div className="flex items-center gap-3 bg-muted/40 rounded-lg px-3 py-2.5">
        <Eye className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">
              {locallyCompleted
                ? `Lecture terminée (${Math.round(scrollPercentage)}%)`
                : `Lecture: ${Math.round(scrollPercentage)}% — Continuez à faire défiler pour compléter`}
            </span>
            {sessionTime > 0 && <span className="text-[10px] text-muted-foreground">{formatTime(sessionTime)}</span>}
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-300", scrollPercentage >= 95 ? "bg-green-500" : "bg-primary")} style={{ width: `${scrollPercentage}%` }} />
          </div>
        </div>
      </div>
      {!locallyCompleted && <p className="text-[10px] text-muted-foreground text-center">Complétion automatique à 95% de lecture</p>}
    </div>
  );
}
