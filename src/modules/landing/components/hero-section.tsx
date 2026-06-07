"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CircleDot,
  Landmark,
  Globe,
  ShieldCheck,
  ChevronDown,
  Users,
  GraduationCap,
  Trophy,
  Target,
} from "lucide-react";

/* ─── Animated Counter Hook ───────────────────────────────────────────────── */

function useCounter(target: number, duration: number = 2000, startOnMount: boolean = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    if (!startOnMount) return;
    const timer = setTimeout(() => setStarted(true), 600);
    return () => clearTimeout(timer);
  }, [startOnMount]);

  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        ref.current = requestAnimationFrame(step);
      }
    };
    ref.current = requestAnimationFrame(step);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [target, duration, started]);

  return count;
}

/* ─── Animation Variants ──────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const statStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.8 },
  },
};

/* ─── Stat Card Data ───────────────────────────────────────────────────────── */

const stats = [
  {
    icon: Users,
    value: 500,
    suffix: "+",
    label: "Arbitres Certifiés",
    color: "from-blue-400/20 to-cyan-400/10",
    iconColor: "text-blue-300",
  },
  {
    icon: GraduationCap,
    value: 30,
    suffix: "+",
    label: "Formations",
    color: "from-amber-400/20 to-yellow-400/10",
    iconColor: "text-amber-300",
  },
  {
    icon: Trophy,
    value: 98,
    suffix: "%",
    label: "Taux de Réussite",
    color: "from-emerald-400/20 to-green-400/10",
    iconColor: "text-emerald-300",
  },
];

/* ─── Floating Shape Component ─────────────────────────────────────────────── */

function FloatingShape({
  className,
  delay = 0,
  duration = 12,
}: {
  className: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 1 }}
    >
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{
            duration: duration * 0.7,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
          className="w-full h-full"
        />
      </motion.div>
    </motion.div>
  );
}

/* ─── Stat Card Component ─────────────────────────────────────────────────── */

