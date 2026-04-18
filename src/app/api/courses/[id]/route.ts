import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const course = await db.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { id: true, nom: true, prenom: true, avatar: true, bio: true } },
        sections: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        quiz: {
          include: {
            _count: { select: { questions: true, attempts: true } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    let enrollment = null;
    if (userId) {
      enrollment = await db.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId: id } },
        include: {
          lessonProgress: true,
        },
      });
    }

    return NextResponse.json({ course, enrollment });
  } catch (error) {
    console.error("Course detail error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement du cours" },
      { status: 500 }
    );
  }
}
