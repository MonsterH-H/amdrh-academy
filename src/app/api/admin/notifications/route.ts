import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { NotificationType, UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build where clause for notifications
    const where: Record<string, unknown> = {};
    if (type && Object.values(NotificationType).includes(type as NotificationType)) {
      where.type = type;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { message: { contains: search, mode: "insensitive" } },
      ];
    }

    // Stats: total notifications, by type, read rate
    const [total, allNotifications, typeGroups] = await Promise.all([
      db.notification.count({ where }),
      db.notification.count(),
      db.notification.groupBy({
        by: ["type"],
        _count: { id: true },
      }),
    ]);

    const readCount = await db.notification.count({ where: { isRead: true } });
    const readRate = allNotifications > 0 ? Math.round((readCount / allNotifications) * 100) : 0;

    const byType: Record<string, number> = {};
    for (const group of typeGroups) {
      byType[group.type] = group._count.id;
    }

    // Fetch notifications with user info
    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            email: true,
            role: true,
            avatar: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      stats: {
        total,
        byType,
        readRate,
        readCount,
        unreadCount: allNotifications - readCount,
      },
      notifications,
      pagination: {
        page,
        limit,
        totalPages,
        total,
      },
    });
  } catch (error) {
    console.error("Admin notifications GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, message, type, targetAll, targetRoles, userId } = body;

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: "Titre, message et type sont requis" },
        { status: 400 }
      );
    }

    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json(
        { error: "Type de notification invalide" },
        { status: 400 }
      );
    }

    const validRoles = Object.values(UserRole);

    if (targetAll) {
      // Broadcast to ALL active users (exclude ADMIN to avoid self-spam)
      const users = await db.user.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      if (users.length === 0) {
        return NextResponse.json(
          { error: "Aucun utilisateur actif trouvé" },
          { status: 404 }
        );
      }

      const created = await db.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          type,
          title,
          message,
        })),
      });

      return NextResponse.json({
        count: created.count,
        message: `Notification envoyée à ${created.count} utilisateurs`,
      });
    }

    if (targetRoles && Array.isArray(targetRoles) && targetRoles.length > 0) {
      // Validate roles
      const invalidRoles = targetRoles.filter((r: string) => !validRoles.includes(r as UserRole));
      if (invalidRoles.length > 0) {
        return NextResponse.json(
          { error: `Rôles invalides: ${invalidRoles.join(", ")}` },
          { status: 400 }
        );
      }

      const users = await db.user.findMany({
        where: {
          isActive: true,
          role: { in: targetRoles as UserRole[] },
        },
        select: { id: true },
      });

      if (users.length === 0) {
        return NextResponse.json(
          { error: "Aucun utilisateur trouvé pour les rôles sélectionnés" },
          { status: 404 }
        );
      }

      const created = await db.notification.createMany({
        data: users.map((u) => ({
          userId: u.id,
          type,
          title,
          message,
        })),
      });

      return NextResponse.json({
        count: created.count,
        message: `Notification envoyée à ${created.count} utilisateur(s) (${targetRoles.join(", ")})`,
      });
    }

    if (userId) {
      // Target specific user
      const targetUser = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, isActive: true },
      });

      if (!targetUser) {
        return NextResponse.json(
          { error: "Utilisateur introuvable" },
          { status: 404 }
        );
      }

      if (!targetUser.isActive) {
        return NextResponse.json(
          { error: "Cet utilisateur est inactif" },
          { status: 400 }
        );
      }

      await db.notification.create({
        data: {
          userId: targetUser.id,
          type,
          title,
          message,
        },
      });

      return NextResponse.json({
        count: 1,
        message: "Notification envoyée à l'utilisateur",
      });
    }

    return NextResponse.json(
      { error: "Veuillez spécifier une cible (tous, rôles, ou un utilisateur)" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin notifications POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
