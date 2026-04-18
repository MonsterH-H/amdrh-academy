import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = resetPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token, password } = validated.data;

    // Find the reset token
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: { token: ["Lien de réinitialisation invalide"] } },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      // Clean up expired token
      await db.passwordResetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json(
        { error: { token: ["Lien de réinitialisation expiré. Veuillez demander un nouveau lien."] } },
        { status: 400 }
      );
    }

    // Check if token already used
    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: { token: ["Lien déjà utilisé. Veuillez demander un nouveau lien."] } },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email: resetToken.email },
      select: { id: true, email: true, nom: true, prenom: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Compte introuvable" },
        { status: 404 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password and mark token as used (in transaction)
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      db.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Delete all other reset tokens for this email
    await db.passwordResetToken.deleteMany({
      where: {
        email: resetToken.email,
        id: { not: resetToken.id },
      },
    });

    return NextResponse.json({
      message: "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la réinitialisation du mot de passe" },
      { status: 500 }
    );
  }
}
