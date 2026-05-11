"use client";
import * as React from "react";
import Link from "next/link";
import * as Popover from "@radix-ui/react-popover";
import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import { ENTITY_TYPES, getProp, type Entity, type EntityType } from "@/lib/entities";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

function makeSupa() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Obsidian-style hover preview: <EntityChip slug="..." /> renders an inline
// pill that, on hover, fetches the full entity and shows a popover card.
export function EntityChip({
  slug,
  label,
  type,
  className,
  asChild = false,
}: {
  slug: string;
  label?: string;
  type?: EntityType;
  className?: string;
  asChild?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const supa = React.useMemo(makeSupa, []);

  const { data: entity } = useQuery<Entity | null>({
    queryKey: ["entity", slug],
    enabled: open,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supa.from("entities").select("*").eq("slug", slug).maybeSingle();
      return data as unknown as Entity | null;
    },
  });

  const meta = type ? ENTITY_TYPES[type] : null;
  const triggerLabel = label ?? slug;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        {asChild ? (
          <span
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className={className}
          />
        ) : (
          <Link
            href={`/app/network/${slug}`}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-[var(--color-paper-2)] px-1.5 py-0.5 text-[11.5px] leading-none hover:border-[var(--color-accent-300)] hover:text-[var(--color-accent-500)] transition-colors",
              className,
            )}
          >
            {meta && (
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: meta.accent }} />
            )}
            {triggerLabel}
          </Link>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="start"
          sideOffset={6}
          className="z-50 w-[360px] rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-3 shadow-[var(--shadow-3)] data-[state=open]:animate-in data-[state=open]:fade-in"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <EntityPreview entity={entity} loading={open && !entity} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function EntityPreview({ entity, loading }: { entity: Entity | null | undefined; loading: boolean }) {
  if (loading) {
    return <div className="text-[11px] text-[var(--color-ink-3)] italic py-4 text-center">Loading…</div>;
  }
  if (!entity) {
    return <div className="text-[11px] text-[var(--color-ink-3)] italic py-4 text-center">Not found</div>;
  }
  const meta = ENTITY_TYPES[entity.type];
  const linkedin = getProp<string>(entity, "linkedin");
  const website = getProp<string>(entity, "website") ?? getProp<string>(entity, "official_url");
  const role = getProp<string>(entity, "role");
  const checkSize = getProp<string>(entity, "check_size");
  const fundSize = getProp<string>(entity, "fund_size");
  const location = getProp<string>(entity, "location");
  const background = getProp<string>(entity, "background");
  const description = getProp<string>(entity, "description");
  const email = getProp<string>(entity, "email");

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: meta.accent }} />
        <span className="text-[10.5px] uppercase tracking-[0.13em] text-[var(--color-ink-3)] font-medium">
          {meta.label}
        </span>
      </div>
      <div>
        <Link
          href={`/app/network/${entity.slug}`}
          className="font-[family-name:var(--font-display)] text-[20px] tracking-tight font-medium hover:text-[var(--color-accent-500)] transition-colors"
        >
          {entity.name}
        </Link>
        {entity.org && entity.org !== entity.name && (
          <div className="text-[11.5px] text-[var(--color-ink-3)]">{entity.org}</div>
        )}
      </div>
      {(role || checkSize || fundSize || location) && (
        <div className="flex flex-wrap gap-1.5 text-[10.5px]">
          {role && <Tag>{role}</Tag>}
          {checkSize && <Tag>{checkSize}</Tag>}
          {fundSize && <Tag>{fundSize}</Tag>}
          {location && <Tag>📍 {location}</Tag>}
        </div>
      )}
      {(description || background) && (
        <p className="text-[12px] text-[var(--color-ink-2)] leading-relaxed line-clamp-4">
          {description ?? background}
        </p>
      )}
      <div className="flex items-center gap-3 pt-1 text-[11px]">
        {email && (
          <a
            href={`mailto:${email}`}
            className="font-mono text-[var(--color-ink-3)] hover:text-[var(--color-accent-500)] truncate"
          >
            {email}
          </a>
        )}
        {linkedin && (
          <a href={linkedin} target="_blank" rel="noreferrer" className="text-[var(--color-ink-3)] hover:text-[var(--color-accent-500)]">
            LinkedIn
          </a>
        )}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-ink-3)] hover:text-[var(--color-accent-500)] inline-flex items-center gap-0.5"
          >
            site <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--color-line)] bg-[var(--color-paper)] px-1.5 py-0.5 text-[10px] text-[var(--color-ink-2)]">
      {children}
    </span>
  );
}
