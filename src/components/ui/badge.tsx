import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "warm" | "accent" | "success" | "warning" | "error" | "info";

const toneClass: Record<Tone, string> = {
  warm:    "bg-[var(--color-warm-150)] text-[var(--color-ink-2)] dark:bg-[var(--color-warm-800)] dark:text-[var(--color-ink-2)]",
  accent:  "bg-[var(--color-accent-100)] text-[var(--color-accent-700)] dark:bg-[var(--color-accent-900)] dark:text-[var(--color-accent-200)]",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  error:   "bg-[var(--color-error-soft)] text-[var(--color-error)]",
  info:    "bg-[var(--color-info-soft)] text-[var(--color-info)]",
};

export function Badge({
  tone = "warm",
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none",
        toneClass[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
