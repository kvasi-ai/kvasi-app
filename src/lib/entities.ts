// Entity types — shared by every Network page/component.
// Mirrors the `entities` and `entity_links` tables in db/migrations/003_entities.sql.

export type EntityType = "investor" | "angel" | "company" | "contact" | "program";

export type Entity = {
  id: string;
  type: EntityType;
  slug: string;
  name: string;
  org: string | null;
  properties: Record<string, unknown>;
  note: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
};

export type EntityLink = {
  id: string;
  from_id: string;
  to_id: string;
  context: string | null;
  created_at: string;
};

// Display-side metadata per type — color, icon hint, etc.
export const ENTITY_TYPES: Record<EntityType, { label: string; tone: string; accent: string }> = {
  investor: { label: "Investor", tone: "info",    accent: "var(--color-info)" },
  angel:    { label: "Angel",    tone: "accent",  accent: "var(--color-accent-500)" },
  company:  { label: "Company",  tone: "success", accent: "var(--color-success)" },
  contact:  { label: "Contact",  tone: "warm",    accent: "var(--color-warm-600)" },
  program:  { label: "Program",  tone: "warning", accent: "var(--color-warning)" },
};

export function getProp<T = string>(e: Pick<Entity, "properties">, key: string): T | undefined {
  return e.properties?.[key] as T | undefined;
}
