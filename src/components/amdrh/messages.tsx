"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { useRealtime } from "@/hooks/use-realtime";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Send,
  ArrowLeft,
  Search,
  MessageSquare,
  Wifi,
  WifiOff,
  Plus,
  Loader2,
  X,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";

// ──────────────────────────────────────────────────────────
// Typing indicator component
// ──────────────────────────────────────────────────────────

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex items-center gap-1.5 bg-muted rounded-full px-3 py-1.5">
        <span className="text-[10px] text-muted-foreground font-medium">{name}</span>
        <div className="flex gap-0.5">
          <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Time ago helper
// ──────────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatMessageDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return date.toLocaleDateString("fr-FR", { weekday: "short" });
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// ──────────────────────────────────────────────────────────
// New Conversation Dialog
// ──────────────────────────────────────────────────────────

interface UserOption {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  avatar?: string | null;
  club?: string | null;
}

function NewConversationDialog({
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

  const fetchUsers = useCallback(async (query: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: query,
        limit: "15",
      });
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      // Filter out current user and users we already have conversations with
      const filtered = (data.users || []).filter(
        (u: UserOption) => u.id !== user.id && !existingConversationUserIds.has(u.id)
      );
      setUsers(filtered);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [user, existingConversationUserIds]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setUsers([]);
      return;
    }
    // Debounce search
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId1: user.id,
          userId2: selectedUser.id,
        }),
      });
      const data = await res.json();
      if (res.ok || data.conversationId) {
        onOpenChange(false);
        navigate("conversation", { id: data.conversationId });
      }
    } catch {
      // silent fail
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
                {search ? "Aucun utilisateur trouvé" : "Aucun utilisateur disponible"}
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
                      {u.prenom.charAt(0)}{u.nom.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {u.prenom} {u.nom}
                      </p>
                      <Badge
                        variant="secondary"
                        className={cn("text-[9px] px-1.5 py-0 flex-shrink-0", ROLE_COLORS[u.role] || "bg-gray-100 text-gray-700")}
                      >
                        {ROLE_LABELS[u.role] || u.role}
                      </Badge>
                    </div>
                    {u.club && (
                      <p className="text-xs text-muted-foreground truncate">{u.club}</p>
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

// ──────────────────────────────────────────────────────────
// Messages List Page
// ──────────────────────────────────────────────────────────

export function MessagesPage() {
  const { user, navigate } = useAppStore();
  const { isConnected, isEnabled } = useRealtime();
  const [conversations, setConversations] = useState<Array<Record<string, unknown>>>([]);
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
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
    // Polling every 10s
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) return <MessagesSkeleton />;

  // Build set of existing conversation user IDs for the new conversation dialog
  const existingUserIds = new Set<string>(
    conversations
      .map((c) => (c.otherUser as Record<string, unknown> | null)?.id as string)
      .filter(Boolean)
  );

  const filtered = conversations.filter((c) => {
    const other = c.otherUser as Record<string, unknown> | null;
    if (!search) return true;
    const name = `${other?.prenom} ${other?.nom}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const totalUnread = conversations.reduce((sum, c) => sum + ((c.unreadCount as number) || 0), 0);

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
            {/* Connection status */}
            {isEnabled && (
              <div className={cn(
                "hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full",
                isConnected ? "bg-green-50 text-green-700 border border-green-200/60" : "bg-yellow-50 text-yellow-700 border border-yellow-200/60"
              )}>
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une conversation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-lg"
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

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">
              {search ? "Aucun résultat" : "Aucune conversation"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search
                ? "Essayez avec d'autres termes de recherche"
                : "Vos conversations apparaîtront ici"}
            </p>
            {!search && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Démarrer une conversation
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((conv) => {
              const other = conv.otherUser as Record<string, unknown> | null;
              const lastMsg = conv.lastMessage as Record<string, unknown> | null;
              const unread = conv.unreadCount as number;
              const isOnline = conv.online === true;
              return (
                <Card
                  key={conv.id as string}
                  className={cn(
                    "border-border/60 hover:shadow-sm transition-all cursor-pointer group",
                    unread > 0 && "bg-primary/[0.03] border-primary/20"
                  )}
                  onClick={() => navigate("conversation", { id: conv.id as string })}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <Avatar className={cn(
                        "w-11 h-11 transition-all",
                        unread > 0 && "ring-2 ring-primary/20"
                      )}>
                        <AvatarFallback className={cn(
                          "text-xs font-bold",
                          unread > 0 ? "bg-primary/15 text-primary" : "bg-primary/10 text-primary"
                        )}>
                          {other ? `${(other.prenom as string)?.charAt(0)}${(other.nom as string)?.charAt(0)}` : "?"}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online status dot */}
                      {isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                          "text-sm truncate",
                          unread > 0 ? "font-bold text-foreground" : "font-semibold text-foreground"
                        )}>
                          {other ? `${other.prenom} ${other.nom}` : "Inconnu"}
                        </p>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {lastMsg ? formatMessageDate(lastMsg.createdAt as string) : ""}
                        </span>
                      </div>
                      <p className={cn(
                        "text-xs truncate mt-0.5",
                        unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {lastMsg ? lastMsg.content as string : "Aucun message"}
                      </p>
                    </div>
                    {unread > 0 && (
                      <span className="bg-primary text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center flex-shrink-0">
                        {unread}
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <NewConversationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        existingConversationUserIds={existingUserIds}
      />
    </>
  );
}

// ──────────────────────────────────────────────────────────
// Conversation Page (with real-time features)
// ──────────────────────────────────────────────────────────

interface TypingUser {
  userId: string;
  name: string;
  conversationId: string;
}

export function ConversationPage() {
  const { user, viewParams, navigate } = useAppStore();
  const conversationId = viewParams?.id;
  const {
    isConnected,
    isEnabled,
    subscribeConversation,
    unsubscribeConversation,
    sendTyping,
    on,
  } = useRealtime();
  const [messages, setMessages] = useState<Array<Record<string, unknown>>>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      const el = scrollContainerRef.current;
      if (el) {
        const viewport = el.querySelector<HTMLElement>("[data-slot='scroll-area-viewport']");
        if (viewport) {
          viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
        }
      }
    }, 100);
  }, []);

  // Fetch messages on mount
  useEffect(() => {
    if (!conversationId || !user) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${conversationId}?userId=${user.id}`);
        const data = await res.json();
        setMessages(data.messages || []);
        scrollToBottom();
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [conversationId, user, scrollToBottom]);

  // Subscribe to conversation room via socket
  useEffect(() => {
    if (!conversationId) return;
    const unsub = subscribeConversation(conversationId);
    return () => {
      unsub();
      unsubscribeConversation(conversationId);
    };
  }, [conversationId, subscribeConversation, unsubscribeConversation]);

  // Listen for real-time events
  useEffect(() => {
    // New message from socket
    const unsubMessage = on("messages:new", (args: unknown[]) => {
      const data = args[0] as Record<string, unknown> | undefined;
      if (!data) return;
      // Only add if this message is for our conversation
      if (data.conversationId !== conversationId) return;
      // Don't duplicate messages we sent (they're already added via API response)
      if (data.senderId === user?.id) return;
      setMessages((prev) => {
        // Avoid duplicates by checking ID
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
      scrollToBottom();
    });

    // Typing indicator from others
    const unsubTyping = on("messages:typing", (args: unknown[]) => {
      const data = args[0] as Record<string, unknown> | undefined;
      if (!data || data.conversationId !== conversationId) return;
      if (data.userId === user?.id) return; // Ignore own typing

      const typingName = data.userName as string || "Quelqu'un";
      setTypingUsers((prev) => {
        const filtered = prev.filter((t) => t.userId !== data.userId as string);
        if (data.isTyping) {
          return [...filtered, { userId: data.userId as string, name: typingName, conversationId: data.conversationId as string }];
        }
        return filtered;
      });
    });

    // Presence change for online status
    const unsubPresence = on("presence:change", (args: unknown[]) => {
      const data = args[0] as Record<string, unknown> | undefined;
      if (!data) return;
      setOtherUserOnline(data.isOnline as boolean);
    });

    // Unread count update from messages:unread
    const unsubUnread = on("messages:unread", (args: unknown[]) => {
      const data = args[0] as Record<string, unknown> | undefined;
      if (!data) return;
      // Could update conversation unread count in parent
    });

    return () => {
      unsubMessage();
      unsubTyping();
      unsubPresence();
      unsubUnread();
    };
  }, [conversationId, user?.id, on, scrollToBottom]);

  // Handle typing input — emit events to socket
  const handleInputChange = useCallback((value: string) => {
    setNewMessage(value);
    if (!conversationId) return;

    // Emit typing start
    sendTyping(conversationId, true);

    // Clear previous timeout and set new one to emit typing stop
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(conversationId, false);
    }, 2000);
  }, [conversationId, sendTyping]);

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !conversationId) return;

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTyping(conversationId, false);

    const msg = newMessage;
    setNewMessage("");
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: user.id, content: msg }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
      }
    } catch {
      setNewMessage(msg);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) return <ConversationSkeleton />;

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] sm:h-[calc(100vh-10rem)] animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => navigate("messages")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Retour
        </button>
        {/* Connection & online status */}
        <div className="flex items-center gap-2">
          {otherUserOnline && (
            <span className="text-[10px] text-emerald-600 font-medium px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200/60">
              En ligne
            </span>
          )}
          {isEnabled && (
            <div className={cn(
              "flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full",
              isConnected ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
            )}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? "Connecté" : "Reconnexion..."}
            </div>
          )}
        </div>
      </div>

      {/* Messages Card */}
      <Card className="flex-1 flex flex-col border-border/60 overflow-hidden">
        <ScrollArea className="flex-1" ref={scrollContainerRef}>
          <div className="p-4 space-y-3 max-w-2xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Commencez la conversation !
                </p>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isMine = msg.senderId === user?.id;
              const sender = msg.sender as Record<string, unknown> | null;
              const prevMsg = messages[idx - 1];
              const isSameSender = prevMsg && prevMsg.senderId === msg.senderId;
              const timeDiff = prevMsg
                ? new Date(msg.createdAt as string).getTime() - new Date(prevMsg.createdAt as string).getTime()
                : Infinity;
              const showGap = timeDiff > 5 * 60 * 1000; // 5 minutes gap

              return (
                <div key={msg.id as string}>
                  {/* Date separator */}
                  {showGap && idx > 0 && (
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-border/40" />
                      <span className="text-[10px] text-muted-foreground">
                        {formatTimeAgo(msg.createdAt as string)}
                      </span>
                      <div className="flex-1 h-px bg-border/40" />
                    </div>
                  )}

                  <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                      isMine
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md",
                      isSameSender && "rounded-t-md"
                    )}>
                      {!isMine && !isSameSender && sender && (
                        <p className="text-[10px] font-semibold opacity-70 mb-1">
                          {sender.prenom as string} {sender.nom as string}
                        </p>
                      )}
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content as string}</p>
                      <p className={cn(
                        "text-[10px] mt-1 text-right",
                        isMine ? "opacity-70" : "text-muted-foreground"
                      )}>
                        {new Date(msg.createdAt as string).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        {isMine && msg.isRead && (
                          <span className="ml-1">✓✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicators */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="max-w-[75%]">
                  {typingUsers.map((tu) => (
                    <TypingIndicator key={tu.userId} name={tu.name} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Send input */}
        <div className="border-t border-border/40 p-3 sm:p-4 bg-background">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2 max-w-2xl mx-auto"
          >
            <Input
              value={newMessage}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrire un message..."
              className="rounded-lg min-h-[44px]"
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-lg flex-shrink-0 min-w-[44px] min-h-[44px]"
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Skeletons
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
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/40">
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

function ConversationSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] sm:h-[calc(100vh-10rem)] animate-fadeIn">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Card className="flex-1 flex flex-col border-border/60 overflow-hidden">
        <div className="flex-1 p-4 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={cn(
              "flex gap-3",
              i % 2 === 0 ? "justify-start" : "justify-end"
            )}>
              <Skeleton className={cn("h-16 rounded-2xl", i % 2 === 0 ? "w-48" : "w-56")} />
            </div>
          ))}
        </div>
        <div className="border-t border-border/40 p-4">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <Skeleton className="flex-1 h-11 rounded-lg" />
            <Skeleton className="w-11 h-11 rounded-lg" />
          </div>
        </div>
      </Card>
    </div>
  );
}
