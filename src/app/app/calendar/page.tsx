import Link from "next/link";
import { admin } from "@/lib/supabase/admin";
import { TierDot } from "@/components/program/status-pill";
import { addMonths, differenceInCalendarDays, format, isSameMonth, startOfMonth } from "date-fns";

export const dynamic = "force-dynamic";

type ProgramRow = {
  id: string; slug: string; name: string; org: string;
  tier: number; rolling: boolean; priority: boolean | null;
  amount: string | null; terms: string | null;
  point_date: string | null; start_date: string | null; end_date: string | null;
};

export default async function CalendarPage() {
  const supa = admin();
  const { data } = await supa
    .from("programs")
    .select("id, slug, name, org, tier, rolling, priority, amount, terms, point_date, start_date, end_date")
    .order("tier", { ascending: true });

  const programs = (data as unknown as ProgramRow[] | null) ?? [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = startOfMonth(now);
  const months = Array.from({ length: 12 }, (_, i) => addMonths(start, i));

  // Upcoming deadlines: non-rolling programs with a future-or-today date.
  // Sort by: priority first, then nearest deadline, then tier.
  const upcoming = programs
    .filter((p) => !p.rolling)
    .map((p) => {
      const dateStr = p.point_date ?? p.end_date ?? p.start_date;
      if (!dateStr) return null;
      const d = new Date(dateStr);
      if (differenceInCalendarDays(d, todayStart) < 0) return null;
      return { ...p, _date: d };
    })
    .filter((p): p is ProgramRow & { _date: Date } => p !== null)
    .sort((a, b) => {
      if (!!b.priority !== !!a.priority) return (b.priority ? 1 : 0) - (a.priority ? 1 : 0);
      const dd = a._date.getTime() - b._date.getTime();
      if (dd !== 0) return dd;
      return a.tier - b.tier;
    });

  // Rolling: priority-flagged ones surface to the top of the strip.
  const rolling = programs
    .filter((p) => p.rolling)
    .sort((a, b) => {
      if (!!b.priority !== !!a.priority) return (b.priority ? 1 : 0) - (a.priority ? 1 : 0);
      return a.tier - b.tier;
    });

  function eventsForMonth(m: Date) {
    return programs
      .filter((p) => !p.rolling)
      .filter((p) => {
        const date = p.point_date ?? p.start_date;
        return date ? isSameMonth(new Date(date), m) : false;
      })
      .sort((a, b) => {
        if (!!b.priority !== !!a.priority) return (b.priority ? 1 : 0) - (a.priority ? 1 : 0);
        const ad = a.point_date ?? a.start_date ?? "";
        const bd = b.point_date ?? b.start_date ?? "";
        if (ad !== bd) return ad.localeCompare(bd);
        return a.tier - b.tier;
      });
  }

  return (
    <div className="px-6 py-6 max-w-[1600px]">
      <div className="text-[10.5px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] mb-2">12-month view</div>
      <h1 className="font-[family-name:var(--font-display)] text-[44px] leading-[1.02] tracking-[-0.02em] font-medium mb-2">
        Calendar
      </h1>
      <p className="text-[14px] text-[var(--color-ink-2)] mb-8">
        Deadlines + windows across the next year. Priority programs (≥$500K guaranteed funding) bubble to the top.
      </p>

      {/* ── UPCOMING DEADLINES (chronological) ── */}
      <section className="mb-6">
        <div className="flex items-baseline justify-between mb-2.5">
          <div className="text-[10.5px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] font-medium">
            Upcoming deadlines · {upcoming.length}
          </div>
          <div className="text-[10.5px] tracking-[0.13em] uppercase text-[var(--color-ink-3)] flex items-center gap-1.5">
            <PriorityDot /> = $500K+ guaranteed
          </div>
        </div>

        <ul className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] divide-y divide-[var(--color-line)]">
          {upcoming.length === 0 && (
            <li className="px-4 py-3 text-[12px] text-[var(--color-ink-3)] italic">
              No dated deadlines in the next 12 months.
            </li>
          )}
          {upcoming.slice(0, 30).map((p) => {
            const days = differenceInCalendarDays(p._date, todayStart);
            const urgent = days <= 14;
            const verySoon = days <= 30;
            return (
              <li key={p.id}>
                <Link
                  href={`/app/programs?open=${p.slug}`}
                  className="grid grid-cols-[88px_1fr_auto] items-center gap-4 px-4 py-2.5 hover:bg-[var(--color-paper)] transition-colors group"
                >
                  <div className="flex flex-col">
                    <span className="text-[12px] font-semibold tabular-nums text-[var(--color-ink-1)]">
                      {format(p._date, "MMM d")}
                    </span>
                    <span className="text-[10.5px] tabular-nums text-[var(--color-ink-3)]">
                      {format(p._date, "yyyy")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <TierDot tier={p.tier} />
                    {p.priority && <PriorityDot />}
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold leading-tight truncate group-hover:text-[var(--color-accent-500)] transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-[var(--color-ink-3)] truncate">
                        {p.org}{p.terms ? ` · ${p.terms}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] tabular-nums px-2 py-0.5 rounded-full ${
                        urgent
                          ? "bg-[var(--color-accent-100)] text-[var(--color-accent-600)] dark:bg-[var(--color-accent-900)] dark:text-[var(--color-accent-300)]"
                          : verySoon
                          ? "bg-[var(--color-warm-200)] text-[var(--color-ink-2)] dark:bg-[var(--color-warm-800)] dark:text-[var(--color-warm-200)]"
                          : "text-[var(--color-ink-3)]"
                      }`}
                    >
                      {days === 0 ? "today" : days === 1 ? "1 day" : `${days} days`}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── ROLLING (apply anytime) ── */}
      <div className="rounded-xl border border-dashed border-[var(--color-line)] bg-[var(--color-paper-2)] px-4 py-3 mb-6">
        <div className="text-[10.5px] tracking-[0.13em] uppercase text-[var(--color-ink-3)] mb-2 font-medium">
          Rolling — apply anytime · {rolling.length}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {rolling.map((p) => (
            <Link
              key={p.id}
              href={`/app/programs?open=${p.slug}`}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] hover:border-[var(--color-warm-400)] transition-colors ${
                p.priority
                  ? "border-[var(--color-accent-300)] bg-[var(--color-accent-50)] dark:bg-[var(--color-accent-950)] dark:border-[var(--color-accent-700)]"
                  : "border-[var(--color-line)] bg-[var(--color-paper)]"
              }`}
            >
              <TierDot tier={p.tier} />
              {p.priority && <PriorityDot small />}
              {p.name}
            </Link>
          ))}
        </div>
      </div>

      {/* ── 12-MONTH GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {months.map((m) => {
          const events = eventsForMonth(m);
          const isCurrent = isSameMonth(m, new Date());
          return (
            <div
              key={m.toISOString()}
              className={`rounded-xl border bg-[var(--color-paper-2)] p-4 min-h-[160px] ${
                isCurrent ? "border-[var(--color-accent-500)] ring-4 ring-[var(--color-accent-100)] dark:ring-[var(--color-accent-900)]" : "border-[var(--color-line)]"
              }`}
            >
              <h5 className={`flex items-center justify-between text-[11px] tracking-[0.14em] uppercase font-bold mb-2.5 ${isCurrent ? "text-[var(--color-accent-500)]" : "text-[var(--color-ink-3)]"}`}>
                {format(m, "LLLL")}
                <span className="font-medium">{format(m, "yyyy")}</span>
              </h5>
              {events.length === 0 ? (
                <div className="text-[11px] text-[var(--color-ink-3)] italic mt-2">— quiet —</div>
              ) : (
                <ul className="space-y-1.5">
                  {events.map((p) => {
                    const date = p.point_date ?? p.start_date;
                    return (
                      <li key={p.id} className="flex items-start gap-1.5">
                        <TierDot tier={p.tier} />
                        {p.priority && <PriorityDot small />}
                        <Link href={`/app/programs?open=${p.slug}`} className="flex-1 min-w-0 group">
                          <div className="text-[12px] font-semibold leading-tight truncate group-hover:text-[var(--color-accent-500)] transition-colors">{p.name}</div>
                          <div className="text-[10.5px] text-[var(--color-ink-3)]">
                            {p.point_date ? `Due ${format(new Date(p.point_date), "MMM d")}` : date ? `${format(new Date(date), "MMM d")} window` : ""}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PriorityDot({ small = false }: { small?: boolean }) {
  const size = small ? "w-1.5 h-1.5" : "w-2 h-2";
  return (
    <span
      title="≥$500K guaranteed funding on acceptance"
      aria-label="Priority — $500K+ guaranteed funding"
      className={`inline-block ${size} rounded-full bg-[var(--color-accent-500)] shrink-0`}
    />
  );
}
