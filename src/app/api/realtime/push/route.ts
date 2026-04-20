/**
 * Real-Time Push API
 * 
 * Called by other API routes to push events to the WebSocket service.
 * This is the bridge between Next.js API routes and the Socket.IO service.
 */

import { NextRequest, NextResponse } from "next/server";

const REALTIME_SERVICE_URL = process.env.REALTIME_SERVICE_URL || "http://localhost:3004";

/**
 * Push a notification event to all connected sockets for a user
 */
export async function pushToUser(userId: string, event: string, data: Record<string, unknown>) {
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
export async function pushToRole(role: string, event: string, data: Record<string, unknown>) {
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
export async function pushToAll(event: string, data: Record<string, unknown>) {
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
export async function updateNotificationCount(userId: string, count: number) {
  try {
    await fetch(`${REALTIME_SERVICE_URL}/cache/notification-count`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, count }),
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // Silent failure
  }
}

// ──────────────────────────────────────────────────
// API Route Handler
// ──────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, userId, role, event, data } = body;

    if (!type || !event) {
      return NextResponse.json({ error: "Missing type or event" }, { status: 400 });
    }

    // Forward to WebSocket service (fire and forget)
    if (userId) {
      pushToUser(userId, event, data || {}).catch(() => {});
    } else if (role) {
      pushToRole(role, event, data || {}).catch(() => {});
    } else {
      pushToAll(event, data || {}).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
