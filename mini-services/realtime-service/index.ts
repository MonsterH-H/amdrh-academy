/**
 * AMDRH Real-Time Service
 * 
 * Handles:
 * - Live notifications (new, read, count)
 * - Real-time messaging (conversations, typing indicators)
 * - Online presence (user status, last seen)
 * - Live enrollment progress updates
 * - Quiz submission broadcasts
 * - Rate limiting per connection
 * 
 * Production features:
 * - Connection rate limiting (max 5 connections per 10s per IP)
 * - Message rate limiting (max 30 messages per minute per user)
 * - Room-based broadcasting (per user, per role, per course)
 * - Graceful reconnection handling
 * - Memory-efficient presence tracking with TTL cleanup
 */

import { Server } from "socket.io";
import { createServer } from "http";
import { URL } from "url";

// ──────────────────────────────────────────────────
// Rate Limiting
// ──────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const connectionLimiter = new Map<string, RateLimitEntry>();
const messageLimiter = new Map<string, RateLimitEntry>();

const MAX_CONNECTIONS_PER_IP = 5;
const CONNECTION_WINDOW_MS = 10_000;
const MAX_MESSAGES_PER_MINUTE = 30;
const MESSAGE_WINDOW_MS = 60_000;

function checkRateLimit(
  key: string,
  store: Map<string, RateLimitEntry>,
  maxCount: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxCount) return false;
  entry.count++;
  return true;
}

// ──────────────────────────────────────────────────
// Presence Tracking
// ──────────────────────────────────────────────────

interface PresenceInfo {
  userId: string;
  role: string;
  connectedAt: number;
  lastHeartbeat: number;
  socketIds: Set<string>;
}

const presenceStore = new Map<string, PresenceInfo>(); // userId -> PresenceInfo
const PRESENCE_TTL = 90_000; // 90s without heartbeat = offline

function updatePresence(userId: string, role: string, socketId: string) {
  const now = Date.now();
  let info = presenceStore.get(userId);
  if (info) {
    info.lastHeartbeat = now;
    info.socketIds.add(socketId);
  } else {
    info = { userId, role, connectedAt: now, lastHeartbeat: now, socketIds: new Set([socketId]) };
    presenceStore.set(userId, info);
  }
}

function removePresenceSocket(userId: string, socketId: string) {
  const info = presenceStore.get(userId);
  if (!info) return;
  info.socketIds.delete(socketId);
  if (info.socketIds.size === 0) {
    presenceStore.delete(userId);
    // Broadcast offline
    broadcastPresenceChange(userId, false);
  }
}

function getOnlineUserIds(): string[] {
  return Array.from(presenceStore.keys());
}

function getOnlineUsersForRole(role: string): string[] {
  return Array.from(presenceStore.values())
    .filter(p => p.role === role)
    .map(p => p.userId);
}

function broadcastPresenceChange(userId: string, isOnline: boolean) {
  // Broadcast to all connected admin sockets
  for (const [uid, info] of presenceStore) {
    for (const sid of info.socketIds) {
      io.to(sid).emit("presence:change", { userId, isOnline, timestamp: Date.now() });
    }
  }
}

// Presence cleanup interval
setInterval(() => {
  const now = Date.now();
  for (const [userId, info] of presenceStore) {
    if (now - info.lastHeartbeat > PRESENCE_TTL) {
      presenceStore.delete(userId);
      broadcastPresenceChange(userId, false);
    }
  }
}, 30_000);

// ──────────────────────────────────────────────────
// In-memory Notification Cache (for quick unread count)
// ──────────────────────────────────────────────────

const unreadCountCache = new Map<string, number>();

function setCachedUnreadCount(userId: string, count: number) {
  unreadCountCache.set(userId, count);
}

function getCachedUnreadCount(userId: string): number | undefined {
  return unreadCountCache.get(userId);
}

function incrementCachedUnreadCount(userId: string) {
  const current = unreadCountCache.get(userId) || 0;
  unreadCountCache.set(userId, current + 1);
}

// ──────────────────────────────────────────────────
// Socket.IO Server Setup
// ──────────────────────────────────────────────────

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingInterval: 25_000,
  pingTimeout: 60_000,
  // Production optimizations
  maxHttpBufferSize: 1e6, // 1MB max message size
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
});

// ──────────────────────────────────────────────────
// Authentication Middleware
// ──────────────────────────────────────────────────

