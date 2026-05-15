import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const course = await db.course.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    const enrollmentStats = await db.enrollment.groupBy({
      by: ["status"],
      where: { courseId: id },
      _count: { status: true },
    });

    return NextResponse.json({
      enrollmentStats: enrollmentStats.map((s) => ({
        status: s.status,
        count: s._count.status,
      })),
    });
  } catch (error) {
    console.error("Course stats error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des statistiques" },
      { status: 500 }
    );
  }
}
