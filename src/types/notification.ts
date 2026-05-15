export type NotificationType =
  | "COURS"
  | "QUIZ"
  | "CERTIFICAT"
  | "BADGE"
  | "MESSAGE"
  | "SYSTEME";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  userId: string;
  createdAt: string;
}
