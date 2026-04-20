// ──────────────────────────────────────────────────────────
// Types for Messages module
// ──────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  avatar?: string | null;
  club?: string | null;
}

export type UserOption = Participant;

export interface TypingUser {
  userId: string;
  name: string;
  conversationId: string;
}

// ──────────────────────────────────────────────────────────
// Date formatting helpers (shared utilities imported from @/utils/format)
// ──────────────────────────────────────────────────────────

export function formatMessageDate(dateStr: string): string {
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
