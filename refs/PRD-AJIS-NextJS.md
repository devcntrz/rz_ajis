# PRD & Timeline — Refactor AJIS (Anak Juara Information System) ke Next.js

**Produk:** AJIS / Indonesia Juara — Beasiswa Anak Juara
**Dari:** PHP + EasyUI + MariaDB `sipc_ijf` (+ aplikasi terpisah `ijismobile`)
**Ke:** Next.js (App Router) + Neon Postgres + Vercel + Cloudflare R2
**Tanggal dokumen:** 14 Agustus 2026
**Periode development:** 18 Agustus – 25 September 2026
**Periode migrasi data + QA:** 28 September – 9 Oktober 2026
**Lampiran:** [`db/schema.sql`](../db/schema.sql), [`db/seed.sql`](../db/seed.sql), [`prd.md`](../prd.md) (detail modul Ajuan Ganti Anak)

---

## 1. Ringkasan Eksekutif

### 1.1 Masalah

AJIS saat ini **sangat lambat** untuk ratusan pengguna bersamaan. Penyebab utamanya struktural, bukan sekadar kurang server:

1. **VIEW MySQL bertingkat.** Daftar Anak Juara membaca `ajis_view_anak_juara`, yang tersusun dari `ajis_view_profile` (join 4 tabel, dengan `ORDER BY nama_lengkap` **di dalam view**) + `ajis_view_donasi` (pivot 12 bulan) + `ajis_view_penyaluran` + `ajis_opname`, lalu `GROUP BY` di setiap page load. Ada 29 view di database, beberapa bertingkat 3 level.
2. **`COUNT(*)` penuh di setiap halaman** untuk pagination.
3. **Engine campuran.** 16 tabel MyISAM dan 21 InnoDB dalam satu alur transaksional. Dua jalur tulis terbesar (`ajis_pembinaan_baru` ±4,48 juta baris dan `ajis_penyaluran` ±190 ribu baris) memakai MyISAM — table-level lock dan **tidak transaksional**.
4. **Index tidak melayani query.** Banyak index gemuk 8 kolom peninggalan pola covering-index MyISAM; sementara kolom yang benar-benar di-join seperti `ajis_pemasangan.nia_rfo` justru tidak ter-index sama sekali.
5. **Dua aplikasi terpisah.** Mentor wilayah memakai `ijismobile`, admin memakai AJIS desktop — dua basis kode untuk data yang sama.

### 1.2 Sasaran

| Sasaran | Ukuran keberhasilan |
|---|---|
| Aplikasi cepat | p95 daftar utama < 300 ms; tidak ada endpoint > 1 detik pada beban 200 user konkuren |
| Satu aplikasi | Desktop + mobile responsif; `ijismobile` dipensiunkan |
| Data konsisten | Donatur, RFO, dan transaksi bersumber tunggal dari `zains_rz` |
| Bisa dikonsumsi sistem lain | API keluar read-only dengan key stabil |
| Aman per kantor | Isolasi multi-tenant dipaksa di server, bukan di UI |

### 1.3 Non-goals

- Tidak mengubah proses bisnis. Istilah menu boleh berganti, alur tetap.
- Tidak memigrasikan tabel yang sudah tidak dipakai (daftar di §7.2).
- Tidak membuat modul baru di luar 22 menu pada §6.

---

## 2. Techstack & Arsitektur

```
                    ┌──────────────────────────────┐
   Browser  ───────▶│  Next.js App Router (Vercel) │
  (desktop &        │  · Server Components (baca)  │
   mobile)          │  · Route Handlers (API)      │
                    └───────┬──────────────┬───────┘
                            │              │
              raw SQL (rw)  │              │  SELECT saja
                            ▼              ▼
                  ┌──────────────┐   ┌──────────────────┐
                  │ Neon Postgres│   │ MySQL  zains_rz  │
                  │  (utama)     │   │ corez_donatur    │
                  └──────┬───────┘   │ hcm_karyawan     │
                         │           │ corez_transaksi  │
                         │           │ hcm_kantor       │
                         │           │ setting_program  │
                         │           └──────────────────┘
             ┌───────────┴──────────┐
             ▼                      ▼
    ┌────────────────┐     ┌─────────────────┐
    │ Upstash Redis  │     │ Upstash QStash  │
    │ (cache)        │     │ (job & jadwal)  │
    └────────────────┘     └────────┬────────┘
                                    ▼
                          ┌──────────────────┐
                          │ Cloudflare R2    │
                          │ (foto, lampiran) │
                          └──────────────────┘
```

| Komponen | Pilihan | Catatan |
|---|---|---|
| Framework | Next.js App Router | Deploy di Vercel |
| Database utama | Neon Postgres | Koneksi **pooled** wajib (`@neondatabase/serverless` / pooler string) |
| Akses data | **Raw SQL** parameterized di Route Handler | |
| Migrasi & seed | Drizzle Kit | **Hanya** `drizzle-kit generate/migrate` + skrip seed |
| Auth | NextAuth (Auth.js) — SSO Google | Mapping `email` → `ajis_user.email` |
| Penyimpanan file | Cloudflare R2 | Presigned upload dari browser |
| Cache | Upstash Redis | Aturan konsistensi di §10 |
| Job & jadwal | Upstash QStash | Sinkron zains_rz, refresh MV, export besar |
| Export | `exceljs` (XLSX), `@react-pdf/renderer` (PDF) | Runtime `nodejs` |
| Sumber eksternal | MySQL `zains_rz` (read-only) | Detail di §5 |

### 2.1 Aturan engineering (tidak boleh dilanggar)

1. **Raw SQL saja di runtime.** Drizzle **dilarang** dipakai sebagai ORM/query builder. Skema Drizzle hanya sumber untuk generate migrasi; tidak boleh di-`import` oleh route handler manapun.
2. **Semua query parameterized.** Legacy memakai konkatenasi string — jangan disalin.
3. **Tanpa UUID.** Semua primary key surrogate `bigserial`.
4. **Tanpa `CREATE TYPE ... AS ENUM`.** Pakai `varchar(n)` + `CHECK`, atau `boolean` untuk flag dua nilai.
5. **Tanpa VIEW biasa.** Hanya `MATERIALIZED VIEW` yang di-refresh terjadwal.
6. **Semua kolom uang `numeric`,** tidak pernah `double precision`.
7. **Setiap operasi multi-tabel dibungkus transaksi.** Legacy tidak melakukannya dan bisa meninggalkan state separuh jadi (lihat Eksekusi Ajuan, [`prd.md` §8.5](../prd.md)).
8. **Scope kantor ditentukan dari sesi,** tidak pernah dari parameter klien.

---

## 3. Peran & Isolasi Data

### 3.1 Peran

| Peran | `group_user` | Cakupan data | Asal di sistem lama |
|---|---|---|---|
| Superadmin | `superadmin` | Seluruh kantor, seluruh wilayah | AJIS desktop, `id_group_user = 1` |
| SpMD Cabang | `spmd` | **Hanya** `kantor_id` miliknya | AJIS desktop, `id_group_user = 2` |
| Mentor Wilayah | `mentor_wilayah` | **Hanya** `id_wilayah_pembinaan` miliknya, di dalam kantornya | Aplikasi terpisah `ijismobile` |

Mentor wilayah kini masuk ke aplikasi yang sama dengan tampilan responsif, bukan aplikasi terpisah.

### 3.2 Aturan isolasi

Dijalankan sebagai satu helper yang dipanggil di **awal setiap route handler terproteksi**:

```ts
// lib/auth/scope.ts
export type Scope = {
  kantorId: string | null;      // null = tanpa batas (superadmin)
  wilayahId: number | null;     // null = seluruh wilayah dalam cakupan kantor
};

export function getScope(session: Session): Scope {
  switch (session.role) {
    case 'superadmin':     return { kantorId: null,                wilayahId: null };
    case 'spmd':           return { kantorId: session.idKantor,    wilayahId: null };
    case 'mentor_wilayah': return { kantorId: session.idKantor,    wilayahId: session.idWilayah };
  }
}
```

Setiap query menerapkan scope sebagai predikat wajib:

```sql
WHERE ($1::varchar IS NULL OR p.kantor_id = $1)
  AND ($2::bigint  IS NULL OR p.id_wilayah_pembinaan = $2)
```

**Yang dilarang:**
- Mempercayai `kantor_id` / `id_wilayah_pembinaan` dari query string atau body untuk peran non-superadmin — selalu ditimpa nilai dari sesi.
- Menyandarkan isolasi pada dropdown di UI.
- Membuat cache key tanpa memuat scope (lihat §10.3) — cache yang bocor sama bahayanya dengan query yang bocor.

