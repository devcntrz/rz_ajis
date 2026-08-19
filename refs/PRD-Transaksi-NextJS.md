# Bedah Codebase: Modul Transaksi & Transaksi Admin (AJIS) → Rencana Konversi Next.js

**Versi:** 1.0 · **Tanggal:** 18 Agustus 2026
**Ruang lingkup:** halaman `Transaksi` (user cabang/pusat) dan `TransaksiAdmin` (admin), beserta seluruh fungsi, query, dan integrasi yang dipakainya.
**Dokumen induk:** [PRD-AJIS-NextJS.md](PRD-AJIS-NextJS.md)

---

## 1. Ringkasan Eksekutif

Modul Transaksi adalah **jembatan antara data donasi (transaksi donatur) dan data penyaluran ke Anak Juara**. Alurnya:

```
Data transaksi donatur (dari ZAINS / API RZ / upload Excel)
        ↓  (Get Transid / Get Donatur / Import XLS)
   tabel `transaksi`  ──► direview & di-approve salur (bulan/tahun salur)
        ↓  (Entry CF / Update CF / Entry Premium)
   tabel `ajis_input_donasi`  ──► dipakai laporan semester, penyaluran, saldo anak
        ↓
   `transaksi.total_input_donasi` & `transaksi.selisih_donasi` di-recalc
```

Aturan inti: **satu baris transaksi (transid + detailid) dipecah ke banyak anak**, dan jumlah nominal per anak **harus sama persis** dengan `perkiraan_rp` transaksi sebelum boleh disimpan.

**Angka kasar codebase:**

| Berkas | Baris | Peran |
|---|---:|---|
| [modules/ajis/Transaksi.php](../modules/ajis/Transaksi.php) | 272 | Router `switch($m)` untuk halaman user |
| [modules/ajis/TransaksiAdmin.php](../modules/ajis/TransaksiAdmin.php) | 247 | Router `switch($m)` untuk halaman admin (+ upload) |
| [modules/ajis/class/TransaksiClass.php](../modules/ajis/class/TransaksiClass.php) | 8.009 | Seluruh logika & query (±140 method) |
| [modules/ajis/class/TransaksiUploadClass.php](../modules/ajis/class/TransaksiUploadClass.php) | 312 | Import Excel → `transaksi_temp` → `transaksi` |
| [modules/ajis/html/Transaksi.html](../modules/ajis/html/Transaksi.html) | 1.012 | UI EasyUI halaman user |
| [modules/ajis/html/TransaksiAdmin.html](../modules/ajis/html/TransaksiAdmin.html) | 1.214 | UI EasyUI halaman admin |
| [modules/ajis/script/Transaksi.js](../modules/ajis/script/Transaksi.js) | 2.711 | Seluruh perilaku klien (dipakai kedua halaman) |
| `get_transaksi*.php` | 412 | Endpoint tarik data transaksi dari sumber luar |
| **Total** | **±14.200** | |

---

## 2. Arsitektur Legacy

### 2.1 Alur request

```
Browser (EasyUI datagrid/dialog)
   │  GET/POST ?mod=ajis&file=Transaksi&m=<method>&<params>
   ▼
index.php → config/config.php (ADOdb $conn ke MySQL sipc_ijf)
   ▼
modules/ajis/Transaksi.php
   ├─ extract($_GET); extract($_POST);          ← semua param jadi variabel global
   ├─ $o = new CTransaksi();
   ├─ foreach(GET+POST) $o->$key = $value;      ← semua param jadi properti objek
   └─ switch ($m) { case 'r': $o->Transaksi_ReadBaru(); ... }
                                    ▼
                         echo json_encode($result);   ← langsung ke output
```

Poin penting untuk konversi:

- **Tidak ada layer model/DTO.** Method langsung merangkai SQL string dan `echo json_encode`.
- **Parameter tidak dideklarasikan.** Semua `$this->xxx` datang dari query string. Ini harus diganti skema validasi eksplisit (Zod) di Next.js.
- **Autentikasi via `$_SESSION`**: `$_SESSION['username']`, `$_SESSION['id_group_user']`, `$_SESSION['id_kantor']`, `$_SESSION['nama_user']`.
- **Otorisasi**: `id_group_user == 2` = **user cabang** → data difilter `find_in_set(id_kantor, transaksi.id_kantor_ijis)` dan hanya yang sudah `review='y' AND approve_salur='y'`. Selain itu = pusat/admin (tanpa filter kantor).
- Semua response bertipe `{total, rows[], footer[]}` (format datagrid EasyUI).

### 2.2 Perbedaan `Transaksi` vs `TransaksiAdmin`

| Aspek | Transaksi (user) | TransaksiAdmin |
|---|---|---|
| Grid utama `m=r` | `Transaksi_ReadBaru()` | `Transaksi_Read()` **(method tidak ada → fatal)** |
| Tab | Transaksi, Transaksi Review | Transaksi, Review, **Cicilan** |
| Simpan entry | `c_kantor_ganjil` / `c_kantor_genap` (pisah semester) | `c_kantor` (satu method, tanpa ganjil/genap) |
| Update entry | `u_kantor_ganjil` / `u_kantor_genap` | `u_kantor_update` |
| Entry Premium | `SelectTransaksiPremiumGanjil/Genap` (loop dari `ajis_pemasangan`) | `TransaksiKantor_CreatePremium()` (versi lama) |
| Import Excel | ❌ | ✅ `upload_transaksi`, `r3_transaksi`, `import_transaksi`, `download_format_transaksi` |
| Hapus permanen | `de` | `de` + tombol "Delete Transaksi" |
| Session guard | tidak ada | ada (`die` bila `$_SESSION['username']` kosong) |
| Error handling | tidak ada | `try/catch` + log ke `transaksi_admin_error.log` |

> Kedua halaman memakai **berkas JS yang sama** ([Transaksi.js](../modules/ajis/script/Transaksi.js)), sehingga sebagian fungsi JS memanggil endpoint yang hanya ada di salah satu halaman. Ini sumber beberapa bug diam (lihat §8).

---

## 3. Skema Data

### 3.1 `transaksi` — tabel inti (±222.500 baris)

PK: **(`transid`, `detailid`)**. Indeks: `(jenis_transaksi,tgl_donasi,tgl_transaksi)`, `(did,progid,bulan_salur,tahun_salur,id_review)`, `(oid_transaksi,oid_donatur)`.

