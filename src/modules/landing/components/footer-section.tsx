"use client";

import { CircleDot, Hand, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { useAppStore } from "@/store/app";

// ─── Footer Section ──────────────────────────────────────────────────────────

export function FooterSection() {
  const { navigate } = useAppStore();

  return (
    <footer className="bg-gray-900 pt-12 sm:pt-16 pb-6 px-4 sm:px-6 lg:px-8">
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

          {/* Liens utiles */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Liens Utiles</h4>
            <ul className="space-y-2.5">
              {[
                { label: "FRMHB Officiel", href: "#" },
                { label: "IHF — Fédération Internationale", href: "#" },
                { label: "Confédération Africaine (CAHB)", href: "#" },
                { label: "Handball Maroc", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="text-xs text-gray-400 hover:text-emerald-400 transition-colors duration-200 inline-flex items-center gap-1">
                    {item.label} <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Formations */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Formations</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Arbitrage", view: "courses" as const },
                { label: "Entraînement", view: "courses" as const },
                { label: "Certifications", view: "certificates" as const },
                { label: "Parcours", view: "learning-paths" as const },
              ].map((item) => (
                <li key={item.label}>
                  <button className="text-xs text-gray-400 hover:text-emerald-400 transition-colors duration-200" onClick={() => navigate(item.view)}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-xs text-gray-400">
                <Mail className="w-4 h-4 text-emerald-500/60 flex-shrink-0" />
                <span>contact@amdrh.ma</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-gray-400">
                <Phone className="w-4 h-4 text-emerald-500/60 flex-shrink-0" />
                <span>+212 537 68 00 00</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin className="w-4 h-4 text-emerald-500/60 flex-shrink-0" />
                <span>Rabat, Maroc</span>
              </li>
            </ul>
            {/* Social links */}
            <div className="flex items-center gap-2 mt-5">
              {["Facebook", "Instagram", "YouTube"].map((label) => (
                <a
                  key={label}
                  href="#"
                  className="text-[10px] text-gray-500 hover:text-emerald-400 transition-colors duration-200 border border-gray-700/50 rounded-md px-2.5 py-1 hover:border-emerald-500/30"
                >
                  {label}
                </a>
              ))}
            </div>
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