**Untuk mutasi:** sebelum `UPDATE`/`DELETE`, baris target harus diverifikasi berada dalam scope pemanggil, bukan sekadar difilter saat membaca.

### 3.3 Autentikasi

1. Login lewat SSO Google (NextAuth).
2. Email hasil SSO dicocokkan ke `ajis_user.email` (UNIQUE) dengan `aktif = true`. Tidak ada baris cocok → akses ditolak; tidak ada auto-provisioning.
3. Sesi memuat `id_user`, `role` (`ajis_group_user.group_user`), `id_kantor`, `id_wilayah_pembinaan`.
4. Kolom `password` MD5 legacy **dihapus** dari skema.

---

## 4. Peta 22 Menu

Istilah menu boleh berganti; kolom "Menu" memakai nama yang dipahami pengguna saat ini.

| # | Menu | Route | Endpoint utama | Tabel utama | Fase |
|---|---|---|---|---|---|
| 1 | Pengajuan Beasiswa | `/profiling/pengajuan` | `GET/POST /api/anak` | `ajis_anak` | 1 |
| 2 | Data Hasil Survey | `/profiling/survey` | `GET/POST /api/survey` | `ajis_survey` | 1 |
| 3 | Calon Anak Juara | `/profiling/caj` | `GET /api/anak?status=caj` | `ajis_anak` | 1 |
| 4 | Peminjaman Data CAJ | `/profiling/peminjaman` | `GET/POST /api/peminjaman` | `ajis_peminjaman_anak` | 1 |
| 5 | Anak Juara | `/anak-juara` | `GET /api/anak-juara` | `ajis_pemasangan` + pivot keuangan | **2** |
| 6 | List Ajuan Pergantian | `/anak-juara/ajuan` | `GET/POST /api/ajuan` | `ajis_view_ajuan` | 1 |
| 7 | Data Wilayah | `/master/wilayah` | `GET/POST /api/wilayah` | `ajis_wilayah_pembinaan` | 1 |
| 8 | SDM Wilayah | `/master/sdm` | `GET/POST /api/sdm` | `sdm_wilayah`, `sdm_penugasan` | 1 |
| 9 | Pembinaan Anak Juara | `/pembinaan` | `GET/POST /api/pembinaan` | `ajis_pembinaan_baru` | 3 |
| 10 | Setting Propinsi/Kabupaten/Kecamatan/Kelurahan | `/master/wilayah-admin` | `GET/POST /api/ref/{level}` | `ref_propinsi`…`ref_desa` | 1 |
| 11 | Penyaluran | `/keuangan/penyaluran` | `GET/POST /api/penyaluran` | `ajis_penyaluran` | 2 |
| 12 | Input Donasi | `/keuangan/donasi` | `GET/POST /api/donasi` | `ajis_input_donasi` | 2 |
| 13 | Donatur | `/keuangan/donatur` | `GET /api/donatur` | `mv_donatur_agregat` (**tanpa tabel donatur**) | 2 |
| 14 | Zisco / Daftar Peminjam | `/keuangan/zisco` | `GET /api/zisco` | `mv_zisco_agregat` (**tanpa tabel tersendiri**) | 2 |
| 15 | Transaksi | `/keuangan/transaksi` | `GET /api/transaksi` | `transaksi` | 2 |
| 16 | Rekap Transaksi | `/keuangan/rekap` | `GET /api/transaksi/rekap` | `mv_rekap_transaksi_bulanan` | 2 |
| 17 | Laporan Pembinaan | `/laporan/pembinaan` | `GET /api/laporan/pembinaan` | `manual_laporan_pembinaan` | 3 |
| 18 | Semester | `/master/semester` | `GET/POST /api/semester` | `ajis_semester` | 3 |
| 19 | Raport Pembinaan | `/laporan/raport` | `GET /api/laporan/raport` | `manual_laporan` | 3 |
| 20 | Dokumentasi | `/laporan/dokumentasi` | `GET/POST /api/dokumentasi` | `ajis_dokumentasi_pembinaan` | 3 |
| 21 | Prestasi | `/laporan/prestasi` | `GET/POST /api/prestasi` | `ajis_data_prestasi`, `manual_laporan_prestasi` | 3 |
| 22 | Materi | `/laporan/materi` | `GET /api/materi` | `materi` (**read-only, arsip**) | 3 |

**Perubahan yang perlu disadari pengguna:**
- **Donatur** dan **Zisco/Daftar Peminjam** tidak lagi punya tabel sendiri. Keduanya adalah agregasi `ajis_pemasangan` (`GROUP BY id_donatur` / `GROUP BY nia_rfo`), dengan detail profil ditarik langsung dari `zains_rz`. Konsekuensinya: donatur yang belum pernah dipasangkan dengan anak juara **tidak muncul** di menu Donatur AJIS — itu urusan `zains_rz`.
- **Materi** hanya arsip; tidak ada tombol tambah/ubah.

---

## 5. Integrasi `zains_rz`

### 5.1 Arsitektur dua koneksi

| Koneksi | Target | Hak akses | Isi |
|---|---|---|---|
| Primary | Neon Postgres | read/write | Seluruh data AJIS |
| Secondary | MySQL `zains_rz` | **SELECT saja** | `corez_donatur`, `hcm_karyawan`, `corez_transaksi`, `hcm_kantor`, `setting_program` |

Aturan koneksi kedua:

- Diisolasi di `lib/db/zains.ts` yang **hanya** mengekspor fungsi `select`. Tidak ada helper `insert`/`update`/`delete` di modul ini — sehingga menulis ke zains_rz tidak mungkin dilakukan tanpa sengaja, walau kredensialnya suatu saat berubah.
- **Tidak ada JOIN lintas server.** Setiap query berjalan di satu database; penggabungan dilakukan di layer aplikasi atau lewat snapshot lokal.
- Pool kecil (`connectionLimit` rendah) karena lingkungan serverless; setiap query wajib `LIMIT` + timeout pendek.
- Kegagalan zains_rz **tidak boleh** membuat halaman AJIS error — degradasi ke snapshot lokal.
- `zains_rz` juga `CHARSET=latin1`: driver dikonfigurasi charset eksplisit dan hasilnya di-transcode ke UTF-8 sebelum disimpan.

### 5.2 Pemetaan `corez_donatur`

PK `id_donatur varchar(20)`.

| Field AJIS | Kolom `corez_donatur` | Catatan |
|---|---|---|
| `id_donatur` | `id_donatur` | Legacy AJIS join ke `donatur.did`; di zains namanya `id_donatur` |
| `nama_donatur` | `donatur` | Nama kolomnya `donatur`, bukan `nama_donatur` |
| `hp` | `hp` (fallback `telpon`, `whatsapp`) | |
| `jcustid` | `id_jenis` | **Dikonfirmasi** |
| `jenis_donatur` | `status` (`Donatur`/`Mitra`/`UPZ`/`Kotak`) | |
| `jenis_kelamin_donatur` | `jk` (`l`/`p`/`x`) | Legacy AJIS hanya `l`/`p`; nilai `x` harus ditangani UI |
| `kantor_donatur` | `id_kantor` → `map_kantor.nama_kantor` | |
| `oid_donatur` | `id_kantor` → `map_kantor.oid` | **Dikonfirmasi:** ID kantor donatur berformat lama berstrip (mis. `09-219`) |
| watermark sinkron | `dtu` (ter-index) | |

### 5.3 Pemetaan `hcm_karyawan`

PK `id_karyawan char(20)`.

| Field AJIS | Kolom `hcm_karyawan` |
|---|---|
| `nia_rfo`, `nia_rfo_book`, `id_peminjam` | **`id_karyawan`** — kunci relasi, bukan `no_identitas`/NIK |
| `nama_rfo`, `nama_rfo_book`, `nama_peminjam` | `karyawan` |
| Identitas SDM/mentor (`sdm_wilayah`) | `karyawan`, `jk`, `email`, `hp`, `id_jabatan`, `id_kantor`, `aktif`, `status_karyawan` |
| watermark sinkron | `dtu` |

`hcm_karyawan.id_donatur` boleh terisi (karyawan yang juga donatur) — jangan diperlakukan sebagai unik.

### 5.4 Pemetaan `corez_transaksi`

PK `(id_transaksi, detailid)`.

