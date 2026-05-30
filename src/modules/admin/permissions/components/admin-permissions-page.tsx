"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Shield, RotateCcw, Save, Info, Search, Sparkles, AlertCircle,
  Database,
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

/* ------------------------------------------------------------------ */
/*  Icon map: module id → Lucide icon component                       */
/* ------------------------------------------------------------------ */
import {
  User, BookOpen, ClipboardList, GraduationCap, Award,
  FolderOpen, Bell, MessageSquare, BarChart3, Activity,
  RefreshCw, ShieldCheck,
} from "lucide-react";

const MODULE_ICONS: Record<string, React.ElementType> = {
  users: User,
  courses: BookOpen,
  quiz: ClipboardList,
  learning_paths: GraduationCap,
  certificates: Award,
  resources: FolderOpen,
  notifications: Bell,
  messages: MessageSquare,
  analytics: BarChart3,
  traceability: Activity,
  sync: RefreshCw,
  permissions: ShieldCheck,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Skeleton                                                          */
/* ------------------------------------------------------------------ */

function PermissionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Role summary card                                                  */
/* ------------------------------------------------------------------ */

function RoleSummaryCard({
  roleData,
  totalPermissions,
  isModified,
  saving,
  onSave,
  onReset,
}: {
  roleData: RolePermissions;
  totalPermissions: number;
  isModified: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  const pct = totalPermissions > 0
    ? Math.round((roleData.permissions.length / totalPermissions) * 100)
    : 0;

  return (
    <Card className="bg-gradient-to-br from-muted/40 to-muted/20 border shadow-sm transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="font-semibold text-xs">
            {roleData.roleLabel}
          </Badge>
          {isModified && (
            <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-0 hover:bg-amber-100">
              modifié
            </Badge>
          )}
        </div>

        {/* Permission count + progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {roleData.permissions.length} / {totalPermissions}
            </span>
            <span className="font-medium">{pct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 transition-all duration-200"
            onClick={onSave}
            disabled={!isModified || saving}
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <RotateCcw className="h-3 w-3 animate-spin" />
                Sauvegarde…
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Save className="h-3 w-3" />
                Enregistrer
              </span>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
            disabled={saving}
            className="transition-colors duration-200"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function AdminPermissionsPage() {
  const [modules, setModules] = useState<PermissionModule[]>([]);
  const [roles, setRoles] = useState<RolePermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [initialPermissions, setInitialPermissions] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [seeding, setSeeding] = useState(false);
  const user = useAppStore((s) => s.user);
  const { toast } = useToast();

  /* ---- Data fetching ---- */

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/permissions?userId=${user?.id}`);
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

  /* ---- Permission helpers ---- */

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

  /* ---- Save / Reset / Seed ---- */

  const saveRole = useCallback(async (role: string) => {
    const roleData = roles.find((r) => r.role === role);
    if (!roleData) return;
    setSaving(role);
    try {
      const res = await fetch(`/api/admin/permissions?userId=${user?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, permissions: roleData.permissions }),
      });
      if (!res.ok) throw new Error("Erreur de sauvegarde");
      const init = { ...initialPermissions, [role]: [...roleData.permissions] };
      setInitialPermissions(init);
      toast({
        title: "Permissions sauvegardées",
        description: `Permissions de ${ROLE_LABELS[role]} mises à jour (${roleData.permissions.length} permissions)`,
      });
    } catch {
      toast({ title: "Erreur", description: "Impossible de sauvegarder les permissions", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  }, [roles, initialPermissions, toast, user?.id]);

  const resetRole = useCallback((role: string) => {
    const defaults = DEFAULT_ROLE_PERMISSIONS[role] || [];
    setRoles((prev) =>
      prev.map((r) => (r.role === role ? { ...r, permissions: [...defaults] } : r))
    );
    setInitialPermissions((prev) => ({ ...prev, [role]: [...defaults] }));
    toast({ title: "Réinitialisé", description: `Permissions de ${ROLE_LABELS[role]} remises par défaut` });
  }, [toast]);

  const seedPermissions = useCallback(async () => {
    setSeeding(true);
    try {
      const res = await fetch(`/api/admin/permissions/seed?userId=${user?.id}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Erreur lors de l'initialisation");
      const data = await res.json();
      toast({
        title: "Permissions initialisées",
        description: `${data.stats?.permissionsCreated || 0} créées, ${data.stats?.permissionsUpdated || 0} mises à jour — ${data.stats?.totalRoleLinks || 0} affectations rôle`,
      });
      // Reload the permissions matrix from DB
      await fetchData();
    } catch {
      toast({ title: "Erreur", description: "Impossible d'initialiser les permissions", variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  }, [toast, fetchData, user?.id]);

  /* ---- Derived state ---- */

  const isModified = useCallback((role: string) => {
    const current = roles.find((r) => r.role === role)?.permissions || [];
    const initial = initialPermissions[role] || [];
    if (current.length !== initial.length) return true;
    return current.some((p, i) => p !== initial[i]);
  }, [roles, initialPermissions]);

  const totalPermissions = useMemo(
    () => modules.reduce((acc, m) => acc + m.permissions.length, 0),
    [modules]
  );

  // Filter modules/permissions by search query
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const q = searchQuery.toLowerCase();
    return modules
      .map((mod) => {
        const filteredPerms = mod.permissions.filter(
          (p) =>
            p.label.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            mod.label.toLowerCase().includes(q)
        );
        return filteredPerms.length > 0
          ? { ...mod, permissions: filteredPerms }
          : null;
      })
      .filter(Boolean) as PermissionModule[];
  }, [modules, searchQuery]);

  /* ---- Render ---- */

  if (loading) return <PermissionsSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            Gestion des Permissions
          </h1>
          <p className="text-muted-foreground text-sm">
            {ROLES.length} rôles · {totalPermissions} permissions · {modules.length} modules
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 transition-all duration-200 hover:shadow-sm"
          onClick={seedPermissions}
          disabled={seeding}
        >
          {seeding ? (
            <RotateCcw className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Initialiser les permissions</span>
          <span className="sm:hidden">Initialiser</span>
        </Button>
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {roles.map((r) => (
          <RoleSummaryCard
            key={r.role}
            roleData={r}
            totalPermissions={totalPermissions}
            isModified={isModified(r.role)}
            saving={saving === r.role}
            onSave={() => saveRole(r.role)}
            onReset={() => resetRole(r.role)}
          />
        ))}
      </div>

      {/* Search + Legend bar */}
      <Card className="bg-muted/30 border shadow-sm">
        <CardContent className="py-3 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrer par permission…"
                className="pl-9 h-9 text-sm bg-background border shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
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
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-0">
                  Modifié
                </Badge>
                <span className="text-muted-foreground">Non sauvegardé</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <Card className="shadow-sm border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b bg-muted/60 backdrop-blur-sm">
                  <th className="text-left p-3 font-semibold min-w-[220px]">
                    <span>Module / Permission</span>
                  </th>
                  {roles.map((r) => (
                    <th key={r.role} className="text-center p-3 min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold text-xs">{r.roleLabel}</span>
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {r.permissions.length} / {totalPermissions}
                        </Badge>
                        {isModified(r.role) && (
                          <Badge className="text-[9px] px-1.5 py-0 bg-amber-100 text-amber-700 border-0">
                            modifié
                          </Badge>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredModules.length === 0 && (
                  <tr>
                    <td colSpan={roles.length + 1} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-muted-foreground/50" />
                        <span>Aucune permission ne correspond à votre recherche</span>
                      </div>
                    </td>
                  </tr>
                )}
                {filteredModules.map((mod) => {
                  const modulePermIds = mod.permissions.map((p) => p.id);
                  const ModIcon = MODULE_ICONS[mod.id] || Shield;
                  return (
                    <tr key={mod.id} className="border-b-2 border-muted/50">
                      <td
                        className="p-3 bg-muted/30 font-semibold"
                        colSpan={roles.length + 1}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center h-7 w-7 rounded-md bg-primary/10 shrink-0">
                            <ModIcon className="h-4 w-4 text-primary" />
                          </div>
                          <span>{mod.label}</span>
                          <Badge variant="outline" className="text-[10px] font-normal">
                            {mod.permissions.length}
                          </Badge>

                          {/* Module-level toggle per role (inline in module header) */}
                          <div className="ml-auto flex items-center gap-2">
                            {roles.map((r) => {
                              const enabledCount = modulePermIds.filter((p) => r.permissions.includes(p)).length;
                              const allEnabled = enabledCount === modulePermIds.length;
                              const someEnabled = enabledCount > 0 && !allEnabled;
                              return (
                                <Tooltip key={r.role}>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant={allEnabled ? "default" : someEnabled ? "secondary" : "outline"}
                                      size="sm"
                                      className="h-6 px-2 text-[10px] gap-1 transition-all duration-150"
                                      onClick={() => toggleModule(r.role, modulePermIds)}
                                      disabled={r.role === "ADMIN"}
                                    >
                                      <span className="font-medium">{enabledCount}/{modulePermIds.length}</span>
                                      <span className="hidden lg:inline">
                                        {allEnabled ? "Tout" : someEnabled ? "Compléter" : "Activer"}
                                      </span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p>
                                      {r.role === "ADMIN"
                                        ? "L'admin a toutes les permissions"
                                        : allEnabled
                                          ? "Désactiver toutes les permissions de ce module"
                                          : "Activer toutes les permissions de ce module"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Permission detail rows — all modules expanded */}
                {filteredModules.map((mod) =>
                  mod.permissions.map((perm) => (
                    <tr
                      key={perm.id}
                      className="border-b hover:bg-muted/20 transition-colors duration-100"
                    >
                      <td className="p-3 pl-12">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2 cursor-default group">
                              <span className="text-sm group-hover:text-primary transition-colors duration-150">
                                {perm.label}
                              </span>
                              <Info className="h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors duration-150" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs">
                            <p className="font-medium">{perm.id}</p>
                            <p className="text-primary-foreground/80 mt-0.5">{perm.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                      {roles.map((r) => {
                        const enabled = hasPermission(r.role, perm.id);
                        return (
                          <td key={r.role} className="text-center p-3">
                            <div className="flex justify-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Switch
                                      checked={enabled}
                                      onCheckedChange={() => togglePermission(r.role, perm.id)}
                                      disabled={r.role === "ADMIN"}
                                      className="cursor-pointer transition-all duration-150"
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  <p>
                                    {r.role === "ADMIN"
                                      ? "L'admin a toujours toutes les permissions"
                                      : enabled
                                        ? `Désactiver « ${perm.label} » pour ${ROLE_LABELS[r.role]}`
                                        : `Activer « ${perm.label} » pour ${ROLE_LABELS[r.role]}`}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom info */}
      <div className="text-center text-xs text-muted-foreground pb-2">
        <p>
          <Info className="inline h-3 w-3 mr-1" />
          Le rôle Administrateur possède automatiquement toutes les permissions.
          Les modifications prennent effet immédiatement après sauvegarde.
        </p>
      </div>
    </div>
  );
}
