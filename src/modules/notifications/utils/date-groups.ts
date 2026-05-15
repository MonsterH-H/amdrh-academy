/**
 * Group notifications by date category.
 * Returns groups: Aujourd'hui, Hier, Cette semaine, Plus ancien.
 */
export interface NotificationGroup {
  label: string;
  notifications: Array<Record<string, unknown>>;
}

export function groupNotificationsByDate(
  notifications: Array<Record<string, unknown>>,
): NotificationGroup[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 7 * 86400000);

  const groups: NotificationGroup[] = [
    { label: "Aujourd'hui", notifications: [] },
    { label: "Hier", notifications: [] },
    { label: "Cette semaine", notifications: [] },
    { label: "Plus ancien", notifications: [] },
  ];

  for (const notif of notifications) {
    const created = new Date(notif.createdAt as string);
    if (created >= todayStart) {
      groups[0].notifications.push(notif);
    } else if (created >= yesterdayStart) {
      groups[1].notifications.push(notif);
    } else if (created >= weekStart) {
      groups[2].notifications.push(notif);
    } else {
      groups[3].notifications.push(notif);
    }
  }

  return groups.filter((g) => g.notifications.length > 0);
}
