import { cookies } from "next/headers";
import { admin } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/shell/sidebar";
import { TopbarShell } from "@/components/shell/topbar-shell";
import { CommandPalette } from "@/components/shell/command-palette";
import { RealtimeBridge } from "@/components/shell/realtime-bridge";
import { SESSION_COOKIE, getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supa = admin();
  const { data } = await supa.from("programs").select("id, slug, name, org").order("tier").order("name");
  const programs = (data ?? []) as { id: string; slug: string; name: string; org: string }[];

  const jar = await cookies();
  const me = await getSessionUser(jar.get(SESSION_COOKIE)?.value, process.env.APP_AUTH_SECRET ?? "");

  return (
    <div className="flex h-screen bg-[var(--color-paper)]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopbarShell me={me} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <CommandPalette programs={programs} />
      <RealtimeBridge />
    </div>
  );
}
