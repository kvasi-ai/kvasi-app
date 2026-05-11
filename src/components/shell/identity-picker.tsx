"use client";
import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { KNOWN_USERS, type AppUser } from "@/lib/auth";

const USER_META: Record<AppUser, { label: string; color: string }> = {
  anuj:    { label: "Anuj",    color: "#E55A2B" },
  shreyas: { label: "Shreyas", color: "#5BA3E5" },
  niketan: { label: "Niketan", color: "#7BC97B" },
};

// Forces a one-shot identity selection on first /app entry after login.
// Cannot be dismissed without picking — that's the point.
export function IdentityPicker({ open: forcedOpen, currentUser }: { open?: boolean; currentUser: string | null }) {
  const r = useRouter();
  const [open, setOpen] = React.useState(forcedOpen ?? !currentUser);
  const [picking, setPicking] = React.useState<AppUser | null>(null);

  // If the server tells us identity is missing, keep modal open.
  React.useEffect(() => {
    if (!currentUser) setOpen(true);
  }, [currentUser]);

  async function pick(user: AppUser) {
    setPicking(user);
    const res = await fetch("/api/auth/identity", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ user }),
    });
    if (res.ok) {
      setOpen(false);
      // Re-render the tree so SSR `me` updates everywhere.
      r.refresh();
    } else {
      setPicking(null);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { /* block dismiss */ if (currentUser) setOpen(o); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          onEscapeKeyDown={(e) => { if (!currentUser) e.preventDefault(); }}
          onPointerDownOutside={(e) => { if (!currentUser) e.preventDefault(); }}
          onInteractOutside={(e) => { if (!currentUser) e.preventDefault(); }}
          className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--color-line)] bg-[var(--color-paper-2)] p-6 shadow-[var(--shadow-4)]"
        >
          <Dialog.Title className="font-[family-name:var(--font-display)] text-[28px] tracking-tight font-medium mb-1">
            Who are you?
          </Dialog.Title>
          <Dialog.Description className="text-[13px] text-[var(--color-ink-2)] mb-5">
            Pick yourself so the team knows who&apos;s active. You can switch later from Settings.
          </Dialog.Description>

          <div className="grid grid-cols-3 gap-2">
            {KNOWN_USERS.map((u) => {
              const meta = USER_META[u];
              const loading = picking === u;
              return (
                <button
                  key={u}
                  type="button"
                  onClick={() => pick(u)}
                  disabled={picking !== null}
                  className={cn(
                    "rounded-xl border px-4 py-5 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed",
                    "border-[var(--color-line)] hover:border-[var(--color-accent-500)] hover:bg-[var(--color-paper)] hover:shadow-[var(--shadow-1)]",
                    loading && "border-[var(--color-accent-500)] bg-[var(--color-paper)]",
                  )}
                >
                  <span
                    className="grid h-12 w-12 mx-auto place-items-center rounded-full text-white text-[16px] font-bold mb-2.5"
                    style={{ background: meta.color }}
                  >
                    {meta.label.charAt(0)}
                  </span>
                  <div className="text-[13px] font-semibold tracking-tight">{meta.label}</div>
                  {loading && (
                    <div className="text-[10.5px] text-[var(--color-ink-3)] mt-1 inline-flex items-center gap-1">
                      Entering <ArrowRight className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
