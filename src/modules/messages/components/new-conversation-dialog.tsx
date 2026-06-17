"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  MessageSquare,
  Send,
  Loader2,
  X,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import { type UserOption } from "../types";

export function NewConversationDialog({
  open,
  onOpenChange,
  existingConversationUserIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingConversationUserIds: Set<string>;
}) {
  const { user, navigate } = useAppStore();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchUsers = useCallback(
    async (query: string) => {
      if (!user) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ search: query, limit: "15" });
        const res = await fetch(`/api/messages/users?${params}`, {
          headers: { "x-user-id": user.id },
        });
        const data = await res.json();

        if (!res.ok) {
          toast.error("Erreur", {
            description: (data as Record<string, string>)?.error || "Impossible de rechercher des utilisateurs.",
          });
          setUsers([]);
          return;
        }

        const filtered = (data.users || []).filter(
          (u: UserOption) =>
            u.id !== user.id && !existingConversationUserIds.has(u.id)
        );
        setUsers(filtered);
      } catch {
        toast.error("Erreur de connexion", {
          description: "Impossible de rechercher des utilisateurs.",
        });
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [user, existingConversationUserIds]
  );

  useEffect(() => {
    if (!open) {
      setSearch("");
      setUsers([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (search.length === 0) {
      fetchUsers("");
    } else {
      searchTimeout.current = setTimeout(() => fetchUsers(search), 300);
    }
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search, open, fetchUsers]);

  const handleSelectUser = async (selectedUser: UserOption) => {
    if (!user || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ userId1: user.id, userId2: selectedUser.id }),
      });
      const data = await res.json();

      if (res.ok && data.conversationId) {
        onOpenChange(false);
        navigate("conversation", { id: data.conversationId });
      } else {
        toast.error("Erreur", {
          description: data.error || "Impossible de créer la conversation.",
        });
      }
    } catch {
      toast.error("Erreur de connexion", {
        description: "Impossible de créer la conversation.",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Nouvelle conversation
          </DialogTitle>
          <DialogDescription>
            Recherchez un utilisateur pour démarrer une conversation
          </DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-lg"
            autoFocus
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="space-y-2 py-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {search
                  ? "Aucun utilisateur trouvé"
                  : "Aucun utilisateur disponible"}
              </p>
              {search && (
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Essayez avec d&apos;autres termes de recherche
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1 py-1">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  disabled={creating}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left group"
                >
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {u.prenom.charAt(0)}
                      {u.nom.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {u.prenom} {u.nom}
                      </p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[9px] px-1.5 py-0 flex-shrink-0",
                          ROLE_COLORS[u.role] ||
                            "bg-gray-100 text-gray-700"
                        )}
                      >
                        {ROLE_LABELS[u.role] || u.role}
                      </Badge>
                    </div>
                    {u.club && (
                      <p className="text-xs text-muted-foreground truncate">
                        {u.club}
                      </p>
                    )}
                  </div>
                  <Send className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {creating && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Création de la conversation...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
