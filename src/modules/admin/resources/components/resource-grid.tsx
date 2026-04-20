"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Download, Edit3, Trash2, Link2, MoreVertical } from "lucide-react";
import {
  RESOURCE_TYPE_LABELS,
  RESOURCE_TYPE_COLORS,
  RESOURCE_CATEGORY_LABELS,
  RESOURCE_CATEGORY_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ResourceItem } from "../types";
import { ResourceTypeIcon, formatFileSize, formatRelativeTime } from "../types";

// ────────────────────────────────────────────
// Resource Card (Grid View)
// ────────────────────────────────────────────

export function ResourceCard({
  resource,
  onDownload,
  onEdit,
  onDelete,
}: {
  resource: ResourceItem;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="border-border/60 hover:border-border/90 hover:shadow-sm transition-all group">
      <CardContent className="p-4 flex flex-col h-full">
        {/* Top: icon + actions */}
        <div className="flex items-start justify-between mb-3">
          <div
            className={cn(
              "p-2.5 rounded-lg",
              RESOURCE_TYPE_COLORS[resource.type]
            )}
          >
            <ResourceTypeIcon
              type={resource.type}
              className="w-5 h-5"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-lg opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {resource.isDownloadable && (
                <DropdownMenuItem onClick={onDownload} className="cursor-pointer">
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                <Edit3 className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title + Description */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold text-foreground truncate"
            title={resource.title}
          >
            {resource.title}
          </h3>
          {resource.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {resource.description}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <Badge
            variant="secondary"
            className={cn("text-[10px]", RESOURCE_TYPE_COLORS[resource.type])}
          >
            {RESOURCE_TYPE_LABELS[resource.type] || resource.type}
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px]",
              RESOURCE_CATEGORY_COLORS[resource.category]
            )}
          >
            {RESOURCE_CATEGORY_LABELS[resource.category] || resource.category}
          </Badge>
        </div>

        {/* Course link */}
        {resource.course && (
          <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
            <Link2 className="w-3 h-3" />
            <span className="truncate">{resource.course.title}</span>
          </div>
        )}

        {/* Footer: meta info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground">
              {formatFileSize(resource.fileSize)}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatRelativeTime(resource.createdAt)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Download className="w-3 h-3" />
            {resource.downloadCount}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ────────────────────────────────────────────
// Resource Row (List / Table View)
// ────────────────────────────────────────────

export function ResourceRow({
  resource,
  onDownload,
  onEdit,
  onDelete,
}: {
  resource: ResourceItem;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="hover:bg-muted/30 transition-colors group">
      {/* Resource info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "p-2 rounded-lg flex-shrink-0",
              RESOURCE_TYPE_COLORS[resource.type]
            )}
          >
            <ResourceTypeIcon
              type={resource.type}
              className="w-4 h-4"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {resource.title}
            </p>
            {resource.description && (
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                {resource.description}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {resource.uploader
                ? `${resource.uploader.prenom} ${resource.uploader.nom}`
                : "Inconnu"}
            </p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3 hidden md:table-cell">
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px]",
            RESOURCE_CATEGORY_COLORS[resource.category]
          )}
        >
          {RESOURCE_CATEGORY_LABELS[resource.category] || resource.category}
        </Badge>
      </td>

      {/* Course */}
      <td className="px-4 py-3 hidden lg:table-cell">
        {resource.course ? (
          <div className="flex items-center gap-1 text-xs text-foreground">
            <Link2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="truncate max-w-[120px]">
              {resource.course.title}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>

      {/* Size */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="text-xs text-muted-foreground">
          {formatFileSize(resource.fileSize)}
        </span>
      </td>

      {/* Date */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(resource.createdAt)}
        </span>
      </td>

      {/* Downloads */}
      <td className="px-4 py-3 hidden xl:table-cell">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Download className="w-3 h-3" />
          {resource.downloadCount}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {resource.isDownloadable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDownload}
              className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity text-red-600 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
