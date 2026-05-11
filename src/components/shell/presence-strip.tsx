"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import { differenceInSeconds, formatDistanceToNowStrict } from "date-fns";
import * as Tooltip from "@radix-ui/react-tooltip";

// Heartbeat: ping every 60s while the tab is visible. Updates the current
// user's last_seen via /api/secure/heartbeat (admin client server-side).
function useHeartbeat() {
  React.useEffect(() => {
    let cancelled = false;
    const ping = () => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/secure/heartbeat", { method: "POST" }).catch(() => null);
    };
    ping();
    const id = setInterval(() => { if (!cancelled) ping(); }, 60_000);
    const onVis = () => { if (document.visibilityState === "visible") ping(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);
}

type AppUser = {
  username: string;
  display_name: string;
  color: string;
  last_seen: string | null;
  login_count: number;
};

function makeSupa() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export function PresenceStrip({ me }: { me: string | null }) {
  useHeartbeat();
  const supa = React.useMemo(makeSupa, []);
  const qc = useQueryClient();

  const { data: users = [] } = useQuery<AppUser[]>({
    queryKey: ["app_users"],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data } = await supa
        .from("app_users")
        .select("username, display_name, color, last_seen, login_count")
        .order("username");
      return (data ?? []) as unknown as AppUser[];
    },
  });

  // Realtime: any update to app_users invalidates the query.
  React.useEffect(() => {
    const ch = supa
      .channel("app_users_presence")
      .on("postgres_changes", { event: "*", schema: "public", table: "app_users" }, () => {
        qc.invalidateQueries({ queryKey: ["app_users"] });
      })
      .subscribe();
    return () => { supa.removeChannel(ch); };
  }, [supa, qc]);

  return (
    <Tooltip.Provider delayDuration={150}>
      <div className="flex items-center -space-x-1.5">
        {users.map((u) => {
          const online = u.last_seen
            ? differenceInSeconds(new Date(), new Date(u.last_seen)) < 120
            : false;
          const isMe = u.username === me;
          return (
            <Tooltip.Root key={u.username}>
              <Tooltip.Trigger asChild>
                <div className="relative">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-white text-[11px] font-semibold border-2 ${
                      isMe ? "border-[var(--color-ink)]" : "border-[var(--color-paper)]"
                    }`}
                    style={{ background: u.color }}
                  >
                    {u.display_name.charAt(0)}
                  </span>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-paper)] ${
                      online ? "bg-[var(--color-success)]" : "bg-[var(--color-ink-3)]"
                    }`}
                    aria-label={online ? "online" : "offline"}
                  />
                </div>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="bottom"
                  sideOffset={6}
                  className="z-50 rounded-md border border-[var(--color-line)] bg-[var(--color-paper-2)] px-2.5 py-1.5 text-[11.5px] shadow-[var(--shadow-2)]"
                >
                  <div className="font-semibold leading-tight">
                    {u.display_name} {isMe && <span className="text-[var(--color-ink-3)] font-normal">(you)</span>}
                  </div>
                  <div className="text-[10.5px] text-[var(--color-ink-3)] mt-0.5">
                    {online
                      ? "Active now"
                      : u.last_seen
                      ? `Active ${formatDistanceToNowStrict(new Date(u.last_seen), { addSuffix: true })}`
                      : "Never signed in"}
                  </div>
                  <div className="text-[10.5px] text-[var(--color-ink-3)]">
                    {u.login_count} logins
                  </div>
                  <Tooltip.Arrow className="fill-[var(--color-line)]" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          );
        })}
      </div>
    </Tooltip.Provider>
  );
}
