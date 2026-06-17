"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function MessageInput({
  value,
  onChange,
  onKeyDown,
  onSubmit,
  disabled = false,
}: MessageInputProps) {
  return (
    <div className="border-t border-border/40 p-3 sm:p-4 bg-background">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!disabled) onSubmit();
        }}
        className="flex gap-2 max-w-2xl mx-auto"
      >
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (!disabled) onKeyDown(e);
          }}
          placeholder="Écrire un message..."
          className="rounded-lg min-h-[44px]"
          autoFocus
          disabled={disabled}
        />
        <Button
          type="submit"
          size="icon"
          className="rounded-lg flex-shrink-0 min-w-[44px] min-h-[44px]"
          disabled={!value.trim() || disabled}
        >
          {disabled ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
