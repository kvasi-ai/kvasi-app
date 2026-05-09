// Generated types placeholder. Replace with `supabase gen types typescript` output once schema is live.
export type Database = {
  public: {
    Tables: {
      programs: {
        Row: {
          id: string;
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
          custom_url: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["programs"]["Row"]> & {
          name: string;
          org: string;
          tier: number;
          kind: string;
          dilution: string;
          visa: string;
          loc: string;
        };
        Update: Partial<Database["public"]["Tables"]["programs"]["Row"]>;
      };
      program_status: {
        Row: {
          id: string;
          program_id: string;
          status: string;
          changed_by: string | null;
          changed_at: string;
        };
        Insert: { program_id: string; status: string; changed_by?: string | null };
        Update: Partial<Database["public"]["Tables"]["program_status"]["Row"]>;
      };
      todos: {
        Row: {
          id: string;
          program_id: string;
          title: string;
          done: boolean;
          due_date: string | null;
          assignee: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: { program_id: string; title: string; done?: boolean; due_date?: string | null; assignee?: string | null; position?: number };
        Update: Partial<Database["public"]["Tables"]["todos"]["Row"]>;
      };
      comments: {
        Row: {
          id: string;
          program_id: string;
          author: string | null;
          body: string;
          parent_comment_id: string | null;
          created_at: string;
        };
        Insert: { program_id: string; body: string; author?: string | null; parent_comment_id?: string | null };
        Update: Partial<Database["public"]["Tables"]["comments"]["Row"]>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          color: string | null;
          role: string;
          created_at: string;
        };
        Insert: { id?: string; email: string; name?: string | null; avatar_url?: string | null; color?: string | null; role?: string };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
    };
    Views: object;
    Functions: object;
    Enums: object;
  };
};
