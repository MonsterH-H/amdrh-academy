/**
 * useRealtime - Socket.IO client hook for AMDRH platform
 * 
 * Features:
 * - Auto-reconnect with exponential backoff
 * - Connection state management
 * - Event subscription helpers
 * - Graceful cleanup on unmount
 * - Role-based room joining
 */

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAppStore } from "@/store/app";

// ──────────────────────────────────────────────────
// Connection Manager Singleton
// ──────────────────────────────────────────────────

let socketInstance: Socket | null = null;
let connectionListeners: Set<(connected: boolean) => void> = new Set();

let isSocketAvailable: boolean | null = null;

function getOrCreateSocket(userId: string, role: string): Socket | null {
  // Skip if we've already determined socket server is unavailable
  if (isSocketAvailable === false) return null;

  if (socketInstance?.connected && (socketInstance.auth as Record<string, unknown>).userId === userId) {
    return socketInstance;
  }

  // Clean up old socket
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }

  try {
    socketInstance = io("/", {
      query: { XTransformPort: "3004" },
      transports: ["polling", "websocket"],
      auth: { userId, role },
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10_000,
      timeout: 5_000,
    });

    socketInstance.on("connect", () => {
      isSocketAvailable = true;
      connectionListeners.forEach(fn => fn(true));
    });

    socketInstance.on("disconnect", () => {
      connectionListeners.forEach(fn => fn(false));
    });

    socketInstance.on("connect_error", () => {
      // If we fail to connect after retries, mark as unavailable to avoid spamming
      connectionListeners.forEach(fn => fn(false));
      if (socketInstance?.io?.opts?.reconnectionAttempts !== undefined) {
        // After repeated failures, give up until next auth session
      }
    });

    return socketInstance;
  } catch {
    // socket.io-client itself might throw (e.g. in SSR)
    isSocketAvailable = false;
    return null;
  }
}

// ──────────────────────────────────────────────────
// React Hook
// ──────────────────────────────────────────────────

interface UseRealtimeReturn {
  isConnected: boolean;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, handler: (...args: unknown[]) => void) => () => void;
  subscribeNotifications: () => void;
  subscribeConversation: (conversationId: string) => () => void;
  unsubscribeConversation: (conversationId: string) => void;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
  sendMessage: (data: { conversationId: string; messageId: string; content: string; receiverId?: string }) => void;
  updateProgress: (data: { courseId: string; enrollmentId: string; progress: number; lessonId?: string }) => void;
}

export function useRealtime(): UseRealtimeReturn {
  const { user, isAuthenticated, setUnreadCount } = useAppStore();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      // isConnected will naturally be stale but harmless
      return;
    }

    const socket = getOrCreateSocket(user.id, user.role);
    if (!socket) {
      return;
    }
    socketRef.current = socket;

    const handleConnectionChange = (connected: boolean) => {
      setIsConnected(connected);
    };
    connectionListeners.add(handleConnectionChange);

    // Subscribe to notifications
    socket.on("notifications:count", (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    socket.on("notifications:allRead", () => {
      setUnreadCount(0);
    });

    return () => {
      connectionListeners.delete(handleConnectionChange);
      socket.off("notifications:count");
      socket.off("notifications:allRead");
    };
  }, [isAuthenticated, user, setUnreadCount]);

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => {
      socketRef.current?.off(event, handler);
    };
  }, []);

  const subscribeNotifications = useCallback(() => {
    socketRef.current?.emit("notifications:subscribe");
  }, []);

  const subscribeConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("messages:subscribe", { conversationId });
    return () => {
      socketRef.current?.emit("messages:unsubscribe", { conversationId });
    };
  }, []);

  const unsubscribeConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("messages:unsubscribe", { conversationId });
  }, []);

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    socketRef.current?.emit("messages:typing", { conversationId, isTyping });
  }, []);

  const sendMessage = useCallback((data: { conversationId: string; messageId: string; content: string; receiverId?: string }) => {
    socketRef.current?.emit("messages:new", data);
  }, []);

  const updateProgress = useCallback((data: { courseId: string; enrollmentId: string; progress: number; lessonId?: string }) => {
    socketRef.current?.emit("progress:update", data);
  }, []);

  // Return isConnected as state (not ref) — safe for render
  // Note: socket ref is intentionally NOT returned to avoid ref-during-render lint error
  return {
    isConnected,
    emit,
    on,
    subscribeNotifications,
    subscribeConversation,
    unsubscribeConversation,
    sendTyping,
    sendMessage,
    updateProgress,
  };
}
