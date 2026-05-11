"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { KNOWN_USERS, type AppUser } from "@/lib/auth";

const USER_META: Record<AppUser, { label: string; color: string }> = {
  anuj:    { label: "Anuj",    color: "#E55A2B" },
  shreyas: { label: "Shreyas", color: "#5BA3E5" },
  niketan: { label: "Niketan", color: "#7BC97B" },
};
const LAST_USER_KEY = "kvasi.last_user";

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginInner />
    </React.Suspense>
  );
}

function LoginInner() {
  const r = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/app";

  const [user, setUser] = React.useState<AppUser>("anuj");
  const [pw, setPw] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Remember last-used identity (not the password) so repeat sign-ins are one click + password.
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const last = localStorage.getItem(LAST_USER_KEY);
      if (last && (KNOWN_USERS as readonly string[]).includes(last)) setUser(last as AppUser);
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user, password: pw, next }),
    });
    if (res.ok) {
      if (typeof window !== "undefined") localStorage.setItem(LAST_USER_KEY, user);
      r.push(next);
    } else {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(j.error ?? "Wrong password");
      setLoading(false);
    }
  }

  return (
    <main className="bg-grain min-h-screen grid place-items-center px-6">
      <form onSubmit={submit} className="w-full max-w-[420px]">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-[var(--color-accent-500)] text-white font-bold text-[13px]">K</div>
          <div>
            <div className="text-[14px] font-semibold tracking-tight">KVASI</div>
            <div className="text-[10.5px] text-[var(--color-ink-3)] tracking-[0.13em] uppercase">Capital · Calendar</div>
          </div>
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-[36px] leading-[1.05] tracking-[-0.02em] font-medium mb-2">
          Sign in
        </h1>
        <p className="text-[13px] text-[var(--color-ink-2)] mb-8">
          Private workspace. Founding team only.
        </p>

        <div className="mb-5">
          <span className="text-[11px] tracking-[0.08em] uppercase text-[var(--color-ink-3)] mb-1.5 block">Who</span>
          <div className="grid grid-cols-3 gap-1.5">
            {KNOWN_USERS.map((u) => {
              const meta = USER_META[u];
              const on = u === user;
              return (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUser(u)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 transition-all text-left",
                    on
                      ? "border-[var(--color-accent-500)] bg-[var(--color-paper-2)] shadow-[var(--shadow-1)]"
                      : "border-[var(--color-line)] hover:border-[var(--color-warm-400)]",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="grid h-7 w-7 place-items-center rounded-full text-white text-[11px] font-bold"
                      style={{ background: meta.color }}
                    >
                      {meta.label.charAt(0)}
                    </span>
                    <span className="text-[12.5px] font-semibold tracking-tight">{meta.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="text-[11px] tracking-[0.08em] uppercase text-[var(--color-ink-3)] mb-1.5 block">Password</span>
          <div className="relative">
            <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-ink-3)]" />
            <Input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoFocus
              className="pl-8 h-10 text-[14px]"
              placeholder="••••••••"
            />
          </div>
        </label>

        {err && (
          <p className="mt-3 text-[12px] text-[var(--color-error)]">{err}</p>
        )}

        <Button type="submit" variant="accent" size="lg" className="mt-5 w-full" disabled={loading || !pw}>
          {loading ? "Verifying…" : (
            <>
              Enter as {USER_META[user].label} <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>

        <p className="mt-8 text-[11px] text-[var(--color-ink-3)] text-center">
          Forgot password? Ask Anuj.
        </p>
      </form>
    </main>
  );
}
