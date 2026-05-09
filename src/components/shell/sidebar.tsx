"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  ListTodo,
  Inbox,
  Settings,
  Sparkles,
} from "lucide-react";

const NAV: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; hint?: string }[] = [
  { href: "/app",          label: "Today",     icon: Sparkles,       hint: "G T" },
  { href: "/app/programs", label: "Programs",  icon: LayoutDashboard, hint: "G P" },
  { href: "/app/calendar", label: "Calendar",  icon: CalendarDays,   hint: "G C" },
  { href: "/app/todos",    label: "My todos",  icon: ListTodo,       hint: "G M" },
  { href: "/app/inbox",    label: "Inbox",     icon: Inbox,          hint: "G I" },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden md:flex w-[220px] shrink-0 flex-col border-r border-[var(--color-line)] bg-[color-mix(in_oklab,var(--color-paper),white_10%)] dark:bg-[var(--color-paper-2)]">
      <div className="flex items-center gap-2.5 px-4 h-12 border-b border-[var(--color-line)]">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-[var(--color-accent-500)] text-white font-bold text-[12px]">K</div>
        <div className="leading-none">
          <div className="text-[13px] font-semibold tracking-tight">KVASI</div>
          <div className="text-[10px] text-[var(--color-ink-3)] mt-0.5 tracking-wide uppercase">Capital · Calendar</div>
        </div>
      </div>

      <nav className="flex-1 p-2.5">
        {NAV.map(({ href, label, icon: Icon, hint }) => {
          const active = path === href || (href !== "/app" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] mb-0.5 transition-colors duration-150",
                active
                  ? "bg-[var(--color-warm-150)] text-[var(--color-ink)] dark:bg-[var(--color-warm-800)]"
                  : "text-[var(--color-ink-2)] hover:bg-[var(--color-warm-100)] hover:text-[var(--color-ink)] dark:hover:bg-[var(--color-warm-800)]",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {hint && (
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-[var(--color-ink-3)]">{hint}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-2.5 border-t border-[var(--color-line)]">
        <Link
          href="/app/settings"
          className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-[var(--color-ink-2)] hover:bg-[var(--color-warm-100)] hover:text-[var(--color-ink)] dark:hover:bg-[var(--color-warm-800)]"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
