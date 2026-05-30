"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Megaphone, Plus, MegaphoneOff, Pin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { ANNOUNCEMENT_TYPE_LABELS, ANNOUNCEMENT_TYPE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AnnouncementFormDialog, type AnnouncementFormData } from "./announcement-form-dialog";
import { AnnouncementList, type AnnouncementWithAuthor } from "./announcement-list";

// ──────────────────────────────────────────────────────────
// Skeleton
// ──────────────────────────────────────────────────────────

function AdminAnnouncementsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Stats Row
// ──────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-card">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Main Page Component
// ──────────────────────────────────────────────────────────

const ALL_TYPES = ["ALL", "INFO", "URGENT", "EVENEMENT", "FORMATION", "RESULTAT"] as const;

const statusFilterTabs = [
  { value: "ALL", label: "Toutes" },
  { value: "PUBLISHED", label: "Publiées" },
  { value: "DRAFT", label: "Brouillons" },
] as const;

const typeFilterTabs = ALL_TYPES.map((t) => ({
  value: t,
  label: t === "ALL" ? "Tous les types" : (ANNOUNCEMENT_TYPE_LABELS[t] || t),
}));

export function AdminAnnouncementsPage() {
  const { user } = useAppStore();
  const [announcements, setAnnouncements] = useState<AnnouncementWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementFormData | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: user.id,
        role: user.role,
      });
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/announcements?${params}`);
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, typeFilter, statusFilter]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setFormOpen(true);
  };

  const handleEdit = (announcement: AnnouncementWithAuthor) => {
    let targetRoles: string[] = [];
    try {
      targetRoles = JSON.parse(announcement.targetRoles);
    } catch {
      targetRoles = [];
    }
    setEditingAnnouncement({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      targetRoles,
      isPinned: announcement.isPinned,
      isPublished: announcement.isPublished,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (data: AnnouncementFormData) => {
    try {
      const isEditing = !!data.id;
      const url = isEditing
        ? `/api/admin/announcements/${data.id}?userId=${user?.id}&role=${user?.role}`
        : `/api/admin/announcements?userId=${user?.id}&role=${user?.role}`;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          type: data.type,
          targetRoles: data.targetRoles,
          isPinned: data.isPinned,
          isPublished: data.isPublished,
          authorId: user?.id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur");
      }

      toast({
        title: isEditing ? "Annonce modifiée" : "Annonce créée",
        description: isEditing
          ? "L'annonce a été mise à jour avec succès."
          : "La nouvelle annonce a été créée avec succès.",
      });
      fetchAnnouncements();
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur est survenue.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(
        `/api/admin/announcements/${id}?userId=${user?.id}&role=${user?.role}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur");
      }
      toast({
        title: "Annonce supprimée",
        description: "L'annonce a été supprimée avec succès.",
      });
      fetchAnnouncements();
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de supprimer l'annonce.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      const res = await fetch(
        `/api/admin/announcements/${id}?userId=${user?.id}&role=${user?.role}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished }),
        }
      );
      if (!res.ok) throw new Error();
      toast({
        title: isPublished ? "Annonce publiée" : "Annonce dépubliée",
        description: isPublished
          ? "L'annonce est maintenant visible."
          : "L'annonce est passée en brouillon.",
      });
      fetchAnnouncements();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de publication.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      const res = await fetch(
        `/api/admin/announcements/${id}?userId=${user?.id}&role=${user?.role}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPinned }),
        }
      );
      if (!res.ok) throw new Error();
      toast({
        title: isPinned ? "Annonce épinglée" : "Annonce désépinglée",
      });
      fetchAnnouncements();
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut d'épinglage.",
        variant: "destructive",
      });
    }
  };

  // Stats
  const totalCount = announcements.length;
  const publishedCount = announcements.filter((a) => a.isPublished).length;
  const pinnedCount = announcements.filter((a) => a.isPinned).length;

  if (loading && announcements.length === 0) return <AdminAnnouncementsSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-primary" />
            </div>
            Gestion des annonces
          </h2>
          <p className="text-muted-foreground mt-1.5">
            Créer et gérer les annonces pour tous les utilisateurs
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nouvelle annonce
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total"
          value={totalCount}
          icon={Megaphone}
          colorClass="bg-primary/10 text-primary"
        />
        <StatCard
          label="Publiées"
          value={publishedCount}
          icon={Eye}
          colorClass="bg-blue-500/10 text-blue-600"
        />
        <StatCard
          label="Épinglées"
          value={pinnedCount}
          icon={Pin}
          colorClass="bg-amber-500/10 text-amber-600"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Type Filter */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
          <div className="flex gap-2 min-w-max">
            {typeFilterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTypeFilter(tab.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer",
                  typeFilter === tab.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {/* Status Filter */}
        <div className="flex gap-2">
          {statusFilterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer",
                statusFilter === tab.value
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <AnnouncementList
        announcements={announcements}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
        onTogglePin={handleTogglePin}
      />

      {/* Form Dialog */}
      <AnnouncementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        announcement={editingAnnouncement}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