| Kolom | Tipe | Catatan |
|---|---|---|
| `transid` | varchar(50) PK | ID transaksi dari sumber (ZAINS/CoreZ) |
| `detailid` | int(1) PK | Nomor baris detail dalam satu transaksi |
| `jenis_transaksi` | enum(cash,noncash,bank,pccash,pcnoncash) | |
| `did` | varchar(30) | ID donatur → `donatur.did` |
| `progid` / `id_program` | varchar(6) / int | Dua sistem kode program yang hidup berdampingan |
| `nama_program`, `harga_program` | text / double | Denormalisasi dari `setting_program` |
| `perkiraan_rp` | double(20,2) | **Nominal donasi — angka acuan validasi** |
| `tgl_donasi`, `tgl_transaksi` | date | Dua tanggal, bisa dipilih sebagai basis filter |
| `oid_transaksi` / `kantor_transaksi` | varchar(6) / text | Kantor tempat transaksi |
| `oid_donatur` / `kantor_donatur` | varchar(6) / text | Kantor donatur |
| `jml_mustahik`, `bulan_disantuni` | varchar(50) | Kuantitas PM & lama disantuni |
| `review` | enum(n,y) | Sudah lolos tahap review |
| `approve_salur` | enum(y,n) | Disetujui untuk disalurkan |
| `bulan_salur`, `tahun_salur` | varchar(50) | **Menentukan periode ganjil/genap** |
| `ket_approve_salur`, `user_approve_salur`, `date_approve_salur` | | Jejak approval |
| `cicilan` | enum(n,y) | Transaksi cicilan → tab terpisah |
| `status_pasang` | enum(n,y) | Sudah di-entry ke anak atau belum |
| `total_input_donasi` | int | Σ `ajis_input_donasi.nominal_donasi` untuk transid+detailid |
| `selisih_donasi` | int | `perkiraan_rp - total_input_donasi` |
| `jml_anak_ijis`, `kantor_ijis`, `id_kantor_ijis` | int / text / text | Cache hasil agregasi `ajis_pemasangan` (CSV!) |
| `id_review` | varchar(50) | `CONCAT(transid, detailid)` — dipakai untuk approve massal |
| `user_insert_cf`, `user_update_cf` | varchar(50) | Jejak entry cashflow |
| `*_postgree`, `*_erp_wh`, `id_kantor_zains` | varchar(50) | Kolom sinkronisasi lintas sistem |

### 3.2 `ajis_input_donasi` — hasil pemecahan ke anak

PK `id_input_donasi` (auto increment). Kunci logis: `(transid, detailid, id_anak)`.

| Kolom | Catatan |
|---|---|
| `transid`, `detailid` | Referensi ke `transaksi` (tanpa FK) |
| `id_anak`, `id_donatur` | |
| `id_pemasangan_baru` | `CONCAT(id_anak, id_donatur, tahun)` — dipakai sebagai kunci pasangan |
| `program_donasi`, `id_program` | |
| `pilihan_donasi` | Harga satuan program |
| `qty` | Jumlah bulan/kali |
| `nominal_donasi` | `pilihan_donasi × qty` |
| `bulan`, `tahun` | Diisi dari `bulan_salur`/`tahun_salur` transaksi |
| `periode` | `'ganjil'` (bulan 1–6) / `'genap'` (bulan 7–12) |
| `jenis` | `'trans'` (dari transaksi) / `'saldo'` |
| `via_input` | `'reguler'` / `'premium'` |
| `nama_anak`, `nik`, `nama_wilayah`, `nama_kantor`, `jenjang_pendidikan`, `jns_kel`, `asnaf`, `nama_donatur` | Denormalisasi, diisi lewat UPDATE-JOIN setelah insert |
| `kantor_id`, `id_wilayah_pembinaan` | |
| `status_tersalurkan` | Dipakai fitur Pengembalian Donasi |

### 3.3 `transaksi_temp` — staging import Excel

Struktur identik `transaksi`, ditambah pemakaian `user_insert` sebagai pemisah antar-user (setiap user punya staging sendiri; `DELETE ... WHERE user_insert = <username>` sebelum upload baru).

### 3.4 Tabel pendukung yang di-JOIN

| Tabel | Dipakai untuk |
|---|---|
| `donatur` | `nama_lengkap` donatur |
| `setting_program` | `nama_program`, `harga_program`, `harga_penyaluran`, `persentase_dp`, `persentase_dss`, `aktif` |
| `kantor` | kantor transaksi/donatur (`oid`, `id_kantor`, `kantor`) |
| `ajis_kantor` | kantor pembinaan IJIS (dropdown "Kantor") |
| `ajis_pemasangan` | pasangan donatur–anak aktif (`status_pasangan='y'`) |
| `ajis_anak` | identitas anak |
| `ajis_wilayah_pembinaan` | wilayah → kantor |
| `ajis_view_anak_juara` | view gabungan anak+pasangan (dipakai `TransaksiKantor_Read`) |
| `ajis_penyaluran` | histori penyaluran per donatur |
| `ajis_sdm_wilayah` | nama mentor/SDM |

---

## 4. Katalog Endpoint (`m=`) Lengkap

Legend kolom **Ada di**: **U** = Transaksi (user), **A** = TransaksiAdmin.

### 4.1 Baca / grid

| `m=` | Method | Ada di | Fungsi | Tabel utama |
|---|---|---|---|---|
| `r` | `Transaksi_ReadBaru()` | U | Grid utama; filter `review='y' AND cicilan='n'`, `perkiraan_rp>0`, `approve_salur<>''`, `oid_donatur<>''`. Hitung `total_input_donasi` & `selisih` **per baris (N+1 query)** | `transaksi` |
| `r` | `Transaksi_Read()` | A | ⚠️ **Method tidak ada di class** → fatal error | — |
| `r_unidentified` | `Transaksi_ReadUnidentified()` | U | Transaksi yang `id_kantor_ijis=''` (donatur belum punya anak terpasang) | `transaksi` |
| `r_kroscek` | `Transaksi_ReadKroscek()` | U, A | Kroscek; cabang dikecualikan progid `400001/400004/400005` | `transaksi` + join |
| `r_review` | `Transaksi_Read_Review()` | U, A | Antrean review (`review` belum `y`) | `transaksi` + join |
| `r_cicilan` | `Transaksi_Read_Cicilan()` | U | Tab Cicilan (`cicilan='y'`) | `transaksi` |
| `r_anak` | `Transaksi_ReadAnak()` | U, A | Histori donasi 1 anak + footer total | `ajis_input_donasi` + 5 join |
| `r_donatur` | `Transaksi_ReadDonatur()` | U, A | Histori transaksi 1 donatur | `transaksi` + 4 join |
| `r_donatur_cashflow` | `Transaksi_ReadDonaturCashflow()` | U, A | Histori input donasi 1 donatur | `ajis_input_donasi` + 5 join |
| `r_donatur_penyaluran` | `Transaksi_ReadDonaturPenyaluran()` | U, A | Histori penyaluran 1 donatur | `ajis_penyaluran` + 6 join |
| `r_kantor` | `TransaksiKantor_Read()` | U, A | Daftar anak pasangan donatur (untuk combogrid pilih anak) + saldo per anak (N+1) | `ajis_view_anak_juara` |
| `r_kantor_update` | `TransaksiKantor_ReadUpdate()` | U, A | Isi entry yang sudah tersimpan (mode Update CF) + footer total | `ajis_input_donasi` |
| `anak` | `Penyaluran_ReadAnak()` | U, A | Daftar anak + `pilihan_donasi`/`nominal_donasi` terhitung dari `qty_spesial` (N+1 `getHargaProgram`) | `ajis_pemasangan` |

