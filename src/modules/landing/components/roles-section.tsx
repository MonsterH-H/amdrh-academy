"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Hand, Scale, Users, Trophy, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app";

// ─── Data ────────────────────────────────────────────────────────────────────

const roles = [
  { title: "Arbitres", icon: Scale, gradient: "from-emerald-500 to-emerald-600", shadow: "shadow-emerald-500/20", items: ["Règles IHF", "Gestion du jeu", "Techniques d'arbitrage", "Éthique sportive"] },
  { title: "Entraîneurs", icon: Trophy, gradient: "from-amber-500 to-amber-600", shadow: "shadow-amber-500/20", items: ["Méthodologie", "Préparation physique", "Tactique de jeu", "Psychologie sportive"] },
  { title: "Joueurs", icon: Hand, gradient: "from-cyan-500 to-cyan-600", shadow: "shadow-cyan-500/20", items: ["Techniques individuelles", "Règles du jeu", "Prévention blessures", "Jeu collectif"] },
  { title: "Administrateurs", icon: Settings, gradient: "from-violet-500 to-violet-600", shadow: "shadow-violet-500/20", items: ["Gestion de club", "Réglementation", "Communication", "Gestion des licences"] },
];

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ─── Roles Section ─────────────────────────────────────────────────────────

export function RolesSection() {
  return (
    <section id="roles" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 relative">
      <div className="max-w-6xl mx-auto relative">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Un parcours pour chaque profil</h2>
          <p className="text-gray-400 max-w-lg mx-auto">Des formations adaptées à chaque acteur du handball marocain.</p>
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
                className={`group rounded-xl bg-gray-800/60 border border-gray-700/50 p-6 hover:bg-gray-800 hover:scale-[1.02] hover:border-gray-600 transition-all duration-300 cursor-default shadow-lg ${role.shadow}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg mb-4">{role.title}</h3>
                <ul className="space-y-2.5">
                  {role.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
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

// ─── CTA Section ─────────────────────────────────────────────────────────────

export function CTASection() {
  const { navigate } = useAppStore();
  return (
    <section id="cta" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center relative">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl shadow-emerald-600/20">
          <div className="absolute top-4 right-4 opacity-[0.08] pointer-events-none" aria-hidden="true"><Hand className="w-24 h-24 text-white" /></div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 relative">Prêt à commencer votre formation ?</h2>
          <p className="text-emerald-100 mb-8 max-w-lg mx-auto relative">
            Rejoignez l&apos;Académie AMDRH et accédez à des formations de qualité reconnues par la Fédération.
          </p>
          <p className="text-white/80 text-sm relative font-medium">
            Application interne — Contactez votre administrateur pour obtenir un compte.
          </p>
          <Button
            size="lg"
            className="bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl px-8 h-12 font-semibold relative mt-6 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            onClick={() => navigate("login")}
          >
            Se connecter <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
