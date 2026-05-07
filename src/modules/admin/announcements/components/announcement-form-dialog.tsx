"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ANNOUNCEMENT_TYPE_LABELS, ROLE_LABELS, ROLES } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";

const USER_ROLES = [ROLES.ARBITRE, ROLES.ENTRAINEUR, ROLES.JOUEUR, ROLES.FORMATEUR];
const ANNOUNCEMENT_TYPES = ["INFO", "URGENT", "EVENEMENT", "FORMATION", "RESULTAT"];

export interface AnnouncementFormData {
  id?: string;
  title: string;
  content: string;
  type: string;
  targetRoles: string[];
  isPinned: boolean;
  isPublished: boolean;
}

interface AnnouncementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: AnnouncementFormData | null;
  onSubmit: (data: AnnouncementFormData) => Promise<void>;
}

export function AnnouncementFormDialog({
  open,
  onOpenChange,
  announcement,
  onSubmit,
}: AnnouncementFormDialogProps) {
  const isEditing = !!announcement?.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("INFO");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
      setType(announcement.type);
      setTargetRoles(announcement.targetRoles);
      setIsPinned(announcement.isPinned);
      setIsPublished(announcement.isPublished);
    } else {
      setTitle("");
      setContent("");
      setType("INFO");
      setTargetRoles([]);
      setIsPinned(false);
      setIsPublished(true);
    }
  }, [announcement, open]);

  const handleToggleRole = (role: string) => {
    setTargetRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Champs requis",
        description: "Le titre et le contenu sont obligatoires.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        id: announcement?.id,
        title: title.trim(),
        content: content.trim(),
        type,
        targetRoles,
        isPinned,
        isPublished,
      });
      onOpenChange(false);
    } catch {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isEditing ? "Modifier l'annonce" : "Nouvelle annonce"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de l'annonce."
              : "Créez une nouvelle annonce pour informer les utilisateurs."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="ann-title" className="text-sm font-medium">
              Titre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ann-title"
              placeholder="Titre de l'annonce"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="ann-content" className="text-sm font-medium">
              Contenu <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="ann-content"
              placeholder="Contenu de l'annonce..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="text-sm resize-none"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANNOUNCEMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {ANNOUNCEMENT_TYPE_LABELS[t] || t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Roles */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Rôles cibles
              {targetRoles.length === 0 && (
                <span className="text-muted-foreground font-normal ml-1.5">
                  (tous les rôles)
                </span>
              )}
            </Label>
            <div className="grid grid-cols-2 gap-2.5">
              {USER_ROLES.map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/60 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={targetRoles.includes(role)}
                    onCheckedChange={() => handleToggleRole(role)}
                  />
                  <span className="text-sm">{ROLE_LABELS[role] || role}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Épingler</Label>
                <p className="text-xs text-muted-foreground">
                  L&apos;annonce sera affichée en priorité
                </p>
              </div>
              <Switch checked={isPinned} onCheckedChange={setIsPinned} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/60">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Publiée</Label>
                <p className="text-xs text-muted-foreground">
                  L&apos;annonce sera visible par les utilisateurs
                </p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="cursor-pointer"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting} className="cursor-pointer">
              {submitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {isEditing ? "Enregistrer" : "Créer l'annonce"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
