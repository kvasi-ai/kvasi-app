"use client";
import type { ProgramSeed } from "@/lib/programs-data";
import { STATUSES } from "@/lib/programs-data";
import { TierDot } from "@/components/program/status-pill";
import { Badge } from "@/components/ui/badge";

// Phase-1 placeholder: groups by tier as a stand-in for status (which lives in DB).
// Phase-2 will read real status from program_current_status view.
export function BoardView({ programs, onOpen }: { programs: ProgramSeed[]; onOpen?: (slug: string) => void }) {
  const groups = STATUSES.slice(0, 5).map((s, i) => ({
    ...s,
    items: programs.filter((p) => {
      // Demo grouping until DB is wired:
      if (i === 0) return p.tier === 3 && p.kind === "fund";
      if (i === 1) return p.tier === 3 && p.kind !== "fund";
      if (i === 2) return p.tier === 2;
      if (i === 3) return p.tier === 1 && p.rolling;
      if (i === 4) return p.tier === 1 && !p.rolling;
      return false;
    }),
  }));

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <div className="flex gap-3 min-w-max pb-2">
        {groups.map((g) => (
          <div key={g.value} className="w-[300px] flex-shrink-0">
            <div className="flex items-center justify-between px-1 mb-2">
              <div className="flex items-center gap-2">
                <Badge tone={g.tone as never}>{g.label}</Badge>
                <span className="text-[11px] text-[var(--color-ink-3)] tabular-nums">{g.items.length}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              {g.items.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => onOpen?.(p.slug)}
                  className="w-full text-left rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-2)] p-3 transition-colors hover:border-[var(--color-warm-400)]"
                >
                  <div className="flex items-start gap-2">
                    <TierDot tier={p.tier} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold leading-tight truncate">{p.name}</div>
                      <div className="text-[10.5px] text-[var(--color-ink-3)] mt-0.5 truncate">{p.org}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 flex-wrap">
                    <Badge tone="warm" className="!text-[10px]">{p.kind}</Badge>
                    {p.dilution === "non" && <Badge tone="success" className="!text-[10px]">non-dil</Badge>}
                    {p.visa === "gated" && <Badge tone="warning" className="!text-[10px]">visa</Badge>}
                  </div>
                </button>
              ))}
              {g.items.length === 0 && (
                <div className="rounded-lg border border-dashed border-[var(--color-line)] py-6 text-center text-[11px] text-[var(--color-ink-3)]">empty</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
