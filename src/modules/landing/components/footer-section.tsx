"use client";

import { CircleDot, Hand, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { useAppStore, type AppView } from "@/store/app";

// ─── Data ────────────────────────────────────────────────────────────────────

const plateformeLinks: { label: string; view: AppView }[] = [
  { label: "Tableau de bord", view: "dashboard" },
  { label: "Catalogue Cours", view: "courses" },
  { label: "Parcours Formation", view: "learning-paths" },
  { label: "Certificats", view: "certificates" },
];

const formationLinks: { label: string; view: AppView }[] = [
  { label: "Cours d'Arbitrage", view: "courses" },
  { label: "Formation Entraîneurs", view: "courses" },
  { label: "Certification IHF", view: "certificates" },
  { label: "Parcours Avancé", view: "learning-paths" },
];

const federationLinks = [
  { label: "FRMHB Officiel", href: "#" },
  { label: "IHF — Fédération Internationale", href: "#" },
  { label: "Confédération Africaine (CAHB)", href: "#" },
  { label: "Handball Maroc", href: "#" },
];

const socialLinks = [
  { label: "Facebook", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
];

// ─── Footer Section ──────────────────────────────────────────────────────────

export function FooterSection() {
  const { navigate } = useAppStore();

  return (
    <footer className="bg-gray-900 pt-12 sm:pt-16 pb-6 px-4 sm:px-6 lg:px-8 relative">
      {/* Emerald top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
                <CircleDot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Académie AMDRH</p>
                <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">FRMHB</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Plateforme de formation de l&apos;Association Marocaine Des Arbitres de Handball. Partenaire académique officiel de la Fédération Royale Marocaine de Handball.
            </p>
            <div className="flex items-center gap-2 text-emerald-500/60">
              <Hand className="w-4 h-4" />
              <span className="text-[10px] font-medium tracking-wider uppercase text-gray-500">Le handball en mouvement</span>
            </div>
          </div>

          {/* Plateforme */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Plateforme</h4>
            <ul className="space-y-2.5">
              {plateformeLinks.map((item) => (
                <li key={item.label}>
                  <button className="text-xs text-gray-400 hover:text-emerald-400 transition-colors duration-200" onClick={() => navigate(item.view)}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Formation */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Formation</h4>
            <ul className="space-y-2.5">
              {formationLinks.map((item) => (
                <li key={item.label}>
                  <button className="text-xs text-gray-400 hover:text-emerald-400 transition-colors duration-200" onClick={() => navigate(item.view)}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Fédération */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Fédération</h4>
            <ul className="space-y-2.5">
              {federationLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-xs text-gray-400 hover:text-emerald-400 transition-colors duration-200 inline-flex items-center gap-1">
                    {item.label} <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact row */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <h4 className="font-semibold text-sm text-white mb-4">Contact</h4>
          <div className="flex flex-wrap gap-6 sm:gap-8">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Mail className="w-4 h-4 text-emerald-500/60" />
              <span>contact@amdrh.ma</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Phone className="w-4 h-4 text-emerald-500/60" />
              <span>+212 537 68 00 00</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MapPin className="w-4 h-4 text-emerald-500/60" />
              <span>Rabat, Maroc</span>
            </div>
          </div>
        </div>

        {/* Social media */}
        <div className="border-t border-gray-800 pt-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs text-gray-500 font-medium">Suivez-nous</span>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs text-gray-500 hover:text-emerald-400 transition-colors duration-200 border border-gray-700/50 rounded-md px-3 py-1.5 hover:border-emerald-500/30"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} AMDRH — Partenaire Académique Officiel FRMHB
          </p>
          <p className="text-[11px] text-gray-600">
            Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}
