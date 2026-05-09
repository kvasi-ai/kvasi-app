import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border border-[var(--color-line)] bg-[var(--color-paper-2)] px-1 font-mono text-[10px] font-medium text-[var(--color-ink-3)] dark:bg-[var(--color-warm-900)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
