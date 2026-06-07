/**
 * AMDRH Academy — Email Service
 *
 * Uses Resend's REST API via fetch (no SDK dependency).
 * Falls back to console.log when RESEND_API_KEY is not configured.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_NAME = "Académie AMDRH";
const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

async function sendEmail({ to, subject, text, html }: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!RESEND_API_KEY) {
    // Fallback: log to console in development / when no API key
    console.log("━━━━━━━━━━━━━━━━ EMAIL (fallback) ━━━━━━━━━━━━━━━━");
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`From:    ${FROM_NAME} <${FROM_EMAIL}>`);
    console.log("────────────────────────────────────────────────────");
    console.log(text);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    return { success: true, messageId: "fallback-console" };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [to],
        subject,
        text,
        html: html || text.replace(/\n/g, "<br>"),
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Email] Resend API error ${response.status}:`, errorBody);
      return { success: false, error: `Resend API error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return { success: false, error: String(error) };
  }
}

// ────────────────────────────────────────────────────────────────
// Password Reset Email
// ────────────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string,
) {
  const displayName = name || "Utilisateur";
  const subject = "Académie AMDRH — Réinitialisation du mot de passe";

  const text = `Académie AMDRH — Réinitialisation du mot de passe

Bonjour ${displayName},

Vous avez demandé la réinitialisation de votre mot de passe.

Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :
${resetUrl}

Ce lien expire dans 1 heure.

Si vous n'avez pas fait cette demande, ignorez cet email.

Cordialement,
L'équipe Académie AMDRH
Fédération Royale Marocaine de Handball`;

  return sendEmail({ to, subject, text });
}

// ────────────────────────────────────────────────────────────────
// Password Reset Confirmation
// ────────────────────────────────────────────────────────────────

export async function sendPasswordResetConfirmation(
  to: string,
  name: string,
) {
  const displayName = name || "Utilisateur";
  const subject = "Académie AMDRH — Mot de passe modifié avec succès";

  const text = `Académie AMDRH — Mot de passe modifié avec succès

Bonjour ${displayName},

Votre mot de passe a été réinitialisé avec succès.

Si vous n'avez pas effectué cette modification, veuillez contacter immédiatement l'administrateur.

Cordialement,
L'équipe Académie AMDRH
Fédération Royale Marocaine de Handball`;

  return sendEmail({ to, subject, text });
}

// ────────────────────────────────────────────────────────────────
// Credentials Email (sent when admin creates an account)
// ────────────────────────────────────────────────────────────────

export async function sendCredentialsEmail(
  to: string,
  name: string,
  password: string,
  role: string,
  loginUrl: string,
) {
  const displayName = name || "Utilisateur";
  const subject = "Académie AMDRH — Votre compte a été créé";

  const text = `Académie AMDRH — Votre compte a été créé

Bonjour ${displayName},

Un administrateur a créé un compte pour vous sur la plateforme Académie AMDRH.

Vos identifiants de connexion :
  Email :    ${to}
  Mot de passe : ${password}
  Rôle :     ${role}

Connectez-vous à votre espace : ${loginUrl}

Nous vous recommandons de changer votre mot de passe dès votre première connexion.

Cordialement,
L'équipe Académie AMDRH
Fédération Royale Marocaine de Handball`;

  return sendEmail({ to, subject, text });
}

// ────────────────────────────────────────────────────────────────
// Email Verification
// ────────────────────────────────────────────────────────────────

export async function sendEmailVerification(
  to: string,
  name: string,
  verificationUrl: string,
) {
  const displayName = name || "Utilisateur";
  const subject = "Académie AMDRH — Vérification de votre adresse email";

  const text = `Académie AMDRH — Vérification de votre adresse email

Bonjour ${displayName},

Veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :
${verificationUrl}

Ce lien expire dans 24 heures.

Si vous n'avez pas créé de compte, ignorez cet email.

Cordialement,
L'équipe Académie AMDRH
Fédération Royale Marocaine de Handball`;

  return sendEmail({ to, subject, text });
}
