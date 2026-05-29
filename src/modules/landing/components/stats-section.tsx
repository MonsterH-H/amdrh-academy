"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 500, suffix: "+", label: "Arbitres Certifiés" },
  { value: 30, suffix: "+", label: "Formations" },
  { value: 12, suffix: "", label: "Régions" },
  { value: 98, suffix: "%", label: "Taux de Réussite" },
];

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

export function StatsSection() {
  return (
    <section id="stats" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gray-900 rounded-2xl p-8 sm:p-12 relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div aria-hidden="true" className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(ellipse at top right, rgba(16,185,129,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(245,158,11,0.1) 0%, transparent 50%)" }} />

          <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Separator lines between stats (desktop) */}
          <div className="hidden sm:block absolute top-1/4 bottom-1/4 left-1/4 right-1/4" aria-hidden="true">
            {[33.33, 66.66].map((pos) => (
              <div
                key={pos}
                className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent"
                style={{ left: `${pos}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
