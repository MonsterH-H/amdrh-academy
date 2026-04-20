/**
 * Get online users count API
 */

import { NextRequest, NextResponse } from "next/server";

const REALTIME_SERVICE_URL = process.env.REALTIME_SERVICE_URL || "http://localhost:3004";

export async function GET(request: NextRequest) {
  try {
    const role = request.nextUrl.searchParams.get("role");
    const url = role
      ? `${REALTIME_SERVICE_URL}/presence/role?role=${role}`
      : `${REALTIME_SERVICE_URL}/presence/online`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      // If realtime service is down, return default
      return NextResponse.json({ count: 0, users: [] });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ count: 0, users: [] });
  }
}
