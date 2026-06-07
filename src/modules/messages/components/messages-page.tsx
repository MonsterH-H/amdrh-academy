"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { useRealtime } from "@/hooks/use-realtime";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Wifi, WifiOff, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConversationList } from "./conversation-list";
import { NewConversationDialog } from "./new-conversation-dialog";

// ──────────────────────────────────────────────────────────
// Skeleton
// ──────────────────────────────────────────────────────────

function MessagesSkeleton() {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl border border-border/40"
          >
            <Skeleton className="w-11 h-11 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Messages Page
// ──────────────────────────────────────────────────────────

export function MessagesPage() {
  const { user, navigate } = useAppStore();
  const { isConnected, isEnabled } = useRealtime();
  const [conversations, setConversations] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${user.id}`);
        const data = await res.json();
        setConversations(data.conversations || []);
      } catch {
        toast.error("Erreur de chargement", { description: "Impossible de charger les conversations." });
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) return <MessagesSkeleton />;

  const existingUserIds = new Set<string>(
    conversations
      .map(
        (c) =>
          (c.otherUser as Record<string, unknown> | null)?.id as string
      )
      .filter(Boolean)
  );

  const totalUnread = conversations.reduce(
    (sum, c) => sum + ((c.unreadCount as number) || 0),
    0
  );

  return (
    <>
      <div className="space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Messagerie</h2>
            <p className="text-muted-foreground mt-1">
              {totalUnread > 0
                ? `${totalUnread} message${totalUnread > 1 ? "s" : ""} non lu${totalUnread > 1 ? "s" : ""}`
                : "Communiquez avec vos formateurs"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEnabled && (
              <div
                className={cn(
                  "hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full",
                  isConnected
                    ? "bg-green-50 text-green-700 border border-green-200/60"
                    : "bg-yellow-50 text-yellow-700 border border-yellow-200/60"
                )}
              >
                {isConnected ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
                {isConnected ? "En ligne" : "Reconnexion..."}
              </div>
            )}
            <Button
              size="sm"
              className="rounded-lg text-xs"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Nouvelle
            </Button>
          </div>
        </div>

        <ConversationList
          conversations={conversations}
          search={search}
          onSearchChange={setSearch}
          onNewConversation={() => setDialogOpen(true)}
          onConversationClick={(id) => navigate("conversation", { id })}
        />
      </div>

      <NewConversationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        existingConversationUserIds={existingUserIds}
      />
    </>
  );
}
