import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

const createSectionSchema = z.object({
  title: z.string().min(1, "Le titre de la section est requis"),
});

const updateSectionSchema = z.object({
  title: z.string().min(1, "Le titre de la section est requis").optional(),
  order: z.number().int().min(0).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const body = await req.json();
    const parsed = createSectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const course = await db.course.findUnique({ where: { id }, select: { id: true } });
    if (!course) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    const maxOrder = await db.section.findFirst({
      where: { courseId: id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const section = await db.section.create({
      data: {
        title: parsed.data.title,
        order: (maxOrder?.order ?? -1) + 1,
        courseId: id,
      },
      include: {
        lessons: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json({ section }, { status: 201 });
  } catch (error) {
    console.error("Create section error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la section" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const body = await req.json();
    const parsed = updateSectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (!parsed.data.title && parsed.data.order === undefined) {
      return NextResponse.json(
        { error: "Aucun champ à mettre à jour" },
        { status: 400 }
      );
    }

    const course = await db.course.findUnique({ where: { id }, select: { id: true } });
    if (!course) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    const section = await db.section.update({
      where: { id: body.sectionId },
      data: parsed.data,
      include: { lessons: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ section });
  } catch (error) {
    console.error("Update section error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la section" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("sectionId");

    if (!sectionId) {
      return NextResponse.json(
        { error: "sectionId est requis" },
        { status: 400 }
      );
    }

    const course = await db.course.findUnique({ where: { id }, select: { id: true } });
    if (!course) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    const section = await db.section.findUnique({
      where: { id: sectionId },
      select: { id: true, title: true, courseId: true },
    });

    if (!section || section.courseId !== id) {
      return NextResponse.json({ error: "Section introuvable" }, { status: 404 });
    }

    await db.section.delete({ where: { id: sectionId } });

    return NextResponse.json({
      message: `La section "${section.title}" a été supprimée avec succès`,
    });
  } catch (error) {
    console.error("Delete section error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la section" },
      { status: 500 }
    );
  }
}
