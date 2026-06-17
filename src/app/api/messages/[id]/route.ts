import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userInfo = await getUserFromRequest(req);
    if (!userInfo) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || userId !== userInfo.userId) {
      return NextResponse.json({ error: "Utilisateur requis" }, { status: 400 });
    }

    // Verify user is a participant in this conversation
    const participant = await db.conversationParticipant.findFirst({
      where: { conversationId: id, userId: userInfo.userId },
    });
    if (!participant) return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });

    // Get other participant info for the frontend
    const otherParticipant = await db.conversationParticipant.findFirst({
      where: { conversationId: id, userId: { not: userInfo.userId } },
      include: {
        user: {
          select: { id: true, nom: true, prenom: true, avatar: true, role: true, club: true, isActive: true },
        },
      },
    });

    const messages = await db.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        senderId: true,
        receiverId: true,
        sender: { select: { nom: true, prenom: true, avatar: true } },
        createdAt: true,
        isRead: true,
      },
      take: 50,
    });

    // Mark messages from other users as read
    const { count: markedRead } = await db.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    // Update the participant's lastReadAt
    await db.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    });

    return NextResponse.json({
      messages,
      otherParticipant: otherParticipant
        ? {
            userId: otherParticipant.userId,
            user: otherParticipant.user,
          }
        : null,
    });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userInfo = await getUserFromRequest(req);
    if (!userInfo) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

    const { id } = await params;
    const { senderId, content } = await req.json();

    if (!senderId || !content) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    if (senderId !== userInfo.userId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Verify user is a participant in this conversation
    const participant = await db.conversationParticipant.findFirst({
      where: { conversationId: id, userId: userInfo.userId },
    });
    if (!participant) return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });

    // Find the other participant to set as receiver
    const receiver = await db.conversationParticipant.findFirst({
      where: { conversationId: id, userId: { not: senderId } },
    });

    const message = await db.message.create({
      data: {
        content,
        senderId,
        receiverId: receiver?.userId || null,
        conversationId: id,
      },
      include: {
        sender: { select: { nom: true, prenom: true, avatar: true } },
      },
    });

    // Update the conversation's updatedAt timestamp
    await db.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // Create notification for receiver
    if (receiver) {
      await db.notification.create({
        data: {
          userId: receiver.userId,
          type: "MESSAGE",
          title: "Nouveau message",
          message: content.substring(0, 100),
          link: `/messages/${id}`,
        },
      });
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
