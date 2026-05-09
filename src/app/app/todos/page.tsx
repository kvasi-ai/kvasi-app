import Link from "next/link";
import { admin } from "@/lib/supabase/admin";
import { format } from "date-fns";
import { CircleDashed, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

type TodoRow = {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  created_at: string;
  programs: { name: string; slug: string } | null;
};

export default async function TodosPage() {
  const supa = admin();
  const { data } = await supa
    .from("todos")
    .select("id, title, done, due_date, created_at, programs(name, slug)")
    .order("done", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  const todos = (data ?? []) as unknown as TodoRow[];
  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <div className="px-6 py-6 max-w-[900px]">
      <div className="text-[10.5px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] mb-2">All tasks</div>
      <h1 className="font-[family-name:var(--font-display)] text-[44px] leading-[1.02] tracking-[-0.02em] font-medium mb-2">
        Todos
      </h1>
      <p className="text-[14px] text-[var(--color-ink-2)] mb-8">
        Every action across all programs.{" "}
        <span className="tabular-nums font-semibold">{open.length}</span> open ·{" "}
        <span className="tabular-nums">{done.length}</span> done.
      </p>

      {open.length === 0 && done.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-line)] py-16 text-center">
          <p className="text-[13px] text-[var(--color-ink-3)]">No todos yet. Open any program and add a task.</p>
        </div>
      ) : (
        <>
          {open.length > 0 && (
            <section>
              <h2 className="text-[10.5px] tracking-[0.13em] uppercase text-[var(--color-ink-3)] mb-3 flex items-center gap-2">
                <CircleDashed className="h-3.5 w-3.5" /> Open · {open.length}
              </h2>
              <ul className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] divide-y divide-[var(--color-line)] mb-8">
                {open.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="h-4 w-4 rounded border border-[var(--color-line)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px]">{t.title}</div>
                      {t.programs && (
                        <Link
                          href={`/app/programs?open=${t.programs.slug}`}
                          className="text-[11px] text-[var(--color-ink-3)] hover:text-[var(--color-accent-500)] hover:underline"
                        >
                          {t.programs.name}
                        </Link>
                      )}
                    </div>
                    {t.due_date && (
                      <span className="text-[11px] text-[var(--color-ink-3)] tabular-nums">
                        {format(new Date(t.due_date), "MMM d")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {done.length > 0 && (
            <section>
              <h2 className="text-[10.5px] tracking-[0.13em] uppercase text-[var(--color-ink-3)] mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5" /> Done · {done.length}
              </h2>
              <ul className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] divide-y divide-[var(--color-line)] opacity-60">
                {done.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="h-4 w-4 rounded bg-[var(--color-accent-500)] shrink-0 grid place-items-center">
                      <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M3 8l3.5 3.5L13 4" />
                      </svg>
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] line-through text-[var(--color-ink-3)]">{t.title}</div>
                      {t.programs && (
                        <Link href={`/app/programs?open=${t.programs.slug}`} className="text-[11px] text-[var(--color-ink-3)] hover:underline">
                          {t.programs.name}
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
