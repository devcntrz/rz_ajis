# Technical Requirements Document (TRD)
## Anak Juara Information System — AJIS Web
**Version:** 1.0.0  
**Date:** 2026-06  
**Stack:** Next.js 14 (App Router) + MySQL + Vercel  
**Status:** Draft

---

## 1. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | `app/` directory, React Server Components |
| Language | TypeScript | Strict mode enabled |
| Database | MySQL 5.7+ | Existing AJIS schema, no migrations |
| DB Client | `mysql2` (raw queries only) | No ORM — all queries are raw SQL strings |
| Styling | Tailwind CSS + inline styles | Design tokens via CSS variables / Tailwind config |
| Charts | Recharts | Same library as reference JSX |
| Icons | Lucide React | Same library as reference JSX |
| Auth | Custom session (iron-session or next-auth credentials) | MD5 password hash matching existing `ajis_user.password` |
| Hosting | Vercel | Edge-compatible config, serverless functions |
| Caching | Next.js `unstable_cache` + React `cache()` + SWR/React Query on client | Aggressive caching for read-heavy list data |

---

## 2. Project Structure

```
ajis-web/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                  # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Sidebar + topbar shell (authenticated)
│   │   ├── page.tsx                      # Beranda / Dashboard
│   │   ├── anak/
│   │   │   ├── page.tsx                  # Child list (Excel table)
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Child profile detail (4 tabs)
│   │   ├── pembinaan/
│   │   │   ├── page.tsx                  # Session list (datagrid)
│   │   │   └── [id]/
│   │   │       ├── page.tsx              # Session detail
│   │   │       └── edit/
│   │   │           └── page.tsx          # Session edit form
│   │   ├── pembinaan/new/
│   │   │   └── page.tsx                  # New session form
│   │   └── penilaian/
│   │       ├── page.tsx                  # Evaluation list + pivot tab
│   │       └── [anakId]/[semester]/
│   │           ├── page.tsx              # Evaluation detail
│   │           └── edit/
│   │               └── page.tsx          # Evaluation edit form
│   ├── api/
│   │   └── anakjuara/
│   │       ├── auth/
│   │       │   ├── login/route.ts        # POST /api/anakjuara/auth/login
│   │       │   └── logout/route.ts       # POST /api/anakjuara/auth/logout
│   │       ├── anak/
│   │       │   ├── route.ts              # GET (list), POST (create)
│   │       │   └── [id]/
│   │       │       ├── route.ts          # GET (detail), PUT (update), DELETE
│   │       │       ├── hafalan/
│   │       │       │   └── route.ts      # GET, PUT (toggle batch)
│   │       │       ├── kehadiran/
│   │       │       │   └── route.ts      # GET attendance history
│   │       │       └── penilaian/
│   │       │           └── route.ts      # GET penilaian for child
│   │       ├── pembinaan/
│   │       │   ├── route.ts              # GET (list), POST (create)
│   │       │   └── [id]/
│   │       │       ├── route.ts          # GET, PUT, DELETE
│   │       │       └── kehadiran/
│   │       │           └── route.ts      # GET, PUT attendance matrix
│   │       ├── penilaian/
│   │       │   ├── route.ts              # GET (list), POST (create/upsert)
│   │       │   ├── sync/
│   │       │   │   └── route.ts          # POST sync/generate from data
│   │       │   └── [anakId]/[semester]/
│   │       │       └── route.ts          # GET, PUT, DELETE
│   │       ├── hafalan/
│   │       │   └── items/
│   │       │       └── route.ts          # GET all item_hafalan master
│   │       ├── dashboard/
│   │       │   └── route.ts              # GET aggregated stats
│   │       └── wilayah/
│   │           └── route.ts              # GET wilayah list (for filters)
│   ├── layout.tsx                        # Root layout (fonts, metadata)
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── Avatar.tsx
│   │   ├── Badge.tsx
│   │   ├── BarLine.tsx
│   │   ├── Btn.tsx
│   │   ├── Card.tsx
│   │   ├── CardHead.tsx
│   │   ├── DataTable.tsx                 # Reusable Excel-style sticky table
│   │   ├── FLabel.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── NilaiBadge.tsx
│   │   ├── Sel.tsx
│   │   ├── SkeletonRow.tsx
│   │   ├── StatCard.tsx
│   │   ├── TabBar.tsx
│   │   ├── Textarea.tsx
│   │   └── Toggle.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── MobileNav.tsx
│   ├── anak/
│   │   ├── AnakTable.tsx                 # Desktop Excel table
│   │   ├── AnakCard.tsx                  # Mobile card
│   │   ├── AnakFilter.tsx                # Advanced filter panel
│   │   ├── AnakProfile.tsx               # Profile hero + KPI row
│   │   ├── HafalanChecklist.tsx          # Checklist by category
│   │   └── KehadiranTable.tsx            # Attendance history table
│   ├── pembinaan/
│   │   ├── PembinaanTable.tsx
│   │   ├── PembinaanCard.tsx             # Mobile card
│   │   ├── PembinaanFilter.tsx
│   │   ├── AttendanceMatrix.tsx          # Hadir/Izin/Alfa + mandiri grid
│   │   └── PembinaanForm.tsx
│   ├── penilaian/
│   │   ├── PenilaianTable.tsx            # Desktop table (list view)
│   │   ├── PenilaianCard.tsx             # Mobile card
│   │   ├── PenilaianFilter.tsx
│   │   ├── PivotTable.tsx                # Pivot with column filters
│   │   ├── LaporanCard.tsx               # Semester report display
│   │   └── PenilaianEditForm.tsx
│   └── dashboard/
│       ├── TrendChart.tsx
│       ├── PieChart.tsx
│       └── HafalanBarChart.tsx
├── lib/
│   ├── db.ts                             # MySQL connection pool
│   ├── auth.ts                           # Session helpers
│   ├── cache.ts                          # Cache wrappers
│   └── utils.ts                          # Shared utilities (date, score → nilai, etc.)
├── types/
│   ├── anak.ts
│   ├── pembinaan.ts
│   ├── penilaian.ts
│   ├── hafalan.ts
│   └── user.ts
├── hooks/
│   ├── useAnakList.ts                    # SWR hook for child list
│   ├── usePembinaan.ts
│   ├── usePenilaian.ts
│   └── useHafalan.ts
├── middleware.ts                          # Auth guard for (dashboard) routes
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 3. Database Connection

### 3.1 Connection Pool — `lib/db.ts`
```typescript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT ?? 3306),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  connectTimeout:     10_000,
  timezone:           '+07:00',
});

