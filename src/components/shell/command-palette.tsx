"use client";
import * as React from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Search,
  Sparkles,
  LayoutDashboard,
  CalendarDays,
  ListTodo,
  Inbox,
  Settings,
  ExternalLink,
  Tag,
  ArrowRight,
  Sun,
  Moon,
  LogOut,
  Network,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Kbd } from "@/components/ui/kbd";
import { STATUSES } from "@/lib/programs-data";

export type Cmd =
  | { kind: "nav"; label: string; href: string; icon: React.ReactNode; hint?: string }
  | { kind: "program"; id: string; slug: string; name: string; org: string }
  | { kind: "action"; label: string; run: () => void; icon: React.ReactNode };

export function CommandPalette({
  programs,
}: {
  programs: { id: string; slug: string; name: string; org: string }[];
}) {
  const r = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // ⌘K / Ctrl+K
  useHotkeys("mod+k", (e) => { e.preventDefault(); setOpen((o) => !o); }, []);

  // explicit open via window event (topbar click)
  React.useEffect(() => {
    const h = () => setOpen(true);
    window.addEventListener("command:open", h);
    return () => window.removeEventListener("command:open", h);
  }, []);
  useHotkeys("/", (e) => {
    if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
    e.preventDefault();
    setOpen(true);
  }, []);
  useHotkeys("?", (e) => {
    if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
    e.preventDefault();
    setOpen(true);
    setSearch(">");
  }, []);

  // navigation chord: G then T/P/C/M/I/S
  const lastG = React.useRef(0);
  useHotkeys("g", () => { lastG.current = Date.now(); }, []);
  useHotkeys("t", () => {
    if (Date.now() - lastG.current < 1000) {
      r.push("/app/today");
      lastG.current = 0;
    }
  }, []);
  useHotkeys("p", () => {
    if (Date.now() - lastG.current < 1000) { r.push("/app"); lastG.current = 0; }
  }, []);
  useHotkeys("c", () => {
    if (Date.now() - lastG.current < 1000) { r.push("/app/calendar"); lastG.current = 0; }
  }, []);
  useHotkeys("m", () => {
    if (Date.now() - lastG.current < 1000) { r.push("/app/todos"); lastG.current = 0; }
  }, []);
  useHotkeys("i", () => {
    if (Date.now() - lastG.current < 1000) { r.push("/app/inbox"); lastG.current = 0; }
  }, []);
  useHotkeys("n", () => {
    if (Date.now() - lastG.current < 1000) { r.push("/app/network"); lastG.current = 0; }
  }, []);
  useHotkeys("s", () => {
    if (Date.now() - lastG.current < 1000) { r.push("/app/settings"); lastG.current = 0; }
  }, []);

  function go(href: string) {
    setOpen(false);
    setSearch("");
    r.push(href);
  }

  function openProgram(slug: string) {
    setOpen(false);
    setSearch("");
    r.push(`/app/programs?open=${slug}`);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    r.push("/login");
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      className="fixed inset-0 z-[60] grid place-items-start justify-items-center pt-[12vh] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
    >
      <div
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
      />
      <div className="relative w-full max-w-[600px] mx-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] shadow-[var(--shadow-4)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 border-b border-[var(--color-line)]">
          <Search className="h-3.5 w-3.5 text-[var(--color-ink-3)]" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search programs, jump anywhere, change status…"
            className="flex-1 h-12 bg-transparent text-[14px] outline-none placeholder:text-[var(--color-ink-3)]"
          />
          <Kbd>esc</Kbd>
        </div>

        <Command.List className="max-h-[440px] overflow-auto p-1.5">
          <Command.Empty className="py-8 text-center text-[12.5px] text-[var(--color-ink-3)]">
            No matches.
          </Command.Empty>

          <Command.Group heading="Navigate">
            <Item icon={<Sparkles className="h-3.5 w-3.5" />} label="Today" hint="G T" onSelect={() => go("/app/today")} />
            <Item icon={<LayoutDashboard className="h-3.5 w-3.5" />} label="Programs" hint="G P" onSelect={() => go("/app")} />
            <Item icon={<CalendarDays className="h-3.5 w-3.5" />} label="Calendar" hint="G C" onSelect={() => go("/app/calendar")} />
            <Item icon={<Network className="h-3.5 w-3.5" />} label="Network" hint="G N" onSelect={() => go("/app/network")} />
            <Item icon={<ListTodo className="h-3.5 w-3.5" />} label="My todos" hint="G M" onSelect={() => go("/app/todos")} />
            <Item icon={<Inbox className="h-3.5 w-3.5" />} label="Inbox" hint="G I" onSelect={() => go("/app/inbox")} />
            <Item icon={<Settings className="h-3.5 w-3.5" />} label="Settings" hint="G S" onSelect={() => go("/app/settings")} />
          </Command.Group>

          <Command.Group heading={`Programs · ${programs.length}`}>
            {programs.slice(0, 50).map((p) => (
              <Item
                key={p.id}
                icon={<ExternalLink className="h-3.5 w-3.5" />}
                label={p.name}
                sub={p.org}
                onSelect={() => openProgram(p.slug)}
              />
            ))}
          </Command.Group>

          <Command.Group heading="Actions">
            <Item
              icon={resolvedTheme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
              onSelect={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
                setOpen(false);
              }}
            />
            <Item
              icon={<LogOut className="h-3.5 w-3.5" />}
              label="Sign out"
              onSelect={logout}
            />
          </Command.Group>

          <Command.Group heading="Quick filter (programs by tier)">
            <Item icon={<Tag className="h-3.5 w-3.5" />} label="Tier 1 — apply within 30 days" onSelect={() => go("/app?tier=1")} />
            <Item icon={<Tag className="h-3.5 w-3.5" />} label="Tier 2 — apply Q3 2026" onSelect={() => go("/app?tier=2")} />
            <Item icon={<Tag className="h-3.5 w-3.5" />} label="Tier 3 — deferred" onSelect={() => go("/app?tier=3")} />
          </Command.Group>

          <Command.Group heading="Status pipeline">
            {STATUSES.map((s) => (
              <Item
                key={s.value}
                icon={<span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />}
                label={`Filter: ${s.label}`}
                onSelect={() => go(`/app?status=${s.value}`)}
              />
            ))}
          </Command.Group>
        </Command.List>

        <div className="flex items-center gap-3 px-4 h-9 border-t border-[var(--color-line)] bg-[var(--color-warm-50)] dark:bg-[var(--color-warm-900)] text-[10.5px] text-[var(--color-ink-3)]">
          <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
          <span className="flex items-center gap-1"><Kbd>↵</Kbd> select</span>
          <span className="flex items-center gap-1"><Kbd>G</Kbd> then key — jump</span>
          <ArrowRight className="h-3 w-3 ml-auto" />
        </div>
      </div>
    </Command.Dialog>
  );
}

function Item({
  icon, label, sub, hint, onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] cursor-pointer data-[selected=true]:bg-[var(--color-warm-100)] data-[selected=true]:text-[var(--color-ink)] dark:data-[selected=true]:bg-[var(--color-warm-800)]"
    >
      <span className="text-[var(--color-ink-3)]">{icon}</span>
      <span className="flex-1 truncate">{label}</span>
      {sub && <span className="text-[11px] text-[var(--color-ink-3)] truncate max-w-[160px]">{sub}</span>}
      {hint && (
        <span className="flex items-center gap-0.5">
          {hint.split(" ").map((k, i) => <Kbd key={i}>{k}</Kbd>)}
        </span>
      )}
    </Command.Item>
  );
}
