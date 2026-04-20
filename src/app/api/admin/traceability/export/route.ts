import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

// GET /api/admin/traceability/export — CSV export
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const courseId = searchParams.get("courseId") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { user: { nom: { contains: search } } },
        { user: { prenom: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }
    if (courseId) where.courseId = courseId;
    if (status && status !== "all") where.status = status;

    const enrollments = await db.enrollment.findMany({
      where,
      include: {
        user: { select: { id: true, nom: true, prenom: true, email: true, role: true } },
        course: { select: { id: true, title: true, category: true } },
        lessonProgress: {
          include: { lesson: { select: { id: true, title: true, type: true } } },
        },
      },
      orderBy: { lastAccessAt: "desc" },
      take: 1000,
    });

    const rows: string[] = [];
    rows.push("Apprenant,Email,Rôle,Cours,Catégorie,Statut,Progression (%),Leçons complétées,Durée totale,Dernier accès,Date inscription");
    for (const e of enrollments) {
      const completedLessons = e.lessonProgress.filter((lp) => lp.completed).length;
      const totalTimeSpent = e.lessonProgress.reduce((s, lp) => s + lp.timeSpent, 0);
      const hours = Math.floor(totalTimeSpent / 3600);
      const mins = Math.floor((totalTimeSpent % 3600) / 60);
      const timeStr = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
      rows.push([
        `"${e.user.prenom} ${e.user.nom}"`,
        e.user.email,
        e.user.role,
        `"${e.course.title}"`,
        e.course.category,
        e.status,
        String(Math.round(e.progress)),
        String(completedLessons),
        timeStr,
        e.lastAccessAt.toISOString(),
        e.startedAt.toISOString(),
      ].join(","));
    }

    const csvContent = "\uFEFF" + rows.join("\n");
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv;charset=utf-8;",
        "Content-Disposition": `attachment; filename="traceabilite-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Traceability export error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
