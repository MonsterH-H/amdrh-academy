"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Circle,
  MessageSquare,
  Calendar,
  ExternalLink,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/constants";
import { formatDateLong } from "@/utils/format";

interface ConversationInfoPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: Record<string, unknown> | null;
  isOnline: boolean;
  conversationDate?: string;
  onViewProfile?: () => void;
}

export function ConversationInfoPanel({
  open,
  onOpenChange,
  participant,
  isOnline,
  conversationDate,
  onViewProfile,
}: ConversationInfoPanelProps) {
  if (!participant) return null;

  const firstName = (participant.prenom as string) || "";
  const lastName = (participant.nom as string) || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const role = (participant.role as string) || "ARBITRE";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-sm">
        <SheetHeader className="pt-6">
          <SheetTitle className="text-center">Informations</SheetTitle>
        </SheetHeader>

        <div className="px-6 py-6 space-y-6">
          {/* Avatar & Name */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-primary/15 text-primary text-xl font-bold">
                  {firstName.charAt(0)}
                  {lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background",
                  isOnline ? "bg-emerald-500" : "bg-muted-foreground",
                )}
              />
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-foreground text-lg">
                {fullName}
              </h3>
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] mt-1",
                  ROLE_COLORS[role] || "bg-muted text-muted-foreground",
                )}
              >
                {ROLE_LABELS[role] || role}
              </Badge>
            </div>

            {/* Online status */}
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                isOnline
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Circle
                className={cn(
                  "w-2 h-2 fill-current",
                  isOnline && "animate-pulse",
                )}
              />
              {isOnline ? "En ligne" : "Hors ligne"}
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Rôle</p>
                <p className="text-sm font-medium text-foreground">
                  {ROLE_LABELS[role] || role}
                </p>
              </div>
            </div>

            {!!participant.club && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Club</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {participant.club as string}
                  </p>
                </div>
              </div>
            )}

            {!!participant.email && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {participant.email as string}
                  </p>
                </div>
              </div>
            )}

            {conversationDate && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    Début de la conversation
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDateLong(conversationDate)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-border/40" />

          {/* Actions */}
          <div className="space-y-2">
            {onViewProfile && (
              <Button
                variant="outline"
                className="w-full rounded-lg text-sm"
                onClick={onViewProfile}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir le profil
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