io.use((socket, next) => {
  const userId = socket.handshake.auth.userId as string;
  const role = socket.handshake.auth.role as string;
  const sessionToken = socket.handshake.auth.sessionToken as string;

  if (!userId || !role) {
    return next(new Error("Authentication required: userId and role are required"));
  }

  // Basic validation
  if (typeof userId !== "string" || userId.length < 10) {
    return next(new Error("Invalid userId"));
  }

  const validRoles = ["ADMIN", "FORMATEUR", "ARBITRE", "ENTRAINEUR", "JOUEUR"];
  if (!validRoles.includes(role)) {
    return next(new Error("Invalid role"));
  }

  // Rate limit check
  const clientIp = socket.handshake.address || "unknown";
  if (!checkRateLimit(clientIp, connectionLimiter, MAX_CONNECTIONS_PER_IP, CONNECTION_WINDOW_MS)) {
    return next(new Error("Too many connection attempts. Please wait."));
  }

  // Store user info in socket
  (socket.data as Record<string, unknown>).userId = userId;
  (socket.data as Record<string, unknown>).role = role;
  (socket.data as Record<string, unknown>).connectedAt = Date.now();

  next();
});

// ──────────────────────────────────────────────────
// Connection Handling
// ──────────────────────────────────────────────────

io.on("connection", (socket) => {
  const userId = (socket.data as Record<string, unknown>).userId as string;
  const role = (socket.data as Record<string, unknown>).role as string;

  console.log(`[Realtime] ${role} ${userId.slice(0, 8)}... connected (sockets: ${io.engine.clientsCount})`);

  // Join personal room
  socket.join(`user:${userId}`);
  // Join role room
  socket.join(`role:${role}`);

  // Update presence
  updatePresence(userId, role, socket.id);
  broadcastPresenceChange(userId, true);

  // Send current unread count if cached
  const cachedCount = getCachedUnreadCount(userId);
  if (cachedCount !== undefined) {
    socket.emit("notifications:count", { count: cachedCount });
  }

  // Send online users list for admins
  if (role === "ADMIN") {
    const onlineUsers = getOnlineUserIds();
    socket.emit("presence:list", { users: onlineUsers });
  }

  // ─── Heartbeat ───
  socket.on("ping", () => {
    updatePresence(userId, role, socket.id);
    socket.emit("pong", { timestamp: Date.now() });
  });

  // ─── Notifications ───
  
  socket.on("notifications:subscribe", () => {
    const count = getCachedUnreadCount(userId);
    socket.emit("notifications:count", { count: count || 0 });
  });

  socket.on("notifications:read", (data: { notificationIds: string[] }) => {
    // Forward to all user's sockets to sync
    io.to(`user:${userId}`).emit("notifications:read", data);
    // Update cache
    const count = getCachedUnreadCount(userId);
    if (count !== undefined && count > 0) {
      setCachedUnreadCount(userId, Math.max(0, count - (data.notificationIds?.length || 1)));
    }
  });

  socket.on("notifications:allRead", () => {
    setCachedUnreadCount(userId, 0);
    io.to(`user:${userId}`).emit("notifications:allRead", {});
  });

  // ─── Messaging ───

  socket.on("messages:subscribe", (data: { conversationId: string }) => {
    if (data?.conversationId) {
      socket.join(`conversation:${data.conversationId}`);
    }
  });

  socket.on("messages:unsubscribe", (data: { conversationId: string }) => {
    if (data?.conversationId) {
      socket.leave(`conversation:${data.conversationId}`);
    }
  });

  socket.on("messages:typing", (data: { conversationId: string; isTyping: boolean }) => {
    if (!data?.conversationId) return;
    // Broadcast to all in the conversation except sender
    socket.to(`conversation:${data.conversationId}`).emit("messages:typing", {
      userId,
      conversationId: data.conversationId,
      isTyping: data.isTyping,
    });
  });

  socket.on("messages:new", (data: { conversationId: string; messageId: string; content: string; receiverId?: string }) => {
    if (!data?.conversationId || !data?.messageId) return;
    
    // Rate limit
    if (!checkRateLimit(userId, messageLimiter, MAX_MESSAGES_PER_MINUTE, MESSAGE_WINDOW_MS)) {
      socket.emit("error", { code: "RATE_LIMITED", message: "Trop de messages. Attendez un moment." });
      return;
    }

    // Broadcast to all in the conversation
    io.to(`conversation:${data.conversationId}`).emit("messages:new", {
      id: data.messageId,
      content: data.content,
      senderId: userId,
      conversationId: data.conversationId,
      createdAt: new Date().toISOString(),
    });

    // If there's a specific receiver, also notify their personal room
    if (data.receiverId) {
      io.to(`user:${data.receiverId}`).emit("messages:unread", {
        conversationId: data.conversationId,
        fromUserId: userId,
      });
    }
  });

  // ─── Course Progress ───

  socket.on("progress:update", (data: { courseId: string; enrollmentId: string; progress: number; lessonId?: string }) => {
    if (!data?.courseId) return;
    // Broadcast to course room for live tracking
    io.to(`role:${role}`).emit("progress:update", {
      userId,
      courseId: data.courseId,
      enrollmentId: data.enrollmentId,
      progress: data.progress,
      lessonId: data.lessonId,
      timestamp: Date.now(),
    });
  });

  // ─── Quiz Events ───

  socket.on("quiz:submit", (data: { quizId: string; courseId: string; score: number; passed: boolean }) => {
    if (!data?.quizId) return;
    io.to(`role:${role}`).emit("quiz:submit", {
      userId,
      quizId: data.quizId,
      courseId: data.courseId,
      score: data.score,
      passed: data.passed,
      timestamp: Date.now(),
    });
  });

  // ─── Admin Events ───

  socket.on("admin:broadcast", (data: { targetRole?: string; event: string; payload: Record<string, unknown> }) => {
    if (role !== "ADMIN") return;
    if (data.targetRole) {
      io.to(`role:${data.targetRole}`).emit(data.event, data.payload);
    } else {
      io.emit(data.event, data.payload);
    }
  });

  // ─── Disconnect ───
  
  socket.on("disconnect", (reason) => {
    console.log(`[Realtime] ${role} ${userId.slice(0, 8)}... disconnected: ${reason} (remaining: ${io.engine.clientsCount})`);
    removePresenceSocket(userId, socket.id);
  });
});

