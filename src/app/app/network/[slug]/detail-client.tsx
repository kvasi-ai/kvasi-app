"use client";
import dynamic from "next/dynamic";

const LocalGraph = dynamic(() => import("@/components/network/local-graph").then((m) => m.LocalGraph), {
  ssr: false,
  loading: () => (
    <div className="mt-6 rounded-xl border border-dashed border-[var(--color-line)] py-10 text-center text-[11px] text-[var(--color-ink-3)] italic">
      Loading graph…
    </div>
  ),
});

export function EntityDetailClient({ entityId, slug }: { entityId: string; slug: string }) {
  return (
    <div className="mt-6">
      <LocalGraph entityId={entityId} slug={slug} />
    </div>
  );
}
