import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { profileUpdateSchema } from "@/lib/validations";
import { getUserFromRequest } from "@/lib/auth-helpers";

export async function PUT(req: NextRequest) {
  try {
    const userInfo = getUserFromRequest(req);
    if (!userInfo) return NextResponse.json({ error: "Authentification requise" }, { status: 401 });

    const body = await req.json();
    const validated = profileUpdateSchema.safeParse(body);

    if (!validated.success) {
      const errors = validated.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0] || "Données invalides";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { userId, prenom, nom, telephone, club, region, bio } = validated.data;

    if (userId !== userInfo.userId) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    const existingUser = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        prenom,
        nom,
        telephone: telephone || null,
        club: club || null,
        region: region || null,
        bio: bio || null,
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true,
        avatar: true,
        telephone: true,
        club: true,
        region: true,
        bio: true,
        licenceNumber: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
