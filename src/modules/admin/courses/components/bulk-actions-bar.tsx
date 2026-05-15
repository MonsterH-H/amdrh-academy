"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Archive, Globe, FileText, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface BulkActionsBarProps {
  selectedIds: string[];
  totalCount: number;
  onToggleAll: (checked: boolean) => void;
  onClearSelection: () => void;
  onBulkAction: (action: string, ids: string[]) => Promise<void>;
}

export function BulkActionsBar({
  selectedIds, totalCount, onToggleAll, onClearSelection, onBulkAction,
}: BulkActionsBarProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  if (selectedIds.length === 0) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/30">
        <Checkbox
          checked={false}
          onCheckedChange={(checked) => onToggleAll(checked === true)}
          className="rounded"
        />
        <span className="text-xs text-muted-foreground">
          Sélectionner tout ({totalCount})
        </span>
      </div>
    );
  }

  const allSelected = selectedIds.length === totalCount;

  const handleAction = async (action: string) => {
    setLoading(action);
    try {
      await onBulkAction(action, selectedIds);
    } catch {
      toast({ title: "Erreur", description: "Action échouée", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const actions = [
    { key: "PUBLIE", label: "Publier", icon: Globe, className: "text-green-600 hover:text-green-700 hover:bg-emerald-50 dark:bg-emerald-500/10" },
    { key: "BROUILLON", label: "Brouillon", icon: FileText, className: "text-muted-foreground hover:text-foreground hover:bg-muted" },
    { key: "ARCHIVE", label: "Archiver", icon: Archive, className: "text-red-500 hover:text-red-600 hover:bg-red-50 dark:bg-red-500/10" },
  ];

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-[#1D4ED8]/30 bg-[#1D4ED8]/5 animate-fadeIn">
      <Checkbox
        checked={allSelected}
        onCheckedChange={(checked) => onToggleAll(checked !== true)}
        className="rounded"
      />
      <span className="text-sm font-medium text-[#1D4ED8]">
        {selectedIds.length} sélectionné{selectedIds.length > 1 ? "s" : ""}
      </span>
      <div className="h-4 w-px bg-[#1D4ED8]/20" />
      {actions.map((action) => (
        <Button
          key={action.key}
          variant="ghost"
          size="sm"
          disabled={loading !== null}
          onClick={() => handleAction(action.key)}
          className={cn("rounded-lg h-7 text-xs gap-1.5", action.className)}
        >
          {loading === action.key ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <action.icon className="w-3 h-3" />
          )}
          {action.label}
        </Button>
      ))}
      <div className="flex-1" />
      <button
        onClick={onClearSelection}
        className="p-1 rounded hover:bg-[#1D4ED8]/10 text-[#1D4ED8]/60 hover:text-[#1D4ED8] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
