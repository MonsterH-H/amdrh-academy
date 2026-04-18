import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Académie AMDRH — Formation Handball",
  description: "Plateforme e-learning de l'Académie AMDRH, partenaire académique officiel de la FRMHB. Formation pour arbitres, entraîneurs et joueurs de handball.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${inter.variable} antialiased bg-[#FAFAFA]`}
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
