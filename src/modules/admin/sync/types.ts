import {
  CheckCircle2, XCircle, Clock, Loader2,
  Database, Users, Award, BookOpen, HelpCircle,
} from "lucide-react";

// ──────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────

export interface SyncRecord {
  id: string;
  type: string;
  status: string;
  totalRecords: number;
  processedRecords: number;
  errorRecords: number;
  errorMessage?: string | null;
  startedAt: string;
  completedAt?: string | null;
  triggeredBy: string;
}

export interface SyncStats {
  total: number;
  completed: number;
  errors: number;
  successRate: number;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
}

export interface LiveProgress {
  syncId: string;
  type: string;
  status: string;
  totalRecords: number;
  processedRecords: number;
  errorRecords: number;
  currentRecord?: string;
  phase?: string;
}

export type SyncType = "licence_sync" | "certification_sync" | "users_sync" | "courses_sync" | "quizzes_sync";

// ──────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────

export const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  EN_ATTENTE: { label: "En attente", color: "bg-muted text-muted-foreground", icon: Clock },
  EN_COURS: { label: "En cours", color: "bg-primary/10 text-primary", icon: Loader2 },
  TERMINE: { label: "Terminé", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400", icon: CheckCircle2 },
  ERREUR: { label: "Erreur", color: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400", icon: XCircle },
};

export const syncCards: Array<{ type: SyncType; label: string; desc: string; icon: typeof Database; color: string; bg: string; variant?: "default" | "outline" }> = [
  { type: "licence_sync", label: "Licences", desc: "Valider et normaliser les numéros de licence fédérale", icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/50" },
  { type: "certification_sync", label: "Certifications", desc: "Vérifier l'intégrité des certificats et badges", icon: Award, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50" },
  { type: "users_sync", label: "Utilisateurs", desc: "Analyser et normaliser les données utilisateurs", icon: Database, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/50", variant: "outline" },
  { type: "courses_sync", label: "Cours", desc: "Vérifier l'intégrité du catalogue et des parcours", icon: BookOpen, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/50", variant: "outline" },
  { type: "quizzes_sync", label: "Quiz", desc: "Valider les quiz, questions et tentatives", icon: HelpCircle, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/50", variant: "outline" },
];
