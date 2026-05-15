"use client";

import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SettingsLogout() {
  const { logout, navigate } = useAppStore();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    navigate("landing");
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt sur l'Académie AMDRH !",
    });
  };

  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground flex items-center gap-2">
              <LogOut className="w-4 h-4 text-muted-foreground" />
              Déconnexion
            </p>
            <p className="text-xs text-muted-foreground pl-6">
              Vous serez déconnecté de votre compte et redirigé vers la page d'accueil.
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-lg text-sm flex-shrink-0 border-border hover:bg-muted/60"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
