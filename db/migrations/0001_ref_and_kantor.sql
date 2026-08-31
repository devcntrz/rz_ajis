CREATE TABLE "ref_desa" (
	"desaid" varchar(10) PRIMARY KEY NOT NULL,
	"nama_desa" varchar(50) NOT NULL,
	"kelurahan" boolean DEFAULT false NOT NULL,
	"camatid" varchar(10) NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"propid" varchar(4),
	"kabid" varchar(4),
	"nomor_induk_desa" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "ref_fungsi_struktur" (
	"id_fungsi_struktur" varchar(16) PRIMARY KEY NOT NULL,
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
	"kabid" varchar(4) PRIMARY KEY NOT NULL,
	"propid" varchar(4) NOT NULL,
	"kabupaten" varchar(50) NOT NULL,
	"kota" boolean DEFAULT false NOT NULL,
	"ibukota" varchar(50),
	"oid" varchar(10),
	"aktif" boolean DEFAULT true NOT NULL,
	"lat" numeric(10, 6),
	"lng" numeric(10, 6),
	"updated" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ref_kecamatan" (
	"camatid" varchar(10) PRIMARY KEY NOT NULL,
	"nama_kecamatan" varchar(50) NOT NULL,
	"kodepos" varchar(10),
	"kabid" varchar(4) NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"updated" date
);
--> statement-breakpoint
CREATE TABLE "ref_pekerjaan" (
	"kerjaid" varchar(3) PRIMARY KEY NOT NULL,
	"pekerjaan" varchar(100) NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ref_propinsi" (
	"propid" varchar(4) PRIMARY KEY NOT NULL,
	"propinsi" varchar(50) NOT NULL,
	"ibukota" varchar(50),
	"aktif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ajis_kantor" (
	"oid" varchar(10) PRIMARY KEY NOT NULL,
	"kantor" varchar(30),
	"alamat" varchar(50),
	"no_telp" varchar(15),
	"oid_parent" varchar(10),
	"oid_parent_second" varchar(10),
	"jenis" varchar(50),
	"external_ids" jsonb
);
--> statement-breakpoint
CREATE TABLE "kantor" (
	"oid" varchar(10) PRIMARY KEY NOT NULL,
	"kantor" varchar(50),
	"alamat" varchar(100),
	"oid_parent" varchar(10),
	"level" integer,
	"aktif" boolean DEFAULT true NOT NULL,
	"id_office" varchar(50),
	"omid" varchar(20),
	"external_ids" jsonb
);
--> statement-breakpoint
CREATE TABLE "map_kantor" (
	"id_kantor_zains" varchar(10) PRIMARY KEY NOT NULL,
	"kantor_id" varchar(10) NOT NULL,
	"nama_kantor" varchar(100),
	"id_kantor_parent" varchar(10),
	"id_kantor_level" integer,
	"coa" varchar(15),
	"coa_outlet" varchar(15),
	"aktif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ref_desa" ADD CONSTRAINT "ref_desa_camatid_ref_kecamatan_camatid_fk" FOREIGN KEY ("camatid") REFERENCES "public"."ref_kecamatan"("camatid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ref_kabupaten" ADD CONSTRAINT "ref_kabupaten_propid_ref_propinsi_propid_fk" FOREIGN KEY ("propid") REFERENCES "public"."ref_propinsi"("propid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ref_kecamatan" ADD CONSTRAINT "ref_kecamatan_kabid_ref_kabupaten_kabid_fk" FOREIGN KEY ("kabid") REFERENCES "public"."ref_kabupaten"("kabid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ref_desa_camatid_idx" ON "ref_desa" USING btree ("camatid");--> statement-breakpoint
CREATE INDEX "ref_kabupaten_propid_idx" ON "ref_kabupaten" USING btree ("propid");--> statement-breakpoint
CREATE INDEX "ref_kecamatan_kabid_idx" ON "ref_kecamatan" USING btree ("kabid");