| Field AJIS `transaksi` | Kolom `corez_transaksi` | Catatan |
|---|---|---|
| `transid` | `id_transaksi` | |
| `detailid` | `detailid` | |
| `did` | `id_donatur` | |
| `id_program` | `id_program varchar(30)` | **STRING di zains**, numerik di `setting_program` → CAST eksplisit; nilai non-numerik harus ditangani agar query tidak gagal |
| `perkiraan_rp` | `transaksi double(20,2)` | Di Postgres `numeric(20,2)` |
| `tgl_transaksi` | `tgl_transaksi` | **Selalu ini untuk agregasi waktu**, bukan `tgl_donasi` |
| `approved_transaksi` | `approved_transaksi` (`y`/`n`/`na`/`r`) | **4 nilai**, bukan 2 seperti legacy. Laporan performa selalu `= 'y'` |
| `jenis_transaksi` | `id_via_bayar` (tinyint) | Dipetakan lewat `app_setting['zains.map_via_bayar']` |
| user input | `user_insert` → `hcm_karyawan.id_karyawan` | |
| watermark sinkron | `dtu` | |

Filter tanggal mengikuti konvensi zains: `>= start AND < end + INTERVAL 1 DAY`.

### 5.5 `hcm_kantor` → tabel `map_kantor`

`hcm_kantor.id_kantorold varchar(10)` adalah jembatan antara `id_kantor` (integer, dipakai zains) dan `oid` berformat strip (`09-219`, dipakai AJIS). Kolom ini sudah ter-index di zains.

`map_kantor` disinkronkan dari `hcm_kantor` dan menjadi **satu-satunya** tempat penerjemahan ID kantor lintas sistem — tidak boleh ada pemetaan yang di-hardcode.

**Validasi wajib saat ETL:** setiap `oid` yang dipakai `ajis_pemasangan.kantor_id` / `ajis_anak.kantor_id` harus punya baris di `map_kantor`. Yang tidak ketemu dilaporkan sebagai exception — **tidak boleh** diam-diam menjadi `NULL`.

### 5.6 `setting_program` — pola tabel extension

`setting_program` ada di **kedua** sistem dengan isi berbeda. Di AJIS ia menjadi **tabel extension**, di-key `id_program` bernilai sama dengan `zains_rz.setting_program.id_program`, tanpa FK lintas server:

| Kelompok kolom | Contoh | Perilaku |
|---|---|---|
| **Snapshot dari zains** | `nama_program`, `id_program_parent`, `level`, `jenis`, `coa_individu`, `coa_entitas`, `coa1`, `coa2`, `persen_dp_zains`, `nominal_zains`, `aktif`, `sort` | Read-only di AJIS; di-refresh job sinkron harian |
| **Milik AJIS (mandatory untuk HPP)** | `harga_program`, `harga_penyaluran`, `nominal_dp`, `nominal_dss`, `persentase_dp`, `persentase_dss`, `jenjang_pendidikan`, `baru`, `kredit_account` | Editable di menu setting; **tidak pernah ditimpa** job sinkron |

Job sinkron **wajib** memakai `INSERT ... ON CONFLICT (id_program) DO UPDATE SET` dengan daftar kolom snapshot yang eksplisit — tidak pernah `SET` seluruh baris:

```sql
INSERT INTO setting_program (id_program, nama_program, aktif, sort, synced_at, hpp_lengkap)
VALUES ($1, $2, $3, $4, now(), false)
ON CONFLICT (id_program) DO UPDATE SET
    nama_program = EXCLUDED.nama_program,
    aktif        = EXCLUDED.aktif,
    sort         = EXCLUDED.sort,
    synced_at    = now();
    -- harga_program, persentase_dp, dst. SENGAJA tidak disebut
```

Program baru dari zains masuk dengan `hpp_lengkap = false` dan muncul sebagai to-do di menu setting — bukan diam-diam menghasilkan perhitungan nol.

**Catatan:** join `ajis_pemasangan` ke program berdasarkan **nama program** (dipakai logic Eksekusi legacy) diganti join berdasarkan `id_program`. Join by nama terlalu rapuh dan tidak diporting.

### 5.7 Jadwal sinkronisasi

| Sumber | Frekuensi | Watermark |
|---|---|---|
| `corez_transaksi` | tiap 15 menit | `dtu` |
| `corez_donatur` | harian | `dtu` |
| `hcm_karyawan` | harian | `dtu` |
| `hcm_kantor` | harian | `dtu` |
| `setting_program` | harian | `dtu` |

Watermark terakhir disimpan di `app_setting` (`zains.sync.*.watermark`). Tersedia juga endpoint refresh on-demand per entitas untuk pengguna yang butuh data terbaru saat itu juga.

### 5.8 Prinsip snapshot vs read-through

- **List / grid / filter / sort** → snapshot lokal di Postgres. Cepat, bisa di-index, dan tahan gangguan jaringan.
- **Halaman detail donatur / profil RFO** → query langsung ke `zains_rz`, di-cache pendek di Redis.
- Bila zains_rz tidak terjangkau, AJIS tetap berfungsi dengan snapshot terakhir dan UI menampilkan penanda "data donatur per &lt;timestamp sinkron terakhir&gt;".

### 5.9 API keluar (dikonsumsi `zains_rz`)

Read-only, autentikasi service token, key stabil:

| Method | Path | Isi |
|---|---|---|
| `GET` | `/api/external/anak/{id_anak}` | Profil anak juara |
| `GET` | `/api/external/pemasangan?id_donatur=` | Pemasangan aktif per donatur |
| `GET` | `/api/external/pemasangan?nia_rfo=` | Pemasangan per RFO |
| `GET` | `/api/external/donasi?id_pemasangan_baru=` | Rekap donasi per pemasangan |
| `GET` | `/api/external/laporan?semesterid=&kantor_id=` | Status laporan semester |

Inilah alasan struktur data harus rapi: kunci `id_anak`, `id_pemasangan_baru`, `id_donatur`, `nia_rfo` dijamin konsisten tipenya di seluruh skema.

---

## 6. Konversi Skema MySQL → Postgres

### 6.1 Aturan konversi

| Aturan | Penerapan |
|---|---|
| Tanpa UUID | Semua PK surrogate `bigserial`. Tidak ada `char(36)`/UUID di sumber, jadi tidak ada yang perlu dikonversi |
| Tanpa enum | ±65 kolom `enum(...)` → `varchar(n)` + `CHECK`, atau `boolean` untuk flag dua nilai |
| Tanpa VIEW | 29 view legacy dipetakan di §8 |
| Uang | Semua `double`/`int` untuk nominal → `numeric` |
| Tanggal | `'0000-00-00'` → `NULL` (ilegal di Postgres) |
| Tipe usang | `year(4)`→`smallint`, `int(2)`/`int(16)`→`integer`, `double(20,2)`→`numeric(20,2)`, `float(10,6)`→`numeric(10,6)` |
| ID eksternal | ±40 kolom `*_postgree`/`*_erpwh`/`id_ijgs_*`/`oid_rz`/`upload_gdrive` → satu kolom `external_ids jsonb` per tabel |
| Charset | latin1 → UTF-8 (transcoding wajib di ETL) |
| Foreign key | Sumber punya **nol** FK (`SET FOREIGN_KEY_CHECKS=0`). FK ditambahkan untuk relasi internal; **tidak** untuk field snapshot zains_rz |

### 6.2 Normalisasi encoding boolean

Legacy memakai **enam** cara untuk konsep yang sama. Semua diseragamkan:

| Pola legacy | Contoh | Jadi |
|---|---|---|
| `enum('y','n')` | `ajis_anak.aktif` | `boolean` |
| `enum('n','y')` | `ajis_pemasangan.status_saldo` | `boolean` |
| `enum('0','1')` | `ref_kabupaten.kota` | `boolean` |
| `enum('tidak','ada')` | `ajis_survey.bantuan_rutin_dari_lembaga_lain` | `boolean` |
| `varchar(10)` berisi y/n | `ajis_sdm_wilayah.aktif` | `boolean` |
| `enum('y','t')` | `keaktifan_edukasi`, `status_approve` | `varchar(1)` + CHECK (bukan boolean — `t` berarti *pending*, bukan *false*) |
| `enum('t','n','y')` | `manual_laporan.status_foto` dsb. | `varchar(1)` + CHECK (tiga status QC) |
| `enum('','y','n')` | `ajis_anak.alumni_juara` | `boolean` nullable (`NULL` = belum ditentukan) |

### 6.3 Penyeragaman tipe kunci relasi

Legacy memakai lebar dan ejaan berbeda untuk kunci yang sama — sumber bug join yang senyap:

