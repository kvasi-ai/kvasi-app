"use client";
import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { KINDS, AMOUNTS, LOCATIONS } from "@/lib/programs-data";
import type { Program } from "@/lib/hooks/use-programs";
import { TimelineView } from "@/components/views/timeline-view";
import { ListView } from "@/components/views/list-view";
import { BoardView } from "@/components/views/board-view";
import { Button } from "@/components/ui/button";
import { LayoutGrid, ListIcon, GanttChart, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgramDetailSheet, type ProgramDetail } from "@/components/detail/program-detail";

type View = "timeline" | "list" | "board";

const TIERS = [
  { value: "1", label: "Tier 1 · Now",   tone: "accent" as const },
  { value: "2", label: "Tier 2 · Q3",    tone: "warning" as const },
  { value: "3", label: "Tier 3 · Defer", tone: "warm" as const },
];
const DILUTIONS = [
  { value: "non",      label: "Non-dilutive" },
  { value: "dilutive", label: "Equity" },
  { value: "zero",     label: "Equity-free" },
];
const VISAS = [
  { value: "open",  label: "No gate" },
  { value: "gated", label: "US-citizen req." },
];

type ProgramWithMeta = Program & { metadata?: Record<string, unknown> | null };

export function Workspace({ programs }: { programs: ProgramWithMeta[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const [view, setView] = React.useState<View>("timeline");
  const [legendRef] = useAutoAnimate<HTMLDivElement>();

  // open detail panel via ?open=slug query (from sidebar/inbox/today links)
  const openSlug = sp.get("open");

  // sync filter state from query params (from command palette deep-links)
  React.useEffect(() => {
    const next = {
      tier: new Set<string>(),
      kind: new Set<string>(),
      dilution: new Set<string>(),
      visa: new Set<string>(),
      loc: new Set<string>(),
      amount: new Set<string>(),
      status: new Set<string>(),
    };
    (["tier", "kind", "dilution", "visa", "loc", "amount", "status"] as const).forEach((key) => {
      const v = sp.get(key);
      if (v) v.split(",").forEach((x) => next[key].add(x));
    });
    setFilters(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp.toString()]);
  const setOpenSlug = React.useCallback(
    (slug: string | null) => {
      const next = new URLSearchParams(sp.toString());
      if (slug) next.set("open", slug);
      else next.delete("open");
      router.replace(`?${next.toString()}`, { scroll: false });
    },
    [sp, router],
  );

  const [filters, setFilters] = React.useState<{
    tier: Set<string>;
    kind: Set<string>;
    dilution: Set<string>;
    visa: Set<string>;
    loc: Set<string>;
    amount: Set<string>;
    status: Set<string>;
  }>({
    tier: new Set(),
    kind: new Set(),
    dilution: new Set(),
    visa: new Set(),
    loc: new Set(),
    amount: new Set(),
    status: new Set(),
  });

  const toggle = (k: keyof typeof filters, v: string) => {
    setFilters((prev) => {
      const next = { ...prev, [k]: new Set(prev[k]) };
      if (next[k].has(v)) next[k].delete(v);
      else next[k].add(v);
      return next;
    });
  };

  const hasFilters = Object.values(filters).some((s) => s.size > 0);
  const reset = () =>
    setFilters({
      tier: new Set(), kind: new Set(), dilution: new Set(),
      visa: new Set(), loc: new Set(), amount: new Set(), status: new Set(),
    });

  const filtered = React.useMemo(() => {
    return programs.filter((p) => {
      if (filters.tier.size && !filters.tier.has(String(p.tier))) return false;
      if (filters.kind.size && !filters.kind.has(p.kind)) return false;
      if (filters.dilution.size && !filters.dilution.has(p.dilution)) return false;
      if (filters.visa.size && !filters.visa.has(p.visa)) return false;
      if (filters.loc.size && !filters.loc.has(p.loc)) return false;
      if (filters.amount.size && p.amount && !filters.amount.has(p.amount)) return false;
      if (filters.amount.size && !p.amount) return false;
      if (filters.status.size && !filters.status.has(p.current_status ?? "discovered")) return false;
      return true;
    });
  }, [programs, filters]);

  const counts = { 1: 0, 2: 0, 3: 0 } as Record<number, number>;
  filtered.forEach((p) => (counts[p.tier] = (counts[p.tier] ?? 0) + 1));

  const openProgram = React.useMemo(() => {
    if (!openSlug) return null;
    const p = programs.find((x) => x.slug === openSlug);
    if (!p) return null;
    const detail: ProgramDetail = {
      id: p.id,
      slug: p.slug,
      name: p.name,
      org: p.org,
      tier: p.tier,
      kind: p.kind,
      dilution: p.dilution,
      visa: p.visa,
      loc: p.loc,
      amount: p.amount,
      terms: p.terms ?? null,
      note: p.note ?? null,
      start_date: p.start_date ?? null,
      end_date: p.end_date ?? null,
      point_date: p.point_date ?? null,
      rolling: p.rolling,
      metadata: p.metadata ?? null,
      current_status: p.current_status ?? "discovered",
    };
    return detail;
  }, [openSlug, programs]);

  return (
    <div className="px-6 py-6 max-w-[1600px]">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[10.5px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] mb-2">Workspace</div>
          <h1 className="font-[family-name:var(--font-display)] text-[44px] leading-[1.02] tracking-[-0.02em] font-medium">Programs</h1>
          <p className="text-[13px] text-[var(--color-ink-2)] mt-1.5">
            <span className="tabular-nums font-semibold text-[var(--color-ink)]">{filtered.length}</span> of{" "}
            <span className="tabular-nums">{programs.length}</span> programs ·{" "}
            <span className="text-[var(--color-accent-500)]">●</span>{counts[1] ?? 0} now ·{" "}
            <span className="text-[var(--color-warning)]">●</span>{counts[2] ?? 0} Q3 ·{" "}
            <span className="text-[var(--color-ink-3)]">●</span>{counts[3] ?? 0} defer
          </p>
        </div>

        <div className="flex items-center rounded-full border border-[var(--color-line)] bg-[var(--color-paper-2)] p-0.5">
          <ViewBtn current={view} v="timeline" onClick={setView} icon={<GanttChart className="h-3.5 w-3.5" />}>Timeline</ViewBtn>
          <ViewBtn current={view} v="board" onClick={setView} icon={<LayoutGrid className="h-3.5 w-3.5" />}>Board</ViewBtn>
          <ViewBtn current={view} v="list" onClick={setView} icon={<ListIcon className="h-3.5 w-3.5" />}>List</ViewBtn>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-3 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-3)] tracking-[0.04em] uppercase pl-1">
            <Filter className="h-3 w-3" /> Filters
          </span>
          <FilterChips items={TIERS} sel={filters.tier} onToggle={(v) => toggle("tier", v)} />
          <Sep />
          <FilterChips items={KINDS.map((k) => ({ value: k.value, label: k.label }))} sel={filters.kind} onToggle={(v) => toggle("kind", v)} />
          <Sep />
          <FilterChips items={DILUTIONS} sel={filters.dilution} onToggle={(v) => toggle("dilution", v)} />
          <Sep />
          <FilterChips items={VISAS} sel={filters.visa} onToggle={(v) => toggle("visa", v)} />
          <Sep />
          <FilterChips items={LOCATIONS.map((l) => ({ value: l.value, label: l.label }))} sel={filters.loc} onToggle={(v) => toggle("loc", v)} />
          <Sep />
          <FilterChips items={AMOUNTS.map((a) => ({ value: a.value, label: a.label }))} sel={filters.amount} onToggle={(v) => toggle("amount", v)} />
          {hasFilters && (
            <Button size="sm" variant="ghost" onClick={reset} className="ml-auto">
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>
      </div>

      <div ref={legendRef} className="flex items-center gap-5 text-[10.5px] text-[var(--color-ink-3)] mb-3 px-1 flex-wrap">
        <Lg sw="bg-[var(--color-accent-500)]">Tier 1 — apply within 30 days</Lg>
        <Lg sw="bg-[var(--color-warning)]">Tier 2 — apply Q3 2026</Lg>
        <Lg sw="bg-[var(--color-ink-3)]">Tier 3 — deferred</Lg>
        <span className="ml-auto">●  point  ·  ━  window  ·  ▶  rolling</span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-line)] py-20 text-center">
          <p className="text-[14px] text-[var(--color-ink-3)]">No programs match those filters.</p>
          <Button variant="ghost" onClick={reset} className="mt-3">Reset filters</Button>
        </div>
      ) : view === "timeline" ? (
        <TimelineView programs={filtered} onOpen={(slug) => setOpenSlug(slug)} />
      ) : view === "board" ? (
        <BoardView programs={filtered} onOpen={(slug) => setOpenSlug(slug)} />
      ) : (
        <ListView programs={filtered} onOpen={(slug) => setOpenSlug(slug)} />
      )}

      <ProgramDetailSheet open={!!openSlug} onClose={() => setOpenSlug(null)} program={openProgram} />
    </div>
  );
}

