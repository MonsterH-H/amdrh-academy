"use client";

import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/utils/format";

interface MessageBubbleProps {
  msg: Record<string, unknown>;
  prevMsg?: Record<string, unknown> | null;
  currentUserId?: string;
  showDateSeparator: boolean;
}

export function MessageBubble({
  msg,
  prevMsg,
  currentUserId,
  showDateSeparator,
}: MessageBubbleProps) {
  const isMine = msg.senderId === currentUserId;
  const sender = msg.sender as Record<string, unknown> | null;
  const isSameSender = prevMsg && prevMsg.senderId === msg.senderId;

  return (
    <div>
      {showDateSeparator && prevMsg && (
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-border/40" />
          <span className="text-[10px] text-muted-foreground">
            {formatTimeAgo(msg.createdAt as string)}
          </span>
          <div className="flex-1 h-px bg-border/40" />
        </div>
      )}

      <div className={cn("flex", isMine ? "justify-end" : "justify-start")}>
        <div
          className={cn(
            "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
            isMine
              ? "bg-primary text-white rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md",
            isSameSender && "rounded-t-md"
          )}
        >
          {!isMine && !isSameSender && sender && (
            <p className="text-[10px] font-semibold opacity-70 mb-1">
              {sender.prenom as string} {sender.nom as string}
            </p>
          )}
          <p className="leading-relaxed whitespace-pre-wrap">
            {msg.content as string}
          </p>
          <p
            className={cn(
              "text-[10px] mt-1 text-right",
              isMine ? "opacity-70" : "text-muted-foreground"
            )}
          >
            {new Date(msg.createdAt as string).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {isMine && !!msg.isRead && <span className="ml-1">✓✓</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