function StatCard({
  icon: Icon,
  value,
  suffix,
  label,
  color,
  iconColor,
  index,
}: (typeof stats)[number] & { index: number }) {
  const count = useCounter(value, 2200);

  return (
    <motion.div
      variants={scaleUp}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative group"
    >
      {/* Glow effect on hover */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

      <div className="relative rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] p-5 sm:p-6 hover:bg-white/[0.1] hover:border-white/[0.2] transition-all duration-500 hover:-translate-y-1">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        {/* Counter */}
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
          {count}
          <span className="text-lg sm:text-xl font-bold text-white/70">{suffix}</span>
        </div>

        {/* Label */}
        <p className="text-xs sm:text-sm text-white/50 font-medium leading-snug">
          {label}
        </p>

        {/* Subtle bottom accent line */}
        <div className={`absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r ${color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      </div>
    </motion.div>
  );
}

/* ─── Geometric Grid Pattern (CSS SVG) ──────────────────────────────────── */

function GeometricPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <defs>
          <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      {/* Dot pattern overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
        <defs>
          <pattern id="hero-dots" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots)" />
      </svg>

      {/* Diagonal line pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02]">
        <defs>
          <pattern id="hero-diag" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="80" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-diag)" />
      </svg>
    </div>
  );
}

/* ─── Header ──────────────────────────────────────────────────────────────── */

export function LandingHeader({ onLogin }: { onLogin: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0B1D3A]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.2)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 rounded-xl bg-white/[0.1] backdrop-blur-sm border border-white/[0.15] flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
          >
            <CircleDot className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="font-bold text-base text-white leading-tight tracking-tight">
              Académie
            </h1>
            <p className="text-[10px] text-blue-300/80 font-semibold tracking-[0.2em] uppercase">
              AMDRH
            </p>
          </div>
        </div>

        {/* CTA */}
        <Button
          className="bg-white/[0.1] hover:bg-white/[0.2] text-white text-sm font-semibold rounded-xl px-5 h-10 border border-white/[0.15] backdrop-blur-sm transition-all duration-300 hover:border-white/[0.3] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer"
          onClick={onLogin}
        >
          Connexion
        </Button>
      </div>
    </motion.header>
  );
}

/* ─── Hero Section ────────────────────────────────────────────────────────── */

export function HeroSection({ onLogin }: { onLogin: () => void }) {
  const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ── Layer 1: Deep navy gradient background ────────────────────────── */}
      <motion.div
        className="absolute inset-0"
        style={{ y: bgY }}
        aria-hidden="true"
      >
        {/* Base gradient */}
        <div className="absolute inset-0 bg-[#0B1D3A]" />

        {/* Top-right radial glow — blue accent */}
        <div className="absolute -top-20 -right-20 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,rgba(37,99,235,0.04)_40%,transparent_70%)]" />

        {/* Bottom-left radial glow — cyan accent */}
        <div className="absolute -bottom-32 -left-32 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(6,182,212,0.08)_0%,rgba(6,182,212,0.02)_40%,transparent_70%)]" />

        {/* Center top glow — warm highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_70%_50%_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]" />

        {/* Geometric SVG patterns */}
        <GeometricPattern />

        {/* Bottom fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FAFBFC] via-[#FAFBFC]/80 to-transparent" />
      </motion.div>

      {/* ── Layer 2: Floating geometric shapes ────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Large circle — top right */}
        <FloatingShape
          className="absolute top-[15%] right-[8%] w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-white/[0.04] bg-white/[0.01]"
          delay={0.5}
          duration={14}
        />

        {/* Medium circle — bottom left */}
        <FloatingShape
          className="absolute bottom-[25%] left-[5%] w-32 h-32 sm:w-48 sm:h-48 rounded-full border border-white/[0.06] bg-white/[0.02]"
          delay={1}
          duration={10}
        />

        {/* Diamond shape — left middle */}
        <FloatingShape
          className="absolute top-[40%] left-[12%] w-16 h-16 sm:w-20 sm:h-20 border border-white/[0.06] bg-white/[0.02] rotate-45"
          delay={0.8}
          duration={11}
        />

        {/* Small diamond — right top */}
        <FloatingShape
          className="absolute top-[25%] right-[25%] w-8 h-8 sm:w-12 sm:h-12 border border-white/[0.08] bg-white/[0.03] rotate-45"
          delay={1.5}
          duration={9}
        />

        {/* Circle ring — center right */}
        <FloatingShape
          className="absolute top-[55%] right-[15%] w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-white/[0.04]"
          delay={0.3}
          duration={16}
        />

        {/* Whistle icon shape — subtle */}
        <FloatingShape
          className="absolute top-[30%] left-[3%] w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-white/[0.03] flex items-center justify-center"
          delay={2}
          duration={12}
        />

        {/* Target circle — right bottom */}
        <FloatingShape
          className="absolute bottom-[35%] right-[8%] w-20 h-20 sm:w-28 sm:h-28 rounded-full border border-dashed border-white/[0.06]"
          delay={1.2}
          duration={15}
        />

        {/* Decorative line — left */}
        <motion.div
          className="absolute top-[20%] left-0 w-px h-40 bg-gradient-to-b from-transparent via-white/[0.08] to-transparent"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 1, duration: 1.5 }}
          style={{ transformOrigin: "top" }}
        />

        {/* Decorative line — right */}
        <motion.div
          className="absolute top-[30%] right-0 w-px h-60 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ delay: 1.2, duration: 1.5 }}
          style={{ transformOrigin: "bottom" }}
        />

        {/* Horizontal accent line */}
        <motion.div
          className="absolute top-[60%] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.5, duration: 2 }}
        />
      </div>

      {/* ── Layer 3: Main content ───────────────────────────────────────── */}
      <motion.div
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-20"
        style={{ y: textY, opacity }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* ── Premium Badge with gradient border ───────────────────── */}
            <motion.div variants={fadeIn} transition={{ duration: 0.6 }} className="mb-8 sm:mb-10">
              <div className="inline-flex relative rounded-full p-[1px] bg-gradient-to-r from-blue-400/50 via-cyan-300/30 to-blue-400/50 animate-glow-pulse">
                <div className="flex items-center gap-2 bg-[#0B1D3A] rounded-full px-5 py-2.5">
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-400/30 to-cyan-400/20 flex items-center justify-center">
                    <Landmark className="w-3 h-3 text-blue-300" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-white/80 tracking-wide">
                    Partenaire Académique Officiel{" "}
                    <span className="text-blue-300 font-semibold">FRMHB</span>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ── Main Heading — MASSIVE typography ────────────────────── */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-3 sm:mb-4"
              style={{ textShadow: "0 4px 30px rgba(0,0,0,0.2)" }}
            >
              Académie
              <br />
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                AMDRH
              </span>
            </motion.h1>

            {/* ── Subheading ────────────────────────────────────────────── */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-sm sm:text-base md:text-lg text-blue-200/60 font-semibold tracking-[0.15em] uppercase mb-3 sm:mb-4"
            >
              Fédération Royale Marocaine de Handball
            </motion.p>

            {/* ── Accent line divider ───────────────────────────────────── */}
            <motion.div
              variants={fadeIn}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex items-center justify-center gap-3 mb-6 sm:mb-8"
            >
              <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-white/20" />
              <CircleDot className="w-4 h-4 text-white/30" />
              <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-white/20" />
            </motion.div>

            {/* ── Description ───────────────────────────────────────────── */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-sm sm:text-base md:text-lg text-white/50 max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed font-normal"
            >
              La plateforme de formation de l&apos;Association Marocaine Des Arbitres
              de Handball. Formez-vous aux plus hauts standards avec des
              certifications reconnues par la FRMHB et l&apos;IHF.
            </motion.p>

            {/* ── CTA Buttons ──────────────────────────────────────────── */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14 sm:mb-16"
            >
              {/* Primary CTA */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="group bg-white text-[#0B1D3A] hover:bg-white/95 text-sm font-bold rounded-2xl px-8 h-12 sm:h-14 shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(255,255,255,0.15)] cursor-pointer w-full sm:w-auto"
                  onClick={onLogin}
                >
                  Commencer maintenant
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </motion.div>

              {/* Ghost CTA */}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="group text-white text-sm font-semibold rounded-2xl px-8 h-12 sm:h-14 border-white/[0.15] hover:bg-white/[0.08] hover:border-white/[0.3] hover:text-white transition-all duration-300 backdrop-blur-sm cursor-pointer w-full sm:w-auto"
                >
                  Découvrir les formations
                  <Target className="ml-2 w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </motion.div>
            </motion.div>

            {/* ── Stat Cards ────────────────────────────────────────────── */}
            <motion.div
              variants={statStagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto"
            >
              {stats.map((stat, index) => (
                <StatCard key={stat.label} {...stat} index={index} />
              ))}
            </motion.div>
          </motion.div>

          {/* ── Trust Badges ────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="mt-14 sm:mt-16 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            {[
              { icon: Landmark, label: "FRMHB" },
              { icon: Globe, label: "IHF" },
              { icon: ShieldCheck, label: "Certifié" },
            ].map((badge, i) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.label}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 text-white/40 text-xs sm:text-sm font-medium bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2 hover:bg-white/[0.08] hover:border-white/[0.15] hover:text-white/60 transition-all duration-300 cursor-default"
                >
                  <Icon className="w-3.5 h-3.5 text-blue-300/60" />
                  <span>{badge.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

      {/* ── Scroll Indicator ────────────────────────────────────────────── */}
      <motion.div
        className="absolute bottom-10 sm:bottom-14 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] sm:text-xs text-white/25 font-medium tracking-widest uppercase">
            Défiler
          </span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5">
            <motion.div
              animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-1 h-1.5 rounded-full bg-white/40"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
