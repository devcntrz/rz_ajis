CREATE TABLE "ajis_dokumentasi_pembinaan" (
	"id" bigserial PRIMARY KEY NOT NULL,
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
	"id_hafalan" bigserial PRIMARY KEY NOT NULL,
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
	"id_row" bigserial PRIMARY KEY NOT NULL,
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
	"id" bigserial PRIMARY KEY NOT NULL,
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
	"id" bigserial PRIMARY KEY NOT NULL,
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
	"id_peminjaman" bigserial PRIMARY KEY NOT NULL,
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
	"id_survey" bigserial PRIMARY KEY NOT NULL,
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
	"laporanid" varchar(50) PRIMARY KEY NOT NULL,
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
	"id" bigserial PRIMARY KEY NOT NULL,
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
	"id_prestasi" bigserial PRIMARY KEY NOT NULL,
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
	"id_materi" bigserial PRIMARY KEY NOT NULL,
	"detailid" varchar(50),
	"materi" text,
	"tanggal" date,
	"jenjang" varchar(10),
	"semesterid" varchar(10),
	"oid" varchar(10),
	"id_wilayah_pembinaan" bigint
);
--> statement-breakpoint
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