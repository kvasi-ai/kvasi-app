"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Trash2 } from "lucide-react";
import { dbWrite } from "@/lib/db-write";
import { cn } from "@/lib/utils";

type Variant = "icon" | "menu-item";

export function DeleteProgramButton({
  programId,
  programName,
  variant = "icon",
  onDeleted,
  className,
}: {
  programId: string;
  programName: string;
  variant?: Variant;
  onDeleted?: () => void;
  className?: string;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const del = useMutation({
    mutationFn: async () => {
      await dbWrite({ table: "programs", op: "delete", id: programId });
    },
    onSuccess: () => {
      toast.success(`Deleted "${programName}"`);
      qc.invalidateQueries({ queryKey: ["programs"] });
      qc.invalidateQueries({ queryKey: ["todos"] });
      qc.invalidateQueries({ queryKey: ["comments"] });
      setOpen(false);
      onDeleted?.();
    },
    onError: (e) => {
      toast.error(`Delete failed: ${(e as Error).message}`);
    },
  });

  const trigger =
    variant === "icon" ? (
      <button
        type="button"
        aria-label={`Delete ${programName}`}
        title="Delete program"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(true);
        }}
        className={cn(
          "inline-flex items-center justify-center h-6 w-6 rounded-full text-[var(--color-ink-3)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-soft)] transition-colors",
          className,
        )}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    ) : (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          "inline-flex items-center gap-1.5 text-[12px] text-[var(--color-error)] hover:bg-[var(--color-error-soft)] rounded px-2 py-1 transition-colors",
          className,
        )}
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete program
      </button>
    );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          onClick={(e) => e.stopPropagation()}
          className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-5 shadow-[var(--shadow-4)]"
        >
          <Dialog.Title className="font-[family-name:var(--font-display)] text-[20px] tracking-tight mb-1.5">
            Delete program?
          </Dialog.Title>
          <Dialog.Description className="text-[13px] text-[var(--color-ink-2)] mb-4 leading-relaxed">
            This permanently removes <span className="font-semibold text-[var(--color-ink)]">{programName}</span>{" "}
            from the workspace, along with its status history, todos, and comments. This cannot be undone.
          </Dialog.Description>
          <div className="flex justify-end gap-2">
            <Dialog.Close className="text-[12.5px] text-[var(--color-ink-2)] hover:text-[var(--color-ink)] px-3 py-1.5 rounded">
              Cancel
            </Dialog.Close>
            <button
              type="button"
              disabled={del.isPending}
              onClick={() => del.mutate()}
              className="text-[12.5px] text-white bg-[var(--color-error)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded font-semibold inline-flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {del.isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
