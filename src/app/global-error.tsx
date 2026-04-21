"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="antialiased bg-[#FAFAFA]">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Erreur critique
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Une erreur inattendue est survenue dans l'application.
            </p>
            <Button
              onClick={reset}
              variant="default"
              className="gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Recharger la page
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
