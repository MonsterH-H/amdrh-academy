"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Hand, Scale, Users, Trophy, Settings } from "lucide-react";

const roles = [
  {
    title: "Arbitres",
    icon: Scale,
    iconBg: "bg-blue-600",
    items: ["Règles IHF", "Gestion du jeu", "Techniques d'arbitrage", "Éthique sportive"],
  },
  {
    title: "Entraîneurs",
    icon: Trophy,
    iconBg: "bg-amber-500",
    items: ["Méthodologie", "Préparation physique", "Tactique de jeu", "Psychologie sportive"],
  },
  {
    title: "Joueurs",
    icon: Hand,
    iconBg: "bg-cyan-500",
    items: ["Techniques individuelles", "Règles du jeu", "Prévention blessures", "Jeu collectif"],
  },
  {
    title: "Administrateurs",
    icon: Settings,
    iconBg: "bg-violet-500",
    items: ["Gestion de club", "Réglementation", "Communication", "Gestion des licences"],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function RolesSection() {
  return (
    <section id="roles" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#0F172A] relative">
      <div className="max-w-6xl mx-auto relative">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Un parcours pour chaque profil
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Des formations adaptées à chaque acteur du handball marocain.
          </p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <motion.div
                key={role.title}
                variants={cardVariants}
                className="group rounded-xl bg-[#1E293B] border border-slate-700/50 p-6 hover:scale-[1.02] hover:border-slate-600 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${role.iconBg} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg mb-4">{role.title}</h3>
                <ul className="space-y-2.5">
                  {role.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
