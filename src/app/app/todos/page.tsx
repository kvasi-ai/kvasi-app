import { admin } from "@/lib/supabase/admin";
import { TodosClient } from "./todos-client";

export const dynamic = "force-dynamic";

export default async function TodosPage() {
  const supa = admin();
  const { data } = await supa.from("programs").select("id, name, slug").order("tier").order("name");
  const programs = (data ?? []) as { id: string; name: string; slug: string }[];
  return <TodosClient programs={programs} />;
}
