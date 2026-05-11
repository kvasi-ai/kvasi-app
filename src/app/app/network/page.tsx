import { admin } from "@/lib/supabase/admin";
import { NetworkClient } from "./network-client";
import type { Entity } from "@/lib/entities";

export const dynamic = "force-dynamic";

export default async function NetworkPage() {
  const supa = admin();
  const { data, error } = await supa
    .from("entities")
    .select("*")
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="px-6 py-10 max-w-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-3xl mb-3">Network not ready</h2>
        <pre className="text-[12px] text-[var(--color-error)] bg-[var(--color-error-soft)] p-3 rounded-lg overflow-auto whitespace-pre-wrap">
          {error.message}
        </pre>
        <p className="text-[13px] text-[var(--color-ink-2)] mt-3">
          Apply <code className="font-mono">db/migrations/003_entities.sql</code> in the Supabase SQL editor,
          then run <code className="font-mono">node scripts/ingest-entities.mjs</code> from{" "}
          <code className="font-mono">D:\KVASI\app</code>.
        </p>
      </div>
    );
  }

  const entities = (data ?? []) as unknown as Entity[];
  return <NetworkClient entities={entities} />;
}
