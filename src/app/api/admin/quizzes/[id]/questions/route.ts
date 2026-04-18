import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await params;
    const body = await req.json();

    const { text, type, options, correctAnswer, explanation, points } = body;

    if (!text || !type) {
      return NextResponse.json(
        { error: "Texte et type sont requis" },
        { status: 400 }
      );
    }

    // Determine the order for the new question
    const maxOrder = await db.question.findFirst({
      where: { quizId: id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const question = await db.question.create({
      data: {
        quizId: id,
        text,
        type,
        options: options ? JSON.stringify(options) : "[]",
        correctAnswer: correctAnswer ? JSON.stringify(correctAnswer) : "[]",
        explanation: explanation || null,
        points: points || 1,
        order: (maxOrder?.order ?? -1) + 1,
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch (error) {
    console.error("Admin question create error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await params;
    const body = await req.json();
    const { questionId, text, type, options, correctAnswer, explanation, points, order } = body;

    if (!questionId) {
      return NextResponse.json(
        { error: "questionId est requis" },
        { status: 400 }
      );
    }

    // Verify question belongs to this quiz
    const existing = await db.question.findFirst({
      where: { id: questionId, quizId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Question introuvable" },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};
    if (text !== undefined) data.text = text;
    if (type !== undefined) data.type = type;
    if (options !== undefined) data.options = typeof options === "string" ? options : JSON.stringify(options);
    if (correctAnswer !== undefined)
      data.correctAnswer =
        typeof correctAnswer === "string"
          ? correctAnswer
          : JSON.stringify(correctAnswer);
    if (explanation !== undefined) data.explanation = explanation;
    if (points !== undefined) data.points = points;
    if (order !== undefined) data.order = order;

    const question = await db.question.update({
      where: { id: questionId },
      data,
    });

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Admin question update error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
  if (!auth.authorized) return auth.response;
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json(
        { error: "questionId est requis" },
        { status: 400 }
      );
    }

    // Verify question belongs to this quiz
    const existing = await db.question.findFirst({
      where: { id: questionId, quizId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Question introuvable" },
        { status: 404 }
      );
    }

    // Delete related answers first
    await db.quizAnswer.deleteMany({ where: { questionId } });
    await db.question.delete({ where: { id: questionId } });

    // Reorder remaining questions
    const remaining = await db.question.findMany({
      where: { quizId: id },
      orderBy: { order: "asc" },
    });

    await Promise.all(
      remaining.map((q, index) =>
        db.question.update({ where: { id: q.id }, data: { order: index } })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin question delete error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
