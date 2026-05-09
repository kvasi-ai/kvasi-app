"use client";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ProgramSeed } from "@/lib/programs-data";

export type Program = ProgramSeed & {
  id: string;
  current_status: string | null;
};

type ProgramRow = {
  id: string; slug: string; name: string; org: string;
  tier: number; kind: string; dilution: string; visa: string; loc: string;
  amount: string | null; terms: string | null; note: string | null;
  start_date: string | null; end_date: string | null; point_date: string | null;
  rolling: boolean;
  status?: { status: string; changed_at: string }[];
};

export function usePrograms() {
  return useQuery({
    queryKey: ["programs"],
    queryFn: async (): Promise<Program[]> => {
      const supa = createClient();
      const { data, error } = await supa
        .from("programs")
        .select("*, status:program_status(status, changed_at)")
        .order("tier", { ascending: true });

      if (error) throw error;

      const rows = (data ?? []) as unknown as ProgramRow[];
      return rows.map((p) => {
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
    },
  });
}
