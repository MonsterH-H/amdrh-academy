"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MessageSquare, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMessageDate } from "../types";

export interface ConversationListProps {
  conversations: Array<Record<string, unknown>>;
  search: string;
  onSearchChange: (value: string) => void;
  onNewConversation: () => void;
  onConversationClick: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  search,
  onSearchChange,
  onNewConversation,
  onConversationClick,
}: ConversationListProps) {
  const filtered = conversations.filter((c) => {
    const other = c.otherUser as Record<string, unknown> | null;
    if (!other) return !search;
    if (!search) return true;
    const name = `${other.prenom} ${other.nom}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une conversation..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 rounded-lg"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
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
              onClick={onNewConversation}
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
                onClick={() => onConversationClick(conv.id as string)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <Avatar
                      className={cn(
                        "w-11 h-11 transition-all",
                        unread > 0 && "ring-2 ring-primary/20"
                      )}
                    >
                      <AvatarFallback
                        className={cn(
                          "text-xs font-bold",
                          unread > 0
                            ? "bg-primary/15 text-primary"
                            : "bg-primary/10 text-primary"
                        )}
                      >
                        {other
                          ? `${(other.prenom as string)?.charAt(0)}${(other.nom as string)?.charAt(0)}`
                          : "?"}
                      </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm truncate",
                          unread > 0
                            ? "font-bold text-foreground"
                            : "font-semibold text-foreground"
                        )}
                      >
                        {other
                          ? `${other.prenom} ${other.nom}`
                          : "Inconnu"}
                      </p>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {lastMsg
                          ? formatMessageDate(lastMsg.createdAt as string)
                          : ""}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-xs truncate mt-0.5",
                        unread > 0
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {lastMsg
                        ? (lastMsg.content as string)
                        : "Aucun message"}
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
    </>
  );
}
