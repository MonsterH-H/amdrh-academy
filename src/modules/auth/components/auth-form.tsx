"use client";

import React from "react";
import { motion } from "framer-motion";
import { CircleDot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app";

/** Reusable AMDRH auth page header with logo */
export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { navigate } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-center mb-8"
    >
      <button
        onClick={() => navigate("landing")}
        className="inline-flex items-center gap-3 mb-6 group"
      >
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow duration-300">
          <CircleDot className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <h1 className="font-bold text-xl text-foreground leading-tight">Académie</h1>
          <p className="text-[10px] text-primary font-semibold tracking-[0.2em] uppercase">
            AMDRH
          </p>
        </div>
      </button>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-foreground"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground mt-1.5"
      >
        {subtitle}
      </motion.p>
    </motion.div>
  );
}

/** Reusable password toggle button */
export function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
    >
      {show ? (
        <EyeOffIcon className="w-4 h-4" />
      ) : (
        <EyeIcon className="w-4 h-4" />
      )}
    </button>
  );
}

/** Reusable error banner */
export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium border border-destructive/10"
    >
      {message}
    </motion.div>
  );
}

/** Reusable loading button content */
export function LoadingButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return loading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      {children}
    </>
  ) : null;
}

/** Reusable auth background pattern (gradient blobs) */
export function AuthBackground() {
  return (
    <div className="absolute inset-0 bg-[#FAFAFA]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-gradient-to-b from-primary/[0.03] to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[400px] rounded-full bg-gradient-to-tr from-primary/[0.02] to-transparent blur-3xl" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-amber-500/[0.02] to-transparent blur-3xl" />
    </div>
  );
}

/** Reusable success state with check icon */
export function AuthSuccessState({
  title,
  message,
  actionLabel,
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="text-center py-6"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
        className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"
      >
        <CheckCircleIcon />
      </motion.div>
      <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-8">{message}</p>
      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={onAction}
            className="w-full h-11 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

/** Framer motion stagger container variants */
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

/** Framer motion stagger item variants */
export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// Inline SVG icons to avoid circular dependency
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}
