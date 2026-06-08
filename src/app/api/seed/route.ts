import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const users = [
      { email: "admin@amdrh.ma", password: "Admin@2024!", nom: "AMDRH", prenom: "Super", role: "ADMIN", telephone: "+212600000001", club: "FRMHB", region: "Rabat-Salé-Kénitra", bio: "Administrateur principal de l'Académie AMDRH", licenceNumber: "ADM-001" },
      { email: "formateur@amdrh.ma", password: "Formateur@2024!", nom: "BENALI", prenom: "Ahmed", role: "FORMATEUR", telephone: "+212600000002", club: "WAC Casablanca", region: "Casablanca-Settat", bio: "Formateur certifié en arbitrage handball", licenceNumber: "FRM-001" },
      { email: "arbitre@amdrh.ma", password: "Arbitre@2024!", nom: "TAZI", prenom: "Mohamed", role: "ARBITRE", telephone: "+212600000003", club: "FAR Rabat", region: "Rabat-Salé-Kénitra", bio: "Arbitre national niveau 2", licenceNumber: "ARB-001" },
      { email: "entraineur@amdrh.ma", password: "Entraineur@2024!", nom: "ELMANSOURI", prenom: "Karim", role: "ENTRAINEUR", telephone: "+212600000004", club: "AS FAR", region: "Rabat-Salé-Kénitra", bio: "Entraîneur principal catégorie senior", licenceNumber: "ENT-001" },
      { email: "joueur@amdrh.ma", password: "Joueur@2024!", nom: "ALAOUI", prenom: "Youssef", role: "JOUEUR", telephone: "+212600000005", club: "CODM Marrakech", region: "Marrakech-Safi", bio: "Joueur espoir catégorie junior", licenceNumber: "JOU-001" },
    ];

    const created = [];
    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 12);
      const { password: _pw, ...userData } = u;
      const user = await db.user.upsert({
        where: { email: u.email },
        update: { passwordHash: hash },
        create: { ...userData, passwordHash: hash, isActive: true, emailVerified: true },
      });
      created.push({ email: user.email, role: user.role, id: user.id });
    }

    // Create platform settings if not exists
    await db.setting.upsert({
      where: { key: "platform_settings" },
      update: {},
      create: {
        key: "platform_settings",
        value: JSON.stringify({
          platform: { name: "Académie AMDRH", description: "Plateforme e-learning de l'Académie AMDRH, partenaire académique officiel de la FRMHB.", contactEmail: "contact@amdrh-academie.org", frmhbPartnership: "Partenaire académique officiel FRMHB", academicYear: "2024-2025" },
          appearance: { primaryColor: "#0F766E", logoUrl: "/logo.svg", faviconUrl: "/logo.svg", customCSS: "" },
          email: { smtpHost: "", smtpPort: "587", smtpUser: "", smtpPassword: "", fromEmail: "onboarding@resend.dev", encryption: "tls" },
          security: { passwordMinLength: 8, passwordRequireUppercase: true, passwordRequireNumbers: true, passwordRequireSpecialChars: true, sessionTimeout: 60, maxLoginAttempts: 5 },
          learning: { defaultPassingScore: 70, maxQuizAttempts: 3, certificateValidity: 24, badgeCriteria: "auto", autoEnrollment: false },
          notifications: { emailNotifications: true, pushNotifications: false, notificationRetention: 90 },
        }),
      },
    });

    // Create sample notifications for admin
    const admin = created.find(u => u.role === "ADMIN");
    if (admin) {
      await db.notification.createMany({
        data: [
          { userId: admin.id, type: "SYSTEME", title: "Bienvenue sur l'Académie AMDRH", message: "Votre plateforme est configurée et prête. Commencez par créer des cours et gérer vos utilisateurs.", isRead: false },
          { userId: admin.id, type: "SYSTEME", title: "Comptes de test créés", message: "5 comptes de test ont été créés : Admin, Formateur, Arbitre, Entraîneur et Joueur.", isRead: false },
        ],
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: `${created.length} utilisateurs créés avec succès`,
      users: created,
    });
  } catch (error) {
    console.error("[Seed] Error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