export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return rows as T[];
}

export async function queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export default pool;
```

### 3.2 Environment Variables
```env
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=ajis_db
SESSION_SECRET=random-32-char-secret
NEXT_PUBLIC_APP_URL=https://ajis.vercel.app
```

---

## 4. API Routes — Specification

All routes live under `app/api/anakjuara/`. All use raw SQL. No ORM.

### 4.1 Auth

#### `POST /api/anakjuara/auth/login`
```
Body: { username: string, password: string }
Response: { user: UserSession } | { error: string }
```
- Hash password with MD5, compare against `ajis_user.password`
- Set encrypted session cookie on success
- Return `id_user`, `username`, `nama_kantor`, `nama_wilayah`, `id_group_user`, `id_wilayah_pembinaan`

Raw query:
```sql
SELECT id_user, username, id_kantor, nama_kantor, nama_wilayah,
       id_group_user, id_wilayah_pembinaan
FROM   ajis_user
WHERE  username = ? AND password = MD5(?) AND aktif = 'y'
LIMIT  1
```

#### `POST /api/anakjuara/auth/logout`
- Destroy session cookie. Return `{ ok: true }`.

---

### 4.2 Anak (Children)

#### `GET /api/anakjuara/anak`
Query params: `wilayah`, `status_ortu`, `jenjang`, `asnaf`, `q`, `page`, `limit`

```sql
SELECT a.id_anak, a.nama_lengkap, a.nama_panggilan, a.jns_kel,
       a.jenjang_pendidikan, a.kelas, a.nama_sekolah,
       a.asnaf, a.status_ortu, a.status_tersantuni,
       a.nama_wilayah, a.nama_kantor,
       a.tgl_lahir, a.tgl_terdaftar, a.foto
