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
async function fetchSubgraph(supa: ReturnType<typeof makeSupa>, centerId: string, depth: number) {
  const visited = new Set<string>([centerId]);
  const frontier: string[] = [centerId];
  const allNodes = new Map<string, NodeRow>();
  const allEdges: EdgeRow[] = [];

  for (let level = 0; level < depth; level++) {
    if (frontier.length === 0) break;
    const { data: edges } = await supa
      .from("entity_links")
      .select("from_id, to_id")
      .or(`from_id.in.(${frontier.join(",")}),to_id.in.(${frontier.join(",")})`);
    const rows = (edges ?? []) as EdgeRow[];

    const newIds = new Set<string>();
    for (const r of rows) {
      allEdges.push(r);
      if (!visited.has(r.from_id)) { newIds.add(r.from_id); visited.add(r.from_id); }
      if (!visited.has(r.to_id))   { newIds.add(r.to_id);   visited.add(r.to_id); }
    }
    frontier.length = 0;
    newIds.forEach((id) => frontier.push(id));
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

    const graph = new Graph({ multi: false, type: "undirected" });
    for (const n of data.nodes) {
      const meta = ENTITY_TYPES[n.type];
      const isCenter = n.id === entityId;
      graph.addNode(n.id, {
        label: n.name,
        size: isCenter ? 14 : 7,
        color: meta?.accent ?? "#999",
        slug: n.slug,
        type: n.type,
      });
    }
    for (const e of data.edges) {
      if (graph.hasNode(e.from_id) && graph.hasNode(e.to_id) && !graph.hasEdge(e.from_id, e.to_id)) {
        graph.addEdge(e.from_id, e.to_id, { color: "rgba(120,120,120,0.25)", size: 0.6 });
      }
    }

    if (graph.order === 0) return;

    // Random init positions for ForceAtlas2
    graph.forEachNode((n) => {
      graph.setNodeAttribute(n, "x", Math.random() * 100);
      graph.setNodeAttribute(n, "y", Math.random() * 100);
    });
    forceAtlas2.assign(graph, { iterations: 100, settings: { scalingRatio: 10, gravity: 1, slowDown: 5, barnesHutOptimize: graph.order > 100 } });

    // Clean up any prior renderer
    sigmaRef.current?.kill();
    const renderer = new Sigma(graph, containerRef.current, {
      renderLabels: true,
      labelSize: 11,
      labelColor: { color: getCss("--color-ink-2") || "#888" },
      labelFont: "Geist, system-ui, sans-serif",
      defaultEdgeColor: "rgba(120,120,120,0.25)",
    });
    sigmaRef.current = renderer;

    renderer.on("clickNode", ({ node }) => {
      const nodeSlug = graph.getNodeAttribute(node, "slug") as string;
      if (nodeSlug && nodeSlug !== slug) router.push(`/app/network/${nodeSlug}`);
    });

    return () => {
      renderer.kill();
      sigmaRef.current = null;
    };
  }, [data, entityId, slug, router]);

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
      <div
        ref={containerRef}
        className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)]"
        style={{ height: 360, width: "100%" }}
      />
      <div className="mt-2 flex items-center gap-3 text-[10.5px] text-[var(--color-ink-3)] flex-wrap">
        {(Object.entries(ENTITY_TYPES) as [EntityType, (typeof ENTITY_TYPES)[EntityType]][]).map(([k, m]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.accent }} />
            {m.label}
          </span>
        ))}
        {isLoading && <span className="italic ml-auto">loading…</span>}
        {data && <span className="ml-auto">{data.nodes.length} nodes · {data.edges.length} edges</span>}
      </div>
    </div>
  );
}

function getCss(name: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || undefined;
}
