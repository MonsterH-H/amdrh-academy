"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CircleDot,
  Landmark,
  Globe,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

/* ─── Animation Variants ──────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
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
          <div className="w-10 h-10 rounded-xl bg-[#0B1D3A] flex items-center justify-center shadow-md shadow-[#0B1D3A]/20">
            <CircleDot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-gray-900 leading-tight">
              Académie
            </h1>
            <p className="text-[10px] text-[#1a3a6a] font-semibold tracking-[0.15em] uppercase">
              AMDRH
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="bg-[#0B1D3A] hover:bg-[#102B52] text-white text-sm font-semibold rounded-lg px-5 h-10 shadow-sm shadow-[#0B1D3A]/20 transition-colors duration-200 cursor-pointer"
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
    <section className="relative pt-28 sm:pt-36 pb-32 sm:pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Clean dark navy background */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {/* Solid base */}
        <div className="absolute inset-0 bg-[#0B1D3A]" />
        {/* Single subtle radial glow from top center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_60%_50%_at_center,rgba(255,255,255,0.04)_0%,transparent_100%)]" />
        {/* Clean bottom fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#FAFBFC] to-transparent" />
      </div>

      <motion.div
        className="max-w-3xl mx-auto text-center relative"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Partner Badge */}
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <Badge
            variant="outline"
            className="mb-8 sm:mb-10 bg-transparent text-white/80 border-white/20 px-4 py-1.5 text-xs font-medium rounded-full hover:bg-white/5 transition-colors"
          >
            <Landmark className="w-3.5 h-3.5 mr-1.5 text-blue-300" />
            Partenaire Académique Officiel FRMHB
          </Badge>
        </motion.div>

        {/* Main Heading — SOLID WHITE, no gradient clipping */}
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-4 sm:mb-6"
        >
          Académie AMDRH
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-base sm:text-lg text-blue-200/70 font-medium mb-3"
        >
          Fédération Royale Marocaine de Handball
        </motion.p>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-sm sm:text-base text-white/60 max-w-xl mx-auto mb-10 sm:mb-12 leading-relaxed"
        >
          La plateforme de formation de l&apos;Association Marocaine Des Arbitres
          de Handball. Formez-vous aux plus hauts standards avec des
          certifications reconnues par la FRMHB et l&apos;IHF.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="bg-white text-[#0B1D3A] hover:bg-white/90 text-sm font-bold rounded-xl px-8 h-12 shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-200 hover:shadow-[0_6px_28px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            onClick={onLogin}
          >
            Commencer maintenant
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>

        {/* Trust Badges */}
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
                className="flex items-center gap-2 text-white/50 text-xs sm:text-sm font-medium bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-2"
              >
                <Icon className="w-3.5 h-3.5 text-blue-300/70" />
                <span>{badge.label}</span>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-white/20"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </section>
  );
}
