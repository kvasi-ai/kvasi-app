"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import { dbWrite } from "@/lib/db-write";
import { DeleteProgramButton } from "@/components/program/delete-button";
import { STATUSES, KINDS, AMOUNTS, LOCATIONS } from "@/lib/programs-data";

// Untyped client for reads only. All writes go through dbWrite() because
// RLS is keyed on auth.uid() but the app uses HMAC-cookie auth.
function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TierDot } from "@/components/program/status-pill";
import {
  X,
  ExternalLink,
  ChevronDown,
  Calendar,
  MapPin,
  Coins,
  ShieldCheck,
  Plus,
  Check,
  Trash2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type ProgramDetail = {
  id: string;
  slug: string;
  name: string;
  org: string;
  tier: number;
  kind: string;
  dilution: string;
  visa: string;
  loc: string;
  amount: string | null;
  terms: string | null;
  note: string | null;
  start_date: string | null;
  end_date: string | null;
  point_date: string | null;
  rolling: boolean;
  metadata: Record<string, unknown> | null;
  current_status: string;
};

type Todo = {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;
};

type Comment = {
  id: string;
  body: string;
  created_at: string;
};

export function ProgramDetailSheet({
  open,
  onClose,
  program,
}: {
  open: boolean;
  onClose: () => void;
  program: ProgramDetail | null;
}) {
  const qc = useQueryClient();
  const supa = React.useMemo(() => createClient(), []);

  const meta = (program?.metadata ?? {}) as {
    application_url?: string;
    deadline_text?: string;
    tips?: string[];
    sources?: { title: string; url: string }[];
  };

  // ── todos ────────────────────────────────────────────
  const { data: todos = [] } = useQuery<Todo[]>({
    queryKey: ["todos", program?.id],
    enabled: !!program?.id,
    queryFn: async () => {
      const { data, error } = await supa
        .from("todos")
        .select("id, title, done, due_date")
        .eq("program_id", program!.id)
        .order("done", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Todo[];
    },
  });

  const addTodo = useMutation({
    mutationFn: async (title: string) => {
      await dbWrite({ table: "todos", op: "insert", values: { program_id: program!.id, title } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos", program?.id] }),
  });

  const toggleTodo = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      await dbWrite({ table: "todos", op: "update", id, values: { done } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos", program?.id] }),
  });

  const delTodo = useMutation({
    mutationFn: async (id: string) => {
      await dbWrite({ table: "todos", op: "delete", id });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["todos", program?.id] }),
  });

  // ── comments ─────────────────────────────────────────
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["comments", program?.id],
    enabled: !!program?.id,
    queryFn: async () => {
      const { data, error } = await supa
        .from("comments")
        .select("id, body, created_at")
        .eq("program_id", program!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Comment[];
    },
  });

  const addComment = useMutation({
    mutationFn: async (body: string) => {
      await dbWrite({ table: "comments", op: "insert", values: { program_id: program!.id, body } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", program?.id] }),
  });

  // ── status ───────────────────────────────────────────
  const setStatus = useMutation({
    mutationFn: async (status: string) => {
      await dbWrite({ table: "program_status", op: "insert", values: { program_id: program!.id, status } });
    },
    onSuccess: (_, status) => {
      qc.invalidateQueries({ queryKey: ["programs"] });
      const label = STATUSES.find((s) => s.value === status)?.label ?? status;
      toast.success(`Status changed to ${label}`);
    },
  });

  if (!program) return null;

  const kindLabel = KINDS.find((k) => k.value === program.kind)?.label ?? program.kind;
  const amountLabel = AMOUNTS.find((a) => a.value === program.amount)?.label;
  const locLabel = LOCATIONS.find((l) => l.value === program.loc)?.label;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content
          className="fixed right-0 top-0 z-50 h-screen w-full max-w-[640px] overflow-y-auto bg-[var(--color-paper)] shadow-[var(--shadow-4)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right border-l border-[var(--color-line)]"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">{program.name}</Dialog.Title>

          {/* sticky header */}
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-paper)]/90 px-6 py-3 backdrop-blur">
            <div className="flex items-center gap-2 text-[12px] text-[var(--color-ink-3)]">
              <TierDot tier={program.tier} />
              <span>Tier {program.tier}</span>
              <span>·</span>
              <span>{kindLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {meta.application_url && (
                <Button asChild size="sm" variant="accent">
                  <a href={meta.application_url} target="_blank" rel="noreferrer">
                    Apply <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
              <DeleteProgramButton
                programId={program.id}
                programName={program.name}
                variant="icon"
                onDeleted={onClose}
                className="h-8 w-8"
              />
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <div className="px-6 py-6">
            <div className="text-[10.5px] tracking-[0.13em] uppercase text-[var(--color-ink-3)] mb-1.5">
              {program.org}
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-[34px] leading-[1.05] tracking-[-0.02em] font-medium mb-4">
              {program.name}
            </h2>

            {/* status switcher */}
            <StatusSwitcher
              value={program.current_status}
              onChange={(s) => setStatus.mutate(s)}
              loading={setStatus.isPending}
            />

            {/* meta grid */}
            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-[var(--color-line)] py-4">
              <Meta icon={<Calendar className="h-3.5 w-3.5" />} label="Window">
                {program.rolling
                  ? "Rolling"
                  : program.point_date
                    ? `Due ${new Date(program.point_date).toLocaleDateString("en-US", { dateStyle: "medium" })}`
                    : program.start_date
                      ? `${new Date(program.start_date).toLocaleDateString("en-US", { dateStyle: "medium" })} – ${program.end_date ? new Date(program.end_date).toLocaleDateString("en-US", { dateStyle: "medium" }) : "?"}`
                      : "TBD"}
              </Meta>
              <Meta icon={<Coins className="h-3.5 w-3.5" />} label="Check size">
                {amountLabel ?? "—"}
              </Meta>
              <Meta icon={<MapPin className="h-3.5 w-3.5" />} label="Location">
                {locLabel ?? program.loc}
              </Meta>
              <Meta icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Citizenship">
                {program.visa === "gated" ? "US-citizen ≥51% required" : "No gate"}
              </Meta>
            </div>

            {/* terms + note */}
            {program.terms && (
              <Section label="Terms">
                <p className="text-[13.5px] leading-relaxed">{program.terms}</p>
              </Section>
            )}
            <Section label="Strategy note">
              <EditableNote
                programId={program.id}
                initial={program.note ?? ""}
                onSaved={() => qc.invalidateQueries({ queryKey: ["programs"] })}
              />
            </Section>

            {/* tips */}
            {!!meta.tips?.length && (
              <Section label="Application tips">
                <ul className="space-y-2">
                  {meta.tips.map((t, i) => (
                    <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed">
                      <span className="mt-2 h-1 w-1 rounded-full bg-[var(--color-accent-500)] shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* deadline detail */}
            {meta.deadline_text && (
              <Section label="Deadline detail">
                <p className="text-[13.5px] leading-relaxed">{meta.deadline_text}</p>
              </Section>
            )}

            {/* sources */}
            {!!meta.sources?.length && (
              <Section label="Sources">
                <ul className="space-y-1">
                  {meta.sources.map((s, i) => (
                    <li key={i}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[12.5px] inline-flex items-center gap-1 text-[var(--color-info)] hover:underline"
                      >
                        {s.title} <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* todos */}
            <Section label={`Todos · ${todos.length}`}>
              <TodoList
                todos={todos}
                onAdd={(t) => addTodo.mutate(t)}
                onToggle={(id, done) => toggleTodo.mutate({ id, done })}
                onDelete={(id) => delTodo.mutate(id)}
              />
            </Section>

            {/* comments */}
            <Section label={`Comments · ${comments.length}`}>
              <CommentList comments={comments} onAdd={(b) => addComment.mutate(b)} />
            </Section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function EditableNote({ programId, initial, onSaved }: { programId: string; initial: string; onSaved: () => void }) {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(initial);
  React.useEffect(() => setVal(initial), [initial]);

  async function save() {
    const next = val.trim();
    if (next === initial.trim()) { setEditing(false); return; }
    try {
      await dbWrite({ table: "programs", op: "update", id: programId, values: { note: next } });
      toast.success("Note saved");
      setEditing(false);
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (editing) {
    return (
      <div>
        <textarea
          autoFocus
          rows={4}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") save();
            if (e.key === "Escape") { setVal(initial); setEditing(false); }
          }}
          className="w-full resize-none rounded-md border border-[var(--color-line)] bg-[var(--color-paper-2)] px-2.5 py-2 text-[13.5px] leading-relaxed outline-none focus:border-[var(--color-accent-500)]"
        />
        <div className="mt-1.5 flex justify-end gap-1.5">
          <button onClick={() => { setVal(initial); setEditing(false); }} className="text-[11.5px] text-[var(--color-ink-3)] hover:text-[var(--color-ink)] px-2 py-1">Cancel</button>
          <button onClick={save} className="text-[11.5px] text-white bg-[var(--color-accent-500)] hover:bg-[var(--color-accent-600)] px-2.5 py-1 rounded">Save</button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="block w-full text-left text-[13.5px] leading-relaxed text-[var(--color-ink-2)] rounded-md py-1.5 px-2 -mx-2 hover:bg-[var(--color-warm-100)] dark:hover:bg-[var(--color-warm-800)] transition-colors"
    >
      {val || <span className="italic text-[var(--color-ink-3)]">No note yet — click to add.</span>}
    </button>
  );
}

function Meta({
  icon, label, children,
}: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10.5px] tracking-[0.06em] uppercase text-[var(--color-ink-3)] mb-1">
        {icon} {label}
      </div>
      <div className="text-[13px] text-[var(--color-ink)]">{children}</div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="text-[10.5px] tracking-[0.13em] uppercase text-[var(--color-ink-3)] mb-2.5 font-medium">{label}</h3>
      {children}
    </section>
  );
}

function StatusSwitcher({
  value, onChange, loading,
}: { value: string; onChange: (v: string) => void; loading?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const cur = STATUSES.find((s) => s.value === value) ?? STATUSES[0];
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
          "border-[var(--color-line)] bg-[var(--color-paper-2)] hover:border-[var(--color-warm-400)]",
        )}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
        {cur.label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1.5 w-[200px] overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-2)] shadow-[var(--shadow-3)]">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                onChange(s.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] transition-colors hover:bg-[var(--color-warm-100)] dark:hover:bg-[var(--color-warm-800)]",
                s.value === value ? "bg-[var(--color-warm-100)] dark:bg-[var(--color-warm-800)]" : "",
              )}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-60" />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TodoList({
  todos, onAdd, onToggle, onDelete,
}: {
  todos: Todo[];
  onAdd: (t: string) => void;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [input, setInput] = React.useState("");
  return (
    <div>
      <ul className="space-y-1.5 mb-2">
        {todos.map((t) => (
          <li
            key={t.id}
            className="group flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-[var(--color-warm-100)] dark:hover:bg-[var(--color-warm-800)]"
          >
            <button
              onClick={() => onToggle(t.id, !t.done)}
              className={cn(
                "grid h-4 w-4 place-items-center rounded border transition-colors",
                t.done
                  ? "bg-[var(--color-accent-500)] border-[var(--color-accent-500)] text-white"
                  : "border-[var(--color-line)] hover:border-[var(--color-accent-500)]",
              )}
            >
              {t.done && <Check className="h-3 w-3" strokeWidth={3} />}
            </button>
            <span className={cn("flex-1 text-[13px]", t.done && "line-through text-[var(--color-ink-3)]")}>
              {t.title}
            </span>
            <button
              onClick={() => onDelete(t.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-ink-3)] hover:text-[var(--color-error)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = input.trim();
          if (!v) return;
          onAdd(v);
          setInput("");
        }}
        className="flex items-center gap-1.5"
      >
        <Plus className="h-3.5 w-3.5 text-[var(--color-ink-3)]" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a todo… (Enter to save)"
          className="h-7 border-transparent bg-transparent px-1 text-[13px] focus:border-[var(--color-line)] focus:bg-[var(--color-paper-2)]"
        />
      </form>
    </div>
  );
}

function CommentList({
  comments, onAdd,
}: { comments: Comment[]; onAdd: (body: string) => void }) {
  const [input, setInput] = React.useState("");
  return (
    <div>
      <ul className="space-y-3 mb-3">
        {comments.length === 0 && (
          <li className="text-[12px] text-[var(--color-ink-3)] italic">No comments yet.</li>
        )}
        {comments.map((c) => (
          <li key={c.id} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-2)] px-3 py-2">
            <div className="text-[10.5px] text-[var(--color-ink-3)] mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(c.created_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
            </div>
            <p className="text-[13px] leading-relaxed">{c.body}</p>
          </li>
        ))}
      </ul>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = input.trim();
          if (!v) return;
          onAdd(v);
          setInput("");
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
          placeholder="Write a comment… ⌘+Enter to post"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              const v = input.trim();
              if (v) {
                onAdd(v);
                setInput("");
              }
            }
          }}
          className="w-full resize-none rounded-md border border-[var(--color-line)] bg-[var(--color-paper-2)] px-2.5 py-2 text-[13px] outline-none transition-colors focus:border-[var(--color-accent-500)] focus:ring-2 focus:ring-[var(--color-accent-100)] dark:focus:ring-[var(--color-accent-900)]"
        />
        <div className="mt-1.5 flex justify-end">
          <Button type="submit" size="sm" variant="primary">Post</Button>
        </div>
      </form>
    </div>
  );
}
