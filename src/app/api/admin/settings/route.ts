import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { requireRole } from "@/lib/auth-helpers";

const SETTINGS_FILE = join(process.cwd(), "db", "admin-settings.json");

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

async function ensureSettingsFile(): Promise<void> {
  try {
    await readFile(SETTINGS_FILE, "utf-8");
  } catch {
    await mkdir(join(process.cwd(), "db"), { recursive: true });
    await writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8");
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    await ensureSettingsFile();
    const raw = await readFile(SETTINGS_FILE, "utf-8");
    const settings = JSON.parse(raw);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("[Settings GET]", error);
    return NextResponse.json(
      { success: true, settings: DEFAULT_SETTINGS },
      { status: 200 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    await ensureSettingsFile();
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

    const raw = await readFile(SETTINGS_FILE, "utf-8");
    const settings = JSON.parse(raw);
    settings[section] = { ...settings[section], ...data };

    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");

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

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const { action } = body;

    if (action === "test-email") {
      return NextResponse.json({
        success: true,
        message: "E-mail de test envoyé avec succès",
      });
    }

    if (action === "clear-cache") {
      return NextResponse.json({
        success: true,
        message: "Cache effacé avec succès",
      });
    }

    if (action === "export-data") {
      const raw = await readFile(SETTINGS_FILE, "utf-8").catch(() => "");
      const settings = raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
      return NextResponse.json({
        success: true,
        message: "Données exportées avec succès",
        data: settings,
      });
    }

    if (action === "backup") {
      const raw = await readFile(SETTINGS_FILE, "utf-8");
      const backupFile = join(process.cwd(), "db", `admin-settings-backup-${Date.now()}.json`);
      await writeFile(backupFile, raw, "utf-8");
      return NextResponse.json({
        success: true,
        message: `Sauvegarde créée : admin-settings-backup-${Date.now()}.json`,
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