### 4.2 Tulis / aksi

| `m=` | Method | Ada di | Efek |
|---|---|---|---|
| `c_kantor_ganjil` | `TransaksiKantor_Create()` | U | INSERT batch `ajis_input_donasi` periode **ganjil**, `via_input='reguler'`; lalu recalc `transaksi` |
| `c_kantor_genap` | `TransaksiKantor_CreateGenap()` | U | Sama, periode **genap** |
| `u_kantor_ganjil` | `TransaksiKantor_CreateUpdate()` | U | **DELETE seluruh** input donasi transid+detailid, lalu INSERT ulang (periode ganjil) |
| `u_kantor_genap` | `TransaksiKantor_CreateUpdateGenap()` | U | Idem, periode genap. ⚠️ memakai `$this->id_program` (bukan per-baris) |
| `c_kantor` | `TransaksiKantor_Create()` | A | Versi admin |
| `u_kantor_update` | `TransaksiKantor_CreateUpdate()` | A | Versi admin |
| `c_kantor_premium` | `SelectTransaksiPremiumGanjil()` (U) / `TransaksiKantor_CreatePremium()` (A) | U, A | Entry Premium: ambil daftar `id_pemasangan_baru` (CSV), loop insert dengan nominal seragam |
| `c_kantor_premium_genap` | `SelectTransaksiPremiumGenap()` | U | Idem periode genap |
| `UpdateApproveSalur` | `UpdateApproveSalur()` | U, A | Set `bulan_salur`, `tahun_salur`, `approve_salur`, `ket_approve_salur`, `cicilan`, jejak user/tanggal — lalu **DELETE semua `ajis_input_donasi`** transid+detailid |
| `UpdateApproveSalurReview` | `UpdateApproveSalurReview()` | U, A | Approve **massal** berdasarkan `id_review IN (...)`; set `review='y'` |
| `update_program` | `GantiProgram()` | U | Ganti `id_program` transaksi, lalu sinkron `nama_program` & `harga_program` dari `setting_program` |
| `c_transidget` | `TransaksiGet_Create()` | U, A | `REPLACE INTO transaksi` dari data yang ditarik user + 6 UPDATE-JOIN pelengkap (nama donatur, kantor, kantor IJIS, jml anak) |
| `c_didget` | `DonaturGet_Create()` | U, A | `REPLACE INTO donatur` (48 kolom) + sinkron nama & kantor IJIS ke `transaksi` |
| `transaksi_normalyze` | `Transaksi_Normalyze()` | U | Sinkron ulang `nama_donatur`, `kantor_transaksi`, `kantor_donatur`, `kantor_ijis`, `jml_anak_ijis` |
| `d` | `Transaksi_Delete()` | U, A | Hapus semua input donasi transid+detailid; reset `status_pasang='n'`, `total_input_donasi=0`, `selisih=perkiraan_rp` |
| `de` | `Delete_Transaksi_Perm()` | U, A | **DELETE baris `transaksi`** (permanen) |
| `delete_donasi` | `InputDonasi_Delete()` | U, A | Hapus 1 baris `ajis_input_donasi` |
| `update_bulan` | `PenyaluranBaru_Pengembalian()` | U, A | Ubah `status_tersalurkan`/bulan/tahun; bila y→n hapus baris `ajis_penyaluran` |
| `u`, `c`, `v`, `kecamatan` | `Transaksi_Update/Create/View`, `SettingKecamatan_Options` | U, A | ⚠️ **Semua method ini tidak ada di class → fatal error** |
| `d_kantor`, `u_kantor` | `TransaksiKantor_Delete/Update()` | U, A | Beroperasi pada `donatur_kantor_anak` (tabel warisan, tidak lagi dipakai UI) |

### 4.3 Dropdown / lookup

| `m=` | Method | Sumber |
|---|---|---|
| `kantor` | `Kantor_Options()` | `ajis_kantor` (oid, kantor) |
| `kantor_trans` | `KantorTrans_Options()` | `kantor`, mengecualikan nama mengandung superinfak/regional/call/channeling |
| `program` | `Program_Options()` | `setting_program WHERE aktif='y'` |

### 4.4 Rekap & Export

| `m=` | Method | Keluaran |
|---|---|---|
| `r_rekap_kantor` | `TransaksiRekapKantor()` | Rekap nominal per kantor donatur, dipecah **34 kolom program** + kolom DP & DSS (persentase hardcode di SQL) |
| `r_rekap_kantor_ceria` / `_juara` | `TransaksiRekapKantorCeria/Juara()` | Varian per rumpun program |
| `r_rekap_kantor_qty_*`, `r_rekap_kantor_nominal_*` | 8 method | Varian qty vs nominal × ceria vs juara × lama vs new |
| `r_rekap_program` | `TransaksiRekapProgram()` | Rekap per program: total nominal, jumlah (÷ harga program), DP, DSS. **Daftar `id_program` di-hardcode** (34 ID) |
| `xls`, `xls_cicilan` | `Transaksi_Xls()`, `Transaksi_XlsCicilan()` | Export XLSX (PHPExcel) ±30 kolom |
| `xls_rekap_kantor*`, `xls_rekap_program` | 8 method `*Xls()` | Export XLSX rekap |

### 4.5 Import Excel (khusus Admin)

