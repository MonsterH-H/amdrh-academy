"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, GraduationCap, MapPin, TrendingUp } from "lucide-react";

/* ─── Data ────────────────────────────────────────────────────────────────── */

const stats = [
  { value: 500, suffix: "+", label: "Arbitres Certifiés", icon: Users },
  { value: 30, suffix: "+", label: "Formations", icon: GraduationCap },
  { value: 12, suffix: "", label: "Régions", icon: MapPin },
  { value: 98, suffix: "%", label: "Taux de Réussite", icon: TrendingUp },
];

/* ─── Animated Counter ────────────────────────────────────────────────────── */

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ─── Stats Section ───────────────────────────────────────────────────────── */

export function StatsSection() {
  return (
    <section id="stats" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            AMDRH Academy en chiffres
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">
            Des résultats concrets qui témoignent de notre engagement envers l&apos;excellence.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="relative bg-white rounded-xl border border-gray-200 p-5 sm:p-6 text-center group hover:shadow-lg hover:shadow-blue-500/[0.06] hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="absolute top-0 left-4 right-4 h-0.5 bg-blue-600 rounded-b-full" />
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mx-auto mb-3 border border-blue-100">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-blue-600 mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