FROM   ajis_anak a
WHERE  a.id_wilayah_pembinaan = ?          -- scoped by user role
  AND  (? IS NULL OR a.status_ortu = ?)
  AND  (? IS NULL OR a.jenjang_pendidikan = ?)
  AND  (? IS NULL OR a.asnaf = ?)
  AND  (? IS NULL OR a.nama_lengkap LIKE CONCAT('%',?,'%')
                  OR a.nama_panggilan LIKE CONCAT('%',?,'%'))
ORDER  BY a.nama_lengkap
LIMIT  ? OFFSET ?
```

#### `GET /api/anakjuara/anak/[id]`
Full child detail + parent data.

#### `PUT /api/anakjuara/anak/[id]`
Update child record. Parameterized UPDATE query on `ajis_anak`.

#### `GET /api/anakjuara/anak/[id]/hafalan`
Returns all hafalan items with completion status:
```sql
-- ajis_penilaian stores hafalan as rows with aspek='Hafalan Alquran' etc.
-- We derive completion from existing penilaian rows or a dedicated hafalan table.
SELECT ih.id, ih.jenis, ih.konten,
       CASE WHEN ph.id_anak IS NOT NULL THEN 1 ELSE 0 END AS selesai
FROM   ajis_item_hafalan ih
LEFT JOIN ajis_penilaian ph
       ON ph.id_anak = ? AND ph.item_aspek = ih.konten AND ph.semester = ?
ORDER  BY ih.jenis, ih.id
```

#### `PUT /api/anakjuara/anak/[id]/hafalan`
```
Body: { semester: string, items: Array<{ id: number, selesai: boolean }> }
```
Upsert rows in `ajis_penilaian` for hafalan items.

#### `GET /api/anakjuara/anak/[id]/kehadiran`
Returns attendance per session for this child:
```sql
SELECT pb.id_pembinaan, pb.tgl_pembinaan, pb.pertemuan_ke,
       pb.jenis_pembinaan, pb.tema, pb.nama_pemateri, pb.lokasi,
       pb.waktu_mulai, pb.semester,
       CASE WHEN kh.status_kehadiran = 'hadir' THEN 'hadir'
            WHEN kh.status_kehadiran = 'izin'  THEN 'izin'
            ELSE 'alfa' END AS status_kehadiran
FROM   ajis_pembinaan_baru pb
LEFT JOIN ajis_kehadiran_pembinaan kh
       ON kh.id_pembinaan = pb.id_pembinaan AND kh.id_anak = ?
WHERE  pb.id_wilayah_pembinaan = ?
ORDER  BY pb.tgl_pembinaan DESC
```

---

### 4.3 Pembinaan (Coaching Sessions)

#### `GET /api/anakjuara/pembinaan`
Query params: `jenis`, `semester`, `pemateri`, `lokasi`, `tgl_dari`, `tgl_sampai`, `kehadiran_min`, `q`, `page`, `limit`

```sql
SELECT pb.id_pembinaan, pb.tgl_pembinaan, pb.pertemuan_ke,
       pb.jenis_pembinaan, pb.tema, pb.nama_pemateri,
       pb.lokasi, pb.waktu_mulai, pb.semester,
       COUNT(CASE WHEN kh.status_kehadiran='hadir' THEN 1 END) AS jumlah_hadir,
       COUNT(CASE WHEN kh.status_kehadiran='izin'  THEN 1 END) AS jumlah_izin,
       COUNT(kh.id_anak) - COUNT(CASE WHEN kh.status_kehadiran IN ('hadir','izin') THEN 1 END) AS jumlah_alfa
