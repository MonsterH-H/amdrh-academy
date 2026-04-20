"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Gift, Loader2, Pencil, Plus, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BADGE_LEVEL_LABELS, BADGE_LEVEL_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { BadgeItem } from "../types";

// ─── Create Badge Dialog ────────────────────────────────────────────

export function CreateBadgeDialog({ open, onOpenChange, onCreated }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", level: "BRONZE", icon: "🏆", criteria: "" });
  const levelOptions = Object.entries(BADGE_LEVEL_LABELS);

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.description || !form.level) { setError("Nom, description et niveau sont requis"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/badges", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Erreur lors de la création"); return; }
      toast({ title: "Badge créé", description: `"${form.name}" a été créé avec succès.` });
      onOpenChange(false); setForm({ name: "", description: "", level: "BRONZE", icon: "🏆", criteria: "" }); onCreated();
    } catch { setError("Erreur serveur"); } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Star className="w-5 h-5 text-primary" /> Créer un badge</DialogTitle>
          <DialogDescription>Définissez un nouveau badge pour récompenser les utilisateurs.</DialogDescription>
        </DialogHeader>
        {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">{error}</div>}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Nom *</Label>
            <Input className="h-10 rounded-lg" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Expert en arbitrage" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description *</Label>
            <Textarea className="rounded-lg" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description du badge..." rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Niveau *</Label>
              <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {levelOptions.map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      <span className="flex items-center gap-2"><span className={cn("w-3 h-3 rounded-full", BADGE_LEVEL_COLORS[k])} />{v}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Icône (emoji)</Label>
              <Input className="h-10 rounded-lg text-center text-xl" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} maxLength={2} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Critères d&apos;obtention</Label>
            <Textarea className="rounded-lg" value={form.criteria} onChange={(e) => setForm({ ...form, criteria: e.target.value })} placeholder="Décrivez les conditions pour obtenir ce badge..." rows={2} />
          </div>
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} Créer le badge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Badge Dialog ──────────────────────────────────────────────

export function EditBadgeDialog({ open, onOpenChange, badge, onUpdated }: {
  open: boolean; onOpenChange: (v: boolean) => void; badge: BadgeItem; onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: badge.name, description: badge.description, level: badge.level, icon: badge.icon, criteria: badge.criteria,
  });
  const levelOptions = Object.entries(BADGE_LEVEL_LABELS);

  useEffect(() => {
    setForm({ name: badge.name, description: badge.description, level: badge.level, icon: badge.icon, criteria: badge.criteria });
  }, [badge]);

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.description) { setError("Nom et description sont requis"); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/badges/${badge.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Erreur lors de la modification"); return; }
      toast({ title: "Badge modifié", description: `"${form.name}" a été modifié.` });
      onOpenChange(false); onUpdated();
    } catch { setError("Erreur serveur"); } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Pencil className="w-5 h-5 text-primary" /> Modifier le badge</DialogTitle>
          <DialogDescription>Modifiez les informations du badge.</DialogDescription>
        </DialogHeader>
        {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">{error}</div>}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Nom *</Label>
            <Input className="h-10 rounded-lg" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Description *</Label>
            <Textarea className="rounded-lg" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Niveau</Label>
              <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {levelOptions.map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      <span className="flex items-center gap-2"><span className={cn("w-3 h-3 rounded-full", BADGE_LEVEL_COLORS[k])} />{v}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Icône</Label>
              <Input className="h-10 rounded-lg text-center text-xl" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} maxLength={2} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Critères</Label>
            <Textarea className="rounded-lg" value={form.criteria} onChange={(e) => setForm({ ...form, criteria: e.target.value })} rows={2} />
          </div>
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Award Badge Dialog ─────────────────────────────────────────────

export function AwardBadgeDialog({ open, onOpenChange, badges }: {
  open: boolean; onOpenChange: (v: boolean) => void; badges: BadgeItem[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<Array<{ id: string; nom: string; prenom: string; email: string }>>([]);
  const [form, setForm] = useState({ badgeId: "", userId: "" });

  useEffect(() => {
    if (open) {
      fetch("/api/users?limit=200").then((r) => r.json()).then((d) => setUsers(d.users || [])).catch(() => {});
      setForm({ badgeId: "", userId: "" });
    }
  }, [open]);

  const handleSubmit = async () => {
    setError("");
    if (!form.badgeId || !form.userId) { setError("Badge et utilisateur sont requis"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/badges/award", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Erreur lors de l'attribution"); return; }
      toast({ title: "Badge attribué", description: "Le badge a été attribué avec succès." });
      onOpenChange(false);
    } catch { setError("Erreur serveur"); } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Gift className="w-5 h-5 text-primary" /> Attribuer un badge</DialogTitle>
          <DialogDescription>Attribuez un badge à un utilisateur.</DialogDescription>
        </DialogHeader>
        {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">{error}</div>}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Badge *</Label>
            <Select value={form.badgeId} onValueChange={(v) => setForm({ ...form, badgeId: v })}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Sélectionner un badge" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {badges.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    <span className="flex items-center gap-2"><span>{b.icon}</span>{b.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Utilisateur *</Label>
            <Select value={form.userId} onValueChange={(v) => setForm({ ...form, userId: v })}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Sélectionner un utilisateur" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.prenom} {u.nom} ({u.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Gift className="w-4 h-4 mr-2" />} Attribuer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
