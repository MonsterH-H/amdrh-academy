import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ─── GET: Get discussion detail with replies ─────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; discussionId: string }> },
) {
  try {
    const { courseId, discussionId } = await params;

    const discussion = await db.forumDiscussion.findUnique({
      where: {
        id: discussionId,
        courseId,
      },
      include: {
        author: {
          select: { id: true, prenom: true, nom: true, avatar: true },
        },
        replies: {
          include: {
            author: {
              select: { id: true, prenom: true, nom: true, avatar: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!discussion) {
      return NextResponse.json({ error: "Discussion introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      id: discussion.id,
      title: discussion.title,
      content: discussion.content,
      author: discussion.author,
      replyCount: discussion.replies.length,
      createdAt: discussion.createdAt.toISOString(),
      updatedAt: discussion.updatedAt.toISOString(),
      isPinned: discussion.isPinned,
      isResolved: discussion.isResolved,
      replies: discussion.replies.map((r) => ({
        id: r.id,
        content: r.content,
        author: r.author,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Forum detail error:", error);
    return NextResponse.json({ error: "Erreur forum" }, { status: 500 });
  }
}

// ─── POST: Add a reply to a discussion ───────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; discussionId: string }> },
) {
  try {
    const { courseId, discussionId } = await params;
    const body = await req.json();
    const { userId, content } = body;

    if (!userId || !content) {
      return NextResponse.json(
        { error: "userId et contenu sont requis" },
        { status: 400 },
      );
    }

    // Verify discussion exists
    const discussion = await db.forumDiscussion.findUnique({
      where: { id: discussionId, courseId },
      select: { id: true },
    });
    if (!discussion) {
      return NextResponse.json({ error: "Discussion introuvable" }, { status: 404 });
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const reply = await db.forumReply.create({
      data: {
        discussionId,
        authorId: userId,
        content,
      },
      include: {
        author: {
          select: { id: true, prenom: true, nom: true, avatar: true },
        },
      },
    });

    return NextResponse.json({
      id: reply.id,
      content: reply.content,
      author: reply.author,
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Forum reply error:", error);
    return NextResponse.json({ error: "Erreur forum" }, { status: 500 });
  }
}