| Kunci | Kondisi legacy | Jadi |
|---|---|---|
| ID kantor | 3 ejaan: `kantor_id` / `id_kantor` / `oid`, lebar `varchar(6)`/`(10)`/`(50)` | `kantor_id varchar(10)` (kecuali `oid` di tabel kantor) |
| `id_sdm` | `ajis_anak.id_sdm varchar(50)` vs `ajis_sdm_wilayah.id_sdm int` | `bigint` + FK |
| `laporanid` | `manual_laporan varchar(50)` vs `manual_laporan_pembinaan varchar(12)` | `varchar(50)` + FK |
| `transid` | `ajis_input_donasi` **text** vs `transaksi varchar(50)` — join tidak bisa di-index | `varchar(50)` + index |
| `camatid` | `ref_desa char(7)` vs `ref_kecamatan char(10)` | `varchar(10)` + FK |
| `semesterid` | Tidak unik di `ajis_semester` padahal jadi join key di mana-mana | `varchar(10)` **UNIQUE** |
| `id_wilayah_pembinaan` | `int(2)`, `varchar(16)`, `varchar(50)` bercampur | `bigint` + FK |

### 6.4 Primary key: natural → surrogate

| Tabel | PK legacy | PK baru | Natural key |
|---|---|---|---|
| `ajis_pemasangan` | 5 kolom (`id_donatur`,`id_anak`,`id_program`,`id_pemasangan_baru`,`tahun`) | `id bigserial` | **`id_pemasangan_baru` UNIQUE** (legacy hanya non-unique KEY, padahal semua tabel lain join ke sini) |
| `ajis_opname` | 5 kolom | `id bigserial` | `(tahun, id_pemasangan_baru)` |
| `ajis_penilaian` | `(id_anak, semesterid, aspek)` — >250 byte, tabel tanpa index sekunder | `id bigserial` | `(id_anak, semesterid, aspek)` |
| `ajis_hafalan` | `(id_anak, konten_uji)` — **tanpa `semesterid`** | `id_hafalan bigserial` | `(id_anak, semesterid, konten_uji)` — **memperbaiki bug**: sebelumnya anak tidak bisa diuji ulang konten sama di semester berbeda |
| `ajis_penyaluran` | `(id_row, id_penyaluran)` | `id bigserial` | `(id_penyaluran, id_pemasangan_baru, bulan, tahun)` |
| `ajis_survey` | `(id_survey, id_anak)` | `id_survey bigserial` | — |
| `ajis_wilayah_pembinaan` | `(id_wilayah_pembinaan, nama_wilayah)` — kolom kedua sia-sia | `id_wilayah_pembinaan bigserial` | `nama_wilayah` UNIQUE |
| `transaksi` | `(transid, detailid)` | `id bigserial` | `(transid, detailid)` |
| `setting_program` | `(id_program, progid)` | `id bigserial` | `id_program` UNIQUE |
| `manual_laporan_prestasi`, `materi` | `int` **tanpa** AUTO_INCREMENT (ID digenerate aplikasi) | `bigserial` | — |
| `ajis_batas_expired_peminjaman` | **tanpa PK** | dihapus, jadi baris di `app_setting` | — |

### 6.5 Tabel yang di-drop, di-merge, atau tetap terpisah

| Tabel legacy | Nasib | Alasan |
|---|---|---|
| `donatur` | **drop** | Menu Donatur jadi agregasi `ajis_pemasangan`; profil dari `corez_donatur` |
| `program` | **drop** | Duplikat `setting_program`; kolom `kredit_account` diserap |
| `ajis_propinsi` | **drop** | Duplikat `ref_propinsi` |
| `ajis_batas_expired_peminjaman` | **merge** → `app_setting` | Satu kolom, tanpa PK |
| `ajis_periode_penilaian` | **merge** → `app_setting` | 3 baris konfigurasi |
| `ajis_jabatan_sdm` + `ajis_fungsi_struktur` | **merge** → `sdm_penugasan` + `ref_fungsi_struktur` | Sesuai permintaan penggabungan SDM |
| `ajis_sdm_wilayah` | **rename** → `sdm_wilayah` | Tabel induk biodata SDM |
| `manual_laporan_lama` | **merge** → `manual_laporan` | Kolom `versi_struktur = 'lama'` sebagai penanda arsip |
| `kantor` **dan** `ajis_kantor` | **keduanya dipertahankan** | Relasi berbeda: `kantor.oid` dirujuk `manual_laporan.oid`/`materi.oid`; `ajis_kantor.oid` dirujuk `ajis_anak.kantor_id`/`ajis_pemasangan.kantor_id` dan view `ajis_view_penilaian`. Keduanya ikut dikonversi |
| `ajis_wilayah_pembinaan` | **dipertahankan** | Load-bearing meski tidak ada di daftar awal |
| — | **baru:** `map_kantor` | Jembatan ID kantor zains ↔ AJIS |
| — | **baru:** `app_setting` | Konfigurasi + watermark sinkron |
| — | **baru:** `sdm_penugasan`, `ref_fungsi_struktur`, `ref_pekerjaan` | Hasil pemecahan/rekonstruksi |

`ajis_view_ajuan` **tetap bernama demikian** meski isinya tabel biasa (bukan view) — nama dipertahankan agar rujukan silang ke sistem lama tetap jelas.

### 6.6 Tabel yang direkonstruksi dari kode legacy

Tiga tabel ada di daftar exclude dump:

| Tabel | Status | Sumber rekonstruksi |
|---|---|---|
| `ajis_fungsi_struktur` | Direkonstruksi → `ref_fungsi_struktur` | `modules/ajis/class/AjisClassIfa.php` (`FungsiStruktur_Read/Create/Update`): `id_fungsi_struktur`, `kode_fungsi`, `nama_fungsi_struktur`, `aktif`, `user_insert`, `date_insert`, `user_update`, `date_update` |
| `pekerjaan` | Direkonstruksi → `ref_pekerjaan` | `modules/ajis/class/ClassPekerjaan.php`: `kerjaid`, `pekerjaan` (+ `aktif`) |
| `manual_laporan_lama` | **Belum bisa direkonstruksi** | Tidak ada DDL di dump dan tidak dirujuk kode manapun di repo. `manual_laporan` dirancang sebagai union dengan `versi_struktur`; kolom khusus versi lama **perlu konfirmasi `SHOW CREATE TABLE` dari server** sebelum hari migrasi laporan (6 Oktober) |

---

## 7. Rencana Indexing untuk Jutaan Baris

### 7.1 Prinsip

1. **Index kolom filter yang benar-benar dipakai,** bukan covering-index gemuk. Legacy punya `ajis_opname KEY tahun (8 kolom)` dan `ajis_penyaluran KEY tgl_penyaluran (8 kolom)` yang tidak melayani sebagian besar predikat.
2. **Partial index untuk status selektif** (`WHERE status_pasangan`, `WHERE NOT status_tersalurkan`) — jauh lebih kecil dan lebih cepat.
3. **BRIN untuk kolom tanggal append-only** (`tgl_pembinaan`, `tgl_transaksi`, `tgl_penyaluran`) — ukuran sangat kecil untuk tabel jutaan baris.
4. **GIN trigram untuk pencarian nama** — menggantikan `LIKE '%…%'` yang selalu sequential scan, dan menggantikan `KEY nama_lengkap(1)` legacy yang praktis tidak berguna.
5. **Buang index redundan** yang cuma duplikat left-prefix PK (`ref_kabupaten UNIQUE kid`, `ref_propinsi UNIQUE pid`, `ajis_anak KEY id_anak`, `manual_laporan KEY laporanid`, `ajis_sdm_wilayah KEY id_sdm`).

### 7.2 Per tabel besar

