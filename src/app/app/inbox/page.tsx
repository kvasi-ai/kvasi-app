import Link from "next/link";
import { admin } from "@/lib/supabase/admin";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Activity, Clock, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  programs: { name: string; slug: string } | null;
};

type StatusRow = {
  id: string;
  status: string;
  changed_at: string;
  programs: { name: string; slug: string } | null;
};

export default async function InboxPage() {
  const supa = admin();
  const [{ data: commentsData }, { data: statusesData }] = await Promise.all([
    supa
      .from("comments")
      .select("id, body, created_at, programs(name, slug)")
      .order("created_at", { ascending: false })
      .limit(20),
    supa
      .from("program_status")
      .select("id, status, changed_at, programs(name, slug)")
      .order("changed_at", { ascending: false })
      .limit(20),
  ]);

  const comments = (commentsData ?? []) as unknown as CommentRow[];
  const statuses = (statusesData ?? []) as unknown as StatusRow[];

  type Item = {
    type: "comment" | "status";
    at: string;
    id: string;
    body: string;
    programs: { name: string; slug: string } | null;
  };
  const items: Item[] = [
    ...comments.map((c): Item => ({ type: "comment", at: c.created_at, id: c.id, body: c.body, programs: c.programs })),
    ...statuses.map((s): Item => ({ type: "status", at: s.changed_at, id: s.id, body: s.status, programs: s.programs })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at));

  return (
    <div className="px-6 py-6 max-w-[820px]">
      <div className="text-[10.5px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] mb-2">Activity feed</div>
      <h1 className="font-[family-name:var(--font-display)] text-[44px] leading-[1.02] tracking-[-0.02em] font-medium mb-2">
        Inbox
      </h1>
      <p className="text-[14px] text-[var(--color-ink-2)] mb-8">
        Every comment + status change across all programs, newest first.
      </p>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-line)] py-16 text-center">
          <p className="text-[13px] text-[var(--color-ink-3)]">Nothing here yet. As you work on programs, every status change and comment shows up here.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li
              key={`${it.type}-${it.id}`}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-4"
            >
              <div className="flex items-start gap-3">
                <div className={`grid h-7 w-7 place-items-center rounded-full ${it.type === "comment" ? "bg-[var(--color-info-soft)] text-[var(--color-info)]" : "bg-[var(--color-accent-100)] text-[var(--color-accent-700)]"} shrink-0`}>
                  {it.type === "comment" ? <MessageSquare className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px]">
                    {it.type === "comment" ? (
                      <span>New comment on <strong>{it.programs?.name ?? "—"}</strong></span>
                    ) : (
                      <span>
                        Status of <strong>{it.programs?.name ?? "—"}</strong> changed to{" "}
                        <span className="rounded-full bg-[var(--color-warm-100)] dark:bg-[var(--color-warm-800)] px-1.5 py-0.5 text-[10.5px]">{it.body}</span>
                      </span>
                    )}
                  </div>
                  {it.type === "comment" && (
                    <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--color-ink-2)]">
                      “{it.body.length > 200 ? it.body.slice(0, 200) + "…" : it.body}”
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-[10.5px] text-[var(--color-ink-3)]">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(it.at), { addSuffix: true })}
                    {it.programs && (
                      <Link href={`/app/programs?open=${it.programs.slug}`} className="ml-auto inline-flex items-center gap-1 hover:text-[var(--color-accent-500)]">
                        Open <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
