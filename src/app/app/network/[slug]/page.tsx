import Link from "next/link";
import { notFound } from "next/navigation";
import { admin } from "@/lib/supabase/admin";
import { ENTITY_TYPES, type Entity } from "@/lib/entities";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { EntityDetailClient } from "./detail-client";

export const dynamic = "force-dynamic";

export default async function EntityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supa = admin();

  const { data: entity } = await supa
    .from("entities")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!entity) notFound();
  const e = entity as unknown as Entity;
  const meta = ENTITY_TYPES[e.type];

  // Forward + reverse links — Obsidian's bidirectional model.
  const { data: outgoing } = await supa
    .from("entity_links")
    .select("id, context, to_id, to:entities!entity_links_to_id_fkey(id, slug, name, type, org)")
    .eq("from_id", e.id);
  const { data: incoming } = await supa
    .from("entity_links")
    .select("id, context, from_id, from:entities!entity_links_from_id_fkey(id, slug, name, type, org)")
    .eq("to_id", e.id);

  type LinkRowOut = { id: string; context: string | null; to: { id: string; slug: string; name: string; type: string; org: string | null } };
  type LinkRowIn = { id: string; context: string | null; from: { id: string; slug: string; name: string; type: string; org: string | null } };
  const out = ((outgoing ?? []) as unknown as LinkRowOut[]).filter((r) => r.to);
  const inc = ((incoming ?? []) as unknown as LinkRowIn[]).filter((r) => r.from);

  return (
    <div className="px-6 py-6 max-w-[1400px]">
      <Link
        href="/app/network"
        className="inline-flex items-center gap-1 text-[12px] text-[var(--color-ink-3)] hover:text-[var(--color-ink)] mb-4"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Network
      </Link>

      <div className="flex items-start justify-between gap-6 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] mb-2">
            <span className="h-2 w-2 rounded-full" style={{ background: meta.accent }} />
            {meta.label}
            {e.org && e.org !== e.name && (
              <>
                <span>·</span>
                <span className="normal-case tracking-normal">{e.org}</span>
              </>
            )}
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-[44px] leading-[1.02] tracking-[-0.02em] font-medium">
            {e.name}
          </h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* MAIN */}
        <div className="min-w-0">
          <PropertyTable properties={e.properties} />

          {e.note && (
            <section className="mt-8">
              <h3 className="text-[11px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] font-medium mb-2">Notes</h3>
              <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-4 text-[13px] leading-relaxed whitespace-pre-wrap text-[var(--color-ink-2)]">
                {e.note}
              </div>
            </section>
          )}

          {out.length > 0 && (
            <section className="mt-8">
              <h3 className="text-[11px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] font-medium mb-2">
                References → ({out.length})
              </h3>
              <ul className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] divide-y divide-[var(--color-line)]">
                {out.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/app/network/${r.to.slug}`}
                      className="flex items-center justify-between gap-4 px-4 py-2.5 hover:bg-[var(--color-paper)] transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ background: ENTITY_TYPES[r.to.type as keyof typeof ENTITY_TYPES].accent }}
                        />
                        <span className="text-[13px] font-medium truncate">{r.to.name}</span>
                        {r.context && (
                          <span className="text-[11px] text-[var(--color-ink-3)] italic">— {r.context}</span>
                        )}
                      </div>
                      <span className="text-[10.5px] uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                        {ENTITY_TYPES[r.to.type as keyof typeof ENTITY_TYPES].label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* LOCAL GRAPH — full-width, below references */}
          <section className="mt-8">
            <EntityDetailClient entityId={e.id} slug={e.slug} />
          </section>
        </div>

        {/* SIDEBAR: backlinks (compact, sticky) */}
        <aside>
          <div className="sticky top-4">
            <h3 className="text-[11px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] font-medium mb-2">
              Backlinks ({inc.length})
            </h3>
            {inc.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-line)] px-3 py-6 text-center text-[11px] text-[var(--color-ink-3)] italic">
                No incoming references yet.
              </div>
            ) : (
              <ul className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] divide-y divide-[var(--color-line)] max-h-[70vh] overflow-auto">
                {inc.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/app/network/${r.from.slug}`}
                      className="block px-3 py-2 hover:bg-[var(--color-paper)] transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ background: ENTITY_TYPES[r.from.type as keyof typeof ENTITY_TYPES].accent }}
                        />
                        <div className="text-[12px] font-medium truncate">{r.from.name}</div>
                      </div>
                      {r.from.org && r.from.org !== r.from.name && (
                        <div className="text-[10.5px] text-[var(--color-ink-3)] truncate ml-3">{r.from.org}</div>
                      )}
                      {r.context && (
                        <div className="text-[10px] text-[var(--color-ink-3)] italic ml-3 mt-0.5">{r.context}</div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function PropertyTable({ properties }: { properties: Record<string, unknown> }) {
  const entries = Object.entries(properties ?? {})
    .filter(([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0));
  if (entries.length === 0) return null;
  return (
    <section>
      <h3 className="text-[11px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] font-medium mb-2">Properties</h3>
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] overflow-hidden">
        <dl className="divide-y divide-[var(--color-line)]">
          {entries.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[180px_1fr] gap-4 px-4 py-2.5">
              <dt className="text-[11.5px] uppercase tracking-[0.04em] text-[var(--color-ink-3)] font-medium">{k.replace(/_/g, " ")}</dt>
              <dd className="text-[13px] text-[var(--color-ink)] break-words">
                <PropertyValue v={v} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function PropertyValue({ v }: { v: unknown }) {
  if (typeof v === "boolean") return <span>{v ? "yes" : "no"}</span>;
  if (typeof v === "string") {
    if (/^https?:\/\//.test(v)) {
      return (
        <a href={v} target="_blank" rel="noreferrer" className="text-[var(--color-accent-500)] hover:underline inline-flex items-center gap-1">
          {v} <ExternalLink className="h-3 w-3" />
        </a>
      );
    }
    return <span>{v}</span>;
  }
  if (Array.isArray(v)) {
    return (
      <ul className="space-y-1">
        {v.map((item, i) => (
          <li key={i} className="text-[12.5px]">
            {typeof item === "string" ? item : JSON.stringify(item)}
          </li>
        ))}
      </ul>
    );
  }
  return <span className="font-mono text-[11.5px]">{JSON.stringify(v)}</span>;
}
