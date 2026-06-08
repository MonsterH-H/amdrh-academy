"use client";

import { CircleDot, Hand, Mail, Phone, MapPin } from "lucide-react";
import { useAppStore } from "@/store/app";

export function FooterSection() {
  const { navigate, isAuthenticated } = useAppStore();

  return (
    <footer className="bg-[#0F172A] pt-12 sm:pt-16 pb-6 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <CircleDot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Académie AMDRH</p>
                <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">FRMHB</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Plateforme de formation de l&apos;Association Marocaine Des Arbitres de Handball.
              Partenaire académique officiel de la Fédération Royale Marocaine de Handball.
            </p>
            <div className="flex items-center gap-2 text-blue-500/60">
              <Hand className="w-4 h-4" />
              <span className="text-[10px] font-medium tracking-wider uppercase text-slate-500">
                Le handball en mouvement
              </span>
            </div>
          </div>

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
                  <button
                    className="text-xs text-slate-400 hover:text-blue-400 transition-colors duration-200"
                    onClick={() => isAuthenticated ? navigate(item.view) : navigate("login")}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-xs text-slate-400">
                <Mail className="w-4 h-4 text-blue-500/60 flex-shrink-0" />
                <span>contact@amdrh.ma</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-slate-400">
                <Phone className="w-4 h-4 text-blue-500/60 flex-shrink-0" />
                <span>+212 537 68 00 00</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin className="w-4 h-4 text-blue-500/60 flex-shrink-0" />
                <span>Rabat, Maroc</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            © {new Date().getFullYear()} AMDRH — Partenaire Académique Officiel FRMHB
          </p>
          <p className="text-[11px] text-slate-600">
            Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}
