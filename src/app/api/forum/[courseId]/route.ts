import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ─── GET: List discussions for a course ──────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    // Verify course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    });
    if (!course) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    const where: Record<string, unknown> = { courseId };
    if (search) {
      where.title = { contains: search };
    }

    const [discussions, total] = await Promise.all([
      db.forumDiscussion.findMany({
        where,
        include: {
          author: {
            select: { id: true, prenom: true, nom: true, avatar: true },
          },
          replies: {
            select: { id: true },
          },
          _count: {
            select: { replies: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.forumDiscussion.count({ where }),
    ]);

    return NextResponse.json({
      discussions: discussions.map((d) => ({
        id: d.id,
        title: d.title,
        content: d.content,
        author: d.author,
        replyCount: d._count.replies,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
        isPinned: d.isPinned,
        isResolved: d.isResolved,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Forum list error:", error);
    return NextResponse.json({ error: "Erreur forum" }, { status: 500 });
  }
}

// ─── POST: Create a new discussion ───────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    const { courseId } = await params;
    const body = await req.json();
    const { userId, title, content } = body;

    if (!userId || !title || !content) {
      return NextResponse.json(
        { error: "userId, titre et contenu sont requis" },
        { status: 400 },
      );
    }

    // Verify course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });
    if (!course) {
      return NextResponse.json({ error: "Cours introuvable" }, { status: 404 });
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const discussion = await db.forumDiscussion.create({
      data: {
        courseId,
        authorId: userId,
        title,
        content,
      },
      include: {
        author: {
          select: { id: true, prenom: true, nom: true, avatar: true },
        },
      },
    });

    return NextResponse.json({
      id: discussion.id,
      title: discussion.title,
      content: discussion.content,
      author: discussion.author,
      replyCount: 0,
      createdAt: discussion.createdAt.toISOString(),
      updatedAt: discussion.updatedAt.toISOString(),
      isPinned: discussion.isPinned,
      isResolved: discussion.isResolved,
    }, { status: 201 });
  } catch (error) {
    console.error("Forum create error:", error);
    return NextResponse.json({ error: "Erreur forum" }, { status: 500 });
  }
}
