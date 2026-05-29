"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, CircleDot, Landmark, Globe, ShieldCheck,
  ChevronDown,
} from "lucide-react";

// ─── Header ──────────────────────────────────────────────────────────────────

export function LandingHeader({ onLogin }: { onLogin: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-200/60 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CircleDot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-gray-900 leading-tight">Académie</h1>
            <p className="text-[10px] text-emerald-600 font-semibold tracking-[0.15em] uppercase">AMDRH</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg px-5 h-10 shadow-sm shadow-emerald-600/20 transition-all duration-200 hover:shadow-md hover:shadow-emerald-600/30"
            onClick={onLogin}
          >
            Connexion
          </Button>
        </div>
      </div>
    </header>
  );
}

// ─── Trust Badges ───────────────────────────────────────────────────────────

const trustBadges = [
  { icon: Landmark, label: "Partenaire Officiel FRMHB" },
  { icon: Globe, label: "Certifié IHF" },
  { icon: ShieldCheck, label: "Plateforme Sécurisée" },
];

// ─── Animation Variants ─────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Hero Section ────────────────────────────────────────────────────────────

export function HeroSection({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gray-950">
      {/* Premium gradient background — NO blur, clean gradients */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950" />
        {/* Soft radial gradient accents — no blur */}
        <div className="absolute -top-20 -left-20 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.07]" />
        <div className="absolute top-1/3 -right-24 w-[500px] h-[500px] rounded-full bg-amber-500/[0.04]" />
        <div className="absolute -bottom-16 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.04]" />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        {/* Bottom fade to light */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FAFAFA] to-transparent" />
      </div>

      <motion.div
        className="max-w-4xl mx-auto text-center relative"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <Badge className="mb-6 sm:mb-8 bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm rounded-full">
            🏐 Partenaire Académique Officiel FRMHB
          </Badge>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-4 sm:mb-6"
        >
          Académie{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">
            AMDRH
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-lg sm:text-xl text-emerald-200/80 font-medium mb-2"
        >
          Fédération Royale Marocaine de Handball
        </motion.p>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          La plateforme de formation de l&apos;Association Marocaine Des Arbitres de Handball.
          Formez-vous aux plus hauts standards avec des certifications reconnues par la FRMHB et l&apos;IHF.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl px-8 h-12 shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98]"
            onClick={onLogin}
          >
            Se connecter <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 text-white/80 hover:text-white hover:bg-white/10 rounded-xl px-8 h-12 text-sm font-medium transition-all duration-200"
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
          >
            Découvrir
          </Button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mt-14 sm:mt-16 flex flex-wrap items-center justify-center gap-5 sm:gap-8"
        >
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="flex items-center gap-2.5 text-gray-400 text-xs sm:text-sm font-medium">
                <div className="w-8 h-8 rounded-lg bg-white/[0.08] flex items-center justify-center border border-white/[0.06]">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <span>{badge.label}</span>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-white/30"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}
