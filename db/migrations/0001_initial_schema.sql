CREATE TABLE "ref_desa" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ref_desa_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"desaid" varchar(10) NOT NULL,
	"nama_desa" varchar(50) NOT NULL,
	"kelurahan" boolean DEFAULT false NOT NULL,
	"camatid" varchar(10) NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"propid" varchar(4),
	"kabid" varchar(4),
	"nomor_induk_desa" varchar(50),
	CONSTRAINT "ref_desa_desaid_unique" UNIQUE("desaid")
);
--> statement-breakpoint
CREATE TABLE "ref_fungsi_struktur" (
	"id_fungsi_struktur" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ref_fungsi_struktur_id_fungsi_struktur_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"kode_fungsi" varchar(5) NOT NULL,
	"nama_fungsi_struktur" varchar(30) NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"user_insert" varchar(30),
	"date_insert" timestamp with time zone,
	"user_update" varchar(30),
	"date_update" timestamp with time zone,
	CONSTRAINT "ref_fungsi_struktur_nama_fungsi_struktur_unique" UNIQUE("nama_fungsi_struktur")
);
--> statement-breakpoint
CREATE TABLE "ref_kabupaten" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ref_kabupaten_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"kabid" varchar(4) NOT NULL,
	"propid" varchar(4) NOT NULL,
	"kabupaten" varchar(50) NOT NULL,
	"kota" boolean DEFAULT false NOT NULL,
	"ibukota" varchar(50),
	"oid" varchar(10),
	"aktif" boolean DEFAULT true NOT NULL,
	"lat" numeric(10, 6),
	"lng" numeric(10, 6),
	"updated" timestamp with time zone,
	CONSTRAINT "ref_kabupaten_kabid_unique" UNIQUE("kabid")
);
--> statement-breakpoint
CREATE TABLE "ref_kecamatan" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ref_kecamatan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"camatid" varchar(10) NOT NULL,
	"nama_kecamatan" varchar(50) NOT NULL,
	"kodepos" varchar(10),
	"kabid" varchar(4) NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"updated" date,
	CONSTRAINT "ref_kecamatan_camatid_unique" UNIQUE("camatid")
);
--> statement-breakpoint
CREATE TABLE "ref_pekerjaan" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ref_pekerjaan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"kerjaid" varchar(3) NOT NULL,
	"pekerjaan" varchar(100) NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "ref_pekerjaan_kerjaid_unique" UNIQUE("kerjaid")
);
--> statement-breakpoint
CREATE TABLE "ref_propinsi" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ref_propinsi_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"propid" varchar(4) NOT NULL,
	"propinsi" varchar(50) NOT NULL,
	"ibukota" varchar(50),
	"aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "ref_propinsi_propid_unique" UNIQUE("propid")
);
--> statement-breakpoint
CREATE TABLE "ajis_kantor" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_kantor_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"oid" varchar(10) NOT NULL,
	"kantor" varchar(30),
	"alamat" varchar(50),
	"no_telp" varchar(15),
	"oid_parent" varchar(10),
	"oid_parent_second" varchar(10),
	"jenis" varchar(50),
	"external_ids" jsonb,
	CONSTRAINT "ajis_kantor_oid_unique" UNIQUE("oid")
);
--> statement-breakpoint
CREATE TABLE "kantor" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "kantor_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"oid" varchar(10) NOT NULL,
	"kantor" varchar(50),
	"alamat" varchar(100),
	"oid_parent" varchar(10),
	"level" integer,
	"aktif" boolean DEFAULT true NOT NULL,
	"id_office" varchar(50),
	"omid" varchar(20),
	"external_ids" jsonb,
	CONSTRAINT "kantor_oid_unique" UNIQUE("oid")
);
--> statement-breakpoint
CREATE TABLE "map_kantor" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "map_kantor_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id_kantor_zains" varchar(10) NOT NULL,
	"kantor_id" varchar(10) NOT NULL,
	"nama_kantor" varchar(100),
	"id_kantor_parent" varchar(10),
	"id_kantor_level" integer,
	"coa" varchar(15),
	"coa_outlet" varchar(15),
	"aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "map_kantor_id_kantor_zains_unique" UNIQUE("id_kantor_zains")
);
--> statement-breakpoint
CREATE TABLE "ajis_harga" (
	"id_harga" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_harga_id_harga_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"program_donasi" text,
	"program" text,
	"harga_program" numeric(20, 2),
	"harga_penyaluran" numeric(20, 2),
	"beasiswa" numeric(20, 2),
	"transport" numeric(20, 2),
	"frekuensi" integer,
	"ceria" boolean,
	"progid" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "ajis_item_hafalan" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_item_hafalan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"jenis" integer NOT NULL,
	"konten" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ajis_item_penilaian" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_item_penilaian_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"item_penilaian" text,
	"parent_id" varchar(100),
	"is_parent" boolean DEFAULT false NOT NULL,
	"jenis" varchar(100),
	"target" text
);
--> statement-breakpoint
CREATE TABLE "ajis_semester" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_semester_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"semesterid" varchar(10) NOT NULL,
	"semester" varchar(100),
	"tgl_awal" date,
	"tgl_akhir" date,
	"onprogress" boolean DEFAULT false NOT NULL,
	"tgl_awal_donasi" date,
	"tgl_akhir_donasi" date,
	"tgl_awal_saldo" date,
	"tgl_akhir_saldo" date,
	"jenis" varchar(50),
	"tahun" varchar(4),
	"lapsem" varchar(1),
	"cover" text,
	"cover_siswa" text,
	"kata_pengantar" text,
	"kata_pengantar_siswa" text,
	"profil" text,
	"kotak_profil_ceria" text,
	"kotak_pembinaan_ceria" text,
	"kotak_profil_siswa" text,
	"kotak_pembinaan_siswa" text,
	"keuangan" text,
	"surat" text,
	"bawah" text,
	"bawah_siswa" text,
	CONSTRAINT "ajis_semester_semesterid_unique" UNIQUE("semesterid")
);
--> statement-breakpoint
CREATE TABLE "app_setting" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "app_setting_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"key" varchar(100) NOT NULL,
	"value" text,
	"keterangan" varchar(200),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "app_setting_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "setting_program" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "setting_program_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id_program" integer NOT NULL,
	"progid" varchar(6) NOT NULL,
	"parent_progid" varchar(20),
	"nama_program" varchar(50) NOT NULL,
	"nama_inggris_program" varchar(50),
	"nama_alias" varchar(30),
	"jenis_program" varchar(2) DEFAULT 'dn',
	"coa_program" varchar(20),
	"kredit_account" varchar(20),
	"sifat_program" varchar(2) DEFAULT 'tt',
	"keterangan" varchar(50),
	"tgl_digulirkan" date,
	"aktif" boolean DEFAULT true NOT NULL,
	"tgl_inaktif" timestamp with time zone,
	"kprogid" char(2),
	"tgl_insert" timestamp with time zone,
	"tgl_change_status" timestamp with time zone,
	"status" varchar(2) DEFAULT 'nm',
	"dana_pengelola" boolean DEFAULT false NOT NULL,
	"pdanaid" integer,
	"id_anggaran" varchar(50),
	"harga_program" numeric(20, 2),
	"harga_penyaluran" numeric(20, 2),
	"nominal_dp" numeric(20, 2),
	"nominal_dss" numeric(20, 2),
	"persentase_dp" numeric(20, 2),
	"persentase_dss" numeric(20, 2),
	"jenjang_pendidikan" varchar(10),
	"baru" varchar(5),
	"external_ids" jsonb,
	CONSTRAINT "setting_program_id_program_unique" UNIQUE("id_program"),
	CONSTRAINT "setting_program_jenis_check" CHECK (jenis_program IS NULL OR jenis_program IN ('dn', 'ln')),
	CONSTRAINT "setting_program_sifat_check" CHECK (sifat_program IS NULL OR sifat_program IN ('t', 'tt')),
	CONSTRAINT "setting_program_status_check" CHECK (status IS NULL OR status IN ('m', 'nm'))
);
--> statement-breakpoint
CREATE TABLE "ajis_group_user" (
	"id_group_user" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_group_user_id_group_user_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"group_user" varchar(20) NOT NULL,
	"keterangan" varchar(100),
	"aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "ajis_group_user_group_user_unique" UNIQUE("group_user")
);
--> statement-breakpoint
CREATE TABLE "ajis_user" (
	"id_user" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_user_id_user_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"username" varchar(50) NOT NULL,
	"email" varchar(100),
	"nik" varchar(13),
	"kantor_id" varchar(10),
	"nama_kantor" varchar(30),
	"id_wilayah_pembinaan" bigint,
	"nama_wilayah" varchar(50),
	"id_group_user" bigint,
	"aktif" boolean DEFAULT true NOT NULL,
	"user_insert" varchar(50),
	"date_insert" timestamp with time zone,
	CONSTRAINT "ajis_user_username_unique" UNIQUE("username"),
	CONSTRAINT "ajis_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ajis_user_akses" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_user_akses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"userid" bigint NOT NULL,
	"levelid" integer NOT NULL,
	CONSTRAINT "ajis_user_akses_natural_uq" UNIQUE("userid","levelid")
);
--> statement-breakpoint
CREATE TABLE "ajis_wilayah_pembinaan" (
	"id_wilayah_pembinaan" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_wilayah_pembinaan_id_wilayah_pembinaan_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"nama_wilayah" varchar(100) NOT NULL,
	"alamat_wilayah" text,
	"kantor_id" varchar(10),
	"nama_kantor" varchar(30),
	"status_approve" varchar(1),
	"propid" varchar(4),
	"nama_propinsi" varchar(30),
	"kabid" varchar(4),
	"nama_kabupaten" varchar(30),
	"camatid" varchar(10),
	"nama_kecamatan" varchar(30),
	"desaid" varchar(10),
	"nama_desa" varchar(30),
	"aktif" boolean DEFAULT true NOT NULL,
	"user_insert" varchar(30),
	"date_insert" timestamp with time zone,
	"user_update" varchar(30),
	"date_update" timestamp with time zone,
	CONSTRAINT "ajis_wilayah_pembinaan_nama_wilayah_unique" UNIQUE("nama_wilayah"),
	CONSTRAINT "ajis_wilayah_status_approve_check" CHECK (status_approve IS NULL OR status_approve IN ('y', 't'))
);
--> statement-breakpoint
CREATE TABLE "sdm_penugasan" (
	"id_penugasan" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sdm_penugasan_id_penugasan_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id_sdm" bigint NOT NULL,
	"id_wilayah_pembinaan" bigint NOT NULL,
	"kantor_id" varchar(10),
	"id_fungsi_struktur" bigint,
	"keaktifan_edukasi" varchar(1),
	"user_insert" varchar(30),
	"date_insert" timestamp with time zone,
	"user_update" varchar(30),
	"date_update" timestamp with time zone,
	CONSTRAINT "sdm_penugasan_keaktifan_check" CHECK (keaktifan_edukasi IS NULL OR keaktifan_edukasi IN ('y', 't'))
);
--> statement-breakpoint
CREATE TABLE "sdm_wilayah" (
	"id_sdm" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sdm_wilayah_id_sdm_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"nik" varchar(50),
	"nama_lengkap" varchar(100),
	"jenis_kelamin" varchar(1),
	"alamat" varchar(100),
	"propid" varchar(4),
	"nama_propinsi" varchar(40),
	"kabid" varchar(4),
	"nama_kabupaten" varchar(40),
	"camatid" varchar(10),
	"nama_kecamatan" varchar(40),
	"desaid" varchar(10),
	"nama_desa" varchar(40),
	"jenjang_pendidikan" varchar(5),
	"tgl_bergabung" date,
	"tgl_keluar" date,
	"telp" varchar(15),
	"hp" varchar(15),
	"email" varchar(100),
	"keterangan" varchar(100),
	"keaktifan_edukasi" varchar(1),
	"foto" varchar(100),
	"aktif" boolean DEFAULT true NOT NULL,
	"user_insert" varchar(30),
	"date_insert" timestamp with time zone,
	"user_update" varchar(30),
	"date_update" timestamp with time zone,
	CONSTRAINT "sdm_wilayah_nik_unique" UNIQUE("nik"),
	CONSTRAINT "sdm_wilayah_jenis_kelamin_check" CHECK (jenis_kelamin IS NULL OR jenis_kelamin IN ('l', 'p')),
	CONSTRAINT "sdm_wilayah_keaktifan_check" CHECK (keaktifan_edukasi IS NULL OR keaktifan_edukasi IN ('y', 't'))
);
--> statement-breakpoint
CREATE TABLE "ajis_anak" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_anak_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id_anak" varchar(25) NOT NULL,
	"nik" varchar(50),
	"nama_lengkap" varchar(150) NOT NULL,
	"nama_panggilan" varchar(50),
	"agama" varchar(50),
	"jns_kel" varchar(1),
	"tempat_lahir" varchar(30),
	"tgl_lahir" date,
	"anak_ke" integer,
	"dari_saudara" integer,
	"alamat" varchar(100),
	"propid" varchar(4),
	"nama_propinsi" varchar(30),
	"kabid" varchar(4),
	"nama_kabupaten" varchar(30),
	"camatid" varchar(10),
	"nama_kecamatan" varchar(30),
	"desaid" varchar(10),
	"nama_desa" varchar(30),
	"jenjang_pendidikan" varchar(10),
	"kelas" varchar(50),
	"nama_sekolah" text,
	"alamat_sekolah" text,
	"jurusan" varchar(30),
	"semester" integer,
	"nama_pt" text,
	"alamat_pt" text,
	"nilai" varchar(50),
	"pelajaran_favorit" varchar(50),
	"jarak_rumah" varchar(50),
	"alat_transportasi" varchar(50),
	"hobi" text,
	"prestasi" text,
	"no_rekening" varchar(25),
	"pemilik_rekening" varchar(50),
	"nama_bank" varchar(50),
	"foto" text,
	"no_kartu_keluarga" varchar(25),
	"asnaf" varchar(50),
	"status_ortu" varchar(50),
	"status_survey" boolean DEFAULT false NOT NULL,
	"status_kelayakan" boolean DEFAULT false NOT NULL,
	"status_anak_juara" varchar(3),
	"status_tersantuni" varchar(2),
	"status_pinjam" boolean DEFAULT false NOT NULL,
	"status_mentor" boolean DEFAULT false NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"alumni_juara" boolean,
	"juara" varchar(10),
	"approval_ijf" varchar(50),
	"via_input" varchar(100),
	"id_wilayah_pembinaan" bigint,
	"nama_wilayah" varchar(100),
	"kantor_id" varchar(10),
	"nama_kantor" varchar(100),
	"id_sdm" bigint,
	"nama_mentor" varchar(100),
	"tgl_terdaftar" date,
	"tgl_pengajuan" date,
	"nama_lengkap_ayah" varchar(50),
	"alamat_ayah" varchar(100),
	"propid_ayah" varchar(4),
	"nama_propinsi_ayah" varchar(30),
	"kabid_ayah" varchar(4),
	"nama_kabupaten_ayah" varchar(30),
	"camatid_ayah" varchar(10),
	"nama_kecamatan_ayah" varchar(30),
	"desaid_ayah" varchar(10),
	"nama_desa_ayah" varchar(30),
	"pekerjaan_ayah" text,
	"penghasilan_rata_rata_ayah" numeric(20, 2),
	"tanggal_kematian_ayah" date,
	"penyebab_kematian_ayah" varchar(100),
	"nama_lengkap_ibu" varchar(50),
	"alamat_ibu" varchar(100),
	"propid_ibu" varchar(4),
	"nama_propinsi_ibu" varchar(30),
	"kabid_ibu" varchar(4),
	"nama_kabupaten_ibu" varchar(30),
	"camatid_ibu" varchar(10),
	"nama_kecamatan_ibu" varchar(30),
	"desaid_ibu" varchar(10),
	"nama_desa_ibu" varchar(30),
	"pekerjaan_ibu" text,
	"penghasilan_rata_rata_ibu" numeric(20, 2),
	"tanggal_kematian_ibu" date,
	"penyebab_kematian_ibu" varchar(100),
	"nama_lengkap_wali" varchar(50),
	"alamat_wali" varchar(100),
	"propid_wali" varchar(4),
	"nama_propinsi_wali" varchar(30),
	"kabid_wali" varchar(4),
	"nama_kabupaten_wali" varchar(30),
	"camatid_wali" varchar(10),
	"nama_kecamatan_wali" varchar(30),
	"desaid_wali" varchar(10),
	"nama_desa_wali" varchar(30),
	"pekerjaan_wali" text,
	"penghasilan_rata_rata_wali" numeric(20, 2),
	"telp_yang_bisa_dihubungi" varchar(15),
	"atas_nama" varchar(30),
	"hubungan_kerabat" varchar(15),
	"tinggal_bersama" text,
	"nama_tinggal" text,
	"ket_tinggal" text,
	"penghasilan_tinggal" numeric(20, 2),
	"pekerjaan_tinggal" text,
	"tidak_serumah_ortu" boolean,
	"nia_rfo_book" varchar(50),
	"nama_rfo_book" varchar(100),
	"tgl_peminjaman" date,
	"tgl_expired" date,
	"book_via" varchar(50),
	"user_book" varchar(50),
	"external_ids" jsonb,
	CONSTRAINT "ajis_anak_id_anak_unique" UNIQUE("id_anak"),
	CONSTRAINT "ajis_anak_nik_unique" UNIQUE("nik"),
	CONSTRAINT "ajis_anak_jns_kel_check" CHECK (jns_kel IS NULL OR jns_kel IN ('l', 'p')),
	CONSTRAINT "ajis_anak_status_aj_check" CHECK (status_anak_juara IS NULL OR status_anak_juara IN ('caj', 'aj', 'non')),
	CONSTRAINT "ajis_anak_status_tersantuni_check" CHECK (status_tersantuni IS NULL OR status_tersantuni IN ('su', 'b', 'se', 't'))
);
--> statement-breakpoint
CREATE TABLE "ajis_data_prestasi" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_data_prestasi_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id_anak" varchar(25) NOT NULL,
	"event_lomba" varchar(100),
	"tgl" date,
	"lokasi" varchar(50),
	"skala_prestasi_tingkat" varchar(30),
	"capaian_prestasi" varchar(50),
	"jenis_bidang" varchar(30),
	"publikasi_media" varchar(50),
	"semesterid" varchar(10),
	"laporanid" varchar(50),
	"bulan" varchar(2),
	"tahun" varchar(4),
	"show" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ajis_opname" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_opname_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"tahun" smallint NOT NULL,
	"id_pemasangan_baru" varchar(100) NOT NULL,
	"id_anak" varchar(25),
	"id_donatur" varchar(30),
	"program_donasi" varchar(100),
	"id_program" bigint,
	"saldo_awal_ganjil" numeric(20, 2),
	"tupo_jan_jun" varchar(100),
	"date_opname_ganjil" timestamp with time zone,
	"user_opname_ganjil" varchar(100),
	"saldo_akhir_ganjil" numeric(20, 2),
	"saldo_awal_genap" numeric(20, 2),
	"tupo_jul_des" varchar(100),
	"date_opname_genap" timestamp with time zone,
	"user_opname_genap" varchar(100),
	"saldo_akhir_genap" numeric(20, 2),
	"kantor_id" varchar(10),
	"keterangan" text,
	"user_input" varchar(50),
	"user_update" varchar(100),
	"updated" timestamp with time zone,
	"external_ids" jsonb,
	CONSTRAINT "ajis_opname_natural_uq" UNIQUE("tahun","id_pemasangan_baru")
);
--> statement-breakpoint
CREATE TABLE "ajis_pemasangan" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_pemasangan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id_pemasangan_baru" varchar(100) NOT NULL,
	"tahun" smallint NOT NULL,
	"tgl_pemasangan" date,
	"tgl_pemberhentian_pemasangan" date,
	"id_donatur" varchar(30),
	"nama_donatur" varchar(150),
	"nia_rfo" varchar(50),
	"nama_rfo" varchar(150),
	"id_anak" varchar(25) NOT NULL,
	"nama_anak" varchar(150),
	"jns_kel" varchar(1),
	"kelas" varchar(50),
	"jenjang_pendidikan" varchar(10),
	"asnaf" varchar(50),
	"status_ortu" varchar(50),
	"status_aj" varchar(50),
	"nik" varchar(50),
	"no_rekening" varchar(50),
	"id_wilayah_pembinaan" bigint,
	"nama_wilayah" varchar(100),
	"kantor_id" varchar(10),
	"nama_kantor" varchar(100),
	"id_sdm" bigint,
	"nama_mentor" varchar(100),
	"status_mentor" boolean DEFAULT false NOT NULL,
	"program_donasi" varchar(50),
	"id_program" bigint,
	"program_sebelumnya" varchar(40),
	"harga_program" numeric(20, 2),
	"harga_penyaluran" numeric(20, 2),
	"status_pasangan" boolean DEFAULT false NOT NULL,
	"keterangan_pemberhentian" text,
	"saldo_awal" numeric(20, 2),
	"status_saldo" boolean DEFAULT false NOT NULL,
	"saldo_akhir" numeric(20, 2),
	"status_saldo_akhir" varchar(10),
	"updated_saldo" timestamp with time zone,
	"cek" varchar(100),
	"tunda_penyaluran" varchar(50),
	"id_naik_jenjang" varchar(100),
	"via_input" varchar(50),
	"history" varchar(1),
	"user_stop" varchar(50),
	"via_stop" varchar(50),
	"alasan_aktif" varchar(50),
	"pinjam" text,
	"user_insert" varchar(30),
	"date_insert" timestamp with time zone,
	"user_update" varchar(30),
	"date_update" timestamp with time zone,
	"external_ids" jsonb,
	CONSTRAINT "ajis_pemasangan_id_pemasangan_baru_unique" UNIQUE("id_pemasangan_baru")
);
--> statement-breakpoint
CREATE TABLE "ajis_pemasangan_log" (
	"id_log" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_pemasangan_log_id_log_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id_pemasangan_baru" varchar(100) NOT NULL,
	"tgl_pemasangan" date,
	"tgl_pemberhentian_pemasangan" date,
	"id_donatur" varchar(30),
	"nama_donatur" varchar(150),
	"id_anak" varchar(25),
	"nama_anak" varchar(150),
	"id_wilayah_pembinaan" bigint,
	"nama_wilayah" varchar(100),
	"kantor_id" varchar(10),
	"nama_kantor" varchar(100),
	"program_donasi" varchar(50),
	"id_program" bigint,
	"harga_program" numeric(20, 2),
	"harga_penyaluran" numeric(20, 2),
	"keterangan_pemberhentian" text,
	"status_pasangan" boolean,
	"saldo_awal" numeric(20, 2),
	"status_saldo" boolean,
	"status_mentor" boolean,
	"program_sebelumnya" varchar(40),
	"jns_kel" varchar(1),
	"kelas" varchar(50),
	"jenjang_pendidikan" varchar(10),
	"asnaf" varchar(50),
	"status_ortu" varchar(50),
	"status_aj" varchar(50),
	"id_sdm" bigint,
	"nama_mentor" varchar(100),
	"nik" varchar(50),
	"no_rekening" varchar(50),
	"cek" varchar(100),
	"nia_rfo" varchar(50),
	"nama_rfo" varchar(150),
	"user_insert" varchar(30),
	"date_insert" timestamp with time zone,
	"user_update" varchar(30),
	"date_update" timestamp with time zone,
	"updated" timestamp with time zone,
	"deleted" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ajis_input_donasi" (
	"id_input_donasi" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_input_donasi_id_input_donasi_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id_pemasangan_baru" varchar(100) NOT NULL,
	"tgl_transaksi" date,
	"id_anak" varchar(25),
	"nama_anak" varchar(150),
	"id_donatur" varchar(30),
	"nama_donatur" varchar(150),
	"program_donasi" varchar(50),
	"id_program" bigint,
	"qty" smallint,
	"pilihan_donasi" numeric(20, 2),
	"nominal_donasi" numeric(20, 2),
	"bulan" smallint,
	"tahun" smallint,
	"periode" varchar(10),
	"transid" varchar(50),
	"detailid" smallint,
	"kantor_id" varchar(10),
	"nama_kantor" varchar(100),
	"id_wilayah_pembinaan" bigint,
	"nama_wilayah" varchar(100),
	"jenis" varchar(5),
	"jenjang_pendidikan" varchar(10),
	"jns_kel" varchar(1),
	"asnaf" varchar(50),
	"nik" varchar(50),
	"via_input" varchar(100),
	"user_insert" varchar(30),
	"date_insert" timestamp with time zone,
	"user_update" varchar(30),
	"date_update" timestamp with time zone,
	"external_ids" jsonb,
	CONSTRAINT "ajis_input_donasi_jenis_check" CHECK (jenis IS NULL OR jenis IN ('trans', 'saldo'))
);
--> statement-breakpoint
CREATE TABLE "ajis_penyaluran" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_penyaluran_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id_penyaluran" varchar(50) NOT NULL,
	"id_pemasangan_baru" varchar(100),
	"tgl_penyaluran" date,
	"id_anak" varchar(25),
	"nama_anak" varchar(150),
	"nik" varchar(50),
	"jenjang_pendidikan" varchar(10),
	"kelas" varchar(50),
	"jns_kel" varchar(1),
	"asnaf" varchar(50),
	"id_donatur" varchar(30),
	"nama_donatur" varchar(150),
	"id_sdm" bigint,
	"nama_sdm" varchar(100),
	"id_wilayah_pembinaan" bigint,
	"nama_wilayah" varchar(100),
	"kantor_id" varchar(10),
	"nama_kantor" varchar(100),
	"program_donasi" varchar(50),
	"id_program" bigint,
	"nominal_penyaluran" numeric(20, 2),
	"nominal_hpp" numeric(20, 2),
	"saldo_akhir_ganjil" numeric(20, 2),
	"bulan" smallint,
	"tahun" smallint,
	"periode" varchar(10),
	"transid" varchar(50),
	"detailid" smallint,
	"id_input_donasi" bigint,
	"jenis" varchar(50),
	"status_akhir" boolean DEFAULT false NOT NULL,
	"status_tersalurkan" boolean DEFAULT false NOT NULL,
	"via_input" varchar(10),
	"alamat" text,
	"no_rekening" varchar(50),
	"pemilik_rekening" varchar(50),
	"nama_bank" varchar(50),
	"tempat_lahir" varchar(50),
	"no_kartu_keluarga" varchar(50),
	"desaid" varchar(10),
	"nama_desa" varchar(100),
	"nama_kecamatan" varchar(100),
	"nama_kabupaten" varchar(100),
	"nama_propinsi" varchar(100),
	"user_insert" varchar(30),
	"date_insert" timestamp with time zone,
	"user_update" varchar(30),
	"date_update" timestamp with time zone,
	"external_ids" jsonb,
	CONSTRAINT "ajis_penyaluran_natural_uq" UNIQUE("id_penyaluran","id_pemasangan_baru","bulan","tahun"),
	CONSTRAINT "ajis_penyaluran_via_input_check" CHECK (via_input IS NULL OR via_input IN ('massal', 'single'))
);
--> statement-breakpoint
CREATE TABLE "ajis_view_ajuan" (
	"id_ajuan" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_view_ajuan_id_ajuan_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"tgl_ajuan" date,
	"kantor_id" varchar(10),
	"nama_kantor" varchar(100),
	"id_wilayah_pembinaan" bigint,
	"nama_wilayah" varchar(200),
	"id_donatur" varchar(30),
	"nama_donatur" varchar(200),
	"oid_donatur" varchar(10),
	"kantor_donatur" varchar(50),
	"jenis_kelamin_donatur" varchar(1),
	"jenis_donatur" varchar(100),
	"hp" varchar(50),
	"program_donasi" varchar(80),
	"nia_rfo" varchar(30),
	"nama_rfo" varchar(80),
	"id_pemasangan_baru" varchar(100),
	"id_anak" varchar(30),
	"nama_anak_asal" varchar(200),
	"jns_kelamin" varchar(1),
	"alasan_pergantian" varchar(200),
	"id_anak_pengganti" varchar(30),
	"nama_anak_pengganti" varchar(200),
	"keterangan" varchar(200),
	"tipe_ganti" varchar(20),
	"pindah_saldo" numeric(20, 2),
	"approve_funding" varchar(1),
	"tgl_approve_funding" timestamp with time zone,
	"alasan_reject" text,
	"status_eksekusi" boolean,
	"tgl_eksekusi" date,
	CONSTRAINT "ajis_view_ajuan_approve_funding_check" CHECK (approve_funding IS NULL OR approve_funding IN ('t', 'n', 'y'))
);
--> statement-breakpoint
CREATE TABLE "transaksi" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "transaksi_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"transid" varchar(50) NOT NULL,
	"detailid" smallint NOT NULL,
	"jenis_transaksi" varchar(10),
	"did" varchar(30),
	"nama_donatur" varchar(150),
	"progid" varchar(6),
	"id_program" bigint,
	"nama_program" varchar(100),
	"perkiraan_rp" numeric(20, 2),
	"harga_program" numeric(20, 2),
	"tgl_donasi" date,
	"tgl_transaksi" date,
	"oid_transaksi" varchar(10),
	"oid_donatur" varchar(10),
	"kantor_transaksi" varchar(100),
	"kantor_donatur" varchar(100),
	"kantor_ijis" varchar(100),
	"kantor_id_ijis" varchar(10),
	"jml_anak_ijis" smallint,
	"vbayarid" varchar(100),
	"mbayarid" varchar(100),
	"nik_rfo" varchar(15),
	"nama_rfo" varchar(50),
	"valid4" varchar(50),
	"nik_claim" varchar(14),
	"jid_claim" varchar(6),
	"nama_claim" varchar(50),
	"approved_claim" boolean DEFAULT false NOT NULL,
	"approved_trans" boolean DEFAULT false NOT NULL,
	"atas_nama" text,
	"date_generate" timestamp with time zone,
	"keterangan" text,
	"jml_mustahik" smallint,
	"bulan_disantuni" varchar(50),
	"status_pasang" boolean DEFAULT false NOT NULL,
	"approve_salur" boolean DEFAULT false NOT NULL,
	"ket_approve_salur" text,
	"user_approve_salur" varchar(50),
	"date_approve_salur" timestamp with time zone,
	"deleted_trans" boolean DEFAULT false NOT NULL,
	"deleted_detail" boolean DEFAULT false NOT NULL,
	"review" boolean DEFAULT false NOT NULL,
	"id_review" varchar(50),
	"cicilan" boolean DEFAULT false NOT NULL,
	"bulan_salur" smallint,
	"tahun_salur" smallint,
	"selisih_donasi" numeric(20, 2),
	"total_input_donasi" numeric(20, 2),
	"user_insert_cf" varchar(50),
	"user_update_cf" varchar(50),
	"user_insert" varchar(50),
	"date_insert" timestamp with time zone,
	"external_ids" jsonb,
	CONSTRAINT "transaksi_natural_uq" UNIQUE("transid","detailid"),
	CONSTRAINT "transaksi_jenis_check" CHECK (jenis_transaksi IS NULL OR jenis_transaksi IN ('cash', 'noncash', 'bank', 'pccash', 'pcnoncash'))
);
--> statement-breakpoint
CREATE TABLE "ajis_dokumentasi_pembinaan" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_dokumentasi_pembinaan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"semesterid" varchar(10) NOT NULL,
	"kantor_id" varchar(10) NOT NULL,
	"id_wilayah_pembinaan" bigint NOT NULL,
	"image" text,
	"nama" varchar(50),
	"external_ids" jsonb,
	CONSTRAINT "ajis_dokumentasi_natural_uq" UNIQUE("semesterid","kantor_id","id_wilayah_pembinaan")
);
--> statement-breakpoint
CREATE TABLE "ajis_hafalan" (
	"id_hafalan" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_hafalan_id_hafalan_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id_anak" varchar(25) NOT NULL,
	"semesterid" varchar(10) NOT NULL,
	"jenis" varchar(50),
	"konten_uji" varchar(100) NOT NULL,
	"id_item_hafalan" bigint,
	"tgl_pengujian" date,
	"tgl_insert" timestamp with time zone,
	"keterangan" text,
	"external_ids" jsonb,
	CONSTRAINT "ajis_hafalan_natural_uq" UNIQUE("id_anak","semesterid","konten_uji")
);
--> statement-breakpoint
CREATE TABLE "ajis_pembinaan_baru" (
	"id_row" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_pembinaan_baru_id_row_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id_pembinaan" varchar(100) NOT NULL,
	"tgl_pembinaan" date,
	"semesterid" varchar(10),
	"bulan" smallint,
	"tahun" smallint,
	"jenis_pembinaan" varchar(100),
	"p3a" varchar(100),
	"judul_materi" text,
	"pemateri" varchar(150),
	"pemateri_personal" varchar(150),
	"id_anak" varchar(25) NOT NULL,
	"nama_lengkap" varchar(150),
	"nik" varchar(50),
	"jns_kel" varchar(1),
	"asnaf" varchar(50),
	"jenjang_pendidikan" varchar(10),
	"status_ortu" varchar(50),
	"nama_lengkap_ayah" varchar(50),
	"nama_lengkap_ibu" varchar(50),
	"nama_lengkap_wali" varchar(50),
	"kehadiran" varchar(15),
	"ortu_hadir" varchar(50),
	"keterangan" varchar(100),
	"id_wilayah_pembinaan" bigint,
	"nama_wilayah" varchar(100),
	"kantor_id" varchar(10),
	"nama_kantor" varchar(100),
	"id_donatur" varchar(30),
	"nama_donatur" varchar(150),
	"program_donasi" varchar(50),
	"capaian_tilawah" varchar(50),
	"capaian_tahfidz" varchar(50),
	"capaian_tahfidz_hal" varchar(50),
	"pembiasaan_shalat_wajib" smallint,
	"pembiasaan_tilawah" smallint,
	"pembiasaan_sedekah" smallint,
	"membantu_ortu" smallint,
	"tampil" boolean DEFAULT true NOT NULL,
	"via_input" varchar(50),
	"user_insert" varchar(100),
	"date_insert" timestamp with time zone DEFAULT now(),
	"user_update" varchar(100),
	"date_update" timestamp with time zone,
	"external_ids" jsonb
);
--> statement-breakpoint
CREATE TABLE "ajis_penilaian" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_penilaian_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id_anak" varchar(25) NOT NULL,
	"nama_anak" varchar(150),
	"semesterid" varchar(10) NOT NULL,
	"kategori" varchar(100),
	"aspek" varchar(150) NOT NULL,
	"id_item_penilaian" bigint,
	"target" text,
	"kondisi_awal" text,
	"nilai_capaian" smallint,
	"perkembangan_capaian" text,
	"skor" smallint,
	"hasil_akhir" varchar(20),
	"keterangan" text,
	"kantor_id" varchar(10),
	"nama_kantor" varchar(100),
	"id_wilayah_pembinaan" bigint,
	"nama_wilayah" varchar(100),
	"tampil" boolean DEFAULT true NOT NULL,
	"via_input" varchar(20),
	"tgl_insert" timestamp with time zone,
	"external_ids" jsonb,
	CONSTRAINT "ajis_penilaian_natural_uq" UNIQUE("id_anak","semesterid","aspek")
);
--> statement-breakpoint
CREATE TABLE "ajis_peminjam" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_peminjam_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id_peminjam" varchar(50) NOT NULL,
	"nama_lengkap" varchar(100),
	"jabatan" varchar(25),
	"kantor" varchar(25),
	"hp" varchar(15),
	"telp" varchar(15),
	"email" varchar(100),
	"user_insert" varchar(30),
	"date_insert" timestamp with time zone,
	"user_update" varchar(30),
	"date_update" timestamp with time zone,
	"external_ids" jsonb,
	CONSTRAINT "ajis_peminjam_id_peminjam_unique" UNIQUE("id_peminjam")
);
--> statement-breakpoint
CREATE TABLE "ajis_peminjaman_anak" (
	"id_peminjaman" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_peminjaman_anak_id_peminjaman_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id_peminjam" varchar(50),
	"nama_peminjam" varchar(100),
	"id_anak" varchar(25),
	"nama_anak" varchar(150),
	"jns_kel" varchar(1),
	"jenjang_pendidikan" varchar(10),
	"alamat" text,
	"nama_propinsi" varchar(30),
	"nama_kabupaten" varchar(30),
	"nama_kecamatan" varchar(30),
	"nama_desa" varchar(30),
	"foto" text,
	"kantor_id" varchar(10),
	"nama_kantor" varchar(100),
	"id_wilayah_pembinaan" varchar(16),
	"nama_wilayah" varchar(100),
	"tgl_awal_peminjaman" date,
	"tgl_selesai_peminjaman" date,
	"tgl_expired" date,
	"status_pinjam" boolean DEFAULT false NOT NULL,
	"status_terpasangkan" boolean DEFAULT false NOT NULL,
	"cancel" boolean DEFAULT false NOT NULL,
	"alasan_cancel" text,
	"user_insert" varchar(30),
	"date_insert" date
);
--> statement-breakpoint
CREATE TABLE "ajis_survey" (
	"id_survey" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ajis_survey_id_survey_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"tgl_survey" date,
	"petugas_survey" varchar(30),
	"id_anak" varchar(25) NOT NULL,
	"nama_lengkap" varchar(150),
	"nama_lengkap_ayah" varchar(50),
	"nama_lengkap_ibu" varchar(50),
	"nama_lengkap_wali" varchar(50),
	"kantor_id" varchar(10),
	"nama_kantor" varchar(100),
	"id_wilayah_pembinaan" varchar(16),
	"nama_wilayah" varchar(100),
	"asnaf" varchar(50),
	"alamat" text,
	"nama_propinsi" varchar(30),
	"nama_kabupaten" varchar(30),
	"nama_kecamatan" varchar(30),
	"nama_desa" varchar(30),
	"jns_kel" varchar(1),
	"jenjang_pendidikan" varchar(10),
	"tgl_pengajuan" date,
	"status_anak" varchar(10),
	"hasil_kesimpulan_survey" varchar(100),
	"kepemilikan_tanah" varchar(100),
	"kepemilikan_rumah" varchar(100),
	"kondisi_dinding_rumah" varchar(100),
	"kondisi_lantai_rumah" varchar(100),
	"kepemilikan_kendaraan" varchar(100),
	"kepemilikan_barang_elektronik" varchar(100),
	"kepemilikan_tabungan" varchar(100),
	"pekerjaan_kepala_keluarga" varchar(100),
	"rata_rata_penghasilan_perbulan" varchar(100),
	"makan_2x" varchar(100),
	"nama_kepala_keluarga" varchar(100),
	"pendidikan_terakhir_kepala_keluarga" varchar(100),
	"jml_tanggungan_kepala_keluarga" smallint,
	"sumber_air_bersih" varchar(100),
	"jamban_dan_saluran_limbah" varchar(100),
	"tempat_pembuangan_sampah" varchar(100),
	"terdapat_perokok" varchar(100),
	"terdapat_konsumen_miras" varchar(100),
	"terdapat_persediaan_obat_p3k" varchar(100),
	"makan_buah_dan_sayur_tiap_hari" varchar(100),
	"shalat_5_waktu" varchar(100),
	"membaca_alquran" varchar(100),
	"majelis_taklim" varchar(100),
	"membaca_koran" varchar(100),
	"aktif_sebagai_pengurus_organisasi" varchar(100),
	"asnaf_anak" varchar(10),
	"biaya_pendidikan_spp_perbulan" numeric(20, 2),
	"bantuan_rutin_dari_lembaga_lain" boolean,
	"jml_bantuan_rutin_dari_lembaga_lain" numeric(20, 2),
	"resume_deskriptif" text,
	"user_insert" varchar(30),
	"date_insert" timestamp with time zone,
	"user_update" varchar(30),
	"date_update" timestamp with time zone,
	"external_ids" jsonb,
	CONSTRAINT "ajis_survey_asnaf_anak_check" CHECK (asnaf_anak IS NULL OR asnaf_anak IN ('yatim', 'piatu', 'dhuafa'))
);
--> statement-breakpoint
CREATE TABLE "manual_laporan" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "manual_laporan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"laporanid" varchar(50) NOT NULL,
	"versi_struktur" varchar(5) DEFAULT 'baru' NOT NULL,
	"donatur_id" varchar(50),
	"donatur_nama" varchar(150),
	"donatur_alamat" text,
	"id_anak" varchar(25),
	"nik" varchar(50),
	"pm_nama_lengkap" varchar(150),
	"jns_kel" varchar(1),
	"pm_tempat_lahir" varchar(100),
	"pm_tgl_lahir" date,
	"pm_anak_ke" smallint,
	"pm_saudara" smallint,
	"pm_nama_orang_tua" varchar(150),
	"pm_pekerjaan" varchar(100),
	"asnaf" varchar(15),
	"status_ortu" varchar(50),
	"pm_anak_nama_sekolah" text,
	"pm_anak_alamat_sekolah" text,
	"pm_anak_kelas" varchar(5),
	"pm_anak_jenjang" varchar(5),
	"pm_mhs_institusi" varchar(100),
	"pm_mhs_prodi" varchar(100),
	"pm_mhs_semester" smallint,
	"pm_mhs_jurusan" varchar(100),
	"pembinaan_wilayah" varchar(100),
	"pembinaan_alamat" text,
	"pembinaan_jml_anak" smallint,
	"pembinaan_jenjang" varchar(5),
	"pembinaan_perkembangan" text,
	"pembinaan_prestasi" text,
	"catatan_pembinaan" text,
	"suara_anak_juara" text,
	"dana_saldo_awal" numeric(20, 2),
	"dana_penerimaan" numeric(20, 2),
	"dana_penyaluran" numeric(20, 2),
	"tgl_update_keuangan" timestamp with time zone,
	"programid" smallint,
	"semesterid" varchar(10),
	"nama_semester" varchar(100),
	"jenis" varchar(10),
	"jenis_laporan" varchar(50),
	"tahun" smallint,
	"id_pemasangan_baru" varchar(100),
	"id_naik_jenjang" varchar(100),
	"formatid" smallint,
	"aktif" boolean DEFAULT true NOT NULL,
	"oid" varchar(10),
	"kantor_id" varchar(10),
	"nama_kantor" varchar(100),
	"id_wilayah_pembinaan" bigint,
	"nama_wilayah" varchar(100),
	"foto" text,
	"status_foto" varchar(1),
	"keterangan_foto" varchar(225),
	"foto_pembinaan" text,
	"s_foto_pembinaan" varchar(1),
	"keterangan_foto_pembinaan" varchar(225),
	"surat_suara_hati" text,
	"status_ssh" varchar(1),
	"keterangan_ssh" varchar(225),
	"raport_ceria" text,
	"status_raport_ceria" varchar(1),
	"keterangan_raport_ceria" varchar(225),
	"raport_satu" text,
	"status_raport_satu" varchar(1),
	"keterangan_raport_satu" varchar(225),
	"raport_dua" text,
	"status_raport_dua" varchar(1),
	"keterangan_raport_dua" varchar(225),
	"s_materi" varchar(1),
	"keterangan_materi" text,
	"s_perkembangan_siswa" boolean,
	"keterangan_perkembangan_siswa" varchar(225),
	"s_raport" smallint,
	"hasil_qc" varchar(25),
	"keterangan" text,
	"status_terbuat" boolean DEFAULT false NOT NULL,
	"tgl_status_terbuat" date,
	"status_terkirim_fundraising" boolean DEFAULT false NOT NULL,
	"tgl_status_terkirim_fundraising" date,
	"status_terkirim_donatur" boolean DEFAULT false NOT NULL,
	"tgl_status_terkirim_donatur" date,
	"wajib_materi" smallint,
	"jml_materi" smallint,
	"jml_materi_tampil" smallint,
	"wajib_materi_bulan" smallint,
	"jml_materi_tampil_bulan" smallint,
	"jml_prestasi" smallint,
	"tgl_penyaluran" text,
	"tgl_pembinaan" text,
	"tgl_penyaluran_bulan" text,
	"tgl_pembinaan_bulan" text,
	"tgl_insert" timestamp with time zone,
	"user_insert" varchar(50),
	"external_ids" jsonb,
	CONSTRAINT "manual_laporan_laporanid_unique" UNIQUE("laporanid"),
	CONSTRAINT "manual_laporan_versi_check" CHECK (versi_struktur IS NULL OR versi_struktur IN ('lama', 'baru')),
	CONSTRAINT "manual_laporan_status_foto_check" CHECK (status_foto IS NULL OR status_foto IN ('t', 'n', 'y')),
	CONSTRAINT "manual_laporan_s_foto_pembinaan_check" CHECK (s_foto_pembinaan IS NULL OR s_foto_pembinaan IN ('t', 'n', 'y')),
	CONSTRAINT "manual_laporan_status_ssh_check" CHECK (status_ssh IS NULL OR status_ssh IN ('t', 'n', 'y')),
	CONSTRAINT "manual_laporan_status_raport_ceria_check" CHECK (status_raport_ceria IS NULL OR status_raport_ceria IN ('t', 'n', 'y')),
	CONSTRAINT "manual_laporan_status_raport_satu_check" CHECK (status_raport_satu IS NULL OR status_raport_satu IN ('t', 'n', 'y')),
	CONSTRAINT "manual_laporan_status_raport_dua_check" CHECK (status_raport_dua IS NULL OR status_raport_dua IN ('t', 'n', 'y')),
	CONSTRAINT "manual_laporan_s_materi_check" CHECK (s_materi IS NULL OR s_materi IN ('t', 'n', 'y'))
);
--> statement-breakpoint
CREATE TABLE "manual_laporan_pembinaan" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "manual_laporan_pembinaan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"laporanid" varchar(50) NOT NULL,
	"detailid" smallint NOT NULL,
	"id_anak" varchar(25),
	"semesterid" varchar(10),
	"tanggal" date,
	"materi" varchar(200),
	"aktif" boolean DEFAULT true NOT NULL,
	"date_insert" date,
	"user_insert" varchar(50),
	CONSTRAINT "manual_laporan_pembinaan_natural_uq" UNIQUE("laporanid","detailid")
);
--> statement-breakpoint
CREATE TABLE "manual_laporan_prestasi" (
	"id_prestasi" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "manual_laporan_prestasi_id_prestasi_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"id_anak" varchar(25),
	"nama_anak" varchar(150),
	"jns_kel" varchar(1),
	"kantor_id" varchar(10),
	"nama_kantor" varchar(100),
	"id_wilayah_pembinaan" bigint,
	"nama_wilayah" varchar(100),
	"jenjang_pendidikan" varchar(10),
	"kelas" varchar(50),
	"event" text,
	"lokasi" text,
	"bidang_prestasi" text,
	"skala" text,
	"prestasi" text,
	"link_publikasi" text,
	"waktu_awal" date,
	"waktu_akhir" date,
	"aktif" boolean DEFAULT true NOT NULL,
	"date_insert" date,
	"user_insert" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "materi" (
	"id_materi" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "materi_id_materi_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"detailid" varchar(50),
	"materi" text,
	"tanggal" date,
	"jenjang" varchar(10),
	"semesterid" varchar(10),
	"oid" varchar(10),
	"id_wilayah_pembinaan" bigint
);
--> statement-breakpoint
ALTER TABLE "ref_desa" ADD CONSTRAINT "ref_desa_camatid_ref_kecamatan_camatid_fk" FOREIGN KEY ("camatid") REFERENCES "public"."ref_kecamatan"("camatid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ref_kabupaten" ADD CONSTRAINT "ref_kabupaten_propid_ref_propinsi_propid_fk" FOREIGN KEY ("propid") REFERENCES "public"."ref_propinsi"("propid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ref_kecamatan" ADD CONSTRAINT "ref_kecamatan_kabid_ref_kabupaten_kabid_fk" FOREIGN KEY ("kabid") REFERENCES "public"."ref_kabupaten"("kabid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_user" ADD CONSTRAINT "ajis_user_id_group_user_ajis_group_user_id_group_user_fk" FOREIGN KEY ("id_group_user") REFERENCES "public"."ajis_group_user"("id_group_user") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_user_akses" ADD CONSTRAINT "ajis_user_akses_userid_ajis_user_id_user_fk" FOREIGN KEY ("userid") REFERENCES "public"."ajis_user"("id_user") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_wilayah_pembinaan" ADD CONSTRAINT "ajis_wilayah_pembinaan_kantor_id_ajis_kantor_oid_fk" FOREIGN KEY ("kantor_id") REFERENCES "public"."ajis_kantor"("oid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdm_penugasan" ADD CONSTRAINT "sdm_penugasan_id_sdm_sdm_wilayah_id_sdm_fk" FOREIGN KEY ("id_sdm") REFERENCES "public"."sdm_wilayah"("id_sdm") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdm_penugasan" ADD CONSTRAINT "sdm_penugasan_id_wilayah_pembinaan_ajis_wilayah_pembinaan_id_wilayah_pembinaan_fk" FOREIGN KEY ("id_wilayah_pembinaan") REFERENCES "public"."ajis_wilayah_pembinaan"("id_wilayah_pembinaan") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdm_penugasan" ADD CONSTRAINT "sdm_penugasan_kantor_id_ajis_kantor_oid_fk" FOREIGN KEY ("kantor_id") REFERENCES "public"."ajis_kantor"("oid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdm_penugasan" ADD CONSTRAINT "sdm_penugasan_id_fungsi_struktur_ref_fungsi_struktur_id_fungsi_struktur_fk" FOREIGN KEY ("id_fungsi_struktur") REFERENCES "public"."ref_fungsi_struktur"("id_fungsi_struktur") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_anak" ADD CONSTRAINT "ajis_anak_id_wilayah_pembinaan_ajis_wilayah_pembinaan_id_wilayah_pembinaan_fk" FOREIGN KEY ("id_wilayah_pembinaan") REFERENCES "public"."ajis_wilayah_pembinaan"("id_wilayah_pembinaan") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_anak" ADD CONSTRAINT "ajis_anak_kantor_id_ajis_kantor_oid_fk" FOREIGN KEY ("kantor_id") REFERENCES "public"."ajis_kantor"("oid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_anak" ADD CONSTRAINT "ajis_anak_id_sdm_sdm_wilayah_id_sdm_fk" FOREIGN KEY ("id_sdm") REFERENCES "public"."sdm_wilayah"("id_sdm") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_data_prestasi" ADD CONSTRAINT "ajis_data_prestasi_id_anak_ajis_anak_id_anak_fk" FOREIGN KEY ("id_anak") REFERENCES "public"."ajis_anak"("id_anak") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_opname" ADD CONSTRAINT "ajis_opname_id_pemasangan_baru_ajis_pemasangan_id_pemasangan_baru_fk" FOREIGN KEY ("id_pemasangan_baru") REFERENCES "public"."ajis_pemasangan"("id_pemasangan_baru") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_pemasangan" ADD CONSTRAINT "ajis_pemasangan_id_anak_ajis_anak_id_anak_fk" FOREIGN KEY ("id_anak") REFERENCES "public"."ajis_anak"("id_anak") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_pemasangan" ADD CONSTRAINT "ajis_pemasangan_id_wilayah_pembinaan_ajis_wilayah_pembinaan_id_wilayah_pembinaan_fk" FOREIGN KEY ("id_wilayah_pembinaan") REFERENCES "public"."ajis_wilayah_pembinaan"("id_wilayah_pembinaan") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_pemasangan" ADD CONSTRAINT "ajis_pemasangan_kantor_id_ajis_kantor_oid_fk" FOREIGN KEY ("kantor_id") REFERENCES "public"."ajis_kantor"("oid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_pemasangan" ADD CONSTRAINT "ajis_pemasangan_id_sdm_sdm_wilayah_id_sdm_fk" FOREIGN KEY ("id_sdm") REFERENCES "public"."sdm_wilayah"("id_sdm") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_input_donasi" ADD CONSTRAINT "ajis_input_donasi_id_pemasangan_baru_ajis_pemasangan_id_pemasangan_baru_fk" FOREIGN KEY ("id_pemasangan_baru") REFERENCES "public"."ajis_pemasangan"("id_pemasangan_baru") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_penyaluran" ADD CONSTRAINT "ajis_penyaluran_id_pemasangan_baru_ajis_pemasangan_id_pemasangan_baru_fk" FOREIGN KEY ("id_pemasangan_baru") REFERENCES "public"."ajis_pemasangan"("id_pemasangan_baru") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_dokumentasi_pembinaan" ADD CONSTRAINT "ajis_dokumentasi_pembinaan_semesterid_ajis_semester_semesterid_fk" FOREIGN KEY ("semesterid") REFERENCES "public"."ajis_semester"("semesterid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_hafalan" ADD CONSTRAINT "ajis_hafalan_id_anak_ajis_anak_id_anak_fk" FOREIGN KEY ("id_anak") REFERENCES "public"."ajis_anak"("id_anak") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_hafalan" ADD CONSTRAINT "ajis_hafalan_semesterid_ajis_semester_semesterid_fk" FOREIGN KEY ("semesterid") REFERENCES "public"."ajis_semester"("semesterid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_hafalan" ADD CONSTRAINT "ajis_hafalan_id_item_hafalan_ajis_item_hafalan_id_fk" FOREIGN KEY ("id_item_hafalan") REFERENCES "public"."ajis_item_hafalan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_pembinaan_baru" ADD CONSTRAINT "ajis_pembinaan_baru_semesterid_ajis_semester_semesterid_fk" FOREIGN KEY ("semesterid") REFERENCES "public"."ajis_semester"("semesterid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_pembinaan_baru" ADD CONSTRAINT "ajis_pembinaan_baru_id_anak_ajis_anak_id_anak_fk" FOREIGN KEY ("id_anak") REFERENCES "public"."ajis_anak"("id_anak") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_penilaian" ADD CONSTRAINT "ajis_penilaian_id_anak_ajis_anak_id_anak_fk" FOREIGN KEY ("id_anak") REFERENCES "public"."ajis_anak"("id_anak") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_penilaian" ADD CONSTRAINT "ajis_penilaian_semesterid_ajis_semester_semesterid_fk" FOREIGN KEY ("semesterid") REFERENCES "public"."ajis_semester"("semesterid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_penilaian" ADD CONSTRAINT "ajis_penilaian_id_item_penilaian_ajis_item_penilaian_id_fk" FOREIGN KEY ("id_item_penilaian") REFERENCES "public"."ajis_item_penilaian"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_peminjaman_anak" ADD CONSTRAINT "ajis_peminjaman_anak_id_peminjam_ajis_peminjam_id_peminjam_fk" FOREIGN KEY ("id_peminjam") REFERENCES "public"."ajis_peminjam"("id_peminjam") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_peminjaman_anak" ADD CONSTRAINT "ajis_peminjaman_anak_id_anak_ajis_anak_id_anak_fk" FOREIGN KEY ("id_anak") REFERENCES "public"."ajis_anak"("id_anak") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_survey" ADD CONSTRAINT "ajis_survey_id_anak_ajis_anak_id_anak_fk" FOREIGN KEY ("id_anak") REFERENCES "public"."ajis_anak"("id_anak") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_laporan" ADD CONSTRAINT "manual_laporan_semesterid_ajis_semester_semesterid_fk" FOREIGN KEY ("semesterid") REFERENCES "public"."ajis_semester"("semesterid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_laporan_pembinaan" ADD CONSTRAINT "manual_laporan_pembinaan_laporanid_manual_laporan_laporanid_fk" FOREIGN KEY ("laporanid") REFERENCES "public"."manual_laporan"("laporanid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ref_desa_camatid_idx" ON "ref_desa" USING btree ("camatid");--> statement-breakpoint
CREATE INDEX "ref_kabupaten_propid_idx" ON "ref_kabupaten" USING btree ("propid");--> statement-breakpoint
CREATE INDEX "ref_kecamatan_kabid_idx" ON "ref_kecamatan" USING btree ("kabid");--> statement-breakpoint
CREATE INDEX "ajis_harga_progid_idx" ON "ajis_harga" USING btree ("progid");--> statement-breakpoint
CREATE INDEX "ajis_item_hafalan_jenis_idx" ON "ajis_item_hafalan" USING btree ("jenis");--> statement-breakpoint
CREATE INDEX "ajis_semester_tgl_idx" ON "ajis_semester" USING btree ("tgl_awal","tgl_akhir");--> statement-breakpoint
CREATE INDEX "ajis_semester_onprogress_idx" ON "ajis_semester" USING btree ("semesterid") WHERE onprogress;--> statement-breakpoint
CREATE INDEX "setting_program_progid_idx" ON "setting_program" USING btree ("progid");--> statement-breakpoint
CREATE INDEX "ajis_user_scope_idx" ON "ajis_user" USING btree ("kantor_id","id_wilayah_pembinaan");--> statement-breakpoint
CREATE INDEX "ajis_user_aktif_idx" ON "ajis_user" USING btree ("email") WHERE aktif;--> statement-breakpoint
CREATE INDEX "ajis_user_akses_levelid_idx" ON "ajis_user_akses" USING btree ("levelid");--> statement-breakpoint
CREATE INDEX "ajis_wilayah_kantor_idx" ON "ajis_wilayah_pembinaan" USING btree ("kantor_id") WHERE aktif;--> statement-breakpoint
CREATE INDEX "sdm_penugasan_sdm_idx" ON "sdm_penugasan" USING btree ("id_sdm");--> statement-breakpoint
CREATE INDEX "sdm_penugasan_wilayah_idx" ON "sdm_penugasan" USING btree ("id_wilayah_pembinaan","kantor_id");--> statement-breakpoint
CREATE INDEX "sdm_wilayah_nama_trgm_idx" ON "sdm_wilayah" USING gin ("nama_lengkap" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "ajis_anak_scope_idx" ON "ajis_anak" USING btree ("kantor_id","id_wilayah_pembinaan","status_anak_juara");--> statement-breakpoint
CREATE INDEX "ajis_anak_caj_idx" ON "ajis_anak" USING btree ("kantor_id","id_wilayah_pembinaan") WHERE status_anak_juara = 'caj' AND aktif;--> statement-breakpoint
CREATE INDEX "ajis_anak_nia_rfo_book_idx" ON "ajis_anak" USING btree ("nia_rfo_book");--> statement-breakpoint
CREATE INDEX "ajis_anak_sdm_idx" ON "ajis_anak" USING btree ("id_sdm");--> statement-breakpoint
CREATE INDEX "ajis_anak_nama_trgm_idx" ON "ajis_anak" USING gin ("nama_lengkap" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "ajis_data_prestasi_anak_idx" ON "ajis_data_prestasi" USING btree ("id_anak","tgl" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "ajis_opname_pemasangan_idx" ON "ajis_opname" USING btree ("id_pemasangan_baru");--> statement-breakpoint
CREATE INDEX "ajis_opname_saldo_habis_idx" ON "ajis_opname" USING btree ("tahun","kantor_id") WHERE saldo_akhir_genap <= 0;--> statement-breakpoint
CREATE INDEX "ajis_pemasangan_tahun_kantor_idx" ON "ajis_pemasangan" USING btree ("tahun","kantor_id","status_pasangan");--> statement-breakpoint
CREATE INDEX "ajis_pemasangan_aktif_idx" ON "ajis_pemasangan" USING btree ("kantor_id","tahun") WHERE status_pasangan;--> statement-breakpoint
CREATE INDEX "ajis_pemasangan_anak_idx" ON "ajis_pemasangan" USING btree ("id_anak","tahun");--> statement-breakpoint
CREATE INDEX "ajis_pemasangan_donatur_idx" ON "ajis_pemasangan" USING btree ("id_donatur","tahun");--> statement-breakpoint
CREATE INDEX "ajis_pemasangan_nia_rfo_idx" ON "ajis_pemasangan" USING btree ("nia_rfo","tahun");--> statement-breakpoint
CREATE INDEX "ajis_pemasangan_keyset_idx" ON "ajis_pemasangan" USING btree ("nama_anak","id");--> statement-breakpoint
CREATE INDEX "ajis_pemasangan_nama_anak_trgm_idx" ON "ajis_pemasangan" USING gin ("nama_anak" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "ajis_pemasangan_nama_donatur_trgm_idx" ON "ajis_pemasangan" USING gin ("nama_donatur" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "ajis_pemasangan_log_pemasangan_idx" ON "ajis_pemasangan_log" USING btree ("id_pemasangan_baru");--> statement-breakpoint
CREATE INDEX "ajis_pemasangan_log_anak_idx" ON "ajis_pemasangan_log" USING btree ("id_anak");--> statement-breakpoint
CREATE INDEX "ajis_input_donasi_pemasangan_idx" ON "ajis_input_donasi" USING btree ("id_pemasangan_baru","tahun","bulan");--> statement-breakpoint
CREATE INDEX "ajis_input_donasi_anak_idx" ON "ajis_input_donasi" USING btree ("id_anak","tahun");--> statement-breakpoint
CREATE INDEX "ajis_input_donasi_kantor_idx" ON "ajis_input_donasi" USING btree ("kantor_id","tahun","bulan");--> statement-breakpoint
CREATE INDEX "ajis_input_donasi_transid_idx" ON "ajis_input_donasi" USING btree ("transid","detailid");--> statement-breakpoint
CREATE INDEX "ajis_input_donasi_tgl_brin" ON "ajis_input_donasi" USING brin ("tgl_transaksi");--> statement-breakpoint
CREATE INDEX "ajis_penyaluran_pemasangan_idx" ON "ajis_penyaluran" USING btree ("id_pemasangan_baru","tahun","bulan");--> statement-breakpoint
CREATE INDEX "ajis_penyaluran_kantor_idx" ON "ajis_penyaluran" USING btree ("kantor_id","tgl_penyaluran" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "ajis_penyaluran_pending_idx" ON "ajis_penyaluran" USING btree ("kantor_id","tahun","bulan") WHERE NOT status_tersalurkan;--> statement-breakpoint
CREATE INDEX "ajis_penyaluran_tgl_brin" ON "ajis_penyaluran" USING brin ("tgl_penyaluran");--> statement-breakpoint
CREATE INDEX "ajis_view_ajuan_antrian_idx" ON "ajis_view_ajuan" USING btree ("nia_rfo","tgl_ajuan" DESC NULLS LAST) WHERE approve_funding = 't';--> statement-breakpoint
CREATE INDEX "ajis_view_ajuan_scope_idx" ON "ajis_view_ajuan" USING btree ("kantor_id","tgl_ajuan" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "ajis_view_ajuan_anak_idx" ON "ajis_view_ajuan" USING btree ("id_anak");--> statement-breakpoint
CREATE INDEX "transaksi_did_idx" ON "transaksi" USING btree ("did","tgl_transaksi" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "transaksi_live_idx" ON "transaksi" USING btree ("oid_transaksi","tgl_transaksi" DESC NULLS LAST) WHERE approved_trans AND NOT deleted_trans;--> statement-breakpoint
CREATE INDEX "transaksi_oid_idx" ON "transaksi" USING btree ("oid_transaksi","oid_donatur");--> statement-breakpoint
CREATE INDEX "transaksi_tgl_brin" ON "transaksi" USING brin ("tgl_transaksi");--> statement-breakpoint
CREATE INDEX "ajis_hafalan_anak_semester_idx" ON "ajis_hafalan" USING btree ("id_anak","semesterid");--> statement-breakpoint
CREATE INDEX "ajis_pembinaan_anak_tgl_idx" ON "ajis_pembinaan_baru" USING btree ("id_anak","tgl_pembinaan" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "ajis_pembinaan_scope_idx" ON "ajis_pembinaan_baru" USING btree ("kantor_id","id_wilayah_pembinaan","tahun","bulan");--> statement-breakpoint
CREATE INDEX "ajis_pembinaan_semester_idx" ON "ajis_pembinaan_baru" USING btree ("semesterid","id_anak");--> statement-breakpoint
CREATE INDEX "ajis_pembinaan_sesi_idx" ON "ajis_pembinaan_baru" USING btree ("id_pembinaan");--> statement-breakpoint
CREATE INDEX "ajis_pembinaan_tgl_brin" ON "ajis_pembinaan_baru" USING brin ("tgl_pembinaan");--> statement-breakpoint
CREATE INDEX "ajis_penilaian_anak_semester_idx" ON "ajis_penilaian" USING btree ("id_anak","semesterid");--> statement-breakpoint
CREATE INDEX "ajis_penilaian_semester_kantor_idx" ON "ajis_penilaian" USING btree ("semesterid","kantor_id");--> statement-breakpoint
CREATE INDEX "ajis_penilaian_item_idx" ON "ajis_penilaian" USING btree ("id_item_penilaian","semesterid");--> statement-breakpoint
CREATE INDEX "ajis_peminjam_nama_idx" ON "ajis_peminjam" USING btree ("nama_lengkap");--> statement-breakpoint
CREATE INDEX "ajis_peminjaman_aktif_idx" ON "ajis_peminjaman_anak" USING btree ("kantor_id","id_wilayah_pembinaan") WHERE status_pinjam AND NOT cancel;--> statement-breakpoint
CREATE INDEX "ajis_peminjaman_peminjam_idx" ON "ajis_peminjaman_anak" USING btree ("id_peminjam","tgl_awal_peminjaman" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "ajis_peminjaman_expired_idx" ON "ajis_peminjaman_anak" USING btree ("tgl_expired") WHERE status_pinjam AND NOT cancel;--> statement-breakpoint
CREATE INDEX "ajis_peminjaman_anak_idx" ON "ajis_peminjaman_anak" USING btree ("id_anak");--> statement-breakpoint
CREATE INDEX "ajis_survey_anak_idx" ON "ajis_survey" USING btree ("id_anak");--> statement-breakpoint
CREATE INDEX "ajis_survey_scope_idx" ON "ajis_survey" USING btree ("kantor_id","id_wilayah_pembinaan","tgl_survey" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "ajis_survey_nama_trgm_idx" ON "ajis_survey" USING gin ("nama_lengkap" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "manual_laporan_semester_idx" ON "manual_laporan" USING btree ("semesterid","kantor_id");--> statement-breakpoint
CREATE INDEX "manual_laporan_scope_idx" ON "manual_laporan" USING btree ("id_wilayah_pembinaan","oid");--> statement-breakpoint
CREATE INDEX "manual_laporan_anak_idx" ON "manual_laporan" USING btree ("id_anak","semesterid");--> statement-breakpoint
CREATE INDEX "manual_laporan_pembinaan_anak_idx" ON "manual_laporan_pembinaan" USING btree ("id_anak","semesterid");--> statement-breakpoint
CREATE INDEX "manual_laporan_prestasi_anak_idx" ON "manual_laporan_prestasi" USING btree ("id_anak","waktu_awal" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "materi_semester_idx" ON "materi" USING btree ("semesterid","oid","id_wilayah_pembinaan");