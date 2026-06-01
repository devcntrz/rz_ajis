# AGENTS.md — AI Agent Workflows & Task Assignments
## Anak Juara Information System (AJIS Web)
**Version:** 1.0.0  
**Date:** 2026-06  

---

## 1. Overview

This document defines how AI coding agents (Claude, GitHub Copilot, Cursor, etc.) should operate within the AJIS Web project. It describes task decomposition, agent specialization, handoff protocols, and guardrails to ensure consistent, high-quality output aligned with the TRD.

All agents MUST read `CLAUDE.md` before any coding task.

---

## 2. Agent Roles

### 2.1 Role Definitions

| Agent Role | Responsibility | Primary Files |
|---|---|---|
| **DB Agent** | Write and validate all raw SQL queries | `app/api/**/*.ts`, `lib/db.ts` |
| **API Agent** | Build route handlers, request validation, response shaping | `app/api/anakjuara/**/*.ts` |
| **UI Agent** | Build React components, pages, and layouts | `app/(dashboard)/**/*.tsx`, `components/**/*.tsx` |
| **Auth Agent** | Handle session, middleware, role scoping | `lib/auth.ts`, `middleware.ts` |
| **Cache Agent** | Implement caching layers, invalidation strategies | `lib/cache.ts`, SWR hooks |
| **Type Agent** | Define and maintain TypeScript interfaces | `types/**/*.ts` |
| **Test Agent** | Write unit and integration tests | `__tests__/**/*.ts` |

Each agent operates independently on its domain but must follow the handoff protocol in Section 5.

---

## 3. Task Decomposition by Feature

### 3.1 Authentication Module

**Sequence:** Auth Agent → API Agent → UI Agent

| Step | Agent | Task | Output |
|---|---|---|---|
| 1 | Auth Agent | Implement `getSession()`, `requireSession()`, session shape | `lib/auth.ts` |
| 2 | Auth Agent | Implement route protection middleware | `middleware.ts` |
| 3 | DB Agent | Write login SQL query (MD5 password check) | Query in `route.ts` |
| 4 | API Agent | Build `POST /api/anakjuara/auth/login` | `app/api/anakjuara/auth/login/route.ts` |
| 5 | API Agent | Build `POST /api/anakjuara/auth/logout` | `app/api/anakjuara/auth/logout/route.ts` |
| 6 | UI Agent | Build login page with username/password form | `app/(auth)/login/page.tsx` |
| 7 | UI Agent | Add logout button to `Topbar` and `Sidebar` | `components/layout/Topbar.tsx` |

**Acceptance criteria:**
- Correct MD5 password comparison against `ajis_user.password`
- Session persists across page navigations
- Middleware redirects unauthenticated users to `/login`
- Role (group user ID) and wilayah are stored in session and used in all queries

---

### 3.2 Dashboard Module

**Sequence:** DB Agent → API Agent → UI Agent

| Step | Agent | Task | Output |
|---|---|---|---|
| 1 | DB Agent | Aggregation query for stats (total anak, sesi, % kehadiran) | SQL in `route.ts` |
| 2 | DB Agent | Trend data query (attendance per session, last 8 sessions) | SQL in `route.ts` |
| 3 | API Agent | Build `GET /api/anakjuara/dashboard` | `app/api/anakjuara/dashboard/route.ts` |
| 4 | Cache Agent | Wrap dashboard query with `unstable_cache` (30s TTL) | Updated `route.ts` |
| 5 | UI Agent | Build dashboard page with StatCards | `app/(dashboard)/page.tsx` |
| 6 | UI Agent | Build `TrendChart` (AreaChart — Recharts, dynamic import) | `components/dashboard/TrendChart.tsx` |
| 7 | UI Agent | Build `HafalanBarChart` (horizontal bar, dynamic import) | `components/dashboard/HafalanBarChart.tsx` |
| 8 | UI Agent | Build status `PieChart` (dynamic import) | `components/dashboard/PieChart.tsx` |

**Acceptance criteria:**
- Dashboard loads in < 300ms (server-rendered initial data)
- Charts do not render on server (dynamic with ssr: false)
- Data is scoped to user's wilayah/kantor

---

### 3.3 Child Management Module (Anak)

**Sequence:** Type Agent → DB Agent → API Agent → Cache Agent → UI Agent

