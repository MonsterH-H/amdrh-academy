"use client";

import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

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

export function LandingPage() {
  const { navigate } = useAppStore();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
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
            <Button variant="ghost" className="hidden sm:flex text-sm" onClick={() => navigate("login")}>
              Connexion
            </Button>
            <Button className="text-sm rounded-lg" onClick={() => navigate("register")}>
              S&apos;inscrire
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
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
            <Button size="lg" className="text-sm rounded-lg px-8 h-12" onClick={() => navigate("register")}>
              Commencer la formation
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-sm rounded-lg px-8 h-12" onClick={() => navigate("login")}>
              J&apos;ai déjà un compte
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
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

      {/* Features */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge variant="secondary" className="mb-4 text-xs font-semibold">Pourquoi AMDRH Academy</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Une formation complète et certifiante
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Tous les outils nécessaires pour progresser dans le handball marocain, de la formation initiale à la certification avancée.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-6 border border-border/60 hover:shadow-md hover:border-primary/20 transition-all duration-200 group"
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors duration-200">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Un parcours pour chaque profil
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Arbitres", color: "bg-blue-500", items: ["Règles IHF", "Gestion du jeu", "Techniques", "Éthique"] },
              { title: "Entraîneurs", color: "bg-green-500", items: ["Méthodologie", "Préparation physique", "Tactique", "Psychologie"] },
              { title: "Joueurs", color: "bg-amber-500", items: ["Techniques", "Règles", "Prévention", "Jeu collectif"] },
              { title: "Administrateurs", color: "bg-purple-500", items: ["Gestion club", "Réglementation", "Communication", "Licences"] },
            ].map((role) => (
              <div key={role.title} className="rounded-xl border border-border/60 p-6 hover:shadow-md transition-all duration-200">
                <div className={`w-3 h-3 rounded-full ${role.color} mb-4`} />
                <h3 className="font-bold text-foreground text-lg mb-4">{role.title}</h3>
                <ul className="space-y-2">
                  {role.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
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

      {/* Testimonials */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ils témoignent
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-xl border border-border/60 p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{t.content}&rdquo;</p>
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center bg-primary rounded-2xl p-8 sm:p-12 lg:p-16 text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Prêt à commencer votre formation ?
          </h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            Rejoignez l&apos;Académie AMDRH et accédez à des formations de qualité reconnues par la Fédération.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-primary hover:bg-blue-50 rounded-lg px-8 h-12 font-semibold"
            onClick={() => navigate("register")}
          >
            Créer un compte gratuitement
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-white py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8 overflow-x-auto">
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
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Navigation</h4>
              <ul className="space-y-2">
                {["Catalogue Cours", "Parcours Formation", "Certificats", "Connexion"].map((item) => (
                  <li key={item}>
                    <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
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
              © 2026 Académie AMDRH — Tous droits réservés. Partenaire académique officiel FRMHB.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
