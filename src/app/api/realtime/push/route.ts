/**
 * Real-Time Push API Route
 *
 * API endpoint for pushing events to the WebSocket service.
 * Uses helper functions from @/lib/realtime.
 */

import { NextRequest, NextResponse } from "next/server";
import { pushToUser, pushToRole, pushToAll } from "@/lib/realtime";

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
