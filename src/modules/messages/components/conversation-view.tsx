"use client";

import { forwardRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { type TypingUser } from "../types";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

interface ConversationViewProps {
  messages: Array<Record<string, unknown>>;
  typingUsers: TypingUser[];
  currentUserId?: string;
}

export const ConversationView = forwardRef<HTMLDivElement, ConversationViewProps>(
  function ConversationView(
    { messages, typingUsers, currentUserId },
    ref
  ) {
    return (
      <ScrollArea className="flex-1" ref={ref}>
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
            const prevMsg = messages[idx - 1];
            const timeDiff = prevMsg
              ? new Date(msg.createdAt as string).getTime() -
                new Date(prevMsg.createdAt as string).getTime()
              : Infinity;
            const showGap = timeDiff > 5 * 60 * 1000; // 5 minutes

            return (
              <MessageBubble
                key={msg.id as string}
                msg={msg}
                prevMsg={idx > 0 ? prevMsg : null}
                currentUserId={currentUserId}
                showDateSeparator={showGap && idx > 0}
              />
            );
          })}

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
    );
  }
);
