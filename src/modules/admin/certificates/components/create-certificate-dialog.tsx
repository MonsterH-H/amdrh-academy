"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Award, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// ─── Create Certificate Dialog ──────────────────────────────────────

interface CreateCertificateDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}

export function CreateCertificateDialog({ open, onOpenChange, onCreated }: CreateCertificateDialogProps) {
  const { user } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<Array<{ id: string; nom: string; prenom: string; email: string }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [form, setForm] = useState({
    userId: "", courseId: "", type: "CERTIFICAT", score: "", maxScore: "100", expiryDate: "",
  });

  useEffect(() => {
    if (open) {
      Promise.all([
        fetch("/api/users?limit=200").then((r) => r.json()).then((d) => setUsers(d.users || [])).catch(() => {}),
        fetch("/api/courses?limit=200").then((r) => r.json()).then((d) => setCourses(d.courses || [])).catch(() => {}),
      ]);
      setForm({ userId: "", courseId: "", type: "CERTIFICAT", score: "", maxScore: "100", expiryDate: "" });
    }
  }, [open]);

  const handleSubmit = async () => {
    setError("");
    if (!form.userId || !form.courseId || !form.score || !form.maxScore) {
      setError("Utilisateur, cours, score et score maximum sont requis");
      return;
    }
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (user) { p.set("userId", user.id); p.set("role", user.role); }
      const res = await fetch(`/api/admin/certificates?${p}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: form.userId, courseId: form.courseId, type: form.type,
          score: parseInt(form.score), maxScore: parseInt(form.maxScore),
          expiryDate: form.expiryDate || null,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Erreur lors de la création"); return; }
      const data = await res.json();
      toast({ title: "Certificat créé", description: `Certificat ${data.certificate.code} a été délivré avec succès.` });
      onOpenChange(false); onCreated();
    } catch { setError("Erreur serveur"); } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Créer un certificat
          </DialogTitle>
          <DialogDescription>Délivrez manuellement un certificat à un utilisateur.</DialogDescription>
        </DialogHeader>

        {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">{error}</div>}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Type de certificat</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ATTESTATION">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />Attestation de réussite</span>
                </SelectItem>
                <SelectItem value="CERTIFICAT_COMPLETION">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" />Certificat de complétion</span>
                </SelectItem>
                <SelectItem value="DIPLOME">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" />Diplôme</span>
                </SelectItem>
                <SelectItem value="CERTIFICAT">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" />Certificat</span>
                </SelectItem>
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
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Cours *</Label>
            <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue placeholder="Sélectionner un cours" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Score *</Label>
              <Input type="number" className="h-10 rounded-lg" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} placeholder="85" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Score maximum *</Label>
              <Input type="number" className="h-10 rounded-lg" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} placeholder="100" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Date d&apos;expiration (optionnel)</Label>
            <Input type="date" className="h-10 rounded-lg" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-lg">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Award className="w-4 h-4 mr-2" />}
            Délivrer le certificat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
