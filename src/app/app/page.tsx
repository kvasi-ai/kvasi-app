import { admin } from "@/lib/supabase/admin";
import { Workspace } from "./workspace";
import type { Program } from "@/lib/hooks/use-programs";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const supa = admin();
  const { data, error } = await supa
    .from("programs")
    .select("*, status:program_status(status, changed_at)")
    .order("tier", { ascending: true });

  if (error) {
    return (
      <div className="px-6 py-10 max-w-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-3xl mb-3">Database not ready</h2>
        <pre className="text-[12px] text-[var(--color-error)] bg-[var(--color-error-soft)] p-3 rounded-lg overflow-auto">{error.message}</pre>
        <p className="text-[13px] text-[var(--color-ink-2)] mt-3">
          Run the schema in the Supabase SQL editor, then refresh.
        </p>
      </div>
    );
  }

  type Row = {
    id: string; slug: string; name: string; org: string;
    tier: number; kind: string; dilution: string; visa: string; loc: string;
    amount: string | null; terms: string | null; note: string | null;
    start_date: string | null; end_date: string | null; point_date: string | null;
    rolling: boolean;
    status?: { status: string; changed_at: string }[];
  };

  const programs: Program[] = (data as unknown as Row[] | null ?? []).map((p) => {
    const statuses = p.status ?? [];
    const latest = statuses.sort((a, b) => +new Date(b.changed_at) - +new Date(a.changed_at))[0];
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      org: p.org,
      tier: p.tier as 1 | 2 | 3,
      kind: p.kind,
      dilution: p.dilution,
      visa: p.visa,
      loc: p.loc,
      amount: p.amount,
      terms: p.terms,
      note: p.note ?? "",
      start_date: p.start_date ?? undefined,
      end_date: p.end_date ?? undefined,
      point_date: p.point_date ?? undefined,
      rolling: p.rolling,
      current_status: latest?.status ?? "discovered",
    };
  });

  return <Workspace programs={programs} />;
}
