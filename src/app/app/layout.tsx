import { cookies } from "next/headers";
import { admin } from "@/lib/supabase/admin";
import { Sidebar } from "@/components/shell/sidebar";
import { TopbarShell } from "@/components/shell/topbar-shell";
import { CommandPalette } from "@/components/shell/command-palette";
import { RealtimeBridge } from "@/components/shell/realtime-bridge";
import { IdentityPicker } from "@/components/shell/identity-picker";
import { WHO_COOKIE, isAppUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supa = admin();
  const { data } = await supa.from("programs").select("id, slug, name, org").order("tier").order("name");
  const programs = (data ?? []) as { id: string; slug: string; name: string; org: string }[];

  const jar = await cookies();
  const whoRaw = jar.get(WHO_COOKIE)?.value;
  const me = isAppUser(whoRaw) ? whoRaw : null;

  return (
    <div className="flex h-screen bg-[var(--color-paper)]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopbarShell me={me} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <CommandPalette programs={programs} />
      <RealtimeBridge />
      <IdentityPicker currentUser={me} />
    </div>
  );
}
