import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Utilisateur requis" }, { status: 400 });
    }

    const conversations = await db.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: { select: { id: true, nom: true, prenom: true, avatar: true } },
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: { content: true, createdAt: true, senderId: true },
            },
            _count: { select: { messages: true } },
          },
        },
      },
      orderBy: { lastReadAt: "desc" },
    });

    // Count unread per conversation
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

        return {
          id: cp.conversationId,
          otherUser: otherParticipant?.user,
          lastMessage: cp.conversation.messages[0],
          unreadCount: unread,
          totalMessages: cp.conversation._count.messages,
          lastReadAt: cp.lastReadAt,
        };
      })
    );

    return NextResponse.json({ conversations: conversationsWithUnread });
  } catch (error) {
    console.error("Messages list error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId1, userId2, subject } = await req.json();

    if (!userId1 || !userId2) {
      return NextResponse.json({ error: "Utilisateurs requis" }, { status: 400 });
    }

    // Check if conversation already exists
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