FROM   ajis_pembinaan_baru pb
LEFT JOIN ajis_kehadiran_pembinaan kh ON kh.id_pembinaan = pb.id_pembinaan
WHERE  pb.id_wilayah_pembinaan = ?
  AND  (? IS NULL OR pb.jenis_pembinaan = ?)
  AND  (? IS NULL OR pb.semester = ?)
  -- ... other filters
GROUP  BY pb.id_pembinaan
ORDER  BY pb.tgl_pembinaan DESC
LIMIT  ? OFFSET ?
```

#### `POST /api/anakjuara/pembinaan`
```
Body: {
  tgl_pembinaan, pertemuan_ke, jenis_pembinaan, tema,
  nama_pemateri, lokasi, waktu_mulai, semester, catatan,
  kehadiran: Record<anakId, 'hadir'|'izin'|'alfa'>,
  mandiri: Record<anakId, { bantu_ortu, sedekah, shalat_wajib, tilawah }>
}
```
Inserts into `ajis_pembinaan_baru` then batch upserts kehadiran and mandiri rows.

#### `GET /api/anakjuara/pembinaan/[id]`
Session detail including full attendance matrix.

#### `PUT /api/anakjuara/pembinaan/[id]`
Update session + rebuild attendance/mandiri rows.

#### `DELETE /api/anakjuara/pembinaan/[id]`
Soft delete or hard delete based on config.

---

### 4.4 Penilaian (Evaluations)

#### `GET /api/anakjuara/penilaian`
Query params: `semester`, `wilayah`, `kelas`, `nilai_cerdas`, `nilai_mandiri`, `q`

Groups `ajis_penilaian` rows by child + semester, returns summary:
```sql
SELECT p.id_anak, p.nama_anak, p.nama_wilayah_pembinaan,
       p.semester, p.tgl_penilaian,
       MAX(CASE WHEN p.aspek='Aspek Cerdas' THEN p.nilai_huruf END) AS nilai_cerdas,
       MAX(CASE WHEN p.aspek='Aspek Mandiri' THEN p.nilai_huruf END) AS nilai_mandiri
FROM   ajis_penilaian p
WHERE  p.id_wilayah_pembinaan = ?
  AND  p.semester = ?
GROUP  BY p.id_anak, p.semester
ORDER  BY p.nama_anak
```

#### `GET /api/anakjuara/penilaian/[anakId]/[semester]`
Returns full evaluation detail — all rows for this child+semester grouped by aspek.

#### `PUT /api/anakjuara/penilaian/[anakId]/[semester]`
```
Body: {
  aspek_cerdas: Array<{ item_aspek, target, kondisi_awal, perkembangan, nilai_huruf }>,
  aspek_mandiri: Array<{ item_aspek, target, capaian, nilai_huruf }>,
  catatan: string,
  suara_anak: string
}
```
Upsert rows into `ajis_penilaian`.

#### `POST /api/anakjuara/penilaian/sync`
```
Body: { anakId?: string, semester: string, massal?: boolean }
```
Server-side auto-generate logic:
1. Count `hadir` rows from `ajis_kehadiran_pembinaan` for semester
2. Count hafalan items completed per category from `ajis_penilaian` hafalan rows
3. Count mandiri toggles per type from `ajis_mandiri_pembinaan`
4. Compute `nilai_huruf` from percentage thresholds
5. Upsert rows into `ajis_penilaian`

Score → Nilai mapping:
| Score % | Nilai |
|---|---|
| ≥ 90 | Excellent |
| ≥ 75 | Good |
| ≥ 55 | Average |
| ≥ 35 | Below Average |
| < 35 | Poor |

---

### 4.5 Dashboard

#### `GET /api/anakjuara/dashboard`
Returns aggregated stats (scoped by user's wilayah):
```sql
SELECT
  COUNT(DISTINCT a.id_anak)                          AS total_anak,
  COUNT(DISTINCT pb.id_pembinaan)                    AS total_sesi,
  ROUND(AVG(CASE WHEN kh.status_kehadiran='hadir' THEN 1.0 ELSE 0 END)*100,1) AS pct_kehadiran,
  COUNT(DISTINCT CASE WHEN a.status_ortu LIKE '%yatim%' THEN a.id_anak END) AS total_yatim
