/**
 * useRealtime - Socket.IO client hook for AMDRH platform
 * 
 * Features:
 * - Graceful degradation when service is unavailable (no console errors)
 * - Auto-reconnect with exponential backoff
 * - Connection state management
 * - Event subscription helpers
 * - Role-based room joining
 * - 60-second cooldown after connection failure (prevents 404 spam)
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
let socketDisabledUntil: number = 0;
const SOCKET_RETRY_COOLDOWN = 60_000; // 1 minute cooldown after failure

function getOrCreateSocket(userId: string, role: string): Socket | null {
  // Skip if we've recently determined socket server is unavailable (cooldown)
  const now = Date.now();
  if (isSocketAvailable === false && now < socketDisabledUntil) return null;
  // Reset cooldown period if it expired
  if (isSocketAvailable === false && now >= socketDisabledUntil) {
    isSocketAvailable = null; // Allow retry
  }

  if (socketInstance?.connected && (socketInstance.auth as Record<string, unknown>).userId === userId) {
    return socketInstance;
  }

  // Clean up old socket
  if (socketInstance) {
    try {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
    } catch { /* ignore cleanup errors */ }
    socketInstance = null;
  }

  try {
    socketInstance = io("/", {
      query: { XTransformPort: "3004" },
      transports: ["polling", "websocket"],
      auth: { userId, role },
      reconnection: true,
      reconnectionAttempts: 2,
      reconnectionDelay: 3_000,
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
      // Silently handle — don't spam console
      connectionListeners.forEach(fn => fn(false));
    });

    socketInstance.io.on("reconnect_failed", () => {
      isSocketAvailable = false;
      socketDisabledUntil = Date.now() + SOCKET_RETRY_COOLDOWN;
    });

    return socketInstance;
  } catch {
    // socket.io-client itself might throw (e.g. in SSR)
    isSocketAvailable = false;
    socketDisabledUntil = Date.now() + SOCKET_RETRY_COOLDOWN;
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
        try {
          socketRef.current.disconnect();
        } catch { /* ignore */ }
        socketRef.current = null;
      }
      return;
    }

    const socket = getOrCreateSocket(user.id, user.role);
    if (!socket) {
      // Socket unavailable — clean up any existing ref, but let connected state persist naturally
      socketRef.current = null;
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
      if (socketRef.current) {
        socketRef.current.off("notifications:count");
        socketRef.current.off("notifications:allRead");
      }
    };
  }, [isAuthenticated, user, setUnreadCount]);

  const emit = useCallback((event: string, data?: unknown) => {
    try { socketRef.current?.emit(event, data); } catch { /* silent */ }
  }, []);

  const on = useCallback((event: string, handler: (...args: unknown[]) => void) => {
    try {
      socketRef.current?.on(event, handler);
      return () => {
        try { socketRef.current?.off(event, handler); } catch { /* silent */ }
      };
    } catch { return () => {}; }
  }, []);

  const subscribeNotifications = useCallback(() => {
    try { socketRef.current?.emit("notifications:subscribe"); } catch { /* silent */ }
  }, []);

  const subscribeConversation = useCallback((conversationId: string) => {
    try { socketRef.current?.emit("messages:subscribe", { conversationId }); } catch { /* silent */ }
    return () => {
      try { socketRef.current?.emit("messages:unsubscribe", { conversationId }); } catch { /* silent */ }
    };
  }, []);

  const unsubscribeConversation = useCallback((conversationId: string) => {
    try { socketRef.current?.emit("messages:unsubscribe", { conversationId }); } catch { /* silent */ }
  }, []);

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    try { socketRef.current?.emit("messages:typing", { conversationId, isTyping }); } catch { /* silent */ }
  }, []);

  const sendMessage = useCallback((data: { conversationId: string; messageId: string; content: string; receiverId?: string }) => {
    try { socketRef.current?.emit("messages:new", data); } catch { /* silent */ }
  }, []);

  const updateProgress = useCallback((data: { courseId: string; enrollmentId: string; progress: number; lessonId?: string }) => {
    try { socketRef.current?.emit("progress:update", data); } catch { /* silent */ }
  }, []);

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
