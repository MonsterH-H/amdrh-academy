import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/certificates/[id]/pdf — placeholder for PDF download
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    const certificate = await db.certificate.findFirst({
      where: { id, userId },
      include: {
        user: { select: { id: true, nom: true, prenom: true, email: true, role: true } },
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: "Certificat introuvable" }, { status: 404 });
    }

    // Generate a simple HTML-based certificate as PDF placeholder
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: A4 landscape; margin: 20mm; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; color: #1a1a1a; }
    .container { max-width: 800px; margin: 0 auto; border: 3px solid #C8A951; padding: 40px 60px; }
    .logo { font-size: 24px; font-weight: bold; color: #1D4ED8; margin-bottom: 5px; }
    .org { font-size: 12px; color: #666; margin-bottom: 30px; }
    .title { font-size: 32px; font-weight: bold; color: #C8A951; margin-bottom: 20px; }
    .subtitle { font-size: 14px; color: #666; margin-bottom: 40px; }
    .recipient { font-size: 24px; font-weight: 600; margin-bottom: 10px; }
    .course { font-size: 18px; color: #333; margin-bottom: 30px; }
    .score { font-size: 16px; color: #1D4ED8; margin-bottom: 40px; }
    .code { font-family: monospace; font-size: 12px; color: #888; margin-top: 30px; }
    .date { font-size: 12px; color: #888; margin-top: 10px; }
    .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 10px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Académie AMDRH</div>
    <div class="org">Association Marocaine des Droits de l'Homme — Formation</div>
    <div class="title">${certificate.type === "ATTESTATION" ? "Attestation de Réussite" : certificate.type === "DIPLOME" ? "Diplôme" : "Certificat de Complétion"}</div>
    <div class="subtitle">Ce document est délivré à</div>
    <div class="recipient">${certificate.userName}</div>
    <div class="course">Pour avoir complété avec succès le cours</div>
    <div class="course" style="font-weight: 600; color: #1a1a1a;">« ${certificate.courseTitle} »</div>
    <div class="score">Score : ${certificate.score}/${certificate.maxScore}</div>
    <div class="code">Code de vérification : ${certificate.code}</div>
    <div class="date">Délivré le ${new Date(certificate.issuedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
    ${certificate.expiresAt ? `<div class="date">Valide jusqu'au ${new Date(certificate.expiresAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>` : ""}
    <div class="footer">
      Ce document peut être vérifié sur academie.amdrh.ma/verify/${certificate.code}<br>
      Académie AMDRH — Tous droits réservés
    </div>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html;charset=utf-8",
        "Content-Disposition": `inline; filename="certificat-${certificate.code}.html"`,
      },
    });
  } catch (error) {
    console.error("Certificate PDF error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