FROM ajis_anak a
LEFT JOIN ajis_pembinaan_baru pb ON pb.id_wilayah_pembinaan = a.id_wilayah_pembinaan
LEFT JOIN ajis_kehadiran_pembinaan kh ON kh.id_pembinaan = pb.id_pembinaan
WHERE a.id_wilayah_pembinaan = ?
```

---

## 5. Authentication & Authorization

### 5.1 Session Management
Use `iron-session` with encrypted cookie:
```typescript
// lib/auth.ts
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId: number;
  username: string;
  namaKantor: string;
  namaWilayah: string;
  idGroupUser: number;
  idWilayahPembinaan: string;
  isLoggedIn: boolean;
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), {
    cookieName: 'ajis_session',
    password: process.env.SESSION_SECRET!,
    cookieOptions: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 86400 * 7 },
  });
}
```

### 5.2 Middleware
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = request.cookies.get('ajis_session');
  const isAuth  = !!session?.value;
  const isLogin = request.nextUrl.pathname.startsWith('/login');
  if (!isAuth && !isLogin) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isAuth && isLogin) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] };
```

### 5.3 Data Scoping by Role
```typescript
// lib/auth.ts
export function getScopeCondition(session: SessionData): { sql: string; params: unknown[] } {
  if (session.idGroupUser === 1) {
    // Super admin — no restriction
    return { sql: '1=1', params: [] };
  }
  if (session.idGroupUser === 2) {
    // Branch admin — filter by kantor
    return { sql: 'id_kantor = ?', params: [session.namaKantor] };
  }
  // Korwil — filter by wilayah pembinaan
  return { sql: 'id_wilayah_pembinaan IN (?)', params: [session.idWilayahPembinaan] };
}
```

---

## 6. Caching Strategy

| Layer | Method | TTL | When to invalidate |
|---|---|---|---|
| Server: static master data | `unstable_cache` | 1 hour | Manual revalidation |
| Server: list queries | `unstable_cache` with tags | 30s | On mutation (POST/PUT/DELETE) |
| Client: list data | SWR with `revalidateOnFocus: false` | 60s | On mutation |
| Client: child detail | SWR | 30s | After edit |
| Client: hafalan items | SWR | Infinity (immutable master) | Never (master data) |

```typescript
// Example: cached hafalan master
import { unstable_cache } from 'next/cache';
import { query } from '@/lib/db';
import type { HafalanItem } from '@/types/hafalan';

export const getHafalanItems = unstable_cache(
  async () => query<HafalanItem>('SELECT id, jenis, konten FROM ajis_item_hafalan ORDER BY jenis, id'),
  ['hafalan-items'],
  { revalidate: 3600, tags: ['hafalan-master'] }
);
```

---

## 7. Performance Requirements

### 7.1 API Latency Targets
| Endpoint | p50 | p95 |
|---|---|---|
| GET /anak (list) | < 80ms | < 200ms |
| GET /anak/[id] | < 60ms | < 150ms |
| GET /pembinaan (list) | < 100ms | < 250ms |
| POST /penilaian/sync | < 500ms | < 1000ms |
| GET /dashboard | < 120ms | < 300ms |

### 7.2 Database Optimization
All queries MUST use indexed columns in WHERE clauses:
- `ajis_anak.id_wilayah_pembinaan` — index required
- `ajis_pembinaan_baru.id_wilayah_pembinaan`, `.semester`, `.tgl_pembinaan` — composite index
- `ajis_penilaian.id_anak`, `.semester` — composite index
- `ajis_item_hafalan.jenis` — index required

