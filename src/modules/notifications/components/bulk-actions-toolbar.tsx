"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCheck,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  loading: boolean;
  onToggleSelectAll: () => void;
  onMarkSelectedRead: () => void;
  onDeleteSelected: () => void;
  onCancelSelection: () => void;
}

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  allSelected,
  loading,
  onToggleSelectAll,
  onMarkSelectedRead,
  onDeleteSelected,
  onCancelSelection,
}: BulkActionsToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 p-3 rounded-xl border border-border/60 bg-muted/40 animate-fadeIn",
      )}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={allSelected}
          onCheckedChange={onToggleSelectAll}
          className="mt-0.5"
        />
        <span className="text-sm text-foreground font-medium">
          {allSelected
            ? `${totalCount} sélectionnée${totalCount > 1 ? "s" : ""}`
            : `${selectedCount} sélectionnée${selectedCount > 1 ? "s" : ""}`}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs rounded-lg h-8"
          onClick={onMarkSelectedRead}
          disabled={loading || selectedCount === 0}
        >
          {loading ? (
            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
          ) : (
            <CheckCheck className="w-3 h-3 mr-1.5" />
          )}
          Marquer comme lu
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-xs rounded-lg h-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          onClick={onDeleteSelected}
          disabled={loading || selectedCount === 0}
        >
          <Trash2 className="w-3 h-3 mr-1.5" />
          Supprimer
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs rounded-lg h-8"
          onClick={onCancelSelection}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
