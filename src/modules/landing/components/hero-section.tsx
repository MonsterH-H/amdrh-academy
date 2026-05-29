"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, CircleDot, Landmark, Globe, ShieldCheck,
} from "lucide-react";

// ─── Export removed: blobKeyframes now lives in globals.css ───────────────────

// ─── Header ──────────────────────────────────────────────────────────────────

export function LandingHeader({ onLogin }: { onLogin: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-border/40 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center"><CircleDot className="w-5 h-5 text-white" /></div>
          <div><h1 className="font-bold text-sm text-foreground leading-tight">Académie</h1><p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">AMDRH</p></div>
        </div>
        <div className="flex items-center gap-3">
          <Button className="text-sm rounded-lg" onClick={onLogin}>Connexion</Button>
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
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ─── Hero Section ────────────────────────────────────────────────────────────

export function HeroSection({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Premium gradient mesh background */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Dark base */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950" />

        {/* Emerald gradient mesh accents */}
        <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full blur-[120px] animate-mesh-drift-1" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(5,150,105,0.15) 40%, transparent 70%)" }} />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full blur-[100px] animate-mesh-drift-2" style={{ background: "radial-gradient(circle, rgba(245,158,11,0.2) 0%, rgba(251,191,36,0.08) 40%, transparent 70%)" }} />
        <div className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] rounded-full blur-[100px] animate-mesh-drift-3" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(6,182,212,0.1) 40%, transparent 70%)" }} />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Handball court pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="handball-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="40" cy="40" r="16" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <path d="M40 24 C44 30, 44 50, 40 56" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <path d="M24 40 C30 36, 50 36, 56 40" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <path d="M40 24 C36 30, 36 50, 40 56" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <line x1="0" y1="80" x2="80" y2="80" stroke="currentColor" strokeWidth="0.3" strokeDasharray="4 8" />
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#handball-pattern)" />
        </svg>

        {/* Bottom fade to light */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FAFAFA] to-transparent" />
      </div>

      <motion.div
        className="max-w-4xl mx-auto text-center relative"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <Badge className="mb-6 sm:mb-8 bg-emerald-500/15 text-emerald-300 border-emerald-500/25 px-4 py-1.5 text-xs font-semibold backdrop-blur-sm">
            Partenaire Académique Officiel FRMHB
          </Badge>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-4 sm:mb-6"
        >
          Académie AMDRH
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

        {/* CTA Button with glow */}
        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <Button
            size="lg"
            className="text-sm rounded-xl px-8 h-13 bg-primary hover:bg-emerald-600 text-white font-semibold animate-glow-pulse transition-all duration-300"
            onClick={onLogin}
          >
            Se connecter <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-6"
        >
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm font-medium">
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <span>{badge.label}</span>
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
