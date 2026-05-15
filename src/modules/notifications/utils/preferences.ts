/**
 * Notification preference management (localStorage).
 * Keys: COURS, CERTIFICAT, QUIZ, MESSAGE, SYSTEME
 * Each boolean: true = enabled, false = disabled
 */

export interface NotificationPreferences {
  COURS: boolean;
  CERTIFICAT: boolean;
  QUIZ: boolean;
  MESSAGE: boolean;
  SYSTEME: boolean;
}

const STORAGE_KEY = "amdrh-notification-prefs";

const DEFAULTS: NotificationPreferences = {
  COURS: true,
  CERTIFICAT: true,
  QUIZ: true,
  MESSAGE: true,
  SYSTEME: true,
};

export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function setNotificationPreferences(
  prefs: Partial<NotificationPreferences>,
): NotificationPreferences {
  const current = getNotificationPreferences();
  const updated = { ...current, ...prefs };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}
