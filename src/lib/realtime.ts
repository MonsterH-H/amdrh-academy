/**
 * Real-Time Push Helpers
 *
 * Bridge between Next.js API routes and the Socket.IO service.
 * Extracted from the API route to avoid cross-route imports.
 */

const REALTIME_SERVICE_URL = process.env.REALTIME_SERVICE_URL || "http://localhost:3004";

/**
 * Push a notification event to all connected sockets for a user
 */
export async function pushToUser(userId: string, event: string, data: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(`${REALTIME_SERVICE_URL}/push/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, event, data }),
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Push a notification event to all users of a specific role
 */
export async function pushToRole(role: string, event: string, data: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(`${REALTIME_SERVICE_URL}/push/role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, event, data }),
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Push to all connected sockets (broadcast)
 */
export async function pushToAll(event: string, data: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(`${REALTIME_SERVICE_URL}/push/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data }),
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Update the cached unread notification count for a user
 */
export async function updateNotificationCount(userId: string, count: number): Promise<void> {
  try {
    await fetch(`${REALTIME_SERVICE_URL}/cache/notification-count`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, count }),
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // Silent failure — graceful degradation
  }
}
