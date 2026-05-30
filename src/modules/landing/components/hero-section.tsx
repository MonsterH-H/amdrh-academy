"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, CircleDot, Landmark, Globe, ShieldCheck,
  ChevronDown,
} from "lucide-react";

/* ─── Animation Variants ──────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

/* ─── Trust Badges ────────────────────────────────────────────────────────── */

const trustBadges = [
  { icon: Landmark, label: "FRMHB" },
  { icon: Globe, label: "IHF" },
  { icon: ShieldCheck, label: "Sécurisé" },
];

/* ─── Header ──────────────────────────────────────────────────────────────── */

export function LandingHeader({ onLogin }: { onLogin: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200/60 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
            <CircleDot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-gray-900 leading-tight">Académie</h1>
            <p className="text-[10px] text-blue-600 font-semibold tracking-[0.15em] uppercase">AMDRH</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg px-5 h-10 shadow-sm shadow-blue-600/20 transition-all duration-200 hover:shadow-md hover:shadow-blue-600/30 cursor-pointer"
            onClick={onLogin}
          >
            Connexion
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ─── Hero Section ────────────────────────────────────────────────────────── */

export function HeroSection({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="relative pt-28 sm:pt-36 pb-28 sm:pb-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Premium blue gradient background */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1D3A] via-[#102B52] to-[#1E40AF]" />
        {/* Subtle geometric grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Radial light glow from top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.15)_0%,transparent_70%)]" />
        {/* Bottom fade to light section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FAFBFC] to-transparent" />
      </div>

      <motion.div
        className="max-w-4xl mx-auto text-center relative"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <Badge className="mb-6 sm:mb-8 bg-white/10 text-white/90 border border-white/15 px-4 py-1.5 text-xs font-semibold rounded-full">
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
          <span className="bg-gradient-to-r from-blue-300 via-blue-400 to-blue-200 bg-clip-text text-transparent">
            AMDRH
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-lg sm:text-xl text-blue-200/80 font-medium mb-2"
        >
          Fédération Royale Marocaine de Handball
        </motion.p>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-base sm:text-lg text-slate-300/80 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          La plateforme de formation de l&apos;Association Marocaine Des Arbitres de Handball.
          Formez-vous aux plus hauts standards avec des certifications reconnues par la FRMHB et l&apos;IHF.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50 text-sm font-semibold rounded-xl px-8 h-12 shadow-lg shadow-black/10 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            onClick={onLogin}
          >
            Se connecter <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mt-14 sm:mt-16 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
        >
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                className="flex items-center gap-2 text-slate-300/70 text-xs sm:text-sm font-medium bg-white/[0.06] border border-white/[0.08] rounded-full px-3.5 py-2"
              >
                <Icon className="w-4 h-4 text-blue-400" />
                <span>{badge.label}</span>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-white/25"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}
