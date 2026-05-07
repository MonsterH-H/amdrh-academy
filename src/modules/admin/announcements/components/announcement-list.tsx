"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pin,
  PinOff,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  MoreHorizontal,
  Clock,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ANNOUNCEMENT_TYPE_LABELS, ANNOUNCEMENT_TYPE_COLORS, ROLE_LABELS } from "@/lib/constants";
import { formatTimeAgo, formatDate } from "@/utils/format";

export interface AnnouncementWithAuthor {
  id: string;
  title: string;
  content: string;
  type: string;
  targetRoles: string;
  isPinned: boolean;
  isPublished: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    prenom: string;
    nom: string;
    role: string;
  } | null;
}

interface AnnouncementListProps {
  announcements: AnnouncementWithAuthor[];
  onEdit: (announcement: AnnouncementWithAuthor) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, isPublished: boolean) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
}

export function AnnouncementList({
  announcements,
  onEdit,
  onDelete,
  onTogglePublish,
  onTogglePin,
}: AnnouncementListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  if (announcements.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Pin className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Aucune annonce trouvée</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop table header */}
      <div className="hidden md:grid md:grid-cols-[1fr_100px_120px_140px_48px] gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <span>Annonce</span>
        <span>Type</span>
        <span>Statut</span>
        <span>Date</span>
        <span></span>
      </div>

      <div className="space-y-2">
        {announcements.map((announcement) => {
          const typeLabel = ANNOUNCEMENT_TYPE_LABELS[announcement.type] || announcement.type;
          const typeColor = ANNOUNCEMENT_TYPE_COLORS[announcement.type] || "bg-gray-100 text-gray-700";
          const targetRolesParsed: string[] = (() => {
            try { return JSON.parse(announcement.targetRoles); } catch { return []; }
          })();

          return (
            <Card
              key={announcement.id}
              className={cn(
                "border border-border/60 bg-card transition-colors",
                announcement.isPinned && "ring-1 ring-primary/20 border-primary/30",
                !announcement.isPublished && "opacity-60"
              )}
            >
              <CardContent className="p-4">
                {/* Mobile Layout */}
                <div className="md:hidden space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <Badge variant="secondary" className={cn("text-[10px] font-semibold px-1.5 py-0", typeColor)}>
                          {typeLabel}
                        </Badge>
                        {announcement.isPinned && (
                          <Pin className="w-3 h-3 text-primary/60" />
                        )}
                        {!announcement.isPublished && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                            Brouillon
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                        {announcement.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {announcement.content.slice(0, 100)}
                        {announcement.content.length > 100 ? "..." : ""}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 cursor-pointer">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(announcement)} className="cursor-pointer">
                          <Pencil className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onTogglePin(announcement.id, !announcement.isPinned)}
                          className="cursor-pointer"
                        >
                          {announcement.isPinned ? (
                            <>
                              <PinOff className="w-4 h-4 mr-2" />
                              Désépingler
                            </>
                          ) : (
                            <>
                              <Pin className="w-4 h-4 mr-2" />
                              Épingler
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onTogglePublish(announcement.id, !announcement.isPublished)}
                          className="cursor-pointer"
                        >
                          {announcement.isPublished ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Dépublier
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Publier
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(announcement.id)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground/60">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(announcement.createdAt)}</span>
                    </div>
                    {announcement.author && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{announcement.author.prenom} {announcement.author.nom}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:grid md:grid-cols-[1fr_100px_120px_140px_48px] gap-4 items-center">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {announcement.isPinned && <Pin className="w-3 h-3 text-primary/60 shrink-0" />}
                      <span className="font-medium text-sm text-foreground truncate">
                        {announcement.title}
                      </span>
                      {targetRolesParsed.length > 0 && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          ({targetRolesParsed.map(r => ROLE_LABELS[r] || r).join(", ")})
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <Badge variant="secondary" className={cn("text-[10px] font-semibold px-1.5 py-0", typeColor)}>
                      {typeLabel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={announcement.isPublished ? "default" : "outline"}
                      className={cn(
                        "text-[10px] px-1.5 py-0",
                        announcement.isPublished
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "text-muted-foreground"
                      )}
                    >
                      {announcement.isPublished ? "Publiée" : "Brouillon"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(announcement.createdAt)}
                  </div>
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(announcement)} className="cursor-pointer">
                          <Pencil className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onTogglePin(announcement.id, !announcement.isPinned)}
                          className="cursor-pointer"
                        >
                          {announcement.isPinned ? (
                            <>
                              <PinOff className="w-4 h-4 mr-2" />
                              Désépingler
                            </>
                          ) : (
                            <>
                              <Pin className="w-4 h-4 mr-2" />
                              Épingler
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onTogglePublish(announcement.id, !announcement.isPublished)}
                          className="cursor-pointer"
                        >
                          {announcement.isPublished ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Dépublier
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Publier
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteId(announcement.id)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;annonce</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L&apos;annonce sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
