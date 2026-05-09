"use client";
import type { ProgramSeed } from "@/lib/programs-data";
import { TierDot } from "@/components/program/status-pill";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { AMOUNTS, KINDS } from "@/lib/programs-data";

const amountLabel = (a: string | null) => AMOUNTS.find((x) => x.value === a)?.label ?? "";
const kindLabel = (k: string) => KINDS.find((x) => x.value === k)?.label ?? k;

export function ListView({ programs, onOpen }: { programs: ProgramSeed[]; onOpen?: (slug: string) => void }) {
  const sorted = [...programs].sort((a, b) => {
    const ad = a.point_date ? new Date(a.point_date).getTime() : a.start_date ? new Date(a.start_date).getTime() : Infinity;
    const bd = b.point_date ? new Date(b.point_date).getTime() : b.start_date ? new Date(b.start_date).getTime() : Infinity;
    return ad - bd;
  });

  return (
    <div className="space-y-2">
      {sorted.map((p) => (
        <button
          key={p.slug}
          onClick={() => onOpen?.(p.slug)}
          className="group w-full text-left grid items-center gap-4 rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-2)] px-4 py-3.5 transition-all duration-150 hover:border-[var(--color-warm-400)] hover:translate-x-0.5 hover:shadow-[var(--shadow-1)]"
          style={{ gridTemplateColumns: "16px 1.6fr 1fr 1fr 100px 16px" }}
        >
          <TierDot tier={p.tier} />
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold tracking-tight truncate">{p.name}</div>
            <div className="text-[11.5px] text-[var(--color-ink-3)] truncate">{p.org}</div>
          </div>
          <div className="text-[12px] text-[var(--color-ink-2)] truncate">
            {kindLabel(p.kind)} ·{" "}
            <span className="text-[var(--color-ink-3)]">
              {p.dilution === "non" ? "non-dilutive" : p.dilution === "zero" ? "equity-free" : "equity"}
            </span>
          </div>
          <div className="text-[11.5px] text-[var(--color-ink-3)] tabular-nums">
            {p.rolling ? "Rolling" : p.point_date ? `Due ${new Date(p.point_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : p.start_date ? `${new Date(p.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} window` : "TBD"}
          </div>
          <div>
            {p.amount && (
              <Badge tone="warm" className="!text-[10.5px]">
                {amountLabel(p.amount)}
              </Badge>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-[var(--color-ink-3)] group-hover:text-[var(--color-accent-500)] transition-colors" />
        </button>
      ))}
    </div>
  );
}
