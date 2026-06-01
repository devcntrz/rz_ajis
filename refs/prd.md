# Product Requirements Document (PRD)
## Anak Juara Information System — AJIS Web
**Version:** 1.0.0  
**Date:** 2026-06  
**Owner:** Rumah Zakat — Program Anak Juara  
**Status:** Draft for Development

---

## 1. Overview

### 1.1 Product Summary
AJIS Web is a web-based information system for managing Rumah Zakat's **Anak Juara** orphan and underprivileged child sponsorship program. The system enables regional coordinators (*korwil*) and branch administrators (*SPMD*) to manage foster children, conduct coaching sessions (*pembinaan*), track Quran memorization progress (*hafalan*), evaluate semester performance, and generate structured reports aligned with Rumah Zakat's existing data schema.

### 1.2 Problem Statement
Currently, coordinators manage Anak Juara data through a fragmented mix of spreadsheets, mobile forms, and the legacy AJIS system. This results in:
- Duplicate data entry across platforms
- Delayed or missing semester evaluation reports
- No real-time visibility into hafalan progress per child
- Inability to filter and pivot assessment data across groups
- Slow page loads and poor UX on mobile devices in the field

### 1.3 Goals
| Goal | Metric |
|---|---|
| Eliminate double-entry | 100% of session, hafalan, and evaluation data in one place |
| Sub-second data access | API response < 300ms for list views |
| Mobile-first field usage | All key workflows usable on 375px viewport |
| Accurate semester reports | Reports match current AJIS `ajis_penilaian` schema |
| Coordinator independence | No IT involvement needed for daily operations |

---

## 2. Users & Roles

### 2.1 User Roles
| Role | Code | Access Scope |
|---|---|---|
| **Super Admin** | `id_group_user = 1` | All offices, all regions, all data |
| **Branch Admin (SPMD)** | `id_group_user = 2` | All regions under their `id_kantor` |
| **Regional Coordinator (Korwil)** | `id_group_user = 9` | Only their assigned `id_wilayah_pembinaan` |

### 2.2 Primary Users
- **Korwil (Regional Coordinator):** Field volunteers who attend weekly coaching sessions, enter attendance, record hafalan checkmarks, and fill semester evaluations.
- **SPMD Branch Admin:** Oversees multiple korwil, reviews reports, manages child data.
- **Super Admin:** System-wide management, no region restriction.

### 2.3 User Stories

#### Authentication
- As a user, I can log in with my `username` and `password` so I can access the system.
- As a user, I am automatically redirected to the dashboard after successful login.
- As a user, I can log out from any page to end my session securely.

#### Dashboard (Beranda)
- As a korwil, I can see a summary of children, attendance rate, hafalan completion, and total sessions for my region.
- As a korwil, I can see trend charts for attendance and hafalan over recent sessions.

#### Child Management (Anak Asuh)
- As a korwil, I can view the full list of children in my region as a filterable, sortable spreadsheet table (desktop) or card list (mobile).
- As a korwil, I can open a child's profile to see their personal data, hafalan checklist, attendance history, and semester evaluation report.
- As an admin, I can register, edit, or deactivate a child record.
- As any user, I can filter children by status (yatim/piatu/dhuafa), jenjang pendidikan, wilayah, asnaf, and attendance rate.

#### Coaching Sessions (Pembinaan)
- As a korwil, I can create a new coaching session with date, type, theme, speaker, location, and time.
- As a korwil, when entering a session, I can mark each child as Hadir/Izin/Alfa and toggle mandiri aspects (Membantu Orangtua, Sedekah, Shalat Wajib, Tilawah) per child per session.
- As a korwil, I can filter sessions by type, semester, speaker, location, date range, and attendance rate.
- As a korwil, I can view the session detail showing a full attendance + mandiri matrix.
- As a korwil, I can edit or delete sessions I created.

#### Hafalan Tracking
- As a korwil, I can view a child's hafalan checklist across three categories: Al-Quran (114 surahs), Bacaan Shalat (10 items), Doa Pilihan (14 items).
- As a korwil, I can toggle individual hafalan items as completed or not.
- As a korwil, I can see progress bars per category showing completion percentage.
- The hafalan checklist is accessible directly from the child's profile page.

#### Assessment & Evaluation (Penilaian)
- As a korwil, I can view a list of semester evaluations for all children in my region.
- As a korwil, I can **Sync** (auto-generate) a semester evaluation for one or all children, pulling data automatically from:
  - Attendance counts from pembinaan sessions
  - Hafalan item counts (Quran, Shalat, Doa)
  - Mandiri toggles from each pembinaan session
