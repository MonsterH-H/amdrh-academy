"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Megaphone, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AnnouncementCard, type AnnouncementData } from "./announcement-card";
import { AnnouncementDetailDialog } from "./announcement-detail-dialog";
import { ANNOUNCEMENT_TYPE_LABELS, ANNOUNCEMENT_TYPE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────
// Type filter tabs
// ──────────────────────────────────────────────────────────

const ALL_TYPES = ["ALL", "INFO", "URGENT", "EVENEMENT", "FORMATION", "RESULTAT"] as const;

const typeFilterTabs = ALL_TYPES.map((t) => ({
  value: t,
  label: t === "ALL" ? "Toutes" : (ANNOUNCEMENT_TYPE_LABELS[t] || t),
  color: t === "ALL" ? "" : ANNOUNCEMENT_TYPE_COLORS[t],
}));

// ──────────────────────────────────────────────────────────
// Skeleton
// ──────────────────────────────────────────────────────────

function AnnouncementsSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-lg" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-border/40">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-5 w-20 rounded" />
            </div>
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1.5" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center gap-1.5 mt-3">
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Empty State
// ──────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="text-center py-20 animate-fadeIn">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <Megaphone className="w-8 h-8 text-muted-foreground/40" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">Aucune annonce</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Il n&apos;y a pas encore d&apos;annonces disponibles. Revenez plus tard !
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Main Page Component
// ──────────────────────────────────────────────────────────

export function AnnouncementsPage() {
  const { user } = useAppStore();
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchAnnouncements = async (type?: string, search?: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ userId: user.id, role: user.role });
      if (type && type !== "ALL") params.set("type", type);
      if (search) params.set("search", search);
      const res = await fetch(`/api/announcements?${params}`);
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements(activeType, searchQuery);
  }, [user, activeType, searchQuery]);

  const handleCardClick = (announcement: AnnouncementData) => {
    setSelectedAnnouncement(announcement);
    setDialogOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnnouncements(activeType, searchQuery);
  };

  if (loading) return <AnnouncementsSkeleton />;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-primary" />
          </div>
          Annonces
        </h2>
        <p className="text-muted-foreground mt-1.5">
          Restez informé des dernières nouvelles et événements
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        <Input
          placeholder="Rechercher une annonce..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-sm rounded-lg"
        />
      </form>

      {/* Type Filter Tabs */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
        <div className="flex gap-2 min-w-max">
          {typeFilterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveType(tab.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer",
                activeType === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <AnnouncementDetailDialog
        announcement={selectedAnnouncement}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
