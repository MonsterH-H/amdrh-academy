"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Video, FileText, GraduationCap, PlayCircle, FolderOpen, Download,
} from "lucide-react";
import {
  RESOURCE_TYPE_LABELS,
  RESOURCE_TYPE_COLORS,
  RESOURCE_CATEGORY_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ResourceData, formatFileSize } from "./lesson-item";

// ─── Resource Helpers ─────────────────────────────

function ResourceIcon({ type }: { type: string }) {
  switch (type) {
    case "VIDEO": return <Video className="w-5 h-5" />;
    case "PDF": return <FileText className="w-5 h-5" />;
    case "IMAGE": return <GraduationCap className="w-5 h-5" />;
    case "AUDIO": return <PlayCircle className="w-5 h-5" />;
    default: return <FolderOpen className="w-5 h-5" />;
  }
}

// ─── Resource Tab ─────────────────────────────────

interface ResourceTabProps {
  resources: ResourceData[];
  resourcesLoading: boolean;
  onDownload: (resourceId: string) => void;
}

export function ResourceTab({
  resources,
  resourcesLoading,
  onDownload,
}: ResourceTabProps) {
  if (resourcesLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-6 h-6 text-muted-foreground/60" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Aucune ressource</h3>
          <p className="text-sm text-muted-foreground">
            Ce cours n&apos;a pas encore de ressources téléchargeables.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {resources.map((resource) => (
        <Card key={resource.id} className="border-border/60 hover:border-primary/20 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                RESOURCE_TYPE_COLORS[resource.fileType] || "bg-muted text-muted-foreground",
              )}>
                <ResourceIcon type={resource.fileType} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-foreground truncate">{resource.title}</h4>
                  <Badge variant="secondary" className={cn("text-[10px] flex-shrink-0", RESOURCE_TYPE_COLORS[resource.fileType])}>
                    {RESOURCE_TYPE_LABELS[resource.fileType] || resource.fileType}
                  </Badge>
                  {resource.category && resource.category !== "AUTRE" && (
                    <Badge variant="outline" className="text-[10px] flex-shrink-0">
                      {RESOURCE_CATEGORY_LABELS[resource.category] || resource.category}
                    </Badge>
                  )}
                </div>
                {resource.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{resource.description}</p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>{formatFileSize(resource.fileSize)}</span>
                  <span>{resource.downloadCount} téléchargement{resource.downloadCount > 1 ? "s" : ""}</span>
                </div>
              </div>
              {resource.isDownloadable && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg flex-shrink-0 gap-1.5 text-xs"
                  onClick={() => onDownload(resource.id)}
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
