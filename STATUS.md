# KVASI Capital Calendar · Status

**Live:** https://kvasi-app.vercel.app
**Repo:** https://github.com/kvasi-ai/kvasi-app
**Password:** `kvasi-applies-now`
**Commit:** `78f983b` · 2026-05-09

---

## What works (interactive, end-to-end tested)

### Auth gate
- `/` and `/login` are public; everything else gated
- Password-cookie session, 30-day TTL, HMAC signed (Web Crypto, edge-runtime)
- `/api/auth/login` and `/api/auth/logout` work
- Sign-out from Settings clears cookie + redirects to `/login`

### Pages (all 6 + landing)
| Route | What it shows |
|---|---|
| `/` | Marketing landing — Fraunces hero, sign-in CTA |
| `/login` | Password input → session cookie |
| `/app/today` | Status-snapshot stats, upcoming-deadline list, Tier-1 rolling, open todos |
| `/app` (Programs) | 3 views (Timeline / Board / List), 7 filter dimensions |
| `/app/calendar` | 12-month grid, deadlines pinned by month, rolling strip on top |
| `/app/todos` | Full CRUD across all programs |
| `/app/inbox` | Unified activity feed (status changes + comments, newest first) |
| `/app/settings` | Theme switcher, team list, integrations, password change instructions, sign-out |

### Programs (66 total, all interactive)
- Click any card on Timeline / Board / List → slide-over detail panel
- Detail panel shows: tier, status pipeline (9-state dropdown), terms, **strategy note (inline-editable)**, **application tips** (3-5 per program), **deadline detail**, **sources** (cited URLs), todos CRUD, comments
- **Apply button** in panel header → opens validated official application URL
- Status change → toast + realtime broadcast to other open clients
- All 66 programs have validated `application_url`, tips, sources stored in `programs.metadata` JSONB

### Board view (Kanban)
- 9 columns by `current_status` (was tier placeholder — fixed)
- **Drag-and-drop** cards between columns to change status
- Optimistic UI + toast + DB write on drop
- Empty state per column

### Todos (full CRUD)
- Quick-add at top: title + program picker + due date
- Each row: toggle checkbox, click row to inline-edit, save/cancel buttons
- Hover → pencil edit + trash delete
- Overdue marker (red ⚠ + date)
- Auto-animate on add/remove
- Sections: Open · Done

### Command palette (⌘K / Ctrl+K)
- Open with ⌘K or `/`
- Searches: navigation, programs, status filters, tier filters, theme, sign out
- **G+letter chord hotkeys** (Linear-style):
  - `G T` → Today
  - `G P` → Programs
  - `G C` → Calendar
  - `G M` → My todos
  - `G I` → Inbox
  - `G S` → Settings

### Realtime
- Supabase channel subscribes to `program_status`, `todos`, `comments`
- Any change in any client invalidates queries everywhere → live sync across all 3 cofounder sessions

### Filter rail (workspace)
- 7 dimensions × multi-select chips × URL-synced (deep-linkable from command palette)
- Tier · Kind · Dilution · Citizenship · Location · Check size · Status

### Design system
- Warm-gray ramp (50–950) + accent orange `#E55A2B` ≤5% pixel budget
- Geist (sans) + Geist Mono + Fraunces (display) — all variable Google Fonts
- Light + dark mode (theme toggle in topbar + Settings)
- Tabular numerals for data, OpenType ss01/cv11
- Motion: 120/180/220/300 ms ladder, ease-out-expo entrances, ease-in-quad exits

### Statuses
- YC F26 = **Applied** ✅
- All 65 others = Discovered (default)

---

## What's deferred (Phase 4+)

| Item | Why deferred |
|---|---|
| Real auth (Google OAuth + magic link) | Password gate is fine for 3-cofounder team; OAuth requires per-user setup + Supabase auth migration |
| Daily digest email (Resend) | Requires Resend API key + domain DKIM setup — needs account creation |
| iCal feed export | Nice-to-have; depends on email cron infrastructure |
| Custom domain `app.kvasi.ai` | Requires DNS access on `kvasi.ai` — give me the registrar and I can wire it |
| Presence avatars in topbar | Realtime channel already running; just needs UI surface |

---

## Tech stack snapshot

```
Frontend:  Next.js 16 + React 19 + Tailwind v4 + tw-animate-css
Auth:      HMAC-signed cookie via Web Crypto (edge-safe)
DB:        Supabase Postgres + Realtime + RLS
Hosting:   Vercel (kvasi-app.vercel.app)
GitHub:    kvasi-ai/kvasi-app

Libraries: @tanstack/react-query, zustand-style state, RHF, Zod,
           cmdk, react-hotkeys-hook, dnd-kit, date-fns,
           sonner, lucide-react, @formkit/auto-animate, next-themes,
           @radix-ui/react-{dialog,dropdown-menu,etc}
```

---

## Files of note

- `db/schema.sql` — Postgres schema with RLS + realtime publication
- `scripts/seed.ts` — populates 66 programs + initial discovered status
- `scripts/apply-metadata.ts` — reads research JSONs, sets metadata + YC=applied
- `src/proxy.ts` — Next 16 middleware (renamed) for password gate
- `src/lib/auth.ts` — Web Crypto HMAC session tokens
- `src/components/shell/command-palette.tsx` — ⌘K palette
- `src/components/views/board-view.tsx` — drag-drop Kanban
- `src/components/detail/program-detail.tsx` — slide-over with all interactivity
- `src/app/app/todos/todos-client.tsx` — todos CRUD
