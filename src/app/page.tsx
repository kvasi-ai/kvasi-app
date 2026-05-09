import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="bg-grain min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 sm:px-10 h-14">
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-[var(--color-accent-500)] text-white font-bold text-[12px]">K</div>
          <span className="text-[13px] font-semibold tracking-tight">KVASI</span>
        </div>
        <Button asChild variant="primary" size="md">
          <Link href="/login">
            Sign in <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </nav>

      <section className="flex-1 grid place-items-center px-6 sm:px-10 py-16">
        <div className="max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-[var(--color-paper-2)] px-2.5 py-1 text-[10.5px] tracking-[0.13em] uppercase text-[var(--color-ink-3)] mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-500)]" />
            Private workspace · founding team only
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(48px,7vw,96px)] leading-[0.95] tracking-[-0.025em] font-medium mb-6">
            The capital <em className="not-italic bg-[var(--color-accent-500)] text-white px-2 rounded-md">calendar</em>.
          </h1>
          <p className="text-[16px] sm:text-[17px] leading-relaxed text-[var(--color-ink-2)] max-w-[58ch] mx-auto mb-10">
            Every accelerator, fellowship, grant, and fund relevant to KVASI — plotted by deadline,
            tracked by status, owned by a co-founder. One workspace. Built for the founding team.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild variant="accent" size="lg">
              <Link href="/login">Enter workspace</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href="https://github.com/kvasi-ai/capital-calendar" target="_blank" rel="noreferrer">
                Source <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <footer className="px-6 sm:px-10 py-6 border-t border-[var(--color-line)] flex items-center justify-between text-[11px] text-[var(--color-ink-3)]">
        <span>© KVASI · Trust layer of embodied AI</span>
        <span className="font-mono">v1 · phase 1</span>
      </footer>
    </main>
  );
}
