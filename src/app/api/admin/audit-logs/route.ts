import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    const actionFilter = searchParams.get("action");
    const entityFilter = searchParams.get("entity");
    const userIdFilter = searchParams.get("userIdFilter");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!userId || !role) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const where: Record<string, unknown> = {};

    if (actionFilter) where.action = actionFilter;
    if (entityFilter) where.entity = entityFilter;
    if (userIdFilter) where.userId = userIdFilter;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, prenom: true, nom: true, email: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);

    // Available actions for filter dropdown
    const actionTypes = await db.auditLog.groupBy({
      by: ["action"],
      orderBy: { action: "asc" },
    });

    const entityTypes = await db.auditLog.groupBy({
      by: ["entity"],
      orderBy: { entity: "asc" },
    });

    return NextResponse.json({
      logs,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
      },
      actionTypes: actionTypes.map((a) => a.action),
      entityTypes: entityTypes.map((e) => e.entity),
    });
  } catch (error) {
    console.error("Audit logs error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, entity, entityId, details, ipAddress } = body;

    if (!userId || !action || !entity) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const log = await db.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId: entityId || null,
        details: details ? (typeof details === "string" ? details : JSON.stringify(details)) : null,
        ipAddress: ipAddress || req.headers.get("x-forwarded-for") || null,
      },
      include: {
        user: { select: { prenom: true, nom: true } },
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error("Audit log create error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
