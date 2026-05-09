"use client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Moon, SunMedium, Monitor, LogOut, ExternalLink, Code2, Database } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const r = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    r.push("/login");
  }

  return (
    <div className="px-6 py-6 max-w-[760px]">
      <div className="text-[10.5px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] mb-2">Workspace</div>
      <h1 className="font-[family-name:var(--font-display)] text-[44px] leading-[1.02] tracking-[-0.02em] font-medium mb-2">
        Settings
      </h1>
      <p className="text-[14px] text-[var(--color-ink-2)] mb-10">Workspace preferences, integrations, and access.</p>

      <Section label="Appearance" desc="Switch between light and dark mode. System matches your OS.">
        <div className="flex gap-1 rounded-md border border-[var(--color-line)] bg-[var(--color-paper-2)] p-0.5 w-fit">
          {[
            { v: "light", icon: SunMedium, label: "Light" },
            { v: "dark", icon: Moon, label: "Dark" },
            { v: "system", icon: Monitor, label: "System" },
          ].map(({ v, icon: Icon, label }) => (
            <button
              key={v}
              onClick={() => setTheme(v)}
              className={`flex items-center gap-1.5 px-3 h-8 rounded text-[12px] transition-colors ${theme === v ? "bg-[var(--color-ink)] text-[var(--color-paper)]" : "text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Section label="Workspace access" desc="3 cofounders + invited advisors. Future: Google OAuth + magic-link.">
        <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] divide-y divide-[var(--color-line)]">
          {[
            { name: "Anuj Zore", email: "anuj@kvasi.ai", role: "Owner", color: "bg-[var(--color-accent-500)]" },
            { name: "Niketan Waghule", email: "niketan@kvasi.ai", role: "Owner", color: "bg-[var(--color-info)]" },
            { name: "Shreyas Somnathe", email: "shreyas@kvasi.ai", role: "Owner", color: "bg-[var(--color-success)]" },
          ].map((u) => (
            <div key={u.email} className="flex items-center gap-3 px-4 py-3">
              <div className={`grid h-8 w-8 place-items-center rounded-full text-white text-[11px] font-semibold ${u.color}`}>
                {u.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold">{u.name}</div>
                <div className="text-[11px] text-[var(--color-ink-3)]">{u.email}</div>
              </div>
              <span className="rounded-full bg-[var(--color-accent-100)] dark:bg-[var(--color-accent-900)] text-[var(--color-accent-700)] dark:text-[var(--color-accent-200)] text-[10.5px] px-2 py-0.5 font-medium">{u.role}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Integrations" desc="Connected services.">
        <div className="grid grid-cols-2 gap-3">
          <Tile icon={<Database className="h-4 w-4" />} title="Supabase" sub="Postgres + Realtime · live" />
          <Tile icon={<Code2 className="h-4 w-4" />} title="GitHub" sub="kvasi-ai/kvasi-app" href="https://github.com/kvasi-ai/kvasi-app" />
        </div>
      </Section>

      <Section label="Session">
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </Button>
      </Section>
    </div>
  );
}

function Section({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[10.5px] tracking-[0.13em] uppercase text-[var(--color-ink-3)] font-medium mb-1">{label}</h2>
      {desc && <p className="text-[12.5px] text-[var(--color-ink-2)] mb-3">{desc}</p>}
      {children}
    </section>
  );
}

function Tile({ icon, title, sub, href }: { icon: React.ReactNode; title: string; sub: string; href?: string }) {
  const inner = (
    <div className="rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-2)] p-4 flex items-start gap-3">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-[var(--color-warm-150)] text-[var(--color-ink)] dark:bg-[var(--color-warm-800)]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold flex items-center gap-1">
          {title} {href && <ExternalLink className="h-3 w-3 text-[var(--color-ink-3)]" />}
        </div>
        <div className="text-[11px] text-[var(--color-ink-3)] truncate">{sub}</div>
      </div>
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">{inner}</a> : inner;
}
