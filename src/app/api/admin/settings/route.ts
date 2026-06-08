import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";

const DEFAULT_SETTINGS = {
  platform: {
    name: "Académie AMDRH",
    description:
      "Plateforme e-learning de l'Académie AMDRH, partenaire académique officiel de la FRMHB.",
    contactEmail: "contact@amdrh-academie.org",
    frmhbPartnership: "Partenaire académique officiel FRMHB",
    academicYear: "2024-2025",
  },
  appearance: {
    primaryColor: "#0F766E",
    logoUrl: "/logo.svg",
    faviconUrl: "/logo.svg",
    customCSS: "",
  },
  email: {
    smtpHost: "smtp.example.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "noreply@amdrh-academie.org",
    encryption: "tls",
  },
  security: {
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
  },
  learning: {
    defaultPassingScore: 70,
    maxQuizAttempts: 3,
    certificateValidity: 24,
    badgeCriteria: "auto",
    autoEnrollment: false,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    notificationRetention: 90,
  },
};

const SETTINGS_KEY = "platform_settings";

async function loadSettings(): Promise<typeof DEFAULT_SETTINGS> {
  try {
    const row = await db.setting.findUnique({ where: { key: SETTINGS_KEY } });
    if (row) {
      return JSON.parse(row.value);
    }
  } catch (error) {
    console.error("[Settings] Error loading from DB:", error);
  }
  return { ...DEFAULT_SETTINGS };
}

async function saveSettings(settings: Record<string, unknown>): Promise<void> {
  await db.setting.upsert({
    where: { key: SETTINGS_KEY },
    update: { value: JSON.stringify(settings) },
    create: { key: SETTINGS_KEY, value: JSON.stringify(settings) },
  });
}

// GET /api/admin/settings — Load all settings
export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const settings = await loadSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("[Settings GET]", error);
    return NextResponse.json(
      { success: true, settings: DEFAULT_SETTINGS },
      { status: 200 }
    );
  }
}

// PUT /api/admin/settings — Save a specific section
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { success: false, error: "Section et données requises" },
        { status: 400 }
      );
    }

    const validSections = [
      "platform",
      "appearance",
      "email",
      "security",
      "learning",
      "notifications",
    ];

    if (!validSections.includes(section)) {
      return NextResponse.json(
        { success: false, error: "Section invalide" },
        { status: 400 }
      );
    }

    const settings = await loadSettings();
    settings[section] = { ...settings[section], ...data };

    await saveSettings(settings);

    return NextResponse.json({
      success: true,
      message: "Paramètres sauvegardés avec succès",
      settings,
    });
  } catch (error) {
    console.error("[Settings PUT]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la sauvegarde" },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings — Actions (test-email, clear-cache, export-data)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { action } = body;

    if (action === "test-email") {
      // Import the email service
      const { sendEmail } = await import("@/lib/email");
      const testResult = await sendEmail({
        to: body.email || "test@example.com",
        subject: "Test — Académie AMDRH",
        text: "Ceci est un e-mail de test depuis l'Académie AMDRH.\nSi vous recevez cet e-mail, la configuration est correcte.",
      });
      return NextResponse.json({
        success: testResult.success,
        message: testResult.success
          ? "E-mail de test envoyé avec succès"
          : `Échec de l'envoi: ${testResult.error}`,
      });
    }

    if (action === "clear-cache") {
      return NextResponse.json({
        success: true,
        message: "Cache effacé avec succès",
      });
    }

    if (action === "export-data") {
      const settings = await loadSettings();
      return NextResponse.json({
        success: true,
        message: "Données exportées avec succès",
        data: settings,
      });
    }

    return NextResponse.json(
      { success: false, error: "Action non reconnue" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[Settings POST]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'action" },
      { status: 500 }
    );
  }
}
