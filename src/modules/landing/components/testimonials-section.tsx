"use client";

import { cn } from "@/lib/utils";
import { Star, Landmark, Globe, Lock } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const testimonials = [
  { name: "Youssef Benali", role: "Arbitre National", content: "La formation m'a permis de passer le niveau national en un temps record. Les quiz sont très pertinents." },
  { name: "Hassan Bennani", role: "Entraîneur AS FAR", content: "Un outil indispensable pour les entraîneurs. Le contenu est structuré et la certification est reconnue." },
  { name: "Fatima El Idrissi", role: "Joueuse Internationale", content: "La plateforme m'a aidée à perfectionner mes techniques individuelles de manière autonome." },
];

const trustBadges = [
  { icon: Landmark, title: "Certifié IHF", description: "Programme conforme aux standards de l'International Handball Federation" },
  { icon: Globe, title: "Partenaire FRMHB", description: "Partenaire académique officiel de la Fédération Royale Marocaine de Handball" },
  { icon: Lock, title: "Données sécurisées", description: "Vos données sont protégées et chiffrées selon les normes RGPD" },
];

// ─── Testimonials Section ────────────────────────────────────────────────────

export function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16"><h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">Ils témoignent</h2></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-[#FAFAFA] rounded-xl border border-border/60 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out">
              <div className="flex items-center gap-1 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{t.content}&rdquo;</p>
              <div><p className="font-semibold text-foreground text-sm">{t.name}</p><p className="text-xs text-muted-foreground">{t.role}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Trust & Security Section ────────────────────────────────────────────────

export function TrustSection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Confiance & Sécurité</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">Votre réussite et la protection de vos données sont notre priorité.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.title} className={cn("flex flex-col items-center text-center bg-white rounded-xl border border-border/60 p-6 sm:p-8", "hover:shadow-md hover:-translate-y-1 hover:border-primary/20", "transition-all duration-300 ease-out")}>
                <div className={cn("w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4", "group-hover:bg-primary/20 transition-colors duration-300")}>
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{badge.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
