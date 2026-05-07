import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const userInfo = getUserFromRequest(req);
    if (!userInfo) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

    const certificates = await db.certificate.findMany({
      where: { userId: userInfo.userId },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error("Certificates error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
