import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

const createLessonSchema = z.object({
  title: z.string().min(1, "Le titre de la leçon est requis"),
  type: z.enum(["VIDEO", "PDF", "TEXTE", "INTERACTIF"]).default("TEXTE"),
  content: z.string().default(""),
  duration: z.number().int().min(0).default(0),
});

const updateLessonSchema = z.object({
  title: z.string().min(1, "Le titre de la leçon est requis").optional(),
  type: z.enum(["VIDEO", "PDF", "TEXTE", "INTERACTIF"]).optional(),
  content: z.string().optional(),
  duration: z.number().int().min(0).optional(),
  order: z.number().int().min(0).optional(),
});

const reorderSchema = z.object({
  lessonIds: z.array(z.string()).min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    const { sectionId } = await params;
    const body = await req.json();
    const parsed = createLessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const section = await db.section.findUnique({
      where: { id: sectionId },
      select: { id: true },
    });
    if (!section) {
      return NextResponse.json({ error: "Section introuvable" }, { status: 404 });
    }

    const maxOrder = await db.lesson.findFirst({
      where: { sectionId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const lesson = await db.lesson.create({
      data: {
        title: parsed.data.title,
        type: parsed.data.type,
        content: parsed.data.content,
        duration: parsed.data.duration,
        order: (maxOrder?.order ?? -1) + 1,
        sectionId,
      },
    });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    console.error("Create lesson error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la leçon" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    const { sectionId } = await params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const lessonId = searchParams.get("lessonId");

    const section = await db.section.findUnique({
      where: { id: sectionId },
      select: { id: true },
    });
    if (!section) {
      return NextResponse.json({ error: "Section introuvable" }, { status: 404 });
    }

    // Handle reorder action
    if (action === "reorder") {
      const body = await req.json();
      const parsed = reorderSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        );
      }

      await db.$transaction(
        parsed.data.lessonIds.map((id, index) =>
          db.lesson.update({
            where: { id },
            data: { order: index },
          })
        )
      );

      return NextResponse.json({ message: "Leçons réordonnées avec succès" });
    }

    // Handle single lesson update
    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId est requis" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = updateLessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (!parsed.data.title && !parsed.data.type && parsed.data.content === undefined && parsed.data.duration === undefined && parsed.data.order === undefined) {
      return NextResponse.json(
        { error: "Aucun champ à mettre à jour" },
        { status: 400 }
      );
    }

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, sectionId: true },
    });

    if (!lesson || lesson.sectionId !== sectionId) {
      return NextResponse.json({ error: "Leçon introuvable" }, { status: 404 });
    }

    const updated = await db.lesson.update({
      where: { id: lessonId },
      data: parsed.data,
    });

    return NextResponse.json({ lesson: updated });
  } catch (error) {
    console.error("Update lesson error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la leçon" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  try {
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    const { sectionId } = await params;
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json(
        { error: "lessonId est requis" },
        { status: 400 }
      );
    }

    const section = await db.section.findUnique({
      where: { id: sectionId },
      select: { id: true },
    });
    if (!section) {
      return NextResponse.json({ error: "Section introuvable" }, { status: 404 });
    }

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, sectionId: true, title: true },
    });

    if (!lesson || lesson.sectionId !== sectionId) {
      return NextResponse.json({ error: "Leçon introuvable" }, { status: 404 });
    }

    await db.lesson.delete({ where: { id: lessonId } });

    return NextResponse.json({
      message: `La leçon "${lesson.title}" a été supprimée avec succès`,
    });
  } catch (error) {
    console.error("Delete lesson error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la leçon" },
      { status: 500 }
    );
  }
}
