"use client";

export interface PermissionModule {
  id: string;
  label: string;
  icon: string;
  permissions: PermissionItem[];
  expanded?: boolean;
}

export interface PermissionItem {
  id: string;
  label: string;
  description: string;
}

export interface RolePermissions {
  role: string;
  roleLabel: string;
  permissions: string[];
}

export interface PermissionsMatrix {
  modules: PermissionModule[];
  roles: RolePermissions[];
}
