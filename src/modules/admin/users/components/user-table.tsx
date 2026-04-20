"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Users, ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle,
} from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface UserTableProps {
  users: Array<Record<string, unknown>>;
  loading: boolean;
  total: number;
  page: number;
  totalPages: number;
  roleFilter: string;
  search: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: () => void;
  onRoleFilterChange: (v: string) => void;
  onPageChange: (p: number) => void;
  onToggleActive: (u: Record<string, unknown>) => void;
  onChangeRole: (u: Record<string, unknown>, role: string) => void;
  onViewUser: (id: string) => void;
  createButton: React.ReactNode;
}

const ROLE_FILTERS = [
  { value: "ALL", label: "Tous" },
  { value: "ADMIN", label: "Admins" },
  { value: "FORMATEUR", label: "Formateurs" },
  { value: "ARBITRE", label: "Arbitres" },
  { value: "ENTRAINEUR", label: "Entraîneurs" },
  { value: "JOUEUR", label: "Joueurs" },
];

export function UserTable({
  users,
  loading,
  total,
  page,
  totalPages,
  roleFilter,
  search,
  onSearchChange,
  onSearchSubmit,
  onRoleFilterChange,
  onPageChange,
  onToggleActive,
  onChangeRole,
  onViewUser,
  createButton,
}: UserTableProps) {
  const [localSearch, setLocalSearch] = useState(search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  const handleSearchChange = (v: string) => {
    setLocalSearch(v);
    onSearchChange(v);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des utilisateurs</h2>
          <p className="text-muted-foreground mt-1">{total} utilisateurs inscrits</p>
        </div>
        {createButton}
      </div>

      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher par nom, email, licence..." value={localSearch} onChange={(e) => handleSearchChange(e.target.value)} className="pl-9 rounded-lg" />
      </form>

      <div className="flex gap-1.5 flex-wrap">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { onRoleFilterChange(f.value); onPageChange(1); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
              roleFilter === f.value
                ? "bg-primary text-white border-primary"
                : "bg-white text-muted-foreground border-border/60 hover:border-border"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {users.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Aucun utilisateur trouvé</h3>
          <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres de recherche</p>
        </div>
      ) : (
        <>
          <Card className="border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 text-xs text-muted-foreground">
                    <th className="text-left py-3 px-4 font-medium">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Rôle</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Club</th>
                    <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Statut</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id as string} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className={cn("text-[10px] font-bold", !u.isActive && "opacity-50")}>
                              {(u.prenom as string)?.charAt(0)}{(u.nom as string)?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className={cn("text-sm font-medium text-foreground", !u.isActive && "text-muted-foreground line-through")}>
                              {u.prenom as string} {u.nom as string}
                            </p>
                            <p className="text-[10px] text-muted-foreground sm:hidden">{u.email as string}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell">{u.email as string}</td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="cursor-pointer">
                              <Badge variant="secondary" className={cn("text-[10px]", ROLE_COLORS[(u.role as string) || "ARBITRE"])}>
                                {ROLE_LABELS[(u.role as string) || "ARBITRE"]}
                              </Badge>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>Changer le rôle</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {Object.entries(ROLE_LABELS).map(([key, label]) => (
                              <DropdownMenuItem key={key} onClick={() => onChangeRole(u, key)} className={cn(key === u.role && "bg-muted")}>
                                <span className={cn("w-2 h-2 rounded-full mr-2", key === u.role ? "bg-primary" : "bg-transparent border border-border")} />
                                {label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">{u.club as string || "—"}</td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <button onClick={() => onToggleActive(u)} className="cursor-pointer">
                          <Badge variant={u.isActive ? "default" : "secondary"} className={cn("text-[10px] transition-all", u.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-50 text-red-600 hover:bg-red-100")}>
                            {u.isActive ? "Actif" : "Inactif"}
                          </Badge>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 rounded-lg" onClick={() => onViewUser(u.id as string)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn("h-8 rounded-lg", !u.isActive ? "text-green-600 hover:bg-green-50" : "text-red-600 hover:bg-red-50")}
                            onClick={() => onToggleActive(u)}
                          >
                            {u.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
