import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    const where: Record<string, unknown> = {};
    if (role && role !== "ADMIN") {
      where.targetRole = role;
    }

    const paths = await db.learningPath.findMany({
      where,
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                category: true,
                difficulty: true,
                coverImage: true,
                duration: true,
                instructor: { select: { nom: true, prenom: true } },
              },
            },
          },
          orderBy: { order: "asc" },
        },
        ...(userId
          ? {
              enrollments: {
                where: { userId },
                select: { id: true, progress: true, status: true, currentCourseOrder: true },
              },
            }
          : {}),
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ paths });
  } catch (error) {
    console.error("Learning paths error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
