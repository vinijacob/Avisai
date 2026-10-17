"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "outline" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-bg hover:opacity-90",
  ghost: "text-ink hover:bg-surface-2",
  outline: "border border-line bg-surface text-ink hover:bg-surface-2",
  danger: "bg-danger text-white hover:opacity-90",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
};

export function Button({ variant = "primary", loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

const fieldClass =
  "w-full rounded-2xl border border-line bg-surface px-4 text-[15px] text-ink outline-none transition placeholder:text-muted/70 focus:border-ink/40 focus:ring-4 focus:ring-accent/40";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClass, "min-h-32 resize-y py-3 leading-relaxed", className)} {...props} />;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-baseline justify-between text-sm font-medium">
        {label}
        {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs font-semibold text-accent-ink",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-surface-2", className)} />;
}
