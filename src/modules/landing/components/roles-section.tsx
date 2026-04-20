"use client";

import { CheckCircle2, ArrowRight, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app";

// ─── Data ────────────────────────────────────────────────────────────────────

const roles = [
  { title: "Arbitres", color: "bg-blue-500", items: ["Règles IHF", "Gestion du jeu", "Techniques", "Éthique"] },
  { title: "Entraîneurs", color: "bg-green-500", items: ["Méthodologie", "Préparation physique", "Tactique", "Psychologie"] },
  { title: "Joueurs", color: "bg-amber-500", items: ["Techniques", "Règles", "Prévention", "Jeu collectif"] },
  { title: "Administrateurs", color: "bg-purple-500", items: ["Gestion club", "Réglementation", "Communication", "Licences"] },
];

// ─── Roles Section ───────────────────────────────────────────────────────────

export function RolesSection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16"><h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Un parcours pour chaque profil</h2></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <div key={role.title} className="rounded-xl border border-border/60 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out">
              <div className={`w-3 h-3 rounded-full ${role.color} mb-4`} />
              <h3 className="font-bold text-foreground text-lg mb-4">{role.title}</h3>
              <ul className="space-y-2">
                {role.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ─────────────────────────────────────────────────────────────

export function CTASection() {
  const { navigate } = useAppStore();
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center bg-primary rounded-2xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden">
        <div className="absolute top-4 right-4 opacity-[0.08] pointer-events-none" aria-hidden="true"><Hand className="w-24 h-24 text-white" /></div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 relative">Prêt à commencer votre formation ?</h2>
        <p className="text-blue-100 mb-8 max-w-lg mx-auto relative">
          Rejoignez l&apos;Académie AMDRH et accédez à des formations de qualité reconnues par la Fédération.
        </p>
        <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-blue-50 rounded-lg px-8 h-12 font-semibold relative" onClick={() => navigate("register")}>
          Créer un compte gratuitement<ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </section>
  );
}