Use `EXPLAIN` on all list queries during development. No query should result in a full table scan on tables > 1000 rows.

### 7.3 Frontend Performance
- Use `React.memo` on list row components to prevent re-renders when filters change.
- Virtualize long lists (> 50 rows) with `react-window` or native CSS `content-visibility: auto`.
- Lazy load charts — only import Recharts inside a `dynamic()` with `{ ssr: false }`.
- Debounce text search inputs (300ms) before triggering SWR revalidation.
- Prefetch child detail pages on hover using Next.js `<Link prefetch>`.

---

## 8. Component Architecture

### 8.1 Server vs Client Components

| Component | Type | Reason |
|---|---|---|
| Page layouts | Server | No interactivity needed, faster TTFB |
| Data tables (initial load) | Server | Pre-render data on server |
| Filter panels | Client | Interactive, local state |
| Charts | Client + dynamic | Recharts requires browser APIs |
| Attendance matrix form | Client | Heavy interactivity |
| Modal dialogs | Client | Conditional render |
| Toggle components | Client | Optimistic updates |

### 8.2 Reusable `DataTable` Component
The `DataTable` component handles the Excel-style sticky-column table used in Anak, Pembinaan, and Penilaian list views:

```typescript
interface Column<T> {
  key:    keyof T | string;
  label:  string;
  width:  number;
  sticky?: boolean;
  left?:   number;
  sep?:    boolean;          // separator border after column
  render: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns:  Column<T>[];
  data:     T[];
  rowKey:   (row: T) => string;
  onRowClick?: (row: T) => void;
  minWidth?:   number;
}
```

### 8.3 SWR Hook Pattern
```typescript
// hooks/useAnakList.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useAnakList(params: AnakListParams) {
  const searchParams = new URLSearchParams(params as Record<string, string>);
  const { data, error, isLoading, mutate } = useSWR(
    `/api/anakjuara/anak?${searchParams}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30_000 }
  );
  return { anak: data?.data ?? [], total: data?.total ?? 0, error, isLoading, mutate };
}
```

---

## 9. Error Handling

### 9.1 API Error Format
All API routes return a consistent error shape:
```typescript
{ error: string; code?: string; details?: unknown }
```

HTTP status codes:
| Situation | Status |
|---|---|
| Invalid credentials | 401 |
| Insufficient role | 403 |
| Not found | 404 |
| Validation error | 422 |
| DB / server error | 500 |

### 9.2 Client Error Handling
- Network errors: toast notification (top-right, 4s timeout)
- Form validation: inline field error messages
- Empty states: illustrated empty state with action button
- Loading: skeleton placeholders matching the layout of real content

---

## 10. Security

| Concern | Mitigation |
|---|---|
| SQL injection | All queries use parameterized placeholders (`?`) via `mysql2` |
| Session hijacking | `iron-session` encrypted cookie, `httpOnly`, `secure` in prod |
| CSRF | SameSite=Strict cookies + POST endpoints require JSON body |
| XSS | React escapes all interpolated content; no `dangerouslySetInnerHTML` |
| Password storage | MD5 (matches existing `ajis_user.password` hash format) |
| Data scoping | Every query filters by user's `id_wilayah_pembinaan` or `id_kantor` |
| Route protection | `middleware.ts` guards all non-API routes |

---

## 11. Deployment

### 11.1 Vercel Configuration
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": { "maxDuration": 10 }
  }
}
```

### 11.2 Environment Variables on Vercel
Set via Vercel Dashboard → Project → Settings → Environment Variables:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `SESSION_SECRET` (min 32 chars, random)
- `NODE_ENV=production`

### 11.3 MySQL on Vercel
- Use **PlanetScale** (MySQL-compatible) or **Railway** (MySQL) or a self-hosted MySQL with a public endpoint.
- Set `ssl: { rejectUnauthorized: false }` in pool config if using hosted MySQL with TLS.
- Connection pool limit: 10 (within Vercel serverless cold-start constraints).

