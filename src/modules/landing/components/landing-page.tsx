"use client";

import { useAppStore } from "@/store/app";
import { LandingHeader, HeroSection } from "./hero-section";
import { StatsSection } from "./stats-section";
import { FeaturesSection, HowItWorksSection } from "./features-section";
import { TestimonialsSection, TrustSection } from "./testimonials-section";
import { RolesSection, CTASection } from "./roles-section";
import { FooterSection } from "./footer-section";

/* ─── Landing Page ───────────────────────────────────────────────────────── */

export function LandingPage() {
  const { navigate } = useAppStore();
  const handleLogin = () => navigate("login");

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <LandingHeader onLogin={handleLogin} />
      <HeroSection onLogin={handleLogin} />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RolesSection />
      <TestimonialsSection />
      <TrustSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
