import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { userUpdateSchema } from "@/lib/validations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireRole(req, ["ADMIN", "FORMATEUR"]);
    if (!auth.authorized) return auth.response;

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

    // Fetch learning path enrollments separately
    const learningPathEnrollments = await db.learningPathEnrollment.findMany({
      where: { userId: id },
      include: {
        learningPath: { select: { title: true, description: true, targetRole: true, isMandatory: true } },
      },
      orderBy: { startedAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ user, learningPathEnrollments });
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
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

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
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const { id } = await params;
    // Soft delete: deactivate the user instead of hard delete
    await db.user.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true, message: "Utilisateur désactivé" });
  } catch (error) {
    console.error("User delete error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
