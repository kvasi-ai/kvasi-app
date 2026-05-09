"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowRight } from "lucide-react";

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
  const [pw, setPw] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: pw, next }),
    });
    if (res.ok) {
      r.push(next);
    } else {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(j.error ?? "Wrong password");
      setLoading(false);
    }
  }

  return (
    <main className="bg-grain min-h-screen grid place-items-center px-6">
      <form onSubmit={submit} className="w-full max-w-[380px]">
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

        <label className="block">
          <span className="text-[11px] tracking-[0.08em] uppercase text-[var(--color-ink-3)] mb-1.5 block">Workspace password</span>
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

        <Button type="submit" variant="accent" size="lg" className="mt-5 w-full" disabled={loading}>
          {loading ? "Verifying…" : (
            <>
              Enter workspace <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>

        <p className="mt-8 text-[11px] text-[var(--color-ink-3)] text-center">
          Forgot? Ask Anuj.
        </p>
      </form>
    </main>
  );
}
