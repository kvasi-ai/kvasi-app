"use client";
import { useTheme } from "next-themes";
import { Search, Moon, SunMedium, Bell } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import { PresenceStrip } from "@/components/shell/presence-strip";

function triggerCommand() {
  window.dispatchEvent(new CustomEvent("command:open"));
}

export function TopbarShell({ me }: { me: string | null }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = (resolvedTheme ?? theme) === "dark";

  return (
    <header className="flex h-12 items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-paper)] px-4">
      <button
        onClick={triggerCommand}
        className="group flex h-8 max-w-[420px] flex-1 items-center gap-2 rounded-md border border-[var(--color-line)] bg-[var(--color-paper-2)] px-2.5 text-[12.5px] text-[var(--color-ink-3)] transition-colors hover:border-[var(--color-warm-400)] hover:text-[var(--color-ink-2)]"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Search programs, todos, actions…</span>
        <span className="flex items-center gap-0.5">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-3">
        <PresenceStrip me={me} />
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
