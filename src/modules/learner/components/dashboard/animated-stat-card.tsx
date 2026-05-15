"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function AnimatedNumber({
  value,
  duration = 1200,
  suffix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = null;
    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return <span>{display}{suffix}</span>;
}

interface AnimatedStatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  colorClass: string;
  bgColor: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function AnimatedStatCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  colorClass,
  bgColor,
  trend,
  trendValue,
}: AnimatedStatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up"
    ? "text-green-600 dark:text-green-400"
    : trend === "down"
      ? "text-red-600 dark:text-red-400"
      : "text-muted-foreground";

  return (
    <Card className="border-border/60 hover:shadow-sm transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", bgColor)}>
            <Icon className={cn("w-5 h-5", colorClass)} />
          </div>
          {trend && trendValue && (
            <div className={cn("flex items-center gap-0.5 text-[10px] font-medium", trendColor)}>
              <TrendIcon className="w-3 h-3" />
              {trendValue}
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground leading-tight">
          <AnimatedNumber value={value} suffix={suffix} />
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}
