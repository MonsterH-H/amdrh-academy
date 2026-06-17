"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAppStore } from "@/store/app";
import { useRealtime } from "@/hooks/use-realtime";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { type TypingUser } from "../types";
import { ConversationView } from "./conversation-view";
import { MessageInput } from "./message-input";

// ──────────────────────────────────────────────────────────
// Skeleton
// ──────────────────────────────────────────────────────────

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
            <div
              key={i}
              className={cn(
                "flex gap-3",
                i % 2 === 0 ? "justify-start" : "justify-end"
              )}
            >
              <Skeleton
                className={cn(
                  "h-16 rounded-2xl",
                  i % 2 === 0 ? "w-48" : "w-56"
                )}
              />
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

// ──────────────────────────────────────────────────────────
// Conversation Page (with real-time features)
// ──────────────────────────────────────────────────────────

interface OtherParticipantInfo {
  userId: string;
  user: {
    id: string;
    nom: string;
    prenom: string;
    avatar?: string | null;
    role: string;
    club?: string | null;
    isActive: boolean;
  };
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
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<OtherParticipantInfo["user"] | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      const el = scrollContainerRef.current;
      if (el) {
        const viewport = el.querySelector<HTMLElement>(
          "[data-slot='scroll-area-viewport']"
        );
        if (viewport) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: "smooth",
          });
        }
      }
    }, 100);
  }, []);

  // Fetch messages on mount
  useEffect(() => {
    if (!conversationId || !user) return;
    setLoading(true);
    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `/api/messages/${conversationId}?userId=${user.id}`,
          {
            headers: {
              "x-user-id": user.id,
            },
          }
        );
        const data = await res.json();

        if (!res.ok) {
          toast.error("Erreur", { description: data.error || "Impossible de charger la conversation." });
          setMessages([]);
          setLoading(false);
          return;
        }

        setMessages(data.messages || []);

        // Derive other user from participant info returned by API
        if (data.otherParticipant) {
          setOtherUserId(data.otherParticipant.userId);
          setOtherUser(data.otherParticipant.user);
        } else {
          // Fallback: try to derive from first message sender
          if (data.messages && data.messages.length > 0) {
            const otherMsg = data.messages.find((m: Record<string, unknown>) => m.senderId !== user.id);
            if (otherMsg) {
              setOtherUserId(otherMsg.senderId as string);
            }
          }
        }

        scrollToBottom();
      } catch {
        toast.error("Erreur de connexion", { description: "Impossible de charger les messages." });
        setMessages([]);
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
    const unsubMessage = on("messages:new", (...args: unknown[]) => {
      const data = args[0] as Record<string, unknown> | undefined;
      if (!data) return;
      if (data.conversationId !== conversationId) return;
      if (data.senderId === user?.id) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
      scrollToBottom();
    });

    const unsubTyping = on("messages:typing", (...args: unknown[]) => {
      const data = args[0] as Record<string, unknown> | undefined;
      if (!data || data.conversationId !== conversationId) return;
      if (data.userId === user?.id) return;

      const typingName = (data.userName as string) || "Quelqu'un";
      setTypingUsers((prev) => {
        const filtered = prev.filter((t) => t.userId !== (data.userId as string));
        if (data.isTyping) {
          return [
            ...filtered,
            {
              userId: data.userId as string,
              name: typingName,
              conversationId: data.conversationId as string,
            },
          ];
        }
        return filtered;
      });
    });

    const unsubPresence = on("presence:change", (...args: unknown[]) => {
      const data = args[0] as Record<string, unknown> | undefined;
      if (!data) return;
      if (data.userId !== otherUserId) return;
      setOtherUserOnline(data.isOnline as boolean);
    });

    const unsubUnread = on("messages:unread", (...args: unknown[]) => {
      const data = args[0] as Record<string, unknown> | undefined;
      if (!data) return;
    });

    return () => {
      unsubMessage();
      unsubTyping();
      unsubPresence();
      unsubUnread();
    };
  }, [conversationId, user?.id, on, scrollToBottom, otherUserId]);

  // Handle typing input — emit events to socket
  const handleInputChange = useCallback(
    (value: string) => {
      setNewMessage(value);
      if (!conversationId) return;

      sendTyping(conversationId, true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(conversationId, false);
      }, 2000);
    },
    [conversationId, sendTyping]
  );

  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !conversationId || sending) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTyping(conversationId, false);

    const msg = newMessage;
    setNewMessage("");
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ senderId: user.id, content: msg }),
      });
      const data = await res.json();

      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
      } else {
        toast.error("Erreur d'envoi", { description: data.error || "Impossible d'envoyer le message." });
        setNewMessage(msg);
      }
    } catch {
      toast.error("Erreur de connexion", { description: "Impossible d'envoyer le message." });
      setNewMessage(msg);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherUserName = otherUser
    ? `${otherUser.prenom} ${otherUser.nom}`
    : "Conversation";

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
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{otherUserName}</span>
          {otherUserOnline && (
            <span className="text-[10px] text-emerald-600 font-medium px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200/60">
              En ligne
            </span>
          )}
          {isEnabled && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full",
                isConnected
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
              )}
            >
              {isConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {isConnected ? "Connecté" : "Reconnexion..."}
            </div>
          )}
        </div>
      </div>

      {/* Messages Card */}
      <Card className="flex-1 flex flex-col border-border/60 overflow-hidden">
        <ConversationView
          ref={scrollContainerRef}
          messages={messages}
          typingUsers={typingUsers}
          currentUserId={user?.id}
        />

        <MessageInput
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSubmit={handleSend}
          disabled={sending}
        />
      </Card>
    </div>
  );
}
