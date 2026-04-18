"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, ArrowLeft, Search, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function MessagesPage() {
  const { user, navigate } = useAppStore();
  const [conversations, setConversations] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filtered = conversations.filter((c) => {
    const other = c.otherUser as Record<string, unknown> | null;
    if (!search) return true;
    const name = `${other?.prenom} ${other?.nom}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Messagerie</h2>
        <p className="text-muted-foreground mt-1">Communiquez avec vos formateurs</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-lg" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucune conversation</h3>
          <p className="text-sm text-muted-foreground">Vos conversations apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((conv) => {
            const other = conv.otherUser as Record<string, unknown> | null;
            const lastMsg = conv.lastMessage as Record<string, unknown> | null;
            const unread = conv.unreadCount as number;
            return (
              <Card
                key={conv.id as string}
                className="border-border/60 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => navigate("conversation", { id: conv.id as string })}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {other ? `${(other.prenom as string)?.charAt(0)}${(other.nom as string)?.charAt(0)}` : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {other ? `${other.prenom} ${other.nom}` : "Inconnu"}
                      </p>
                      {lastMsg && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(lastMsg.createdAt as string).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {lastMsg ? lastMsg.content as string : "Aucun message"}
                    </p>
                  </div>
                  {unread > 0 && (
                    <span className="bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
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
  );
}

export function ConversationPage() {
  const { user, viewParams, navigate } = useAppStore();
  const conversationId = viewParams?.id;
  const [messages, setMessages] = useState<Array<Record<string, unknown>>>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId || !user) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${conversationId}?userId=${user.id}`);
        const data = await res.json();
        setMessages(data.messages || []);
        setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 100);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [conversationId, user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !conversationId) return;
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
        setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }), 100);
      }
    } catch {
      setNewMessage(msg);
    }
  };

  if (loading) return <MessagesSkeleton />;

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] sm:h-[calc(100vh-10rem)] animate-fadeIn">
      <button onClick={() => navigate("messages")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Retour aux conversations
      </button>

      <Card className="flex-1 flex flex-col border-border/60 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-3 max-w-2xl mx-auto">
            {messages.map((msg) => {
              const isMine = msg.senderId === user?.id;
              const sender = msg.sender as Record<string, unknown> | null;
              return (
                <div key={msg.id as string} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[75%] px-4 py-3 rounded-2xl text-sm",
                    isMine
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}>
                    {!isMine && sender && (
                      <p className="text-[10px] font-semibold opacity-70 mb-1">
                        {sender.prenom as string} {sender.nom as string}
                      </p>
                    )}
                    <p className="leading-relaxed">{msg.content as string}</p>
                    <p className={cn("text-[10px] mt-1", isMine ? "opacity-70" : "text-muted-foreground")}>
                      {new Date(msg.createdAt as string).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="border-t border-border/40 p-3 sm:p-4">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2 max-w-2xl mx-auto">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrire un message..."
              className="rounded-lg min-h-[44px]"
            />
            <Button type="submit" size="icon" className="rounded-lg flex-shrink-0 min-w-[44px] min-h-[44px]" disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

function MessagesSkeleton() {
  return <div className="space-y-4"><Skeleton className="h-8 w-48" />{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;
}
