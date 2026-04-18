import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/certificates/verify?code=AMDRH-2026-00001
// Public endpoint — no auth required
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { valid: false, error: "Code de certificat requis" },
        { status: 400 }
      );
    }

    const certificate = await db.certificate.findUnique({
      where: { code },
      include: {
        user: {
          select: { id: true, nom: true, prenom: true },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json({
        valid: false,
        error: "Certificat non trouvé",
      });
    }

    // Check if certificate is revoked or suspended
    if (certificate.status === "REVOKED") {
      return NextResponse.json({
        valid: false,
        error: "Certificat révoqué",
        revokedAt: certificate.revokedAt,
        revokeReason: certificate.revokeReason,
      });
    }

    if (certificate.status === "SUSPENDED") {
      return NextResponse.json({
        valid: false,
        error: "Certificat suspendu",
        revokeReason: certificate.revokeReason,
      });
    }

    // Check if expired
    if (certificate.expiresAt && new Date(certificate.expiresAt) < new Date()) {
      return NextResponse.json({
        valid: false,
        error: "Certificat expiré",
        certificate: {
          code: certificate.code,
          type: certificate.type,
          status: certificate.status,
          courseTitle: certificate.courseTitle || "",
          userName: certificate.userName || (certificate.user ? `${certificate.user.prenom} ${certificate.user.nom}` : ""),
          score: certificate.score,
          maxScore: certificate.maxScore,
          issuedAt: certificate.issuedAt,
          expiresAt: certificate.expiresAt,
        },
      });
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        code: certificate.code,
        type: certificate.type,
        status: certificate.status,
        courseTitle: certificate.courseTitle || "",
        userName: certificate.userName || (certificate.user ? `${certificate.user.prenom} ${certificate.user.nom}` : ""),
        score: certificate.score,
        maxScore: certificate.maxScore,
        issuedAt: certificate.issuedAt,
        expiresAt: certificate.expiresAt,
      },
    });
  } catch (error) {
    console.error("Certificate verification error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
