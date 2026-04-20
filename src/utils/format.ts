/**
 * Format seconds into a human-readable time string.
 * Handles seconds, minutes, and hours.
 *
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "5min", "1h 30min")
 */
export function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "0min";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}min`;
  return `${mins}min`;
}

/**
 * Format seconds into a countdown timer string (MM:SS).
 *
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "05:30")
 */
export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

/**
 * Format minutes into a human-readable duration string.
 *
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "45 min", "1h 30min")
 */
export function formatDuration(minutes: number): string {
  if (!minutes && minutes !== 0) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Format a date string into a locale-aware short format (fr-FR).
 * e.g., "14 janv. 2025"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a date string into a long locale-aware format (fr-FR).
 * e.g., "14 janvier 2025"
 */
export function formatDateLong(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format a file size in bytes into a human-readable string.
 * Uses French units (o, Ko, Mo, Go).
 *
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "2.5 Mo", "150 Ko")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 o";
  const units = ["o", "Ko", "Mo", "Go"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

/**
 * Format a date string as relative time ago (fr-FR).
 * e.g., "À l'instant", "Il y a 5 min", "Il y a 2h", "il y a 3j"
 */
export function formatTimeAgo(dateStr: string): string {
  if (!dateStr) return "—";
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

/**
 * Format a date string as relative time with extended granularity (fr-FR).
 * Includes weeks, months, and years.
 * e.g., "il y a 3 sem.", "il y a 2 mois", "il y a 1 an"
 */
export function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "À l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHour < 24) return `il y a ${diffHour}h`;
  if (diffDay < 7) return `il y a ${diffDay}j`;
  if (diffWeek < 4) return `il y a ${diffWeek} sem.`;
  if (diffMonth < 12) return `il y a ${diffMonth} mois`;
  return `il y a ${diffYear} an${diffYear > 1 ? "s" : ""}`;
}

/**
 * Get initials from a first name and last name.
 * e.g., getInitials("Dupont", "Jean") → "JD"
 */
export function getInitials(nom: string, prenom: string): string {
  if (!nom || !prenom) return "—";
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

/**
 * Format a timestamp (in ms) as relative time (fr-FR).
 * e.g., "à l'instant", "il y a 5s", "il y a 3 min", "il y a 2h"
 */
export function formatTimestampAgo(timestamp: number): string {
  if (!timestamp && timestamp !== 0) return "—";
  const diff = Date.now() - timestamp;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "à l'instant";
  if (sec < 3600) return `il y a ${Math.floor(sec / 60)} min`;
  if (sec < 86400) return `il y a ${Math.floor(sec / 3600)}h`;
  if (sec < 604800) return `il y a ${Math.floor(sec / 86400)}j`;
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}
