"use client";

import { useState, useCallback } from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

function getStreakKey(): string {
  return "amdrh-streak-data";
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
}

function loadStreakData(): StreakData {
  if (typeof window === "undefined") {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: "" };
  }
  try {
    const raw = localStorage.getItem(getStreakKey());
    if (raw) return JSON.parse(raw) as StreakData;
  } catch { /* empty */ }
  return { currentStreak: 0, longestStreak: 0, lastActivityDate: "" };
}

function saveStreakData(data: StreakData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStreakKey(), JSON.stringify(data));
  } catch { /* empty */ }
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(dateStr: string): boolean {
  if (!dateStr) return false;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateStr === yesterday.toISOString().slice(0, 10);
}

function updateStreak(): StreakData {
  const data = loadStreakData();
  const today = getTodayStr();

  if (data.lastActivityDate === today) return data;

  let newStreak = data.currentStreak;
  if (isYesterday(data.lastActivityDate)) {
    newStreak += 1;
  } else if (data.lastActivityDate !== today) {
    newStreak = 1;
  }

  const updated: StreakData = {
    currentStreak: newStreak,
    longestStreak: Math.max(data.longestStreak, newStreak),
    lastActivityDate: today,
  };
  saveStreakData(updated);
  return updated;
}

export function recordActivity() {
  updateStreak();
}

function getInitialStreak(): StreakData {
  if (typeof window !== "undefined") {
    return loadStreakData();
  }
  return { currentStreak: 0, longestStreak: 0, lastActivityDate: "" };
}

export function useStreak(): StreakData & { recordToday: () => void } {
  const [streak, setStreak] = useState<StreakData>(getInitialStreak);

  const recordToday = useCallback(() => {
    const updated = updateStreak();
    setStreak(updated);
  }, []);

  return { ...streak, recordToday };
}

export function StreakCounter() {
  const { currentStreak, longestStreak } = useStreak();
  const active = currentStreak >= 1;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300",
      active
        ? "bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-orange-200/60 dark:from-orange-950/30 dark:via-amber-950/30 dark:to-orange-950/30 dark:border-orange-800/40"
        : "bg-muted/30 border-border/60"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        active
          ? "bg-gradient-to-br from-orange-400 to-amber-500 shadow-md shadow-orange-200/50 dark:shadow-orange-900/30"
          : "bg-muted"
      )}>
        <Flame className={cn("w-5 h-5", active ? "text-white" : "text-muted-foreground")} />
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn("text-xl font-bold", active ? "text-orange-700 dark:text-orange-400" : "text-muted-foreground")}>
            {currentStreak}
          </span>
          <span className="text-xs text-muted-foreground">
            jour{currentStreak > 1 ? "s" : ""} consécutif{currentStreak > 1 ? "s" : ""}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Record : {longestStreak} jour{longestStreak > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
