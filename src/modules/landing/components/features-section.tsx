"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BookOpen, GraduationCap, Award, Users, Shield, TrendingUp,
  UserPlus, Compass, BadgeCheck,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  { icon: BookOpen, title: "Cours Certifiants", description: "Formations en arbitrage, entraînement et jeu avec certification officielle AMDRH-FRMHB reconnue à l'international." },
  { icon: GraduationCap, title: "Parcours Structurés", description: "Parcours personnalisés selon votre profil : arbitre, entraîneur, joueur ou administrateur de club." },
  { icon: Award, title: "Certificats Reconnus", description: "Certificats numériques sécurisés avec code unique AMDRH, reconnus par la Fédération Royale Marocaine." },
  { icon: Users, title: "Formateurs Experts", description: "Corps de formateurs certifiés IHF avec une expérience internationale avérée en handball." },
  { icon: Shield, title: "Standards IHF", description: "Contenu pédagogique conforme aux standards internationaux de l'IHF et de la FRMHB." },
  { icon: TrendingUp, title: "Suivi de Progression", description: "Tableau de bord complet pour suivre votre progression, vos performances et vos objectifs." },
];

const howItWorksSteps = [
  { step: 1, icon: UserPlus, title: "Créez votre compte", description: "Inscription rapide et sécurisée. Choisissez votre profil parmi arbitre, entraîneur, joueur ou administrateur." },
  { step: 2, icon: Compass, title: "Choisissez votre parcours", description: "Explorez nos parcours certifiants adaptés à votre niveau et à vos objectifs professionnels dans le handball." },
  { step: 3, icon: BadgeCheck, title: "Obtenez votre certificat", description: "Validez les modules, passez les évaluations et recevez votre certificat reconnu par la FRMHB et l'IHF." },
];

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ─── Features Section ────────────────────────────────────────────────────────

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex mb-4 px-3 py-1 rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
            Pourquoi AMDRH Academy
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Une formation complète et certifiante
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tous les outils nécessaires pour progresser dans le handball marocain, de la formation initiale à la certification avancée.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className={cn(
                  "bg-white rounded-xl p-6 border border-gray-200/80 group cursor-default relative overflow-hidden",
                  "hover:shadow-xl hover:shadow-emerald-500/[0.06] hover:border-emerald-500/30 hover:-translate-y-1",
                  "transition-all duration-300 ease-out"
                )}
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-transparent group-hover:from-emerald-50/60 group-hover:to-transparent transition-all duration-500" />

                <div className="relative">
                  <div className={cn(
                    "w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4",
                    "group-hover:bg-emerald-100 group-hover:scale-110 group-hover:rotate-3",
                    "transition-all duration-300 ease-out"
                  )}>
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ─── How It Works Section ────────────────────────────────────────────────────

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
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
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex mb-4 px-3 py-1 rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">Comment ça marche</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">3 étapes pour obtenir votre certification</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Un processus simple et guidé pour débuter et réussir votre formation handball.</p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-3 gap-8 sm:gap-6 relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Connecting line */}
          <div className="hidden sm:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-emerald-500/20 via-emerald-500/30 to-emerald-500/20" aria-hidden="true" />

          {howItWorksSteps.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                variants={cardVariants}
                className={cn("relative text-center group", "hover:-translate-y-1 transition-transform duration-300 ease-out")}
              >
                <div className={cn(
                  "w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center",
                  "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25",
                  "group-hover:shadow-xl group-hover:shadow-emerald-500/35 group-hover:scale-105",
                  "transition-all duration-300 ease-out relative z-10"
                )}>
                  <Icon className="w-7 h-7" />
                </div>
                <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-emerald-500/60 mb-2">Étape {item.step}</span>
                <h3 className="font-bold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
