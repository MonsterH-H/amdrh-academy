import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pushToUser, updateNotificationCount } from "@/lib/realtime";
import { getUserFromRequest, requireRole } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Paramètre userId requis" }, { status: 400 });

    const type = searchParams.get("type");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

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
    const body = await req.json();
    const { userId, notificationId, markAll, action, title, message, type, link } = body;

    // ──────────────────────────────────────────────
    // CREATE a new notification with real-time push
    // (only ADMIN can create notifications)
    // ──────────────────────────────────────────────
    if (action === "create") {
      // Require ADMIN role to create notifications
      const auth = await requireRole(req, ["ADMIN"]);
      if (!auth.authorized) return auth.response;

      if (!userId) {
        return NextResponse.json(
          { error: "Utilisateur cible requis" },
          { status: 400 }
        );
      }

      if (!title || !message) {
        return NextResponse.json(
          { error: "Titre et message sont requis" },
          { status: 400 }
        );
      }

      const notification = await db.notification.create({
        data: {
          userId,
          title,
          message,
          type: type || "SYSTEME",
          link: link || null,
        },
      });

      // Push real-time event to the user
      await pushToUser(userId, "notification:new", {
        notificationId: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        link: notification.link,
        createdAt: notification.createdAt.toISOString(),
      });

      // Update cached unread count
      const unreadCount = await db.notification.count({
        where: { userId, isRead: false },
      });
      await updateNotificationCount(userId, unreadCount);

      return NextResponse.json({
        success: true,
        notification,
      });
    }

    // ──────────────────────────────────────────────
    // MARK ALL notifications as read (auth required)
    // ──────────────────────────────────────────────
    if (markAll && userId) {
      const auth = getUserFromRequest(req);
      if (!auth || (auth.userId !== userId && auth.role !== "ADMIN")) {
        return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
      }

      const unreadBefore = await db.notification.count({
        where: { userId, isRead: false },
      });

      await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      // Push real-time update: all notifications marked as read
      if (unreadBefore > 0) {
        await pushToUser(userId, "notifications:readAll", {
          count: unreadBefore,
          timestamp: new Date().toISOString(),
        });

        // Update cached notification count to 0
        await updateNotificationCount(userId, 0);
      }

      return NextResponse.json({ success: true });
    }

    // ──────────────────────────────────────────────
    // MARK SINGLE notification as read (auth required)
    // ──────────────────────────────────────────────
    if (notificationId) {
      const auth = getUserFromRequest(req);
      if (!auth) {
        return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
      }

      // Get notification to know the userId for push
      const notification = await db.notification.findUnique({
        where: { id: notificationId },
        select: { userId: true, title: true, type: true },
      });

      await db.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      // Push real-time update: single notification marked as read
      if (notification) {
        const unreadCountAfter = await db.notification.count({
          where: { userId: notification.userId, isRead: false },
        });

        await pushToUser(notification.userId, "notification:read", {
          notificationId,
          title: notification.title,
          type: notification.type,
          unreadCount: unreadCountAfter,
          timestamp: new Date().toISOString(),
        });

        // Update cached notification count
        await updateNotificationCount(notification.userId, unreadCountAfter);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
