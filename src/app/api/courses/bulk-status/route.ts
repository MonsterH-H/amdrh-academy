import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courseIds, status } = body;

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({ error: "courseIds est requis" }, { status: 400 });
    }

    if (!status || !["BROUILLON", "EN_REVISION", "VALIDE", "PUBLIE", "ARCHIVE"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const result = await db.course.updateMany({
      where: { id: { in: courseIds } },
      data: { status },
    });

    return NextResponse.json({
      message: `${result.count} cours mis à jour vers "${status}"`,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Bulk status update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour en masse" },
      { status: 500 }
    );
  }
}
