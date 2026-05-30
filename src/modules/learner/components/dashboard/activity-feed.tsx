"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Trophy,
  BookOpen,
  HelpCircle,
  Award,
  Star,
  CalendarClock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTimestampAgo } from "@/utils/format";

export interface ActivityFeedItem {
  id: string;
  type: "lesson_completed" | "quiz_passed" | "quiz_failed" | "certificate_earned" | "badge_earned" | "enrollment" | "course_completed";
  title: string;
  description: string;
  timestamp: number;
}

const ACTIVITY_ICONS: Record<ActivityFeedItem["type"], { icon: typeof CheckCircle; colorClass: string; bgClass: string }> = {
  lesson_completed: { icon: BookOpen, colorClass: "text-blue-600 dark:text-blue-400", bgClass: "bg-blue-50 dark:bg-blue-500/10" },
  quiz_passed: { icon: Trophy, colorClass: "text-amber-600 dark:text-amber-400", bgClass: "bg-amber-50 dark:bg-amber-500/10" },
  quiz_failed: { icon: HelpCircle, colorClass: "text-red-500 dark:text-red-400", bgClass: "bg-red-50 dark:bg-red-500/10" },
  certificate_earned: { icon: Award, colorClass: "text-violet-600 dark:text-violet-400", bgClass: "bg-violet-50 dark:bg-violet-500/10" },
  badge_earned: { icon: Star, colorClass: "text-amber-500 dark:text-amber-400", bgClass: "bg-amber-50 dark:bg-amber-500/10" },
  enrollment: { icon: BookOpen, colorClass: "text-blue-600 dark:text-blue-400", bgClass: "bg-primary/5 dark:bg-primary/5" },
  course_completed: { icon: CheckCircle, colorClass: "text-green-600 dark:text-green-400", bgClass: "bg-green-50 dark:bg-green-500/10" },
};

export function ActivityFeedSection({
  items,
}: {
  items: ActivityFeedItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Activité récente</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Vos dernières actions
          </p>
        </div>
        <CalendarClock className="w-4 h-4 text-muted-foreground" />
      </div>

      <Card className="border-border/50">
        <CardContent className="p-2">
          <div className="space-y-0">
            {items.slice(0, 5).map((item, index) => (
              <ActivityFeedRow key={item.id} item={item} isLast={index === Math.min(items.length, 5) - 1} />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function ActivityFeedRow({
  item,
  isLast,
}: {
  item: ActivityFeedItem;
  isLast: boolean;
}) {
  const config = ACTIVITY_ICONS[item.type] || ACTIVITY_ICONS.enrollment;
  const Icon = config.icon;
  const timeAgo = formatTimestampAgo(item.timestamp);

  return (
    <div className="relative flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors group">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[22px] top-11 bottom-0 w-px bg-border/50" />
      )}

      {/* Icon */}
      <div className={cn(
        "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 z-10 border border-border/30 shadow-sm",
        config.bgClass
      )}>
        <Icon className={cn("w-5 h-5", config.colorClass)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-medium text-foreground leading-snug">
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {item.description}
        </p>
        <p className="text-[11px] text-muted-foreground/60 mt-1 font-medium">
          {timeAgo}
        </p>
      </div>
    </div>
  );
}

export function ActivityFeedEmpty() {
  return (
    <Card className="border-border/50">
      <CardContent className="py-12 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <CalendarClock className="w-6 h-6 text-muted-foreground/60" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">Aucune activité récente</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Commencez un cours pour voir votre activité ici
        </p>
      </CardContent>
    </Card>
  );
}
