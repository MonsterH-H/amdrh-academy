export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender?: MessageSender;
  conversationId: string;
  createdAt: string;
  isRead: boolean;
}

export interface MessageSender {
  id: string;
  nom: string;
  prenom: string;
  avatar?: string | null;
}

export interface Conversation {
  id: string;
  unreadCount: number;
  online?: boolean;
  otherUser?: MessageSender;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
  };
}

export interface ConversationWithParticipants {
  id: string;
  participantIds: string[];
  participants: MessageSender[];
  lastMessage?: Message;
  unreadCounts?: Record<string, number>;
}