| Tabel | Perkiraan volume | Index utama |
|---|---|---|
| `ajis_pembinaan_baru` | ±4,48 juta | `(id_anak, tgl_pembinaan DESC)`, `(kantor_id, id_wilayah_pembinaan, tahun, bulan)`, `(semesterid, id_anak)`, BRIN `(tgl_pembinaan)` |
| `ajis_input_donasi` | ±524 ribu | `(id_pemasangan_baru, tahun, bulan)`, `(id_anak, tahun)`, `(kantor_id, tahun, bulan)`, `(transid, detailid)`, BRIN `(tgl_transaksi)` |
| `ajis_penyaluran` | ±191 ribu | `(id_pemasangan_baru, tahun, bulan)`, `(kantor_id, tgl_penyaluran DESC)`, partial `WHERE NOT status_tersalurkan`, BRIN |
| `ajis_pemasangan` | ratusan ribu, tumbuh per tahun | `(tahun, kantor_id, status_pasangan)`, partial `WHERE status_pasangan`, `(id_anak, tahun)`, `(id_donatur, tahun)`, **`(nia_rfo, tahun)`** (legacy tidak ter-index padahal di-join), `(nama_anak, id)` untuk keyset pagination, GIN trgm `nama_anak` & `nama_donatur` |
| `ajis_survey` | ±62 ribu | `(id_anak)`, `(kantor_id, id_wilayah_pembinaan, tgl_survey DESC)`, GIN trgm `nama_lengkap` |
| `ajis_peminjaman_anak` | ±39 ribu | partial `WHERE status_pinjam AND NOT cancel`, `(id_peminjam, tgl_awal_peminjaman DESC)`, `(tgl_expired)` partial |
| `transaksi` | besar (mengikuti corez) | `(did, tgl_transaksi DESC)`, partial `WHERE approved_transaksi='y' AND NOT deleted_trans`, `(oid_transaksi, tgl_transaksi DESC)`, BRIN |
| `ajis_penilaian` | menengah | Legacy **tidak punya index sekunder sama sekali**; ditambah `(id_anak, semesterid)`, `(semesterid, kantor_id)`, `(id_item_penilaian, semesterid)` |
| `ajis_data_prestasi` | kecil | `(id_anak, tgl DESC)` — legacy tidak punya index `id_anak` sama sekali |
| `ajis_anak` | ratusan ribu | `(kantor_id, id_wilayah_pembinaan, status_anak_juara)`, partial CAJ, `(nia_rfo_book)`, GIN trgm `nama_lengkap` |

---

## 8. Peta 29 VIEW Legacy → Penggantinya

| View legacy | Dipakai | Pengganti |
|---|---|---|
| `ajis_view_anak_juara` | Menu Anak Juara | Query flat ke `ajis_pemasangan` + agregat lazy per halaman (§9.2) |
| `ajis_view_profile`, `ajis_view_profile2` | Basis view di atas | Join eksplisit di query, tanpa `ORDER BY` di dalam view |
| `ajis_view_donasi` | Pivot Jan–Des donasi | `mv_donasi_bulanan` (`FILTER (WHERE bulan = n)`) |
| `ajis_view_donasi_kantor` | Rekap donasi per kantor | Agregasi `mv_donasi_bulanan` |
| `ajis_view_penyaluran` | Pivot Jan–Des penyaluran | `mv_penyaluran_bulanan` |
| `ajis_view_penyaluran_kantor` | Rekap penyaluran per kantor | Agregasi `mv_penyaluran_bulanan` |
| `ajis_view_rfo`, `ajis_view_donatur_beasiswa_by_rfo` | Daftar RFO | `mv_zisco_agregat` |
| `ajis_view_donatur_unlink_by_rfo` | Donatur belum terpasangkan | Query langsung `zains_rz.corez_donatur` `LEFT JOIN` snapshot pemasangan |
| `ajis_view_book_anak_by_rfo` | Anak yang di-book RFO | Query `ajis_anak WHERE nia_rfo_book = $1` (sudah ter-index) |
| `ajis_view_antrian_approval_by_rfo` | Antrean approval funding | Query `ajis_view_ajuan` partial index `WHERE approve_funding='t'` |
| `ajis_view_saldo_anak_habis_by_rfo`, `ajis_view_saldo_anak_urgent_by_rfo` | Peringatan saldo | Query `ajis_opname` + partial index |
| `ajis_view_rekap_zams` | Dashboard funding | `mv_rekap_transaksi_bulanan` + `mv_zisco_agregat` |
| `ajis_view_penilaian` | Pivot penilaian | Pivot di query dengan `FILTER`, join by `id_item_penilaian` (integer), bukan literal string `'1'`…`'30'` |
| `ajis_view_rekap_penilaian`, `ajis_view_resume_penilaian` | Rantai 3 level di atas | Satu query agregat langsung ke `ajis_penilaian` yang kini ber-index |
| `ajis_calon_anak_juara`, `ajis_calon_anak_juara_reguler` | Menu CAJ | Query `ajis_anak` partial index `WHERE status_anak_juara='caj' AND aktif` |
| `ajis_pemasangan_full_biodata` | Detail pemasangan | Join eksplisit di endpoint detail |
| `ajis_view_transaksi_by_donatur_inserted`, `ajis_view_donasi_by_donatur_inserted` | Rekonsiliasi donasi vs transaksi | Agregat numerik |
| `ajis_view_selisih_transaksi_donasi`, `ajis_view_selisih_tgl_donasi` | Selisih | **Diperbaiki, bukan diporting.** Legacy membandingkan `format(sum(...),0,'de_DE')` — dua **string ber-format** — dengan `<>`. Penggantinya membandingkan `numeric` |
| `ajis_view_perbandingan_transaksi_donasi` | Perbandingan | Sama seperti di atas, numerik |
| `ajis_view_hutang_saldo_2021`, `_2021_1`, `_2021_new` | — | **Tidak diporting.** Tiga view kembar khusus tahun 2021 |

---

## 9. Strategi Performa

Target: **p95 daftar utama < 300 ms**, tidak ada endpoint > 1 detik pada 200 user konkuren.

### 9.1 Tanpa VIEW bertingkat

Daftar Anak Juara membaca `ajis_pemasangan` secara flat dengan index `(tahun, kantor_id, status_pasangan)`. Tidak ada join ke pivot donasi/penyaluran pada query daftar.

### 9.2 Agregat dimuat per halaman, bukan per tabel

```
1. Ambil satu halaman dari ajis_pemasangan (cepat, ter-index)
2. Kumpulkan id_pemasangan_baru pada halaman itu (misal 50 ID)
3. Ambil agregat HANYA untuk 50 ID tersebut dari mv_donasi_bulanan /
   mv_penyaluran_bulanan / ajis_opname
4. Gabungkan di layer aplikasi
```

Ini menghindari pemindaian seluruh view di setiap request — akar masalah lambatnya sistem sekarang.

### 9.3 Keyset pagination

Untuk grid besar, `OFFSET` besar diganti keyset:

```sql
SELECT ... FROM ajis_pemasangan
WHERE tahun = $1 AND (nama_anak, id) > ($2, $3)
ORDER BY nama_anak, id
LIMIT $4;
```

Index `(nama_anak, id)` sudah disiapkan.

### 9.4 Total baris tidak dihitung ulang setiap request

- Grid ber-filter: `COUNT(*)` di-cache pendek dengan kunci = hash filter.
- Grid tanpa filter: estimasi dari `pg_class.reltuples`.
- UI memakai pola "Muat lebih banyak"/keyset, sehingga total baris tidak selalu wajib.

### 9.5 Materialized view

Lima MV disiapkan di [`db/schema.sql`](../db/schema.sql): `mv_donasi_bulanan`, `mv_penyaluran_bulanan`, `mv_donatur_agregat`, `mv_zisco_agregat`, `mv_rekap_transaksi_bulanan`. Semua di-refresh `CONCURRENTLY` oleh job QStash — tidak pernah saat request.

### 9.6 Koneksi

Neon **pooled connection string** wajib. Di serverless, koneksi tanpa pooling akan habis jauh sebelum 200 user tercapai.

---

## 10. Caching (Upstash Redis) & Penjadwalan (QStash)

Pengguna butuh **cepat sekaligus konsisten**: perubahan harus langsung terlihat. Karena itu cache tidak boleh hanya mengandalkan TTL.

### 10.1 Klasifikasi data

| Kelas | Contoh | Kebijakan |
|---|---|---|
| Referensi jarang berubah | `ref_*`, `kantor`, `ajis_kantor`, `ajis_wilayah_pembinaan`, `setting_program`, `ajis_semester`, `app_setting`, `map_kantor` | TTL 24 jam + invalidasi saat setting diubah |
| Agregat mahal | Rekap transaksi, rekap donasi bulanan, total baris grid, dashboard, agregat donatur/zisco | TTL 60–300 detik **+ invalidasi eksplisit** |
| **Tidak di-cache** | Detail anak, detail pemasangan, list ajuan, saldo/opname, seluruh halaman transaksional | Selalu langsung dari Postgres |

Prinsipnya: data yang jadi dasar keputusan keuangan tidak pernah disajikan dari cache basi.

### 10.2 Invalidasi write-through

`invalidate(tags)` dipanggil **setelah `COMMIT` sukses**, bukan sebelum.

