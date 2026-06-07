import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * POST /api/auth/seed — Create default test users if they don't exist.
 * This is a one-time setup endpoint for creating admin and test accounts.
 * Should be called after deploying to a new database (e.g., Neon on Vercel).
 */
export async function POST() {
  try {
    const testUsers = [
      {
        email: "admin@amdrh.ma",
        password: "Admin@2024!",
        nom: "Admin",
        prenom: "Système",
        role: "ADMIN",
        telephone: "+212600000001",
      },
      {
        email: "formateur@amdrh.ma",
        password: "Formateur@2024!",
        nom: "Formateur",
        prenom: "Référent",
        role: "FORMATEUR",
        telephone: "+212600000002",
      },
      {
        email: "arbitre@amdrh.ma",
        password: "Arbitre@2024!",
        nom: "Arbitre",
        prenom: "Test",
        role: "ARBITRE",
        telephone: "+212600000003",
        licenceNumber: "ARB-2024-001",
        club: "ASFAR",
        region: "Rabat-Salé-Kénitra",
      },
      {
        email: "entraineur@amdrh.ma",
        password: "Entraineur@2024!",
        nom: "Entraîneur",
        prenom: "Test",
        role: "ENTRAINEUR",
        telephone: "+212600000004",
        club: "WAC",
        region: "Casablanca-Settat",
      },
      {
        email: "joueur@amdrh.ma",
        password: "Joueur@2024!",
        nom: "Joueur",
        prenom: "Test",
        role: "JOUEUR",
        telephone: "+212600000005",
        club: "FAR",
        region: "Marrakech-Safi",
        licenceNumber: "JOU-2024-001",
      },
    ];

    const results: { email: string; status: string }[] = [];

    for (const userData of testUsers) {
      const existing = await db.user.findUnique({
        where: { email: userData.email },
        select: { id: true, email: true, role: true },
      });

      if (existing) {
        results.push({ email: userData.email, status: `existe déjà (rôle: ${existing.role})` });
        continue;
      }

      const passwordHash = await bcrypt.hash(userData.password, 12);

      const user = await db.user.create({
        data: {
          email: userData.email,
          passwordHash,
          nom: userData.nom,
          prenom: userData.prenom,
          role: userData.role,
          telephone: userData.telephone,
          isActive: true,
          emailVerified: true,
          licenceNumber: (userData as { licenceNumber?: string }).licenceNumber || null,
          club: (userData as { club?: string }).club || null,
          region: (userData as { region?: string }).region || null,
        },
        select: { id: true, email: true, role: true },
      });

      results.push({ email: userData.email, status: `créé (${user.id})` });
    }

    // Also seed permissions if they don't exist
    const permissionCount = await db.permission.count();
    if (permissionCount === 0) {
      const permissions = [
        // Users module
        { name: "users.view", description: "Voir la liste des utilisateurs", module: "users", action: "view" },
        { name: "users.create", description: "Créer un utilisateur", module: "users", action: "create" },
        { name: "users.edit", description: "Modifier un utilisateur", module: "users", action: "edit" },
        { name: "users.delete", description: "Supprimer un utilisateur", module: "users", action: "delete" },
        // Courses module
        { name: "courses.view", description: "Voir les cours", module: "courses", action: "view" },
        { name: "courses.create", description: "Créer un cours", module: "courses", action: "create" },
        { name: "courses.edit", description: "Modifier un cours", module: "courses", action: "edit" },
        { name: "courses.delete", description: "Supprimer un cours", module: "courses", action: "delete" },
        { name: "courses.publish", description: "Publier un cours", module: "courses", action: "manage" },
        // Quizzes module
        { name: "quizzes.view", description: "Voir les quiz", module: "quizzes", action: "view" },
        { name: "quizzes.create", description: "Créer un quiz", module: "quizzes", action: "create" },
        { name: "quizzes.edit", description: "Modifier un quiz", module: "quizzes", action: "edit" },
        { name: "quizzes.delete", description: "Supprimer un quiz", module: "quizzes", action: "delete" },
        // Certificates module
        { name: "certificates.view", description: "Voir les certificats", module: "certificates", action: "view" },
        { name: "certificates.create", description: "Créer un certificat", module: "certificates", action: "create" },
        { name: "certificates.revoke", description: "Révoquer un certificat", module: "certificates", action: "manage" },
        // Notifications module
        { name: "notifications.view", description: "Voir les notifications", module: "notifications", action: "view" },
        { name: "notifications.create", description: "Créer une notification", module: "notifications", action: "create" },
        // Resources module
        { name: "resources.view", description: "Voir les ressources", module: "resources", action: "view" },
        { name: "resources.create", description: "Créer une ressource", module: "resources", action: "create" },
        { name: "resources.edit", description: "Modifier une ressource", module: "resources", action: "edit" },
        { name: "resources.delete", description: "Supprimer une ressource", module: "resources", action: "delete" },
        // Announcements module
        { name: "announcements.view", description: "Voir les annonces", module: "announcements", action: "view" },
        { name: "announcements.create", description: "Créer une annonce", module: "announcements", action: "create" },
        { name: "announcements.edit", description: "Modifier une annonce", module: "announcements", action: "edit" },
        { name: "announcements.delete", description: "Supprimer une annonce", module: "announcements", action: "delete" },
        // Analytics module
        { name: "analytics.view", description: "Voir les analytics", module: "analytics", action: "view" },
        // Settings module
        { name: "settings.view", description: "Voir les paramètres", module: "admin", action: "view" },
        { name: "settings.edit", description: "Modifier les paramètres", module: "admin", action: "edit" },
      ];

      for (const perm of permissions) {
        await db.permission.create({ data: perm });
      }
    }

    // Seed role permissions for ADMIN (all permissions)
    const adminRolePerms = await db.rolePermission.count({ where: { role: "ADMIN" } });
    if (adminRolePerms === 0) {
      const allPermissions = await db.permission.findMany({ select: { id: true } });
      for (const perm of allPermissions) {
        await db.rolePermission.create({
          data: { role: "ADMIN", permissionId: perm.id },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Seed terminé avec succès",
      results,
    });
  } catch (error) {
    console.error("[Seed Error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors du seed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
