"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search, Send, Eye, Users, Star, Loader2, AlertTriangle, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  TYPE_COLORS, TYPE_ICON_MAP, NOTIFICATION_TYPES, ROLES_FOR_TARGET,
  NOTIFICATION_TYPE_LABELS, ROLE_LABELS, ROLE_COLORS,
  getBadgeBg,
} from "../types";
import type { TargetMode } from "../types";

// ─── Notification Create Form ───────────────────────────────────────────────

export function NotificationCreateForm({ onCreated }: { onCreated: () => void }) {
  const user = useAppStore((s) => s.user);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<string>("MESSAGE");
  const [targetMode, setTargetMode] = useState<TargetMode>("all");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<Array<Record<string, unknown>>>([]);
  const [selectedUser, setSelectedUser] = useState<Record<string, unknown> | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchingUser, setSearchingUser] = useState(false);
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null);

  useEffect(() => {
    if (targetMode === "user" && selectedUser) { setEstimatedCount(1); }
    else if (targetMode === "roles" && selectedRoles.length > 0) {
      fetch(`/api/users?role=${selectedRoles[0] || "ARBITRE"}&limit=1`).then((r) => r.json()).then((d) => setEstimatedCount(d.pagination?.total || 0)).catch(() => setEstimatedCount(null));
    } else if (targetMode === "all") {
      fetch(`/api/users?limit=1`).then((r) => r.json()).then((d) => setEstimatedCount(d.pagination?.total || 0)).catch(() => setEstimatedCount(null));
    } else { setEstimatedCount(null); }
  }, [targetMode, selectedRoles, selectedUser]);

  useEffect(() => {
    if (targetMode !== "user" || !userSearch || userSearch.length < 2) { setUserResults([]); return; }
    const timeout = setTimeout(async () => {
      setSearchingUser(true);
      try {
        const res = await fetch(`/api/users?${new URLSearchParams({ search: userSearch, limit: "10" })}`);
        const data = await res.json();
        setUserResults(data.users || []);
      } catch { setUserResults([]); } finally { setSearchingUser(false); }
    }, 300);
    return () => clearTimeout(timeout);
  }, [userSearch, targetMode]);

  const handleRoleToggle = (role: string) => setSelectedRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) { toast({ title: "Champs requis", description: "Le titre et le message sont obligatoires", variant: "destructive" }); return; }
    if (targetMode === "roles" && selectedRoles.length === 0) { toast({ title: "Rôle requis", description: "Sélectionnez au moins un rôle", variant: "destructive" }); return; }
    if (targetMode === "user" && !selectedUser) { toast({ title: "Utilisateur requis", description: "Sélectionnez un utilisateur", variant: "destructive" }); return; }
    if (!user) return;
    setSending(true);
    try {
      const body: Record<string, unknown> = { title, message, type };
      if (targetMode === "all") body.targetAll = true;
      if (targetMode === "roles") body.targetRoles = selectedRoles;
      if (targetMode === "user") body.userId = (selectedUser as Record<string, string>)?.id;
      const res = await fetch(`/api/admin/notifications?userId=${user.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { toast({ title: "Erreur", description: data.error || "Impossible d'envoyer la notification", variant: "destructive" }); return; }
      toast({ title: "Notification envoyée", description: data.message || `${data.count} notification(s) créée(s)` });
      setTitle(""); setMessage(""); setType("MESSAGE"); setTargetMode("all"); setSelectedRoles([]); setSelectedUser(null); setUserSearch(""); setShowPreview(false); onCreated();
    } catch { toast({ title: "Erreur serveur", description: "Veuillez réessayer", variant: "destructive" }); } finally { setSending(false); }
  };

  const getTargetLabel = () => {
    if (targetMode === "all") return "Tous les utilisateurs";
    if (targetMode === "roles") return selectedRoles.length > 0 ? selectedRoles.map((r) => ROLE_LABELS[r] || r).join(", ") : "Aucun rôle sélectionné";
    if (targetMode === "user" && selectedUser) return `${selectedUser.prenom} ${selectedUser.nom}`;
    return "Aucun utilisateur sélectionné";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create Form Card */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base"><Send className="w-4 h-4 text-primary" />Créer une notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label className="text-xs font-medium">Titre *</Label>
            <Input className="h-10 rounded-lg" placeholder="Titre de la notification" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5"><Label className="text-xs font-medium">Message *</Label>
            <Textarea className="rounded-lg min-h-[100px] resize-none" placeholder="Contenu de la notification..." value={message} onChange={(e) => setMessage(e.target.value)} />
            <p className="text-[10px] text-muted-foreground text-right">{message.length} caractères</p>
          </div>
          <div className="space-y-1.5"><Label className="text-xs font-medium">Type</Label>
            <div className="flex gap-2 flex-wrap">
              {NOTIFICATION_TYPES.map((t) => { const Icon = TYPE_ICON_MAP[t] || Bell; return (
                <button key={t} onClick={() => setType(t)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  type === t ? cn("border-transparent text-white shadow-sm", TYPE_COLORS[t]) : "bg-card text-muted-foreground border-border/60 hover:border-border")}
                  style={type === t ? { backgroundColor: getBadgeBg(t), color: "#ffffff" } : undefined}>
                  <Icon className="w-3.5 h-3.5" />{NOTIFICATION_TYPE_LABELS[t]}
                </button>);
              })}
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs font-medium">Audience cible</Label>
            <div className="flex gap-1.5">
              {([
                { mode: "all" as const, label: "Tous les utilisateurs", icon: Users },
                { mode: "roles" as const, label: "Par rôle", icon: Star },
                { mode: "user" as const, label: "Utilisateur spécifique", icon: Bell },
              ]).map((opt) => (
                <button key={opt.mode} onClick={() => { setTargetMode(opt.mode); setSelectedUser(null); setUserSearch(""); setUserResults([]); }}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                    targetMode === opt.mode ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border/60 hover:border-border")}>
                  <opt.icon className="w-3.5 h-3.5" /><span className="hidden sm:inline">{opt.label}</span>
                </button>
              ))}
            </div>
            {targetMode === "all" && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/40">
                <Users className="w-4 h-4 text-primary" /><div>
                  <p className="text-xs font-medium text-foreground">Tous les utilisateurs actifs</p>
                  <p className="text-[10px] text-muted-foreground">{estimatedCount !== null ? `${estimatedCount} utilisateur(s) recevront cette notification` : "Calcul..."}</p>
                </div>
              </div>
            )}
            {targetMode === "roles" && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ROLES_FOR_TARGET.map((role) => (
                    <label key={role} className={cn("flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all",
                      selectedRoles.includes(role) ? "bg-primary/5 border-primary/30" : "bg-card border-border/40 hover:border-border/80")}>
                      <Checkbox checked={selectedRoles.includes(role)} onCheckedChange={() => handleRoleToggle(role)} className="rounded" />
                      <div className="flex-1 min-w-0"><p className="text-xs font-medium">{ROLE_LABELS[role]}</p></div>
                      <Badge variant="secondary" className={cn("text-[9px]", ROLE_COLORS[role])}>{ROLE_LABELS[role]}</Badge>
                    </label>
                  ))}
                </div>
                {selectedRoles.length > 0 && <p className="text-[10px] text-muted-foreground pl-1">{selectedRoles.length} rôle(s) sélectionné(s)</p>}
              </div>
            )}
            {targetMode === "user" && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9 h-9 rounded-lg text-sm" placeholder="Rechercher par nom ou email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
                  {searchingUser && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
                {selectedUser && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                    <Avatar className="w-6 h-6"><AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                      {(selectedUser.prenom as string)?.charAt(0)}{(selectedUser.nom as string)?.charAt(0)}
                    </AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0"><p className="text-xs font-medium text-foreground truncate">{String(selectedUser.prenom)} {String(selectedUser.nom)}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{String(selectedUser.email)}</p></div>
                    <button onClick={() => setSelectedUser(null)} className="p-1 rounded hover:bg-muted transition-colors"><X className="w-3 h-3 text-muted-foreground" /></button>
                  </div>
                )}
                {!selectedUser && userResults.length > 0 && (
                  <div className="border border-border/60 rounded-lg overflow-hidden shadow-sm max-h-48 overflow-y-auto">
                    {userResults.map((u) => (
                      <button key={u.id as string} onClick={() => { setSelectedUser(u); setUserResults([]); setUserSearch(""); }}
                        className="w-full flex items-center gap-2.5 p-2.5 hover:bg-muted/50 transition-colors text-left">
                        <Avatar className="w-6 h-6"><AvatarFallback className="text-[9px]">{(u.prenom as string)?.charAt(0)}{(u.nom as string)?.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0"><p className="text-xs font-medium text-foreground truncate">{String(u.prenom)} {String(u.nom)}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{u.email as string}</p></div>
                        <Badge variant="secondary" className={cn("text-[9px] flex-shrink-0", ROLE_COLORS[(u.role as string) || "ARBITRE"])}>{ROLE_LABELS[(u.role as string) || "ARBITRE"]}</Badge>
                      </button>
                    ))}
                  </div>
                )}
                {userSearch.length >= 2 && !searchingUser && userResults.length === 0 && !selectedUser && <p className="text-[10px] text-muted-foreground pl-1">Aucun résultat trouvé</p>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => setShowPreview(!showPreview)} disabled={!title.trim() || !message.trim()}>
              <Eye className="w-3.5 h-3.5 mr-1.5" />Aperçu
            </Button>
            <div className="flex-1" />
            <Button size="sm" className="rounded-lg text-xs bg-primary hover:bg-primary/90" onClick={handleSend} disabled={sending || !title.trim() || !message.trim()}>
              {sending ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}Envoyer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base"><Eye className="w-4 h-4 text-primary" />Aperçu</CardTitle>
        </CardHeader>
        <CardContent>
          {showPreview ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-border/60 bg-card">
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", TYPE_COLORS[type] || "bg-muted text-muted-foreground")}>
                    {(() => { const Icon = TYPE_ICON_MAP[type] || Bell; return <Icon className="w-5 h-5" />; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{title || "Titre..."}</p>
                      <Badge variant="secondary" className={cn("text-[10px]", TYPE_COLORS[type])}>{NOTIFICATION_TYPE_LABELS[type] || type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{message || "Message..."}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">{new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Détails de l&apos;envoi</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Type</p><p className="text-xs font-medium mt-0.5">{NOTIFICATION_TYPE_LABELS[type]}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Audience</p><p className="text-xs font-medium mt-0.5 truncate">{getTargetLabel()}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Destinataires</p><p className="text-xs font-medium mt-0.5">{estimatedCount !== null ? `${estimatedCount} utilisateur(s)` : "—"}</p></div>
                  <div className="p-3 rounded-lg bg-muted/50"><p className="text-[10px] text-muted-foreground">Mode</p><p className="text-xs font-medium mt-0.5">{targetMode === "all" ? "Diffusion générale" : targetMode === "roles" ? "Par rôle(s)" : "Utilisateur unique"}</p></div>
                </div>
              </div>
              {estimatedCount !== null && estimatedCount > 10 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200/60">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700">Cette notification sera envoyée à <strong>{estimatedCount} utilisateurs</strong>.
                    {estimatedCount > 50 && " Assurez-vous que le message est pertinent pour tous les destinataires."}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Remplissez le formulaire et cliquez sur &quot;Aperçu&quot; pour voir un aperçu de la notification</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
