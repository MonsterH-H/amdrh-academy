"use client";

import { CircleDot, Hand } from "lucide-react";
import { useAppStore, type AppView } from "@/store/app";

// ─── Data ────────────────────────────────────────────────────────────────────

const footerNavItems: { label: string; view: AppView }[] = [
  { label: "Catalogue Cours", view: "courses" },
  { label: "Parcours Formation", view: "learning-paths" },
  { label: "Certificats", view: "certificates" },
  { label: "Connexion", view: "login" },
];

// ─── Footer Section ──────────────────────────────────────────────────────────

export function FooterSection() {
  const { navigate } = useAppStore();

  return (
    <footer className="border-t border-border/60 bg-white py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><CircleDot className="w-4 h-4 text-white" /></div>
              <div><p className="font-bold text-sm">Académie AMDRH</p><p className="text-[10px] text-muted-foreground">FRMHB</p></div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Plateforme e-learning de l&apos;Association Marocaine Des Arbitres de Handball. Partenaire académique officiel de la Fédération Royale Marocaine de Handball.
            </p>
            <div className="mt-4 flex items-center gap-2 text-primary/10">
              <Hand className="w-5 h-5" /><span className="text-[10px] font-medium tracking-wider uppercase">Le handball en mouvement</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Navigation</h4>
            <ul className="space-y-2">
              {footerNavItems.map((item) => (
                <li key={item.label}>
                  <button className="text-xs text-muted-foreground hover:text-primary transition-colors duration-200 hover:underline underline-offset-2" onClick={() => navigate(item.view)}>{item.label}</button>
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
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Académie AMDRH — Tous droits réservés. Partenaire académique officiel FRMHB.</p>
        </div>
      </div>
    </footer>
  );
}