| `m=` | Method | Efek |
|---|---|---|
| `upload_transaksi` | `UploadDonasiOtomatisTransaksi($tmpfile)` | Baca kolom **A–Q**; lookup `id_program`/`progid` dari nama program, `oid` dari nama kantor; **baris dilewati diam-diam** bila lookup gagal; INSERT ke `transaksi_temp` |
| `r3_transaksi` | `UploadDonasiOtomatisTempTransaksi_Read()` | Grid preview staging milik user aktif |
| `import_transaksi` | `ImportDonasiOtomatisTransaksi()` | Loop staging → `insertAndUpdateTransaksi()`: `INSERT IGNORE` ke `transaksi` + 6 UPDATE-JOIN + set `id_review` + hapus baris staging |
| `download_format_transaksi` | `Download_Format_XlsTransaksi()` | ⚠️ **Method tidak ada** (UI aslinya menunjuk file statis `/format_upload_transaksi.xls`) |

Kolom Excel: `A transid · B jenis_transaksi · C did · D detailid · E nama_program · F perkiraan_rp · G tgl_donasi · H tgl_transaksi · I kantor_transaksi · J kantor_donatur · K vbayarid · L mbayarid · M nik_rfo · N atas_nama · O keterangan · P jml_mustahik · Q bulan_disantuni` (data mulai baris 2).

### 4.6 Endpoint tarik data eksternal

| Berkas | Sumber | Catatan |
|---|---|---|
| [get_transaksi.php](../modules/ajis/get_transaksi.php) | DB `zains_rz.corez_transaksi` langsung (mysql_* ext) | Filter `id_via_bayar IN (1,2)`, `approved_transaksi='y'`, 22 `id_program` hardcode, `LIMIT 50` |
| [get_transaksi_dua.php](../modules/ajis/get_transaksi_dua.php) | DB `rz_wh.transaksi` | Varian pencarian by rentang tanggal + pagination |
| [get_transaksi_api.php](../modules/ajis/get_transaksi_api.php) | REST `https://api.rumahzakat.org/partner/transaksiZ` | Proxy CORS; **token hardcode**; mapping 28 field API → field grid |
| `CTransaksi::_hitApi()` | `PUT https://api-sh-zains-v2.sharinghappiness.org/api/corez/transaksi-ajis/{transid}?id_input_donasi=…` | Dipanggil **setiap baris insert** input donasi; **Authorization hardcode** di properti class |

---

## 5. Bedah Fitur per Layar

### 5.1 Tab "Transaksi" (grid utama)

**Filter yang tersedia** (semua dikirim sebagai query string, dirangkai jadi `WHERE` string):

| Kontrol | Param | Perilaku SQL |
|---|---|---|
| Basis tanggal | `filter_tgl` | 1=`tgl_transaksi`, 2=`tgl_donasi` → dipakai di `BETWEEN` |
| Tgl awal/akhir | `tgl_awal`, `tgl_akhir` | `BETWEEN` |
| Kata kunci | `keySearch` | LIKE ke nama donatur, kantor donatur, kantor transaksi, transid, did, perkiraan_rp, kantor_ijis |
| Kategori program | `kategori` | LIKE `nama_program` |
| Program | `progid` + `filter_program` | 1 = sama dengan, 2 = tidak sama dengan |
| Nominal | `nominal` + `filter_nominal` | 1 `=`, 2 `!=`, 3 `<`, 4 `>` |
| Jml PM | `jml_pm` + `filter_qty` | 1 `=`, 2 `!=` |
| Bulan disantuni | `jml_bulan_disantuni` + `filter_disantuni` | 1 `=`, 2 `!=` |
| Kantor transaksi/donatur | `kantor_transaksi`, `kantor_donatur` | `oid_transaksi` / `oid_donatur` |
| Bulan/Tahun salur | `bulan_search`, `tahun_search` | `bulan_salur`, `tahun_salur` |
| Status pasang | `status_pasang` | y/n |
| Approve salur | `approve_salur_search` | y/n |
| Hanya yang selisih | `keyselisih_donasi` | `selisih_donasi != 0` |
| Jml anak IJIS | `jml_anak_ijis` + `opsi_jml_anak_ijis` | operator dinamis (`=`, `>`, `<`, …) langsung disisipkan ke SQL |

**Footer grid** menampilkan `SUM(perkiraan_rp)` dengan syarat tambahan `approve_salur='y' AND review='y' AND cicilan='n'` — sengaja berbeda dari filter baris, jadi total footer ≠ total baris tampil. Ini perilaku eksisting yang perlu dikonfirmasi saat migrasi.

**Tombol toolbar:** Entry CF · Update CF · Search · Unidentify · XLS · More Search · Not/Approve Salur · Get Transid · Get Donatur · Entry Premium · Delete Donasi · Normalyze · Ganti Program. Versi Admin menambah: Import · Format (XLS) · Get Transid by tgl · Delete Transaksi.

### 5.2 Dialog "Entry CF" / "Update CF" — inti modul

Alur (fungsi `editTransaksi()` / `updateTransaksi()` / `saveTransaksi()` di [Transaksi.js](../modules/ajis/script/Transaksi.js)):

1. **Guard Entry CF**: hanya boleh bila `status_pasang !== 'y'` **dan** `approve_salur !== 'n'`. Bila sudah, muncul pesan "Sudah dientry, silakan klik Update Cashflow".
2. Dialog memuat header transaksi (readonly) + 3 tab histori donatur (Transaksi / Cashflow / Penyaluran) + grid entry anak.
3. Grid entry diisi dari `m=anak` (daftar anak pasangan, nominal dihitung `harga_program × qty`) untuk mode **Entry**, atau dari `m=r_kantor_update` (data tersimpan) untuk mode **Update**.
4. User bisa tambah baris (`TransaksiAdd`), hapus (`removetransaksi`), edit (`editbaristransaksi`), atau isi massal via `qty`.
5. `totaldonasi()` menjumlah kolom `nominal_donasi` grid ke `#total_jumlah_donasi`.
6. **`saveTransaksi()`**:
   - Pilih endpoint dari `bulan_salur`: bulan 1–6 → `<c|u>_kantor_ganjil`, bulan 7–12 → `<c|u>_kantor_genap`. Prefix `c`/`u` dari hidden field `jenis_input`.
   - **Validasi keras**: `total_jumlah_donasi` harus **persis sama** dengan `perkiraan_rp`. Kalau tidak → dialog "Nominal Tidak sesuai, silakan koreksi ulang", tidak ada request terkirim.
   - Data grid dikirim sebagai **`&data=` + `JSON.stringify(rows)` di query string** (rawan melebihi batas URL untuk donatur dengan ratusan anak).

**Sisi server** (`TransaksiKantor_Create*` / `CreateUpdate*`), untuk setiap baris:

