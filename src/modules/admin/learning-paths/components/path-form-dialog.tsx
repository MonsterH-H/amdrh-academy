"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS } from "@/lib/constants";
import type { PathFormCourse } from "../types";

// ──────────────────────────────────────────────
// Path Form Dialog Props
// ──────────────────────────────────────────────

export interface PathFormState {
  title: string;
  description: string;
  targetRole: string;
  mode: string;
  isMandatory: boolean;
}

interface PathFormDialogProps {
  form: PathFormState;
  setForm: React.Dispatch<React.SetStateAction<PathFormState>>;
  editingId: string | null;
  formError: string;
}

// ──────────────────────────────────────────────
// Path Form Dialog
// ──────────────────────────────────────────────

export function PathFormFields({
  form,
  setForm,
  editingId,
  formError,
}: PathFormDialogProps) {
  return (
    <>
      {formError && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">
          {formError}
        </div>
      )}

      <div className="space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Titre *</Label>
          <Input
            className="h-10 rounded-lg"
            placeholder="Ex: Formation initiale Arbitre Niveau 1"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Description *</Label>
          <Textarea
            className="rounded-lg min-h-[80px]"
            placeholder="Décrivez l'objectif et le contenu du parcours..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Two columns: Target Role + Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Rôle cible *</Label>
            <Select value={form.targetRole} onValueChange={(v) => setForm({ ...form, targetRole: v })}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Mode</Label>
            <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
              <SelectTrigger className="h-10 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sequentiel">Séquentiel</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
                <SelectItem value="hybride">Hybride</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mandatory toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border/60">
          <div>
            <p className="text-sm font-medium text-foreground">Parcours obligatoire</p>
            <p className="text-[11px] text-muted-foreground">
              Les utilisateurs du rôle cible devront suivre ce parcours
            </p>
          </div>
          <Switch
            checked={form.isMandatory}
            onCheckedChange={(v) => setForm({ ...form, isMandatory: v })}
          />
        </div>

        <Separator />
      </div>
    </>
  );
}