| Step | Agent | Task | Output |
|---|---|---|---|
| 1 | Type Agent | Define `Anak`, `AnakDetail`, `AnakListParams` | `types/anak.ts` |
| 2 | DB Agent | Write paginated + filtered list query | SQL string |
| 3 | DB Agent | Write detail query (single child + parent data) | SQL string |
| 4 | DB Agent | Write hafalan status query per child | SQL string |
| 5 | DB Agent | Write attendance history query per child | SQL string |
| 6 | API Agent | Build `GET /api/anakjuara/anak` (list with filters + pagination) | `route.ts` |
| 7 | API Agent | Build `GET /api/anakjuara/anak/[id]` (detail) | `route.ts` |
| 8 | API Agent | Build `GET /api/anakjuara/anak/[id]/hafalan` | `route.ts` |
| 9 | API Agent | Build `PUT /api/anakjuara/anak/[id]/hafalan` (toggle items) | `route.ts` |
| 10 | API Agent | Build `GET /api/anakjuara/anak/[id]/kehadiran` | `route.ts` |
| 11 | Cache Agent | SWR hook `useAnakList()` with filter params | `hooks/useAnakList.ts` |
| 12 | Cache Agent | SWR hook `useAnakDetail(id)` | `hooks/useAnakDetail.ts` |
| 13 | UI Agent | Build `AnakFilter` panel (advanced multi-filter) | `components/anak/AnakFilter.tsx` |
| 14 | UI Agent | Build `AnakTable` (Excel-style sticky, desktop) | `components/anak/AnakTable.tsx` |
| 15 | UI Agent | Build `AnakCard` (mobile stacked card) | `components/anak/AnakCard.tsx` |
| 16 | UI Agent | Build child list page | `app/(dashboard)/anak/page.tsx` |
| 17 | UI Agent | Build child profile page with 4 tabs | `app/(dashboard)/anak/[id]/page.tsx` |
| 18 | UI Agent | Build `HafalanChecklist` (3 categories, toggle, progress) | `components/anak/HafalanChecklist.tsx` |
| 19 | UI Agent | Build `KehadiranTable` (attendance history) | `components/anak/KehadiranTable.tsx` |