```sql
-- (Update saja) bersihkan dulu
DELETE FROM ajis_input_donasi WHERE transid=? AND detailid=?;

-- per anak
INSERT INTO ajis_input_donasi (tgl_transaksi, id_anak, id_donatur, program_donasi,
  pilihan_donasi, qty, nominal_donasi, user_insert, date_insert, transid, detailid,
  kantor_id, id_wilayah_pembinaan, bulan, tahun, periode, id_program,
  id_pemasangan_baru, via_input, jenis)
VALUES (…, 'ganjil'|'genap', …, CONCAT(id_anak,id_donatur,tahun), 'reguler', 'trans');

-- lengkapi denormalisasi dari master
UPDATE ajis_input_donasi a LEFT JOIN ajis_anak b ON a.id_anak=b.id_anak
   SET a.nama_anak=b.nama_lengkap, a.nik=b.nik, a.nama_wilayah=b.nama_wilayah,
       a.nama_kantor=b.nama_kantor, a.jenjang_pendidikan=b.jenjang_pendidikan,
       a.jns_kel=b.jns_kel, a.asnaf=b.asnaf
 WHERE a.id_anak=? AND a.transid=? AND a.detailid=?;

UPDATE ajis_input_donasi a LEFT JOIN donatur b ON a.id_donatur=b.did
   SET a.nama_donatur=b.nama_lengkap WHERE …;
```

Setelah loop:

```sql
UPDATE transaksi a
  INNER JOIN (SELECT transid, detailid, SUM(nominal_donasi) sumPrice
              FROM ajis_input_donasi WHERE transid=? AND detailid=?
              GROUP BY transid, detailid) b
     ON a.transid=b.transid AND a.detailid=b.detailid
   SET a.status_pasang='y', a.user_update_cf=?,
       a.total_input_donasi=b.sumPrice,
       a.selisih_donasi=(a.perkiraan_rp - b.sumPrice)
 WHERE a.transid=? AND a.detailid=?;

DELETE FROM ajis_input_donasi WHERE id_anak='';   -- pembersihan global (!)
```

> ⚠️ Pada `TransaksiKantor_CreateUpdate()` klausa JOIN tertulis `ON b.transid = b.transid` (self-compare, selalu TRUE) — bug lama yang tertutup oleh `WHERE` eksplisit. Jangan direplikasi.

### 5.3 Dialog "Entry Premium"

Untuk donatur korporat yang menyantuni banyak anak dengan nominal seragam.

- User pilih donatur (combogrid `InputDonasiBaru&m=donatur`), transaksi, program, `qty_spesial`, dan `harga_program_spesial`.
- `hitungqtyspesial()` memuat ulang grid anak dengan qty tersebut.
- Simpan → `c_kantor_premium` / `c_kantor_premium_genap`, yang mengirim **daftar `id_pemasangan_baru` sebagai string CSV**.
- Server: `SELECT … FROM ajis_pemasangan WHERE id_pemasangan_baru IN (<CSV dikutip di PHP>)`, lalu tiap baris di-INSERT dengan `via_input='premium'` dan nilai konstanta dari properti `*_spesial`.

### 5.4 Dialog "Not / Approve Salur"

Menentukan **periode penyaluran** sebuah transaksi. Input: bulan, tahun, `approve_salur` (y/n), keterangan, flag `cicilan`.

**Efek samping penting:** setiap kali disimpan, seluruh `ajis_input_donasi` untuk transid+detailid **dihapus**. Rasionalnya: ganti bulan salur = entry lama tidak valid lagi. Di Next.js ini harus jadi transaksi DB eksplisit + konfirmasi UI yang jelas (saat ini tidak ada peringatan).

### 5.5 Tab "Transaksi Review" — approve massal

Grid dengan kolom checkbox. `UpdateApproveSalurReview()` menerima `id_review` sebagai daftar CSV dan menjalankan satu `UPDATE … WHERE id_review IN (…)`, mengeset `review='y'` sekaligus bulan/tahun/approve/cicilan.

### 5.6 Tab "Transaksi Cicilan"

Sama seperti grid utama, `cicilan='y'`. Punya export dan Ganti Program sendiri.

### 5.7 "Get Transid" / "Get Donatur"

Dialog pencarian yang menembak sumber eksternal (`get_transaksi*.php`), user mencentang baris, lalu Save → `c_transidget` / `c_didget` melakukan `REPLACE INTO` ke `transaksi` / `donatur` lokal. Ini mekanisme sinkronisasi manual dari CoreZ/ZAINS ke AJIS.

### 5.8 Rekap Kantor & Rekap Program

Query agregasi besar dengan puluhan `SUM(CASE WHEN progid/id_program = … THEN perkiraan_rp ELSE 0 END)` dan **persentase DP/DSS di-hardcode di SQL** (mis. `* 0.2548`, `* 0.7452`). Untuk Rekap Program persentase diambil dari kolom `setting_program.persentase_dp` / `persentase_dss`. Dua sumber kebenaran yang berbeda — perlu disatukan saat migrasi.

---

## 6. Aturan Bisnis yang Wajib Dipertahankan

1. **Kunci komposit** `(transid, detailid)` adalah identitas transaksi, bukan `transid` saja.
2. **Validasi nominal**: `Σ ajis_input_donasi.nominal_donasi == transaksi.perkiraan_rp` sebelum simpan. Selisih disimpan di `selisih_donasi` untuk audit.
3. **Periode ganjil/genap** ditentukan `bulan_salur`: 1–6 = ganjil, 7–12 = genap. Menentukan kolom `periode` dan endpoint yang dipakai.
4. **Guard Entry vs Update**: transaksi dengan `status_pasang='y'` tidak boleh di-Entry ulang, harus lewat Update.
5. **Approve salur menghapus entry** yang sudah ada untuk transaksi tersebut.
6. **Update = delete-then-reinsert**, bukan diff. Konsekuensinya `id_input_donasi` berubah dan `date_insert` hilang.
7. **RBAC**: `id_group_user=2` (cabang) hanya melihat transaksi yang `review='y' AND approve_salur='y'` dan yang `id_kantor_ijis`-nya memuat `id_kantor` miliknya.
8. **`id_pemasangan_baru` = `CONCAT(id_anak, id_donatur, tahun)`** — dipakai lintas modul (pemasangan, penyaluran, laporan semester).
9. **Denormalisasi wajib**: nama anak/donatur/kantor disalin ke `ajis_input_donasi` saat insert; laporan semester membaca dari sana, bukan dari master.
10. **Push ke ZAINS** (`_hitApi`) dipanggil per baris insert; kegagalan hanya di-log, tidak membatalkan transaksi.

