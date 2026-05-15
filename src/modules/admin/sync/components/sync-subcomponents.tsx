import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsCard({ icon: Icon, label, value, color, bg }: { icon: typeof Activity; label: string; value: string | number; color: string; bg: string }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-3 flex items-center gap-3">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", bg)}>
          <Icon className={cn("w-4 h-4", color)} />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
