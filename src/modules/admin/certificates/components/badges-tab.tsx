"use client";

import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Star, Plus, Gift, Users, MoreHorizontal, Pencil, Trash2,
  ExternalLink, Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BADGE_LEVEL_LABELS, BADGE_LEVEL_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { BadgeItem } from "../types";
import { CreateBadgeDialog, EditBadgeDialog, AwardBadgeDialog } from "./badge-dialogs";

// ─── Badges Skeleton ────────────────────────────────────────────────

export function BadgesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
      </div>
    </div>
  );
}

// ─── Badges Tab ─────────────────────────────────────────────────────

export function BadgesTab() {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [awardOpen, setAwardOpen] = useState(false);
  const [badgeUsersOpen, setBadgeUsersOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [badgeUsers, setBadgeUsers] = useState<Array<Record<string, unknown>>>([]);
  const [badgeUsersLoading, setBadgeUsersLoading] = useState(false);

  const fetchBadges = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/badges");
      const data = await res.json();
      setBadges(data.badges || []);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les badges.", variant: "destructive" });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBadges(); }, [fetchBadges]);

  const handleViewUsers = async (badge: BadgeItem) => {
    setSelectedBadge(badge); setBadgeUsersOpen(true); setBadgeUsersLoading(true);
    try {
      const res = await fetch(`/api/admin/badges/${badge.id}`);
      const data = await res.json();
      setBadgeUsers(data.badge?.userBadges || []);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les utilisateurs.", variant: "destructive" });
    } finally { setBadgeUsersLoading(false); }
  };

  const handleEdit = (badge: BadgeItem) => { setSelectedBadge(badge); setEditOpen(true); };
  const handleDelete = (badge: BadgeItem) => { setSelectedBadge(badge); setDeleteOpen(true); };

  const confirmDelete = async () => {
    if (!selectedBadge) return;
    try {
      const res = await fetch(`/api/admin/badges/${selectedBadge.id}`, { method: "DELETE" });
      if (res.ok) { toast({ title: "Badge supprimé", description: `"${selectedBadge.name}" a été supprimé.` }); fetchBadges(); }
      else { toast({ title: "Erreur", variant: "destructive" }); }
    } catch { toast({ title: "Erreur serveur", variant: "destructive" }); }
    setDeleteOpen(false); setSelectedBadge(null);
  };

  if (loading) return <BadgesSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-sm text-muted-foreground">{badges.length} badge{badges.length > 1 ? "s" : ""}</p>
        <div className="flex gap-2">
          <Button onClick={() => setAwardOpen(true)} variant="outline" className="rounded-lg text-sm">
            <Gift className="w-4 h-4 mr-1.5" /> Attribuer un badge
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary/90 rounded-lg text-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Nouveau badge
          </Button>
        </div>
      </div>

      {badges.length === 0 ? (
        <div className="text-center py-20">
          <Star className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucun badge</h3>
          <p className="text-sm text-muted-foreground">Créez votre premier badge pour récompenser les utilisateurs</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <Card key={badge.id} className="border-border/60 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl", BADGE_LEVEL_COLORS[badge.level] || "bg-gray-200")}>
                      {badge.icon || "🏆"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{badge.name}</h3>
                      <Badge variant="secondary" className="text-[10px] mt-1">{BADGE_LEVEL_LABELS[badge.level] || badge.level}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"><MoreHorizontal className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleViewUsers(badge)}><Users className="w-4 h-4 mr-2" />Voir les titulaires</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(badge)}><Pencil className="w-4 h-4 mr-2" />Modifier</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(badge)} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{badge.description}</p>
                <Separator className="mb-3" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{badge._count.userBadges} obtenu{badge._count.userBadges > 1 ? "s" : ""}</span>
                  </div>
                  <button onClick={() => handleViewUsers(badge)} className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
                    Voir <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateBadgeDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchBadges} />
      {selectedBadge && <EditBadgeDialog open={editOpen} onOpenChange={setEditOpen} badge={selectedBadge} onUpdated={fetchBadges} />}
      <AwardBadgeDialog open={awardOpen} onOpenChange={setAwardOpen} badges={badges} />

      {/* Badge Users Dialog */}
      <Dialog open={badgeUsersOpen} onOpenChange={setBadgeUsersOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedBadge && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-lg", BADGE_LEVEL_COLORS[selectedBadge.level] || "bg-gray-200")}>{selectedBadge.icon}</div>
                  Titulaires du badge
                </DialogTitle>
                <DialogDescription>{selectedBadge.name} — {badgeUsers.length} utilisateur{badgeUsers.length > 1 ? "s" : ""}</DialogDescription>
              </DialogHeader>
              {badgeUsersLoading ? (
                <div className="py-8 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : badgeUsers.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Aucun utilisateur n&apos;a encore obtenu ce badge</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {badgeUsers.map((ub: Record<string, unknown>) => {
                    const u = ub.user as Record<string, unknown>;
                    return (
                      <div key={ub.id as string} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                            {(u.prenom as string)?.charAt(0)}{(u.nom as string)?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{String(u.prenom)} {String(u.nom)}</p>
                          <p className="text-[10px] text-muted-foreground">{u.email as string}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{new Date(ub.earnedAt as string).toLocaleDateString("fr-FR")}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le badge</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le badge &quot;{selectedBadge?.name}&quot; ?
              Cette action est irréversible et supprimera toutes les attributions associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-lg bg-destructive text-white hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
