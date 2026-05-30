import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-helpers";
import { invalidatePermissionCache } from "@/lib/rbac";
import { ALL_PERMISSIONS_FLAT, DEFAULT_ROLE_PERMISSIONS, ALL_ROLES } from "@/lib/permissions";

/**
 * POST /api/admin/permissions/seed
 * Initialise les permissions par défaut dans la base de données.
 * Idempotent : ne recrée pas les permissions existantes.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    let created = 0;
    let updated = 0;

    // Créer/mettre à jour les permissions
    for (const permDef of ALL_PERMISSIONS_FLAT) {
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

    // Supprimer les permissions orphelines
    const allDefinedNames = ALL_PERMISSIONS_FLAT.map(p => p.name);
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

    // Invalidate RBAC cache so permission checks reflect the new data
    invalidatePermissionCache();

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
