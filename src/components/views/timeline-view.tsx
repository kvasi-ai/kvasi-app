"use client";
import * as React from "react";
import type { ProgramSeed } from "@/lib/programs-data";
import { TierDot } from "@/components/program/status-pill";
import { cn } from "@/lib/utils";

const TL_START = new Date("2026-05-01");
const TL_END = new Date("2027-09-30");
const TODAY = new Date();

function monthsBetween(a: Date, b: Date) {
  const out: Date[] = [];
  const cur = new Date(a.getFullYear(), a.getMonth(), 1);
  while (cur <= b) {
    out.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return out;
}

const MONTHS = monthsBetween(TL_START, TL_END);
const TOTAL_DAYS = (TL_END.getTime() - TL_START.getTime()) / 86_400_000;
const dayPct = (d: Date | string) => {
  const t = new Date(d).getTime();
  const off = Math.max(0, Math.min(TOTAL_DAYS, (t - TL_START.getTime()) / 86_400_000));
  return (off / TOTAL_DAYS) * 100;
};

export function TimelineView({ programs, onOpen }: { programs: ProgramSeed[]; onOpen?: (slug: string) => void }) {
  const todayPct = dayPct(TODAY);

  return (
    <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-2)] shadow-[var(--shadow-1)]">
      <div className="overflow-x-auto" style={{ overflowY: "visible" }}>
        <div
          className="grid min-w-[1100px]"
          style={{ gridTemplateColumns: "240px 1fr" }}
        >
          {/* months header — sticky to <main>'s scroll */}
          <div className="sticky top-0 z-20 bg-[var(--color-paper-2)] border-b border-[var(--color-line)]" />
          <div className="sticky top-0 z-20 grid border-b border-[var(--color-line)] bg-[var(--color-paper-2)]" style={{ gridTemplateColumns: `repeat(${MONTHS.length}, minmax(0,1fr))` }}>
            {MONTHS.map((m, i) => {
              const isQ = m.getMonth() % 3 === 0;
              const lbl =
                m.getMonth() === 0 ? <b>{m.getFullYear()}</b> : m.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
              return (
                <div
                  key={i}
                  className={cn(
                    "border-l border-[var(--color-line)] py-2 px-2.5 text-[10.5px] uppercase tracking-[0.12em]",
                    isQ ? "bg-[var(--color-warm-50)] dark:bg-[var(--color-warm-900)]" : "",
                    "text-[var(--color-ink-3)]",
                  )}
                >
                  {typeof lbl === "string" ? lbl : <span className="text-[var(--color-ink)] font-semibold">{lbl}</span>}
                </div>
              );
            })}
          </div>

          {/* rows */}
          {programs.map((p) => {
            const isRolling = p.rolling;
            let bar: React.ReactNode = null;
            if (isRolling) {
              bar = (
                <div
                  className="absolute top-3 bottom-3 flex items-center px-2.5 text-[11px] font-semibold text-white rounded-l-full overflow-hidden whitespace-nowrap text-ellipsis"
                  style={{
                    left: `${todayPct}%`,
                    right: 0,
                    background:
                      p.tier === 1
                        ? "linear-gradient(90deg, var(--color-accent-500) 0%, var(--color-accent-500) 50%, transparent 100%)"
                        : p.tier === 2
                          ? "linear-gradient(90deg, var(--color-warning) 0%, var(--color-warning) 50%, transparent 100%)"
                          : "linear-gradient(90deg, var(--color-ink-3) 0%, var(--color-ink-3) 50%, transparent 100%)",
                  }}
                >
                  {p.name}
                </div>
              );
            } else if (p.start_date && p.end_date) {
              const left = dayPct(p.start_date);
              const width = Math.max(2, dayPct(p.end_date) - left);
              bar = (
                <div
                  className={cn(
                    "absolute top-3 bottom-3 rounded-full px-2.5 flex items-center text-[11px] font-semibold text-white whitespace-nowrap text-ellipsis overflow-hidden cursor-pointer transition-transform hover:-translate-y-px hover:shadow-[var(--shadow-2)]",
                    p.tier === 1 ? "bg-[var(--color-accent-500)]" : p.tier === 2 ? "bg-[var(--color-warning)]" : "bg-[var(--color-ink-3)]",
                  )}
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  {p.name}
                </div>
              );
            } else if (p.point_date) {
              bar = (
                <div
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full border-2 border-[var(--color-paper-2)]",
                    p.tier === 1
                      ? "bg-[var(--color-accent-500)] ring-1 ring-[var(--color-accent-500)]"
                      : "bg-[var(--color-ink)] ring-1 ring-[var(--color-ink)]",
                  )}
                  style={{ left: `calc(${dayPct(p.point_date)}% - 7px)` }}
                  title={p.name}
                />
              );
            }

            return (
              <React.Fragment key={p.slug}>
                <button
                  onClick={() => onOpen?.(p.slug)}
                  className="flex flex-col items-start gap-0.5 border-t border-[var(--color-line)] border-r px-3 py-2.5 text-left bg-[var(--color-paper-2)] sticky left-0 z-[1] hover:bg-[var(--color-warm-50)] dark:hover:bg-[var(--color-warm-900)] transition-colors"
                >
                  <div className="text-[12.5px] font-semibold tracking-tight">{p.name}</div>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-[var(--color-ink-3)]">
                    <TierDot tier={p.tier} />
                    {p.org} · {p.kind}
                  </div>
                </button>

                <div
                  className="relative h-12 border-t border-[var(--color-line)] grid"
                  style={{ gridTemplateColumns: `repeat(${MONTHS.length}, minmax(0,1fr))` }}
                  onClick={() => onOpen?.(p.slug)}
                >
                  {MONTHS.map((_, i) => (
                    <div key={i} className="border-l border-[var(--color-line)]" />
                  ))}
                  <div
                    className="absolute top-0 bottom-0 border-l-2 border-dashed border-[var(--color-accent-500)] z-[3]"
                    style={{ left: `${todayPct}%` }}
                  />
                  {bar}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
