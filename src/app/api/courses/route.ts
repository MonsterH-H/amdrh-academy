import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courseCreateSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const admin = searchParams.get("admin") === "true";
    const enrolledOnly = searchParams.get("enrolled") === "true";
    const userRole = searchParams.get("role") || "";
    const instructorId = searchParams.get("instructorId") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Record<string, unknown> = {};

    // Admin mode: return all courses (any status)
    if (!admin) {
      where.status = "PUBLIE";
    } else if (status && status !== "ALL") {
      where.status = status;
    }

    // FORMATEUR: only show their own courses
    if (userRole === "FORMATEUR" && instructorId) {
      where.instructorId = instructorId;
    }

    if (category && category !== "ALL") where.category = category;
    if (difficulty && difficulty !== "ALL") where.difficulty = difficulty;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // If enrolledOnly, filter to only courses the user is enrolled in
    if (enrolledOnly && userId) {
      where.enrollments = { some: { userId } };
    }

    const includeOptions = {
      instructor: { select: { id: true, nom: true, prenom: true, avatar: true } },
      enrollments: userId
        ? { where: { userId }, select: { id: true, progress: true, status: true, startedAt: true, completedAt: true, lastAccessAt: true } }
        : false,
      sections: {
        include: {
          lessons: { select: { id: true, title: true, type: true, duration: true, order: true }, orderBy: { order: "asc" as const } },
        },
        orderBy: { order: "asc" as const },
      },
      quiz: { select: { id: true, passingScore: true } },
      _count: {
        select: {
          enrollments: true,
          sections: true,
        },
      },
    };

    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
        include: includeOptions,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.course.count({ where }),
    ]);

    // For admin mode, also return aggregated stats
    let stats: { total: number; published: number; drafts: number; archived: number } | null = null;
    if (admin) {
      const statsWhere: Record<string, unknown> = {};
      // FORMATEUR: stats only for their own courses
      if (userRole === "FORMATEUR" && instructorId) {
        statsWhere.instructorId = instructorId;
      }
      const [totalCount, publishedCount, draftCount, archivedCount] = await Promise.all([
        db.course.count({ where: statsWhere }),
        db.course.count({ where: { ...statsWhere, status: "PUBLIE" } }),
        db.course.count({ where: { ...statsWhere, status: "BROUILLON" } }),
        db.course.count({ where: { ...statsWhere, status: "ARCHIVE" } }),
      ]);
      stats = {
        total: totalCount,
        published: publishedCount,
        drafts: draftCount,
        archived: archivedCount,
      };
    }

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      ...(stats && { stats }),
    });
  } catch (error) {
    console.error("Courses list error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des cours" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = courseCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      category,
      difficulty,
      duration,
      isCertifying,
      passingScore,
      maxAttempts,
      instructorId,
      sections,
    } = parsed.data;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Date.now().toString(36);

    // Verify instructor exists and has correct role
    const instructor = await db.user.findUnique({
      where: { id: instructorId },
      select: { id: true, role: true },
    });

    if (!instructor) {
      return NextResponse.json(
        { error: "Formateur introuvable" },
        { status: 404 }
      );
    }

    if (instructor.role !== "ADMIN" && instructor.role !== "FORMATEUR") {
      return NextResponse.json(
        { error: "Seuls les administrateurs et formateurs peuvent créer des cours" },
        { status: 403 }
      );
    }

    // Create course with sections and lessons in a transaction
    const course = await db.$transaction(async (tx) => {
      const createdCourse = await tx.course.create({
        data: {
          title,
          slug,
          description,
          category,
          difficulty,
          duration,
          isCertifying,
          passingScore,
          maxAttempts,
          status: "BROUILLON",
          instructorId,
          sections: {
            create: sections.map((section, sectionIdx) => ({
              title: section.title,
              order: sectionIdx,
              lessons: {
                create: section.lessons.map((lesson, lessonIdx) => ({
                  title: lesson.title,
                  type: lesson.type,
                  content: lesson.content,
                  duration: lesson.duration,
                  order: lessonIdx,
                })),
              },
            })),
          },
        },
        include: {
          instructor: { select: { id: true, nom: true, prenom: true, avatar: true } },
          sections: {
            include: {
              lessons: { orderBy: { order: "asc" } },
            },
            orderBy: { order: "asc" },
          },
        },
      });

      return createdCourse;
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error("Course creation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du cours" },
      { status: 500 }
    );
  }
}
