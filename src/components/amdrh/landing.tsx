"use client";

import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  GraduationCap,
  Award,
  Users,
  Shield,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Star,
  UserPlus,
  Compass,
  BadgeCheck,
  Lock,
  Landmark,
  Globe,
  Hand,
} from "lucide-react";

/* ─── Animated gradient blobs keyframes ─── */
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
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
`;

const features = [
  {
    icon: BookOpen,
    title: "Cours Certifiants",
    description: "Formations en arbitrage, entraînement et jeu avec certification officielle AMDRH-FRMHB.",
  },
  {
    icon: GraduationCap,
    title: "Parcours Structurés",
    description: "Learning paths personnalisés selon votre profil : arbitre, entraîneur, joueur ou administrateur.",
  },
  {
    icon: Award,
    title: "Certificats Reconnus",
    description: "Certificats numériques avec code unique AMDRH, reconnus par la Fédération Royale Marocaine.",
  },
  {
    icon: Users,
    title: "Formateurs Experts",
    description: "Formateurs certifiés IHF avec expérience internationale en handball.",
  },
  {
    icon: Shield,
    title: "Standards IHF",
    description: "Contenu conforme aux standards internationaux de l'IHF et de la FRMHB.",
  },
  {
    icon: TrendingUp,
    title: "Suivi de Progression",
    description: "Tableau de bord complet pour suivre votre progression et vos performances.",
  },
];

const stats = [
  { value: "500+", label: "Formés" },
  { value: "20+", label: "Cours" },
  { value: "4", label: "Parcours" },
  { value: "95%", label: "Satisfaction" },
];

const testimonials = [
  {
    name: "Youssef Benali",
    role: "Arbitre National",
    content: "La formation m'a permis de passer le niveau national en un temps record. Les quiz sont très pertinents.",
  },
  {
    name: "Hassan Bennani",
    role: "Entraîneur AS FAR",
    content: "Un outil indispensable pour les entraîneurs. Le contenu est structuré et la certification est reconnue.",
  },
  {
    name: "Fatima El Idrissi",
    role: "Joueuse Internationale",
    content: "La plateforme m'a aidée à perfectionner mes techniques individuelles de manière autonome.",
  },
];

const howItWorksSteps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Créez votre compte",
    description:
      "Inscription rapide et gratuite. Choisissez votre profil parmi arbitre, entraîneur, joueur ou administrateur.",
  },
  {
    step: 2,
    icon: Compass,
    title: "Choisissez votre parcours",
    description:
      "Explorez nos parcours certifiants adaptés à votre niveau et à vos objectifs professionnels dans le handball.",
  },
  {
    step: 3,
    icon: BadgeCheck,
    title: "Obtenez votre certificat",
    description:
      "Validez les modules, passez les quiz et recevez votre certificat reconnu par la FRMHB et l'IHF.",
  },
];

const trustBadges = [
  {
    icon: Landmark,
    title: "Certifié IHF",
    description: "Programme conforme aux standards de l'International Handball Federation",
  },
  {
    icon: Globe,
    title: "Partenaire FRMHB",
    description: "Partenaire académique officiel de la Fédération Royale Marocaine de Handball",
  },
  {
    icon: Lock,
    title: "Données sécurisées",
    description: "Vos données sont protégées et chiffrées selon les normes RGPD",
  },
];

const footerNavItems: { label: string; view: string }[] = [
  { label: "Catalogue Cours", view: "courses" },
  { label: "Parcours Formation", view: "learning-paths" },
  { label: "Certificats", view: "certificates" },
  { label: "Connexion", view: "login" },
];

export function LandingPage() {
  const { navigate } = useAppStore();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <style dangerouslySetInnerHTML={{ __html: blobKeyframes }} />

      {/* ────────────── Header ────────────── */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-border/40 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <CircleDot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-foreground leading-tight">Académie</h1>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">AMDRH</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="hidden sm:flex text-sm"
              onClick={() => navigate("login")}
            >
              Connexion
            </Button>
            <Button className="text-sm rounded-lg" onClick={() => navigate("register")}>
              S&apos;inscrire
            </Button>
          </div>
        </div>
      </header>

      {/* ────────────── Hero Section ────────────── */}
      <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated gradient mesh blobs */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          {/* Blob 1 — primary purple-blue */}
          <div
            className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full opacity-[0.18] blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(99,102,241,0.6) 0%, rgba(59,130,246,0.3) 50%, transparent 70%)",
              animation: "blob-float-1 18s ease-in-out infinite",
            }}
          />
          {/* Blob 2 — teal-green */}
          <div
            className="absolute top-1/3 -right-32 w-[360px] h-[360px] rounded-full opacity-[0.14] blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(20,184,166,0.5) 0%, rgba(16,185,129,0.25) 50%, transparent 70%)",
              animation: "blob-float-2 22s ease-in-out infinite",
            }}
          />
          {/* Blob 3 — amber accent */}
          <div
            className="absolute -bottom-20 left-1/3 w-[300px] h-[300px] rounded-full opacity-[0.12] blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(245,158,11,0.45) 0%, rgba(251,191,36,0.2) 50%, transparent 70%)",
              animation: "blob-float-3 20s ease-in-out infinite",
            }}
          />

          {/* Subtle handball-themed SVG pattern overlay */}
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.03]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="handball-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                {/* Handball ball outline */}
                <circle cx="40" cy="40" r="16" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <path d="M40 24 C44 30, 44 50, 40 56" fill="none" stroke="currentColor" strokeWidth="0.6" />
                <path d="M24 40 C30 36, 50 36, 56 40" fill="none" stroke="currentColor" strokeWidth="0.6" />
                <path d="M40 24 C36 30, 36 50, 40 56" fill="none" stroke="currentColor" strokeWidth="0.6" />
                {/* Court half-line accent */}
                <line x1="0" y1="80" x2="80" y2="80" stroke="currentColor" strokeWidth="0.3" strokeDasharray="4 8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#handball-pattern)" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <Badge className="mb-4 sm:mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-xs font-semibold">
            <Star className="w-3 h-3 mr-1.5 fill-current" />
            Partenaire Académique Officiel FRMHB
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-4 sm:mb-6">
            Formation d&apos;Excellence
            <br />
            <span className="text-primary">au Handball Marocain</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            La plateforme e-learning de l&apos;Association Marocaine Des Arbitres de Handball.
            Formez-vous aux plus hauts standards avec des certifications reconnues par la FRMHB.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="text-sm rounded-lg px-8 h-12"
              onClick={() => navigate("register")}
            >
              Commencer la formation
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-sm rounded-lg px-8 h-12"
              onClick={() => navigate("login")}
            >
              J&apos;ai déjà un compte
            </Button>
          </div>

          {/* Handball ball decorative spinner */}
          <div className="absolute -top-2 right-4 sm:right-8 lg:right-12 opacity-[0.06] pointer-events-none hidden sm:block">
            <Hand
              className="w-32 h-32 text-primary"
              style={{ animation: "handball-spin 40s linear infinite" }}
            />
          </div>
        </div>
      </section>

      {/* ────────────── Stats ────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-border/60 p-6 sm:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────── Features ────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4 text-xs font-semibold">
              Pourquoi AMDRH Academy
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Une formation complète et certifiante
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Tous les outils nécessaires pour progresser dans le handball marocain, de la formation
              initiale à la certification avancée.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={cn(
                    "bg-white rounded-xl p-6 border border-border/60 group",
                    "hover:shadow-lg hover:shadow-primary/[0.06] hover:border-primary/25 hover:-translate-y-1",
                    "transition-all duration-300 ease-out cursor-default"
                  )}
                >
                  <div
                    className={cn(
                      "w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4",
                      "group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-3",
                      "transition-all duration-300 ease-out"
                    )}
                  >
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────── How It Works ────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* Subtle handball court-line decoration */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.025] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="court-lines" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <rect x="10" y="10" width="180" height="180" rx="8" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.5" strokeDasharray="6 4" />
              <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <circle cx="100" cy="100" r="4" fill="currentColor" />
              <path d="M80 10 A30 30 0 0 1 120 10" fill="none" stroke="currentColor" strokeWidth="0.6" />
              <path d="M80 190 A30 30 0 0 0 120 190" fill="none" stroke="currentColor" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#court-lines)" />
        </svg>

        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4 text-xs font-semibold">
              Comment ça marche
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              3 étapes pour obtenir votre certification
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Un processus simple et guidé pour débuter et réussir votre formation handball.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 relative">
            {/* Connecting line (desktop only) */}
            <div
              className="hidden sm:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20"
              aria-hidden="true"
            />

            {howItWorksSteps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className={cn(
                    "relative text-center group",
                    "hover:-translate-y-1 transition-transform duration-300 ease-out"
                  )}
                >
                  {/* Step number circle */}
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center",
                      "bg-gradient-to-br from-primary to-primary/80 text-white shadow-md shadow-primary/20",
                      "group-hover:shadow-lg group-hover:shadow-primary/30 group-hover:scale-105",
                      "transition-all duration-300 ease-out relative z-10"
                    )}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  {/* Step label */}
                  <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-primary/60 mb-2">
                    Étape {item.step}
                  </span>
                  <h3 className="font-bold text-foreground text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────── Roles ────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Un parcours pour chaque profil
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Arbitres",
                color: "bg-blue-500",
                items: ["Règles IHF", "Gestion du jeu", "Techniques", "Éthique"],
              },
              {
                title: "Entraîneurs",
                color: "bg-green-500",
                items: ["Méthodologie", "Préparation physique", "Tactique", "Psychologie"],
              },
              {
                title: "Joueurs",
                color: "bg-amber-500",
                items: ["Techniques", "Règles", "Prévention", "Jeu collectif"],
              },
              {
                title: "Administrateurs",
                color: "bg-purple-500",
                items: ["Gestion club", "Réglementation", "Communication", "Licences"],
              },
            ].map((role) => (
              <div
                key={role.title}
                className="rounded-xl border border-border/60 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out"
              >
                <div className={`w-3 h-3 rounded-full ${role.color} mb-4`} />
                <h3 className="font-bold text-foreground text-lg mb-4">{role.title}</h3>
                <ul className="space-y-2">
                  {role.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────── Testimonials ────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ils témoignent
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-[#FAFAFA] rounded-xl border border-border/60 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-out"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────── Trust & Security ────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Confiance & Sécurité
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Votre réussite et la protection de vos données sont notre priorité.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.title}
                  className={cn(
                    "flex flex-col items-center text-center bg-white rounded-xl border border-border/60 p-6 sm:p-8",
                    "hover:shadow-md hover:-translate-y-1 hover:border-primary/20",
                    "transition-all duration-300 ease-out"
                  )}
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4",
                      "group-hover:bg-primary/20 transition-colors duration-300"
                    )}
                  >
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{badge.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────── CTA ────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center bg-primary rounded-2xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden">
          {/* Subtle handball ball watermark */}
          <div className="absolute top-4 right-4 opacity-[0.08] pointer-events-none" aria-hidden="true">
            <Hand className="w-24 h-24 text-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-4 relative">
            Prêt à commencer votre formation ?
          </h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto relative">
            Rejoignez l&apos;Académie AMDRH et accédez à des formations de qualité reconnues par la
            Fédération.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-blue-50 rounded-lg px-8 h-12 font-semibold relative"
            onClick={() => navigate("register")}
          >
            Créer un compte gratuitement
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* ────────────── Footer ────────────── */}
      <footer className="border-t border-border/60 bg-white py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <CircleDot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm">Académie AMDRH</p>
                  <p className="text-[10px] text-muted-foreground">FRMHB</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Plateforme e-learning de l&apos;Association Marocaine Des Arbitres de Handball.
                Partenaire académique officiel de la Fédération Royale Marocaine de Handball.
              </p>
              {/* Tiny handball decoration */}
              <div className="mt-4 flex items-center gap-2 text-primary/10">
                <Hand className="w-5 h-5" />
                <span className="text-[10px] font-medium tracking-wider uppercase">
                  Le handball en mouvement
                </span>
              </div>
            </div>

            {/* Navigation column — wired to real views */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Navigation</h4>
              <ul className="space-y-2">
                {footerNavItems.map((item) => (
                  <li key={item.label}>
                    <button
                      className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 hover:underline underline-offset-2"
                      onClick={() => navigate(item.view as any)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact column */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Contact</h4>
              <ul className="space-y-2">
                <li className="text-xs text-muted-foreground">contact@amdrh.ma</li>
                <li className="text-xs text-muted-foreground">+212 537 68 00 00</li>
                <li className="text-xs text-muted-foreground">Rabat, Maroc</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Académie AMDRH — Tous droits réservés. Partenaire
              académique officiel FRMHB.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
