# CLAUDE.md — AI Development Instructions
## Anak Juara Information System (AJIS Web)
**Project:** Rumah Zakat Anak Juara — Next.js 14 Web Application  
**Read this file at the start of every session.**

---

## 1. Project Identity

This is a **Next.js 14 App Router** web application for Rumah Zakat's Anak Juara child sponsorship program. The application manages: child profiles, coaching sessions (pembinaan), Quran memorization tracking (hafalan), and semester evaluations (penilaian).

The app is written in **TypeScript**, deployed on **Vercel**, and connects to an existing **MySQL** database. The UI language is **English** for code and documentation; the user interface text is in **Bahasa Indonesia**.

---

## 2. Strict Rules — Always Follow

### 2.1 Database Rules
- **NEVER use an ORM.** All database queries must be written as raw SQL strings using `mysql2/promise`.
- **NEVER run migrations.** The schema already exists. Do not CREATE, ALTER, or DROP any tables.
- **NEVER seed data.** Do not write seed scripts or INSERT test data into production tables.
- Always use parameterized queries. Never interpolate user input directly into SQL strings.
- Use the `query<T>()` and `queryOne<T>()` helpers from `lib/db.ts`.

```typescript
// CORRECT
const rows = await query<Anak>(
  'SELECT id_anak, nama_lengkap FROM ajis_anak WHERE id_wilayah_pembinaan = ?',
  [wilayahId]
);

// WRONG — never do this
const rows = await db.anak.findMany({ where: { id_wilayah_pembinaan: wilayahId } });
```

### 2.2 API Rules
- All API routes live under `app/api/anakjuara/`.
- API routes are always separate from page components.
- Every route handler must validate the session before processing.
- Return consistent error shapes: `{ error: string, code?: string }`.
- All list endpoints support pagination via `page` and `limit` query params.
- Use `NextResponse.json()` for all responses.

### 2.3 Architecture Rules
- Use **Next.js App Router** file conventions: `page.tsx`, `layout.tsx`, `route.ts`.
- Prefer **React Server Components** for read-only page content.
- Use `"use client"` only for components that require browser APIs, event handlers, or local state.
- Charts (Recharts) must be loaded with `dynamic(() => import(...), { ssr: false })`.
- Shared UI components live in `components/ui/`. Feature components live in `components/[feature]/`.

### 2.4 TypeScript Rules
- Enable strict mode. No `any` types unless explicitly justified with a comment.
- All API response types must be defined in `types/`.
- Use `interface` for object shapes, `type` for unions/aliases.

---

## 3. Key Files to Know

| File | Purpose |
|---|---|
| `lib/db.ts` | MySQL connection pool — use `query<T>()` and `queryOne<T>()` |
| `lib/auth.ts` | Session management with `iron-session` |
| `lib/cache.ts` | `unstable_cache` wrappers for read-heavy data |
| `lib/utils.ts` | `scoreToNilai()`, `fmtTgl()`, `calcAge()`, `inits()` |
| `middleware.ts` | Auth guard for all non-API routes |
| `types/anak.ts` | `Anak`, `AnakDetail` interfaces |
| `types/pembinaan.ts` | `Pembinaan`, `Kehadiran`, `Mandiri` interfaces |
| `types/penilaian.ts` | `Penilaian`, `AspekCerdas`, `AspekMandiri`, `NilaiHuruf` |
| `types/hafalan.ts` | `HafalanItem` interface |

---

## 4. Database Schema Quick Reference

### Tables Used (do not modify)
```sql
ajis_anak              -- child records (id_anak, nama_lengkap, jns_kel, ...)
ajis_pembinaan_baru    -- coaching sessions (id_pembinaan, tgl_pembinaan, ...)
ajis_penilaian         -- evaluations, hafalan, catatan (row-per-item structure)
ajis_item_hafalan      -- master hafalan items (jenis: 2=Quran, 3=Shalat, 4=Doa)
ajis_user              -- user auth (username, password=MD5, id_group_user, id_wilayah_pembinaan)
ajis_sdm_wilayah       -- coordinator profiles
ajis_wilayah_pembinaan -- regional mapping
ajis_kantor            -- branch offices
```

### Role Scoping
```typescript
// id_group_user = 1 → Super Admin (no filter)
// id_group_user = 2 → Branch Admin (filter by id_kantor)
// id_group_user = 9 → Korwil (filter by id_wilayah_pembinaan)
```

### `ajis_penilaian` Row Model
Each evaluation item is ONE row. Columns: `id_anak`, `semester`, `aspek`, `item_aspek`, `kondisi_awal`, `perkembangan`, `nilai_huruf`, `urutan`.

### Score → Nilai Conversion
```typescript
function scoreToNilai(pct: number): NilaiHuruf {
  if (pct >= 90) return 'Excellent';
  if (pct >= 75) return 'Good';
  if (pct >= 55) return 'Average';
  if (pct >= 35) return 'Below Average';
  return 'Poor';
}
```