| Aksi tulis | Tag yang di-invalidate |
|---|---|
| Eksekusi ajuan ganti anak | `anak:{id}`, `pemasangan:{id_pemasangan_baru}`, `donatur:{id_donatur}`, `rekap:kantor:{kantor_id}:{tahun}`, `zisco:{nia_rfo}` |
| Input donasi | `pemasangan:{id}`, `donasi:{kantor_id}:{tahun}` |
| Penyaluran | `pemasangan:{id}`, `penyaluran:{kantor_id}:{tahun}` |
| Ubah setting program | `ref:setting_program` |
| Ubah wilayah/kantor | `ref:wilayah`, `ref:kantor` |

### 10.3 Cache key memuat scope

```
v{ver}:{resource}:{kantorScope}:{wilayahScope}:{paramsHash}
```

Untuk peran non-superadmin, `kantorScope`/`wilayahScope` **selalu** diambil dari sesi. Cache key tanpa scope adalah kebocoran multi-tenant yang sama bahayanya dengan query tanpa filter.

### 10.4 Versioned namespace

Invalidasi kelompok dilakukan dengan `INCR ver:{resource}`, bukan `SCAN` + `DEL` (mahal dan tidak atomik). Kunci lama otomatis tidak terjangkau dan kedaluwarsa sendiri.

### 10.5 Aturan tambahan

- **Anti-stampede:** lock singkat per key saat menghitung ulang agregat berat, agar ratusan user tidak memicu query berat yang sama bersamaan.
- **Stale-while-revalidate** hanya untuk data non-kritis (dashboard, statistik).
- **Redis boleh mati.** Semua jalur baca harus tetap benar tanpa Redis — fallback langsung ke Postgres. Redis adalah optimasi, bukan sumber kebenaran.

### 10.6 QStash

| Job | Jadwal |
|---|---|
| Sinkron `corez_transaksi` | tiap 15 menit |
| Sinkron `corez_donatur`, `hcm_karyawan`, `hcm_kantor`, `setting_program` | harian |
| Refresh 5 materialized view | tiap 15 menit + on-demand setelah write besar |
| Export XLSX/PDF besar (hasil ke R2, user dapat link) | on-demand |
| Generate raport semester massal | on-demand |

Setelah `REFRESH MATERIALIZED VIEW CONCURRENTLY` sukses, job yang sama meng-`INCR` versioned namespace Redis terkait — sehingga cache dan MV tidak pernah saling mendahului. QStash juga menyediakan retry dan dead-letter otomatis, menggantikan cron PHP legacy di `sinkronisasi_transaksi_corez_ajis/`.

---

## 11. Export XLSX/PDF & Penyimpanan File

### 11.1 Export

| Ukuran | Cara |
|---|---|
| ≤ 5.000 baris | Sinkron di route handler, streaming `exceljs` |
| > 5.000 baris | Job QStash → tulis ke R2 → user dapat link unduh; UI menampilkan status job |

### 11.1a PDF live view

Raport pembinaan dan laporan semester memakai `@react-pdf/renderer`, dengan **dua mode dari satu definisi dokumen yang sama** — ini yang membuat modul laporan paling tricky:

| Mode | Cara | Kapan |
|---|---|---|
| **Live view** | `@react-pdf/renderer` versi browser (`PDFViewer`) — dokumen dirender di sisi klien, berubah realtime saat data/template diedit | Saat pengguna menyusun & meng-QC raport |
| **Generate** | Renderer di runtime `nodejs`, hasil ditulis ke R2 | Saat mencetak final / kirim ke donatur |

Hal yang harus dijaga agar dua mode tidak berbeda hasil:

- **Satu komponen dokumen** dipakai keduanya; tidak boleh ada cabang khusus preview.
- **Template dari `ajis_semester`** (cover, kata pengantar, kotak profil/pembinaan, keuangan, surat) di-parse ke komponen, bukan di-`dangerouslySetInnerHTML`.
- **Font didaftarkan eksplisit** dan di-bundle; font sistem berbeda antara browser dan runtime server dan akan menggeser paginasi.
- **Gambar dari R2 dipakai lewat signed URL** yang sama di kedua mode.
- Live view dibatasi **satu raport** yang sedang dibuka; cetak banyak raport selalu lewat job QStash, tidak pernah merender puluhan dokumen di browser.

Untuk generate massal, satu job QStash per batch kantor/wilayah; hasilnya di R2 dan pengguna menerima link unduh.

### 11.2 Cloudflare R2

- Upload dari browser memakai **presigned URL**; file tidak melewati server Next.js.
- Object key terstruktur: `{jenis}/{semesterid}/{kantor_id}/{id}/{nama-file}` — contoh di `db/seed.sql`.
- Database menyimpan **object key**, bukan URL penuh, agar domain/bucket bisa berubah tanpa migrasi data.
- Akses baca lewat signed URL berumur pendek untuk lampiran laporan yang bersifat privat.
- Validasi tipe & ukuran file dilakukan server-side sebelum presign diterbitkan.

---

## 12. Timeline Development — 18 Agustus s.d. 25 September 2026

**Asumsi:** 1 developer, 1 hari 1 task, Senin–Jumat. **29 hari kerja.**

Setiap hari menghasilkan sesuatu yang bisa dijalankan dan dilihat, bukan hanya kode setengah jadi.

### Fase 0 — Fondasi (5 hari, 18–24 Agustus)

| # | Tanggal | Task | Deliverable |
|---|---|---|---|
| 1 | Sel, 18 Agu | Scaffolding Next.js App Router + Neon + Drizzle Kit; apply `db/schema.sql`; jalankan `db/seed.sql` | Aplikasi jalan di Vercel preview, database terisi seed |
| 2 | Rab, 19 Agu | NextAuth SSO Google + mapping `ajis_user.email`; helper `getScope()`; middleware proteksi route | Login Google berfungsi untuk 3 peran seed |
| 3 | Kam, 20 Agu | Layout responsif (desktop + mobile), shell menu 22 item, navigasi berbasis peran | Kerangka UI lengkap, menu tampil sesuai peran |
| 4 | Jum, 21 Agu | Lapisan data: helper raw SQL parameterized, keyset pagination, komponen DataGrid reusable (filter, sort, kolom beku) | Satu grid contoh jalan dengan data seed |
| 5 | Sen, 24 Agu | Koneksi kedua `lib/db/zains.ts` (SELECT-only); helper Redis `cache()`/`invalidate()`; endpoint job QStash; job sinkron `hcm_kantor` → `map_kantor` | `map_kantor` terisi dari zains_rz; cache & job terbukti jalan |

### Prioritas porsi durasi

Sisa 24 hari setelah fondasi dibagi menurut bobot kesulitan, **dari yang terbesar**:

| Peringkat | Fase | Hari | Alasan porsi |
|---|---|---|---|
| 1 | **Keuangan** | **9** | Pivot keuangan Jan–Des adalah bagian tersulit sekaligus akar masalah lambatnya sistem lama; ditambah breakdown transaksi, input donasi massal, penyaluran, dan eksekusi ajuan yang harus atomik |
| 2 | **Laporan** | **8** | Tricky karena ada **PDF live view** — render realtime di browser dengan template dari `ajis_semester` dan aset dari R2, plus generate massal |
| 3 | **Profiling** | **7** | Paling banyak layar tapi paling lurus: CRUD + form + daftar, tanpa perhitungan atau rendering rumit |

Urutan pengerjaan di kalender tetap Profiling → Keuangan → Laporan, mengikuti alur data.

### Fase 1 — Profiling (7 hari, 25 Agustus – 2 September)

**Objektif:** dari pengajuan anak masuk → survei → CAJ → peminjaman → **tertaut ke donatur**. Berhenti di titik pemasangan terbentuk.

Menu **Anak Juara** tidak ada di fase ini: grid tersebut adalah tempat pivot keuangan Jan–Des berada, sehingga masuk Fase 2. Yang dibangun di sini adalah **pembentukan pemasangan** beserta daftar identitasnya (tanpa kolom keuangan) — cukup untuk menjalankan alur profiling dan membuat ajuan pergantian.

