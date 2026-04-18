import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userUpdateSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        telephone: true,
        club: true,
        region: true,
        bio: true,
        licenceNumber: true,
        avatar: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        enrollments: {
          include: {
            course: { select: { title: true, category: true } },
          },
          orderBy: { startedAt: "desc" },
          take: 20,
        },
        certificates: { orderBy: { issuedAt: "desc" } },
        quizAttempts: {
          orderBy: { submittedAt: "desc" },
          take: 20,
          include: { quiz: { select: { title: true } } },
        },
        _count: {
          select: {
            enrollments: true,
            certificates: true,
            quizAttempts: true,
            userBadges: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("User detail error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = userUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id },
      data: validated.data,
      select: { id: true, email: true, nom: true, prenom: true, role: true, isActive: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.user.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User delete error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
