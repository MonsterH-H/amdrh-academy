import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/admin/learning-paths/[id] — get single learning path with full details + enrolled users
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const learningPath = await db.learningPath.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
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
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
                role: true,
                avatar: true,
                isActive: true,
              },
            },
          },
          orderBy: { startedAt: "desc" },
        },
      },
    });

    if (!learningPath) {
      return NextResponse.json(
        { error: "Parcours introuvable" },
        { status: 404 }
      );
    }

    const totalDuration = learningPath.courses.reduce(
      (sum, pc) => sum + pc.course.duration,
      0
    );

    return NextResponse.json({
      ...learningPath,
      totalDuration,
      courseCount: learningPath.courses.length,
      enrollmentCount: learningPath.enrollments.length,
    });
  } catch (error) {
    console.error("[admin/learning-paths/[id] GET]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH /api/admin/learning-paths/[id] — update a learning path
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, targetRole, mode, isMandatory, order, courses } = body;

    // Check existence
    const existing = await db.learningPath.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Parcours introuvable" },
        { status: 404 }
      );
    }

    // If title changed, regenerate slug
    let slug = existing.slug;
    if (title && title !== existing.title) {
      slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const slugExists = await db.learningPath.findFirst({
        where: { slug, id: { not: id } },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: "Un parcours avec un titre similaire existe déjà" },
          { status: 409 }
        );
      }
    }

    // Update basic fields
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== existing.slug) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (targetRole !== undefined) updateData.targetRole = targetRole;
    if (mode !== undefined) updateData.mode = mode;
    if (isMandatory !== undefined) updateData.isMandatory = isMandatory;
    if (order !== undefined) updateData.order = order;

    // If courses array is provided, rebuild course associations
    if (courses !== undefined) {
      // Validate course IDs
      if (courses.length > 0) {
        const courseIds = courses.map((c: { courseId: string }) => c.courseId);
        const foundCourses = await db.course.findMany({
          where: { id: { in: courseIds } },
          select: { id: true },
        });
        const foundIds = new Set(foundCourses.map((c) => c.id));
        const missingIds = courseIds.filter((cid: string) => !foundIds.has(cid));
        if (missingIds.length > 0) {
          return NextResponse.json(
            { error: "Certains cours sélectionnés sont introuvables" },
            { status: 400 }
          );
        }
      }

      // Delete old associations and create new ones
      await db.learningPathCourse.deleteMany({ where: { learningPathId: id } });

      if (courses.length > 0) {
        await db.learningPathCourse.createMany({
          data: courses.map(
            (c: { courseId: string; order: number; isRequired: boolean; minScore: number }) => ({
              learningPathId: id,
              courseId: c.courseId,
              order: c.order ?? 0,
              isRequired: c.isRequired ?? true,
              minScore: c.minScore ?? 70,
            })
          ),
        });
      }
    }

    const updated = await db.learningPath.update({
      where: { id },
      data: updateData,
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
        _count: {
          select: { enrollments: true },
        },
      },
    });

    const totalDuration = updated.courses.reduce(
      (sum, pc) => sum + pc.course.duration,
      0
    );

    return NextResponse.json({
      ...updated,
      totalDuration,
      courseCount: updated.courses.length,
      enrollmentCount: updated._count.enrollments,
    });
  } catch (error) {
    console.error("[admin/learning-paths/[id] PATCH]", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// DELETE /api/admin/learning-paths/[id] — delete a learning path
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.learningPath.findUnique({
      where: { id },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Parcours introuvable" },
        { status: 404 }
      );
    }

    // Delete cascades: LearningPathCourse + LearningPathEnrollment
    await db.learningPath.delete({ where: { id } });

    return NextResponse.json({
      message: "Parcours supprimé",
      deletedEnrollments: existing._count.enrollments,
    });
  } catch (error) {
    console.error("[admin/learning-paths/[id] DELETE]", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
