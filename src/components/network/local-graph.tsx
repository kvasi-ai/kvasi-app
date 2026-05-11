"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useQuery } from "@tanstack/react-query";
import Sigma from "sigma";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { ENTITY_TYPES, type EntityType } from "@/lib/entities";

function makeSupa() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

type NodeRow = { id: string; slug: string; name: string; type: EntityType; org: string | null };
type EdgeRow = { from_id: string; to_id: string };

// Breadth-first traversal up to N hops from the center node.
// Splits the .or() query into two .in() calls — more reliable across PostgREST
// versions and easier to debug.
async function fetchSubgraph(supa: ReturnType<typeof makeSupa>, centerId: string, depth: number) {
  const visited = new Set<string>([centerId]);
  let frontier: string[] = [centerId];
  const allNodes = new Map<string, NodeRow>();
  const edgeKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const seenEdges = new Set<string>();
  const allEdges: EdgeRow[] = [];

  for (let level = 0; level < depth; level++) {
    if (frontier.length === 0) break;

    const [outRes, inRes] = await Promise.all([
      supa.from("entity_links").select("from_id, to_id").in("from_id", frontier),
      supa.from("entity_links").select("from_id, to_id").in("to_id", frontier),
    ]);
    const rows = [
      ...((outRes.data ?? []) as EdgeRow[]),
      ...((inRes.data ?? []) as EdgeRow[]),
    ];

    const nextFrontier = new Set<string>();
    for (const r of rows) {
      const k = edgeKey(r.from_id, r.to_id);
      if (seenEdges.has(k)) continue;
      seenEdges.add(k);
      allEdges.push(r);
      if (!visited.has(r.from_id)) { nextFrontier.add(r.from_id); visited.add(r.from_id); }
      if (!visited.has(r.to_id))   { nextFrontier.add(r.to_id);   visited.add(r.to_id); }
    }
    frontier = Array.from(nextFrontier);
  }

  // hydrate node metadata for every visited id
  const idsToFetch = Array.from(visited);
  for (let i = 0; i < idsToFetch.length; i += 500) {
    const chunk = idsToFetch.slice(i, i + 500);
    const { data } = await supa
      .from("entities")
      .select("id, slug, name, type, org")
      .in("id", chunk);
    for (const n of (data ?? []) as NodeRow[]) allNodes.set(n.id, n);
  }

  return { nodes: Array.from(allNodes.values()), edges: allEdges };
}

export function LocalGraph({ entityId, slug }: { entityId: string; slug: string }) {
  const router = useRouter();
  const supa = React.useMemo(makeSupa, []);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const sigmaRef = React.useRef<Sigma | null>(null);
  const [depth, setDepth] = React.useState(2);

  const { data, isLoading } = useQuery({
    queryKey: ["local-graph", entityId, depth],
    queryFn: () => fetchSubgraph(supa, entityId, depth),
    staleTime: 60_000,
  });

  React.useEffect(() => {
    if (!containerRef.current || !data) return;
    if (data.nodes.length <= 1) return; // empty-state handled below the container

    const graph = new Graph({ multi: false, type: "undirected" });
    for (const n of data.nodes) {
      const meta = ENTITY_TYPES[n.type];
      const isCenter = n.id === entityId;
      graph.addNode(n.id, {
        label: n.name,
        size: isCenter ? 16 : 8,
        color: meta?.accent ?? "#999",
        slug: n.slug,
        type: n.type,
      });
    }
    for (const e of data.edges) {
      if (graph.hasNode(e.from_id) && graph.hasNode(e.to_id) && !graph.hasEdge(e.from_id, e.to_id)) {
        graph.addEdge(e.from_id, e.to_id, { color: "rgba(120,120,120,0.35)", size: 0.8 });
      }
    }

    // Random init positions for ForceAtlas2
    graph.forEachNode((n) => {
      graph.setNodeAttribute(n, "x", Math.random() * 100);
      graph.setNodeAttribute(n, "y", Math.random() * 100);
    });
    forceAtlas2.assign(graph, {
      iterations: 200,
      settings: {
        scalingRatio: 30,
        gravity: 1.2,
        slowDown: 4,
        barnesHutOptimize: graph.order > 100,
      },
    });

    // Clean up any prior renderer
    sigmaRef.current?.kill();
    const renderer = new Sigma(graph, containerRef.current, {
      renderLabels: true,
      labelSize: 11,
      labelColor: { color: getCss("--color-ink-2") || "#888" },
      labelFont: "Geist, system-ui, sans-serif",
      defaultEdgeColor: "rgba(120,120,120,0.35)",
      labelDensity: 0.5,
      labelGridCellSize: 80,
    });
    sigmaRef.current = renderer;

    renderer.on("clickNode", ({ node }) => {
      const nodeSlug = graph.getNodeAttribute(node, "slug") as string;
      if (nodeSlug && nodeSlug !== slug) router.push(`/app/network/${nodeSlug}`);
    });
    renderer.on("enterNode", () => {
      if (containerRef.current) containerRef.current.style.cursor = "pointer";
    });
    renderer.on("leaveNode", () => {
      if (containerRef.current) containerRef.current.style.cursor = "default";
    });

    return () => {
      renderer.kill();
      sigmaRef.current = null;
    };
  }, [data, entityId, slug, router]);

  const isEmpty = !isLoading && data && data.nodes.length <= 1;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] font-medium">
          Local graph
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-2)]">
          <span>depth</span>
          <input
            type="range"
            min={1}
            max={4}
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            className="w-16 accent-[var(--color-accent-500)]"
          />
          <span className="tabular-nums w-3 text-[var(--color-ink)] font-semibold">{depth}</span>
        </div>
      </div>
      <div className="relative rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] overflow-hidden">
        <div
          ref={containerRef}
          style={{ height: 420, width: "100%", display: isEmpty ? "none" : "block" }}
        />
        {isEmpty && (
          <div className="grid place-items-center text-center px-6 py-12 min-h-[200px]">
            <div>
              <p className="text-[12.5px] text-[var(--color-ink-2)] mb-1.5">No connections yet</p>
              <p className="text-[11px] text-[var(--color-ink-3)] leading-relaxed max-w-xs mx-auto">
                This entity isn&apos;t linked to anything in the graph. Connections appear when you create entity links (the ingest auto-links contacts to their companies).
              </p>
            </div>
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 grid place-items-center bg-[var(--color-paper-2)]/60 text-[11px] text-[var(--color-ink-3)] italic">
            loading…
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-3 text-[10.5px] text-[var(--color-ink-3)] flex-wrap">
        {(Object.entries(ENTITY_TYPES) as [EntityType, (typeof ENTITY_TYPES)[EntityType]][]).map(([k, m]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.accent }} />
            {m.label}
          </span>
        ))}
        {data && (
          <span className="ml-auto tabular-nums">
            {data.nodes.length} nodes · {data.edges.length} edges
          </span>
        )}
      </div>
    </div>
  );
}

function getCss(name: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || undefined;
}
