"use client";
import * as React from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import type { Program } from "@/lib/hooks/use-programs";
import { STATUSES } from "@/lib/programs-data";
import { TierDot } from "@/components/program/status-pill";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

type ProgramWithMeta = Program & { metadata?: Record<string, unknown> | null };

function makeSupa() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export function BoardView({
  programs,
  onOpen,
}: {
  programs: ProgramWithMeta[];
  onOpen?: (slug: string) => void;
}) {
  const qc = useQueryClient();
  const supa = React.useMemo(makeSupa, []);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  // optimistic state — local override of current_status before server confirms
  const [override, setOverride] = React.useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supa.from("program_status").insert([{ program_id: id, status }]);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      const lbl = STATUSES.find((s) => s.value === vars.status)?.label ?? vars.status;
      toast.success(`Moved to ${lbl}`);
      qc.invalidateQueries({ queryKey: ["programs"] });
      // clear local override on next refresh
      setTimeout(() => setOverride((o) => {
        const n = { ...o };
        delete n[vars.id];
        return n;
      }), 800);
    },
    onError: (e, vars) => {
      toast.error(`Failed: ${(e as Error).message}`);
      setOverride((o) => {
        const n = { ...o };
        delete n[vars.id];
        return n;
      });
    },
  });

  const groups = STATUSES.map((s) => ({
    ...s,
    items: programs.filter((p) => (override[p.id] ?? p.current_status ?? "discovered") === s.value),
  }));

  const activeProgram = activeId ? programs.find((p) => p.id === activeId) : null;

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    if (!e.over) return;
    const programId = String(e.active.id);
    const newStatus = String(e.over.id).replace("col-", "");
    const program = programs.find((p) => p.id === programId);
    if (!program) return;
    const cur = override[programId] ?? program.current_status ?? "discovered";
    if (cur === newStatus) return;
    setOverride((o) => ({ ...o, [programId]: newStatus }));
    setStatus.mutate({ id: programId, status: newStatus });
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-3 min-w-max pb-2">
          {groups.map((g) => (
            <Column key={g.value} value={g.value} label={g.label} tone={g.tone as never} count={g.items.length}>
              {g.items.length === 0 && (
                <div className="rounded-lg border border-dashed border-[var(--color-line)] py-6 text-center text-[11px] text-[var(--color-ink-3)]">
                  drop here
                </div>
              )}
              {g.items.map((p) => (
                <Card key={p.id} program={p} onOpen={onOpen} dragging={activeId === p.id} />
              ))}
            </Column>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeProgram ? (
          <div className="rotate-1 rounded-lg border border-[var(--color-accent-500)] bg-[var(--color-paper-2)] p-3 shadow-[var(--shadow-3)] cursor-grabbing w-[300px]">
            <CardContent program={activeProgram} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  value, label, tone, count, children,
}: {
  value: string; label: string; tone: "warm" | "accent" | "success" | "warning" | "error" | "info"; count: number; children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${value}` });
  return (
    <div ref={setNodeRef} className={cn("w-[300px] flex-shrink-0 rounded-xl transition-colors", isOver && "bg-[var(--color-warm-100)] dark:bg-[var(--color-warm-800)]/40 ring-1 ring-[var(--color-accent-500)]")}>
      <div className="flex items-center justify-between px-1 mb-2 sticky top-0 z-[1]">
        <div className="flex items-center gap-2">
          <Badge tone={tone}>{label}</Badge>
          <span className="text-[11px] text-[var(--color-ink-3)] tabular-nums">{count}</span>
        </div>
      </div>
      <div className="space-y-1.5 px-0.5">{children}</div>
    </div>
  );
}

function Card({
  program, onOpen, dragging,
}: {
  program: ProgramWithMeta;
  onOpen?: (slug: string) => void;
  dragging: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: program.id });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, opacity: isDragging ? 0 : 1 }
    : { opacity: dragging ? 0 : 1 };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-lg border border-[var(--color-line)] bg-[var(--color-paper-2)] p-3 transition-colors hover:border-[var(--color-warm-400)] cursor-default"
    >
      <div className="flex items-start gap-1">
        <button
          {...listeners}
          {...attributes}
          aria-label="Drag"
          className="mt-0.5 h-4 w-4 grid place-items-center text-[var(--color-ink-3)] opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onOpen?.(program.slug)}
          className="flex-1 text-left min-w-0"
        >
          <CardContent program={program} />
        </button>
      </div>
    </div>
  );
}

function CardContent({ program }: { program: ProgramWithMeta }) {
  return (
    <>
      <div className="flex items-start gap-2">
        <TierDot tier={program.tier} />
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-semibold leading-tight truncate">{program.name}</div>
          <div className="text-[10.5px] text-[var(--color-ink-3)] mt-0.5 truncate">{program.org}</div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 flex-wrap">
        <Badge tone="warm" className="!text-[10px]">{program.kind}</Badge>
        {program.dilution === "non" && <Badge tone="success" className="!text-[10px]">non-dil</Badge>}
        {program.dilution === "zero" && <Badge tone="success" className="!text-[10px]">free</Badge>}
        {program.visa === "gated" && <Badge tone="warning" className="!text-[10px]">visa</Badge>}
      </div>
    </>
  );
}