---

## 7. Integrasi Eksternal

| Integrasi | Arah | Detail |
|---|---|---|
| ZAINS v2 (`api-sh-zains-v2.sharinghappiness.org`) | AJIS → ZAINS | `PUT /api/corez/transaksi-ajis/{transid}?id_input_donasi={id}`, header `Authorization: <hardcode>`, timeout 30s |
| API RZ Partner (`api.rumahzakat.org/partner/transaksiZ`) | RZ → AJIS | GET dengan `page`, `startDate`, `endDate`, `id_transaksi`; header `token: <hardcode>` |
| DB `zains_rz` / `rz_wh` | Query lintas-database langsung | `get_transaksi.php`, `get_transaksi_dua.php` |

Ketiganya menyimpan kredensial di dalam kode. **Wajib dipindah ke environment variable** pada versi Next.js.

---

## 8. Temuan & Risiko

### 8.1 Rute mati (memanggil method yang tidak ada → fatal error)

| Rute | Halaman |
|---|---|
| `m=r` → `Transaksi_Read()` | **TransaksiAdmin (grid utama!)** |
| `m=c` → `Transaksi_Create()` | keduanya |
| `m=u` → `Transaksi_Update()` | keduanya |
| `m=v` → `Transaksi_View()` | keduanya |
| `m=kecamatan` → `SettingKecamatan_Options()` | keduanya |
| `m=download_format_transaksi` → `Download_Format_XlsTransaksi()` | TransaksiAdmin |

### 8.2 Ketidakcocokan JS ↔ router

- `updateTransaksi()` menetapkan `url = '…m=u_kantor_update'`, tetapi `saveTransaksi()` mengabaikan variabel itu dan menghitung ulang endpoint dari `bulan_salur`. Variabel `url` jadi dead code di banyak tempat.
- `Transaksi.js` dipakai bersama, sehingga fungsi seperti `TransaksiGetDua()` dan `showImportFormTransaksi()` juga ada di halaman user meski endpointnya tidak terdaftar di `Transaksi.php`.

### 8.3 Keamanan

- **SQL injection di hampir seluruh method** — parameter dari query string disisipkan langsung ke string SQL tanpa escaping. Termasuk operator (`opsi_jml_anak_ijis`) yang bahkan bukan nilai, tapi potongan SQL.
- `extract($_GET); extract($_POST);` — variable overwriting.
- Kredensial API & DB hardcode di source.
- `Transaksi.php` (halaman user) **tidak memeriksa sesi sama sekali**; hanya `TransaksiAdmin.php` yang memeriksa.
- `mysql_real_escape_string()` / `mysql_error()` (ekstensi `mysql_` yang sudah dihapus sejak PHP 7) masih dipanggil.

### 8.4 Integritas & performa

- **Tidak ada transaksi database.** Rangkaian DELETE → N× INSERT → UPDATE bisa berhenti di tengah dan meninggalkan data setengah jadi.
- `DELETE FROM ajis_input_donasi WHERE id_anak=''` dijalankan **tanpa filter transid** pada setiap simpan — menyentuh seluruh tabel.
- **N+1 query**: `Transaksi_ReadBaru` memanggil `getJumlahTotalInputDonasi()` **dua kali per baris**; `TransaksiKantor_Read` memanggil `getJumlahSaldo()` per baris; `Penyaluran_ReadAnak` memanggil `getHargaProgram()` 2× per baris.
- `id_kantor_ijis` disimpan sebagai CSV dan difilter dengan `find_in_set` → tidak bisa memakai indeks.
- `ini_set('memory_limit','-1')` dan `max_execution_time` s/d 90.000 detik pada method rekap.
- Payload entry dikirim lewat **query string**, bukan body.
- Daftar `id_program` dan persentase DP/DSS di-hardcode di dalam SQL rekap.
- `REPLACE INTO transaksi` menghapus-lalu-menyisipkan → kolom yang tidak ikut dikirim (mis. `status_pasang`, `review`, jejak approval) **hilang senyap**.

---

## 9. Rancangan Konversi Next.js

### 9.1 Struktur direktori

```
app/
  (dashboard)/transaksi/
    page.tsx                     # Tab: Transaksi | Review | Cicilan | Unidentified
    [transid]/[detailid]/
      entry/page.tsx             # Entry / Update Cashflow (full page, bukan dialog)
    rekap/kantor/page.tsx
    rekap/program/page.tsx
    import/page.tsx              # admin only
  api/transaksi/
    route.ts                     # GET list (semua tab lewat ?scope=)
    [transid]/[detailid]/
      route.ts                   # GET detail, DELETE permanen
      entries/route.ts           # GET/PUT input donasi (menggantikan c_/u_kantor_*)
      approve-salur/route.ts     # POST
      program/route.ts           # PATCH (Ganti Program)
    review/approve/route.ts      # POST massal (id_review[])
    premium/route.ts             # POST entry premium
    import/
      upload/route.ts            # POST file → staging
      staging/route.ts           # GET/DELETE staging
      commit/route.ts            # POST staging → transaksi
    export/route.ts              # GET xlsx (streaming)
    sync/
      transid/route.ts           # cari + REPLACE (Get Transid)
      donatur/route.ts           # cari + REPLACE (Get Donatur)
      normalize/route.ts
  api/donatur/[did]/
    transaksi|cashflow|penyaluran/route.ts
  api/anak/[idAnak]/donasi/route.ts
  api/lookup/{kantor,kantor-transaksi,program}/route.ts
lib/
  db.ts                          # Drizzle/Prisma
  auth.ts                        # sesi + helper scope kantor
  transaksi/
    queries.ts                   # SELECT (list, detail, rekap)
    mutations.ts                 # write + transaction wrapper
    rules.ts                     # periode(), validateTotal(), canEntry()
    schema.ts                    # Zod untuk seluruh parameter
    excel.ts                     # import & export
    zains.ts                     # klien _hitApi
components/transaksi/
  TransaksiTable.tsx             # TanStack Table (pengganti EasyUI datagrid)
  FilterBar.tsx / AdvancedFilter.tsx
  EntryCashflowForm.tsx
  ApproveSalurDialog.tsx
  PremiumEntryForm.tsx
  ImportWizard.tsx
```

### 9.2 Pemetaan endpoint legacy → Next.js

