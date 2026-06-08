import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authLimiter } from "@/lib/api-rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const rateResult = authLimiter(req);
    if (!rateResult.success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans quelques instants." },
        { status: 429, headers: rateResult.headers }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Check DB connectivity first
    let user;
    try {
      user = await db.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: {
          id: true,
          email: true,
          nom: true,
          prenom: true,
          role: true,
          passwordHash: true,
          isActive: true,
          avatar: true,
        },
      });
    } catch (dbError) {
      console.error("[Login] Database error:", dbError);
      return NextResponse.json(
        { 
          error: "Erreur de connexion à la base de données",
          hint: "Vérifiez que DATABASE_URL est configuré dans les variables d'environnement Vercel"
        },
        { status: 503 }
      );
    }

    if (!user) {
      console.warn(`[Login] User not found: ${email}`);
      return NextResponse.json(
        { 
          error: "Identifiants invalides",
          hint: "Vérifiez votre email et mot de passe. Si vous n'avez pas de compte, appelez /api/auth/seed pour créer les comptes de test."
        },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      console.warn(`[Login] User has no password hash: ${email}`);
      return NextResponse.json(
        { error: "Compte non configuré. Contactez l'administrateur." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Compte désactivé. Contactez l'administrateur." },
        { status: 403 }
      );
    }

    let isValid: boolean;
    try {
      isValid = await bcrypt.compare(password, user.passwordHash);
    } catch (bcryptError) {
      console.error("[Login] bcrypt error:", bcryptError);
      return NextResponse.json(
        { error: "Erreur de vérification du mot de passe" },
        { status: 500 }
      );
    }

    if (!isValid) {
      console.warn(`[Login] Invalid password for: ${email}`);
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("[Login] Unexpected error:", error);
    return NextResponse.json(
      { error: "Erreur de connexion" },
      { status: 500 }
    );
  }
}
