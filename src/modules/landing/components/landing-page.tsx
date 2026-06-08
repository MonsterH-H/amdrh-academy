"use client";

import { useAppStore } from "@/store/app";
import { LandingHeader, HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { RolesSection } from "./roles-section";
import { FooterSection } from "./footer-section";

export function LandingPage() {
  const { navigate } = useAppStore();
  const handleLogin = () => navigate("login");

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      <LandingHeader onLogin={handleLogin} />
      <HeroSection onLogin={handleLogin} />
      <FeaturesSection />
      <RolesSection />
      <FooterSection />
    </div>
  );
}
