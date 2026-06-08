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
  Users,
  GraduationCap,
  Trophy,
} from "lucide-react";

const stats = [
  { icon: Users, value: 500, suffix: "+", label: "Arbitres Certifiés", color: "from-blue-400/20 to-cyan-400/10", iconColor: "text-blue-300" },
  { icon: GraduationCap, value: 30, suffix: "+", label: "Formations", color: "from-amber-400/20 to-yellow-400/10", iconColor: "text-amber-300" },
  { icon: Trophy, value: 98, suffix: "%", label: "Taux de Réussite", color: "from-emerald-400/20 to-green-400/10", iconColor: "text-emerald-300" },
];

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
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration, started]);

  return count;
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

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

const statStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.8 } },
};

function StatCard({ icon: Icon, value, suffix, label, color, iconColor }: (typeof stats)[number] & { index: number }) {
  const count = useCounter(value, 2200);
  return (
    <motion.div
      variants={scaleUp}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative group"
    >
      <div className="relative rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] p-5 sm:p-6 hover:bg-white/[0.1] hover:border-white/[0.2] transition-all duration-500 hover:-translate-y-1">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
          {count}
          <span className="text-lg sm:text-xl font-bold text-white/70">{suffix}</span>
        </div>
        <p className="text-xs sm:text-sm text-white/50 font-medium leading-snug">{label}</p>
      </div>
    </motion.div>
  );
}

function GeometricPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <defs>
          <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
    </div>
  );
}

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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.1] backdrop-blur-sm border border-white/[0.15] flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
            <CircleDot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white leading-tight tracking-tight">Académie</h1>
            <p className="text-[10px] text-blue-300/80 font-semibold tracking-[0.2em] uppercase">AMDRH</p>
          </div>
        </div>
        <Button
          className="bg-white/[0.1] hover:bg-white/[0.2] text-white text-sm font-semibold rounded-xl px-5 h-10 border border-white/[0.15] backdrop-blur-sm transition-all duration-300 hover:border-white/[0.3] cursor-pointer"
          onClick={onLogin}
        >
          Connexion
        </Button>
      </div>
    </motion.header>
  );
}

export function HeroSection({ onLogin }: { onLogin: () => void }) {
  const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: bgY }} aria-hidden="true">
        <div className="absolute inset-0 bg-[#0B1D3A]" />
        <div className="absolute -top-20 -right-20 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,rgba(37,99,235,0.04)_40%,transparent_70%)]" />
        <div className="absolute -bottom-32 -left-32 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(6,182,212,0.08)_0%,rgba(6,182,212,0.02)_40%,transparent_70%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_70%_50%_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]" />
        <GeometricPattern />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#FAFBFC] via-[#FAFBFC]/80 to-transparent" />
      </motion.div>

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
            <motion.div variants={fadeIn} transition={{ duration: 0.6 }} className="mb-8 sm:mb-10">
              <div className="inline-flex relative rounded-full p-[1px] bg-gradient-to-r from-blue-400/50 via-cyan-300/30 to-blue-400/50">
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

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-3 sm:mb-4"
              style={{ textShadow: "0 4px 30px rgba(0,0,0,0.2)" }}
            >
              Académie
              <br />
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">AMDRH</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-sm sm:text-base md:text-lg text-blue-200/60 font-semibold tracking-[0.15em] uppercase mb-3 sm:mb-4"
            >
              Fédération Royale Marocaine de Handball
            </motion.p>

            <motion.div
              variants={fadeIn}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex items-center justify-center gap-3 mb-6 sm:mb-8"
            >
              <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-white/20" />
              <CircleDot className="w-4 h-4 text-white/30" />
              <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-white/20" />
            </motion.div>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="text-sm sm:text-base md:text-lg text-white/50 max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed"
            >
              La plateforme de formation de l&apos;Association Marocaine Des Arbitres
              de Handball. Formez-vous aux plus hauts standards avec des
              certifications reconnues par la FRMHB et l&apos;IHF.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-14 sm:mb-16"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="group bg-white text-[#0B1D3A] hover:bg-white/95 text-sm font-bold rounded-2xl px-8 h-12 sm:h-14 shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-300 hover:shadow-[0_8px_40px_rgba(255,255,255,0.15)] cursor-pointer"
                  onClick={onLogin}
                >
                  Se connecter
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>

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
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 text-white/40 text-xs sm:text-sm font-medium bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2"
                >
                  <Icon className="w-3.5 h-3.5 text-blue-300/60" />
                  <span>{badge.label}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
