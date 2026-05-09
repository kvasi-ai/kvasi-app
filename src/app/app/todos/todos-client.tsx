"use client";
import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import {
  Plus, Trash2, Calendar, Circle, CheckCircle2, Pencil, X, Save, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Todo = {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  created_at: string;
  program_id: string;
  programs: { name: string; slug: string } | null;
};

type ProgramOpt = { id: string; name: string; slug: string };

function makeSupa() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export function TodosClient({ programs }: { programs: ProgramOpt[] }) {
  const supa = React.useMemo(makeSupa, []);
  const qc = useQueryClient();
  const [listRef] = useAutoAnimate<HTMLUListElement>();

  const { data: todos = [] } = useQuery({
    queryKey: ["todos", "all"],
    queryFn: async () => {
      const { data, error } = await supa
        .from("todos")
        .select("id, title, done, due_date, created_at, program_id, programs(name, slug)")
        .order("done", { ascending: true })
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Todo[];
    },
  });

  const add = useMutation({
    mutationFn: async (vals: { title: string; program_id: string; due_date: string | null }) => {
      const { error } = await supa.from("todos").insert([vals]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Todo added");
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await supa.from("todos").update({ done }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  const editTodo = useMutation({
    mutationFn: async ({ id, title, due_date }: { id: string; title?: string; due_date?: string | null }) => {
      const patch: Record<string, unknown> = {};
      if (title !== undefined) patch.title = title;
      if (due_date !== undefined) patch.due_date = due_date;
      const { error } = await supa.from("todos").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Saved");
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supa.from("todos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Deleted");
    },
  });

  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <div className="px-6 py-6 max-w-[900px]">
      <div className="text-[10.5px] tracking-[0.14em] uppercase text-[var(--color-ink-3)] mb-2">All tasks</div>
      <h1 className="font-[family-name:var(--font-display)] text-[44px] leading-[1.02] tracking-[-0.02em] font-medium mb-2">
        Todos
      </h1>
      <p className="text-[14px] text-[var(--color-ink-2)] mb-8">
        Every action across all programs.{" "}
        <span className="tabular-nums font-semibold">{open.length}</span> open ·{" "}
        <span className="tabular-nums">{done.length}</span> done.
      </p>

      <QuickAdd programs={programs} onAdd={(v) => add.mutate(v)} />

      {open.length === 0 && done.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-line)] py-16 text-center mt-6">
          <p className="text-[13px] text-[var(--color-ink-3)]">No todos yet. Use the quick-add above or open a program and add tasks there.</p>
        </div>
      ) : (
        <>
          {open.length > 0 && (
            <Section label={`Open · ${open.length}`} tone="default">
              <ul ref={listRef} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] divide-y divide-[var(--color-line)]">
                {open.map((t) => (
                  <Row
                    key={t.id}
                    todo={t}
                    onToggle={(d) => toggle.mutate({ id: t.id, done: d })}
                    onSave={(patch) => editTodo.mutate({ id: t.id, ...patch })}
                    onDelete={() => del.mutate(t.id)}
                  />
                ))}
              </ul>
            </Section>
          )}
          {done.length > 0 && (
            <Section label={`Done · ${done.length}`} tone="muted">
              <ul className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] divide-y divide-[var(--color-line)] opacity-70">
                {done.map((t) => (
                  <Row
                    key={t.id}
                    todo={t}
                    onToggle={(d) => toggle.mutate({ id: t.id, done: d })}
                    onSave={(patch) => editTodo.mutate({ id: t.id, ...patch })}
                    onDelete={() => del.mutate(t.id)}
                  />
                ))}
              </ul>
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({ label, children, tone }: { label: string; children: React.ReactNode; tone?: "muted" | "default" }) {
  return (
    <section className="mb-8 mt-8">
      <h2 className={cn("text-[10.5px] tracking-[0.13em] uppercase mb-3", tone === "muted" ? "text-[var(--color-ink-3)]" : "text-[var(--color-ink-2)]")}>{label}</h2>
      {children}
    </section>
  );
}

function QuickAdd({ programs, onAdd }: { programs: ProgramOpt[]; onAdd: (v: { title: string; program_id: string; due_date: string | null }) => void }) {
  const [title, setTitle] = React.useState("");
  const [programId, setProgramId] = React.useState(programs[0]?.id ?? "");
  const [due, setDue] = React.useState("");
  const [picker, setPicker] = React.useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t || !programId) return;
    onAdd({ title: t, program_id: programId, due_date: due || null });
    setTitle("");
    setDue("");
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-3 flex items-center gap-2 flex-wrap">
      <Plus className="h-3.5 w-3.5 text-[var(--color-ink-3)] ml-1" />
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a todo… (Enter to save)"
        className="flex-1 min-w-[200px] border-transparent bg-transparent focus:bg-[var(--color-paper)] focus:border-[var(--color-line)]"
      />

      {/* program picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setPicker((p) => !p)}
          className="h-7 inline-flex items-center gap-1 rounded-full border border-[var(--color-line)] px-2.5 text-[11.5px] hover:border-[var(--color-warm-400)]"
        >
          <span className="text-[var(--color-ink-3)]">in</span>
          <span className="font-semibold truncate max-w-[160px]">
            {programs.find((p) => p.id === programId)?.name ?? "—"}
          </span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {picker && (
          <div className="absolute right-0 top-9 z-10 w-[260px] max-h-[320px] overflow-auto rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-2)] shadow-[var(--shadow-3)]">
            {programs.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { setProgramId(p.id); setPicker(false); }}
                className={cn(
                  "block w-full text-left px-3 py-1.5 text-[12.5px] truncate hover:bg-[var(--color-warm-100)] dark:hover:bg-[var(--color-warm-800)]",
                  p.id === programId && "bg-[var(--color-warm-100)] dark:bg-[var(--color-warm-800)]",
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* due date */}
      <label className="inline-flex items-center gap-1 rounded-full border border-[var(--color-line)] px-2 h-7 text-[11.5px] cursor-text hover:border-[var(--color-warm-400)]">
        <Calendar className="h-3 w-3 text-[var(--color-ink-3)]" />
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className="bg-transparent outline-none text-[var(--color-ink)] placeholder:text-[var(--color-ink-3)] [color-scheme:light_dark]"
        />
      </label>

      <Button type="submit" variant="accent" size="sm">
        Add
      </Button>
    </form>
  );
}

function Row({
  todo, onToggle, onSave, onDelete,
}: {
  todo: Todo;
  onToggle: (done: boolean) => void;
  onSave: (patch: { title?: string; due_date?: string | null }) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [title, setTitle] = React.useState(todo.title);
  const [due, setDue] = React.useState(todo.due_date ?? "");

  React.useEffect(() => {
    setTitle(todo.title);
    setDue(todo.due_date ?? "");
  }, [todo.title, todo.due_date]);

  function save() {
    const patch: { title?: string; due_date?: string | null } = {};
    if (title.trim() && title.trim() !== todo.title) patch.title = title.trim();
    const newDue = due || null;
    if (newDue !== todo.due_date) patch.due_date = newDue;
    if (Object.keys(patch).length > 0) onSave(patch);
    setEditing(false);
  }

  const dueObj = todo.due_date ? new Date(todo.due_date) : null;
  const dueLbl = dueObj
    ? isToday(dueObj)
      ? "Today"
      : isTomorrow(dueObj)
        ? "Tomorrow"
        : format(dueObj, "MMM d")
    : null;
  const overdue = dueObj && isPast(dueObj) && !todo.done && !isToday(dueObj);

  return (
    <li className="group flex items-center gap-3 px-4 py-2.5">
      <button
        onClick={() => onToggle(!todo.done)}
        className={cn(
          "h-4 w-4 rounded-full grid place-items-center transition-colors shrink-0",
          todo.done
            ? "bg-[var(--color-accent-500)] text-white"
            : "border border-[var(--color-line)] hover:border-[var(--color-accent-500)]",
        )}
        aria-label={todo.done ? "Mark open" : "Mark done"}
      >
        {todo.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
      </button>

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") { setTitle(todo.title); setEditing(false); }
              }}
              className="h-7 text-[13px] py-0"
            />
            <input
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="h-7 rounded-md border border-[var(--color-line)] bg-[var(--color-paper-2)] px-2 text-[11.5px] [color-scheme:light_dark] outline-none focus:border-[var(--color-accent-500)]"
            />
            <button onClick={save} className="text-[var(--color-success)] hover:opacity-80 p-1" aria-label="Save">
              <Save className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => { setTitle(todo.title); setDue(todo.due_date ?? ""); setEditing(false); }} className="text-[var(--color-ink-3)] hover:text-[var(--color-ink)] p-1" aria-label="Cancel">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-left w-full"
            aria-label="Edit todo"
          >
            <div className={cn("text-[13px] truncate", todo.done && "line-through text-[var(--color-ink-3)]")}>{todo.title}</div>
            {todo.programs && (
              <Link
                onClick={(e) => e.stopPropagation()}
                href={`/app/programs?open=${todo.programs.slug}`}
                className="text-[11px] text-[var(--color-ink-3)] hover:text-[var(--color-accent-500)] hover:underline"
              >
                {todo.programs.name}
              </Link>
            )}
          </button>
        )}
      </div>

      {dueLbl && !editing && (
        <span className={cn("text-[11px] tabular-nums shrink-0", overdue ? "text-[var(--color-error)]" : "text-[var(--color-ink-3)]")}>
          {overdue && "⚠ "}{dueLbl}
        </span>
      )}

      <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!editing && (
          <button onClick={() => setEditing(true)} className="p-1 text-[var(--color-ink-3)] hover:text-[var(--color-ink)]" aria-label="Edit">
            <Pencil className="h-3 w-3" />
          </button>
        )}
        <button onClick={onDelete} className="p-1 text-[var(--color-ink-3)] hover:text-[var(--color-error)]" aria-label="Delete">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}
