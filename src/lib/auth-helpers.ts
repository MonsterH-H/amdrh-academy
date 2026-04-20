import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Check if the requesting user has the required role(s).
 * Expects `role` and optionally `userId` query params.
 * Returns { authorized: true, role, userId } or { authorized: false }.
 */
export async function checkRole(
  req: NextRequest,
  allowedRoles: string[] = ["ADMIN", "FORMATEUR"]
): Promise<{ authorized: boolean; role?: string; userId?: string; user?: Record<string, unknown> }> {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "";
  const role = searchParams.get("role") || "";

  if (!userId || !role) {
    return { authorized: false };
  }

  if (!allowedRoles.includes(role)) {
    return { authorized: false, role, userId };
  }

  // Optionally verify user exists in DB
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return { authorized: false, role, userId };
  }

  if (!allowedRoles.includes(user.role)) {
    return { authorized: false, role: user.role, userId: user.id };
  }

  return { authorized: true, role: user.role, userId: user.id, user: user as unknown as Record<string, unknown> };
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
): Promise<{ authorized: true; role: string; userId: string; user: Record<string, unknown> } | { authorized: false; response: NextResponse }> {
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
    user: result.user || { id: result.userId!, role: result.role! },
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
): Promise<{ authorized: true; role: string; userId: string; user: Record<string, unknown> } | { authorized: false; response: NextResponse }> {
  return requireRole(req, ["ADMIN", "FORMATEUR"]);
}

/**
 * Get user ID and role from request params.
 * Returns { userId, role } or null.
 */
export function getUserFromRequest(req: NextRequest): { userId: string; role: string } | null {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "";
  const role = searchParams.get("role") || "";
  if (!userId || !role) return null;
  return { userId, role };
}
