"use client";

import { cn } from "@/lib/utils";
import {
  BookOpen, GraduationCap, Award, Users, Shield, TrendingUp,
  UserPlus, Compass, BadgeCheck,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  { icon: BookOpen, title: "Cours Certifiants", description: "Formations en arbitrage, entraînement et jeu avec certification officielle AMDRH-FRMHB." },
  { icon: GraduationCap, title: "Parcours Structurés", description: "Learning paths personnalisés selon votre profil : arbitre, entraîneur, joueur ou administrateur." },
  { icon: Award, title: "Certificats Reconnus", description: "Certificats numériques avec code unique AMDRH, reconnus par la Fédération Royale Marocaine." },
  { icon: Users, title: "Formateurs Experts", description: "Formateurs certifiés IHF avec expérience internationale en handball." },
  { icon: Shield, title: "Standards IHF", description: "Contenu conforme aux standards internationaux de l'IHF et de la FRMHB." },
  { icon: TrendingUp, title: "Suivi de Progression", description: "Tableau de bord complet pour suivre votre progression et vos performances." },
];

const howItWorksSteps = [
  { step: 1, icon: UserPlus, title: "Créez votre compte", description: "Inscription rapide et gratuite. Choisissez votre profil parmi arbitre, entraîneur, joueur ou administrateur." },
  { step: 2, icon: Compass, title: "Choisissez votre parcours", description: "Explorez nos parcours certifiants adaptés à votre niveau et à vos objectifs professionnels dans le handball." },
  { step: 3, icon: BadgeCheck, title: "Obtenez votre certificat", description: "Validez les modules, passez les quiz et recevez votre certificat reconnu par la FRMHB et l'IHF." },
];

// ─── Features Section ────────────────────────────────────────────────────────

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex mb-4 px-3 py-1 rounded-full bg-muted text-xs font-semibold text-muted-foreground">Pourquoi AMDRH Academy</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Une formation complète et certifiante</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Tous les outils nécessaires pour progresser dans le handball marocain, de la formation initiale à la certification avancée.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className={cn("bg-white rounded-xl p-6 border border-border/60 group", "hover:shadow-lg hover:shadow-primary/[0.06] hover:border-primary/25 hover:-translate-y-1", "transition-all duration-300 ease-out cursor-default")}>
                <div className={cn("w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4", "group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-3", "transition-all duration-300 ease-out")}>
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works Section ────────────────────────────────────────────────────

export function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-[0.025] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="court-lines" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
          <rect x="10" y="10" width="180" height="180" rx="8" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.5" strokeDasharray="6 4" />
          <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="100" cy="100" r="4" fill="currentColor" />
          <path d="M80 10 A30 30 0 0 1 120 10" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <path d="M80 190 A30 30 0 0 0 120 190" fill="none" stroke="currentColor" strokeWidth="0.6" />
        </pattern></defs>
        <rect width="100%" height="100%" fill="url(#court-lines)" />
      </svg>
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex mb-4 px-3 py-1 rounded-full bg-muted text-xs font-semibold text-muted-foreground">Comment ça marche</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">3 étapes pour obtenir votre certification</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Un processus simple et guidé pour débuter et réussir votre formation handball.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 relative">
          <div className="hidden sm:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20" aria-hidden="true" />
          {howItWorksSteps.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className={cn("relative text-center group", "hover:-translate-y-1 transition-transform duration-300 ease-out")}>
                <div className={cn("w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center", "bg-gradient-to-br from-primary to-primary/80 text-white shadow-md shadow-primary/20", "group-hover:shadow-lg group-hover:shadow-primary/30 group-hover:scale-105", "transition-all duration-300 ease-out relative z-10")}>
                  <Icon className="w-7 h-7" />
                </div>
                <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-primary/60 mb-2">Étape {item.step}</span>
                <h3 className="font-bold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