| Legacy `m=` | Next.js |
|---|---|
| `r`, `r_review`, `r_cicilan`, `r_unidentified`, `r_kroscek` | `GET /api/transaksi?scope=main\|review\|cicilan\|unidentified\|kroscek&…filter` |
| `r_kantor`, `anak` | `GET /api/transaksi/{transid}/{detailid}/candidates?qty=` |
| `r_kantor_update` | `GET /api/transaksi/{transid}/{detailid}/entries` |
| `c_kantor_ganjil/genap`, `u_kantor_*`, `c_kantor` | `PUT /api/transaksi/{transid}/{detailid}/entries` (periode dihitung server dari `bulan_salur`) |
| `c_kantor_premium*` | `POST /api/transaksi/premium` |
| `UpdateApproveSalur` | `POST /api/transaksi/{transid}/{detailid}/approve-salur` |
| `UpdateApproveSalurReview` | `POST /api/transaksi/review/approve` |
| `update_program` | `PATCH /api/transaksi/{transid}/{detailid}/program` |
| `d` / `de` / `delete_donasi` | `DELETE …/entries` / `DELETE …` / `DELETE /api/input-donasi/{id}` |
| `c_transidget`, `c_didget`, `transaksi_normalyze` | `POST /api/transaksi/sync/{transid,donatur,normalize}` |
| `r_donatur*`, `r_anak` | `GET /api/donatur/{did}/…`, `GET /api/anak/{id}/donasi` |
| `kantor`, `kantor_trans`, `program` | `GET /api/lookup/…` |
| `xls*` | `GET /api/transaksi/export?type=…` |
| `upload_transaksi`, `r3_transaksi`, `import_transaksi` | `POST /api/transaksi/import/upload`, `GET …/staging`, `POST …/commit` |
| rekap `r_rekap_*` | `GET /api/transaksi/rekap/{kantor,program}?variant=…` |

**Konsolidasi:** 10 varian rekap kantor → 1 endpoint dengan parameter `variant` (`nominal`/`qty` × `ceria`/`juara`/`all`); 4 varian create/update entry → 1 `PUT` idempoten.

### 9.3 Kontrak API (contoh)

```ts
// lib/transaksi/schema.ts
export const listQuery = z.object({
  scope: z.enum(['main','review','cicilan','unidentified','kroscek']).default('main'),
  page: z.coerce.number().int().min(1).default(1),
  rows: z.coerce.number().int().min(1).max(200).default(20),
  dateBasis: z.enum(['tgl_transaksi','tgl_donasi']).default('tgl_transaksi'),
  tglAwal: z.string().date().optional(),
  tglAkhir: z.string().date().optional(),
  q: z.string().max(100).optional(),
  progid: z.string().optional(),
  programOp: z.enum(['eq','ne']).optional(),
  nominal: z.coerce.number().optional(),
  nominalOp: z.enum(['eq','ne','lt','gt']).optional(),
  jmlPm: z.coerce.number().optional(),   jmlPmOp: z.enum(['eq','ne']).optional(),
  bulanDisantuni: z.coerce.number().optional(), bulanDisantuniOp: z.enum(['eq','ne']).optional(),
  oidTransaksi: z.string().optional(),   oidDonatur: z.string().optional(),
  bulanSalur: z.coerce.number().min(1).max(12).optional(),
  tahunSalur: z.coerce.number().optional(),
  statusPasang: z.enum(['y','n']).optional(),
  approveSalur: z.enum(['y','n']).optional(),
  onlySelisih: z.coerce.boolean().default(false),
  jmlAnakIjis: z.coerce.number().optional(),
  jmlAnakIjisOp: z.enum(['eq','ne','lt','gt','lte','gte']).optional(),  // enum, bukan string SQL
})

export const entriesPayload = z.object({
  bulanSalur: z.number().min(1).max(12),
  tahunSalur: z.number(),
  rows: z.array(z.object({
    idAnak: z.string(),
    idPemasanganBaru: z.string(),
    idProgram: z.string(),
    programDonasi: z.string(),
    kantorId: z.string(),
    idWilayahPembinaan: z.string(),
    pilihanDonasi: z.number().nonnegative(),
    qty: z.number().int().positive(),
    nominalDonasi: z.number().nonnegative(),
  })).min(1),
})
```

```ts
// lib/transaksi/rules.ts
export const periode = (bulan: number) => (bulan <= 6 ? 'ganjil' : 'genap')
export const idPemasanganBaru = (idAnak: string, idDonatur: string, tahun: number|string) =>
  `${idAnak}${idDonatur}${tahun}`
export function assertTotalMatches(rows: {nominalDonasi: number}[], perkiraanRp: number) {
  const total = rows.reduce((s, r) => s + r.nominalDonasi, 0)
  if (Math.round(total) !== Math.round(perkiraanRp))
    throw new BadRequest(`Nominal tidak sesuai: entry ${total} vs transaksi ${perkiraanRp}`)
}
export const canEntry = (t: Transaksi) => t.statusPasang !== 'y' && t.approveSalur !== 'n'
```

**Penulisan entry harus atomik:**

```ts
await db.transaction(async (tx) => {
  await tx.delete(inputDonasi).where(and(eq(inputDonasi.transid, transid),
                                         eq(inputDonasi.detailid, detailid)))
  await tx.insert(inputDonasi).values(rows.map(enrich))   // 1 batch insert, bukan N
  const [{ sum }] = await tx.select({ sum: sql`COALESCE(SUM(nominal_donasi),0)` })
                            .from(inputDonasi).where(…)
  await tx.update(transaksi).set({
    statusPasang: 'y', userUpdateCf: session.username,
    totalInputDonasi: sum, selisihDonasi: sql`perkiraan_rp - ${sum}`,
  }).where(…)
})
await pushToZains(transid).catch(logOnly)   // di luar transaksi, best-effort
```

Denormalisasi (`nama_anak`, `nik`, dll.) diambil sekali lewat satu `SELECT … WHERE id_anak IN (…)` lalu ikut di-insert — menggantikan pola UPDATE-JOIN per baris.

### 9.4 Penggantian teknologi

| Legacy | Next.js |
|---|---|
| EasyUI datagrid + frozenColumns | TanStack Table + kolom pinned, virtualisasi baris |
| EasyUI dialog | shadcn/ui `Dialog` / `Sheet`; form entry jadi halaman tersendiri |
| `combogrid` pilih anak | `Command` + async search (debounced) |
| `numberbox` + `accounting.formatMoney` | `Intl.NumberFormat('id-ID')` |
| `datebox` + `myformatter/myparser` | date picker, ISO di API |
| PHPExcel | `exceljs` (streaming, agar tidak `memory_limit=-1`) |
| `Spreadsheet_Excel_Reader` (.xls) | `xlsx` / `exceljs`, dukung `.xlsx` |
| `$.messager.progress` | optimistic UI + toast |
| Session PHP | NextAuth/Auth.js; scope kantor dari klaim sesi |
| `?m=` switch | Route Handlers + Zod |