---

## 5. Design Tokens

```typescript
const T = {
  primary:     '#BF4E02',
  primaryDk:   '#8F3A01',
  primaryLt:   '#D96A1A',
  primaryPale: '#FBF0E8',
  primarySoft: '#F0C4A0',
  white:       '#FFFFFF',
  bg:          '#FFFFFF',
  charcoal:    '#1A0A00',
  gray:        '#7A6055',
  grayLt:      '#F2EAE3',
  green:       '#1A7A45',
  greenPale:   '#E5F5ED',
  blue:        '#1A5FA8',
  bluePale:    '#E5EEF8',
  red:         '#B02020',
  redPale:     '#FDEAEA',
  gold:        '#B87800',
  goldPale:    '#FDF4DC',
};
```

- Font: **Source Sans Pro** (Google Fonts, weights 300/400/600/700/900)
- Sidebar background: solid `#BF4E02`, white text
- Mobile bottom nav: solid `#BF4E02`, white text
- Breakpoint: 700px (desktop table above, mobile cards below)

---

## 6. Component Conventions

### UI Components (`components/ui/`)
These are design-system primitives. When writing a new page, use existing UI components rather than duplicating inline styles.

```tsx
// Use existing components
import { Badge }    from '@/components/ui/Badge';
import { Btn }      from '@/components/ui/Btn';
import { Card }     from '@/components/ui/Card';
import { CardHead } from '@/components/ui/CardHead';
import { DataTable } from '@/components/ui/DataTable';
import { TabBar }   from '@/components/ui/TabBar';
import { NilaiBadge } from '@/components/ui/NilaiBadge';
import { BarLine }  from '@/components/ui/BarLine';
import { Avatar }   from '@/components/ui/Avatar';
import { Toggle }   from '@/components/ui/Toggle';
import { Modal }    from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { FLabel }   from '@/components/ui/FLabel';
```

### DataTable Pattern (Desktop Excel / Mobile Cards)
- **Desktop (> 700px):** Horizontal-scroll `<table>` with first 2–3 columns sticky (`position: sticky`).
- **Mobile (≤ 700px):** Stacked card list.
- Use CSS classes `datagrid-desktop` / `datagrid-mobile` with media query toggle.

### SWR Hook Pattern
```typescript
import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useAnakList(params: AnakListParams) {
  const qs = new URLSearchParams(params as Record<string, string>);
  return useSWR(`/api/anakjuara/anak?${qs}`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });
}
```

---

## 7. Performance Guidelines

1. **Debounce text search inputs** — 300ms before triggering SWR refetch.
2. **Cache master data** — Hafalan items, wilayah list, kantor list: cache with `unstable_cache` for 1 hour.
3. **Invalidate on mutation** — After POST/PUT/DELETE, call `mutate()` or `revalidateTag()`.
4. **Lazy load charts** — Use `dynamic()` with `{ ssr: false }` for all Recharts components.
5. **Pagination** — Default `limit: 50` for list endpoints. Never fetch all rows without a LIMIT.
6. **EXPLAIN before shipping** — Run `EXPLAIN` on any SQL query that touches tables > 1000 rows.
7. **React.memo** — Wrap table row components to prevent re-renders on filter changes.

---

## 8. What the Reference JSX File Is

The file `AnakJuara.jsx` in the project root is a **single-page prototype** — it demonstrates the complete UI design, data structures, component interactions, and seed data for reference. It is **not the production app**.

When building the real Next.js app:
- Extract individual components from the JSX prototype into separate files.
- Replace in-memory seed data with real API calls.
- Split the single App component into proper Next.js pages.
- Keep all visual styling (colors, layout, spacing) consistent with the prototype.
- The logic for score computation, hafalan counting, and sync generation lives in the prototype and should be ported to `lib/utils.ts` and the `/api/anakjuara/penilaian/sync/route.ts`.

---

## 9. Session When Starting Work

When beginning a new coding session, read these files first:
1. `CLAUDE.md` (this file)
2. `lib/db.ts` — understand the query helpers
3. `lib/auth.ts` — understand the session shape
4. The relevant `types/` file for the feature being worked on
5. The existing route handler if modifying an API

---

## 10. Common Mistakes to Avoid

| Mistake | Correct Approach |
|---|---|
| Using Prisma, Drizzle, or any ORM | Use raw SQL via `mysql2/promise` |
| `CREATE TABLE` or `ALTER TABLE` | Never. Schema exists. |
| `type: any` | Define a proper interface in `types/` |
| Fetching data in a Client Component | Use Server Component or SWR hook |
| Importing Recharts at top-level | Use `dynamic(() => import('recharts'), { ssr: false })` |
| `SELECT *` on large tables | Always specify columns, always add WHERE + LIMIT |
| No session check in API route | Always call `getSession()` at top of route handler |
| String interpolation in SQL | Always use `?` placeholders |
| `console.log` in production code | Use `console.error` only for caught errors |