---

## 12. Type Definitions

```typescript
// types/anak.ts
export interface Anak {
  id_anak:             string;
  nama_lengkap:        string;
  nama_panggilan:      string;
  jns_kel:             'l' | 'p';
  jenjang_pendidikan:  string;
  kelas:               string;
  nama_sekolah:        string;
  asnaf:               string;
  status_ortu:         string;
  status_tersantuni:   'su' | 'b' | 'se' | 't';
  nama_wilayah:        string;
  nama_kantor:         string;
  tgl_lahir:           string;
  tgl_terdaftar:       string;
  foto:                string;
}

// types/pembinaan.ts
export interface Pembinaan {
  id_pembinaan:        string;
  tgl_pembinaan:       string;
  pertemuan_ke:        string;
  jenis_pembinaan:     string;
  tema:                string;
  nama_pemateri:       string;
  lokasi:              string;
  waktu_mulai:         string;
  semester:            string;
  catatan:             string;
  jumlah_hadir:        number;
  jumlah_izin:         number;
  jumlah_alfa:         number;
}

export interface Kehadiran {
  id_anak:         string;
  status_kehadiran: 'hadir' | 'izin' | 'alfa';
  mandiri: {
    bantu_ortu:   boolean;
    sedekah:      boolean;
    shalat_wajib: boolean;
    tilawah:      boolean;
  };
}

// types/penilaian.ts
export type NilaiHuruf = 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor';

export interface AspekCerdas {
  item_aspek:    string;
  target:        string;
  kondisi_awal:  string;
  perkembangan:  string;
  nilai_huruf:   NilaiHuruf;
  urutan:        number;
}

export interface AspekMandiri {
  item_aspek:   string;
  target:       string;
  capaian:      string;
  nilai_huruf:  NilaiHuruf;
  urutan:       number;
}

export interface Penilaian {
  id_anak:    string;
  nama_anak:  string;
  semester:   string;
  tgl_penilaian: string;
  aspek_cerdas:  AspekCerdas[];
  aspek_mandiri: AspekMandiri[];
  catatan:    string;
  suara_anak: string;
}

// types/hafalan.ts
export interface HafalanItem {
  id:     number;
  jenis:  2 | 3 | 4;    // 2=Quran, 3=Shalat, 4=Doa
  konten: string;
  selesai?: boolean;
}
```

---

## 13. Database Table Notes (Existing Schema — Do Not Alter)

### Key Tables Used
| Table | Primary Key | Notes |
|---|---|---|
| `ajis_anak` | `id_anak` (varchar 25) | Child registration data |
| `ajis_pembinaan_baru` | `id_pembinaan` | Coaching session header |
| `ajis_penilaian` | Composite | Stores aspek rows — each aspek item is a separate row |
| `ajis_item_hafalan` | `id` | Master list of hafalan items (immutable) |
| `ajis_user` | `id_user` | Users; password is MD5 hashed |
| `ajis_sdm_wilayah` | `id_sdm` | Volunteer/coordinator profiles |
| `ajis_wilayah_pembinaan` | `id_wilayah` | Regional mapping |
| `ajis_kantor` | `id_kantor` | Branch offices |

### `ajis_penilaian` Row Structure
Each evaluation item is a separate row:
- `id_anak` — child ID
- `semester` — semester code (e.g., "25")
- `aspek` — category: `Aspek Cerdas`, `Aspek Mandiri`, `Hafalan Alquran`, `Suara Anak Juara`, `Catatan Pembinaan`
- `item_aspek` — specific item name
- `kondisi_awal` — baseline text
- `perkembangan` — progress text
- `nilai_huruf` — score: Excellent / Good / Average / Below Average / Poor
- `urutan` — display order

Do NOT create new tables. Hafalan completion status is persisted as `ajis_penilaian` rows with appropriate `aspek` values.
