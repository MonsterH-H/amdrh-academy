import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    if (!userId) {
      return NextResponse.json({ error: "Utilisateur requis" }, { status: 400 });
    }

    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;
    if (unreadOnly) where.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      db.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, notificationId, markAll } = await req.json();

    if (markAll && userId) {
      await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      await db.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
