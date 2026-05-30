"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BookOpen, GraduationCap, Award, Users, Shield, TrendingUp,
  UserPlus, Compass, BadgeCheck,
} from "lucide-react";

/* ─── Data ────────────────────────────────────────────────────────────────── */

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

/* ─── Animation Variants ──────────────────────────────────────────────────── */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/* ─── Features Section ────────────────────────────────────────────────────── */

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FAFBFC]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex mb-4 px-4 py-1.5 rounded-full bg-blue-50 text-xs font-semibold text-blue-700 border border-blue-100">
            Pourquoi AMDRH Academy
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Une formation complète et certifiante
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
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
                  "bg-white rounded-xl p-6 border border-gray-200 group cursor-default relative overflow-hidden shadow-sm",
                  "hover:shadow-lg hover:shadow-blue-500/[0.06] hover:border-blue-200 hover:-translate-y-1",
                  "transition-all duration-300 ease-out"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 border border-blue-100",
                  "group-hover:bg-blue-100 group-hover:scale-110",
                  "transition-all duration-300 ease-out"
                )}>
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── How It Works Section ────────────────────────────────────────────────── */

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex mb-4 px-4 py-1.5 rounded-full bg-blue-50 text-xs font-semibold text-blue-700 border border-blue-100">
            Comment ça marche
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            3 étapes pour obtenir votre certification
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Un processus simple et guidé pour débuter et réussir votre formation handball.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-3 gap-8 sm:gap-6 relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Connecting line */}
          <div className="hidden sm:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-blue-500/20 via-blue-500/30 to-blue-500/20" aria-hidden="true" />

          {howItWorksSteps.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                variants={cardVariants}
                className="relative text-center group hover:-translate-y-1 transition-transform duration-300 ease-out"
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25 group-hover:shadow-xl group-hover:shadow-blue-600/35 group-hover:scale-105 transition-all duration-300 relative z-10">
                  <Icon className="w-7 h-7" />
                </div>
                <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-blue-500/60 mb-2">
                  Étape {item.step}
                </span>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{item.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
