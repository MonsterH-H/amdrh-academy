import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Re-export unified RBAC permission functions
export { hasPermission, hasAnyPermission, requirePermission, PermissionError } from './rbac'

interface AuthUser {
  id: string;
  role: string;
  isActive: boolean;
}

/**
 * Extract userId from request.
 * Checks in order: x-user-id header → userId query param.
 * Note: The global fetch interceptor in page.tsx automatically adds x-user-id header
 * to ALL /api/ requests (including FormData), so this covers all cases.
 */
function extractUserId(req: NextRequest): string {
  // Priority 1: Custom header (set by client-side fetch interceptor / apiFetch)
  const headerUserId = req.headers.get("x-user-id");
  if (headerUserId) return headerUserId;

  // Priority 2: Query parameter (backward compat)
  const { searchParams } = new URL(req.url);
  const queryUserId = searchParams.get("userId") || "";
  if (queryUserId) return queryUserId;

  return "";
}

/**
 * Require authentication (any authenticated user).
 * Returns { authorized: true, role, userId, user } or { authorized: false, response }.
 */
export async function requireAuth(
  req: NextRequest,
): Promise<{ authorized: true; role: string; userId: string; user: AuthUser } | { authorized: false; response: NextResponse }> {
  const userId = extractUserId(req);

  if (!userId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 },
      ),
    };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Utilisateur non trouvé ou inactif" },
        { status: 401 },
      ),
    };
  }

  return { authorized: true, role: user.role, userId: user.id, user };
}

/**
 * Check if the requesting user has the required role(s).
 * Reads userId from header or query param (role is fetched from DB).
 * Returns { authorized: true, role, userId } or { authorized: false }.
 */
export async function checkRole(
  req: NextRequest,
  allowedRoles: string[] = ["ADMIN", "FORMATEUR"]
): Promise<{ authorized: boolean; role?: string; userId?: string; user?: AuthUser }> {
  const userId = extractUserId(req);

  if (!userId) {
    return { authorized: false };
  }

  // Verify user exists in DB and get their role
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return { authorized: false, userId };
  }

  if (!allowedRoles.includes(user.role)) {
    return { authorized: false, role: user.role, userId: user.id };
  }

  return { authorized: true, role: user.role, userId: user.id, user };
}

/**
 * Middleware helper: returns 403 if user doesn't have required role.
 * Usage:
 *   const auth = await requireRole(req, ["ADMIN"]);
 *   if (!auth.authorized) return auth.response;
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: string[] = ["ADMIN"]
): Promise<{ authorized: true; role: string; userId: string; user: AuthUser } | { authorized: false; response: NextResponse }> {
  const result = await checkRole(req, allowedRoles);
  if (!result.authorized) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Accès non autorisé", details: "Vous n'avez pas les permissions nécessaires" },
        { status: 403 }
      ),
    };
  }
  return {
    authorized: true,
    role: result.role!,
    userId: result.userId!,
    user: result.user || { id: result.userId!, role: result.role!, isActive: true },
  };
}

/**
 * Convenience wrapper: allows both ADMIN and FORMATEUR roles.
 * Usage:
 *   const auth = await requireRoleOrInstructor(req);
 *   if (!auth.authorized) return auth.response;
 */
export async function requireRoleOrInstructor(
  req: NextRequest,
): Promise<{ authorized: true; role: string; userId: string; user: AuthUser } | { authorized: false; response: NextResponse }> {
  return requireRole(req, ["ADMIN", "FORMATEUR"]);
}

/**
 * Get user ID and role from request.
 * Reads userId from header or query param — role is fetched from DB.
 * Returns { userId, role } or null.
 */
export async function getUserFromRequest(req: NextRequest): Promise<{ userId: string; role: string } | null> {
  const userId = extractUserId(req);
  if (!userId) return null;

  // ALWAYS fetch role from the database — never trust client-supplied role
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true },
  });
  if (!user || !user.isActive) return null;

  // If an explicit role was provided, verify it matches the DB role.
  const { searchParams } = new URL(req.url);
  const explicitRole = searchParams.get("role");
  if (explicitRole && explicitRole !== user.role) {
    console.warn(`[Auth] Role mismatch for userId=${userId}: client="${explicitRole}", db="${user.role}"`);
  }

  return { userId, role: user.role };
}
