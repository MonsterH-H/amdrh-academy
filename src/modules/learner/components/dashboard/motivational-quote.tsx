"use client";

import { Quote } from "lucide-react";

const QUOTES = [
  "L'excellence n'est pas un acte, mais une habitude. Continuez à progresser chaque jour.",
  "Le sport enseigne la discipline, la persévérance et le dépassement de soi.",
  "Chaque formation terminée est un pas de plus vers la maîtrise de votre art.",
  "La connaissance est le seul trésor qui s'accroît quand on le partage.",
  "Le succès est la somme de petits efforts répétés jour après jour.",
  "Ne comparez pas votre progression à celle des autres. Chacun a son propre rythme.",
  "Un bon arbitre ne se voit pas, il se fait ressentir à travers la qualité de son travail.",
  "L'apprentissage est un voyage, pas une destination. Profitez de chaque étape.",
  "La formation continue est la clé qui ouvre les portes de l'excellence.",
  "Votre passion pour le sport est votre plus grande motivation. Cultivez-la.",
];

export function MotivationalQuote() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const quote = QUOTES[dayOfYear % QUOTES.length];

  return (
    <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/15 rounded-xl p-5 sm:p-6 overflow-hidden">
      <div className="absolute top-3 right-4 opacity-10">
        <Quote className="w-16 h-16 text-primary" />
      </div>
      <p className="text-sm sm:text-base font-medium text-foreground/90 italic leading-relaxed relative z-10">
        &ldquo;{quote}&rdquo;
      </p>
      <p className="text-[11px] text-muted-foreground mt-2 relative z-10">
        Citation du jour — AMDRH Academy
      </p>
    </div>
  );
}
