import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Record<string, unknown> = { status: "PUBLIE" };
    if (category && category !== "ALL") where.category = category;
    if (difficulty && difficulty !== "ALL") where.difficulty = difficulty;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
        include: {
          instructor: { select: { id: true, nom: true, prenom: true, avatar: true } },
          enrollments: userId
            ? { where: { userId }, select: { id: true, progress: true, status: true } }
            : false,
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.course.count({ where }),
    ]);

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Courses list error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des cours" },
      { status: 500 }
    );
  }
}
