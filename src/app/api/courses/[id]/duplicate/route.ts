import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const original = await db.course.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            lessons: { orderBy: { order: "asc" } },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!original) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    const slug = `${original.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-copie-${Date.now().toString(36)}`;

    const duplicated = await db.$transaction(async (tx) => {
      const newCourse = await tx.course.create({
        data: {
          title: `${original.title} (copie)`,
          slug,
          description: original.description,
          coverImage: original.coverImage,
          category: original.category,
          difficulty: original.difficulty,
          duration: original.duration,
          isCertifying: original.isCertifying,
          passingScore: original.passingScore,
          maxAttempts: original.maxAttempts,
          status: "BROUILLON",
          instructorId: original.instructorId,
          sections: {
            create: original.sections.map((section, sIdx) => ({
              title: section.title,
              order: sIdx,
              lessons: {
                create: section.lessons.map((lesson, lIdx) => ({
                  title: lesson.title,
                  type: lesson.type,
                  content: lesson.content,
                  duration: lesson.duration,
                  order: lIdx,
                })),
              },
            })),
          },
        },
        include: {
          instructor: { select: { id: true, nom: true, prenom: true, avatar: true } },
          _count: { select: { enrollments: true, sections: true } },
        },
      });
      return newCourse;
    });

    return NextResponse.json({ course: duplicated }, { status: 201 });
  } catch (error) {
    console.error("Course duplicate error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la duplication du cours" },
      { status: 500 }
    );
  }
}
