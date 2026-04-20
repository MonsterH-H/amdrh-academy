"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { UserCog, Plus, Loader2, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ROLE_LABELS, REGIONS_MAROC } from "@/lib/constants";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}

export function CreateUserDialog({ open, onOpenChange, onCreated }: CreateUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", password: "", role: "ARBITRE",
    telephone: "", club: "", region: "", licenceNumber: "",
  });

  const handleSubmit = async () => {
    setError("");
    if (!form.prenom || !form.nom || !form.email || !form.password) {
      setError("Prénom, nom, email et mot de passe sont requis");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          emailVerified: true,
          isActive: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erreur lors de la création");
        return;
      }
      toast({ title: "Utilisateur créé avec succès", description: `${form.prenom} ${form.nom} a été ajouté.` });
      onOpenChange(false);
      setForm({ prenom: "", nom: "", email: "", password: "", role: "ARBITRE", telephone: "", club: "", region: "", licenceNumber: "" });
      onCreated();
    } catch {
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 rounded-lg text-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Nouvel utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-primary" />
            Créer un utilisateur
          </DialogTitle>
          <DialogDescription>Remplissez les informations pour créer un nouveau compte.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">{error}</div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Prénom *</Label>
              <Input className="h-10 rounded-lg" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Nom *</Label>
              <Input className="h-10 rounded-lg" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Email *</Label>
            <Input type="email" className="h-10 rounded-lg" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Mot de passe *</Label>
            <Input type="password" className="h-10 rounded-lg" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 caractères" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Rôle *</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Téléphone</Label>
              <Input className="h-10 rounded-lg" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="+212 6XX-XXXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">N° Licence</Label>
              <Input className="h-10 rounded-lg" value={form.licenceNumber} onChange={(e) => setForm({ ...form, licenceNumber: e.target.value })} placeholder="XXX-2024-XXX" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Club</Label>
              <Input className="h-10 rounded-lg" value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Région</Label>
              <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {REGIONS_MAROC.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
            Créer l&apos;utilisateur
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