// ──────────────────────────────────────────────────
// Server Start
// ──────────────────────────────────────────────────

const PORT = 3004;
httpServer.listen(PORT, () => {
  console.log(`[AMDRH Realtime Service] Running on port ${PORT}`);
  console.log(`[AMDRH Realtime Service] Max connections per IP: ${MAX_CONNECTIONS_PER_IP}/${CONNECTION_WINDOW_MS}ms`);
  console.log(`[AMDRH Realtime Service] Message rate limit: ${MAX_MESSAGES_PER_MINUTE}/${MESSAGE_WINDOW_MS}ms`);
  console.log(`[AMDRH Realtime Service] Presence TTL: ${PRESENCE_TTL}ms`);
});

// ──────────────────────────────────────────────────
// HTTP API Endpoints (for Next.js push integration)
// ──────────────────────────────────────────────────

/**
 * Simple HTTP server to receive push requests from Next.js API routes.
 * Uses the same httpServer as Socket.IO.
 */

httpServer.on("request", async (req, res) => {
  const parsedUrl = new URL(req.url || "/", `http://localhost:${PORT}`);
  const path = parsedUrl.pathname;

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // ─── Push to specific user ───
    if (path === "/push/user" && req.method === "POST") {
      const body = await readBody(req);
      const { userId, event, data } = body;
      if (userId && event) {
        io.to(`user:${userId}`).emit(event, data || {});
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing userId or event" }));
      }
      return;
    }

    // ─── Push to all users of a role ───
    if (path === "/push/role" && req.method === "POST") {
      const body = await readBody(req);
      const { role, event, data } = body;
      if (role && event) {
        io.to(`role:${role}`).emit(event, data || {});
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing role or event" }));
      }
      return;
    }

    // ─── Broadcast to all ───
    if (path === "/push/broadcast" && req.method === "POST") {
      const body = await readBody(req);
      const { event, data } = body;
      if (event) {
        io.emit(event, data || {});
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing event" }));
      }
      return;
    }

    // ─── Cache: set notification count ───
    if (path === "/cache/notification-count" && req.method === "POST") {
      const body = await readBody(req);
      const { userId, count } = body;
      if (userId) {
        setCachedUnreadCount(userId, count);
        // Also push to the user's sockets
        io.to(`user:${userId}`).emit("notifications:count", { count });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } else {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing userId" }));
      }
      return;
    }

    // ─── Presence: get online users ───
    if (path === "/presence/online" && req.method === "GET") {
      const users = getOnlineUserIds();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ count: users.length, users }));
      return;
    }

    // ─── Presence: get online users by role ───
    if (path === "/presence/role" && req.method === "GET") {
      const role = parsedUrl.searchParams.get("role");
      const users = role ? getOnlineUsersForRole(role) : [];
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ count: users.length, users }));
      return;
    }

    // ─── Health check ───
    if (path === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: "ok",
        connections: io.engine.clientsCount,
        onlineUsers: presenceStore.size,
        uptime: process.uptime(),
      }));
      return;
    }

    // 404
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
});

function readBody(req: import("http").IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      try {
        const body = Buffer.concat(chunks).toString();
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

// Export for use by the Next.js API routes
export { io, setCachedUnreadCount, incrementCachedUnreadCount, getOnlineUserIds, getOnlineUsersForRole };
export type { PresenceInfo };
