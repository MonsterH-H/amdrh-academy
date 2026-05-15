import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface AuthUser {
  id: string;
  role: string;
  isActive: boolean;
}

/**
 * Require authentication (any authenticated user).
 * Returns { authorized: true, role, userId, user } or { authorized: false, response }.
 */
export async function requireAuth(
  req: NextRequest,
): Promise<{ authorized: true; role: string; userId: string; user: AuthUser } | { authorized: false; response: NextResponse }> {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "";

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
 * Expects `userId` query param (role is fetched from DB).
 * Returns { authorized: true, role, userId } or { authorized: false }.
 */
export async function checkRole(
  req: NextRequest,
  allowedRoles: string[] = ["ADMIN", "FORMATEUR"]
): Promise<{ authorized: boolean; role?: string; userId?: string; user?: AuthUser }> {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "";

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
 * Get user ID and role from request params.
 * Only requires `userId` — role is fetched from DB.
 * Returns { userId, role } or null.
 */
export async function getUserFromRequest(req: NextRequest): Promise<{ userId: string; role: string } | null> {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "";
  if (!userId) return null;
  
  // Check if role is explicitly provided (for performance)
  const explicitRole = searchParams.get("role");
  if (explicitRole) return { userId, role: explicitRole };
  
  // Fetch role from DB
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true },
  });
  if (!user || !user.isActive) return null;
  return { userId, role: user.role };
}
