import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const userInfo = await getUserFromRequest(req);
    if (!userInfo) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || userId !== userInfo.userId) {
      return NextResponse.json({ error: "Utilisateur requis" }, { status: 400 });
    }

    // Fetch all conversations for this user with participants and last message
    const conversations = await db.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: { select: { id: true, nom: true, prenom: true, avatar: true, role: true, club: true, isActive: true } },
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { content: true, createdAt: true, senderId: true, id: true },
            },
            _count: { select: { messages: true } },
          },
        },
      },
    });

    // Count unread per conversation and build response
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (cp) => {
        const unread = await db.message.count({
          where: {
            conversationId: cp.conversationId,
            senderId: { not: userId },
            isRead: false,
          },
        });

        const otherParticipant = cp.conversation.participants.find(
          (p) => p.userId !== userId
        );

        const lastMessageTime = cp.conversation.messages[0]?.createdAt
          ? new Date(cp.conversation.messages[0].createdAt).getTime()
          : new Date(cp.conversation.createdAt).getTime();

        return {
          id: cp.conversationId,
          otherUser: otherParticipant?.user || null,
          otherUserId: otherParticipant?.userId || null,
          lastMessage: cp.conversation.messages[0]
            ? {
                id: cp.conversation.messages[0].id,
                content: cp.conversation.messages[0].content,
                createdAt: cp.conversation.messages[0].createdAt.toISOString(),
                senderId: cp.conversation.messages[0].senderId,
              }
            : null,
          unreadCount: unread,
          totalMessages: cp.conversation._count.messages,
          lastReadAt: cp.lastReadAt?.toISOString() || null,
          // Use for sorting on client: most recent message timestamp
          lastActivityAt: lastMessageTime,
        };
      })
    );

    // Sort by most recent message (conversations with newest activity first)
    conversationsWithUnread.sort((a, b) => b.lastActivityAt - a.lastActivityAt);

    return NextResponse.json({ conversations: conversationsWithUnread });
  } catch (error) {
    console.error("Messages list error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userInfo = await getUserFromRequest(req);
    if (!userInfo) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

    const { userId1, userId2, subject } = await req.json();

    if (!userId1 || !userId2) {
      return NextResponse.json({ error: "Utilisateurs requis" }, { status: 400 });
    }

    if (userId1 !== userInfo.userId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Check if conversation already exists between these two users
    const existing = await db.conversationParticipant.findMany({
      where: { userId: userId1 },
      include: {
        conversation: {
          include: {
            participants: { where: { userId: userId2 } },
          },
        },
      },
    });

    const existingConv = existing.find(
      (e) => e.conversation.participants.length > 0
    );

    if (existingConv) {
      return NextResponse.json({ conversationId: existingConv.conversationId });
    }

    const conversation = await db.conversation.create({
      data: {
        subject: subject || null,
        participants: {
          create: [
            { userId: userId1 },
            { userId: userId2 },
          ],
        },
      },
    });

    return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
