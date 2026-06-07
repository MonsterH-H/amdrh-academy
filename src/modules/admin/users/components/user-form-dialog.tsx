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
import { UserCog, Plus, Loader2, UserPlus, Eye, EyeOff, Copy, Check, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ROLE_LABELS, REGIONS_MAROC } from "@/lib/constants";

interface Credentials {
  email: string;
  password: string;
  role: string;
  roleLabel: string;
  loginUrl: string;
  summaryMessage: string;
}

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}

export function CreateUserDialog({ open, onOpenChange, onCreated }: CreateUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", password: "", role: "ARBITRE",
    telephone: "", club: "", region: "", licenceNumber: "",
  });

  const resetForm = () => {
    setForm({ prenom: "", nom: "", email: "", password: "", role: "ARBITRE", telephone: "", club: "", region: "", licenceNumber: "" });
    setError("");
    setCredentials(null);
    setShowPassword(false);
    setCopied(false);
  };

  const handleDialogChange = (v: boolean) => {
    if (!v) resetForm();
    onOpenChange(v);
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.prenom || !form.nom || !form.email || !form.role) {
      setError("Prénom, nom, email et rôle sont requis");
      return;
    }
    if (form.password && form.password.length < 8) {
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
      const data = await res.json();
      if (data.credentials) {
        setCredentials(data.credentials);
      } else {
        toast({ title: "Utilisateur créé avec succès", description: `${form.prenom} ${form.nom} a été ajouté.` });
        resetForm();
        onOpenChange(false);
      }
      onCreated();
    } catch {
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!credentials) return;
    try {
      await navigator.clipboard.writeText(credentials.summaryMessage);
      setCopied(true);
      toast({ title: "Copié !", description: "Le message a été copié dans le presse-papiers." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Erreur", description: "Impossible de copier le texte.", variant: "destructive" });
    }
  };

  const handleCredentialsClose = () => {
    setCredentials(null);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 rounded-lg text-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Nouvel utilisateur
        </Button>
      </DialogTrigger>

      {/* Credentials Dialog */}
      {credentials && (
        <DialogContent className="max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-green-600" />
              Compte créé avec succès
            </DialogTitle>
            <DialogDescription>
              Voici les informations de connexion de l&apos;utilisateur.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Info banner */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800">
                Envoyez ces informations à l&apos;utilisateur par <strong>email</strong> ou <strong>WhatsApp</strong>.
              </p>
            </div>

            {/* Credentials fields */}
            <div className="space-y-3 bg-muted/50 rounded-lg p-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                <div className="bg-background rounded-lg border px-3 py-2 text-sm font-mono">{credentials.email}</div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Mot de passe</Label>
                <div className="flex items-center gap-1 bg-background rounded-lg border">
                  <code className="flex-1 px-3 py-2 text-sm font-mono overflow-x-auto">
                    {showPassword ? credentials.password : "••••••••••••"}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Rôle</Label>
                  <div className="bg-background rounded-lg border px-3 py-2 text-sm">{credentials.roleLabel}</div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Lien de connexion</Label>
                  <div className="bg-background rounded-lg border px-3 py-2 text-sm text-primary truncate" title={credentials.loginUrl}>
                    Connexion →
                  </div>
                </div>
              </div>
            </div>

            {/* Summary message */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Message à envoyer</Label>
              <div className="bg-background rounded-lg border p-3 text-sm whitespace-pre-line font-mono text-xs max-h-48 overflow-y-auto leading-relaxed">
                {credentials.summaryMessage}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={handleCredentialsClose} className="rounded-lg">
              Fermer
            </Button>
            <Button onClick={handleCopy} className="rounded-lg gap-2">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copié" : "Copier le message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}

      {/* Create User Form */}
      {!credentials && (
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
              <Label className="text-xs font-medium">Mot de passe</Label>
              <Input type="password" className="h-10 rounded-lg" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Laisser vide pour générer automatiquement" />
              <p className="text-[10px] text-muted-foreground">Min. 8 caractères. Si vide, un mot de passe sécurisé sera généré.</p>
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
      )}
    </Dialog>
  );
}
