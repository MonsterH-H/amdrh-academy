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

    const messages = await db.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        content: true,
        senderId: true,
        sender: { select: { nom: true, prenom: true, avatar: true } },
        createdAt: true,
        isRead: true,
      },
      take: 50,
    });

    // Mark messages as read
    await db.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ messages });
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

    const message = await db.message.create({
      data: {
        content,
        senderId,
        conversationId: id,
      },
    });

    // Create notification for receiver
    const receiver = await db.conversationParticipant.findFirst({
      where: { conversationId: id, userId: { not: senderId } },
    });

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
