"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-border/60 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Une erreur est survenue
        </h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          L'application a rencontré un problème inattendu.
          Veuillez réessayer ou retourner à l'accueil.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            variant="default"
            className="gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Réessayer
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Retour à l'accueil
          </Button>
        </div>
        {error.message && (
          <p className="mt-4 text-xs text-muted-foreground/60 font-mono bg-muted/50 rounded-lg p-3 break-all text-left">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
