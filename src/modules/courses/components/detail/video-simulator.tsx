"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  CheckCircle2, Play, Pause, Check, Activity,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatTime } from "./lesson-item";

interface VideoSimulatorProps {
  lessonId: string;
  courseId: string;
  initialWatchPercentage: number;
  lessonDuration: number;
  isCompleted: boolean;
  onComplete: () => void;
  isEnrolled: boolean;
}

export function VideoSimulator({
  lessonId,
  courseId,
  initialWatchPercentage,
  lessonDuration,
  isCompleted,
  onComplete,
  isEnrolled,
}: VideoSimulatorProps) {
  const { user } = useAppStore();
  const [watchPercentage, setWatchPercentage] = useState(initialWatchPercentage);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(initialWatchPercentage);
  const [activitySaved, setActivitySaved] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(isCompleted);
  const sessionTimeRef = useRef(0);
  const watchPercentageRef = useRef(initialWatchPercentage);
  const isEnrolledRef = useRef(isEnrolled);

  const totalSeconds = lessonDuration * 60;
  const watchedSeconds = Math.round((watchPercentage / 100) * totalSeconds);

  const sendProgress = useCallback(async (wp: number, ts: number) => {
    if (!user || !isEnrolled || completedRef.current) return;
    try {
      const res = await fetch(`/api/courses/${courseId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          lessonId,
          watchPercentage: wp,
          timeSpent: ts,
          lastPosition: Math.round((wp / 100) * totalSeconds),
        }),
      });
      const data = await res.json();
      if (data.autoCompleted) {
        completedRef.current = true;
        setIsPlaying(false);
        onComplete();
        toast({
          title: "Leçon complétée automatiquement !",
          description: `Vidéo regardée à ${Math.round(wp)}%`,
        });
      }
      if (ts > 0) {
        setActivitySaved(true);
        setTimeout(() => setActivitySaved(false), 2000);
      }
    } catch {
      // silently fail
    }
  }, [user, courseId, lessonId, totalSeconds, onComplete, isEnrolled]);

  useEffect(() => {
    if (isPlaying) {
      heartbeatRef.current = setInterval(() => {
        setWatchPercentage((prev) => {
          const next = Math.min(prev + 2, 100);
          setSliderValue(next);
          sendProgress(next, 5);
          return next;
        });
      }, 5000);
      timerRef.current = setInterval(() => { setSessionTime((prev) => prev + 5); }, 5000);
    } else {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, sendProgress]);

  useEffect(() => {
    sessionTimeRef.current = sessionTime;
  }, [sessionTime]);

  useEffect(() => {
    watchPercentageRef.current = watchPercentage;
  }, [watchPercentage]);

  useEffect(() => {
    isEnrolledRef.current = isEnrolled;
  }, [isEnrolled]);

  useEffect(() => {
    return () => {
      if (sessionTimeRef.current > 0 && user && isEnrolledRef.current && !completedRef.current) {
        sendProgress(watchPercentageRef.current, sessionTimeRef.current);
      }
    };
  }, []);

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value[0]);
    setWatchPercentage(value[0]);
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-white">
          <div
            className="w-16 h-16 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-card/30 transition-colors"
            onClick={() => { if (!isCompleted) setIsPlaying(!isPlaying); }}
          >
            {isCompleted ? <Check className="w-8 h-8 text-green-400" />
              : isPlaying ? <Pause className="w-8 h-8" />
              : <Play className="w-8 h-8 ml-1" />}
          </div>
          <p className="text-sm text-white/80">
            {isCompleted ? "Leçon terminée" : isPlaying ? "Lecture en cours..." : "Cliquez pour simuler la lecture"}
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${watchPercentage}%` }} />
          </div>
        </div>
      </div>
      <div className="bg-muted/40 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={isCompleted} onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </Button>
            <div className="text-xs text-muted-foreground font-mono">
              {Math.floor(watchedSeconds / 60)}:{String(watchedSeconds % 60).padStart(2, "0")} / {lessonDuration}:00
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activitySaved && <span className="text-[10px] text-green-600 flex items-center gap-1 animate-fadeIn"><Activity className="w-3 h-3" /> Activité enregistrée</span>}
            {sessionTime > 0 && <span className="text-[10px] text-muted-foreground">Session: {formatTime(sessionTime)}</span>}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground font-medium">Marquer {sliderValue}% comme regardé</label>
            <span className="text-xs font-mono text-muted-foreground">{Math.round(sliderValue)}%</span>
          </div>
          <Slider value={[sliderValue]} max={100} step={1} disabled={isCompleted} onValueChange={handleSliderChange} className="w-full" />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span><span className="text-amber-600 font-medium">Auto-complétion à 90%</span><span>100%</span>
          </div>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4" /> <span>Leçon complétée</span>
          </div>
        )}
        {!isCompleted && <p className="text-[10px] text-muted-foreground">Complétion automatique à 90% de visionnage</p>}
      </div>
    </div>
  );
}
