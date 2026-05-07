"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield, Check, X, ChevronDown, ChevronRight,
  RotateCcw, Save, AlertCircle, Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/store/app";
import {
  PERMISSION_MODULES,
  ALL_PERMISSIONS,
  ROLES,
  ROLE_LABELS,
  DEFAULT_ROLE_PERMISSIONS,
} from "@/lib/permissions";
import type { PermissionModule, RolePermissions } from "../types";

function buildModules(): PermissionModule[] {
  return PERMISSION_MODULES.map((mod) => ({
    id: mod.id,
    label: mod.label,
    icon: mod.icon,
    permissions: (ALL_PERMISSIONS[mod.id] || []).map((p) => ({
      id: p.id,
      label: p.label,
      description: p.description,
    })),
    expanded: false,
  }));
}

function buildDefaultRoles(): RolePermissions[] {
  return ROLES.map((role) => ({
    role,
    roleLabel: ROLE_LABELS[role],
    permissions: [...(DEFAULT_ROLE_PERMISSIONS[role] || [])],
  }));
}

function PermissionsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-72" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function AdminPermissionsPage() {
  const [modules, setModules] = useState<PermissionModule[]>([]);
  const [roles, setRoles] = useState<RolePermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [initialPermissions, setInitialPermissions] = useState<Record<string, string[]>>({});
  const user = useAppStore((s) => s.user);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/permissions");
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      const builtModules = buildModules();
      setModules(builtModules);
      if (data.roles && data.roles.length > 0) {
        setRoles(data.roles);
        const init: Record<string, string[]> = {};
        data.roles.forEach((r: RolePermissions) => { init[r.role] = [...r.permissions]; });
        setInitialPermissions(init);
      } else {
        const defaultRoles = buildDefaultRoles();
        setRoles(defaultRoles);
        const init: Record<string, string[]> = {};
        defaultRoles.forEach((r) => { init[r.role] = [...r.permissions]; });
        setInitialPermissions(init);
      }
    } catch {
      setModules(buildModules());
      const defaultRoles = buildDefaultRoles();
      setRoles(defaultRoles);
      const init: Record<string, string[]> = {};
      defaultRoles.forEach((r) => { init[r.role] = [...r.permissions]; });
      setInitialPermissions(init);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const hasPermission = useCallback((role: string, permId: string) => {
    const roleData = roles.find((r) => r.role === role);
    return roleData?.permissions.includes(permId) ?? false;
  }, [roles]);

  const togglePermission = useCallback((role: string, permId: string) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.role !== role) return r;
        const has = r.permissions.includes(permId);
        return {
          ...r,
          permissions: has
            ? r.permissions.filter((p) => p !== permId)
            : [...r.permissions, permId],
        };
      })
    );
  }, []);

  const toggleModule = useCallback((role: string, modulePerms: string[]) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.role !== role) return r;
        const allEnabled = modulePerms.every((p) => r.permissions.includes(p));
        if (allEnabled) {
          return { ...r, permissions: r.permissions.filter((p) => !modulePerms.includes(p)) };
        }
        const newPerms = [...new Set([...r.permissions, ...modulePerms])];
        return { ...r, permissions: newPerms };
      })
    );
  }, []);

  const saveRole = useCallback(async (role: string) => {
    const roleData = roles.find((r) => r.role === role);
    if (!roleData) return;
    setSaving(role);
    try {
      const res = await fetch("/api/admin/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, permissions: roleData.permissions }),
      });
      if (!res.ok) throw new Error("Erreur de sauvegarde");
      const init = { ...initialPermissions, [role]: [...roleData.permissions] };
      setInitialPermissions(init);
      toast({ title: "Permissions sauvegardées", description: `Permissions de ${ROLE_LABELS[role]} mises à jour` });
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder les permissions", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  }, [roles, initialPermissions, toast]);

  const resetRole = useCallback((role: string) => {
    const defaults = DEFAULT_ROLE_PERMISSIONS[role] || [];
    setRoles((prev) =>
      prev.map((r) => (r.role === role ? { ...r, permissions: [...defaults] } : r))
    );
    setInitialPermissions((prev) => ({ ...prev, [role]: [...defaults] }));
    toast({ title: "Réinitialisé", description: `Permissions de ${ROLE_LABELS[role]} remises par défaut` });
  }, [toast]);

  const isModified = useCallback((role: string) => {
    const current = roles.find((r) => r.role === role)?.permissions || [];
    const initial = initialPermissions[role] || [];
    if (current.length !== initial.length) return true;
    return current.some((p, i) => p !== initial[i]);
  }, [roles, initialPermissions]);

  const toggleModuleExpand = (modId: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === modId ? { ...m, expanded: !m.expanded } : m))
    );
  };

  if (loading) return <PermissionsSkeleton />;

  const totalPermissions = modules.reduce((acc, m) => acc + m.permissions.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Gestion des Permissions
          </h1>
          <p className="text-muted-foreground">
            Configurez les accès par rôle — {ROLES.length} rôles, {totalPermissions} permissions, {modules.length} modules
          </p>
        </div>
      </div>

      {/* Legend */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Légende :</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Switch checked disabled className="pointer-events-none" />
              <span>Activé</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Switch checked={false} disabled className="pointer-events-none" />
              <span>Désactivé</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-0">Modifié</Badge>
              <span className="text-muted-foreground">Changements non sauvegardés</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold min-w-[200px]">Module / Permission</th>
                  {roles.map((r) => (
                    <th key={r.role} className="text-center p-3 min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold text-xs">{r.roleLabel}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {r.permissions.length} / {totalPermissions}
                        </span>
                        {isModified(r.role) && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-0">
                            modifié
                          </Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modules.map((mod) => {
                  const modulePermIds = mod.permissions.map((p) => p.id);
                  return (
                    <tbody key={mod.id}>
                      {/* Module header row */}
                      <tr className="border-b bg-muted/30 hover:bg-muted/50 cursor-pointer">
                        <td
                          className="p-3 font-semibold"
                          onClick={() => toggleModuleExpand(mod.id)}
                        >
                          <div className="flex items-center gap-2">
                            {mod.expanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>{mod.label}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {mod.permissions.length}
                            </Badge>
                          </div>
                        </td>
                        {roles.map((r) => {
                          const enabledCount = modulePermIds.filter((p) => r.permissions.includes(p)).length;
                          const allEnabled = enabledCount === modulePermIds.length;
                          return (
                            <td key={r.role} className="text-center p-3">
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-xs text-muted-foreground min-w-[24px]">
                                  {enabledCount}
                                </span>
                                <Button
                                  variant={allEnabled ? "default" : "outline"}
                                  size="sm"
                                  className="h-7 px-2 text-[10px]"
                                  onClick={() => toggleModule(r.role, modulePermIds)}
                                >
                                  {allEnabled ? "Tout" : "Activer"}
                                </Button>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                      {/* Permission rows (expanded) */}
                      {mod.expanded && mod.permissions.map((perm) => (
                        <tr key={perm.id} className="border-b hover:bg-muted/20">
                          <td className="p-3 pl-10">
                            <div>
                              <span className="text-sm">{perm.label}</span>
                              <p className="text-[11px] text-muted-foreground">{perm.description}</p>
                            </div>
                          </td>
                          {roles.map((r) => {
                            const enabled = hasPermission(r.role, perm.id);
                            return (
                              <td key={r.role} className="text-center p-3">
                                <div className="flex justify-center">
                                  <Switch
                                    checked={enabled}
                                    onCheckedChange={() => togglePermission(r.role, perm.id)}
                                    disabled={r.role === "ADMIN"}
                                    className="cursor-pointer"
                                  />
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Save / Reset per role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {roles.map((r) => (
          <Card key={r.role} className="bg-muted/20">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-semibold">{r.roleLabel}</Badge>
                <span className="text-xs text-muted-foreground">{r.permissions.length} permissions</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => saveRole(r.role)}
                  disabled={saving === r.role || !isModified(r.role)}
                >
                  {saving === r.role ? (
                    <span className="flex items-center gap-1">
                      <RotateCcw className="h-3 w-3 animate-spin" /> Sauvegarde...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Save className="h-3 w-3" /> Enregistrer
                    </span>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resetRole(r.role)}
                  disabled={saving === r.role}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