### 9.5 Yang harus diperbaiki (bukan dipindahkan apa adanya)

1. Semua query pakai **parameter binding**; operator filter dari **enum**, bukan string bebas.
2. **Semua write dibungkus transaksi DB.**
3. Ganti `DELETE … WHERE id_anak=''` global dengan constraint `NOT NULL`/`CHECK` + validasi input.
4. Ganti `REPLACE INTO` dengan `INSERT … ON DUPLICATE KEY UPDATE <kolom yang memang disinkronkan>` agar kolom operasional tidak hilang.
5. Hilangkan N+1: `total_input_donasi` dan `selisih` dibaca dari kolom tersimpan (sudah di-maintain saat write) atau via satu JOIN agregat.
6. Pindahkan daftar `id_program` dan persentase DP/DSS rekap ke `setting_program` / tabel konfigurasi.
7. Normalisasi `id_kantor_ijis` CSV → tabel relasi `transaksi_kantor_ijis`, agar filter cabang bisa terindeks.
8. Kredensial API → env var; klien ZAINS dengan retry + dead-letter, bukan sekadar `error_log`.
9. Peringatan eksplisit di UI sebelum Approve Salur menghapus entry.
10. Import Excel: **laporkan baris yang gagal lookup**, jangan dilewati diam-diam.
11. Payload entry lewat **request body**, bukan query string.

### 9.6 Urutan migrasi yang disarankan

| Tahap | Isi | Kriteria selesai |
|---|---|---|
| 1 | Skema + query read-only: list 5 scope, detail, lookup | Hasil grid identik dengan legacy untuk 20 kombinasi filter |
| 2 | Histori donatur & anak, export XLSX | Jumlah baris & total kolom sama dengan export legacy |
| 3 | **Entry/Update Cashflow** (jalur paling kritis) | `total_input_donasi` & `selisih_donasi` identik; uji ganjil & genap; uji donatur >100 anak |
| 4 | Approve Salur (satuan & massal), Ganti Program, Delete | Jejak audit lengkap; efek hapus entry terkonfirmasi UI |
| 5 | Entry Premium | Hasil sama dengan legacy untuk 1 donatur korporat |
| 6 | Import Excel + staging + commit | Laporan baris gagal muncul; idempoten saat commit ulang |
| 7 | Rekap Kantor & Program | Selisih nominal 0 dibanding legacy pada rentang 1 tahun |
| 8 | Sync eksternal (Get Transid/Donatur, Normalyze, push ZAINS) | Tidak ada kolom operasional yang hilang setelah sync |

**Uji regresi wajib:** ambil 50 transaksi historis (campuran ganjil/genap, reguler/premium, cicilan, cabang/pusat), jalankan alur entry di kedua sistem, bandingkan `ajis_input_donasi` baris per baris dan `transaksi.total_input_donasi`/`selisih_donasi`.

---

## 10. Lampiran: Query Kunci

```sql
-- A. Grid utama (Transaksi_ReadBaru) — inti
SELECT a.* FROM sipc_ijf.transaksi a
WHERE 1
  AND a.review='y' AND a.cicilan='n'          -- pusat
  /* cabang: AND a.review='y' AND a.approve_salur='y' AND a.cicilan='n'
             AND FIND_IN_SET(:idKantor, a.id_kantor_ijis) */
  AND a.perkiraan_rp > 0 AND a.approve_salur <> '' AND a.oid_donatur <> ''
  /* + filter dinamis */
GROUP BY a.transid, a.detailid
ORDER BY a.nama_donatur ASC, a.tgl_transaksi ASC
LIMIT :offset, :rows;

-- B. Total input donasi per transaksi (saat ini dipanggil per baris → jadikan JOIN)
SELECT transid, detailid, COALESCE(SUM(nominal_donasi),0) AS total
FROM sipc_ijf.ajis_input_donasi GROUP BY transid, detailid;

-- C. Kandidat anak untuk entry (Penyaluran_ReadAnak)
SELECT a.id_pemasangan_baru, a.id_anak, a.program_donasi, a.id_program,
       a.nama_kantor, a.nik, a.nama_anak, a.jenjang_pendidikan,
       a.id_wilayah_pembinaan, a.kantor_id
FROM sipc_ijf.ajis_pemasangan a
WHERE a.id_donatur=:did AND a.program_donasi=:namaProgram
  AND a.tahun=:tahun AND a.status_pasangan='y'
GROUP BY a.id_pemasangan_baru ORDER BY a.nama_anak ASC;

-- D. Cache kantor IJIS & jumlah anak (dipakai di banyak method)
UPDATE sipc_ijf.transaksi t
LEFT JOIN (SELECT id_donatur,
                  GROUP_CONCAT(DISTINCT nama_kantor SEPARATOR ',') nama_kantor,
                  GROUP_CONCAT(DISTINCT kantor_id  SEPARATOR ',') id_kantor_ijis,
                  COUNT(id_anak) jml_anak
           FROM ajis_pemasangan WHERE status_pasangan='y' AND id_donatur=:did) m
  ON t.did = m.id_donatur
SET t.kantor_ijis=m.nama_kantor, t.id_kantor_ijis=m.id_kantor_ijis,
    t.jml_anak_ijis=m.jml_anak
WHERE t.did=:did AND t.transid=:transid AND t.detailid=:detailid;

-- E. Rekap program (persentase dari setting_program)
SELECT p.id_program, p.progid, p.nama_program, p.harga_program,
       COALESCE(SUM(t.perkiraan_rp),0)                         AS total_nominal,
       ROUND(COALESCE(SUM(t.perkiraan_rp),0)/p.harga_program,2) AS jumlah,
       COALESCE(SUM(t.perkiraan_rp),0)*p.persentase_dp          AS dp,
       COALESCE(SUM(t.perkiraan_rp),0)*p.persentase_dss         AS dss
FROM sipc_ijf.setting_program p
LEFT JOIN sipc_ijf.transaksi t
       ON t.id_program=p.id_program AND t.perkiraan_rp>0
      AND t.approve_salur='y' AND t.oid_donatur<>''
      /* + filter kantor/tanggal/bulan/tahun */
WHERE p.aktif='y'
GROUP BY p.id_program ORDER BY p.id_program;
```
