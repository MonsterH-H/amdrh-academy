"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star, ArrowRight, CircleDot, Hand,
} from "lucide-react";

const blobKeyframes = `
@keyframes blob-float-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -40px) scale(1.08); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(15px, 35px) scale(1.05); }
}
@keyframes blob-float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(-35px, 25px) scale(1.06); }
  50% { transform: translate(25px, -30px) scale(0.97); }
  75% { transform: translate(-15px, -20px) scale(1.04); }
}
@keyframes blob-float-3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, 30px) scale(1.1); }
  66% { transform: translate(-25px, -15px) scale(0.93); }
}
@keyframes handball-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

export { blobKeyframes };

// ─── Header ──────────────────────────────────────────────────────────────────

export function LandingHeader({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-border/40 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center"><CircleDot className="w-5 h-5 text-white" /></div>
          <div><h1 className="font-bold text-sm text-foreground leading-tight">Académie</h1><p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">AMDRH</p></div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden sm:flex text-sm" onClick={onLogin}>Connexion</Button>
          <Button className="text-sm rounded-lg" onClick={onRegister}>S&apos;inscrire</Button>
        </div>
      </div>
    </header>
  );
}

// ─── Hero Section ────────────────────────────────────────────────────────────

export function HeroSection({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full opacity-[0.18] blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.6) 0%, rgba(59,130,246,0.3) 50%, transparent 70%)", animation: "blob-float-1 18s ease-in-out infinite" }} />
        <div className="absolute top-1/3 -right-32 w-[360px] h-[360px] rounded-full opacity-[0.14] blur-3xl" style={{ background: "radial-gradient(circle, rgba(20,184,166,0.5) 0%, rgba(16,185,129,0.25) 50%, transparent 70%)", animation: "blob-float-2 22s ease-in-out infinite" }} />
        <div className="absolute -bottom-20 left-1/3 w-[300px] h-[300px] rounded-full opacity-[0.12] blur-3xl" style={{ background: "radial-gradient(circle, rgba(245,158,11,0.45) 0%, rgba(251,191,36,0.2) 50%, transparent 70%)", animation: "blob-float-3 20s ease-in-out infinite" }} />
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
      </div>
      <div className="max-w-4xl mx-auto text-center relative">
        <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-xs font-semibold"><Star className="w-3 h-3 mr-1.5 fill-current" />Partenaire Académique Officiel FRMHB</Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-4 sm:mb-6">
          Formation d&apos;Excellence<br /><span className="text-primary">au Handball Marocain</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          La plateforme e-learning de l&apos;Association Marocaine Des Arbitres de Handball. Formez-vous aux plus hauts standards avec des certifications reconnues par la FRMHB.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" className="text-sm rounded-lg px-8 h-12" onClick={onRegister}>Commencer la formation<ArrowRight className="ml-2 w-4 h-4" /></Button>
          <Button size="lg" variant="outline" className="text-sm rounded-lg px-8 h-12" onClick={onLogin}>J&apos;ai déjà un compte</Button>
        </div>
        <div className="absolute -top-2 right-4 sm:right-8 lg:right-12 opacity-[0.06] pointer-events-none hidden sm:block">
          <Hand className="w-32 h-32 text-primary" style={{ animation: "handball-spin 40s linear infinite" }} />
        </div>
      </div>
    </section>
  );
}
