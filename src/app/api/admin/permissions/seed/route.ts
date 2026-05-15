import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, ALL_ROLES } from "@/lib/permissions";

/**
 * POST /api/admin/permissions/seed
 * Initialise les permissions par défaut dans la base de données.
 * Idempotent : ne recrée pas les permissions existantes.
 */
export async function POST(req: Request) {
  try {
    const auth = await requireRole(req as unknown as Parameters<typeof requireRole>[0], ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    let created = 0;
    let updated = 0;

    // Créer/mettre à jour les permissions
    for (const permDef of ALL_PERMISSIONS) {
      const existing = await db.permission.findUnique({
        where: { name: permDef.name },
      });

      if (!existing) {
        await db.permission.create({
          data: {
            name: permDef.name,
            description: permDef.description,
            module: permDef.module,
            action: permDef.action,
          },
        });
        created++;
      } else {
        await db.permission.update({
          where: { name: permDef.name },
          data: {
            description: permDef.description,
            module: permDef.module,
            action: permDef.action,
          },
        });
        updated++;
      }
    }

    // Créer les affectations par défaut pour chaque rôle
    let roleLinks = 0;
    for (const role of ALL_ROLES) {
      const permNames = DEFAULT_ROLE_PERMISSIONS[role] || [];

      // Supprimer les anciens liens pour ce rôle
      await db.rolePermission.deleteMany({ where: { role } });

      // Recréer les liens
      for (const permName of permNames) {
        const perm = await db.permission.findUnique({
          where: { name: permName },
        });
        if (perm) {
          await db.rolePermission.create({
            data: { role, permissionId: perm.id },
          });
          roleLinks++;
        }
      }
    }

    // Supprimer les permissions orphelines (qui ne sont plus dans ALL_PERMISSIONS)
    const allDefinedNames = ALL_PERMISSIONS.map(p => p.name);
    const allDbPerms = await db.permission.findMany({ select: { id: true, name: true } });
    const orphaned = allDbPerms.filter(p => !allDefinedNames.includes(p.name));
    if (orphaned.length > 0) {
      await db.rolePermission.deleteMany({
        where: { permissionId: { in: orphaned.map(p => p.id) } },
      });
      await db.permission.deleteMany({
        where: { id: { in: orphaned.map(p => p.id) } },
      });
    }

    const totalPermissions = await db.permission.count();
    const totalLinks = await db.rolePermission.count();

    return NextResponse.json({
      success: true,
      message: "Permissions initialisées avec succès",
      stats: {
        permissionsCreated: created,
        permissionsUpdated: updated,
        orphanedRemoved: orphaned.length,
        roleLinksCreated: roleLinks,
        totalPermissions,
        totalRoleLinks: totalLinks,
      },
    });
  } catch (error) {
    console.error("[Permissions Seed Error]", error);
    return NextResponse.json(
      { error: "Erreur lors de l'initialisation des permissions" },
      { status: 500 }
    );
  }
}