**Acceptance criteria:**
- Table renders > 50 children without lag (virtualization if needed)
- Sticky columns (#, ID, Nama) work in all Chromium and Safari
- Filter updates trigger SWR revalidation without full page reload
- Hafalan toggle saves optimistically, reverts on error

---

### 3.4 Coaching Sessions Module (Pembinaan)

**Sequence:** Type Agent → DB Agent → API Agent → UI Agent

| Step | Agent | Task | Output |
|---|---|---|---|
| 1 | Type Agent | Define `Pembinaan`, `Kehadiran`, `Mandiri` types | `types/pembinaan.ts` |
| 2 | DB Agent | Session list query with attendance aggregation | SQL string |
| 3 | DB Agent | Session detail query + per-child attendance/mandiri | SQL string |
| 4 | DB Agent | Insert/update session query | SQL string |
| 5 | DB Agent | Batch upsert kehadiran query | SQL string |
| 6 | DB Agent | Batch upsert mandiri aspects query | SQL string |
| 7 | API Agent | Build `GET /api/anakjuara/pembinaan` (list, filtered) | `route.ts` |
| 8 | API Agent | Build `POST /api/anakjuara/pembinaan` (create) | `route.ts` |
| 9 | API Agent | Build `GET /api/anakjuara/pembinaan/[id]` (detail) | `route.ts` |
| 10 | API Agent | Build `PUT /api/anakjuara/pembinaan/[id]` (update) | `route.ts` |
| 11 | API Agent | Build `DELETE /api/anakjuara/pembinaan/[id]` | `route.ts` |
| 12 | UI Agent | Build `PembinaanFilter` (advanced multi-filter) | `components/pembinaan/PembinaanFilter.tsx` |
| 13 | UI Agent | Build `PembinaanTable` (desktop datagrid with sticky cols) | `components/pembinaan/PembinaanTable.tsx` |
| 14 | UI Agent | Build `PembinaanCard` (mobile card per session) | `components/pembinaan/PembinaanCard.tsx` |
| 15 | UI Agent | Build `AttendanceMatrix` (Hadir/Izin/Alfa + 4 mandiri toggles per child) | `components/pembinaan/AttendanceMatrix.tsx` |
| 16 | UI Agent | Build `PembinaanForm` (create/edit form) | `components/pembinaan/PembinaanForm.tsx` |
| 17 | UI Agent | Build session list page | `app/(dashboard)/pembinaan/page.tsx` |
| 18 | UI Agent | Build session detail page | `app/(dashboard)/pembinaan/[id]/page.tsx` |
| 19 | UI Agent | Build session edit page | `app/(dashboard)/pembinaan/[id]/edit/page.tsx` |
| 20 | UI Agent | Build new session page | `app/(dashboard)/pembinaan/new/page.tsx` |

**Acceptance criteria:**
- Attendance matrix loads all children for the wilayah in < 500ms
- Mandiri toggles (Bantu Ortu, Sedekah, Shalat Wajib, Tilawah) save per child per session
- Filter panel supports: jenis, semester, pemateri, lokasi, date range, kehadiran %
- Mobile card shows per-session hadir/izin/alfa counts + progress bar

---

### 3.5 Evaluation Module (Penilaian)

**Sequence:** Type Agent → DB Agent → API Agent → Cache Agent → UI Agent

| Step | Agent | Task | Output |
|---|---|---|---|
| 1 | Type Agent | Define `Penilaian`, `AspekCerdas`, `AspekMandiri`, `NilaiHuruf` | `types/penilaian.ts` |
| 2 | DB Agent | Evaluation list query grouped by (id_anak, semester) | SQL string |
| 3 | DB Agent | Single evaluation detail query | SQL string |
| 4 | DB Agent | Upsert evaluation rows query | SQL string |
| 5 | DB Agent | Sync data source queries (attendance count, hafalan count, mandiri count) | SQL string |
| 6 | API Agent | Build `GET /api/anakjuara/penilaian` (list, filtered) | `route.ts` |
| 7 | API Agent | Build `GET /api/anakjuara/penilaian/[anakId]/[semester]` | `route.ts` |
| 8 | API Agent | Build `PUT /api/anakjuara/penilaian/[anakId]/[semester]` | `route.ts` |
| 9 | API Agent | Build `DELETE /api/anakjuara/penilaian/[anakId]/[semester]` | `route.ts` |
| 10 | API Agent | Build `POST /api/anakjuara/penilaian/sync` (single + massal) | `route.ts` |
| 11 | UI Agent | Build `PenilaianFilter` panel | `components/penilaian/PenilaianFilter.tsx` |
| 12 | UI Agent | Build `PenilaianTable` (desktop table — not cards) | `components/penilaian/PenilaianTable.tsx` |
| 13 | UI Agent | Build `PenilaianCard` (mobile card) | `components/penilaian/PenilaianCard.tsx` |
| 14 | UI Agent | Build `PivotTable` (children × all aspek, per-column filter dropdowns) | `components/penilaian/PivotTable.tsx` |
| 15 | UI Agent | Build `LaporanCard` (semester report tables matching screenshot format) | `components/penilaian/LaporanCard.tsx` |
| 16 | UI Agent | Build `PenilaianEditForm` (editable aspek cerdas + mandiri tables) | `components/penilaian/PenilaianEditForm.tsx` |
| 17 | UI Agent | Build evaluation list page (tabs: Daftar / Pivot) | `app/(dashboard)/penilaian/page.tsx` |
| 18 | UI Agent | Build evaluation detail page | `app/(dashboard)/penilaian/[anakId]/[semester]/page.tsx` |
| 19 | UI Agent | Build evaluation edit page | `app/(dashboard)/penilaian/[anakId]/[semester]/edit/page.tsx` |

**Acceptance criteria:**
- List view renders as table on desktop (not card grid)
- Pivot table has dropdown filter per aspek column; "Belum" option shows children with no data
- Sync generates correct nilai_huruf from score thresholds defined in `lib/utils.ts`
- Generate Massal only creates records for children without existing data for that semester
- Edit form shows full aspek cerdas (4 rows) and aspek mandiri (5 rows) in editable tables

---

## 4. Shared Utilities — `lib/utils.ts`

The following functions must be implemented here and reused across all features:

```typescript
// Score to evaluation grade
export function scoreToNilai(pct: number): NilaiHuruf { ... }

// Date formatting (Indonesian locale)
export function fmtTgl(date: string | Date): string { ... }

// Age calculation from birth date
export function calcAge(tgl_lahir: string): number { ... }

// Name initials for Avatar component
export function inits(name: string): string { ... }

// Scope condition builder for SQL based on user role
export function buildScopeSQL(session: SessionData): { where: string; params: unknown[] } { ... }

// Debounce helper (for search inputs)
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T { ... }
```

---

## 5. Handoff Protocol

When one agent completes a task and another picks up:

1. **Document the output** — the completing agent must add a brief comment block at the top of new files describing what was implemented.
2. **Type-first** — Type Agent must define interfaces before DB or API Agents begin.
3. **DB before API** — DB Agent writes and validates SQL before API Agent wraps it.
4. **API before UI** — API Agent must expose the endpoint before UI Agent writes the SWR hook.
5. **No blocking** — If an upstream dependency is not ready, stub it with a mock and leave a `// TODO: replace with real API` comment.

---

## 6. Quality Checklist

Before marking any task complete, the agent must verify:

### API Route Checklist
- [ ] Session is validated at the top of the handler
- [ ] Data is scoped by user's wilayah/kantor/role
- [ ] All SQL uses `?` placeholders (no string interpolation)
- [ ] Response follows `{ data: T, total?: number }` or `{ error: string }` shape
- [ ] HTTP status codes are correct (200, 201, 400, 401, 403, 404, 500)
- [ ] No `SELECT *` — always specify columns
- [ ] LIMIT + OFFSET present on all list queries

### UI Component Checklist
- [ ] Desktop view uses DataTable (sticky columns, horizontal scroll)
- [ ] Mobile view uses card layout (hidden on desktop via `datagrid-mobile` class)
- [ ] Loading state shows skeleton (not spinner) for list views
- [ ] Empty state is handled with a helpful message + action
- [ ] Filters update data without full page reload
- [ ] Error state shows toast notification
- [ ] All colors use design tokens from `T` object (no raw hex except in token definitions)
- [ ] Charts are wrapped in `dynamic()` with `ssr: false`

### SQL Checklist
- [ ] `EXPLAIN` run and no full table scan on tables > 1000 rows
- [ ] All WHERE columns are indexed (check existing schema)
- [ ] JOINs use indexed foreign keys
- [ ] Aggregation queries use GROUP BY correctly
- [ ] INSERT/UPDATE/DELETE use transactions where multiple rows are affected

---

## 7. Out-of-Scope for Agents

The following are explicitly outside agent scope for this project:

- **Do not** run `CREATE TABLE`, `ALTER TABLE`, or `DROP TABLE`.
- **Do not** write database migration files.
- **Do not** install new heavy dependencies without checking if the functionality exists in current packages.
- **Do not** implement file upload (photo management) unless explicitly requested.
- **Do not** implement PDF generation (out of scope for MVP).
- **Do not** implement real-time features (websockets, SSE) — not needed.
- **Do not** change the authentication method — use MD5 to match existing `ajis_user.password`.

---

## 8. Reference Files

| File | Purpose |
|---|---|
| `AnakJuara.jsx` | UI prototype — extract components and logic, do not ship as-is |
| `newajis.sql` | Existing DB schema — read only, never execute DDL from this |
| `itemhafalan.sql` | Hafalan master data — already in DB, use `ajis_item_hafalan` table |
| `prd.md` | Product requirements — what to build and why |
| `trd.md` | Technical requirements — how to build it |
| `CLAUDE.md` | Agent rules — always read first |
| `agents.md` | This file — task decomposition and workflows |

---

## 9. Development Order

Recommended build sequence for fastest working prototype:

```
Phase 1 — Foundation (Week 1)
  ├── lib/db.ts                    (DB Agent)
  ├── lib/auth.ts                  (Auth Agent)
  ├── middleware.ts                 (Auth Agent)
  ├── types/*.ts                   (Type Agent)
  ├── lib/utils.ts                 (any agent)
  └── app/(auth)/login/page.tsx   (UI Agent)

Phase 2 — Core APIs (Week 1–2)
  ├── POST /auth/login + /logout
  ├── GET  /anak (list + filters)
  ├── GET  /anak/[id] (detail)
  ├── GET  /pembinaan (list)
  ├── POST /pembinaan (create)
  └── GET  /dashboard

Phase 3 — Core UI (Week 2–3)
  ├── Sidebar + Topbar layout
  ├── Dashboard page (charts)
  ├── Anak list page (table + mobile cards)
  ├── Anak detail page (4 tabs)
  └── Pembinaan list page

Phase 4 — Evaluation System (Week 3–4)
  ├── Hafalan toggle API + checklist UI
  ├── POST /penilaian/sync
  ├── Penilaian list page (table + pivot)
  ├── Penilaian detail + edit
  └── LaporanCard (semester report)

Phase 5 — Polish & Performance (Week 4)
  ├── Caching (unstable_cache + SWR config)
  ├── Skeleton loaders
  ├── Error boundaries
  ├── Mobile responsiveness audit
  └── Vercel deployment + env setup
```
