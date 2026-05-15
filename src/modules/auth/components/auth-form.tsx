"use client";

import React from "react";
import { CircleDot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app";

/** Reusable AMDRH auth page header with logo */
export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { navigate } = useAppStore();

  return (
    <div className="text-center mb-8">
      <button
        onClick={() => navigate("landing")}
        className="inline-flex items-center gap-3 mb-6"
      >
        <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
          <CircleDot className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <h1 className="font-bold text-lg text-foreground leading-tight">Académie</h1>
          <p className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
            AMDRH
          </p>
        </div>
      </button>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
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
    <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg font-medium">
      {message}
    </div>
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

// Inline SVG icons to avoid circular dependency
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}