- As a korwil, I can manually edit any generated evaluation (targets, kondisi awal, perkembangan, nilai).
- As a korwil, I can view a **Pivot table** of all children × all assessment aspects with per-column filters to identify children missing specific evaluations.
- As a korwil, I can filter the evaluation list by nilai (Excellent/Good/Average/Below Average/Poor), wilayah, jenjang, and attendance rate.
- As a korwil, I can run **Generate Massal** to auto-create evaluations for all children who don't yet have one for a given semester.

#### Semester Report (Laporan Semester)
- The semester report is embedded in the child's profile detail (tab: Laporan Penilaian).
- The report displays two tables matching the format in the reference screenshot:
  - **Aspek Cerdas**: No, Aspek, Target, Kondisi Awal, Perkembangan, Nilai
  - **Aspek Mandiri**: No, Aspek, Target, Capaian, Nilai (with rata-rata footer)
- Reports include Catatan Pembina and Suara Anak Juara text fields.

---

## 3. Features & Scope

### 3.1 In-Scope Features (MVP)
| Feature | Priority |
|---|---|
| Authentication (login / logout / session) | P0 |
| Dashboard with statistics and charts | P0 |
| Child list with Excel-style table + advanced filter | P0 |
| Child profile with 4 tabs: Data, Hafalan, Kehadiran, Penilaian | P0 |
| Pembinaan CRUD with attendance + mandiri matrix | P0 |
| Pembinaan advanced filter | P0 |
| Hafalan checklist per child | P0 |
| Penilaian CRUD (list, detail, edit) | P0 |
| Penilaian Sync (auto-generate from data) | P0 |
| Penilaian Pivot view with per-column filters | P0 |
| Generate Massal (batch auto-generate evaluations) | P1 |
| Role-based data scoping (region filter by user) | P0 |
| Responsive layout (desktop table / mobile cards) | P0 |

### 3.2 Out-of-Scope (Future)
- PDF export of semester reports
- Push notifications for missing evaluations
- Parent/guardian portal
- Financial disbursement tracking
- SPMD-level analytics dashboard

---

## 4. UX & Design Requirements

### 4.1 Design System
| Token | Value |
|---|---|
| Primary color | `#BF4E02` |
| Primary dark | `#8F3A01` |
| Primary light | `#D96A1A` |
| Background | `#FFFFFF` |
| Font | Source Sans Pro (Google Fonts) |
| Border radius (card) | 16px |
| Border radius (input) | 8–10px |

### 4.2 Layout
- **Desktop/Tablet:** Sidebar navigation (220px, solid `#BF4E02`) + main content area, max-width 1200px centered.
- **Mobile:** Bottom tab bar (solid `#BF4E02`, white icons), no sidebar.
- **Breakpoint:** 700px (mobile below, desktop/tab above).
- **Data tables (desktop):** Excel-style horizontal scroll with sticky columns (first 2–3 columns frozen).
- **Data display (mobile):** Stacked card format.

### 4.3 Performance UX
- Skeleton loaders for list views while data fetches.
- Optimistic UI for toggle actions (hafalan checkboxes, mandiri toggles).
- No full-page reloads on navigation — use Next.js `<Link>` and prefetching.
- Tables render above the fold within 300ms.

---

## 5. Data Requirements

### 5.1 Core Tables (existing, do not alter schema)
| Table | Purpose |
|---|---|
| `ajis_anak` | Child records |
| `ajis_pembinaan_baru` | Coaching session records + attendance |
| `ajis_penilaian` | Semester evaluation records |
| `ajis_item_hafalan` | Hafalan item master (jenis 2=Quran, 3=Shalat, 4=Doa) |
| `ajis_sdm_wilayah` | Coordinator/volunteer profiles |
| `ajis_user` | User accounts and authentication |
| `ajis_wilayah_pembinaan` | Regional mapping |
| `ajis_kantor` | Branch office data |

### 5.2 Key Relationships
- `ajis_anak.id_wilayah_pembinaan` → `ajis_wilayah_pembinaan`
- `ajis_anak.kantor_id` → `ajis_kantor`
- `ajis_user.id_wilayah_pembinaan` → scopes korwil's data access
- `ajis_penilaian` rows are keyed by `(id_anak, semester, aspek, item_aspek)`

---

## 6. Non-Functional Requirements
| Requirement | Target |
|---|---|
| API response time (list) | < 300ms at p95 |
| Page Time-to-Interactive | < 1.5s on 4G |
| Concurrent users | 100+ without degradation |
| Uptime | 99.5% (Vercel hosted) |
| Browser support | Chrome 90+, Safari 14+, Firefox 90+, Edge 90+ |
| Mobile viewport | 375px minimum width |
| Accessibility | WCAG 2.1 AA for key flows |

---

## 7. Success Metrics
- 90% of korwil complete session entry within the session day
- Semester reports generated in < 30 seconds per region
- Zero coordinator complaints about data loss
- Dashboard load < 1 second on 4G connection
