import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

export async function GET() {
  try {
    const syncs = await db.federationSync.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ syncs });
  } catch (error) {
    console.error("Sync history error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const { type, triggeredBy } = await req.json();

    const sync = await db.federationSync.create({
      data: {
        type: type || "licence_sync",
        triggeredBy: triggeredBy || "admin",
        status: "EN_COURS",
      },
    });

    // Simulate sync processing
    const totalUsers = await db.user.count({ where: { isActive: true } });

    await db.federationSync.update({
      where: { id: sync.id },
      data: {
        status: "TERMINE",
        totalRecords: totalUsers,
        processedRecords: totalUsers,
        errorRecords: 0,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ syncId: sync.id, status: "TERMINE" });
  } catch (error) {
    console.error("Sync trigger error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