function ViewBtn({ current, v, onClick, children, icon }: {
  current: View; v: View; onClick: (v: View) => void; children: React.ReactNode; icon: React.ReactNode;
}) {
  const on = current === v;
  return (
    <button
      onClick={() => onClick(v)}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 h-7 text-[12px] transition-colors",
        on ? "bg-[var(--color-ink)] text-[var(--color-paper)]" : "text-[var(--color-ink-2)] hover:text-[var(--color-ink)]",
      )}
    >
      {icon}{children}
    </button>
  );
}

function FilterChips({ items, sel, onToggle }: {
  items: readonly { value: string; label: string; tone?: "accent" | "warning" | "warm" }[];
  sel: Set<string>;
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {items.map((it) => {
        const on = sel.has(it.value);
        return (
          <button
            key={it.value}
            onClick={() => onToggle(it.value)}
            className={cn(
              "h-6 px-2.5 rounded-full text-[11.5px] border transition-colors leading-none",
              on
                ? it.tone === "accent"
                  ? "bg-[var(--color-accent-500)] text-white border-[var(--color-accent-500)]"
                  : it.tone === "warning"
                    ? "bg-[var(--color-warning)] text-white border-[var(--color-warning)]"
                    : "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
                : "border-[var(--color-line)] text-[var(--color-ink-2)] hover:border-[var(--color-warm-400)] hover:text-[var(--color-ink)]",
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function Sep() { return <span className="w-px h-4 bg-[var(--color-line)]" />; }
function Lg({ sw, children }: { sw: string; children: React.ReactNode }) {
  return <span className="flex items-center gap-1.5"><span className={cn("h-2 w-2 rounded-full", sw)} />{children}</span>;
}
