import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/certificates/[id]/pdf — Professional print-ready certificate
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
        user: { select: { id: true, nom: true, prenom: true, email: true, role: true, licenceNumber: true } },
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: "Certificat introuvable" }, { status: 404 });
    }

    const typeLabels: Record<string, string> = {
      ATTESTATION: "Attestation de Réussite",
      CERTIFICAT: "Certificat de Réussite",
      CERTIFICAT_COMPLETION: "Certificat de Complétion",
      DIPLOME: "Diplôme",
    };

    const roleLabels: Record<string, string> = {
      ADMIN: "Administrateur",
      FORMATEUR: "Formateur",
      ARBITRE: "Arbitre",
      ENTRAINEUR: "Entraîneur",
      JOUEUR: "Joueur",
    };

    const typeLabel = typeLabels[certificate.type] || "Certificat";
    const userRole = certificate.user?.role ? (roleLabels[certificate.user.role] || certificate.user.role) : "";
    const issuedDate = new Date(certificate.issuedAt).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const expiryLine = certificate.expiresAt
      ? `Valide jusqu'au ${new Date(certificate.expiresAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
      : "Sans date d'expiration";

    const scorePercent = certificate.maxScore > 0
      ? Math.round((certificate.score / certificate.maxScore) * 100)
      : 0;

    const verifyUrl = `https://academie.amdrh.ma/verify/${certificate.code}`;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Certificat ${certificate.code} — Académie AMDRH</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

    @page {
      size: A4 landscape;
      margin: 0;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: #f5f5f0;
    }

    .certificate-page {
      width: 297mm;
      height: 210mm;
      margin: 0 auto;
      padding: 12mm;
      position: relative;
      background: #ffffff;
      overflow: hidden;
    }

    /* Professional double-border design */
    .outer-border {
      position: absolute;
      top: 8mm;
      left: 8mm;
      right: 8mm;
      bottom: 8mm;
      border: 2.5px solid #B8860B;
      pointer-events: none;
    }

    .inner-border {
      position: absolute;
      top: 10mm;
      left: 10mm;
      right: 10mm;
      bottom: 10mm;
      border: 0.75px solid #D4AF37;
      pointer-events: none;
    }

    /* Decorative corner elements */
    .corner {
      position: absolute;
      width: 40px;
      height: 40px;
      z-index: 2;
    }
    .corner svg { width: 100%; height: 100%; }
    .corner-tl { top: 6mm; left: 6mm; }
    .corner-tr { top: 6mm; right: 6mm; transform: scaleX(-1); }
    .corner-bl { bottom: 6mm; left: 6mm; transform: scaleY(-1); }
    .corner-br { bottom: 6mm; right: 6mm; transform: scale(-1); }

    /* Top decorative pattern */
    .top-pattern {
      position: absolute;
      top: 11mm;
      left: 11mm;
      right: 11mm;
      height: 3px;
      background: linear-gradient(90deg, #D4AF37 0%, #B8860B 25%, #D4AF37 50%, #B8860B 75%, #D4AF37 100%);
      z-index: 2;
    }

    /* Main content container */
    .content {
      position: relative;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 16mm 18mm 12mm;
    }

    /* Header */
    .header {
      text-align: center;
      padding-bottom: 6mm;
      margin-bottom: 4mm;
    }
    .logo-container {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 4px;
    }
    .logo-icon {
      width: 48px;
      height: 48px;
    }
    .logo-text {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 30px;
      font-weight: 800;
      color: #0F4C3A;
      letter-spacing: 1.5px;
    }
    .logo-text span {
      color: #B8860B;
    }
    .org-line {
      font-size: 10px;
      color: #666;
      letter-spacing: 4px;
      text-transform: uppercase;
      margin-top: 3px;
      font-weight: 500;
    }
    .header-divider {
      width: 120px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #B8860B, transparent);
      margin: 5mm auto 0;
    }

    /* Title */
    .title-section {
      text-align: center;
      margin-bottom: 5mm;
    }
    .cert-type {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 34px;
      font-weight: 700;
      color: #B8860B;
      text-transform: uppercase;
      letter-spacing: 4px;
      margin-bottom: 3px;
    }
    .cert-subtitle {
      font-size: 13px;
      color: #777;
      font-weight: 400;
    }

    /* Recipient */
    .recipient-section {
      text-align: center;
      margin-bottom: 4mm;
    }
    .given-to {
      font-size: 11px;
      color: #999;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 3px;
      font-weight: 500;
    }
    .recipient-name {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 36px;
      font-weight: 700;
      color: #0F4C3A;
      margin-bottom: 2px;
      letter-spacing: 0.5px;
    }
    .recipient-meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      font-size: 12px;
      color: #888;
    }
    .recipient-meta .sep {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #ccc;
    }

    /* Body */
    .body-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3mm 20mm;
    }
    .body-text {
      font-size: 13px;
      color: #555;
      text-align: center;
      line-height: 1.9;
      max-width: 480px;
      margin: 0 auto;
    }
    .course-title {
      font-weight: 700;
      font-size: 18px;
      color: #1a1a1a;
      display: block;
      margin: 4px 0;
      font-family: 'Playfair Display', Georgia, serif;
    }

    /* Score badge */
    .score-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #0F4C3A 0%, #0a3628 100%);
      color: white;
      padding: 10px 32px;
      border-radius: 50px;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 1px;
      margin: 5mm 0;
      box-shadow: 0 4px 15px rgba(15, 76, 58, 0.25);
    }
    .score-detail {
      font-size: 12px;
      color: #888;
      margin-top: 2mm;
    }

    /* Footer */
    .footer-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 5mm;
      border-top: 0.75px solid #eee;
      margin-top: auto;
    }
    .footer-left {
      font-size: 11px;
      color: #999;
      text-align: left;
      line-height: 1.7;
    }
    .footer-left strong {
      color: #666;
    }
    .footer-center {
      text-align: center;
      flex: 1;
    }
    .code-label {
      font-size: 9px;
      color: #bbb;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 3px;
    }
    .code-value {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      font-weight: 700;
      color: #0F4C3A;
      background: #f0f7f4;
      padding: 4px 14px;
      border-radius: 6px;
      display: inline-block;
      border: 1px solid #c8e6d8;
      letter-spacing: 1px;
    }
    .footer-right {
      text-align: right;
    }
    .qr-label {
      font-size: 9px;
      color: #bbb;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 3px;
    }
    .qr-url {
      font-size: 10px;
      color: #0F4C3A;
      word-break: break-all;
      max-width: 100px;
      font-family: 'Courier New', monospace;
    }

    /* Watermark stamp */
    .stamp {
      position: absolute;
      bottom: 22mm;
      right: 22mm;
      width: 55mm;
      height: 28mm;
      border: 3px solid #B8860B;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(-15deg);
      opacity: 0.10;
      z-index: 0;
    }
    .stamp-text {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 16px;
      font-weight: 700;
      color: #B8860B;
      text-transform: uppercase;
      letter-spacing: 3px;
    }

    /* Bottom org name */
    .bottom-org {
      text-align: center;
      margin-top: 4mm;
      padding-top: 3mm;
      border-top: 0.75px solid #eee;
    }
    .bottom-org-name {
      font-size: 9px;
      color: #ccc;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .bottom-org-sub {
      font-size: 8px;
      color: #ddd;
      letter-spacing: 2px;
      margin-top: 1px;
    }

    /* Print button */
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      background: #0F4C3A;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(15, 76, 58, 0.3);
      transition: background 0.2s;
    }
    .print-btn:hover {
      background: #0a3628;
    }
    @media print {
      .print-btn { display: none; }
      body { background: white; }
      .certificate-page { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="certificate-page">
    <!-- Print button (hidden in print) -->
    <button class="print-btn" onclick="window.print()">🖨️ Télécharger / Imprimer</button>

    <!-- Borders -->
    <div class="outer-border"></div>
    <div class="inner-border"></div>
    <div class="top-pattern"></div>

    <!-- Decorative corners -->
    <div class="corner corner-tl"><svg viewBox="0 0 40 40"><path d="M2 38 L2 8 Q2 2 8 2 L38 2" fill="none" stroke="#B8860B" stroke-width="2.5"/><circle cx="5" cy="5" r="2" fill="#B8860B"/></svg></div>
    <div class="corner corner-tr"><svg viewBox="0 0 40 40"><path d="M2 38 L2 8 Q2 2 8 2 L38 2" fill="none" stroke="#B8860B" stroke-width="2.5"/><circle cx="5" cy="5" r="2" fill="#B8860B"/></svg></div>
    <div class="corner corner-bl"><svg viewBox="0 0 40 40"><path d="M2 38 L2 8 Q2 2 8 2 L38 2" fill="none" stroke="#B8860B" stroke-width="2.5"/><circle cx="5" cy="5" r="2" fill="#B8860B"/></svg></div>
    <div class="corner corner-br"><svg viewBox="0 0 40 40"><path d="M2 38 L2 8 Q2 2 8 2 L38 2" fill="none" stroke="#B8860B" stroke-width="2.5"/><circle cx="5" cy="5" r="2" fill="#B8860B"/></svg></div>

    <!-- Watermark stamp -->
    <div class="stamp">
      <div class="stamp-text">AMDRH</div>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Header -->
      <div class="header">
        <div class="logo-container">
          <svg class="logo-icon" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="#0F4C3A" stroke-width="2"/>
            <circle cx="24" cy="24" r="16" stroke="#B8860B" stroke-width="1.5"/>
            <path d="M24 8 L28 18 L38 18 L30 24 L33 35 L24 28 L15 35 L18 24 L10 18 L20 18 Z" fill="#B8860B" opacity="0.8"/>
            <circle cx="24" cy="24" r="5" fill="#0F4C3A"/>
          </svg>
          <div class="logo-text">Académie <span>AMDRH</span></div>
        </div>
        <div class="org-line">Association Marocaine Des Arbitres De Handball</div>
        <div class="header-divider"></div>
      </div>

      <!-- Title -->
      <div class="title-section">
        <div class="cert-type">${typeLabel}</div>
        <div class="cert-subtitle">Ce document est officiellement délivré à</div>
      </div>

      <!-- Recipient -->
      <div class="recipient-section">
        <div class="given-to">L'apprenant</div>
        <div class="recipient-name">${certificate.userName}</div>
        <div class="recipient-meta">
          ${userRole ? `<span>${userRole}</span>` : ""}
          ${userRole && certificate.userLicence ? '<span class="sep"></span>' : ""}
          ${certificate.userLicence ? `<span>Licence n° ${certificate.userLicence}</span>` : ""}
        </div>
      </div>

      <!-- Body -->
      <div class="body-section">
        <div class="body-text">
          a satisfait aux exigences du cours certifiant
          <span class="course-title">« ${certificate.courseTitle} »</span>
          de l'Académie AMDRH, partenaire académique officiel de la
          Fédération Royale Marocaine de Handball.
        </div>
        <div class="score-badge">
          ${scorePercent}% — Réussi
        </div>
        <div class="score-detail">
          Score obtenu : ${certificate.score} / ${certificate.maxScore}
        </div>
      </div>

      <!-- Footer -->
      <div class="footer-section">
        <div class="footer-left">
          <div><strong>Délivré le</strong> ${issuedDate}</div>
          <div>${expiryLine}</div>
        </div>
        <div class="footer-center">
          <div class="code-label">Code de vérification</div>
          <div class="code-value">${certificate.code}</div>
        </div>
        <div class="footer-right">
          <div class="qr-label">Vérifier en ligne</div>
          <div class="qr-url">${verifyUrl}</div>
        </div>
      </div>

      <!-- Bottom org -->
      <div class="bottom-org">
        <div class="bottom-org-name">Fédération Royale Marocaine de Handball</div>
        <div class="bottom-org-sub">Partenaire académique officiel</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
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
