import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { authLimiter } from "@/lib/api-rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";

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

    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Adresse email requise" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, nom: true, prenom: true, isActive: true },
    });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
      });
    }

    if (!user.isActive) {
      return NextResponse.json({
        message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
      });
    }

    // Delete any existing reset tokens for this email
    await db.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token,
        expiresAt,
      },
    });

    // Build the reset URL using the request origin
    const origin =
      req.headers.get("origin") ||
      req.headers.get("referer")?.split("/").slice(0, 3).join("/") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "";
    const resetUrl = `${origin}/reset-password?token=${token}`;

    // Send the password reset email
    const fullName = [user.prenom, user.nom].filter(Boolean).join(" ");
    await sendPasswordResetEmail(normalizedEmail, fullName, resetUrl);

    // In development, include the token in the response so the dev UI can navigate directly
    const isDev = process.env.NODE_ENV === "development";

    return NextResponse.json({
      message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
      ...(isDev ? { devToken: token } : {}),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la demande de réinitialisation" },
      { status: 500 }
    );
  }
}
