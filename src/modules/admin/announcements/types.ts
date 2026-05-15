export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  targetRoles: string;
  authorId: string;
  author: {
    id: string;
    prenom: string;
    nom: string;
    role: string;
  };
  isPinned: boolean;
  isPublished: boolean;
  publishedAt: string;
  expiresAt: string | null;
  createdAt: string;
}
