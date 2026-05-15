/**
 * @module services/messages
 * @description Messaging service — conversations list, messages, and sending.
 */

import { request } from "./auth.service";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** User summary used in conversation context. */
export interface MessageUser {
  id: string;
  nom: string;
  prenom: string;
  avatar?: string | null;
}

/** A conversation list item. */
export interface Conversation {
  id: string;
  otherUser: MessageUser | null;
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
  totalMessages: number;
  lastReadAt: string | null;
}

/** A single message. */
export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: Pick<MessageUser, "nom" | "prenom" | "avatar">;
  createdAt: string;
  isRead: boolean;
}

// ─────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────

export const messagesService = {
  /**
   * Fetch all conversations for a user, with unread counts and last messages.
   *
   * @param userId - The user UUID.
   * @returns Array of conversations with metadata.
   */
  fetchConversations: async (
    userId: string
  ): Promise<{ conversations: Conversation[] }> => {
    return request<{ conversations: Conversation[] }>(
      `/api/messages?userId=${userId}`
    );
  },

  /**
   * Create a new conversation (or return existing one) between two users.
   *
   * @param userId1 - First participant UUID.
   * @param userId2 - Second participant UUID.
   * @param subject - Optional conversation subject line.
   * @returns The conversation UUID (existing or newly created).
   */
  createConversation: async (
    userId1: string,
    userId2: string,
    subject?: string
  ): Promise<{ conversationId: string }> => {
    return request<{ conversationId: string }>("/api/messages", {
      method: "POST",
      body: JSON.stringify({ userId1, userId2, subject }),
    });
  },

  /**
   * Fetch messages within a conversation. Also marks messages as read.
   *
   * @param conversationId - The conversation UUID.
   * @param userId         - The current user UUID (for read marking).
   * @returns Array of messages (up to 50, ordered oldest-first).
   */
  fetchMessages: async (
    conversationId: string,
    userId: string
  ): Promise<{ messages: Message[] }> => {
    return request<{ messages: Message[] }>(
      `/api/messages/${conversationId}?userId=${userId}`
    );
  },

  /**
   * Send a message within an existing conversation.
   *
   * @param conversationId - The conversation UUID.
   * @param senderId       - The sending user UUID.
   * @param content        - The message text (max 5000 chars).
   * @returns The created message object.
   */
  sendMessage: async (
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<{ message: Message }> => {
    return request<{ message: Message }>(`/api/messages/${conversationId}`, {
      method: "POST",
      body: JSON.stringify({ senderId, content }),
    });
  },
};
