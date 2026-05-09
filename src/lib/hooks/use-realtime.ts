"use client";
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export function useRealtimeWorkspace() {
  const qc = useQueryClient();
  const router = useRouter();

  React.useEffect(() => {
    const supa = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const ch = supa
      .channel("workspace-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "program_status" }, () => {
        qc.invalidateQueries({ queryKey: ["programs"] });
        router.refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "todos" }, () => {
        qc.invalidateQueries({ queryKey: ["todos"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => {
        qc.invalidateQueries({ queryKey: ["comments"] });
      })
      .subscribe();

    return () => {
      supa.removeChannel(ch);
    };
  }, [qc, router]);
}
