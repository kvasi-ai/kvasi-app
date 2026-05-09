import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-8 w-full rounded-md border border-[var(--color-line)] bg-[var(--color-paper-2)] px-2.5 text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)] outline-none transition-colors duration-150 focus:border-[var(--color-accent-500)] focus:ring-2 focus:ring-[var(--color-accent-100)] dark:focus:ring-[var(--color-accent-900)]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
