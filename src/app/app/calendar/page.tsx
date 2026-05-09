import Link from "next/link";
import { admin } from "@/lib/supabase/admin";
import { TierDot } from "@/components/program/status-pill";
import { addMonths, format, isSameMonth, startOfMonth } from "date-fns";

export const dynamic = "force-dynamic";

type ProgramRow = {
  id: string; slug: string; name: string; org: string;
  tier: number; rolling: boolean;
  point_date: string | null; start_date: string | null; end_date: string | null;
};

export default async function CalendarPage() {
  const supa = admin();
  const { data } = await supa
    .from("programs")
    .select("id, slug, name, org, tier, rolling, point_date, start_date, end_date")
    .order("tier", { ascending: true });

  const programs = (data as unknown as ProgramRow[] | null) ?? [];

  const start = startOfMonth(new Date());
  const months = Array.from({ length: 12 }, (_, i) => addMonths(start, i));

  function eventsForMonth(m: Date) {
    return programs
      .filter((p) => !p.rolling)
      .filter((p) => {
        const date = p.point_date ?? p.start_date;
        return date ? isSameMonth(new Date(date), m) : false;
      });
  }

  const rolling = programs.filter((p) => p.rolling);

  return (
    <div className="px-6 py-6 max-w-[1600px]">
      <div className="text-[10.5px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] mb-2">12-month view</div>
      <h1 className="font-[family-name:var(--font-display)] text-[44px] leading-[1.02] tracking-[-0.02em] font-medium mb-2">
        Calendar
      </h1>
      <p className="text-[14px] text-[var(--color-ink-2)] mb-8">
        Deadlines + windows across the next year. Rolling programs in the strip below.
      </p>

      <div className="rounded-xl border border-dashed border-[var(--color-line)] bg-[var(--color-paper-2)] px-4 py-3 mb-6">
        <div className="text-[10.5px] tracking-[0.13em] uppercase text-[var(--color-ink-3)] mb-2 font-medium">
          Rolling — apply anytime · {rolling.length}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {rolling.map((p) => (
            <Link
              key={p.id}
              href={`/app/programs?open=${p.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] px-2.5 py-1 text-[11.5px] hover:border-[var(--color-warm-400)] transition-colors"
            >
              <TierDot tier={p.tier} />
              {p.name}
            </Link>
          ))}
        </div>
      </div>

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
