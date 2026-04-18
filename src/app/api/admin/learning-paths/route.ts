import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

// GET /api/admin/learning-paths — list all learning paths with stats
export async function GET(req: NextRequest) {
  const auth = await requireRole(req, ["ADMIN"]);
  if (!auth.authorized) return auth.response;
  try {
    const { searchParams } = new URL(req.url);
    const targetRole = searchParams.get("targetRole");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (targetRole) {
      where.targetRole = targetRole;
    }

    const [paths, total] = await Promise.all([
      db.learningPath.findMany({
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
                  duration: true,
                  status: true,
                  coverImage: true,
                  instructor: { select: { id: true, nom: true, prenom: true } },
                },
              },
            },
            orderBy: { order: "asc" },
          },
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: { order: "asc" },
        skip,
        take: limit,
      }),
      db.learningPath.count({ where }),
    ]);

    // Compute derived fields
    const enrichedPaths = paths.map((path) => {
      const totalDuration = path.courses.reduce(
        (sum, pc) => sum + pc.course.duration,
        0
      );
      return {
        ...path,
        totalDuration,
        courseCount: path.courses.length,
        enrollmentCount: path._count.enrollments,
      };
    });

    return NextResponse.json({
      paths: enrichedPaths,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[admin/learning-paths GET]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/admin/learning-paths — create a new learning path
export async function POST(req: NextRequest) {
  const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
  if (!auth.authorized) return auth.response;
  try {
    const body = await req.json();
    const { title, description, targetRole, mode, isMandatory, courses } = body;

    if (!title || !description || !targetRole) {
      return NextResponse.json(
        { error: "Titre, description et rôle cible sont requis" },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check slug uniqueness
    const existingSlug = await db.learningPath.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { error: "Un parcours avec un titre similaire existe déjà" },
        { status: 409 }
      );
    }

    // Compute order
    const maxOrder = await db.learningPath.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });
    const nextOrder = (maxOrder?.order || 0) + 1;

    // Validate course IDs if provided
    if (courses && courses.length > 0) {
      const courseIds = courses.map((c: { courseId: string }) => c.courseId);
      const foundCourses = await db.course.findMany({
        where: { id: { in: courseIds } },
        select: { id: true },
      });
      const foundIds = new Set(foundCourses.map((c) => c.id));
      const missingIds = courseIds.filter((id: string) => !foundIds.has(id));
      if (missingIds.length > 0) {
        return NextResponse.json(
          { error: "Certains cours sélectionnés sont introuvables" },
          { status: 400 }
        );
      }
    }

    // Create learning path with courses
    const learningPath = await db.learningPath.create({
      data: {
        title,
        slug,
        description,
        targetRole,
        mode: mode || "sequentiel",
        isMandatory: isMandatory || false,
        order: nextOrder,
        ...(courses && courses.length > 0
          ? {
              courses: {
                create: courses.map(
                  (c: { courseId: string; order: number; isRequired: boolean; minScore: number }) => ({
                    courseId: c.courseId,
                    order: c.order ?? 0,
                    isRequired: c.isRequired ?? true,
                    minScore: c.minScore ?? 70,
                  })
                ),
              },
            }
          : {}),
      },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                category: true,
                difficulty: true,
                duration: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    const totalDuration = learningPath.courses.reduce(
      (sum, pc) => sum + pc.course.duration,
      0
    );

    return NextResponse.json(
      {
        ...learningPath,
        totalDuration,
        courseCount: learningPath.courses.length,
        enrollmentCount: 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[admin/learning-paths POST]", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