| # | Tanggal | Task | Deliverable |
|---|---|---|---|
| 6 | Sel, 25 Agu | Menu **Setting Propinsi/Kabupaten/Kecamatan/Kelurahan** (CRUD `ref_*` bertingkat) + menu **Data Wilayah** (`ajis_wilayah_pembinaan` + approval) | Seluruh master wilayah berfungsi |
| 7 | Rab, 26 Agu | Menu **SDM Wilayah** (`sdm_wilayah` + `sdm_penugasan` + `ref_fungsi_struktur`, sinkron identitas dari `hcm_karyawan`) | SDM + riwayat penugasan berfungsi |
| 8 | Kam, 27 Agu | Menu **Pengajuan Beasiswa** — form biodata anak (identitas, alamat, sekolah, orang tua/wali), daftar, filter, detail, edit, upload foto ke R2 | Anak baru bisa didaftarkan & dikelola |
| 9 | Jum, 28 Agu | Menu **Data Hasil Survey** — form survei (kondisi rumah, ekonomi, ibadah), daftar, filter, export XLSX, transisi status anak → CAJ | Survei bisa diinput mentor dari ponsel; anak layak jadi CAJ |
| 10 | Sen, 31 Agu | Menu **Calon Anak Juara** (daftar CAJ dengan partial index) + menu **Peminjaman Data CAJ** (pinjam/kembalikan/batalkan, batas expired dari `app_setting`, relasi ke daftar peminjam) | Alur CAJ & peminjaman lengkap |
| 11 | Sel, 1 Sep | **Pemasangan** — tautkan anak ke donatur: buat pemasangan (transaksional), daftar identitas pemasangan tanpa kolom keuangan, hentikan pemasangan | **Alur profiling tuntas: anak tertaut ke donatur** |
| 12 | Rab, 2 Sep | Menu **List Ajuan Pergantian** (daftar, filter, buat, hapus, ulangi) + **Approve/Reject funding** — endpoint yang di sistem lama tidak ada sama sekali | Ajuan bisa dibuat, diapprove, direject |

### Fase 2 — Keuangan (9 hari, 3–15 September) — porsi terbesar

**Objektif:** seluruh yang berkaitan dengan uang — grid Anak Juara beserta pivot keuangannya, breakdown transaksi masuk, input donasi, penyaluran, dan eksekusi ajuan pergantian (yang memindahkan donasi & saldo).

| # | Tanggal | Task | Deliverable |
|---|---|---|---|
| 13 | Kam, 3 Sep | Menu **Anak Juara** — grid utama dari `ajis_pemasangan`, keyset pagination, filter dasar (tahun, kantor, wilayah, program, status pasangan) | **Target performa < 300 ms tervalidasi** |
| 14 | Jum, 4 Sep | Menu **Anak Juara** — **pivot keuangan Jan–Des** dimuat per halaman dari `mv_donasi_bulanan` + `mv_penyaluran_bulanan` + `ajis_opname` | Pivot keuangan tampil **tanpa** view bertingkat |
| 15 | Sen, 7 Sep | Menu **Anak Juara** — filter lanjutan keuangan: kolom WH + operator, wajib/aktif ganjil-genap, selisih saldo Juni-Juli, naik jenjang, tunda salur; export XLSX | Seluruh filter menu lama berfungsi |
| 16 | Sel, 8 Sep | Job sinkron `corez_transaksi` (incremental via `dtu`) + menu **Transaksi** (daftar, filter, detail) | Transaksi zains tampil di AJIS |
| 17 | Rab, 9 Sep | Menu **Rekap Transaksi** dari `mv_rekap_transaksi_bulanan` + refresh terjadwal + rekonsiliasi donasi vs transaksi secara **numerik** | Rekap cepat, tidak lagi membandingkan string ber-format |
| 18 | Kam, 10 Sep | Menu **Donatur** (`mv_donatur_agregat`) + **Zisco/Daftar Peminjam** (`mv_zisco_agregat`), detail read-through ke `corez_donatur` | Dua menu berjalan tanpa tabel tersendiri |
| 19 | Jum, 11 Sep | Menu **Input Donasi** — breakdown transaksi jadi donasi bulanan per anak (transaksional) | Donasi bisa diinput & dipecah per bulan |
| 20 | Sen, 14 Sep | Menu **Input Donasi** — input massal, upload XLSX, validasi, refresh `mv_donasi_bulanan` | Input massal berfungsi |
| 21 | Sel, 15 Sep | Menu **Penyaluran** (single & massal, HPP dari `setting_program`, status tersalurkan) + **Eksekusi Ajuan Pergantian** — 11 langkah SQL dalam **satu transaksi** | Penyaluran berjalan; eksekusi atomik — memperbaiki risiko state separuh jadi di sistem lama |

### Fase 3 — Laporan (8 hari, 16–25 September)

**Objektif:** prestasi, pembinaan, hafalan, penilaian, laporan semester. Bagian tersulitnya adalah **PDF live view** — pengguna melihat hasil raport/laporan semester secara realtime di browser sebelum digenerate massal.

| # | Tanggal | Task | Deliverable |
|---|---|---|---|
| 22 | Rab, 16 Sep | Menu **Semester** — CRUD periode + editor template laporan (cover, kata pengantar, kotak profil/pembinaan, keuangan, surat) | Template laporan semester bisa dikelola |
| 23 | Kam, 17 Sep | Menu **Pembinaan Anak Juara** — input pembinaan dari ponsel (kehadiran, capaian tilawah/tahfidz, pembiasaan), daftar & filter di atas tabel ±4,5 juta baris | Mentor bisa input pembinaan di lapangan |
| 24 | Jum, 18 Sep | Menu **Laporan Pembinaan** (`manual_laporan_pembinaan`) + menu **Materi** (arsip read-only) | Rekap materi pembinaan per laporan |
| 25 | Sen, 21 Sep | Menu **Prestasi** (`ajis_data_prestasi` + `manual_laporan_prestasi`) + **Hafalan** (item hafalan, uji per semester) | Prestasi & hafalan lengkap |
| 26 | Sel, 22 Sep | Menu **Penilaian** — item penilaian bertingkat, input per aspek, pivot & resume penilaian (mengganti rantai view 3 level) | Penilaian & resume berfungsi |
| 27 | Rab, 23 Sep | Menu **Raport Pembinaan** (`manual_laporan`: data, alur QC lampiran) + menu **Dokumentasi** (upload R2, signed URL) | Data raport semester siap dirender |
| 28 | Kam, 24 Sep | **PDF live view** — renderer `@react-pdf/renderer`, preview realtime di browser memakai template `ajis_semester`, penomoran halaman, embed foto & lampiran dari R2 | **Pengguna bisa melihat raport persis seperti hasil cetaknya** |
| 29 | Jum, 25 Sep | Generate PDF massal via QStash → R2 (link unduh), export XLSX lintas modul, API keluar `/api/external/*`, penyisiran akhir | **Aplikasi siap untuk migrasi data** |

### Ringkasan alokasi

| Fase | Hari | Jumlah | Porsi |
|---|---|---|---|
| Fase 0 — Fondasi | #1–#5 (18–24 Agu) | 5 | — |
| Fase 2 — **Keuangan** (Anak Juara + pivot, transaksi, donasi, penyaluran) | #13–#21 (3–15 Sep) | **9** | terbesar |
| Fase 3 — **Laporan** (termasuk PDF live view) | #22–#29 (16–25 Sep) | **8** | kedua |
| Fase 1 — **Profiling** (pengajuan → tertaut donatur) | #6–#12 (25 Agu – 2 Sep) | **7** | ketiga |
| **Total** | | **29 hari kerja** | |

---

## 13. Timeline Migrasi Data + QA — 28 September s.d. 9 Oktober 2026

10 hari kerja. QA berjalan **paralel setiap hari**, bukan hanya di akhir.

| # | Tanggal | Task | Deliverable |
|---|---|---|---|
| 1 | Sen, 28 Sep | Tulis skrip ETL MySQL→Postgres: transcoding latin1→UTF-8, `'0000-00-00'`→`NULL`, pemetaan enum→varchar/boolean, penyeragaman tipe kunci, ringkas kolom `*_postgree` → `external_ids` | Skrip ETL siap uji |
| 2 | Sel, 29 Sep | **Dry-run penuh** di database staging; laporan eksepsi: duplikasi natural key, kunci yatim, kantor tanpa padanan di `map_kantor`, cek korupsi konten Arab `ajis_hafalan.konten_uji` | Daftar eksepsi + keputusan penanganan |
| 3 | Rab, 30 Sep | Migrasi master & referensi: `ref_*`, `kantor`, `ajis_kantor`, `ajis_wilayah_pembinaan`, SDM, semester, user; **build `map_kantor`** dan **rekonsiliasi `setting_program` AJIS ↔ zains** (validasi kelengkapan kolom HPP) | Master lengkap; program tanpa HPP tertandai |
| 4 | Kam, 1 Okt | Migrasi profiling: `ajis_anak`, `ajis_survey`, `ajis_peminjaman_anak` | Data profiling lengkap |
| 5 | Jum, 2 Okt | Migrasi pemasangan: `ajis_pemasangan`, `ajis_opname`, `ajis_view_ajuan` | Rantai pemasangan lengkap |
| 6 | Sen, 5 Okt | Migrasi keuangan: `ajis_input_donasi`, `ajis_penyaluran`, `transaksi` | Data keuangan lengkap |
| 7 | Sel, 6 Okt | Migrasi laporan: `ajis_pembinaan_baru` (±4,48 juta baris — `COPY` berbatch), prestasi, hafalan, penilaian, dokumentasi, `manual_laporan` + merge `manual_laporan_lama`, materi | Seluruh data historis masuk |
| 8 | Rab, 7 Okt | **Rekonsiliasi**: hitung baris & checksum per tabel vs sumber; uji agregat keuangan (total donasi, penyaluran, saldo opname) vs sistem lama; refresh seluruh MV | Laporan rekonsiliasi disetujui |
| 9 | Kam, 8 Okt | **QA fungsional end-to-end** seluruh 22 menu per peran + **uji beban** 200 user konkuren + tuning index dari `pg_stat_statements` | Hasil uji beban memenuhi target p95 |
| 10 | Jum, 9 Okt | **UAT** bersama pengguna, perbaikan temuan, keputusan go/no-go, rencana cutover | Keputusan go-live |

