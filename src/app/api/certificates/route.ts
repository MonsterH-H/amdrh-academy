import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Utilisateur requis" }, { status: 400 });
    }

    const certificates = await db.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json({ certificates });
  } catch (error) {
    console.error("Certificates error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
