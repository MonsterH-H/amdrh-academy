"use client";

import { useAppStore } from "@/store/app";
import { LandingHeader, HeroSection } from "./hero-section";
import { StatsSection } from "./stats-section";
import { FeaturesSection, HowItWorksSection } from "./features-section";
import { TestimonialsSection, TrustSection } from "./testimonials-section";
import { RolesSection, CTASection } from "./roles-section";
import { FooterSection } from "./footer-section";
import { blobKeyframes } from "./hero-section";

// ─── Landing Page ───────────────────────────────────────────────────────────

export function LandingPage() {
  const { navigate } = useAppStore();
  const handleLogin = () => navigate("login");
  const handleRegister = () => navigate("register");

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <style dangerouslySetInnerHTML={{ __html: blobKeyframes }} />
      <LandingHeader onLogin={handleLogin} onRegister={handleRegister} />
      <HeroSection onLogin={handleLogin} onRegister={handleRegister} />
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
