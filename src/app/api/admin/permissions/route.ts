import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { ROLES, ROLE_LABELS, DEFAULT_ROLE_PERMISSIONS, PERMISSION_MODULES, ALL_PERMISSIONS } from "@/lib/permissions";

/**
 * GET /api/admin/permissions
 * Récupère la matrice des permissions avec les labels.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    // Build the response with module info + labels
    const modules = PERMISSION_MODULES.map((mod) => ({
      id: mod.id,
      label: mod.label,
      icon: mod.icon,
      permissions: (ALL_PERMISSIONS[mod.id] || []).map((p) => ({
        id: p.id,
        label: p.label,
        description: p.description,
      })),
    }));

    // Build role permissions from DB (RolePermission table) or fall back to defaults
    const roles = await Promise.all(
      ROLES.map(async (role) => {
        const storedPerms = await db.rolePermission.findMany({
          where: { role },
          include: { permission: { select: { name: true } } },
        });

        const permissions = storedPerms.length > 0
          ? storedPerms.map((rp) => rp.permission.name)
          : [...(DEFAULT_ROLE_PERMISSIONS[role] || [])];

        return {
          role,
          roleLabel: ROLE_LABELS[role],
          permissions,
        };
      })
    );

    return NextResponse.json({ modules, roles });
  } catch (error) {
    console.error("[Permissions GET]", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: "Impossible de charger les permissions" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/permissions
 * Sauvegarde les permissions pour un rôle donné en base de données.
 * Body: { role: string, permissions: string[] }
 */
export async function PUT(req: NextRequest) {
  try {
    const auth = await requireRole(req, ["ADMIN"]);
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const { role, permissions } = body;

    if (!role || !ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Rôle invalide", details: `Le rôle "${role}" n'existe pas` },
        { status: 400 }
      );
    }

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { error: "Format invalide", details: "permissions doit être un tableau" },
        { status: 400 }
      );
    }

    // Validate all permission IDs
    const allValidIds = new Set(Object.values(ALL_PERMISSIONS).flat().map((p) => p.id));
    const invalidPerms = permissions.filter((p: string) => !allValidIds.has(p));
    if (invalidPerms.length > 0) {
      return NextResponse.json(
        { error: "Permissions invalides", details: `${invalidPerms.length} permissions non reconnues` },
        { status: 400 }
      );
    }

    // Ensure all Permission records exist in DB
    for (const permId of permissions) {
      const parts = permId.split(".");
      const modName = parts[0];
      const action = parts.slice(1).join(".");
      const existing = await db.permission.findUnique({ where: { name: permId } });
      if (!existing) {
        await db.permission.create({
          data: {
            name: permId,
            module: modName,
            action: action,
            description: `${modName} — ${action}`,
          },
        });
      }
    }

    // Delete existing role permissions and recreate
    await db.rolePermission.deleteMany({ where: { role } });

    // Find permission records by name and create links with proper foreign keys
    const permRecords = await db.permission.findMany({
      where: { name: { in: permissions } },
      select: { id: true, name: true },
    });

    if (permRecords.length > 0) {
      await db.rolePermission.createMany({
        data: permRecords.map((p) => ({
          role,
          permissionId: p.id,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      role,
      roleLabel: ROLE_LABELS[role],
      permissionsCount: permRecords.length,
    });
  } catch (error) {
    console.error("[Permissions PUT]", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: "Impossible de sauvegarder les permissions" },
      { status: 500 }
    );
  }
}
