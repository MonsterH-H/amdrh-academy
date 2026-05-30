"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Award, ClipboardCheck, Loader2, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ─── Bulk Issue Dialog ──────────────────────────────────────────────

interface BulkIssueDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onIssued: () => void;
}

export function BulkIssueDialog({ open, onOpenChange, onIssued }: BulkIssueDialogProps) {
  const { user } = useAppStore();
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [eligibleUsers, setEligibleUsers] = useState<Array<{
    id: string; prenom: string; nom: string; email: string; checked: boolean;
  }>>([]);
  const [certType, setCertType] = useState("CERTIFICAT");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/api/courses?limit=200")
        .then((r) => r.json())
        .then((d) => setCourses(d.courses || []))
        .catch(() => {});
      setSelectedCourse("");
      setEligibleUsers([]);
      setCertType("CERTIFICAT");
      setError("");
    }
  }, [open]);

  const handleCourseSelect = async (courseId: string) => {
    setSelectedCourse(courseId);
    setLoading(true);
    setError("");
    try {
      const p = new URLSearchParams();
      if (user) { p.set("userId", user.id); p.set("role", user.role); }
      const res = await fetch(`/api/admin/traceability?courseId=${courseId}&status=termine&limit=100&${p}`);
      const data = await res.json();
      const enrollments = data.enrollments || [];
      // Filter eligible: completed + passed quiz + no existing certificate
      const eligible = enrollments.filter(
        (e: Record<string, unknown>) => !e.certificateId && e.quizStatus === "REUSSI"
      );
      const users = (eligible.length > 0
        ? eligible
        : enrollments.filter((e: Record<string, unknown>) => !e.certificateId)
      ).map((e: Record<string, unknown>) => ({
        id: e.userId as string,
        prenom: (e.userName as string)?.split(" ")[0] || "",
        nom: (e.userName as string)?.split(" ").slice(1).join(" ") || "",
        email: e.userEmail as string,
        checked: true,
      }));
      setEligibleUsers(users);
    } catch {
      setError("Impossible de charger les utilisateurs éligibles");
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    setEligibleUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, checked: !u.checked } : u)));
  };

  const toggleAll = () => {
    const allChecked = eligibleUsers.every((u) => u.checked);
    setEligibleUsers((prev) => prev.map((u) => ({ ...u, checked: !allChecked })));
  };

  const handleBulkIssue = async () => {
    const selected = eligibleUsers.filter((u) => u.checked);
    if (selected.length === 0) { setError("Sélectionnez au moins un utilisateur"); return; }
    setSubmitting(true); setError("");
    try {
      const p = new URLSearchParams();
      if (user) { p.set("userId", user.id); p.set("role", user.role); }
      const res = await fetch(`/api/admin/certificates/bulk-issue?${p}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourse, userIds: selected.map((u) => u.id), type: certType }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Erreur lors de la délivrance"); return; }
      const data = await res.json();
      toast({
        title: "Certificats délivrés",
        description: `${data.summary.succeeded} certificat(s) créé(s), ${data.summary.failed} échoué(s).`,
      });
      onOpenChange(false); onIssued();
    } catch { setError("Erreur serveur"); } finally { setSubmitting(false); }
  };

  const selectedCount = eligibleUsers.filter((u) => u.checked).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Délivrer en masse
          </DialogTitle>
          <DialogDescription>Sélectionnez un cours et les utilisateurs éligibles</DialogDescription>
        </DialogHeader>

        {error && <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">{error}</div>}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Cours *</Label>
            <Select value={selectedCourse} onValueChange={handleCourseSelect}>
              <SelectTrigger className="h-10 rounded-lg">
                <SelectValue placeholder="Sélectionner un cours" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground ml-2">Chargement...</span>
            </div>
          ) : eligibleUsers.length > 0 ? (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Type de certificat</Label>
                <Select value={certType} onValueChange={setCertType}>
                  <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATTESTATION">
                      <span className="flex items-center gap-2"><span className={cn("w-2.5 h-2.5 rounded-full bg-blue-400")} />Attestation de réussite</span>
                    </SelectItem>
                    <SelectItem value="CERTIFICAT_COMPLETION">
                      <span className="flex items-center gap-2"><span className={cn("w-2.5 h-2.5 rounded-full bg-blue-400")} />Certificat de complétion</span>
                    </SelectItem>
                    <SelectItem value="DIPLOME">
                      <span className="flex items-center gap-2"><span className={cn("w-2.5 h-2.5 rounded-full bg-amber-400")} />Diplôme</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Utilisateurs éligibles ({eligibleUsers.length})</Label>
                <Button variant="ghost" size="sm" onClick={toggleAll} className="h-7 text-[10px] rounded-md">
                  {eligibleUsers.every((u) => u.checked) ? "Tout décocher" : "Tout cocher"}
                </Button>
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto border border-border/40 rounded-lg p-2">
                {eligibleUsers.map((u) => (
                  <label key={u.id} className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                    <Checkbox checked={u.checked} onCheckedChange={() => toggleUser(u.id)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{u.prenom} {u.nom}</p>
                      <p className="text-[10px] text-muted-foreground">{u.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            </>
          ) : selectedCourse ? (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aucun utilisateur éligible pour ce cours</p>
              <p className="text-[10px] text-muted-foreground mt-1">Les utilisateurs doivent avoir complété le cours et réussi le quiz</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Sélectionnez un cours pour voir les utilisateurs éligibles</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Annuler</Button>
          <Button onClick={handleBulkIssue} disabled={submitting || eligibleUsers.length === 0 || selectedCount === 0} className="rounded-lg">
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Award className="w-4 h-4 mr-2" />}
            Délivrer ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
