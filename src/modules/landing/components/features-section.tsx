"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  BookOpen, GraduationCap, Award, Users, Shield, TrendingUp,
} from "lucide-react";

const features = [
  { icon: BookOpen, title: "Cours Certifiants", description: "Formations en arbitrage, entraînement et jeu avec certification officielle AMDRH-FRMHB." },
  { icon: GraduationCap, title: "Parcours Structurés", description: "Parcours personnalisés selon votre profil : arbitre, entraîneur, joueur ou administrateur." },
  { icon: Award, title: "Certificats Reconnus", description: "Certificats numériques sécurisés avec code unique AMDRH reconnus par la FRMHB." },
  { icon: Users, title: "Formateurs Experts", description: "Corps de formateurs certifiés IHF avec une expérience internationale avérée." },
  { icon: Shield, title: "Standards IHF", description: "Contenu pédagogique conforme aux standards internationaux de l'IHF et de la FRMHB." },
  { icon: TrendingUp, title: "Suivi de Progression", description: "Tableau de bord complet pour suivre votre progression et vos performances." },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

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
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Formation complète et certifiante
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Tous les outils pour progresser dans le handball marocain.
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
                  "bg-white rounded-xl p-6 border border-gray-200 relative overflow-hidden shadow-sm",
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