### Catatan migrasi

- **`ajis_pembinaan_baru` (±4,48 juta baris)** dimigrasikan dengan `COPY` berbatch (mis. 50 ribu baris) di dalam transaksi terpisah per batch, dengan index dibuat **setelah** data masuk agar jauh lebih cepat.
- **Kantor tanpa padanan `map_kantor`** dilaporkan sebagai eksepsi dan diputuskan manual — tidak boleh diam-diam jadi `NULL`.
- **Konten Arab** di `ajis_hafalan.konten_uji` tersimpan di kolom latin1 dan menjadi bagian PK legacy. Kemungkinan sudah korup di sumber. Diperiksa di hari #2; bila korup, perlu keputusan bisnis (input ulang vs terima apa adanya).
- **`manual_laporan_lama`** butuh `SHOW CREATE TABLE` dari server sebelum hari #7.

---

## 14. Acceptance Criteria

### Fase 1 — Profiling
- [ ] Anak baru bisa didaftarkan, disurvei, ditetapkan sebagai CAJ, dipinjam RFO, lalu **tertaut ke donatur** — dalam satu alur utuh.
- [ ] Pembuatan dan penghentian pemasangan berjalan transaksional.
- [ ] Ajuan ganti anak bisa dibuat, diapprove/direject funding, dan diulangi.
- [ ] Peran SpMD hanya melihat kantornya; peran mentor hanya melihat wilayahnya — diverifikasi dengan mencoba memanipulasi parameter request.

### Fase 2 — Keuangan
- [ ] Daftar Anak Juara **tidak** menyentuh view bertingkat manapun; p95 < 300 ms pada data produksi.
- [ ] Seluruh filter menu Anak Juara di sistem lama tetap berfungsi, termasuk kolom WH, wajib/aktif ganjil-genap, dan selisih saldo Juni/Juli.
- [ ] Pivot keuangan Jan–Des dimuat hanya untuk baris pada halaman aktif, bukan memindai seluruh tabel.
- [ ] Transaksi tersinkron dari `corez_transaksi` secara incremental tanpa duplikasi.
- [ ] Input donasi memecah transaksi menjadi donasi bulanan per anak dengan benar.
- [ ] Penyaluran menghitung HPP dari `setting_program` milik AJIS.
- [ ] Menu Donatur & Zisco berfungsi **tanpa** tabel `donatur` maupun tabel zisco.
- [ ] **Eksekusi ajuan berjalan atomik** — kegagalan di langkah manapun me-rollback seluruhnya.
- [ ] Rekap transaksi cocok dengan sistem lama untuk periode uji.

### Fase 3 — Laporan
- [ ] Mentor bisa menginput pembinaan, hafalan, penilaian, prestasi dari ponsel.
- [ ] **PDF live view** menampilkan raport realtime di browser, dan hasilnya **identik** dengan PDF yang digenerate di server (paginasi, font, posisi gambar) — diuji dengan membandingkan minimal 5 raport lintas jenjang.
- [ ] Raport pembinaan & laporan semester bisa digenerate massal via QStash ke R2 dengan link unduh.
- [ ] Dokumentasi terunggah ke R2 dan tampil kembali via signed URL.
- [ ] Menu Materi read-only, tanpa jalur penambahan data.
- [ ] Export XLSX untuk seluruh grid utama, memakai filter yang sedang aktif.

### Lintas fase
- [ ] Tidak ada `CREATE VIEW` biasa, `CREATE TYPE ... AS ENUM`, kolom UUID, atau kolom uang `double precision` di skema.
- [ ] Tidak ada `import` Drizzle di dalam `app/api/**`.
- [ ] Setiap operasi multi-tabel berada di dalam transaksi.
- [ ] Aplikasi tetap berfungsi saat Redis mati dan saat `zains_rz` tidak terjangkau.
- [ ] Uji beban 200 user konkuren memenuhi target p95.

---

## 15. Risiko & Pertanyaan Terbuka

| # | Hal | Dampak | Rencana |
|---|---|---|---|
| 1 | `manual_laporan_lama` tidak ada DDL-nya dan tidak dirujuk kode manapun | Sedang | `manual_laporan` dirancang sebagai union dengan `versi_struktur`; minta `SHOW CREATE TABLE` sebelum 6 Okt |
| 2 | Cakupan `hcm_kantor.id_kantorold` — belum dipastikan semua kantor AJIS punya padanan (kolom `NOT NULL` tapi bisa string kosong) | **Tinggi** — memengaruhi scoping per kantor | Diperiksa di ETL dry-run 29 Sep; eksepsi dilaporkan, bukan di-`NULL`-kan |
| 3 | Nilai `id_donatur` harus identik antara `ajis_pemasangan.id_donatur` (legacy join ke `donatur.did`) dan `corez_donatur.id_donatur` | **Tinggi** | Diperiksa di dry-run; bila beda format, butuh `map_donatur` seperti `map_kantor` |
| 4 | Nilai `id_program` AJIS vs zains — legacy AJIS ber-PK `(id_program, progid)`, peran `progid` belum jelas | Sedang | Diperiksa saat rekonsiliasi 30 Sep; bila tidak identik, butuh `map_program` |
| 5 | Tabel `donatur` di-drop, padahal menyuplai `jenis_donatur`/`hp` ke form Ajuan | Sedang | Pastikan seluruh field yang dipakai UI sudah tersnapshot di `ajis_pemasangan`/`ajis_view_ajuan`; sisanya read-through ke `corez_donatur` |
| 6 | Konten Arab `ajis_hafalan.konten_uji` di kolom latin1 dan jadi bagian PK legacy | Sedang | Diperiksa 29 Sep; bila korup, keputusan bisnis input ulang vs terima apa adanya |
| 7 | Kode tinyint zains (`id_via_bayar` dsb.) | Rendah | Hanya kode yang benar-benar tampil di UI yang perlu tabel label; sisanya disimpan apa adanya. `id_jenis` disimpan mentah sebagai `jcustid` |
| 8 | Timeline 1 developer sangat padat — 29 hari untuk 22 menu | **Tinggi** | Porsi sudah dibobot: Keuangan 9 hari, Laporan 8, Profiling 7. Bila meleset, urutan penundaan: (1) generate PDF massal & export lintas modul (#29) — bisa menyusul setelah go-live; (2) menu Penilaian & resume (#26) — dipakai per semester, bukan harian; (3) input donasi massal XLSX (#20) — sementara pakai input satuan. **Yang tidak boleh ditunda:** pivot keuangan Anak Juara (#14–15) dan eksekusi ajuan atomik (#21) |

---

## 16. Lampiran

| Berkas | Isi |
|---|---|
| [`db/schema.sql`](../db/schema.sql) | DDL Postgres lengkap: 37 tabel, constraint, 105 index, 5 materialized view |
| [`db/seed.sql`](../db/seed.sql) | Sample seed berantai: 3 kantor, 3 peran, 4 anak, 2 pemasangan, donasi–penyaluran–opname, 1 ajuan, pembinaan, prestasi, hafalan, penilaian, laporan semester (versi baru & arsip lama) |
| [`prd.md`](../prd.md) | PRD detail modul Ajuan Ganti Anak — kontrak query per langkah eksekusi |
| `database_dump.sql` | Dump sumber MariaDB `sipc_ijf` (2026-07-08) |
