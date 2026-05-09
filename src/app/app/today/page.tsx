import Link from "next/link";
import { admin } from "@/lib/supabase/admin";
import { TierDot } from "@/components/program/status-pill";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { differenceInDays, format } from "date-fns";

export const dynamic = "force-dynamic";

type ProgramRow = {
  id: string; slug: string; name: string; org: string;
  tier: number; kind: string; rolling: boolean;
  point_date: string | null; start_date: string | null; end_date: string | null;
  status?: { status: string; changed_at: string }[];
};

export default async function TodayPage() {
  const supa = admin();

  const [{ data: programsData }, { data: todosData }] = await Promise.all([
    supa.from("programs").select("*, status:program_status(status, changed_at)").order("tier"),
    supa
      .from("todos")
      .select("id, title, due_date, done, program_id, programs(name, slug)")
      .eq("done", false)
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(8),
  ]);

  const programs = (programsData as unknown as ProgramRow[] | null) ?? [];
  const todos = (todosData ?? []) as unknown as {
    id: string;
    title: string;
    due_date: string | null;
    program_id: string;
    programs: { name: string; slug: string };
  }[];

  const now = new Date();

  // upcoming deadlines (next 30 days)
  const upcoming = programs
    .filter((p) => p.point_date && new Date(p.point_date) >= now)
    .map((p) => ({ ...p, days: differenceInDays(new Date(p.point_date!), now) }))
    .filter((p) => p.days <= 60)
    .sort((a, b) => a.days - b.days);

  // tier 1 + rolling — what to chase now
  const chaseNow = programs.filter((p) => p.tier === 1 && p.rolling).slice(0, 6);

  // status counts
  const statusCounts: Record<string, number> = {};
  programs.forEach((p) => {
    const latest = p.status?.sort((a, b) => +new Date(b.changed_at) - +new Date(a.changed_at))[0];
    const s = latest?.status ?? "discovered";
    statusCounts[s] = (statusCounts[s] ?? 0) + 1;
  });

  return (
    <div className="px-6 py-6 max-w-[1200px]">
      <div className="text-[10.5px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] mb-2">
        {format(now, "EEEE, MMMM d")}
      </div>
      <h1 className="font-[family-name:var(--font-display)] text-[44px] leading-[1.02] tracking-[-0.02em] font-medium mb-2">
        Today
      </h1>
      <p className="text-[14px] text-[var(--color-ink-2)] mb-8">
        What KVASI's founding team is chasing right now.
      </p>

      {/* status snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-10">
        {[
          { k: "applied", label: "Applied", tone: "accent" },
          { k: "interviewing", label: "Interviewing", tone: "accent" },
          { k: "preparing", label: "Preparing", tone: "info" },
          { k: "researching", label: "Researching", tone: "warm" },
          { k: "discovered", label: "Discovered", tone: "warm" },
        ].map(({ k, label, tone }) => (
          <div
            key={k}
            className="rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-2)] px-4 py-3"
          >
            <div className="text-[10.5px] tracking-[0.06em] uppercase text-[var(--color-ink-3)]">{label}</div>
            <div className="mt-1 text-[24px] font-semibold tabular-nums tracking-tight">{statusCounts[k] ?? 0}</div>
            <Badge tone={tone as never} className="!text-[10px] mt-1.5">{k}</Badge>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* upcoming deadlines */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[family-name:var(--font-display)] text-[20px] tracking-tight">Upcoming deadlines</h2>
            <span className="text-[11px] text-[var(--color-ink-3)] tabular-nums">{upcoming.length}</span>
          </div>
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] divide-y divide-[var(--color-line)]">
            {upcoming.length === 0 ? (
              <div className="px-4 py-8 text-center text-[12px] text-[var(--color-ink-3)]">
                No deadlines in the next 60 days.
              </div>
            ) : (
              upcoming.map((p) => (
                <Link
                  key={p.id}
                  href={`/app/programs?open=${p.slug}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-warm-100)] dark:hover:bg-[var(--color-warm-800)] transition-colors"
                >
                  <TierDot tier={p.tier} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate">{p.name}</div>
                    <div className="text-[11px] text-[var(--color-ink-3)]">{p.org}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] tabular-nums">{format(new Date(p.point_date!), "MMM d")}</div>
                    <div className={`text-[10.5px] ${p.days <= 7 ? "text-[var(--color-accent-500)]" : p.days <= 14 ? "text-[var(--color-warning)]" : "text-[var(--color-ink-3)]"}`}>
                      in {p.days}d
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* tier-1 rolling — chase now */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[family-name:var(--font-display)] text-[20px] tracking-tight inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--color-accent-500)]" /> Apply now (rolling, Tier 1)
            </h2>
            <span className="text-[11px] text-[var(--color-ink-3)] tabular-nums">{chaseNow.length}</span>
          </div>
          <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] divide-y divide-[var(--color-line)]">
            {chaseNow.map((p) => (
              <Link
                key={p.id}
                href={`/app/programs?open=${p.slug}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-warm-100)] dark:hover:bg-[var(--color-warm-800)] transition-colors"
              >
                <TierDot tier={p.tier} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate">{p.name}</div>
                  <div className="text-[11px] text-[var(--color-ink-3)]">{p.org} · {p.kind}</div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[var(--color-ink-3)]" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* my open todos */}
      {todos.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-[family-name:var(--font-display)] text-[20px] tracking-tight">Open todos</h2>
            <Link href="/app/todos" className="text-[11.5px] text-[var(--color-ink-3)] hover:text-[var(--color-ink)]">
              See all →
            </Link>
          </div>
          <ul className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] divide-y divide-[var(--color-line)]">
            {todos.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="h-3.5 w-3.5 rounded border border-[var(--color-line)]" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] truncate">{t.title}</div>
                  <Link href={`/app/programs?open=${t.programs.slug}`} className="text-[11px] text-[var(--color-ink-3)] hover:underline">
                    {t.programs.name}
                  </Link>
                </div>
                {t.due_date && (
                  <span className="text-[11px] text-[var(--color-ink-3)] tabular-nums">{format(new Date(t.due_date), "MMM d")}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
