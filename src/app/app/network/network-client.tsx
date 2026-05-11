"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Filter, Search, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type Entity, type EntityType, ENTITY_TYPES, getProp } from "@/lib/entities";

const TYPES: EntityType[] = ["investor", "angel", "company", "contact", "program"];

export function NetworkClient({ entities }: { entities: Entity[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const [legendRef] = useAutoAnimate<HTMLDivElement>();

  // URL-synced state — every change survives reload + is deep-linkable.
  const selectedTypes = React.useMemo(() => {
    const v = sp.get("type");
    return v ? new Set(v.split(",") as EntityType[]) : new Set<EntityType>();
  }, [sp]);
  const search = sp.get("q") ?? "";
  const groupBy = (sp.get("group") as "type" | "org" | null) ?? "type";

  const patch = React.useCallback(
    (next: Record<string, string | null>) => {
      const p = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(next)) {
        if (v == null || v === "") p.delete(k);
        else p.set(k, v);
      }
      const qs = p.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [sp, router],
  );

  const toggleType = (t: EntityType) => {
    const next = new Set(selectedTypes);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    patch({ type: next.size ? Array.from(next).join(",") : null });
  };

  // Filter pipeline ─────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    let rows = entities;
    if (selectedTypes.size) rows = rows.filter((e) => selectedTypes.has(e.type));
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((e) => {
        if (e.name.toLowerCase().includes(q)) return true;
        if (e.org?.toLowerCase().includes(q)) return true;
        if (e.note?.toLowerCase().includes(q)) return true;
        const propStr = JSON.stringify(e.properties).toLowerCase();
        return propStr.includes(q);
      });
    }
    return rows;
  }, [entities, selectedTypes, search]);

  // Counts per type for the filter strip
  const counts = React.useMemo(() => {
    const c: Record<EntityType, number> = { investor: 0, angel: 0, company: 0, contact: 0, program: 0 };
    for (const e of entities) c[e.type]++;
    return c;
  }, [entities]);

  // Group rows for display
  const groups = React.useMemo(() => {
    const map = new Map<string, Entity[]>();
    for (const e of filtered) {
      const key = groupBy === "org" ? (e.org ?? "—") : ENTITY_TYPES[e.type].label;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, groupBy]);

  return (
    <div className="px-6 py-6 max-w-[1600px]">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-[10.5px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] mb-2">
            Workspace
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-[44px] leading-[1.02] tracking-[-0.02em] font-medium">
            Network
          </h1>
          <p className="text-[13px] text-[var(--color-ink-2)] mt-1.5">
            <span className="tabular-nums font-semibold text-[var(--color-ink)]">{filtered.length}</span> of{" "}
            <span className="tabular-nums">{entities.length}</span> entities · investors, angels, companies, contacts, programs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={groupBy === "type" ? "accent" : "ghost"}
            onClick={() => patch({ group: groupBy === "type" ? "org" : null })}
          >
            Group by {groupBy === "type" ? "type" : "org"}
          </Button>
        </div>
      </div>

      {/* search + filter rail */}
      <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-3 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-ink-3)]" />
            <Input
              value={search}
              onChange={(e) => patch({ q: e.target.value || null })}
              placeholder="Search name, org, properties…"
              className="pl-8 h-8 text-[12.5px]"
            />
            {search && (
              <button
                onClick={() => patch({ q: null })}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 grid place-items-center text-[var(--color-ink-3)] hover:text-[var(--color-ink)]"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <Sep />
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-3)] tracking-[0.04em] uppercase pl-1">
            <Filter className="h-3 w-3" /> Types
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {TYPES.map((t) => {
              const meta = ENTITY_TYPES[t];
              const on = selectedTypes.has(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={cn(
                    "h-6 px-2.5 rounded-full text-[11.5px] border transition-colors leading-none flex items-center gap-1.5",
                    on
                      ? "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
                      : "border-[var(--color-line)] text-[var(--color-ink-2)] hover:border-[var(--color-warm-400)] hover:text-[var(--color-ink)]",
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.accent }} />
                  {meta.label}
                  <span className="text-[10px] opacity-60 tabular-nums">{counts[t]}</span>
                </button>
              );
            })}
          </div>
          {(selectedTypes.size > 0 || search) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => patch({ type: null, q: null })}
              className="ml-auto"
            >
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>
      </div>

      <div ref={legendRef}>
        {groups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--color-line)] py-20 text-center">
            <p className="text-[14px] text-[var(--color-ink-3)]">No entities match.</p>
          </div>
        ) : (
          groups.map(([groupKey, rows]) => (
            <section key={groupKey} className="mb-6">
              <h3 className="text-[11px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] font-medium mb-2 px-1 flex items-center justify-between sticky top-0 z-10 bg-[var(--color-paper)]/95 backdrop-blur py-1.5">
                <span>{groupKey}</span>
                <span className="tabular-nums">{rows.length}</span>
              </h3>
              <ul className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] divide-y divide-[var(--color-line)]">
                {rows.map((e) => (
                  <EntityRow key={e.id} e={e} />
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

function EntityRow({ e }: { e: Entity }) {
  const meta = ENTITY_TYPES[e.type];
  const linkedin = getProp<string>(e, "linkedin");
  const website = getProp<string>(e, "website") ?? getProp<string>(e, "official_url");
  const checkSize = getProp<string>(e, "check_size");
  const fundSize = getProp<string>(e, "fund_size");
  const location = getProp<string>(e, "location");
  const role = getProp<string>(e, "role");
  const email = getProp<string>(e, "email");
  const detail = role || checkSize || fundSize || location || getProp<string>(e, "background") || "";

  return (
    <li>
      <Link
        href={`/app/network/${e.slug}`}
        className="grid items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-paper)] transition-colors group"
        style={{ gridTemplateColumns: "10px 1.4fr 1fr 1fr auto" }}
      >
        <span className="h-2 w-2 rounded-full" style={{ background: meta.accent }} />
        <div className="min-w-0">
          <div className="text-[13px] font-semibold leading-tight truncate group-hover:text-[var(--color-accent-500)] transition-colors">
            {e.name}
          </div>
          {e.org && e.org !== e.name && (
            <div className="text-[11px] text-[var(--color-ink-3)] truncate">{e.org}</div>
          )}
        </div>
        <div className="text-[11.5px] text-[var(--color-ink-2)] truncate">{detail}</div>
        <div className="text-[11px] text-[var(--color-ink-3)] truncate">
          {email && <span className="font-mono">{email}</span>}
        </div>
        <div className="flex items-center gap-2 justify-end">
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noreferrer"
              onClick={(ev) => ev.stopPropagation()}
              className="text-[11px] text-[var(--color-ink-3)] hover:text-[var(--color-accent-500)]"
              title="LinkedIn"
            >
              in
            </a>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              onClick={(ev) => ev.stopPropagation()}
              className="text-[var(--color-ink-3)] hover:text-[var(--color-accent-500)]"
              title="Website"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <Badge tone={meta.tone as never} className="!text-[10px]">
            {meta.label}
          </Badge>
        </div>
      </Link>
    </li>
  );
}

function Sep() { return <span className="w-px h-4 bg-[var(--color-line)]" />; }
