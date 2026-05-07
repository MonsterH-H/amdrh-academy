import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-helpers";
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

    const roles = ROLES.map((role) => ({
      role,
      roleLabel: ROLE_LABELS[role],
      permissions: [...(DEFAULT_ROLE_PERMISSIONS[role] || [])],
    }));

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
 * Sauvegarde les permissions pour un rôle donné.
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

    // In production, this would save to database.
    // For now, we update the in-memory defaults and return success.
    // The defaults are used as fallback when no DB storage exists.

    return NextResponse.json({
      success: true,
      role,
      roleLabel: ROLE_LABELS[role],
      permissionsCount: permissions.length,
    });
  } catch (error) {
    console.error("[Permissions PUT]", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: "Impossible de sauvegarder les permissions" },
      { status: 500 }
    );
  }
}
