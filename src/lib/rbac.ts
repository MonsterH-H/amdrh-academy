// src/lib/rbac.ts — Unified RBAC permission checker

import { db } from '@/lib/db'

// Cache role permissions in memory (refreshed periodically)
let permissionCache: Map<string, Set<string>> = new Map()
let lastCacheRefresh = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Check if a user has a specific permission.
 * Uses database permissions (System B) with in-memory cache.
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  // Get user role from DB
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true },
  })
  if (!user || !user.isActive) return false

  // Admin has all permissions
  if (user.role === 'ADMIN') return true

  // Check cached permissions
  await refreshCacheIfNeeded()
  const rolePerms = permissionCache.get(user.role)
  return rolePerms?.has(permission) ?? false
}

/**
 * Check if a user has ANY of the given permissions.
 */
export async function hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
  for (const perm of permissions) {
    if (await hasPermission(userId, perm)) return true
  }
  return false
}

/**
 * Require a specific permission. Throws if not authorized.
 */
export async function requirePermission(userId: string, permission: string): Promise<void> {
  if (!(await hasPermission(userId, permission))) {
    throw new PermissionError(permission)
  }
}

export class PermissionError extends Error {
  constructor(permission: string) {
    super(`Permission denied: ${permission}`)
    this.name = 'PermissionError'
  }
}

async function refreshCacheIfNeeded() {
  if (Date.now() - lastCacheRefresh < CACHE_TTL && permissionCache.size > 0) return

  const rolePermissions = await db.rolePermission.findMany({
    include: { permission: true },
  })

  permissionCache.clear()
  for (const rp of rolePermissions) {
    if (!permissionCache.has(rp.role)) {
      permissionCache.set(rp.role, new Set())
    }
    permissionCache.get(rp.role)!.add(rp.permission.name)
  }
  lastCacheRefresh = Date.now()
}
