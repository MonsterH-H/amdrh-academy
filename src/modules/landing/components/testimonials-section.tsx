"use client";

import { motion } from "framer-motion";
import { Star, Quote, Landmark, Globe, Lock, MapPin } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const testimonials = [
  {
    name: "Ahmed TAZI",
    role: "Arbitre International",
    region: "Région Rabat-Salé",
    rating: 5,
    content: "La formation AMDRH m'a permis d'accéder au niveau international. Les modules d'arbitrage sont rigoureux, à jour avec les dernières règles IHF, et le suivi est exceptionnel. Je recommande vivement cette plateforme à tous les arbitres aspirants.",
  },
  {
    name: "Fatima BENALI",
    role: "Formatrice Certifiée",
    region: "Région Casablanca",
    rating: 5,
    content: "En tant que formatrice, je trouve que l'Académie AMDRH offre un cadre pédagogique remarquable. Les parcours sont bien structurés et les outils de suivi permettent un accompagnement personnalisé de chaque apprenant.",
  },
  {
    name: "Karim ELMANSOURI",
    role: "Entraîneur National",
    region: "Région Marrakech",
    rating: 5,
    content: "Cette plateforme est devenue un outil indispensable pour la formation de nos entraîneurs. Le contenu est conforme aux standards de la FRMHB et permet une montée en compétences rapide et efficace.",
  },
];

const trustBadges = [
  { icon: Landmark, title: "Certifié IHF", description: "Programme conforme aux standards de l'International Handball Federation" },
  { icon: Globe, title: "Partenaire FRMHB", description: "Partenaire académique officiel de la Fédération Royale Marocaine de Handball" },
  { icon: Lock, title: "Données sécurisées", description: "Vos données sont protégées et chiffrées selon les normes en vigueur" },
];

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// ─── Testimonials Section ────────────────────────────────────────────────────

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Ils témoignent</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Des professionnels du handball marocain partagent leur expérience.</p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={cardVariants}
              className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:shadow-emerald-500/[0.04] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
            >
              {/* Emerald left accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-l-xl" />

              {/* Quote icon */}
              <div className="absolute top-4 right-4 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-300">
                <Quote className="w-12 h-12 text-emerald-600" />
              </div>

              <div className="relative">
                {/* Star rating */}
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote content */}
                <p className="text-sm text-gray-600 leading-relaxed mb-5">&ldquo;{t.content}&rdquo;</p>

                {/* Author info */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-500" />
                      <span className="text-[11px] text-emerald-600 font-medium">{t.region}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Trust & Security Section ────────────────────────────────────────────────

export function TrustSection() {
  return (
    <section id="trust" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Confiance & Sécurité</h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm">Votre réussite et la protection de vos données sont notre priorité.</p>
        </motion.div>

        <motion.div
          className="grid sm:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.title}
                variants={cardVariants}
                className="flex flex-col items-center text-center bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-100 hover:bg-emerald-100 transition-colors duration-300">
                  <Icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{badge.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{badge.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
