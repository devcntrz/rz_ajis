CREATE TABLE "ajis_harga" (
	"id_harga" bigserial PRIMARY KEY NOT NULL,
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
	"id" bigserial PRIMARY KEY NOT NULL,
	"jenis" integer NOT NULL,
	"konten" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ajis_item_penilaian" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"item_penilaian" text,
	"parent_id" varchar(100),
	"is_parent" boolean DEFAULT false NOT NULL,
	"jenis" varchar(100),
	"target" text
);
--> statement-breakpoint
CREATE TABLE "ajis_semester" (
	"id" bigserial PRIMARY KEY NOT NULL,
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
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" text,
	"keterangan" varchar(200),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "setting_program" (
	"id" bigserial PRIMARY KEY NOT NULL,
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
	"id_group_user" bigserial PRIMARY KEY NOT NULL,
	"group_user" varchar(20) NOT NULL,
	"keterangan" varchar(100),
	"aktif" boolean DEFAULT true NOT NULL,
	CONSTRAINT "ajis_group_user_group_user_unique" UNIQUE("group_user")
);
--> statement-breakpoint
CREATE TABLE "ajis_user" (
	"id_user" bigserial PRIMARY KEY NOT NULL,
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
	"userid" bigint NOT NULL,
	"levelid" integer NOT NULL,
	CONSTRAINT "ajis_user_akses_userid_levelid_pk" PRIMARY KEY("userid","levelid")
);
--> statement-breakpoint
CREATE TABLE "ajis_wilayah_pembinaan" (
	"id_wilayah_pembinaan" bigserial PRIMARY KEY NOT NULL,
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
	"id_penugasan" bigserial PRIMARY KEY NOT NULL,
	"id_sdm" bigint NOT NULL,
	"id_wilayah_pembinaan" bigint NOT NULL,
	"kantor_id" varchar(10),
	"id_fungsi_struktur" varchar(16),
	"keaktifan_edukasi" varchar(1),
	"user_insert" varchar(30),
	"date_insert" timestamp with time zone,
	"user_update" varchar(30),
	"date_update" timestamp with time zone,
	CONSTRAINT "sdm_penugasan_keaktifan_check" CHECK (keaktifan_edukasi IS NULL OR keaktifan_edukasi IN ('y', 't'))
);
--> statement-breakpoint
CREATE TABLE "sdm_wilayah" (
	"id_sdm" bigserial PRIMARY KEY NOT NULL,
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
ALTER TABLE "ajis_user" ADD CONSTRAINT "ajis_user_id_group_user_ajis_group_user_id_group_user_fk" FOREIGN KEY ("id_group_user") REFERENCES "public"."ajis_group_user"("id_group_user") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_user_akses" ADD CONSTRAINT "ajis_user_akses_userid_ajis_user_id_user_fk" FOREIGN KEY ("userid") REFERENCES "public"."ajis_user"("id_user") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ajis_wilayah_pembinaan" ADD CONSTRAINT "ajis_wilayah_pembinaan_kantor_id_ajis_kantor_oid_fk" FOREIGN KEY ("kantor_id") REFERENCES "public"."ajis_kantor"("oid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdm_penugasan" ADD CONSTRAINT "sdm_penugasan_id_sdm_sdm_wilayah_id_sdm_fk" FOREIGN KEY ("id_sdm") REFERENCES "public"."sdm_wilayah"("id_sdm") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdm_penugasan" ADD CONSTRAINT "sdm_penugasan_id_wilayah_pembinaan_ajis_wilayah_pembinaan_id_wilayah_pembinaan_fk" FOREIGN KEY ("id_wilayah_pembinaan") REFERENCES "public"."ajis_wilayah_pembinaan"("id_wilayah_pembinaan") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdm_penugasan" ADD CONSTRAINT "sdm_penugasan_kantor_id_ajis_kantor_oid_fk" FOREIGN KEY ("kantor_id") REFERENCES "public"."ajis_kantor"("oid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sdm_penugasan" ADD CONSTRAINT "sdm_penugasan_id_fungsi_struktur_ref_fungsi_struktur_id_fungsi_struktur_fk" FOREIGN KEY ("id_fungsi_struktur") REFERENCES "public"."ref_fungsi_struktur"("id_fungsi_struktur") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX "sdm_wilayah_nama_trgm_idx" ON "sdm_wilayah" USING gin ("nama_lengkap" gin_trgm_ops);