import { Badge } from "@/components/ui/badge";
import { STATUSES } from "@/lib/programs-data";

export function StatusPill({ value }: { value: string }) {
  const s = STATUSES.find((x) => x.value === value) ?? STATUSES[0];
  return (
    <Badge tone={s.tone as never}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </Badge>
  );
}

export function TierDot({ tier }: { tier: number }) {
  const cls =
    tier === 1
      ? "bg-[var(--color-accent-500)]"
      : tier === 2
        ? "bg-[var(--color-warning)]"
        : "bg-[var(--color-ink-3)]";
  return <span className={`inline-block h-1.5 w-1.5 rounded-full shrink-0 ${cls}`} />;
}
