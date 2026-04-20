"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export function MessageInput({
  value,
  onChange,
  onKeyDown,
  onSubmit,
}: MessageInputProps) {
  return (
    <div className="border-t border-border/40 p-3 sm:p-4 bg-background">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex gap-2 max-w-2xl mx-auto"
      >
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Écrire un message..."
          className="rounded-lg min-h-[44px]"
          autoFocus
        />
        <Button
          type="submit"
          size="icon"
          className="rounded-lg flex-shrink-0 min-w-[44px] min-h-[44px]"
          disabled={!value.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
