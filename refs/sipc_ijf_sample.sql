-- AJIS / sipc_ijf sample database export
-- Generated: 2026-06-29T07:24:10.151Z
-- Database: sipc_ijf
-- Structure: all tables + views
-- Data: up to 5 rows per table (views skipped)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TABLE STRUCTURES (69 tables)
-- ============================================================

DROP TABLE IF EXISTS `ajis_anak`;
CREATE TABLE `ajis_anak` (
  `id_anak` varchar(25) NOT NULL,
  `nik` varchar(50) NOT NULL,
  `nama_lengkap` text NOT NULL,
  `nama_panggilan` varchar(50) NOT NULL,
  `agama` varchar(50) NOT NULL,
  `jns_kel` enum('l','p') NOT NULL,
  `tempat_lahir` varchar(30) NOT NULL,
  `tgl_lahir` date NOT NULL,
  `anak_ke` tinyint(1) NOT NULL,
  `dari_saudara` tinyint(1) NOT NULL,
  `alamat` varchar(75) NOT NULL,
  `propid` varchar(15) NOT NULL,
  `nama_propinsi` varchar(30) NOT NULL,
  `kabid` varchar(15) NOT NULL,
  `nama_kabupaten` varchar(30) NOT NULL,
  `camatid` varchar(15) NOT NULL,
  `nama_kecamatan` varchar(30) NOT NULL,
  `desaid` varchar(15) NOT NULL,
  `nama_desa` varchar(30) NOT NULL,
  `jenjang_pendidikan` varchar(10) NOT NULL,
  `kelas` varchar(50) NOT NULL,
  `nama_sekolah` text NOT NULL,
  `alamat_sekolah` text NOT NULL,
  `jurusan` varchar(30) NOT NULL,
  `semester` tinyint(4) NOT NULL,
  `nama_pt` text NOT NULL,
  `alamat_pt` text NOT NULL,
  `no_rekening` varchar(25) NOT NULL,
  `foto` text NOT NULL,
  `nilai` varchar(50) NOT NULL,
  `pelajaran_favorit` varchar(50) NOT NULL,
  `jarak_rumah` varchar(50) NOT NULL,
  `alat_transportasi` varchar(50) NOT NULL,
  `hobi` text NOT NULL,
  `prestasi` text NOT NULL,
  `no_kartu_keluarga` varchar(25) NOT NULL,
  `asnaf` varchar(50) NOT NULL,
  `status_ortu` varchar(50) NOT NULL,
  `status_survey` enum('y','n') NOT NULL,
  `status_kelayakan` enum('y','n') NOT NULL,
  `status_anak_juara` varchar(3) NOT NULL,
  `status_tersantuni` enum('su','b','se','t') NOT NULL,
  `status_pinjam` enum('y','n') NOT NULL,
  `status_mentor` enum('y','n') NOT NULL DEFAULT 'n',
  `id_wilayah_pembinaan` int(2) NOT NULL,
  `kantor_id` varchar(50) NOT NULL,
  `nama_wilayah` text NOT NULL,
  `nama_kantor` text NOT NULL,
  `tgl_terdaftar` date NOT NULL,
  `tgl_pengajuan` date NOT NULL,
  `nama_lengkap_ayah` varchar(50) NOT NULL,
  `alamat_ayah` varchar(75) NOT NULL,
  `propid_ayah` varchar(15) NOT NULL,
  `nama_propinsi_ayah` varchar(30) NOT NULL,
  `kabid_ayah` varchar(15) NOT NULL,
  `nama_kabupaten_ayah` varchar(30) NOT NULL,
  `camatid_ayah` varchar(15) NOT NULL,
  `nama_kecamatan_ayah` varchar(30) NOT NULL,
  `desaid_ayah` varchar(15) NOT NULL,
  `nama_desa_ayah` varchar(30) NOT NULL,
  `pekerjaan_ayah` text NOT NULL,
  `penghasilan_rata_rata_ayah` double NOT NULL,
  `tanggal_kematian_ayah` date NOT NULL,
  `penyebab_kematian_ayah` varchar(100) NOT NULL,
  `nama_lengkap_ibu` varchar(30) NOT NULL,
  `alamat_ibu` varchar(75) NOT NULL,
  `propid_ibu` varchar(15) NOT NULL,
  `nama_propinsi_ibu` varchar(30) NOT NULL,
  `kabid_ibu` varchar(15) NOT NULL,
  `nama_kabupaten_ibu` varchar(30) NOT NULL,
  `camatid_ibu` varchar(15) NOT NULL,
  `nama_kecamatan_ibu` varchar(30) NOT NULL,
  `desaid_ibu` varchar(15) NOT NULL,
  `nama_desa_ibu` varchar(30) NOT NULL,
  `pekerjaan_ibu` text NOT NULL,
  `penghasilan_rata_rata_ibu` double NOT NULL,
  `tanggal_kematian_ibu` date NOT NULL,
  `penyebab_kematian_ibu` varchar(100) NOT NULL,
  `nama_lengkap_wali` varchar(30) NOT NULL,
  `alamat_wali` varchar(75) NOT NULL,
  `propid_wali` varchar(15) NOT NULL,
  `nama_propinsi_wali` varchar(30) NOT NULL,
  `kabid_wali` varchar(15) NOT NULL,
  `nama_kabupaten_wali` varchar(30) NOT NULL,
  `camatid_wali` varchar(15) NOT NULL,
  `nama_kecamatan_wali` varchar(30) NOT NULL,
  `desaid_wali` varchar(15) NOT NULL,
  `nama_desa_wali` varchar(30) NOT NULL,
  `pekerjaan_wali` text NOT NULL,
  `penghasilan_rata_rata_wali` double NOT NULL,
  `telp_yang_bisa_dihubungi` varchar(15) NOT NULL,
  `atas_nama` varchar(30) NOT NULL,
  `hubungan_kerabat` varchar(15) NOT NULL,
  `id_sdm` varchar(50) NOT NULL DEFAULT '',
  `nama_mentor` varchar(100) NOT NULL DEFAULT '',
  `aktif` enum('y','n') NOT NULL,
  `via_input` varchar(100) NOT NULL DEFAULT '',
  `approval_ijf` varchar(50) NOT NULL DEFAULT '',
  `oid_rz` text NOT NULL DEFAULT '',
  `nia_rfo_book` varchar(50) NOT NULL DEFAULT '',
  `nama_rfo_book` varchar(100) NOT NULL DEFAULT '',
  `tgl_peminjaman` date NOT NULL DEFAULT '0000-00-00',
  `tgl_expired` date NOT NULL DEFAULT '0000-00-00',
  `book_via` varchar(50) NOT NULL DEFAULT '',
  `user_book` varchar(50) NOT NULL DEFAULT '',
  `alumni_juara` enum('','y','n') NOT NULL,
  `juara` varchar(10) NOT NULL DEFAULT '',
  `tinggal_bersama` text NOT NULL DEFAULT '',
  `nama_tinggal` text NOT NULL DEFAULT '',
  `ket_tinggal` text NOT NULL DEFAULT '',
  `penghasilan_tinggal` text NOT NULL DEFAULT '',
  `pekerjaan_tinggal` text NOT NULL DEFAULT '',
  `tidak_serumah_ortu` varchar(50) NOT NULL DEFAULT '',
  `id_kantor_postgree` varchar(10) DEFAULT NULL,
  `id_ijgs_anak` varchar(50) DEFAULT NULL,
  `upload_gdrive` varchar(50) DEFAULT NULL,
  `pemilik_rekening` varchar(50) DEFAULT NULL,
  `nama_bank` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_anak`),
  UNIQUE KEY `nik` (`nik`),
  KEY `id_wilayah_pembinaan` (`id_wilayah_pembinaan`,`kantor_id`,`id_sdm`),
  KEY `id_anak` (`id_anak`),
  KEY `kantor_id` (`kantor_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_batas_expired_peminjaman`;
CREATE TABLE `ajis_batas_expired_peminjaman` (
  `jml_hari` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_data_prestasi`;
CREATE TABLE `ajis_data_prestasi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_anak` varchar(50) NOT NULL,
  `event_lomba` varchar(50) NOT NULL,
  `tgl` date NOT NULL,
  `lokasi` varchar(50) NOT NULL,
  `skala_prestasi_tingkat` varchar(30) NOT NULL,
  `capaian_prestasi` varchar(50) NOT NULL,
  `jenis_bidang` varchar(30) NOT NULL,
  `publikasi_media` varchar(50) NOT NULL,
  `semesterid` varchar(50) NOT NULL,
  `laporanid` varchar(50) NOT NULL,
  `bulan` varchar(2) NOT NULL,
  `tahun` varchar(4) NOT NULL,
  `show` int(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=82 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_dokumentasi_pembinaan`;
CREATE TABLE `ajis_dokumentasi_pembinaan` (
  `semesterid` varchar(10) NOT NULL,
  `kantor_id` varchar(10) NOT NULL,
  `image` text NOT NULL,
  `nama` varchar(50) DEFAULT NULL,
  `id_kantor_postgree` varchar(50) DEFAULT NULL,
  `id_ijgs_dokumentasi` varchar(50) DEFAULT NULL,
  `upload_gdrive` varchar(50) DEFAULT NULL,
  `id_wilayah_pembinaan` varchar(10) NOT NULL,
  PRIMARY KEY (`semesterid`,`kantor_id`,`id_wilayah_pembinaan`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_fungsi_struktur`;
CREATE TABLE `ajis_fungsi_struktur` (
  `id_fungsi_struktur` int(16) NOT NULL AUTO_INCREMENT,
  `kode_fungsi` varchar(5) NOT NULL,
  `nama_fungsi_struktur` varchar(30) NOT NULL,
  `aktif` varchar(10) NOT NULL,
  `user_insert` varchar(30) NOT NULL,
  `date_insert` date NOT NULL,
  `user_update` varchar(30) NOT NULL,
  `date_update` date NOT NULL,
  PRIMARY KEY (`id_fungsi_struktur`),
  UNIQUE KEY `nama_fungsi_struktur` (`nama_fungsi_struktur`)
) ENGINE=MyISAM AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_group_user`;
CREATE TABLE `ajis_group_user` (
  `id_group_user` int(11) NOT NULL AUTO_INCREMENT,
  `group_user` varchar(20) NOT NULL,
  `keterangan` varchar(100) NOT NULL,
  `aktif` enum('y','n') NOT NULL,
  PRIMARY KEY (`id_group_user`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_hafalan`;
CREATE TABLE `ajis_hafalan` (
  `id_anak` varchar(20) NOT NULL,
  `jenis` varchar(50) NOT NULL,
  `konten_uji` varchar(100) NOT NULL,
  `tgl_pengujian` date NOT NULL,
  `tgl_insert` datetime NOT NULL,
  `keterangan` text NOT NULL,
  `semesterid` varchar(2) NOT NULL,
  `id_hafalan` int(11) DEFAULT NULL,
  `id_anak_postgree` varchar(50) DEFAULT NULL,
  `id_item_hafalan` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_anak`,`konten_uji`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_hafalan_temp`;
CREATE TABLE `ajis_hafalan_temp` (
  `id_hafalan_temp` varchar(100) NOT NULL,
  `id_anak` varchar(20) NOT NULL,
  `jenis` varchar(50) NOT NULL,
  `konten_uji` varchar(100) NOT NULL,
  `tgl_pengujian` date NOT NULL,
  `tgl_insert` datetime NOT NULL,
  `keterangan` text NOT NULL,
  `semesterid` varchar(2) NOT NULL,
  `nama_anak` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id_anak`,`konten_uji`,`id_hafalan_temp`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_harga`;
CREATE TABLE `ajis_harga` (
  `id_harga` int(11) NOT NULL AUTO_INCREMENT,
  `program_donasi` text DEFAULT NULL,
  `program` text DEFAULT NULL,
  `harga_program` double DEFAULT NULL,
  `harga_penyaluran` double DEFAULT NULL,
  `beasiswa` double DEFAULT NULL,
  `transport` double DEFAULT NULL,
  `frekuensi` int(11) DEFAULT NULL,
  `ceria` enum('y','n') DEFAULT NULL,
  `progid` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_harga`),
  KEY `id_harga` (`id_harga`,`progid`)
) ENGINE=MyISAM AUTO_INCREMENT=30 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_input_donasi`;
CREATE TABLE `ajis_input_donasi` (
  `id_input_donasi` int(11) NOT NULL AUTO_INCREMENT,
  `id_pemasangan_baru` varchar(100) NOT NULL,
  `tgl_transaksi` date NOT NULL,
  `id_anak` varchar(16) NOT NULL,
  `id_donatur` varchar(16) NOT NULL,
  `program_donasi` varchar(50) NOT NULL,
  `qty` int(11) NOT NULL,
  `pilihan_donasi` double NOT NULL,
  `nominal_donasi` double DEFAULT NULL,
  `bulan` varchar(20) NOT NULL,
  `tahun` varchar(5) NOT NULL,
  `user_insert` varchar(30) NOT NULL,
  `date_insert` datetime NOT NULL,
  `user_update` varchar(30) NOT NULL,
  `date_update` date NOT NULL,
  `transid` text NOT NULL,
  `detailid` int(11) NOT NULL,
  `kantor_id` varchar(50) NOT NULL,
  `id_wilayah_pembinaan` varchar(50) NOT NULL,
  `jenis` enum('trans','saldo') NOT NULL,
  `jenjang_pendidikan` varchar(50) NOT NULL,
  `jns_kel` varchar(50) NOT NULL,
  `asnaf` varchar(50) NOT NULL,
  `id_pemasangan` varchar(50) NOT NULL,
  `nik` text NOT NULL,
  `nama_anak` text NOT NULL,
  `nama_donatur` text NOT NULL,
  `nama_wilayah` text NOT NULL,
  `nama_kantor` text NOT NULL,
  `periode` varchar(10) NOT NULL,
  `id_program` varchar(100) NOT NULL,
  `via_input` varchar(100) NOT NULL,
  `jcustid` int(11) DEFAULT NULL,
  `id_pemasangan_new` varchar(100) NOT NULL,
  `id_transaksi_postgree` varchar(50) DEFAULT NULL,
  `id_pemasangan_postgree` varchar(100) DEFAULT NULL,
  `id_anak_postgree` varchar(100) DEFAULT NULL,
  `id_donatur_postgree` varchar(100) DEFAULT NULL,
  `id_program_postgree` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_input_donasi`),
  KEY `id_anak` (`id_anak`,`id_donatur`,`bulan`,`tahun`,`kantor_id`,`id_pemasangan_baru`,`id_wilayah_pembinaan`)
) ENGINE=InnoDB AUTO_INCREMENT=523749 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_input_donasi_bb`;
CREATE TABLE `ajis_input_donasi_bb` (
  `id_input_donasi` int(11) NOT NULL AUTO_INCREMENT,
  `tgl_transaksi` date NOT NULL,
  `id_anak` varchar(16) NOT NULL,
  `id_donatur` varchar(16) NOT NULL,
  `program_donasi` varchar(50) NOT NULL,
  `qty` int(11) NOT NULL,
  `pilihan_donasi` double NOT NULL,
  `nominal_donasi` double DEFAULT NULL,
  `bulan` varchar(20) NOT NULL,
  `tahun` varchar(5) NOT NULL,
  `user_insert` varchar(30) NOT NULL,
  `date_insert` datetime NOT NULL,
  `user_update` varchar(30) NOT NULL,
  `date_update` date NOT NULL,
  `transid` text NOT NULL,
  `detailid` int(11) NOT NULL,
  `kantor_id` varchar(50) NOT NULL,
  `id_wilayah_pembinaan` varchar(50) NOT NULL,
  `jenis` enum('trans','saldo') NOT NULL,
  `jenjang_pendidikan` varchar(50) NOT NULL,
  `jns_kel` varchar(50) NOT NULL,
  `asnaf` varchar(50) NOT NULL,
  `id_pemasangan` varchar(50) NOT NULL,
  `nik` text NOT NULL,
  `nama_anak` text NOT NULL,
  `nama_donatur` text NOT NULL,
  `nama_wilayah` text NOT NULL,
  `nama_kantor` text NOT NULL,
  `periode` varchar(10) NOT NULL,
  `id_program` varchar(100) NOT NULL,
  `id_pemasangan_baru` varchar(100) NOT NULL,
  `via_input` varchar(100) NOT NULL,
  `jcustid` int(11) DEFAULT NULL,
  `id_pemasangan_new` varchar(100) NOT NULL,
  `id_transaksi_postgree` varchar(50) DEFAULT NULL,
  `id_pemasangan_postgree` varchar(100) DEFAULT NULL,
  `id_anak_postgree` varchar(100) DEFAULT NULL,
  `id_donatur_postgree` varchar(100) DEFAULT NULL,
  `id_program_postgree` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_input_donasi`),
  KEY `id_anak` (`id_anak`,`id_donatur`,`bulan`,`tahun`,`kantor_id`,`id_pemasangan_baru`,`id_wilayah_pembinaan`)
) ENGINE=InnoDB AUTO_INCREMENT=419738 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_item_hafalan`;
CREATE TABLE `ajis_item_hafalan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `jenis` int(11) NOT NULL,
  `konten` varchar(100) CHARACTER SET utf8mb4 NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=139 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_item_penilaian`;
CREATE TABLE `ajis_item_penilaian` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_penilaian` text DEFAULT NULL,
  `parent_id` varchar(100) DEFAULT NULL,
  `is_parent` varchar(1) DEFAULT NULL,
  `jenis` varchar(100) DEFAULT NULL,
  `target` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_jabatan_sdm`;
CREATE TABLE `ajis_jabatan_sdm` (
  `id_wilayah_pembinaan` varchar(16) NOT NULL,
  `kantor_id` varchar(50) NOT NULL,
  `id_jabatan_sdm` int(16) NOT NULL AUTO_INCREMENT,
  `id_sdm` varchar(16) NOT NULL,
  `keaktifan_edukasi` enum('y','t') NOT NULL,
  `id_fungsi_struktur` varchar(16) NOT NULL,
  `user_insert` varchar(30) NOT NULL,
  `date_insert` date NOT NULL,
  `user_update` varchar(30) NOT NULL,
  `date_update` date NOT NULL,
  PRIMARY KEY (`id_jabatan_sdm`)
) ENGINE=MyISAM AUTO_INCREMENT=5286 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_kantor`;
CREATE TABLE `ajis_kantor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `oid` varchar(10) DEFAULT NULL,
  `kantor` varchar(30) DEFAULT NULL,
  `alamat` varchar(50) DEFAULT NULL,
  `no_telp` varchar(15) DEFAULT NULL,
  `oid_parent` varchar(10) DEFAULT NULL,
  `oid_parent_second` varchar(10) DEFAULT NULL,
  `oid_rz` text DEFAULT NULL,
  `jenis` varchar(50) DEFAULT NULL,
  `id_kantor_postgree` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `oid` (`oid`),
  KEY `kantor` (`kantor`),
  KEY `oid_parent` (`oid_parent`)
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_opname`;
CREATE TABLE `ajis_opname` (
  `tahun` year(4) NOT NULL,
  `id_anak` varchar(50) NOT NULL,
  `id_donatur` varchar(50) NOT NULL,
  `program_donasi` varchar(100) NOT NULL,
  `id_program` varchar(100) NOT NULL,
  `id_pemasangan_baru` varchar(100) NOT NULL,
  `saldo_awal_ganjil` int(11) NOT NULL,
  `tupo_jan_jun` varchar(100) NOT NULL,
  `date_opname_ganjil` datetime NOT NULL,
  `user_opname_ganjil` varchar(100) NOT NULL,
  `saldo_akhir_ganjil` int(11) NOT NULL,
  `saldo_awal_genap` int(11) NOT NULL,
  `tupo_jul_des` varchar(100) NOT NULL,
  `date_opname_genap` datetime NOT NULL,
  `user_opname_genap` varchar(100) NOT NULL,
  `saldo_akhir_genap` int(11) NOT NULL,
  `user_input` varchar(50) NOT NULL,
  `id_kantor` varchar(50) NOT NULL,
  `updated` datetime NOT NULL,
  `keterangan` text NOT NULL,
  `user_update` varchar(100) NOT NULL,
  `jcustid` int(11) NOT NULL,
  `id_pemasangan_new` varchar(50) NOT NULL,
  PRIMARY KEY (`tahun`,`id_anak`,`id_donatur`,`id_program`,`id_pemasangan_baru`),
  KEY `tahun` (`tahun`,`id_anak`,`id_donatur`,`id_pemasangan_baru`,`saldo_awal_ganjil`,`saldo_akhir_ganjil`,`saldo_awal_genap`,`saldo_akhir_genap`),
  KEY `id_pemasangan_baru` (`id_pemasangan_baru`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_opname_bb`;
CREATE TABLE `ajis_opname_bb` (
  `tahun` year(4) NOT NULL,
  `id_anak` varchar(50) NOT NULL,
  `id_donatur` varchar(50) NOT NULL,
  `program_donasi` varchar(100) NOT NULL,
  `id_program` varchar(100) NOT NULL,
  `id_pemasangan_baru` varchar(100) NOT NULL,
  `saldo_awal_ganjil` int(11) NOT NULL,
  `tupo_jan_jun` varchar(100) NOT NULL,
  `date_opname_ganjil` datetime NOT NULL,
  `user_opname_ganjil` varchar(100) NOT NULL,
  `saldo_akhir_ganjil` int(11) NOT NULL,
  `saldo_awal_genap` int(11) NOT NULL,
  `tupo_jul_des` varchar(100) NOT NULL,
  `date_opname_genap` datetime NOT NULL,
  `user_opname_genap` varchar(100) NOT NULL,
  `saldo_akhir_genap` int(11) NOT NULL,
  `user_input` varchar(50) NOT NULL,
  `id_kantor` varchar(50) NOT NULL,
  `updated` datetime NOT NULL,
  `keterangan` text NOT NULL,
  `user_update` varchar(100) NOT NULL,
  `jcustid` int(11) NOT NULL,
  `id_pemasangan_new` varchar(50) NOT NULL,
  PRIMARY KEY (`tahun`,`id_anak`,`id_donatur`,`id_program`,`id_pemasangan_baru`),
  KEY `tahun` (`tahun`,`id_anak`,`id_donatur`,`id_pemasangan_baru`,`saldo_awal_ganjil`,`saldo_akhir_ganjil`,`saldo_awal_genap`,`saldo_akhir_genap`),
  KEY `id_pemasangan_baru` (`id_pemasangan_baru`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_opname_bbx`;
CREATE TABLE `ajis_opname_bbx` (
  `tahun` year(4) NOT NULL,
  `id_pemasangan` varchar(50) NOT NULL,
  `id_anak` varchar(50) NOT NULL,
  `id_donatur` varchar(50) NOT NULL,
  `program_donasi` varchar(100) NOT NULL,
  `id_program` varchar(100) NOT NULL,
  `id_pemasangan_baru` varchar(100) NOT NULL,
  `saldo_awal_ganjil` double(20,2) NOT NULL,
  `tupo_jan_jun` varchar(100) NOT NULL,
  `date_opname_ganjil` datetime NOT NULL,
  `user_opname_ganjil` varchar(100) NOT NULL,
  `saldo_akhir_ganjil` double(20,2) NOT NULL,
  `saldo_awal_genap` double(20,2) NOT NULL,
  `tupo_jul_des` varchar(100) NOT NULL,
  `date_opname_genap` datetime NOT NULL,
  `user_opname_genap` varchar(100) NOT NULL,
  `saldo_akhir_genap` double(20,2) NOT NULL,
  `user_input` varchar(50) NOT NULL,
  `id_kantor` varchar(50) NOT NULL,
  `updated` datetime NOT NULL,
  `keterangan` text NOT NULL,
  PRIMARY KEY (`id_pemasangan`,`id_pemasangan_baru`),
  KEY `tahun` (`tahun`,`id_anak`,`id_donatur`,`id_pemasangan_baru`,`saldo_awal_ganjil`,`saldo_akhir_ganjil`,`saldo_awal_genap`,`saldo_akhir_genap`),
  KEY `id_pemasangan_baru` (`id_pemasangan_baru`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_pemasangan`;
CREATE TABLE `ajis_pemasangan` (
  `id_pemasangan_baru` varchar(100) NOT NULL,
  `tahun` char(4) NOT NULL,
  `tgl_pemasangan` date NOT NULL,
  `tgl_pemberhentian_pemasangan` date DEFAULT '0000-00-00',
  `id_donatur` varchar(30) NOT NULL,
  `id_anak` varchar(25) NOT NULL,
  `id_wilayah_pembinaan` varchar(50) NOT NULL,
  `kantor_id` varchar(50) NOT NULL,
  `program_donasi` varchar(50) NOT NULL,
  `id_program` int(11) NOT NULL,
  `harga_program` double NOT NULL,
  `harga_penyaluran` int(11) NOT NULL,
  `keterangan_pemberhentian` text NOT NULL,
  `status_pasangan` enum('y','n') NOT NULL,
  `saldo_awal` int(11) NOT NULL,
  `status_saldo` enum('n','y') NOT NULL,
  `program_sebelumnya` varchar(40) NOT NULL,
  `user_insert` varchar(30) NOT NULL,
  `date_insert` datetime NOT NULL,
  `user_update` varchar(30) NOT NULL,
  `date_update` datetime NOT NULL,
  `jns_kel` varchar(50) NOT NULL,
  `nama_anak` text NOT NULL,
  `kelas` varchar(50) NOT NULL,
  `nama_donatur` text NOT NULL,
  `nama_wilayah` text NOT NULL,
  `nama_kantor` text NOT NULL,
  `jenjang_pendidikan` text NOT NULL,
  `asnaf` text NOT NULL,
  `status_ortu` varchar(50) NOT NULL,
  `status_aj` varchar(50) NOT NULL,
  `id_sdm` varchar(50) NOT NULL,
  `nama_mentor` text DEFAULT NULL,
  `nik` text NOT NULL,
  `status_mentor` varchar(10) NOT NULL,
  `no_rekening` text NOT NULL,
  `cek` varchar(100) NOT NULL,
  `nia_rfo` varchar(50) NOT NULL,
  `nama_rfo` text NOT NULL,
  `tunda_penyaluran` varchar(50) NOT NULL,
  `id_naik_jenjang` varchar(100) NOT NULL,
  `via_input` varchar(50) NOT NULL,
  `history` varchar(1) NOT NULL,
  `user_stop` varchar(50) NOT NULL,
  `via_stop` varchar(50) NOT NULL,
  `alasan_aktif` varchar(50) DEFAULT NULL,
  `jcustid` int(11) NOT NULL,
  `id_pemasangan_new` varchar(50) NOT NULL,
  `id_anak_postgree` varchar(50) DEFAULT NULL,
  `id_program_postgree` varchar(50) DEFAULT NULL,
  `id_donatur_postgree` varchar(50) DEFAULT NULL,
  `id_peminjaman_postgree` varchar(50) DEFAULT NULL,
  `id_pinjam_postgree` varchar(50) DEFAULT NULL,
  `pinjam` text NOT NULL,
  `id_pemasangan_postgree` varchar(50) DEFAULT NULL,
  `id_donatur_erpwh` varchar(50) DEFAULT NULL,
  `id_zisco_resuser_erpwh` varchar(50) DEFAULT NULL,
  `id_anak_erpwh` varchar(50) DEFAULT NULL,
  `id_peminjaman_erpwh` varchar(50) DEFAULT NULL,
  `id_kantor_erpwh` varchar(50) DEFAULT NULL,
  `saldo_akhir` int(11) DEFAULT NULL,
  `status_saldo_akhir` varchar(10) DEFAULT NULL,
  `updated_saldo` datetime DEFAULT NULL,
  PRIMARY KEY (`id_donatur`,`id_anak`,`id_program`,`id_pemasangan_baru`,`tahun`),
  KEY `id_donatur` (`id_donatur`,`id_anak`),
  KEY `id_pemasangan_baru` (`id_pemasangan_baru`),
  KEY `kantor_id` (`kantor_id`),
  KEY `id_anak` (`id_anak`) USING BTREE,
  KEY `idx_status_pasangan` (`status_pasangan`),
  KEY `idx_tahun` (`tahun`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_pemasangan_bb`;
CREATE TABLE `ajis_pemasangan_bb` (
  `id_pemasangan_baru` varchar(100) NOT NULL,
  `tgl_pemasangan` date NOT NULL,
  `tgl_pemberhentian_pemasangan` date DEFAULT '0000-00-00',
  `id_donatur` varchar(16) NOT NULL,
  `id_anak` varchar(25) NOT NULL,
  `id_wilayah_pembinaan` varchar(50) NOT NULL,
  `kantor_id` varchar(50) NOT NULL,
  `program_donasi` varchar(50) NOT NULL,
  `id_program` int(11) NOT NULL,
  `harga_program` double NOT NULL,
  `harga_penyaluran` int(11) NOT NULL,
  `keterangan_pemberhentian` text NOT NULL,
  `status_pasangan` enum('y','n') NOT NULL,
  `saldo_awal` int(11) NOT NULL,
  `status_saldo` enum('n','y') NOT NULL,
  `program_sebelumnya` varchar(40) NOT NULL,
  `user_insert` varchar(30) NOT NULL,
  `date_insert` datetime NOT NULL,
  `user_update` varchar(30) NOT NULL,
  `date_update` datetime NOT NULL,
  `jns_kel` varchar(50) NOT NULL,
  `nama_anak` text NOT NULL,
  `kelas` varchar(50) NOT NULL,
  `nama_donatur` text NOT NULL,
  `nama_wilayah` text NOT NULL,
  `nama_kantor` text NOT NULL,
  `jenjang_pendidikan` text NOT NULL,
  `asnaf` text NOT NULL,
  `status_ortu` varchar(50) NOT NULL,
  `status_aj` varchar(50) NOT NULL,
  `id_sdm` varchar(50) NOT NULL,
  `nama_mentor` text DEFAULT NULL,
  `nik` text NOT NULL,
  `status_mentor` varchar(10) NOT NULL,
  `no_rekening` text NOT NULL,
  `cek` varchar(100) NOT NULL,
  `nia_rfo` varchar(50) NOT NULL,
  `nama_rfo` text NOT NULL,
  `tunda_penyaluran` varchar(50) NOT NULL,
  `id_naik_jenjang` varchar(100) NOT NULL,
  `tahun` char(4) NOT NULL,
  `via_input` varchar(50) NOT NULL,
  `history` varchar(1) NOT NULL,
  `user_stop` varchar(50) NOT NULL,
  `via_stop` varchar(50) NOT NULL,
  `alasan_aktif` varchar(50) DEFAULT NULL,
  `jcustid` int(11) NOT NULL,
  `id_pemasangan_new` varchar(50) NOT NULL,
  `id_anak_postgree` varchar(50) DEFAULT NULL,
  `id_program_postgree` varchar(50) DEFAULT NULL,
  `id_donatur_postgree` varchar(50) DEFAULT NULL,
  `id_peminjaman_postgree` varchar(50) DEFAULT NULL,
  `id_pinjam_postgree` varchar(50) DEFAULT NULL,
  `pinjam` text NOT NULL,
  `id_pemasangan_postgree` varchar(50) DEFAULT NULL,
  `id_donatur_erpwh` varchar(50) DEFAULT NULL,
  `id_zisco_resuser_erpwh` varchar(50) DEFAULT NULL,
  `id_anak_erpwh` varchar(50) DEFAULT NULL,
  `id_peminjaman_erpwh` varchar(50) DEFAULT NULL,
  `id_kantor_erpwh` varchar(50) DEFAULT NULL,
  `saldo_akhir` int(11) DEFAULT NULL,
  `status_saldo_akhir` varchar(10) DEFAULT NULL,
  `updated_saldo` datetime DEFAULT NULL,
  PRIMARY KEY (`id_donatur`,`id_anak`,`id_program`,`id_pemasangan_baru`,`tahun`),
  KEY `id_donatur` (`id_donatur`,`id_anak`),
  KEY `id_pemasangan_baru` (`id_pemasangan_baru`),
  KEY `kantor_id` (`kantor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_pemasangan_log`;
CREATE TABLE `ajis_pemasangan_log` (
  `id_log` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_pemasangan` int(11) NOT NULL,
  `tgl_pemasangan` date NOT NULL,
  `tgl_pemberhentian_pemasangan` date NOT NULL,
  `id_donatur` varchar(16) NOT NULL,
  `id_anak` varchar(25) NOT NULL,
  `id_wilayah_pembinaan` varchar(50) NOT NULL,
  `kantor_id` varchar(50) NOT NULL,
  `program_donasi` varchar(50) NOT NULL,
  `id_program` int(11) NOT NULL,
  `harga_program` double NOT NULL,
  `harga_penyaluran` int(11) NOT NULL,
  `keterangan_pemberhentian` text NOT NULL,
  `status_pasangan` enum('y','n') NOT NULL,
  `saldo_awal` int(11) NOT NULL,
  `status_saldo` enum('n','y') NOT NULL,
  `program_sebelumnya` varchar(40) NOT NULL,
  `user_insert` varchar(30) NOT NULL,
  `date_insert` datetime NOT NULL,
  `user_update` varchar(30) NOT NULL,
  `date_update` datetime NOT NULL,
  `jns_kel` varchar(50) NOT NULL,
  `nama_anak` text NOT NULL,
  `kelas` varchar(50) NOT NULL,
  `nama_donatur` text NOT NULL,
  `nama_wilayah` text NOT NULL,
  `nama_kantor` text NOT NULL,
  `jenjang_pendidikan` text NOT NULL,
  `asnaf` text NOT NULL,
  `status_ortu` varchar(50) NOT NULL,
  `status_aj` varchar(50) NOT NULL,
  `id_sdm` varchar(50) NOT NULL,
  `nama_mentor` text NOT NULL,
  `nik` text NOT NULL,
  `status_mentor` enum('n','y') NOT NULL,
  `no_rekening` text NOT NULL,
  `cek` varchar(100) NOT NULL,
  `nia_rfo` varchar(50) NOT NULL,
  `nama_rfo` text NOT NULL,
  `id_pemasangan_baru` varchar(100) NOT NULL,
  `updated` datetime NOT NULL,
  `deleted` datetime NOT NULL,
  PRIMARY KEY (`id_log`,`id_pemasangan`),
  KEY `id_donatur` (`id_donatur`,`id_anak`),
  KEY `id_pemasangan_baru` (`id_pemasangan_baru`),
  KEY `kantor_id` (`kantor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_pembinaan_baru`;
CREATE TABLE `ajis_pembinaan_baru` (
  `id_row` int(11) NOT NULL AUTO_INCREMENT,
  `id_pembinaan` varchar(100) NOT NULL,
  `tgl_pembinaan` date NOT NULL,
  `semesterid` varchar(2) NOT NULL,
  `bulan` varchar(2) NOT NULL,
  `tahun` varchar(4) NOT NULL,
  `jenis_pembinaan` text NOT NULL,
  `p3a` text NOT NULL,
  `judul_materi` text NOT NULL,
  `id_anak` varchar(16) NOT NULL,
  `kehadiran` varchar(15) NOT NULL,
  `keterangan` varchar(50) NOT NULL,
  `id_wilayah_pembinaan` varchar(16) NOT NULL,
  `user_insert` varchar(100) NOT NULL,
  `date_insert` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_update` varchar(100) NOT NULL,
  `date_update` date NOT NULL,
  `kantor_id` varchar(50) NOT NULL,
  `jns_kel` varchar(50) NOT NULL,
  `asnaf` varchar(50) NOT NULL,
  `nik` varchar(50) NOT NULL,
  `nama_lengkap` text NOT NULL,
  `jenjang_pendidikan` varchar(50) NOT NULL,
  `status_ortu` varchar(50) NOT NULL,
  `nama_lengkap_ayah` varchar(50) NOT NULL,
  `nama_lengkap_ibu` varchar(50) NOT NULL,
  `nama_lengkap_wali` varchar(50) NOT NULL,
  `nama_kantor` varchar(50) NOT NULL,
  `nama_wilayah` varchar(50) NOT NULL,
  `pemateri` text NOT NULL,
  `pemateri_personal` text NOT NULL,
  `ortu_hadir` varchar(50) NOT NULL,
  `id_donatur` varchar(50) NOT NULL,
  `nama_donatur` text NOT NULL,
  `program_donasi` varchar(50) NOT NULL,
  `tampil` enum('y','n') NOT NULL,
  `via_input` varchar(50) NOT NULL,
  `capaian_tilawah` varchar(50) NOT NULL,
  `capaian_tahfidz` varchar(50) NOT NULL,
  `capaian_tahfidz_hal` varchar(50) NOT NULL,
  `pembiasaan_shalat_wajib` int(11) NOT NULL,
  `pembiasaan_tilawah` int(11) NOT NULL,
  `pembiasaan_sedekah` int(11) NOT NULL,
  `membantu_ortu` int(11) NOT NULL,
  `id_anak_postgree` varchar(50) DEFAULT NULL,
  `id_pembinaan_postgree` varchar(50) DEFAULT NULL,
  `id_kantor_postgree` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_row`),
  KEY `id_pembinaan` (`id_pembinaan`),
  KEY `id_anak` (`id_anak`,`id_pembinaan`,`id_row`,`tgl_pembinaan`),
  KEY `tgl_pembinaan` (`tgl_pembinaan`),
  KEY `id_row` (`id_row`,`bulan`,`tahun`)
) ENGINE=MyISAM AUTO_INCREMENT=4479887 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_pembinaan_new`;
CREATE TABLE `ajis_pembinaan_new` (
  `id_row` int(11) NOT NULL AUTO_INCREMENT,
  `id_pembinaan` varchar(100) NOT NULL,
  `tgl_pembinaan` date NOT NULL,
  `semesterid` varchar(2) NOT NULL,
  `bulan` varchar(2) NOT NULL,
  `tahun` varchar(4) NOT NULL,
  `jenis_pembinaan` text NOT NULL,
  `p3a` text NOT NULL,
  `judul_materi` text NOT NULL,
  `id_anak` varchar(16) NOT NULL,
  `kehadiran` varchar(15) NOT NULL,
  `keterangan` varchar(50) NOT NULL,
  `id_wilayah_pembinaan` varchar(16) NOT NULL,
  `user_insert` varchar(100) NOT NULL,
  `date_insert` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_update` varchar(100) NOT NULL,
  `date_update` date NOT NULL,
  `kantor_id` varchar(50) NOT NULL,
  `jns_kel` varchar(50) NOT NULL,
  `asnaf` varchar(50) NOT NULL,
  `nik` varchar(50) NOT NULL,
  `nama_lengkap` text NOT NULL,
  `jenjang_pendidikan` varchar(50) NOT NULL,
  `status_ortu` varchar(50) NOT NULL,
  `nama_lengkap_ayah` varchar(50) NOT NULL,
  `nama_lengkap_ibu` varchar(50) NOT NULL,
  `nama_lengkap_wali` varchar(50) NOT NULL,
  `nama_kantor` varchar(50) NOT NULL,
  `nama_wilayah` varchar(50) NOT NULL,
  `pemateri` text NOT NULL,
  `pemateri_personal` text NOT NULL,
  `ortu_hadir` varchar(50) NOT NULL,
  `id_donatur` varchar(50) NOT NULL,
  `nama_donatur` text NOT NULL,
  `program_donasi` varchar(50) NOT NULL,
  `tampil` enum('y','n') NOT NULL,
  `via_input` varchar(50) NOT NULL,
  `capaian_tilawah` varchar(50) NOT NULL,
  `capaian_tahfidz` varchar(50) NOT NULL,
  `capaian_tahfidz_hal` varchar(50) NOT NULL,
  `pembiasaan_shalat_wajib` int(11) DEFAULT NULL,
  `pembiasaan_tilawah` int(11) DEFAULT NULL,
  `pembiasaan_sedekah` int(11) DEFAULT NULL,
  `membantu_ortu` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_row`),
  KEY `id_pembinaan` (`id_pembinaan`),
  KEY `id_anak` (`id_anak`,`id_pembinaan`,`id_row`,`tgl_pembinaan`),
  KEY `tgl_pembinaan` (`tgl_pembinaan`),
  KEY `id_row` (`id_row`,`bulan`,`tahun`)
) ENGINE=MyISAM AUTO_INCREMENT=108335 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_peminjam`;
CREATE TABLE `ajis_peminjam` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_peminjam` varchar(50) NOT NULL,
  `nama_lengkap` varchar(30) DEFAULT NULL,
  `jabatan` varchar(25) DEFAULT NULL,
  `kantor` varchar(25) DEFAULT NULL,
  `hp` varchar(15) DEFAULT NULL,
  `telp` varchar(15) DEFAULT NULL,
  `email` varchar(30) DEFAULT NULL,
  `user_insert` varchar(30) DEFAULT NULL,
  `date_insert` date DEFAULT NULL,
  `user_update` varchar(30) DEFAULT NULL,
  `date_update` date DEFAULT NULL,
  `id_user_erpwh` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`,`id_peminjam`),
  KEY `nama_lengkap` (`nama_lengkap`),
  KEY `id_peminjam` (`id_peminjam`)
) ENGINE=InnoDB AUTO_INCREMENT=251 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_peminjaman_anak`;
CREATE TABLE `ajis_peminjaman_anak` (
  `id_peminjaman` int(11) NOT NULL AUTO_INCREMENT,
  `id_wilayah_pembinaan` varchar(50) DEFAULT NULL,
  `kantor_id` varchar(50) DEFAULT NULL,
  `nama_kantor` text DEFAULT NULL,
  `nama_wilayah` text DEFAULT NULL,
  `nama_anak` text DEFAULT NULL,
  `jns_kel` varchar(50) DEFAULT NULL,
  `jenjang_pendidikan` varchar(50) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `nama_propinsi` text DEFAULT NULL,
  `nama_kabupaten` text DEFAULT NULL,
  `nama_kecamatan` text DEFAULT NULL,
  `nama_desa` text DEFAULT NULL,
  `foto` text DEFAULT NULL,
  `nama_peminjam` text DEFAULT NULL,
  `tgl_awal_peminjaman` date DEFAULT NULL,
  `tgl_selesai_peminjaman` date DEFAULT NULL,
  `id_peminjam` varchar(16) DEFAULT NULL,
  `id_anak` varchar(16) DEFAULT NULL,
  `status_pinjam` enum('y','n') DEFAULT NULL,
  `status_terpasangkan` enum('y','n') DEFAULT NULL,
  `tgl_expired` date DEFAULT NULL,
  `cancel` enum('y','n') DEFAULT NULL,
  `alasan_cancel` text DEFAULT NULL,
  `user_insert` varchar(30) DEFAULT NULL,
  `date_insert` date DEFAULT NULL,
  PRIMARY KEY (`id_peminjaman`),
  KEY `id_peminjaman` (`id_peminjaman`,`id_anak`,`kantor_id`,`id_wilayah_pembinaan`,`status_pinjam`)
) ENGINE=InnoDB AUTO_INCREMENT=39336 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_penilaian`;
CREATE TABLE `ajis_penilaian` (
  `id_anak` varchar(100) NOT NULL,
  `nama_anak` varchar(100) DEFAULT NULL,
  `nama_kantor` varchar(100) DEFAULT NULL,
  `nama_wilayah` varchar(100) DEFAULT NULL,
  `kantor_id` varchar(100) DEFAULT NULL,
  `id_wilayah_pembinaan` varchar(100) DEFAULT NULL,
  `tgl_insert` datetime DEFAULT NULL,
  `semesterid` varchar(4) NOT NULL,
  `kategori` varchar(100) DEFAULT NULL,
  `aspek` varchar(150) NOT NULL,
  `target` text DEFAULT NULL,
  `kondisi_awal` text DEFAULT NULL,
  `nilai_capaian` int(11) DEFAULT NULL,
  `perkembangan_capaian` text DEFAULT NULL,
  `skor` int(11) DEFAULT NULL,
  `hasil_akhir` varchar(100) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `via_input` varchar(20) DEFAULT NULL,
  `tampil` int(11) NOT NULL,
  `id_item_penilaian` int(11) NOT NULL,
  `id_anak_postgree` varchar(50) DEFAULT NULL,
  `id_kantor_postgree` varchar(50) DEFAULT NULL,
  `id_penilaian_postgree` varchar(50) DEFAULT NULL,
  `id_item_postgree` varchar(50) DEFAULT NULL,
  `id_kategori_postgree` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_anak`,`semesterid`,`aspek`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_penilaian_temp`;
CREATE TABLE `ajis_penilaian_temp` (
  `id_penilaian` varchar(100) NOT NULL,
  `id_anak` varchar(100) NOT NULL,
  `nama_anak` varchar(100) DEFAULT NULL,
  `nama_kantor` varchar(100) DEFAULT NULL,
  `nama_wilayah` varchar(100) DEFAULT NULL,
  `kantor_id` varchar(100) DEFAULT NULL,
  `id_wilayah_pembinaan` varchar(100) DEFAULT NULL,
  `tgl_insert` datetime DEFAULT NULL,
  `semesterid` varchar(4) NOT NULL,
  `kategori` varchar(100) DEFAULT NULL,
  `aspek` varchar(150) NOT NULL,
  `target` text DEFAULT NULL,
  `kondisi_awal` text DEFAULT NULL,
  `nilai_capaian` int(11) DEFAULT NULL,
  `perkembangan_capaian` text DEFAULT NULL,
  `skor` int(11) DEFAULT NULL,
  `hasil_akhir` varchar(100) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `via_input` varchar(20) DEFAULT NULL,
  `tampil` int(11) NOT NULL,
  `id_item_penilaian` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_penilaian`,`id_anak`,`semesterid`,`aspek`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_penyaluran`;
CREATE TABLE `ajis_penyaluran` (
  `id_row` int(11) NOT NULL AUTO_INCREMENT,
  `id_penyaluran` varchar(50) NOT NULL,
  `id_pemasangan_baru` varchar(100) DEFAULT NULL,
  `tgl_penyaluran` date DEFAULT NULL,
  `id_pemasangan` varchar(50) NOT NULL,
  `id_anak` varchar(16) DEFAULT NULL,
  `jenjang_pendidikan` varchar(50) DEFAULT NULL,
  `kelas` varchar(50) DEFAULT NULL,
  `id_donatur` varchar(16) DEFAULT NULL,
  `id_sdm` varchar(16) DEFAULT NULL,
  `id_wilayah_pembinaan` varchar(16) DEFAULT NULL,
  `id_kantor` varchar(6) DEFAULT NULL,
  `program_donasi` varchar(50) DEFAULT NULL,
  `nominal_penyaluran` double DEFAULT NULL,
  `nominal_hpp` double DEFAULT NULL,
  `user_insert` varchar(30) NOT NULL,
  `date_insert` datetime NOT NULL,
  `user_update` varchar(30) NOT NULL,
  `date_update` date NOT NULL,
  `bulan` varchar(50) DEFAULT NULL,
  `tahun` varchar(4) DEFAULT NULL,
  `transid` varchar(50) DEFAULT NULL,
  `detailid` varchar(50) NOT NULL,
  `id_input_donasi` varchar(50) DEFAULT NULL,
  `jenis` varchar(50) NOT NULL,
  `status_akhir` enum('n','y') NOT NULL,
  `jns_kel` varchar(50) DEFAULT NULL,
  `asnaf` varchar(50) DEFAULT NULL,
  `nama_anak` varchar(100) DEFAULT NULL,
  `nama_donatur` varchar(100) DEFAULT NULL,
  `nama_wilayah` varchar(50) DEFAULT NULL,
  `nama_kantor` varchar(50) DEFAULT NULL,
  `nama_sdm` text DEFAULT NULL,
  `no_rekening` text DEFAULT NULL,
  `saldo_akhir_ganjil` int(11) DEFAULT NULL,
  `nik` text DEFAULT NULL,
  `periode` varchar(10) DEFAULT NULL,
  `status_tersalurkan` enum('n','y') NOT NULL,
  `id_program` int(11) DEFAULT NULL,
  `via_input` enum('massal','single') NOT NULL,
  `alamat` text NOT NULL,
  `jcustid` int(11) DEFAULT NULL,
  `id_pemasangan_new` varchar(100) NOT NULL,
  `id_pemasangan_postgree` varchar(100) DEFAULT NULL,
  `id_kantor_postgree` varchar(100) DEFAULT NULL,
  `id_penyaluran_postgree` varchar(100) DEFAULT NULL,
  `pemilik_rekening` varchar(50) DEFAULT NULL,
  `tempat_lahir` varchar(50) DEFAULT NULL,
  `no_kartu_keluarga` varchar(50) DEFAULT NULL,
  `desaid` varchar(100) DEFAULT NULL,
  `nama_desa` varchar(100) DEFAULT NULL,
  `nama_kecamatan` varchar(100) DEFAULT NULL,
  `nama_kabupaten` varchar(100) DEFAULT NULL,
  `nama_propinsi` varchar(100) DEFAULT NULL,
  `nama_bank` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_row`,`id_penyaluran`),
  KEY `id_penyaluran` (`id_penyaluran`),
  KEY `tgl_penyaluran` (`tgl_penyaluran`,`id_anak`,`id_donatur`,`id_sdm`,`id_wilayah_pembinaan`,`id_kantor`,`bulan`,`tahun`),
  KEY `id_pemasangan` (`id_pemasangan`),
  KEY `id_pemasangan_baru` (`id_pemasangan_baru`),
  KEY `id_kantor` (`id_kantor`)
) ENGINE=MyISAM AUTO_INCREMENT=190781 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_penyaluran_temp`;
CREATE TABLE `ajis_penyaluran_temp` (
  `id_row` int(11) NOT NULL AUTO_INCREMENT,
  `id_penyaluran` varchar(50) NOT NULL,
  `tgl_penyaluran` date NOT NULL,
  `id_anak` varchar(16) NOT NULL,
  `jenjang_pendidikan` varchar(50) NOT NULL,
  `id_donatur` varchar(16) NOT NULL,
  `id_sdm` varchar(16) NOT NULL,
  `id_wilayah_pembinaan` varchar(16) NOT NULL,
  `id_kantor` varchar(6) NOT NULL,
  `program_donasi` varchar(50) NOT NULL,
  `nominal_penyaluran` double NOT NULL,
  `nominal_hpp` double NOT NULL,
  `user_insert` varchar(30) NOT NULL,
  `date_insert` datetime NOT NULL,
  `user_update` varchar(30) NOT NULL,
  `date_update` date NOT NULL,
  `bulan` varchar(50) NOT NULL,
  `tahun` varchar(4) NOT NULL,
  `transid` varchar(50) NOT NULL,
  `detailid` varchar(50) NOT NULL,
  `id_input_donasi` varchar(50) NOT NULL,
  `jenis` varchar(50) NOT NULL,
  `status_akhir` enum('n','y') NOT NULL,
  `jns_kel` varchar(50) NOT NULL,
  `asnaf` varchar(50) NOT NULL,
  PRIMARY KEY (`id_row`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_periode_penilaian`;
CREATE TABLE `ajis_periode_penilaian` (
  `id_periode_penilaian` int(11) NOT NULL AUTO_INCREMENT,
  `periode_penilaian` varchar(30) DEFAULT NULL,
  `tgl_awal` date DEFAULT NULL,
  `tgl_akhir` date DEFAULT NULL,
  `aktif` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`id_periode_penilaian`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_propinsi`;
CREATE TABLE `ajis_propinsi` (
  `propid` varchar(4) NOT NULL DEFAULT '0',
  `propinsi` varchar(50) DEFAULT NULL,
  `ibukota` varchar(50) DEFAULT NULL,
  `aktif` enum('y','n') DEFAULT 'y',
  PRIMARY KEY (`propid`),
  UNIQUE KEY `pid` (`propid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_sdm_wilayah`;
CREATE TABLE `ajis_sdm_wilayah` (
  `id_sdm` int(16) NOT NULL AUTO_INCREMENT,
  `nik` varchar(50) DEFAULT NULL,
  `nama_lengkap` varchar(30) DEFAULT NULL,
  `jenis_kelamin` enum('l','p') DEFAULT NULL,
  `alamat` varchar(50) DEFAULT NULL,
  `propid` varchar(15) DEFAULT NULL,
  `nama_propinsi` varchar(40) DEFAULT NULL,
  `kabid` varchar(15) DEFAULT NULL,
  `nama_kabupaten` varchar(40) DEFAULT NULL,
  `camatid` varchar(15) DEFAULT NULL,
  `nama_kecamatan` varchar(40) DEFAULT NULL,
  `desaid` varchar(15) DEFAULT NULL,
  `nama_desa` varchar(40) DEFAULT NULL,
  `jenjang_pendidikan` varchar(5) DEFAULT NULL,
  `tgl_bergabung` date DEFAULT NULL,
  `tgl_keluar` date DEFAULT NULL,
  `telp` varchar(15) DEFAULT NULL,
  `hp` varchar(15) DEFAULT NULL,
  `email` varchar(30) DEFAULT NULL,
  `keterangan` varchar(50) DEFAULT NULL,
  `keaktifan_edukasi` enum('y','t') DEFAULT NULL,
  `foto` varchar(100) DEFAULT NULL,
  `aktif` varchar(10) DEFAULT NULL,
  `user_insert` varchar(30) DEFAULT NULL,
  `date_insert` date DEFAULT NULL,
  `user_update` varchar(30) DEFAULT NULL,
  `date_update` date DEFAULT NULL,
  PRIMARY KEY (`id_sdm`),
  UNIQUE KEY `nik` (`nik`),
  KEY `id_sdm` (`id_sdm`)
) ENGINE=MyISAM AUTO_INCREMENT=2463 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_semester`;
CREATE TABLE `ajis_semester` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `semesterid` varchar(50) DEFAULT NULL,
  `semester` varchar(100) DEFAULT NULL,
  `tgl_awal` date DEFAULT NULL,
  `tgl_akhir` date DEFAULT NULL,
  `onprogress` enum('n','y') DEFAULT NULL,
  `cover` text NOT NULL,
  `cover_siswa` text NOT NULL,
  `kata_pengantar` text DEFAULT NULL,
  `profil` text DEFAULT NULL,
  `kotak_profil_ceria` text DEFAULT NULL,
  `kotak_pembinaan_ceria` text DEFAULT NULL,
  `kotak_profil_siswa` text DEFAULT NULL,
  `kotak_pembinaan_siswa` text DEFAULT NULL,
  `keuangan` text DEFAULT NULL,
  `surat` text DEFAULT NULL,
  `bawah` text DEFAULT NULL,
  `kata_pengantar_siswa` text DEFAULT NULL,
  `bawah_siswa` text DEFAULT NULL,
  `tgl_awal_donasi` date DEFAULT NULL,
  `tgl_akhir_donasi` date DEFAULT NULL,
  `tgl_awal_saldo` date DEFAULT NULL,
  `tgl_akhir_saldo` date DEFAULT NULL,
  `jenis` varchar(50) DEFAULT NULL,
  `tahun` varchar(50) DEFAULT NULL,
  `lapsem` varchar(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `semesterid` (`semesterid`,`semester`),
  KEY `tgl_awal` (`tgl_awal`,`tgl_akhir`)
) ENGINE=MyISAM AUTO_INCREMENT=227 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_survey`;
CREATE TABLE `ajis_survey` (
  `id_survey` int(16) NOT NULL AUTO_INCREMENT,
  `tgl_survey` date DEFAULT NULL,
  `petugas_survey` varchar(30) DEFAULT NULL,
  `id_anak` varchar(16) NOT NULL,
  `nama_lengkap` text DEFAULT NULL,
  `nama_lengkap_ayah` text DEFAULT NULL,
  `nama_lengkap_ibu` text DEFAULT NULL,
  `nama_lengkap_wali` text DEFAULT NULL,
  `nama_kantor` text DEFAULT NULL,
  `nama_wilayah` text DEFAULT NULL,
  `asnaf` varchar(50) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `kantor_id` varchar(50) DEFAULT NULL,
  `id_wilayah_pembinaan` varchar(50) DEFAULT NULL,
  `jns_kel` varchar(50) DEFAULT NULL,
  `jenjang_pendidikan` text DEFAULT NULL,
  `tgl_pengajuan` date DEFAULT NULL,
  `status_anak` varchar(10) DEFAULT NULL,
  `hasil_kesimpulan_survey` varchar(100) DEFAULT NULL,
  `user_insert` varchar(30) DEFAULT NULL,
  `date_insert` date DEFAULT NULL,
  `user_update` varchar(30) DEFAULT NULL,
  `date_update` date DEFAULT NULL,
  `kepemilikan_tanah` varchar(100) DEFAULT NULL,
  `kepemilikan_rumah` text DEFAULT NULL,
  `kondisi_dinding_rumah` text DEFAULT NULL,
  `kondisi_lantai_rumah` text DEFAULT NULL,
  `kepemilikan_kendaraan` text DEFAULT NULL,
  `kepemilikan_barang_elektronik` text DEFAULT NULL,
  `pekerjaan_kepala_keluarga` text DEFAULT NULL,
  `rata_rata_penghasilan_perbulan` varchar(100) DEFAULT NULL,
  `kepemilikan_tabungan` text DEFAULT NULL,
  `makan_2x` varchar(100) DEFAULT NULL,
  `nama_kepala_keluarga` text DEFAULT NULL,
  `pendidikan_terakhir_kepala_keluarga` text DEFAULT NULL,
  `jml_tanggungan_kepala_keluarga` varchar(4) DEFAULT NULL,
  `sumber_air_bersih` text DEFAULT NULL,
  `jamban_dan_saluran_limbah` text DEFAULT NULL,
  `tempat_pembuangan_sampah` text DEFAULT NULL,
  `terdapat_perokok` varchar(100) DEFAULT NULL,
  `terdapat_konsumen_miras` varchar(100) DEFAULT NULL,
  `terdapat_persediaan_obat_p3k` varchar(100) DEFAULT NULL,
  `makan_buah_dan_sayur_tiap_hari` varchar(100) DEFAULT NULL,
  `shalat_5_waktu` text DEFAULT NULL,
  `membaca_alquran` text DEFAULT NULL,
  `majelis_taklim` text DEFAULT NULL,
  `membaca_koran` text DEFAULT NULL,
  `aktif_sebagai_pengurus_organisasi` text DEFAULT NULL,
  `asnaf_anak` enum('yatim','piatu','dhuafa') NOT NULL,
  `biaya_pendidikan_spp_perbulan` double NOT NULL,
  `bantuan_rutin_dari_lembaga_lain` enum('tidak','ada') NOT NULL,
  `jml_bantuan_rutin_dari_lembaga_lain` double DEFAULT NULL,
  `resume_deskriptif` text DEFAULT NULL,
  `nama_kecamatan` varchar(30) NOT NULL,
  `nama_desa` varchar(30) NOT NULL,
  `nama_propinsi` varchar(30) NOT NULL,
  `nama_kabupaten` varchar(30) NOT NULL,
  `id_anak_odoo` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_survey`,`id_anak`),
  KEY `nama_lengkap` (`nama_lengkap`(1)),
  KEY `id_anak` (`id_anak`,`kantor_id`,`id_wilayah_pembinaan`)
) ENGINE=InnoDB AUTO_INCREMENT=62117 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_user`;
CREATE TABLE `ajis_user` (
  `id_user` int(11) NOT NULL AUTO_INCREMENT,
  `username` text DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `nik` int(13) DEFAULT NULL,
  `id_kantor` varchar(10) DEFAULT NULL,
  `nama_kantor` varchar(30) DEFAULT NULL,
  `nama_wilayah` varchar(50) DEFAULT NULL,
  `aktif` enum('y','n') DEFAULT NULL,
  `user_insert` varchar(50) DEFAULT NULL,
  `date_insert` datetime DEFAULT NULL,
  `id_group_user` int(11) DEFAULT NULL,
  `id_wilayah_pembinaan` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_user`)
) ENGINE=MyISAM AUTO_INCREMENT=541 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_user_akses`;
CREATE TABLE `ajis_user_akses` (
  `userid` int(11) NOT NULL DEFAULT 0,
  `levelid` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`userid`,`levelid`),
  KEY `fk_level` (`levelid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_view_ajuan`;
CREATE TABLE `ajis_view_ajuan` (
  `id_ajuan` int(11) NOT NULL AUTO_INCREMENT,
  `tgl_ajuan` date NOT NULL,
  `nama_kantor` varchar(40) NOT NULL,
  `id_wilayah_pembinaan` varchar(50) NOT NULL,
  `nama_wilayah` varchar(200) NOT NULL,
  `id_donatur` varchar(20) NOT NULL,
  `oid_donatur` varchar(50) NOT NULL,
  `kantor_donatur` varchar(50) NOT NULL,
  `id_kantor` varchar(10) NOT NULL,
  `nama_donatur` varchar(200) NOT NULL,
  `jenis_kelamin_donatur` varchar(50) NOT NULL,
  `program_donasi` varchar(80) NOT NULL,
  `nia_rfo` varchar(30) NOT NULL,
  `nama_rfo` varchar(80) NOT NULL,
  `id_anak` varchar(30) NOT NULL,
  `nama_anak_asal` varchar(200) NOT NULL,
  `jns_kelamin` varchar(10) NOT NULL,
  `alasan_pergantian` varchar(200) NOT NULL,
  `id_anak_pengganti` varchar(50) NOT NULL,
  `nama_anak_pengganti` varchar(200) NOT NULL,
  `keterangan` varchar(200) NOT NULL,
  `tipe_ganti` varchar(20) NOT NULL,
  `pindah_saldo` int(11) NOT NULL,
  `approve_funding` enum('t','n','y') NOT NULL,
  `status_eksekusi` enum('','y','n') NOT NULL,
  `tgl_eksekusi` date DEFAULT NULL,
  `tgl_approve_funding` datetime NOT NULL,
  `jcustid` varchar(50) NOT NULL,
  `jenis_donatur` varchar(100) NOT NULL,
  `hp` varchar(50) NOT NULL,
  `alasan_reject` text NOT NULL,
  `id_pemasangan_baru` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_ajuan`)
) ENGINE=InnoDB AUTO_INCREMENT=10180 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_wilayah_pembinaan`;
CREATE TABLE `ajis_wilayah_pembinaan` (
  `id_wilayah_pembinaan` int(16) NOT NULL AUTO_INCREMENT,
  `nama_wilayah` varchar(100) NOT NULL,
  `alamat_wilayah` text DEFAULT NULL,
  `kantor_id` varchar(16) DEFAULT NULL,
  `nama_kantor` varchar(30) DEFAULT NULL,
  `status_approve` enum('y','t') DEFAULT NULL,
  `propid` int(11) DEFAULT NULL,
  `nama_propinsi` varchar(30) DEFAULT NULL,
  `kabid` int(11) DEFAULT NULL,
  `nama_kabupaten` varchar(30) DEFAULT NULL,
  `camatid` int(11) DEFAULT NULL,
  `nama_kecamatan` varchar(30) DEFAULT NULL,
  `desaid` int(11) DEFAULT NULL,
  `nama_desa` varchar(30) DEFAULT NULL,
  `aktif` enum('y','n') DEFAULT 'y',
  `user_insert` varchar(30) DEFAULT NULL,
  `date_insert` date DEFAULT NULL,
  `user_update` varchar(30) DEFAULT NULL,
  `date_update` date DEFAULT NULL,
  PRIMARY KEY (`id_wilayah_pembinaan`,`nama_wilayah`),
  UNIQUE KEY `nama_wilayah` (`nama_wilayah`)
) ENGINE=InnoDB AUTO_INCREMENT=652 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ajis_wilayah_pembinaan_new`;
CREATE TABLE `ajis_wilayah_pembinaan_new` (
  `id_wilayah_pembinaan` int(16) NOT NULL AUTO_INCREMENT,
  `nama_wilayah` varchar(100) NOT NULL,
  `alamat_wilayah` text DEFAULT NULL,
  `kantor_id` varchar(16) DEFAULT NULL,
  `nama_kantor` varchar(30) DEFAULT NULL,
  `status_approve` enum('y','t') DEFAULT NULL,
  `propid` int(11) DEFAULT NULL,
  `nama_propinsi` varchar(30) DEFAULT NULL,
  `kabid` int(11) DEFAULT NULL,
  `nama_kabupaten` varchar(30) DEFAULT NULL,
  `camatid` int(11) DEFAULT NULL,
  `nama_kecamatan` varchar(30) DEFAULT NULL,
  `desaid` int(11) DEFAULT NULL,
  `nama_desa` varchar(30) DEFAULT NULL,
  `aktif` enum('y','n') DEFAULT 'y',
  `user_insert` varchar(30) DEFAULT NULL,
  `date_insert` date DEFAULT NULL,
  `user_update` varchar(30) DEFAULT NULL,
  `date_update` date DEFAULT NULL,
  PRIMARY KEY (`id_wilayah_pembinaan`,`nama_wilayah`),
  UNIQUE KEY `nama_wilayah` (`nama_wilayah`)
) ENGINE=InnoDB AUTO_INCREMENT=508 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `bank`;
CREATE TABLE `bank` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_bank` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `corez_campaign`;
CREATE TABLE `corez_campaign` (
  `id_campaign` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(100) NOT NULL,
  `id_program` int(11) NOT NULL,
  `program` varchar(100) NOT NULL,
  `nominal_default` double(12,2) NOT NULL,
  `nominal_min` double(12,2) NOT NULL,
  `nominal_max` double(12,2) NOT NULL,
  `nominal_editable` int(11) NOT NULL,
  `nominal_option` int(11) NOT NULL,
  `nominal_target` double(12,2) NOT NULL,
  `nominal_funded` double(12,2) NOT NULL,
  `id_campaign_parent` int(11) NOT NULL,
  `image` text NOT NULL,
  `description` text NOT NULL,
  `sort` int(11) NOT NULL,
  `top` int(11) NOT NULL,
  `show` int(11) NOT NULL,
  `quantity_option` int(11) NOT NULL,
  `note` text NOT NULL,
  `dtu` datetime NOT NULL DEFAULT current_timestamp(),
  `mode` text NOT NULL,
  `coa_privilege` text NOT NULL,
  `expired_date` date NOT NULL,
  `first_show` varchar(100) NOT NULL,
  `active` int(11) NOT NULL,
  PRIMARY KEY (`id_campaign`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `corez_payment`;
CREATE TABLE `corez_payment` (
  `id` int(11) NOT NULL,
  `is_parent` int(11) NOT NULL,
  `payment_methods` varchar(100) NOT NULL,
  `account_number` varchar(100) NOT NULL,
  `account_name` varchar(100) NOT NULL,
  `account_alias` varchar(100) NOT NULL,
  `title` varchar(100) NOT NULL,
  `id_parent` int(11) NOT NULL,
  `image` text NOT NULL,
  `url` text NOT NULL,
  `show` int(11) NOT NULL,
  `active` int(11) NOT NULL,
  `dtu` datetime NOT NULL DEFAULT current_timestamp(),
  `coa` text NOT NULL,
  `recurring` varchar(100) NOT NULL,
  `credential` text NOT NULL,
  `sort` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `distribution`;
CREATE TABLE `distribution` (
  `id_row` int(11) NOT NULL AUTO_INCREMENT,
  `id_penyaluran` varchar(50) NOT NULL,
  `tgl_penyaluran` date NOT NULL,
  `id_pemasangan` varchar(50) NOT NULL,
  `id_anak` varchar(16) NOT NULL,
  `jenjang_pendidikan` varchar(50) NOT NULL,
  `kelas` varchar(50) NOT NULL,
  `id_donatur` varchar(16) NOT NULL,
  `id_sdm` varchar(16) NOT NULL,
  `id_wilayah_pembinaan` varchar(16) NOT NULL,
  `id_kantor` varchar(6) NOT NULL,
  `program_donasi` varchar(50) NOT NULL,
  `nominal_penyaluran` double NOT NULL,
  `nominal_hpp` double NOT NULL,
  `user_insert` varchar(30) NOT NULL,
  `date_insert` datetime NOT NULL,
  `user_update` varchar(30) NOT NULL,
  `date_update` date NOT NULL,
  `bulan` varchar(50) NOT NULL,
  `tahun` varchar(4) NOT NULL,
  `transid` varchar(50) NOT NULL,
  `detailid` varchar(50) NOT NULL,
  `id_input_donasi` varchar(50) NOT NULL,
  `jenis` varchar(50) NOT NULL,
  `status_akhir` enum('n','y') NOT NULL,
  `jns_kel` varchar(50) NOT NULL,
  `asnaf` varchar(50) NOT NULL,
  `nama_anak` varchar(100) NOT NULL,
  `nama_donatur` varchar(100) NOT NULL,
  `nama_wilayah` varchar(50) NOT NULL,
  `nama_kantor` varchar(50) NOT NULL,
  `nama_sdm` text NOT NULL,
  `no_rekening` text DEFAULT NULL,
  `saldo_akhir_ganjil` int(11) DEFAULT NULL,
  `nik` text DEFAULT NULL,
  `periode` varchar(10) NOT NULL,
  PRIMARY KEY (`id_row`,`id_penyaluran`),
  KEY `id_penyaluran` (`id_penyaluran`),
  KEY `tgl_penyaluran` (`tgl_penyaluran`,`id_anak`,`id_donatur`,`id_sdm`,`id_wilayah_pembinaan`,`id_kantor`,`bulan`,`tahun`),
  KEY `id_pemasangan` (`id_pemasangan`)
) ENGINE=MyISAM AUTO_INCREMENT=190780 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `donatur`;
CREATE TABLE `donatur` (
  `did` varchar(30) NOT NULL,
  `nama_lengkap` varchar(50) NOT NULL,
  `nama_publikasi` varchar(50) NOT NULL,
  `tgl_lahir` date NOT NULL,
  `alamat_lengkap` text NOT NULL,
  `alamat_silaturahmi` text NOT NULL,
  `camatid` varchar(10) NOT NULL,
  `kabid` varchar(10) NOT NULL,
  `propid` varchar(10) NOT NULL,
  `jcustid` tinyint(1) NOT NULL,
  `status` enum('d','oc','upz','m','doc','dupz','dm','ocm','upzm','docm','dupzm') NOT NULL,
  `tgl_registrasi` date NOT NULL,
  `aktif` enum('y','n','p') NOT NULL,
  `kirim_sms` enum('y','n') NOT NULL,
  `telp` varchar(30) NOT NULL,
  `fax` varchar(15) NOT NULL,
  `hp` varchar(30) NOT NULL,
  `email` varchar(100) NOT NULL,
  `website` varchar(50) NOT NULL,
  `verifikasi1` tinyint(1) NOT NULL,
  `verifikasi2` tinyint(1) NOT NULL,
  `jenis_kelamin` enum('l','p','t') NOT NULL,
  `kecamatan_domisili` varchar(50) NOT NULL,
  `camatid_silaturahmi` varchar(10) NOT NULL,
  `kecamatan_silaturahmi` varchar(100) NOT NULL,
  `nama_kontak` varchar(50) NOT NULL,
  `telp_kontak` varchar(30) NOT NULL,
  `email_kontak` varchar(100) NOT NULL,
  `jabatan_kontak` varchar(50) NOT NULL,
  `nama_bank` varchar(50) NOT NULL,
  `no_rek` varchar(20) NOT NULL,
  `omid_donatur` varchar(10) NOT NULL,
  `oid_donatur` varchar(10) NOT NULL,
  `kantor_donatur` varchar(50) NOT NULL,
  `nia_rfo` varchar(15) NOT NULL,
  `nama_rfo` varchar(50) DEFAULT NULL,
  `user_name` varchar(50) NOT NULL,
  `tipe_pelayanan` varchar(30) NOT NULL,
  `user_insert` varchar(50) NOT NULL,
  `periode_rutinitas_transaksiid` int(1) NOT NULL,
  `sumber_informasi` text NOT NULL,
  `jalur_komunikasi` text NOT NULL,
  `user_update` varchar(50) NOT NULL,
  `tgl_update` date NOT NULL,
  `tag` varchar(100) NOT NULL,
  `npwp` varchar(30) NOT NULL,
  `cat1` varchar(30) NOT NULL,
  `cat2` varchar(30) NOT NULL,
  `updated` datetime NOT NULL,
  `id_donatur_postgree` varchar(100) DEFAULT NULL,
  `id_erp_wh` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`did`),
  KEY `nama_lengkap` (`nama_lengkap`,`tgl_lahir`,`camatid`,`jcustid`),
  KEY `did` (`did`),
  KEY `idx_nia_rfo` (`nia_rfo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `donatur_20190326`;
CREATE TABLE `donatur_20190326` (
  `did` varchar(15) NOT NULL,
  `nama_lengkap` varchar(50) NOT NULL,
  `nama_publikasi` varchar(50) NOT NULL,
  `tgl_lahir` date NOT NULL,
  `alamat_lengkap` text NOT NULL,
  `alamat_silaturahmi` text NOT NULL,
  `camatid` varchar(10) NOT NULL,
  `kabid` varchar(10) NOT NULL,
  `propid` varchar(10) NOT NULL,
  `jcustid` tinyint(1) NOT NULL,
  `status` enum('d','oc','upz','m','doc','dupz','dm','ocm','upzm','docm','dupzm') NOT NULL,
  `tgl_registrasi` date NOT NULL,
  `aktif` enum('y','n','p') NOT NULL,
  `kirim_sms` enum('y','n') NOT NULL,
  `telp` varchar(30) NOT NULL,
  `fax` varchar(15) NOT NULL,
  `hp` varchar(30) NOT NULL,
  `email` varchar(100) NOT NULL,
  `website` varchar(50) NOT NULL,
  `verifikasi1` tinyint(1) NOT NULL,
  `verifikasi2` tinyint(1) NOT NULL,
  `jenis_kelamin` enum('l','p','t') NOT NULL,
  `kecamatan_domisili` varchar(50) NOT NULL,
  `camatid_silaturahmi` varchar(10) NOT NULL,
  `kecamatan_silaturahmi` varchar(100) NOT NULL,
  `nama_kontak` varchar(50) NOT NULL,
  `telp_kontak` varchar(30) NOT NULL,
  `email_kontak` varchar(100) NOT NULL,
  `jabatan_kontak` varchar(50) NOT NULL,
  `nama_bank` varchar(50) NOT NULL,
  `no_rek` varchar(20) NOT NULL,
  `omid_donatur` varchar(10) NOT NULL,
  `oid_donatur` varchar(10) NOT NULL,
  `kantor_donatur` varchar(50) NOT NULL,
  `nia_rfo` varchar(15) NOT NULL,
  `nama_rfo` varchar(50) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `tipe_pelayanan` varchar(30) NOT NULL,
  `user_insert` varchar(50) NOT NULL,
  `periode_rutinitas_transaksiid` int(1) NOT NULL,
  `sumber_informasi` text NOT NULL,
  `jalur_komunikasi` text NOT NULL,
  `user_update` varchar(50) NOT NULL,
  `tgl_update` date NOT NULL,
  `tag` varchar(100) NOT NULL,
  `npwp` varchar(30) NOT NULL,
  `cat1` varchar(30) NOT NULL,
  `cat2` varchar(30) NOT NULL,
  `updated` datetime NOT NULL,
  PRIMARY KEY (`did`),
  KEY `nama_lengkap` (`nama_lengkap`,`tgl_lahir`,`camatid`,`jcustid`),
  KEY `did` (`did`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `donatur_rfo_temp`;
CREATE TABLE `donatur_rfo_temp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nia_rfo` varchar(50) NOT NULL,
  `nama_rfo` varchar(100) NOT NULL,
  `id_donatur` varchar(50) NOT NULL,
  `user_insert` varchar(50) DEFAULT NULL,
  `date_insert` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1023 DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `hcm_kantor`;
CREATE TABLE `hcm_kantor` (
  `id_kantor` varchar(6) NOT NULL,
  `kantor` varchar(100) DEFAULT NULL,
  `alamat` varchar(100) DEFAULT NULL,
  `kota` varchar(50) DEFAULT NULL,
  `kode_pos` varchar(10) DEFAULT NULL,
  `telpon` varchar(30) DEFAULT NULL,
  `fax` varchar(30) DEFAULT NULL,
  `aktif` enum('y','n') DEFAULT 'y',
  `id_kantor_parent` varchar(4) DEFAULT NULL,
  `id_kantor_level` tinyint(1) DEFAULT NULL,
  `id_kantorold` varchar(10) DEFAULT NULL,
  `coa` varchar(15) DEFAULT NULL,
  `coa_outlet` varchar(15) DEFAULT NULL,
  `kantorid` int(3) DEFAULT NULL,
  PRIMARY KEY (`id_kantor`),
  KEY `kantor` (`kantor`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `kantor`;
CREATE TABLE `kantor` (
  `oid` varchar(6) NOT NULL,
  `kantor` varchar(50) DEFAULT NULL,
  `alamat` varchar(100) DEFAULT NULL,
  `oid_parent` varchar(6) DEFAULT NULL,
  `level` int(1) DEFAULT NULL,
  `aktif` enum('y','n') DEFAULT NULL,
  `id_office` varchar(50) DEFAULT NULL,
  `id_kantor` int(11) NOT NULL,
  `omid` varchar(20) NOT NULL,
  `id_kantor_postgree` int(11) NOT NULL,
  PRIMARY KEY (`oid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `manual_laporan`;
CREATE TABLE `manual_laporan` (
  `laporanid` varchar(50) NOT NULL,
  `donatur_id` varchar(50) NOT NULL,
  `donatur_nama` text NOT NULL,
  `donatur_alamat` text NOT NULL,
  `pm_nama_lengkap` text NOT NULL,
  `jns_kel` varchar(50) NOT NULL,
  `pm_tempat_lahir` varchar(100) NOT NULL,
  `pm_tgl_lahir` date NOT NULL,
  `pm_anak_ke` tinyint(4) NOT NULL,
  `pm_saudara` tinyint(4) NOT NULL,
  `pm_nama_orang_tua` text NOT NULL,
  `pm_pekerjaan` text NOT NULL,
  `pm_anak_nama_sekolah` text NOT NULL,
  `pm_anak_alamat_sekolah` text NOT NULL,
  `pm_anak_kelas` varchar(5) NOT NULL,
  `pm_anak_jenjang` varchar(5) NOT NULL,
  `pm_mhs_institusi` varchar(100) NOT NULL,
  `pm_mhs_prodi` varchar(100) NOT NULL,
  `pm_mhs_semester` tinyint(4) NOT NULL,
  `pm_mhs_jurusan` varchar(100) NOT NULL,
  `pembinaan_wilayah` text NOT NULL,
  `pembinaan_alamat` text NOT NULL,
  `pembinaan_jml_anak` varchar(4) DEFAULT NULL,
  `pembinaan_jenjang` varchar(5) NOT NULL,
  `pembinaan_perkembangan` text NOT NULL,
  `pembinaan_prestasi` text NOT NULL,
  `dana_saldo_awal` double(20,2) NOT NULL,
  `dana_penerimaan` double(20,2) NOT NULL,
  `dana_penyaluran` double(20,2) NOT NULL,
  `tgl_update_keuangan` datetime DEFAULT NULL,
  `programid` tinyint(4) NOT NULL,
  `semesterid` varchar(5) NOT NULL,
  `jenis` varchar(10) NOT NULL,
  `tahun` varchar(4) NOT NULL,
  `id_pemasangan_baru` varchar(100) NOT NULL,
  `id_naik_jenjang` varchar(100) NOT NULL,
  `formatid` smallint(4) NOT NULL,
  `aktif` enum('y','n') NOT NULL DEFAULT 'y',
  `oid` varchar(6) NOT NULL,
  `foto` text NOT NULL,
  `status_foto` enum('t','n','y') DEFAULT NULL,
  `keterangan_foto` varchar(225) NOT NULL,
  `foto_pembinaan` text NOT NULL,
  `s_foto_pembinaan` enum('t','n','y') DEFAULT NULL,
  `keterangan_foto_pembinaan` varchar(225) NOT NULL,
  `surat_suara_hati` text NOT NULL,
  `status_ssh` enum('t','n','y') DEFAULT NULL,
  `keterangan_ssh` varchar(225) NOT NULL,
  `raport_ceria` text NOT NULL,
  `status_raport_ceria` enum('t','n','y') DEFAULT NULL,
  `keterangan_raport_ceria` varchar(225) NOT NULL,
  `raport_satu` text NOT NULL,
  `status_raport_satu` enum('t','n','y') DEFAULT NULL,
  `keterangan_raport_satu` varchar(225) NOT NULL,
  `raport_dua` text NOT NULL,
  `status_raport_dua` enum('t','n','y') DEFAULT NULL,
  `keterangan_raport_dua` varchar(225) NOT NULL,
  `status_terbuat` int(1) DEFAULT 0,
  `tgl_status_terbuat` date NOT NULL,
  `status_terkirim_fundraising` varchar(1) DEFAULT '0',
  `tgl_status_terkirim_fundraising` date NOT NULL,
  `status_terkirim_donatur` varchar(1) DEFAULT '0',
  `tgl_status_terkirim_donatur` date NOT NULL,
  `tgl_insert` datetime NOT NULL,
  `user_insert` varchar(50) NOT NULL,
  `nik` varchar(50) NOT NULL,
  `id_anak` varchar(50) NOT NULL,
  `id_wilayah_pembinaan` varchar(50) NOT NULL,
  `id_pemasangan` varchar(50) NOT NULL,
  `nama_kantor` text NOT NULL,
  `nama_wilayah` text NOT NULL,
  `nama_semester` text NOT NULL,
  `wajib_materi` int(11) NOT NULL,
  `jml_materi` int(11) DEFAULT NULL,
  `jml_materi_tampil` int(11) DEFAULT NULL,
  `tgl_penyaluran` text NOT NULL,
  `tgl_pembinaan` text NOT NULL,
  `jml_prestasi` int(11) DEFAULT NULL,
  `s_perkembangan_siswa` enum('y','n') DEFAULT NULL,
  `keterangan_perkembangan_siswa` varchar(225) NOT NULL,
  `hasil_qc` varchar(25) NOT NULL,
  `keterangan` text DEFAULT NULL,
  `jenis_laporan` varchar(50) NOT NULL,
  `asnaf` varchar(15) NOT NULL,
  `status_ortu` varchar(50) NOT NULL,
  `s_materi` enum('t','n','y') DEFAULT NULL,
  `keterangan_materi` text NOT NULL,
  `wajib_materi_bulan` int(11) NOT NULL,
  `jml_materi_tampil_bulan` int(11) NOT NULL,
  `tgl_penyaluran_bulan` text NOT NULL,
  `tgl_pembinaan_bulan` text NOT NULL,
  `s_raport` int(11) DEFAULT NULL,
  `id_anak_postgree` varchar(50) DEFAULT NULL,
  `id_kantor_postgree` varchar(50) DEFAULT NULL,
  `id_pemasangan_postgree` varchar(50) DEFAULT NULL,
  `id_donatur_postgree` varchar(50) DEFAULT NULL,
  `id_program_postgree` varchar(50) DEFAULT NULL,
  `id_pemasangan_mutakhir` varchar(50) DEFAULT NULL,
  `id_ijgs_foto_lapsem` varchar(50) DEFAULT NULL,
  `upload_gdrive` varchar(50) DEFAULT NULL,
  `suara_anak_juara` text DEFAULT NULL,
  `catatan_pembinaan` text DEFAULT NULL,
  PRIMARY KEY (`laporanid`),
  KEY `semesterid` (`semesterid`),
  KEY `programid` (`programid`),
  KEY `formatid` (`formatid`),
  KEY `laporanid` (`laporanid`),
  KEY `id_wilayah_pembinaan` (`id_wilayah_pembinaan`,`oid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `manual_laporan_lama`;
CREATE TABLE `manual_laporan_lama` (
  `laporanid` varchar(12) NOT NULL,
  `donatur_id` varchar(13) NOT NULL,
  `donatur_nama` varchar(100) NOT NULL,
  `donatur_alamat` varchar(255) NOT NULL,
  `pm_nama_lengkap` varchar(100) NOT NULL,
  `pm_tempat_lahir` varchar(100) NOT NULL,
  `pm_tgl_lahir` date NOT NULL,
  `pm_anak_ke` tinyint(4) NOT NULL,
  `pm_saudara` tinyint(4) NOT NULL,
  `pm_nama_orang_tua` varchar(100) NOT NULL,
  `pm_pekerjaan` varchar(100) NOT NULL,
  `pm_anak_nama_sekolah` varchar(100) NOT NULL,
  `pm_anak_alamat_sekolah` varchar(100) NOT NULL,
  `pm_anak_kelas` varchar(5) NOT NULL,
  `pm_anak_jenjang` varchar(5) NOT NULL,
  `pm_mhs_institusi` varchar(100) NOT NULL,
  `pm_mhs_prodi` varchar(100) NOT NULL,
  `pm_mhs_semester` tinyint(4) NOT NULL,
  `pm_mhs_jurusan` varchar(100) NOT NULL,
  `pembinaan_wilayah` varchar(100) NOT NULL,
  `pembinaan_alamat` varchar(200) NOT NULL,
  `pembinaan_jml_anak` tinyint(4) NOT NULL,
  `pembinaan_jenjang` varchar(5) NOT NULL,
  `pembinaan_perkembangan` text NOT NULL,
  `pembinaan_prestasi` text NOT NULL,
  `dana_saldo_awal` double(20,2) NOT NULL,
  `dana_penerimaan` double(20,2) NOT NULL,
  `dana_penyaluran` double(20,2) NOT NULL,
  `programid` tinyint(4) NOT NULL,
  `semesterid` varchar(5) NOT NULL,
  `formatid` smallint(4) NOT NULL,
  `aktif` enum('y','n') NOT NULL DEFAULT 'y',
  `oid` varchar(6) NOT NULL,
  `foto` varchar(100) NOT NULL,
  `surat_suara_hati` varchar(100) NOT NULL,
  `raport` varchar(100) NOT NULL,
  `raport_dua` varchar(100) NOT NULL,
  `status_terbuat` tinyint(1) NOT NULL DEFAULT 0,
  `tgl_status_terbuat` date NOT NULL,
  `status_terkirim_fundraising` tinyint(1) NOT NULL DEFAULT 0,
  `tgl_status_terkirim_fundraising` date NOT NULL,
  `status_terkirim_donatur` tinyint(1) NOT NULL DEFAULT 0,
  `tgl_status_terkirim_donatur` date NOT NULL,
  `tgl_insert` date NOT NULL,
  `user_insert` varchar(50) NOT NULL,
  PRIMARY KEY (`laporanid`),
  KEY `semesterid` (`semesterid`),
  KEY `programid` (`programid`),
  KEY `formatid` (`formatid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `manual_laporan_pembinaan`;
CREATE TABLE `manual_laporan_pembinaan` (
  `laporanid` varchar(12) NOT NULL,
  `detailid` tinyint(4) NOT NULL,
  `id_anak` varchar(50) NOT NULL,
  `semesterid` varchar(50) NOT NULL,
  `tanggal` date NOT NULL,
  `materi` varchar(200) NOT NULL,
  `date_insert` date NOT NULL,
  `user_insert` varchar(50) NOT NULL,
  `aktif` enum('y','n') NOT NULL,
  PRIMARY KEY (`laporanid`,`detailid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `manual_laporan_prestasi`;
CREATE TABLE `manual_laporan_prestasi` (
  `id_prestasi` int(11) NOT NULL,
  `id_anak` varchar(50) NOT NULL,
  `nama_anak` varchar(50) NOT NULL,
  `jns_kel` varchar(50) NOT NULL,
  `kantor_id` varchar(50) NOT NULL,
  `id_wilayah_pembinaan` varchar(50) NOT NULL,
  `nama_kantor` varchar(50) NOT NULL,
  `nama_wilayah` varchar(50) NOT NULL,
  `jenjang_pendidikan` varchar(50) NOT NULL,
  `kelas` varchar(50) NOT NULL,
  `event` text NOT NULL,
  `lokasi` text NOT NULL,
  `bidang_prestasi` text NOT NULL,
  `skala` text NOT NULL,
  `prestasi` text NOT NULL,
  `link_publikasi` text NOT NULL,
  `waktu_awal` date NOT NULL,
  `waktu_akhir` date NOT NULL,
  `date_insert` date NOT NULL,
  `user_insert` varchar(50) NOT NULL,
  `aktif` enum('y','n') NOT NULL,
  PRIMARY KEY (`id_prestasi`),
  KEY `id_prestasi` (`id_prestasi`),
  KEY `id_anak` (`id_anak`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `manual_laporan_temp`;
CREATE TABLE `manual_laporan_temp` (
  `id_manual_laporan_temp` varchar(50) NOT NULL,
  `laporanid` varchar(50) NOT NULL,
  `nama_semester` text NOT NULL,
  `nama_kantor` text NOT NULL,
  `nama_wilayah` text NOT NULL,
  `id_anak` varchar(50) NOT NULL,
  `pm_nama_lengkap` text NOT NULL,
  `pm_anak_nama_sekolah` text NOT NULL,
  `pm_anak_kelas` text NOT NULL,
  `suara_anak_juara` text NOT NULL,
  `tgl_insert` datetime NOT NULL,
  `user_insert` varchar(50) NOT NULL,
  PRIMARY KEY (`laporanid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `materi`;
CREATE TABLE `materi` (
  `id_materi` int(11) NOT NULL,
  `detailid` varchar(50) NOT NULL,
  `materi` text NOT NULL,
  `tanggal` date NOT NULL,
  `jenjang` varchar(50) NOT NULL,
  `semesterid` varchar(50) NOT NULL,
  `oid` varchar(50) NOT NULL,
  `id_wilayah_pembinaan` varchar(50) NOT NULL,
  PRIMARY KEY (`id_materi`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `materi_temp`;
CREATE TABLE `materi_temp` (
  `id_materi` int(11) NOT NULL,
  `detailid` varchar(50) NOT NULL,
  `materi` text NOT NULL,
  `tanggal` date NOT NULL,
  `jenjang` varchar(50) NOT NULL,
  `semesterid` varchar(50) NOT NULL,
  `oid` varchar(50) NOT NULL,
  `id_wilayah_pembinaan` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `pekerjaan`;
CREATE TABLE `pekerjaan` (
  `kerjaid` char(3) NOT NULL DEFAULT '',
  `pekerjaan` varchar(100) NOT NULL DEFAULT '',
  PRIMARY KEY (`kerjaid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `perkembangan_temp`;
CREATE TABLE `perkembangan_temp` (
  `laporanid` varchar(50) NOT NULL,
  `donatur_id` varchar(50) NOT NULL,
  `donatur_nama` text NOT NULL,
  `pm_nama_lengkap` text NOT NULL,
  `pembinaan_perkembangan` text NOT NULL,
  `tgl_insert` datetime NOT NULL,
  PRIMARY KEY (`laporanid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `program`;
CREATE TABLE `program` (
  `progid` varchar(6) NOT NULL DEFAULT '',
  `parent_progid` varchar(20) NOT NULL,
  `nama_program` varchar(50) NOT NULL DEFAULT '',
  `nama_inggris_program` varchar(50) NOT NULL DEFAULT '',
  `jenis_program` enum('dn','ln') NOT NULL DEFAULT 'dn',
  `coa_program` varchar(20) NOT NULL,
  `sifat_program` enum('t','tt') NOT NULL DEFAULT 'tt',
  `keterangan` varchar(50) NOT NULL DEFAULT '',
  `tgl_digulirkan` date NOT NULL DEFAULT '0000-00-00',
  `aktif` enum('y','n') NOT NULL DEFAULT 'y',
  `tgl_inaktif` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `kprogid` char(2) NOT NULL DEFAULT '',
  `tgl_insert` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `tgl_change_status` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` enum('m','nm') NOT NULL DEFAULT 'nm',
  `dana_pengelola` enum('y','n') NOT NULL DEFAULT 'n',
  `nama_alias` varchar(30) NOT NULL,
  `pdanaid` int(5) NOT NULL,
  `id_anggaran` varchar(50) NOT NULL,
  `harga_program` double NOT NULL,
  `harga_penyaluran` double NOT NULL,
  `nominal_dp` double NOT NULL,
  `nominal_dss` double NOT NULL,
  `persentase_dp` double NOT NULL,
  `persentase_dss` double NOT NULL,
  `id_program` int(11) NOT NULL,
  `kredit_account` varchar(50) NOT NULL,
  `id_program_postgree` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`progid`),
  KEY `kprogid` (`kprogid`),
  KEY `progid` (`progid`,`nama_program`,`harga_program`,`harga_penyaluran`,`nominal_dp`,`nominal_dss`,`persentase_dp`,`persentase_dss`,`id_program`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ref_desa`;
CREATE TABLE `ref_desa` (
  `desaid` char(10) NOT NULL,
  `nama_desa` varchar(50) NOT NULL,
  `kelurahan` enum('y','n') NOT NULL,
  `camatid` char(7) NOT NULL,
  `aktif` enum('y','n') NOT NULL DEFAULT 'y',
  `propid` varchar(50) NOT NULL,
  `kabid` varchar(50) NOT NULL,
  `nomor_induk_desa` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`desaid`),
  KEY `camatid` (`camatid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 ROW_FORMAT=COMPACT;

DROP TABLE IF EXISTS `ref_kabupaten`;
CREATE TABLE `ref_kabupaten` (
  `kabid` varchar(4) NOT NULL DEFAULT '0',
  `propid` varchar(4) NOT NULL DEFAULT '0',
  `kabupaten` varchar(50) NOT NULL DEFAULT '',
  `kota` enum('0','1') NOT NULL DEFAULT '0',
  `ibukota` varchar(50) NOT NULL DEFAULT '',
  `oid` varchar(6) NOT NULL,
  `aktif` enum('y','n') NOT NULL DEFAULT 'y',
  `lat` float(10,6) NOT NULL,
  `lng` float(10,6) NOT NULL,
  `updated` datetime NOT NULL,
  PRIMARY KEY (`kabid`),
  UNIQUE KEY `kid` (`kabid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `ref_kecamatan`;
CREATE TABLE `ref_kecamatan` (
  `camatid` char(10) NOT NULL,
  `nama_kecamatan` varchar(50) NOT NULL,
  `kodepos` varchar(10) NOT NULL,
  `kabid` char(4) NOT NULL,
  `aktif` enum('y','n') NOT NULL DEFAULT 'y',
  `updated` date NOT NULL,
  PRIMARY KEY (`camatid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 ROW_FORMAT=DYNAMIC;

DROP TABLE IF EXISTS `ref_propinsi`;
CREATE TABLE `ref_propinsi` (
  `propid` varchar(4) NOT NULL DEFAULT '0',
  `propinsi` varchar(50) NOT NULL DEFAULT '',
  `ibukota` varchar(50) NOT NULL DEFAULT '',
  `aktif` enum('y','n') NOT NULL DEFAULT 'y',
  PRIMARY KEY (`propid`),
  UNIQUE KEY `pid` (`propid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `setting_campaign`;
CREATE TABLE `setting_campaign` (
  `id_campaign` int(1) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(100) NOT NULL,
  `id_program` int(1) NOT NULL,
  `program` varchar(100) NOT NULL,
  `nominal_default` double(12,2) NOT NULL,
  `nominal_min` double(12,2) NOT NULL,
  `nominal_max` double(12,2) NOT NULL,
  `nominal_target` double(20,2) NOT NULL,
  `nominal_funded` double(20,2) NOT NULL,
  `nominal_funded_show` tinyint(1) NOT NULL,
  `nominal_editable` tinyint(1) NOT NULL,
  `image` text NOT NULL,
  `banner` text DEFAULT NULL,
  `description` text NOT NULL,
  `sort` int(1) NOT NULL,
  `top` tinyint(1) NOT NULL,
  `show` tinyint(1) NOT NULL,
  `note` text NOT NULL,
  `expired_date` datetime NOT NULL,
  `active` tinyint(1) NOT NULL,
  `nominal_target_show` tinyint(1) NOT NULL,
  `slug` varchar(100) DEFAULT NULL,
  `donors_funded` int(11) NOT NULL,
  `qty_funded` int(11) NOT NULL,
  `dtu` datetime NOT NULL DEFAULT current_timestamp(),
  `cdt` datetime NOT NULL,
  `id_kantor_rz` int(4) NOT NULL DEFAULT 1,
  `nominal_funded_alltime` double(20,2) NOT NULL,
  `id_anak` varchar(50) NOT NULL,
  `id_campaign_parent` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_campaign`),
  KEY `sort` (`sort`),
  KEY `show` (`show`)
) ENGINE=InnoDB AUTO_INCREMENT=756 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `setting_program`;
CREATE TABLE `setting_program` (
  `id_program` int(11) NOT NULL,
  `progid` varchar(6) NOT NULL DEFAULT '',
  `parent_progid` varchar(20) NOT NULL,
  `nama_program` varchar(50) NOT NULL DEFAULT '',
  `nama_inggris_program` varchar(50) NOT NULL DEFAULT '',
  `jenis_program` enum('dn','ln') NOT NULL DEFAULT 'dn',
  `coa_program` varchar(20) NOT NULL,
  `sifat_program` enum('t','tt') NOT NULL DEFAULT 'tt',
  `keterangan` varchar(50) NOT NULL DEFAULT '',
  `tgl_digulirkan` date NOT NULL DEFAULT '0000-00-00',
  `aktif` enum('y','n') NOT NULL DEFAULT 'y',
  `tgl_inaktif` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `kprogid` char(2) NOT NULL DEFAULT '',
  `tgl_insert` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `tgl_change_status` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `status` enum('m','nm') NOT NULL DEFAULT 'nm',
  `dana_pengelola` enum('y','n') NOT NULL DEFAULT 'n',
  `nama_alias` varchar(30) NOT NULL,
  `pdanaid` int(5) NOT NULL,
  `id_anggaran` varchar(50) NOT NULL,
  `harga_program` double NOT NULL,
  `harga_penyaluran` double NOT NULL,
  `nominal_dp` double NOT NULL,
  `nominal_dss` double NOT NULL,
  `persentase_dp` double NOT NULL,
  `persentase_dss` double NOT NULL,
  `jenjang_pendidikan` varchar(10) NOT NULL,
  `baru` varchar(5) NOT NULL,
  `id_program_postgree` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_program`,`progid`),
  KEY `kprogid` (`kprogid`),
  KEY `progid` (`progid`,`nama_program`,`harga_program`,`harga_penyaluran`,`id_program`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `setting_program_donol`;
CREATE TABLE `setting_program_donol` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_program` int(11) NOT NULL COMMENT 'ID Program',
  `program` varchar(100) NOT NULL COMMENT 'Nama Program',
  `nom` double(12,2) NOT NULL COMMENT 'Nominal',
  `nom_editable` enum('y','n') NOT NULL DEFAULT 'y',
  `tombol_donasi` int(11) NOT NULL,
  `minimal_donasi` int(11) NOT NULL,
  `aktif` enum('y','n') NOT NULL DEFAULT 'y',
  `note` text NOT NULL,
  `top` int(11) NOT NULL,
  `parent_donol` int(11) NOT NULL,
  `parent_program_donol` int(11) NOT NULL,
  `deskripsi` text NOT NULL,
  `gambar` text NOT NULL,
  `program_in` varchar(100) NOT NULL,
  `program_en` varchar(155) NOT NULL,
  `deskripsi_en` text NOT NULL,
  `footer_in` text NOT NULL,
  `footer_en` text NOT NULL,
  `urutan_mobile` int(11) NOT NULL,
  `urutan_desktop` int(11) NOT NULL,
  `first_show` varchar(100) NOT NULL,
  `hewanid` varchar(50) NOT NULL,
  `sifat_qurbanid` varchar(50) NOT NULL,
  `periode_qurbanid` varchar(50) NOT NULL,
  `jml_hewan` varchar(50) NOT NULL,
  `jml_bagian` varchar(50) NOT NULL,
  `jml_kornet` varchar(50) NOT NULL,
  `jml_kornet_salur` varchar(50) NOT NULL,
  `olahan` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `transaksi`;
CREATE TABLE `transaksi` (
  `transid` varchar(50) NOT NULL,
  `jenis_transaksi` enum('cash','noncash','bank','pccash','pcnoncash') NOT NULL,
  `did` varchar(30) NOT NULL,
  `detailid` int(1) NOT NULL,
  `progid` varchar(6) NOT NULL,
  `perkiraan_rp` double(20,2) NOT NULL,
  `tgl_donasi` date NOT NULL,
  `tgl_transaksi` date NOT NULL,
  `oid_transaksi` varchar(6) NOT NULL,
  `oid_donatur` varchar(6) NOT NULL,
  `vbayarid` varchar(100) NOT NULL,
  `mbayarid` varchar(100) NOT NULL,
  `nik_rfo` varchar(15) NOT NULL,
  `valid4` varchar(50) NOT NULL,
  `nik_claim` varchar(14) NOT NULL,
  `jid_claim` varchar(6) NOT NULL,
  `approved_claim` enum('y','n') NOT NULL,
  `approved_trans` enum('y','n') NOT NULL DEFAULT 'n',
  `atas_nama` text NOT NULL,
  `date_generate` datetime NOT NULL,
  `keterangan` text NOT NULL,
  `jml_mustahik` varchar(50) NOT NULL,
  `bulan_disantuni` varchar(50) NOT NULL,
  `nama_rfo` varchar(50) NOT NULL,
  `nama_claim` varchar(50) NOT NULL,
  `status_pasang` enum('n','y') NOT NULL,
  `user_insert_cf` varchar(50) NOT NULL,
  `user_update_cf` varchar(50) NOT NULL,
  `approve_salur` enum('y','n') NOT NULL,
  `ket_approve_salur` text NOT NULL,
  `user_approve_salur` varchar(50) NOT NULL,
  `date_approve_salur` datetime NOT NULL,
  `deleted_trans` enum('n','y') NOT NULL,
  `deleted_detail` enum('n','y') NOT NULL,
  `review` enum('n','y') NOT NULL,
  `bulan_salur` varchar(50) NOT NULL,
  `tahun_salur` varchar(50) NOT NULL,
  `selisih_donasi` int(11) NOT NULL,
  `total_input_donasi` int(11) NOT NULL,
  `nama_donatur` text NOT NULL,
  `nama_program` text NOT NULL,
  `kantor_transaksi` text NOT NULL,
  `kantor_donatur` text NOT NULL,
  `jml_anak_ijis` int(11) NOT NULL,
  `kantor_ijis` text NOT NULL,
  `id_kantor_ijis` text NOT NULL,
  `harga_program` double NOT NULL,
  `id_review` varchar(50) NOT NULL,
  `cicilan` enum('n','y') NOT NULL,
  `jcustid` int(11) NOT NULL,
  `id_program` int(11) NOT NULL,
  `id_donatur_postgree` varchar(50) DEFAULT NULL,
  `id_program_postgree` varchar(50) DEFAULT NULL,
  `id_kantor_postgree` varchar(50) DEFAULT NULL,
  `id_kantor_zains` varchar(50) DEFAULT NULL,
  `id_transaksi_postgree` varchar(50) DEFAULT NULL,
  `id_donatur_erp_wh` varchar(50) DEFAULT NULL,
  `id_program_erp_wh` varchar(50) DEFAULT NULL,
  `user_insert` varchar(50) DEFAULT NULL,
  `date_insert` datetime DEFAULT NULL,
  PRIMARY KEY (`transid`,`detailid`),
  KEY `jenis_transaksi` (`jenis_transaksi`,`tgl_donasi`,`tgl_transaksi`),
  KEY `did` (`did`,`progid`,`bulan_salur`,`tahun_salur`,`id_review`),
  KEY `oid_transaksi` (`oid_transaksi`,`oid_donatur`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `transaksi_baru`;
CREATE TABLE `transaksi_baru` (
  `transid` varchar(50) NOT NULL,
  `jenis_transaksi` enum('cash','noncash','bank','pccash','pcnoncash') NOT NULL,
  `did` varchar(15) NOT NULL,
  `detailid` int(1) NOT NULL,
  `progid` varchar(6) NOT NULL,
  `perkiraan_rp` double(20,2) NOT NULL,
  `tgl_donasi` date NOT NULL,
  `tgl_transaksi` date NOT NULL,
  `oid_transaksi` varchar(6) NOT NULL,
  `oid_donatur` varchar(6) NOT NULL,
  `vbayarid` varchar(20) NOT NULL,
  `mbayarid` varchar(10) NOT NULL,
  `nik_rfo` varchar(15) NOT NULL,
  `valid4` varchar(50) NOT NULL,
  `nik_claim` varchar(14) NOT NULL,
  `jid_claim` varchar(6) NOT NULL,
  `approved_claim` enum('y','n') NOT NULL,
  `approved_trans` enum('y','n') NOT NULL DEFAULT 'n',
  `atas_nama` varchar(100) NOT NULL,
  `date_generate` datetime NOT NULL,
  `keterangan` text NOT NULL,
  `jml_mustahik` varchar(50) NOT NULL,
  `bulan_disantuni` varchar(50) NOT NULL,
  `nama_rfo` varchar(50) NOT NULL,
  `nama_claim` varchar(50) NOT NULL,
  `status_pasang` enum('n','y') NOT NULL,
  `user_insert_cf` varchar(50) NOT NULL,
  `user_update_cf` varchar(50) NOT NULL,
  `approve_salur` enum('y','n') NOT NULL,
  `ket_approve_salur` text NOT NULL,
  `user_approve_salur` varchar(50) NOT NULL,
  `date_approve_salur` datetime NOT NULL,
  `deleted_trans` enum('n','y') NOT NULL,
  `deleted_detail` enum('n','y') NOT NULL,
  `review` enum('n','y') NOT NULL,
  `bulan_salur` varchar(50) NOT NULL,
  `tahun_salur` varchar(50) NOT NULL,
  `selisih_donasi` int(11) NOT NULL,
  `total_input_donasi` int(11) NOT NULL,
  `nama_donatur` text NOT NULL,
  `nama_program` text NOT NULL,
  `kantor_transaksi` text NOT NULL,
  `kantor_donatur` text NOT NULL,
  `jml_anak_ijis` int(11) NOT NULL,
  `kantor_ijis` text NOT NULL,
  `id_kantor_ijis` text NOT NULL,
  `harga_program` double NOT NULL,
  PRIMARY KEY (`transid`,`detailid`),
  KEY `jenis_transaksi` (`jenis_transaksi`,`tgl_donasi`,`tgl_transaksi`),
  KEY `did` (`did`,`progid`,`bulan_salur`,`tahun_salur`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `transaksi_temp`;
CREATE TABLE `transaksi_temp` (
  `transid` varchar(50) NOT NULL,
  `jenis_transaksi` enum('cash','noncash','bank','pccash','pcnoncash') NOT NULL,
  `did` varchar(30) NOT NULL,
  `detailid` int(1) NOT NULL,
  `progid` varchar(6) NOT NULL,
  `perkiraan_rp` double(20,2) NOT NULL,
  `tgl_donasi` date NOT NULL,
  `tgl_transaksi` date NOT NULL,
  `oid_transaksi` varchar(50) NOT NULL,
  `oid_donatur` varchar(50) NOT NULL,
  `vbayarid` varchar(100) NOT NULL,
  `mbayarid` varchar(100) NOT NULL,
  `nik_rfo` varchar(15) NOT NULL,
  `valid4` varchar(50) NOT NULL,
  `nik_claim` varchar(14) NOT NULL,
  `jid_claim` varchar(6) NOT NULL,
  `approved_claim` enum('y','n') NOT NULL,
  `approved_trans` enum('y','n') NOT NULL DEFAULT 'n',
  `atas_nama` text NOT NULL,
  `date_generate` datetime NOT NULL,
  `keterangan` text NOT NULL,
  `jml_mustahik` varchar(50) NOT NULL,
  `bulan_disantuni` varchar(50) NOT NULL,
  `nama_rfo` varchar(50) NOT NULL,
  `nama_claim` varchar(50) NOT NULL,
  `status_pasang` enum('n','y') NOT NULL,
  `user_insert_cf` varchar(50) NOT NULL,
  `user_update_cf` varchar(50) NOT NULL,
  `approve_salur` enum('y','n') NOT NULL,
  `ket_approve_salur` text NOT NULL,
  `user_approve_salur` varchar(50) NOT NULL,
  `date_approve_salur` datetime NOT NULL,
  `deleted_trans` enum('n','y') NOT NULL,
  `deleted_detail` enum('n','y') NOT NULL,
  `review` enum('n','y') NOT NULL,
  `bulan_salur` varchar(50) NOT NULL,
  `tahun_salur` varchar(50) NOT NULL,
  `selisih_donasi` int(11) NOT NULL,
  `total_input_donasi` int(11) NOT NULL,
  `nama_donatur` text NOT NULL,
  `nama_program` text NOT NULL,
  `kantor_transaksi` text NOT NULL,
  `kantor_donatur` text NOT NULL,
  `jml_anak_ijis` int(11) NOT NULL,
  `kantor_ijis` text NOT NULL,
  `id_kantor_ijis` text NOT NULL,
  `harga_program` double NOT NULL,
  `id_review` varchar(50) NOT NULL,
  `cicilan` enum('n','y') NOT NULL,
  `jcustid` int(11) NOT NULL,
  `id_program` int(11) NOT NULL,
  `id_donatur_postgree` varchar(50) DEFAULT NULL,
  `id_program_postgree` varchar(50) DEFAULT NULL,
  `id_kantor_postgree` varchar(50) DEFAULT NULL,
  `id_kantor_zains` varchar(50) DEFAULT NULL,
  `id_transaksi_postgree` varchar(50) DEFAULT NULL,
  `id_donatur_erp_wh` varchar(50) DEFAULT NULL,
  `id_program_erp_wh` varchar(50) DEFAULT NULL,
  `user_insert` varchar(50) DEFAULT NULL,
  `date_insert` datetime DEFAULT NULL,
  PRIMARY KEY (`transid`,`detailid`),
  KEY `jenis_transaksi` (`jenis_transaksi`,`tgl_donasi`,`tgl_transaksi`),
  KEY `did` (`did`,`progid`,`bulan_salur`,`tahun_salur`,`id_review`),
  KEY `oid_transaksi` (`oid_transaksi`,`oid_donatur`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `wh_anak_juara`;
CREATE TABLE `wh_anak_juara` (
  `id_wh` int(11) NOT NULL AUTO_INCREMENT,
  `id_pemasangan` varchar(50) NOT NULL,
  `id_anak` varchar(50) NOT NULL,
  `nik` varchar(50) NOT NULL,
  `nama_anak` text NOT NULL,
  `jns_kel` varchar(50) NOT NULL,
  `asnaf` varchar(50) NOT NULL,
  `jenjang_pendidikan` varchar(50) NOT NULL,
  `kelas` varchar(50) NOT NULL,
  `status_aj` varchar(50) NOT NULL,
  `status_ortu` varchar(50) NOT NULL,
  `id_donatur` varchar(50) NOT NULL,
  `nama_donatur` text NOT NULL,
  `id_kantor` varchar(50) NOT NULL,
  `nama_kantor` varchar(50) NOT NULL,
  `id_wilayah_pembinaan` varchar(50) NOT NULL,
  `nama_wilayah` varchar(50) NOT NULL,
  `program_donasi` varchar(50) NOT NULL,
  `harga_program` double NOT NULL,
  `harga_penyaluran` int(11) NOT NULL,
  `status_mentor` varchar(50) NOT NULL,
  `nama_mentor` varchar(50) NOT NULL,
  `status_pasangan` varchar(50) NOT NULL,
  `tgl_pemasangan` date NOT NULL,
  `tgl_pemberhentian_pemasangan` date NOT NULL,
  `keterangan_pemberhentian` text NOT NULL,
  `no_rekening` varchar(50) NOT NULL,
  `saldo_awal_ganjil` double NOT NULL,
  `donasi_jan` double NOT NULL,
  `donasi_feb` double NOT NULL,
  `donasi_mar` double NOT NULL,
  `donasi_apr` double NOT NULL,
  `donasi_mei` double NOT NULL,
  `donasi_jun` double NOT NULL,
  `jml_berdonasi_ganjil` double NOT NULL,
  `donasi_plus_saldo_ganjil` double NOT NULL,
  `penyaluran_jan` double NOT NULL,
  `penyaluran_feb` double NOT NULL,
  `penyaluran_mar` double NOT NULL,
  `penyaluran_apr` double NOT NULL,
  `penyaluran_mei` double NOT NULL,
  `penyaluran_jun` double NOT NULL,
  `jml_tersalurkan_ganjil` double NOT NULL,
  `saldo_akhir_ganjil` double NOT NULL,
  `wajib_ganjil` varchar(50) NOT NULL,
  `aktif_ganjil` varchar(50) NOT NULL,
  `jml_lapsem_ganjil` int(11) NOT NULL,
  `saldo_awal_genap` double NOT NULL,
  `donasi_jul` double NOT NULL,
  `donasi_aug` double NOT NULL,
  `donasi_sep` double NOT NULL,
  `donasi_okt` double NOT NULL,
  `donasi_nov` double NOT NULL,
  `donasi_des` double NOT NULL,
  `jml_berdonasi_genap` double NOT NULL,
  `donasi_plus_saldo_genap` double NOT NULL,
  `penyaluran_jul` double NOT NULL,
  `penyaluran_aug` double NOT NULL,
  `penyaluran_sep` double NOT NULL,
  `penyaluran_okt` double NOT NULL,
  `penyaluran_nov` double NOT NULL,
  `penyaluran_des` double NOT NULL,
  `jml_tersalurkan_genap` double NOT NULL,
  `saldo_akhir_genap` double NOT NULL,
  `aktif_genap` varchar(50) NOT NULL,
  `wajib_genap` varchar(50) NOT NULL,
  `date_generated` datetime NOT NULL,
  `user_generated` varchar(50) NOT NULL,
  `nia_rfo` varchar(50) NOT NULL,
  `nama_rfo` text NOT NULL,
  PRIMARY KEY (`id_wh`),
  KEY `id_pemasangan` (`id_pemasangan`,`id_anak`,`id_donatur`,`id_kantor`,`id_wilayah_pembinaan`)
) ENGINE=InnoDB AUTO_INCREMENT=20777 DEFAULT CHARSET=latin1;

-- ============================================================
-- VIEW DEFINITIONS (32 views)
-- ============================================================

DROP VIEW IF EXISTS `ajis_calon_anak_juara`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`localhost` SQL SECURITY DEFINER VIEW `ajis_calon_anak_juara` AS select `t`.`id_anak` AS `id_anak`,`t`.`nama_anak` AS `nama_anak`,`t`.`nik` AS `nik`,`t`.`jns_kel` AS `jns_kel`,`t`.`kantor_id` AS `kantor_id`,`t`.`id_wilayah_pembinaan` AS `id_wilayah_pembinaan`,`t`.`nama_kantor` AS `nama_kantor`,`t`.`nama_wilayah` AS `nama_wilayah`,`t`.`no_rekening` AS `no_rekening`,`t`.`kelas` AS `kelas`,`t`.`asnaf` AS `asnaf`,`t`.`status_ortu` AS `status_ortu`,`t`.`id_sdm` AS `id_sdm`,`t`.`nama_mentor` AS `nama_mentor`,`t`.`status_mentor` AS `status_mentor`,`t`.`jenjang_pendidikan` AS `jenjang_pendidikan`,`t`.`nama_sekolah` AS `nama_sekolah`,`t`.`nama_pt` AS `nama_pt`,`t`.`id_program` AS `id_program`,`t`.`program_donasi` AS `program_donasi`,`t`.`harga_program` AS `harga_program`,`t`.`harga_penyaluran` AS `harga_penyaluran` from ((select `a`.`id_anak` AS `id_anak`,`a`.`nama_lengkap` AS `nama_anak`,`a`.`nik` AS `nik`,`a`.`jns_kel` AS `jns_kel`,`a`.`kantor_id` AS `kantor_id`,`a`.`id_wilayah_pembinaan` AS `id_wilayah_pembinaan`,`a`.`nama_kantor` AS `nama_kantor`,`a`.`nama_wilayah` AS `nama_wilayah`,`a`.`no_rekening` AS `no_rekening`,`a`.`kelas` AS `kelas`,`a`.`asnaf` AS `asnaf`,`a`.`status_ortu` AS `status_ortu`,`a`.`id_sdm` AS `id_sdm`,`a`.`nama_mentor` AS `nama_mentor`,`a`.`status_mentor` AS `status_mentor`,`a`.`jenjang_pendidikan` AS `jenjang_pendidikan`,`a`.`nama_sekolah` AS `nama_sekolah`,`a`.`nama_pt` AS `nama_pt`,`b`.`id_program` AS `id_program`,`b`.`nama_program` AS `program_donasi`,`b`.`harga_program` AS `harga_program`,`b`.`harga_penyaluran` AS `harga_penyaluran` from (`sipc_ijf`.`ajis_anak` `a` left join `sipc_ijf`.`setting_program` `b` on(`a`.`jenjang_pendidikan` = `b`.`jenjang_pendidikan`)) where 1 and `a`.`status_anak_juara` = 'caj' and `a`.`nama_kantor`  not like '%juara%' and `b`.`nama_program`  not like '%sekolah%' group by `a`.`id_anak`) union (select `a`.`id_anak` AS `id_anak`,`a`.`nama_lengkap` AS `nama_anak`,`a`.`nik` AS `nik`,`a`.`jns_kel` AS `jns_kel`,`a`.`kantor_id` AS `kantor_id`,`a`.`id_wilayah_pembinaan` AS `id_wilayah_pembinaan`,`a`.`nama_kantor` AS `nama_kantor`,`a`.`nama_wilayah` AS `nama_wilayah`,`a`.`no_rekening` AS `no_rekening`,`a`.`kelas` AS `kelas`,`a`.`asnaf` AS `asnaf`,`a`.`status_ortu` AS `status_ortu`,`a`.`id_sdm` AS `id_sdm`,`a`.`nama_mentor` AS `nama_mentor`,`a`.`status_mentor` AS `status_mentor`,`a`.`jenjang_pendidikan` AS `jenjang_pendidikan`,`a`.`nama_sekolah` AS `nama_sekolah`,`a`.`nama_pt` AS `nama_pt`,`b`.`id_program` AS `id_program`,`b`.`nama_program` AS `program_donasi`,`b`.`harga_program` AS `harga_program`,`b`.`harga_penyaluran` AS `harga_penyaluran` from (`sipc_ijf`.`ajis_anak` `a` left join `sipc_ijf`.`setting_program` `b` on(`a`.`jenjang_pendidikan` = `b`.`jenjang_pendidikan`)) where 1 and `a`.`status_anak_juara` = 'caj' and `a`.`nama_kantor` like '%juara%' and `b`.`nama_program` like '%sekolah%' group by `a`.`id_anak`)) `t`;

DROP VIEW IF EXISTS `ajis_calon_anak_juara_reguler`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`localhost` SQL SECURITY DEFINER VIEW `ajis_calon_anak_juara_reguler` AS select `a`.`id_anak` AS `id_anak`,`a`.`nama_lengkap` AS `nama_anak`,`a`.`nik` AS `nik`,`a`.`jns_kel` AS `jns_kel`,`a`.`kantor_id` AS `kantor_id`,`a`.`id_wilayah_pembinaan` AS `id_wilayah_pembinaan`,`a`.`nama_kantor` AS `nama_kantor`,`a`.`nama_wilayah` AS `nama_wilayah`,`a`.`no_rekening` AS `no_rekening`,`a`.`kelas` AS `kelas`,`a`.`asnaf` AS `asnaf`,`a`.`status_ortu` AS `status_ortu`,`a`.`id_sdm` AS `id_sdm`,`a`.`nama_mentor` AS `nama_mentor`,`a`.`status_mentor` AS `status_mentor`,`a`.`jenjang_pendidikan` AS `jenjang_pendidikan`,`a`.`nama_sekolah` AS `nama_sekolah`,`a`.`nama_pt` AS `nama_pt`,`b`.`id_program` AS `id_program`,`b`.`nama_program` AS `program_donasi`,`b`.`harga_program` AS `harga_program`,`b`.`harga_penyaluran` AS `harga_penyaluran` from (`ajis_anak` `a` left join `setting_program` `b` on(`a`.`jenjang_pendidikan` = `b`.`jenjang_pendidikan`)) where 1 and `a`.`status_anak_juara` = 'caj' and `a`.`nama_kantor`  not like '%juara%' and `b`.`nama_program`  not like '%sekolah%' group by `a`.`id_anak`;

DROP VIEW IF EXISTS `ajis_pemasangan_full_biodata`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`localhost` SQL SECURITY DEFINER VIEW `ajis_pemasangan_full_biodata` AS select `a`.`id_pemasangan` AS `id_pemasangan`,`a`.`tgl_pemasangan` AS `tgl_pemasangan`,`a`.`tgl_pemberhentian_pemasangan` AS `tgl_pemberhentian_pemasangan`,`a`.`id_donatur` AS `id_donatur`,`a`.`id_anak` AS `id_anak`,`a`.`id_wilayah_pembinaan` AS `id_wilayah_pembinaan`,`a`.`kantor_id` AS `kantor_id`,`a`.`program_donasi` AS `program_donasi`,`a`.`harga_program` AS `harga_program`,`a`.`harga_penyaluran` AS `harga_penyaluran`,`a`.`keterangan_pemberhentian` AS `keterangan_pemberhentian`,`a`.`status_pasangan` AS `status_pasangan`,`a`.`saldo_awal` AS `saldo_awal`,`a`.`status_saldo` AS `status_saldo`,`a`.`program_sebelumnya` AS `program_sebelumnya`,`a`.`user_insert` AS `user_insert`,`a`.`date_insert` AS `date_insert`,`a`.`user_update` AS `user_update`,`a`.`date_update` AS `date_update`,`a`.`jns_kel` AS `jns_kel`,`a`.`nama_anak` AS `nama_anak`,`a`.`kelas` AS `kelas`,`a`.`nama_donatur` AS `nama_donatur`,`a`.`nama_wilayah` AS `nama_wilayah`,`a`.`nama_kantor` AS `nama_kantor`,`a`.`jenjang_pendidikan` AS `jenjang_pendidikan`,`a`.`asnaf` AS `asnaf`,`a`.`status_ortu` AS `status_ortu`,`a`.`status_aj` AS `status_aj`,`a`.`id_sdm` AS `id_sdm`,`a`.`nama_mentor` AS `nama_mentor`,`a`.`nik` AS `nik`,`a`.`status_mentor` AS `status_mentor`,`a`.`no_rekening` AS `no_rekening`,`a`.`cek` AS `cek`,`a`.`nia_rfo` AS `nia_rfo`,`a`.`nama_rfo` AS `nama_rfo`,`b`.`nama_panggilan` AS `nama_panggilan`,`b`.`agama` AS `agama`,`b`.`tempat_lahir` AS `tempat_lahir`,`b`.`tgl_lahir` AS `tgl_lahir`,`b`.`anak_ke` AS `anak_ke`,`b`.`dari_saudara` AS `dari_saudara`,`b`.`alamat` AS `alamat`,`b`.`propid` AS `propid`,`b`.`nama_propinsi` AS `nama_propinsi`,`b`.`kabid` AS `kabid`,`b`.`nama_kabupaten` AS `nama_kabupaten`,`b`.`camatid` AS `camatid`,`b`.`nama_kecamatan` AS `nama_kecamatan`,`b`.`desaid` AS `desaid`,`b`.`nama_desa` AS `nama_desa`,`b`.`nama_sekolah` AS `nama_sekolah`,`b`.`alamat_sekolah` AS `alamat_sekolah`,`b`.`jurusan` AS `jurusan`,`b`.`semester` AS `semester`,`b`.`nama_pt` AS `nama_pt`,`b`.`alamat_pt` AS `alamat_pt`,`b`.`foto` AS `foto`,`b`.`nilai` AS `nilai`,`b`.`pelajaran_favorit` AS `pelajaran_favorit`,`b`.`jarak_rumah` AS `jarak_rumah`,`b`.`alat_transportasi` AS `alat_transportasi`,`b`.`hobi` AS `hobi`,`b`.`prestasi` AS `prestasi`,`b`.`no_kartu_keluarga` AS `no_kartu_keluarga`,`b`.`status_survey` AS `status_survey`,`b`.`status_kelayakan` AS `status_kelayakan`,`b`.`status_anak_juara` AS `status_anak_juara`,`b`.`status_tersantuni` AS `status_tersantuni`,`b`.`status_pinjam` AS `status_pinjam`,`b`.`tgl_terdaftar` AS `tgl_terdaftar`,`b`.`tgl_pengajuan` AS `tgl_pengajuan`,`b`.`nama_lengkap_ayah` AS `nama_lengkap_ayah`,`b`.`pekerjaan_ayah` AS `pekerjaan_ayah`,`b`.`penghasilan_rata_rata_ayah` AS `penghasilan_rata_rata_ayah`,`b`.`tanggal_kematian_ayah` AS `tanggal_kematian_ayah`,`b`.`penyebab_kematian_ayah` AS `penyebab_kematian_ayah`,`b`.`nama_lengkap_ibu` AS `nama_lengkap_ibu`,`b`.`pekerjaan_ibu` AS `pekerjaan_ibu`,`b`.`penghasilan_rata_rata_ibu` AS `penghasilan_rata_rata_ibu`,`b`.`tanggal_kematian_ibu` AS `tanggal_kematian_ibu`,`b`.`penyebab_kematian_ibu` AS `penyebab_kematian_ibu`,`b`.`nama_lengkap_wali` AS `nama_lengkap_wali`,`b`.`pekerjaan_wali` AS `pekerjaan_wali`,`b`.`penghasilan_rata_rata_wali` AS `penghasilan_rata_rata_wali`,`b`.`telp_yang_bisa_dihubungi` AS `telp_yang_bisa_dihubungi`,`b`.`atas_nama` AS `atas_nama`,`b`.`hubungan_kerabat` AS `hubungan_kerabat`,`b`.`aktif` AS `aktif` from (`ajis_pemasangan` `a` left join `ajis_anak` `b` on(`a`.`id_anak` = `b`.`id_anak`)) group by `a`.`id_pemasangan`;

DROP VIEW IF EXISTS `ajis_view_anak_juara`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_anak_juara` AS select `a`.`id_pemasangan_baru` AS `id_pemasangan_baru`,`a`.`id_anak` AS `id_anak`,`a`.`nik` AS `nik`,`a`.`nama_anak` AS `nama_anak`,`a`.`jns_kel` AS `jns_kel`,`a`.`asnaf` AS `asnaf`,`a`.`jenjang_pendidikan` AS `jenjang_pendidikan`,`a`.`kelas` AS `kelas`,`a`.`status_aj` AS `status_aj`,`a`.`nama_panggilan` AS `nama_panggilan`,`a`.`tempat_lahir` AS `tempat_lahir`,`a`.`tgl_lahir` AS `tgl_lahir`,`a`.`anak_ke` AS `anak_ke`,`a`.`dari_saudara` AS `dari_saudara`,`a`.`alamat` AS `alamat`,`a`.`nama_propinsi` AS `nama_propinsi`,`a`.`nama_kabupaten` AS `nama_kabupaten`,`a`.`nama_kecamatan` AS `nama_kecamatan`,`a`.`nama_desa` AS `nama_desa`,`a`.`desaid` AS `desaid`,`a`.`nama_sekolah` AS `nama_sekolah`,`a`.`alamat_sekolah` AS `alamat_sekolah`,`a`.`jurusan` AS `jurusan`,`a`.`semester` AS `semester`,`a`.`nama_pt` AS `nama_pt`,`a`.`alamat_pt` AS `alamat_pt`,`a`.`agama` AS `agama`,`a`.`foto` AS `foto`,`a`.`nilai` AS `nilai`,`a`.`pelajaran_favorit` AS `pelajaran_favorit`,`a`.`jarak_rumah` AS `jarak_rumah`,`a`.`alat_transportasi` AS `alat_transportasi`,`a`.`hobi` AS `hobi`,`a`.`prestasi` AS `prestasi`,`a`.`no_kartu_keluarga` AS `no_kartu_keluarga`,`a`.`status_survey` AS `status_survey`,`a`.`status_kelayakan` AS `status_kelayakan`,`a`.`status_tersantuni` AS `status_tersantuni`,`a`.`status_pinjam` AS `status_pinjam`,`a`.`nama_lengkap_ayah` AS `nama_lengkap_ayah`,`a`.`pekerjaan_ayah` AS `pekerjaan_ayah`,`a`.`penghasilan_rata_rata_ayah` AS `penghasilan_rata_rata_ayah`,`a`.`tanggal_kematian_ayah` AS `tanggal_kematian_ayah`,`a`.`penyebab_kematian_ayah` AS `penyebab_kematian_ayah`,`a`.`nama_lengkap_ibu` AS `nama_lengkap_ibu`,`a`.`pekerjaan_ibu` AS `pekerjaan_ibu`,`a`.`penghasilan_rata_rata_ibu` AS `penghasilan_rata_rata_ibu`,`a`.`tanggal_kematian_ibu` AS `tanggal_kematian_ibu`,`a`.`penyebab_kematian_ibu` AS `penyebab_kematian_ibu`,`a`.`nama_lengkap_wali` AS `nama_lengkap_wali`,`a`.`pekerjaan_wali` AS `pekerjaan_wali`,`a`.`penghasilan_rata_rata_wali` AS `penghasilan_rata_rata_wali`,`a`.`telp_yang_bisa_dihubungi` AS `telp_yang_bisa_dihubungi`,`a`.`atas_nama` AS `atas_nama`,`a`.`hubungan_kerabat` AS `hubungan_kerabat`,`a`.`via_input` AS `via_input`,`a`.`via_input_pemasangan` AS `via_input_pemasangan`,`a`.`user_insert_pemasangan` AS `user_insert_pemasangan`,`a`.`date_insert_pemasangan` AS `date_insert_pemasangan`,`a`.`via_stop` AS `via_stop`,`a`.`user_stop` AS `user_stop`,`a`.`status_ortu` AS `status_ortu`,`a`.`id_donatur` AS `id_donatur`,`a`.`nama_donatur` AS `nama_donatur`,`a`.`nia_rfo` AS `nia_rfo`,`a`.`nama_rfo` AS `nama_rfo`,`a`.`jcustid` AS `jcustid`,`a`.`jenis_kelamin_donatur` AS `jenis_kelamin_donatur`,`a`.`sapaan` AS `sapaan`,`a`.`jenis_donatur` AS `jenis_donatur`,`a`.`omid_donatur` AS `omid_donatur`,`a`.`oid_donatur` AS `oid_donatur`,`a`.`kantor_donatur` AS `kantor_donatur`,`a`.`telp` AS `telp`,`a`.`hp` AS `hp`,`a`.`email` AS `email`,`a`.`alamat_donatur` AS `alamat_donatur`,`a`.`alamat_silaturahmi` AS `alamat_silaturahmi`,`a`.`nama_kontak` AS `nama_kontak`,`a`.`telp_kontak` AS `telp_kontak`,`a`.`email_kontak` AS `email_kontak`,`a`.`jabatan_kontak` AS `jabatan_kontak`,`a`.`tipe_pelayanan` AS `tipe_pelayanan`,`a`.`id_kantor` AS `id_kantor`,`a`.`nama_kantor` AS `nama_kantor`,`a`.`id_wilayah_pembinaan` AS `id_wilayah_pembinaan`,`a`.`nama_wilayah` AS `nama_wilayah`,`a`.`program_donasi` AS `program_donasi`,`a`.`id_program` AS `id_program`,`a`.`harga_program` AS `harga_program`,`a`.`harga_penyaluran` AS `harga_penyaluran`,`a`.`status_mentor` AS `status_mentor`,`a`.`nama_mentor` AS `nama_mentor`,`a`.`status_pasangan` AS `status_pasangan`,`a`.`tgl_pemasangan` AS `tgl_pemasangan`,`a`.`tgl_pemberhentian_pemasangan` AS `tgl_pemberhentian_pemasangan`,`a`.`keterangan_pemberhentian` AS `keterangan_pemberhentian`,`a`.`no_rekening` AS `no_rekening`,`a`.`pemilik_rekening` AS `pemilik_rekening`,`a`.`aktif` AS `aktif`,`a`.`tunda_penyaluran` AS `tunda_penyaluran`,`a`.`id_naik_jenjang` AS `id_naik_jenjang`,`a`.`alasan_aktif` AS `alasan_aktif`,`a`.`id_zisco_resuser_erpwh` AS `id_zisco_resuser_erpwh`,`a`.`id_kantor_erpwh` AS `id_kantor_erpwh`,`a`.`id_donatur_erpwh` AS `id_donatur_erpwh`,`a`.`id_program_postgree` AS `id_program_postgree`,`a`.`id_peminjaman_erpwh` AS `id_peminjaman_erpwh`,ifnull(`d`.`saldo_awal_ganjil`,0) AS `saldo_awal_ganjil`,ifnull(`b`.`donasi_jan`,0) AS `donasi_jan`,ifnull(`b`.`donasi_feb`,0) AS `donasi_feb`,ifnull(`b`.`donasi_mar`,0) AS `donasi_mar`,ifnull(`b`.`donasi_apr`,0) AS `donasi_apr`,ifnull(`b`.`donasi_mei`,0) AS `donasi_mei`,ifnull(`b`.`donasi_jun`,0) AS `donasi_jun`,ifnull(`b`.`jml_donasi_ganjil`,0) AS `jml_berdonasi_ganjil`,ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) AS `donasi_plus_saldo_ganjil`,ifnull(`c`.`penyaluran_jan`,0) AS `penyaluran_jan`,ifnull(`c`.`penyaluran_feb`,0) AS `penyaluran_feb`,ifnull(`c`.`penyaluran_mar`,0) AS `penyaluran_mar`,ifnull(`c`.`penyaluran_apr`,0) AS `penyaluran_apr`,ifnull(`c`.`penyaluran_mei`,0) AS `penyaluran_mei`,ifnull(`c`.`penyaluran_jun`,0) AS `penyaluran_jun`,ifnull(ifnull(`c`.`jml_penyaluran_ganjil`,0),0) AS `jml_tersalurkan_ganjil`,ifnull(ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) - ifnull(`c`.`jml_penyaluran_ganjil`,0),0) AS `saldo_akhir_ganjil`,case when ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) - ifnull(`c`.`jml_penyaluran_ganjil`,0) < `a`.`harga_program` then 'Stop' when ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) - ifnull(`c`.`jml_penyaluran_ganjil`,0) > `a`.`harga_program` then 'Aktif' when ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) - ifnull(`c`.`jml_penyaluran_ganjil`,0) = `a`.`harga_program` then 'Aktif' end AS `aktif_ganjil`,case when (ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) > 0 and ifnull(`c`.`jml_penyaluran_ganjil`,0) > 0) then 'Wajib Lapsem' when (ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) > 0 and ifnull(`c`.`jml_penyaluran_ganjil`,0) = 0) then 'Koq Bisa?' when (ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) = 0 and ifnull(`c`.`jml_penyaluran_ganjil`,0) > 0) then 'Koq Bisa?' when (ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) = 0 and ifnull(`c`.`jml_penyaluran_ganjil`,0) = 0) then '' when ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) - ifnull(`c`.`jml_penyaluran_ganjil`,0) < 0 then 'Koq Bisa?' end AS `wajib_ganjil`,'' AS `jml_lapsem_ganjil`,ifnull(`d`.`saldo_awal_genap`,0) AS `saldo_awal_genap`,ifnull(`b`.`donasi_jul`,0) AS `donasi_jul`,ifnull(`b`.`donasi_agu`,0) AS `donasi_aug`,ifnull(`b`.`donasi_sep`,0) AS `donasi_sep`,ifnull(`b`.`donasi_okt`,0) AS `donasi_okt`,ifnull(`b`.`donasi_nov`,0) AS `donasi_nov`,ifnull(`b`.`donasi_des`,0) AS `donasi_des`,ifnull(`b`.`jml_donasi_genap`,0) AS `jml_berdonasi_genap`,ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) AS `donasi_plus_saldo_genap`,ifnull(`c`.`penyaluran_jul`,0) AS `penyaluran_jul`,ifnull(`c`.`penyaluran_agu`,0) AS `penyaluran_aug`,ifnull(`c`.`penyaluran_sep`,0) AS `penyaluran_sep`,ifnull(`c`.`penyaluran_okt`,0) AS `penyaluran_okt`,ifnull(`c`.`penyaluran_nov`,0) AS `penyaluran_nov`,ifnull(`c`.`penyaluran_des`,0) AS `penyaluran_des`,ifnull(ifnull(`c`.`jml_penyaluran_genap`,0),0) AS `jml_tersalurkan_genap`,ifnull(ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) - ifnull(`c`.`jml_penyaluran_genap`,0),0) AS `saldo_akhir_genap`,case when ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) - ifnull(`c`.`jml_penyaluran_genap`,0) < `a`.`harga_program` then 'Stop' when ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) - ifnull(`c`.`jml_penyaluran_genap`,0) > `a`.`harga_program` then 'Aktif' when ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) - ifnull(`c`.`jml_penyaluran_genap`,0) = `a`.`harga_program` then 'Aktif' end AS `aktif_genap`,case when (ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) > 0 and ifnull(`c`.`jml_penyaluran_genap`,0) > 0) then 'Wajib Lapsem' when (ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) > 0 and ifnull(`c`.`jml_penyaluran_genap`,0) = 0) then 'Koq Bisa?' when (ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) = 0 and ifnull(`c`.`jml_penyaluran_genap`,0) > 0) then 'Koq Bisa?' when (ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) = 0 and ifnull(`c`.`jml_penyaluran_genap`,0) = 0) then '' when ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) - ifnull(`c`.`jml_penyaluran_genap`,0) < 0 then 'Koq Bisa?' end AS `wajib_genap`,`a`.`tahun` AS `tahun`,`a`.`history` AS `history`,`d`.`saldo_akhir_ganjil` AS `saldo_opname_ganjil`,`d`.`saldo_akhir_genap` AS `saldo_opname_genap`,`d`.`keterangan` AS `keterangan_opname`,if(`d`.`saldo_akhir_ganjil` <> 0,'Sudah','Belum') AS `tupo_jan_jun`,if(`d`.`saldo_akhir_genap` <> 0,'Sudah','Belum') AS `tupo_jul_des`,case when month(current_timestamp()) > 6 then ifnull(ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) - ifnull(`c`.`jml_penyaluran_genap`,0),0) when month(current_timestamp()) <= 6 then ifnull(ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) - ifnull(`c`.`jml_penyaluran_ganjil`,0),0) end AS `saldo_akhir`,case when month(current_timestamp()) > 6 then `d`.`saldo_awal_genap` when month(current_timestamp()) <= 6 then `d`.`saldo_awal_ganjil` end AS `saldo_awal` from (((`ajis_view_profile` `a` left join `ajis_view_donasi` `b` on(`a`.`id_pemasangan_baru` = `b`.`id_pemasangan_baru`)) left join `ajis_opname` `d` on(`a`.`id_pemasangan_baru` = `d`.`id_pemasangan_baru`)) left join `ajis_view_penyaluran` `c` on(`a`.`id_pemasangan_baru` = `c`.`id_pemasangan_baru`)) group by `a`.`id_pemasangan_baru`;

DROP VIEW IF EXISTS `ajis_view_anak_juara_bb`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_anak_juara_bb` AS select `a`.`id_pemasangan_baru` AS `id_pemasangan_baru`,`a`.`id_anak` AS `id_anak`,`a`.`nik` AS `nik`,`a`.`nama_anak` AS `nama_anak`,`a`.`jns_kel` AS `jns_kel`,`a`.`asnaf` AS `asnaf`,`a`.`jenjang_pendidikan` AS `jenjang_pendidikan`,`a`.`kelas` AS `kelas`,`a`.`status_aj` AS `status_aj`,`a`.`nama_panggilan` AS `nama_panggilan`,`a`.`tempat_lahir` AS `tempat_lahir`,`a`.`tgl_lahir` AS `tgl_lahir`,`a`.`anak_ke` AS `anak_ke`,`a`.`dari_saudara` AS `dari_saudara`,`a`.`alamat` AS `alamat`,`a`.`nama_propinsi` AS `nama_propinsi`,`a`.`nama_kabupaten` AS `nama_kabupaten`,`a`.`nama_kecamatan` AS `nama_kecamatan`,`a`.`nama_desa` AS `nama_desa`,`a`.`desaid` AS `desaid`,`a`.`nama_sekolah` AS `nama_sekolah`,`a`.`alamat_sekolah` AS `alamat_sekolah`,`a`.`jurusan` AS `jurusan`,`a`.`semester` AS `semester`,`a`.`nama_pt` AS `nama_pt`,`a`.`alamat_pt` AS `alamat_pt`,`a`.`agama` AS `agama`,`a`.`foto` AS `foto`,`a`.`nilai` AS `nilai`,`a`.`pelajaran_favorit` AS `pelajaran_favorit`,`a`.`jarak_rumah` AS `jarak_rumah`,`a`.`alat_transportasi` AS `alat_transportasi`,`a`.`hobi` AS `hobi`,`a`.`prestasi` AS `prestasi`,`a`.`no_kartu_keluarga` AS `no_kartu_keluarga`,`a`.`status_survey` AS `status_survey`,`a`.`status_kelayakan` AS `status_kelayakan`,`a`.`status_tersantuni` AS `status_tersantuni`,`a`.`status_pinjam` AS `status_pinjam`,`a`.`nama_lengkap_ayah` AS `nama_lengkap_ayah`,`a`.`pekerjaan_ayah` AS `pekerjaan_ayah`,`a`.`penghasilan_rata_rata_ayah` AS `penghasilan_rata_rata_ayah`,`a`.`tanggal_kematian_ayah` AS `tanggal_kematian_ayah`,`a`.`penyebab_kematian_ayah` AS `penyebab_kematian_ayah`,`a`.`nama_lengkap_ibu` AS `nama_lengkap_ibu`,`a`.`pekerjaan_ibu` AS `pekerjaan_ibu`,`a`.`penghasilan_rata_rata_ibu` AS `penghasilan_rata_rata_ibu`,`a`.`tanggal_kematian_ibu` AS `tanggal_kematian_ibu`,`a`.`penyebab_kematian_ibu` AS `penyebab_kematian_ibu`,`a`.`nama_lengkap_wali` AS `nama_lengkap_wali`,`a`.`pekerjaan_wali` AS `pekerjaan_wali`,`a`.`penghasilan_rata_rata_wali` AS `penghasilan_rata_rata_wali`,`a`.`telp_yang_bisa_dihubungi` AS `telp_yang_bisa_dihubungi`,`a`.`atas_nama` AS `atas_nama`,`a`.`hubungan_kerabat` AS `hubungan_kerabat`,`a`.`via_input` AS `via_input`,`a`.`via_input_pemasangan` AS `via_input_pemasangan`,`a`.`user_insert_pemasangan` AS `user_insert_pemasangan`,`a`.`date_insert_pemasangan` AS `date_insert_pemasangan`,`a`.`via_stop` AS `via_stop`,`a`.`user_stop` AS `user_stop`,`a`.`status_ortu` AS `status_ortu`,`a`.`id_donatur` AS `id_donatur`,`a`.`id_kantor` AS `id_kantor`,`a`.`nama_kantor` AS `nama_kantor`,`a`.`id_wilayah_pembinaan` AS `id_wilayah_pembinaan`,`a`.`nama_wilayah` AS `nama_wilayah`,`a`.`program_donasi` AS `program_donasi`,`a`.`id_program` AS `id_program`,`a`.`harga_program` AS `harga_program`,`a`.`harga_penyaluran` AS `harga_penyaluran`,`a`.`status_mentor` AS `status_mentor`,`a`.`nama_mentor` AS `nama_mentor`,`a`.`status_pasangan` AS `status_pasangan`,`a`.`tgl_pemasangan` AS `tgl_pemasangan`,`a`.`tgl_pemberhentian_pemasangan` AS `tgl_pemberhentian_pemasangan`,`a`.`keterangan_pemberhentian` AS `keterangan_pemberhentian`,`a`.`no_rekening` AS `no_rekening`,`a`.`pemilik_rekening` AS `pemilik_rekening`,`a`.`aktif` AS `aktif`,`a`.`tunda_penyaluran` AS `tunda_penyaluran`,`a`.`id_naik_jenjang` AS `id_naik_jenjang`,`a`.`alasan_aktif` AS `alasan_aktif`,`a`.`id_zisco_resuser_erpwh` AS `id_zisco_resuser_erpwh`,`a`.`id_kantor_erpwh` AS `id_kantor_erpwh`,`a`.`id_donatur_erpwh` AS `id_donatur_erpwh`,`a`.`id_program_postgree` AS `id_program_postgree`,`a`.`id_peminjaman_erpwh` AS `id_peminjaman_erpwh`,ifnull(`d`.`saldo_awal_ganjil`,0) AS `saldo_awal_ganjil`,ifnull(`b`.`donasi_jan`,0) AS `donasi_jan`,ifnull(`b`.`donasi_feb`,0) AS `donasi_feb`,ifnull(`b`.`donasi_mar`,0) AS `donasi_mar`,ifnull(`b`.`donasi_apr`,0) AS `donasi_apr`,ifnull(`b`.`donasi_mei`,0) AS `donasi_mei`,ifnull(`b`.`donasi_jun`,0) AS `donasi_jun`,ifnull(`b`.`jml_donasi_ganjil`,0) AS `jml_berdonasi_ganjil`,ifnull(`b`.`jml_donasi_ganjil` + `d`.`saldo_awal_ganjil`,0) AS `donasi_plus_saldo_ganjil`,ifnull(`c`.`penyaluran_jan`,0) AS `penyaluran_jan`,ifnull(`c`.`penyaluran_feb`,0) AS `penyaluran_feb`,ifnull(`c`.`penyaluran_mar`,0) AS `penyaluran_mar`,ifnull(`c`.`penyaluran_apr`,0) AS `penyaluran_apr`,ifnull(`c`.`penyaluran_mei`,0) AS `penyaluran_mei`,ifnull(`c`.`penyaluran_jun`,0) AS `penyaluran_jun`,ifnull(ifnull(`c`.`jml_penyaluran_ganjil`,0),0) AS `jml_tersalurkan_ganjil`,ifnull(ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) - ifnull(`c`.`jml_penyaluran_ganjil`,0),0) AS `saldo_akhir_ganjil`,case when ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) - ifnull(`c`.`jml_penyaluran_ganjil`,0) < `a`.`harga_program` then 'Stop' when ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) - ifnull(`c`.`jml_penyaluran_ganjil`,0) > `a`.`harga_program` then 'Aktif' when ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) - ifnull(`c`.`jml_penyaluran_ganjil`,0) = `a`.`harga_program` then 'Aktif' end AS `aktif_ganjil`,case when (ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) > 0 and ifnull(`c`.`jml_penyaluran_ganjil`,0) > 0) then 'Wajib Lapsem' when (ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) > 0 and ifnull(`c`.`jml_penyaluran_ganjil`,0) = 0) then 'Koq Bisa?' when (ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) = 0 and ifnull(`c`.`jml_penyaluran_ganjil`,0) > 0) then 'Koq Bisa?' when (ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) = 0 and ifnull(`c`.`jml_penyaluran_ganjil`,0) = 0) then '' when ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) - ifnull(`c`.`jml_penyaluran_ganjil`,0) < 0 then 'Koq Bisa?' end AS `wajib_ganjil`,'' AS `jml_lapsem_ganjil`,ifnull(`d`.`saldo_awal_genap`,0) AS `saldo_awal_genap`,ifnull(`b`.`donasi_jul`,0) AS `donasi_jul`,ifnull(`b`.`donasi_agu`,0) AS `donasi_aug`,ifnull(`b`.`donasi_sep`,0) AS `donasi_sep`,ifnull(`b`.`donasi_okt`,0) AS `donasi_okt`,ifnull(`b`.`donasi_nov`,0) AS `donasi_nov`,ifnull(`b`.`donasi_des`,0) AS `donasi_des`,ifnull(`b`.`jml_donasi_genap`,0) AS `jml_berdonasi_genap`,ifnull(`b`.`jml_donasi_genap` + `d`.`saldo_awal_genap`,0) AS `donasi_plus_saldo_genap`,ifnull(`c`.`penyaluran_jul`,0) AS `penyaluran_jul`,ifnull(`c`.`penyaluran_agu`,0) AS `penyaluran_aug`,ifnull(`c`.`penyaluran_sep`,0) AS `penyaluran_sep`,ifnull(`c`.`penyaluran_okt`,0) AS `penyaluran_okt`,ifnull(`c`.`penyaluran_nov`,0) AS `penyaluran_nov`,ifnull(`c`.`penyaluran_des`,0) AS `penyaluran_des`,ifnull(ifnull(`c`.`jml_penyaluran_genap`,0),0) AS `jml_tersalurkan_genap`,ifnull(ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) - ifnull(`c`.`jml_penyaluran_genap`,0),0) AS `saldo_akhir_genap`,case when ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) - ifnull(`c`.`jml_penyaluran_genap`,0) < `a`.`harga_program` then 'Stop' when ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) - ifnull(`c`.`jml_penyaluran_genap`,0) > `a`.`harga_program` then 'Aktif' when ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) - ifnull(`c`.`jml_penyaluran_genap`,0) = `a`.`harga_program` then 'Aktif' end AS `aktif_genap`,case when (ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) > 0 and ifnull(`c`.`jml_penyaluran_genap`,0) > 0) then 'Wajib Lapsem' when (ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) > 0 and ifnull(`c`.`jml_penyaluran_genap`,0) = 0) then 'Koq Bisa?' when (ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) = 0 and ifnull(`c`.`jml_penyaluran_genap`,0) > 0) then 'Koq Bisa?' when (ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) = 0 and ifnull(`c`.`jml_penyaluran_genap`,0) = 0) then '' when ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) - ifnull(`c`.`jml_penyaluran_genap`,0) < 0 then 'Koq Bisa?' end AS `wajib_genap`,`a`.`tahun` AS `tahun`,`a`.`history` AS `history`,`d`.`saldo_akhir_ganjil` AS `saldo_opname_ganjil`,`d`.`saldo_akhir_genap` AS `saldo_opname_genap`,`d`.`keterangan` AS `keterangan_opname`,if(`d`.`saldo_akhir_ganjil` <> 0,'Sudah','Belum') AS `tupo_jan_jun`,if(`d`.`saldo_akhir_genap` <> 0,'Sudah','Belum') AS `tupo_jul_des`,case when month(current_timestamp()) > 6 then ifnull(ifnull(`b`.`jml_donasi_genap`,0) + ifnull(`d`.`saldo_awal_genap`,0) - ifnull(`c`.`jml_penyaluran_genap`,0),0) when month(current_timestamp()) <= 6 then ifnull(ifnull(`b`.`jml_donasi_ganjil`,0) + ifnull(`d`.`saldo_awal_ganjil`,0) - ifnull(`c`.`jml_penyaluran_ganjil`,0),0) end AS `saldo_akhir`,case when month(current_timestamp()) > 6 then `d`.`saldo_awal_genap` when month(current_timestamp()) <= 6 then `d`.`saldo_awal_ganjil` end AS `saldo_awal` from (((`ajis_view_profile_bb` `a` left join `ajis_view_donasi_bb` `b` on(`a`.`id_pemasangan_baru` = `b`.`id_pemasangan_baru`)) left join `ajis_opname_bb` `d` on(`a`.`id_pemasangan_baru` = `d`.`id_pemasangan_baru`)) left join `ajis_view_penyaluran` `c` on(`a`.`id_pemasangan_baru` = `c`.`id_pemasangan_baru`));

DROP VIEW IF EXISTS `ajis_view_antrian_approval_by_rfo`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`localhost` SQL SECURITY DEFINER VIEW `ajis_view_antrian_approval_by_rfo` AS select `ajis_view_ajuan`.`nia_rfo` AS `nia_rfo`,`ajis_view_ajuan`.`nama_rfo` AS `nama_rfo`,count(0) AS `total_antrian_approval` from `ajis_view_ajuan` where 1 and `ajis_view_ajuan`.`approve_funding` = 't' group by `ajis_view_ajuan`.`nia_rfo`;

DROP VIEW IF EXISTS `ajis_view_book_anak_by_rfo`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`localhost` SQL SECURITY DEFINER VIEW `ajis_view_book_anak_by_rfo` AS select `ajis_anak`.`nia_rfo_book` AS `nia_rfo`,`ajis_anak`.`nama_rfo_book` AS `nama_rfo`,count(0) AS `total_book` from `ajis_anak` where 1 and `ajis_anak`.`status_anak_juara` = 'caj' group by `ajis_anak`.`nia_rfo_book`;

DROP VIEW IF EXISTS `ajis_view_donasi`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`localhost` SQL SECURITY DEFINER VIEW `ajis_view_donasi` AS select `a`.`id_pemasangan_baru` AS `id_pemasangan_baru`,`a`.`id_anak` AS `id_anak`,`a`.`id_donatur` AS `id_donatur`,`a`.`program_donasi` AS `program_donasi`,sum(case when (`a`.`bulan` = 1 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_jan`,sum(case when (`a`.`bulan` = 2 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_feb`,sum(case when (`a`.`bulan` = 3 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_mar`,sum(case when (`a`.`bulan` = 4 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_apr`,sum(case when (`a`.`bulan` = 5 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_mei`,sum(case when (`a`.`bulan` = 6 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_jun`,sum(case when (`a`.`bulan` <= 6 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `jml_donasi_ganjil`,sum(case when (`a`.`bulan` = 7 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_jul`,sum(case when (`a`.`bulan` = 8 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_agu`,sum(case when (`a`.`bulan` = 9 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_sep`,sum(case when (`a`.`bulan` = 10 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_okt`,sum(case when (`a`.`bulan` = 11 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_nov`,sum(case when (`a`.`bulan` = 12 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_des`,sum(case when (`a`.`bulan` > 6 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `jml_donasi_genap`,`a`.`tahun` AS `tahun` from `ajis_input_donasi` `a` where 1 group by `a`.`id_pemasangan_baru`;

DROP VIEW IF EXISTS `ajis_view_donasi_bb`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_donasi_bb` AS select `a`.`id_pemasangan_baru` AS `id_pemasangan_baru`,`a`.`id_anak` AS `id_anak`,`a`.`id_donatur` AS `id_donatur`,`a`.`program_donasi` AS `program_donasi`,sum(case when (`a`.`bulan` = 1 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_jan`,sum(case when (`a`.`bulan` = 2 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_feb`,sum(case when (`a`.`bulan` = 3 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_mar`,sum(case when (`a`.`bulan` = 4 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_apr`,sum(case when (`a`.`bulan` = 5 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_mei`,sum(case when (`a`.`bulan` = 6 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_jun`,sum(case when (`a`.`bulan` <= 6 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `jml_donasi_ganjil`,sum(case when (`a`.`bulan` = 7 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_jul`,sum(case when (`a`.`bulan` = 8 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_agu`,sum(case when (`a`.`bulan` = 9 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_sep`,sum(case when (`a`.`bulan` = 10 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_okt`,sum(case when (`a`.`bulan` = 11 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_nov`,sum(case when (`a`.`bulan` = 12 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `donasi_des`,sum(case when (`a`.`bulan` > 6 and `a`.`jenis` = 'trans') then `a`.`nominal_donasi` else 0 end) AS `jml_donasi_genap`,`a`.`tahun` AS `tahun` from `ajis_input_donasi_bb` `a` where 1 group by `a`.`id_pemasangan_baru`;

DROP VIEW IF EXISTS `ajis_view_donasi_by_donatur_inserted`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_donasi_by_donatur_inserted` AS select `ajis_input_donasi`.`id_donatur` AS `id_donatur`,`ajis_input_donasi`.`nama_donatur` AS `nama_donatur`,format(sum(`ajis_input_donasi`.`nominal_donasi`),0,'de_DE') AS `donasi`,`ajis_input_donasi`.`bulan` AS `bulan`,`ajis_input_donasi`.`tahun` AS `tahun` from `ajis_input_donasi` where 1 group by `ajis_input_donasi`.`id_donatur`,`ajis_input_donasi`.`bulan`,`ajis_input_donasi`.`tahun` order by `ajis_input_donasi`.`tahun` desc,`ajis_input_donasi`.`bulan` desc,`ajis_input_donasi`.`nama_donatur`;

DROP VIEW IF EXISTS `ajis_view_donasi_kantor`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`localhost` SQL SECURITY DEFINER VIEW `ajis_view_donasi_kantor` AS select `a`.`id_kantor` AS `oid`,`a`.`nama_kantor` AS `nama_kantor`,sum(`a`.`donasi_jan`) AS `donasi_jan`,sum(`a`.`donasi_feb`) AS `donasi_feb`,sum(`a`.`donasi_mar`) AS `donasi_mar`,sum(`a`.`donasi_apr`) AS `donasi_apr`,sum(`a`.`donasi_mei`) AS `donasi_mei`,sum(`a`.`donasi_jun`) AS `donasi_jun`,sum(`a`.`donasi_jul`) AS `donasi_jul`,sum(`a`.`donasi_aug`) AS `donasi_aug`,sum(`a`.`donasi_sep`) AS `donasi_sep`,sum(`a`.`donasi_okt`) AS `donasi_okt`,sum(`a`.`donasi_nov`) AS `donasi_nov`,sum(`a`.`donasi_des`) AS `donasi_des`,`a`.`tahun` AS `tahun` from `ajis_view_anak_juara` `a` where 1 and `a`.`program_donasi`  not like '%khusus%' group by `a`.`id_kantor`,`a`.`tahun`;

DROP VIEW IF EXISTS `ajis_view_donatur_beasiswa_by_rfo`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`localhost` SQL SECURITY DEFINER VIEW `ajis_view_donatur_beasiswa_by_rfo` AS select `donatur`.`nia_rfo` AS `nia_rfo`,`donatur`.`nama_rfo` AS `nama_rfo`,count(0) AS `total_donatur_beasiswa` from `donatur` where `donatur`.`did` in (select distinct `transaksi`.`did` from `transaksi` group by `transaksi`.`did`) group by `donatur`.`nia_rfo`;

DROP VIEW IF EXISTS `ajis_view_donatur_unlink_by_rfo`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_donatur_unlink_by_rfo` AS select `donatur`.`nia_rfo` AS `nia_rfo`,`donatur`.`nama_rfo` AS `nama_rfo`,count(0) AS `total_unlink` from `donatur` where 1 and `donatur`.`did` in (select distinct `transaksi`.`did` from `transaksi` where `transaksi`.`jml_anak_ijis` = '0' and `transaksi`.`perkiraan_rp` > 0 and `transaksi`.`approve_salur` = 'y' and `transaksi`.`review` = 'y' group by `transaksi`.`did`) group by `donatur`.`nia_rfo`;

DROP VIEW IF EXISTS `ajis_view_hutang_saldo_2021`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_hutang_saldo_2021` AS select `a`.`id_anak` AS `id_anak`,`a`.`nama_anak` AS `nama_anak`,`a`.`id_donatur` AS `id_donatur`,case when `a`.`jcustid` = '1' then 'Retail' when `a`.`jcustid` = '2' then 'Corporate' when `a`.`jcustid` = '3' then 'Community' else 'unknown' end AS `jenis_donatur`,`a`.`nama_donatur` AS `nama_donatur`,`a`.`program_donasi` AS `program_donasi`,`a`.`nama_kantor` AS `nama_kantor_ijf`,`a`.`saldo_awal_ganjil` AS `saldo_awal`,`a`.`saldo_akhir_ganjil` AS `saldo_akhir`,`b`.`tgl_donasi_awal` AS `tgl_donasi_awal`,`b`.`tgl_donasi_terakhir` AS `tgl_donasi_terakhir`,`b`.`selisih_bulan` AS `selisih_bulan`,`b`.`selisih_transaksi_terakhir_hingga_sekarang` AS `selisih_transaksi_terakhir_hingga_sekarang` from (`ajis_view_anak_juara` `a` left join `ajis_view_selisih_tgl_donasi` `b` on(`a`.`id_anak` = `b`.`id_anak` and `a`.`id_donatur` = `b`.`id_donatur` and `a`.`program_donasi` = `b`.`program_donasi`)) where `a`.`tahun` = '2021' and `a`.`status_pasangan` = 'y' group by `a`.`id_anak`,`a`.`id_donatur`,`a`.`program_donasi`;

DROP VIEW IF EXISTS `ajis_view_hutang_saldo_2021_1`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_hutang_saldo_2021_1` AS select `a`.`id_anak` AS `id_anak`,`a`.`nama_anak` AS `nama_anak`,`a`.`id_donatur` AS `id_donatur`,case when `a`.`jcustid` = '1' then 'Retail' when `a`.`jcustid` = '2' then 'Corporate' when `a`.`jcustid` = '3' then 'Community' else 'unknown' end AS `jenis_donatur`,`a`.`nama_donatur` AS `nama_donatur`,`a`.`program_donasi` AS `program_donasi`,`a`.`nama_kantor` AS `nama_kantor_ijf`,`a`.`kantor_donatur` AS `kantor_donatur`,`a`.`saldo_awal_ganjil` AS `saldo_awal`,`a`.`saldo_akhir_ganjil` AS `saldo_akhir`,`b`.`tgl_donasi_awal` AS `tgl_donasi_awal`,`b`.`tgl_donasi_terakhir` AS `tgl_donasi_terakhir`,`b`.`selisih_bulan` AS `selisih_bulan`,`b`.`selisih_transaksi_terakhir_hingga_sekarang` AS `selisih_transaksi_terakhir_hingga_sekarang` from (`ajis_view_anak_juara` `a` left join `ajis_view_selisih_tgl_donasi` `b` on(`a`.`id_anak` = `b`.`id_anak` and `a`.`id_donatur` = `b`.`id_donatur` and `a`.`program_donasi` = `b`.`program_donasi`)) where `a`.`tahun` = '2021' and `a`.`status_pasangan` = 'y' group by `a`.`id_anak`,`a`.`id_donatur`,`a`.`program_donasi`;

DROP VIEW IF EXISTS `ajis_view_hutang_saldo_2021_new`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_hutang_saldo_2021_new` AS select `a`.`id_anak` AS `id_anak`,`a`.`nama_anak` AS `nama_anak`,`a`.`id_donatur` AS `id_donatur`,case when `a`.`jcustid` = '1' then 'Retail' when `a`.`jcustid` = '2' then 'Corporate' when `a`.`jcustid` = '3' then 'Community' else 'unknown' end AS `jenis_donatur`,`a`.`nama_donatur` AS `nama_donatur`,`a`.`program_donasi` AS `program_donasi`,`a`.`nama_kantor` AS `nama_kantor_ijf`,`a`.`kantor_donatur` AS `kantor_donatur`,`a`.`saldo_awal_ganjil` AS `saldo_awal`,`a`.`saldo_akhir_ganjil` AS `saldo_akhir`,`b`.`tgl_donasi_awal` AS `tgl_donasi_awal`,`b`.`tgl_donasi_terakhir` AS `tgl_donasi_terakhir`,`b`.`selisih_bulan` AS `selisih_bulan`,`b`.`selisih_transaksi_terakhir_hingga_sekarang` AS `selisih_transaksi_terakhir_hingga_sekarang` from (`ajis_view_anak_juara` `a` left join `ajis_view_selisih_tgl_donasi` `b` on(`a`.`id_anak` = `b`.`id_anak` and `a`.`id_donatur` = `b`.`id_donatur` and `a`.`program_donasi` = `b`.`program_donasi`)) where `a`.`tahun` = '2021' and `a`.`status_pasangan` = 'y' group by `a`.`id_anak`,`a`.`id_donatur`,`a`.`program_donasi`;

DROP VIEW IF EXISTS `ajis_view_penilaian`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`10.130.15.60` SQL SECURITY DEFINER VIEW `ajis_view_penilaian` AS select `a`.`id_anak` AS `id_anak`,`a`.`semesterid` AS `semesterid`,`b`.`semester` AS `semester`,`c`.`nama_lengkap` AS `nama_lengkap`,`c`.`kantor_id` AS `kantor_id`,`c`.`id_wilayah_pembinaan` AS `id_wilayah_pembinaan`,`d`.`kantor` AS `kantor`,`d`.`jenis` AS `jenis`,`e`.`nama_wilayah` AS `nama_wilayah`,count(case when (`a`.`id_item_penilaian` = '1' and `a`.`perkembangan_capaian` <> '') then `a`.`nilai_capaian` else 0 end) AS `kemampuan_membaca_quran`,round(sum(case when (`a`.`id_item_penilaian` = '2' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) / 2,0) AS `hafalan_quran`,sum(case when (`a`.`id_item_penilaian` = '3' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `hafalan_bacaan_sholat`,sum(case when (`a`.`id_item_penilaian` = '4' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `hafalan_doa_pilihan`,round(sum(case when (`a`.`id_item_penilaian` = '5' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) / 2,0) AS `kehadiran_pembinaan`,sum(case when (`a`.`id_item_penilaian` = '6' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `pembiasaan_shalat_wajib`,sum(case when (`a`.`id_item_penilaian` = '7' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `pembiasaan_sedekah`,sum(case when (`a`.`id_item_penilaian` = '8' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `pembiasaan_tilawah`,sum(case when (`a`.`id_item_penilaian` = '9' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `membantu_ortu`,sum(case when (`a`.`id_item_penilaian` = '13' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `pai`,sum(case when (`a`.`id_item_penilaian` = '14' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `pkn`,sum(case when (`a`.`id_item_penilaian` = '15' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `b_indo`,sum(case when (`a`.`id_item_penilaian` = '16' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `matematika`,sum(case when (`a`.`id_item_penilaian` = '17' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `ipa`,sum(case when (`a`.`id_item_penilaian` = '18' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `ips`,sum(case when (`a`.`id_item_penilaian` = '19' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `seni_budaya`,sum(case when (`a`.`id_item_penilaian` = '20' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `penjaskes`,count(case when `a`.`kategori` = 'Aspek Cerdas' then `a`.`aspek` else 0 end) AS `jml_aspek_cerdas`,sum(case when `a`.`kategori` = 'Aspek Cerdas' then `a`.`nilai_capaian` else 0 end) AS `jml_nilai_aspek_cerdas`,count(case when (`a`.`id_item_penilaian` = '21' and `a`.`perkembangan_capaian` <> '') then `a`.`nilai_capaian` else 0 end) AS `b_inggris`,count(case when (`a`.`id_item_penilaian` = '22' and `a`.`perkembangan_capaian` <> '') then `a`.`nilai_capaian` else 0 end) AS `prestasi_siswa`,count(case when (`a`.`id_item_penilaian` = '23' and `a`.`perkembangan_capaian` <> '') then `a`.`nilai_capaian` else 0 end) AS `baca_quran_siswa`,sum(case when (`a`.`id_item_penilaian` = '24' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `tahfidz_siswa`,sum(case when (`a`.`id_item_penilaian` = '25' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `bantu_ortu_siswa`,sum(case when (`a`.`id_item_penilaian` = '26' and `a`.`nilai_capaian` > 0) then `a`.`nilai_capaian` else 0 end) AS `shalat_wajib_siswa`,count(case when (`a`.`id_item_penilaian` = '27' and `a`.`perkembangan_capaian` <> '') then 1 else 0 end) AS `suara_anak_juara`,count(case when (`a`.`id_item_penilaian` = '28' and `a`.`perkembangan_capaian` <> '') then 1 else 0 end) AS `catatan_anak_juara`,count(case when (`a`.`id_item_penilaian` = '29' and `a`.`perkembangan_capaian` <> '') then 1 else 0 end) AS `suara_siswa_juara`,count(case when (`a`.`id_item_penilaian` = '30' and `a`.`perkembangan_capaian` <> '') then 1 else 0 end) AS `catatan_siswa_juara`,sum(case when (`a`.`id_item_penilaian` in ('5','6','7','8','9') and `a`.`skor` > 0) then `a`.`skor` else 0 end) AS `total_skor_mandiri`,round(sum(case when (`a`.`id_item_penilaian` in ('5','6','7','8','9') and `a`.`skor` > 0) then `a`.`skor` else 0 end) / 5,0) AS `rata_rata_skor_mandiri` from ((((`ajis_penilaian` `a` left join `ajis_semester` `b` on(`a`.`semesterid` = `b`.`semesterid`)) left join `ajis_anak` `c` on(`a`.`id_anak` = `c`.`id_anak`)) left join `ajis_kantor` `d` on(`c`.`kantor_id` = `d`.`oid`)) left join `ajis_wilayah_pembinaan` `e` on(`c`.`id_wilayah_pembinaan` = `e`.`id_wilayah_pembinaan`)) where 1 group by `a`.`id_anak`,`a`.`semesterid`;

DROP VIEW IF EXISTS `ajis_view_penyaluran`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`localhost` SQL SECURITY DEFINER VIEW `ajis_view_penyaluran` AS select `a`.`id_pemasangan_baru` AS `id_pemasangan_baru`,`a`.`id_anak` AS `id_anak`,`a`.`id_donatur` AS `id_donatur`,`a`.`program_donasi` AS `program_donasi`,sum(case when `a`.`bulan` = 1 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_jan`,sum(case when `a`.`bulan` = 2 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_feb`,sum(case when `a`.`bulan` = 3 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_mar`,sum(case when `a`.`bulan` = 4 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_apr`,sum(case when `a`.`bulan` = 5 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_mei`,sum(case when `a`.`bulan` = 6 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_jun`,sum(case when `a`.`bulan` <= 6 then `a`.`nominal_penyaluran` else 0 end) AS `jml_penyaluran_ganjil`,sum(case when `a`.`bulan` = 7 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_jul`,sum(case when `a`.`bulan` = 8 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_agu`,sum(case when `a`.`bulan` = 9 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_sep`,sum(case when `a`.`bulan` = 10 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_okt`,sum(case when `a`.`bulan` = 11 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_nov`,sum(case when `a`.`bulan` = 12 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_des`,sum(case when `a`.`bulan` > 6 then `a`.`nominal_penyaluran` else 0 end) AS `jml_penyaluran_genap`,`a`.`tahun` AS `tahun` from `ajis_penyaluran` `a` where 1 group by `a`.`id_pemasangan_baru`;

DROP VIEW IF EXISTS `ajis_view_penyaluran_kantor`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`localhost` SQL SECURITY DEFINER VIEW `ajis_view_penyaluran_kantor` AS select `a`.`id_kantor` AS `oid`,`a`.`nama_kantor` AS `nama_kantor`,sum(case when `a`.`bulan` = 1 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_jan`,sum(case when `a`.`bulan` = 2 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_feb`,sum(case when `a`.`bulan` = 3 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_mar`,sum(case when `a`.`bulan` = 4 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_apr`,sum(case when `a`.`bulan` = 5 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_mei`,sum(case when `a`.`bulan` = 6 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_jun`,sum(case when `a`.`bulan` <= 6 then `a`.`nominal_penyaluran` else 0 end) AS `jml_penyaluran_ganjil`,sum(case when `a`.`bulan` = 7 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_jul`,sum(case when `a`.`bulan` = 8 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_agu`,sum(case when `a`.`bulan` = 9 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_sep`,sum(case when `a`.`bulan` = 10 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_okt`,sum(case when `a`.`bulan` = 11 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_nov`,sum(case when `a`.`bulan` = 12 then `a`.`nominal_penyaluran` else 0 end) AS `penyaluran_des`,sum(case when `a`.`bulan` > 6 then `a`.`nominal_penyaluran` else 0 end) AS `jml_penyaluran_genap`,`a`.`tahun` AS `tahun` from `ajis_penyaluran` `a` where 1 and `a`.`program_donasi`  not like '%khusus%' group by `a`.`id_kantor`,`a`.`tahun`;

DROP VIEW IF EXISTS `ajis_view_perbandingan_transaksi_donasi`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_perbandingan_transaksi_donasi` AS select `a`.`id_donatur` AS `id_donatur`,`a`.`nama_donatur` AS `nama_donatur`,`a`.`transaksi` AS `transaksi`,`a`.`bulan_salur` AS `bulan_salur`,`a`.`tahun_salur` AS `tahun_salur`,`b`.`id_donatur` AS `id_donatur_donasi`,`b`.`nama_donatur` AS `nama_donatur_donasi`,`b`.`donasi` AS `donasi`,`b`.`bulan` AS `bulan`,`b`.`tahun` AS `tahun` from (`ajis_view_transaksi_by_donatur_inserted` `a` left join `ajis_view_donasi_by_donatur_inserted` `b` on(`a`.`id_donatur` = `b`.`id_donatur` and `a`.`bulan_salur` = `b`.`bulan` and `a`.`tahun_salur` = `b`.`tahun`));

DROP VIEW IF EXISTS `ajis_view_profile`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`localhost` SQL SECURITY DEFINER VIEW `ajis_view_profile` AS select `a`.`id_pemasangan_baru` AS `id_pemasangan_baru`,`b`.`id_anak` AS `id_anak`,`b`.`nik` AS `nik`,`b`.`nama_lengkap` AS `nama_anak`,`b`.`nama_panggilan` AS `nama_panggilan`,`b`.`jns_kel` AS `jns_kel`,`b`.`tempat_lahir` AS `tempat_lahir`,`b`.`tgl_lahir` AS `tgl_lahir`,`b`.`anak_ke` AS `anak_ke`,`b`.`dari_saudara` AS `dari_saudara`,`b`.`alamat` AS `alamat`,`b`.`nama_propinsi` AS `nama_propinsi`,`b`.`nama_kabupaten` AS `nama_kabupaten`,`b`.`nama_kecamatan` AS `nama_kecamatan`,`b`.`nama_desa` AS `nama_desa`,`b`.`nama_sekolah` AS `nama_sekolah`,`b`.`alamat_sekolah` AS `alamat_sekolah`,`b`.`jurusan` AS `jurusan`,`b`.`semester` AS `semester`,`b`.`nama_pt` AS `nama_pt`,`b`.`alamat_pt` AS `alamat_pt`,`b`.`agama` AS `agama`,`b`.`foto` AS `foto`,`b`.`nilai` AS `nilai`,`b`.`pelajaran_favorit` AS `pelajaran_favorit`,`b`.`jarak_rumah` AS `jarak_rumah`,`b`.`alat_transportasi` AS `alat_transportasi`,`b`.`hobi` AS `hobi`,`b`.`prestasi` AS `prestasi`,`b`.`no_kartu_keluarga` AS `no_kartu_keluarga`,`b`.`status_survey` AS `status_survey`,`b`.`status_kelayakan` AS `status_kelayakan`,`b`.`status_tersantuni` AS `status_tersantuni`,`b`.`status_pinjam` AS `status_pinjam`,`b`.`status_mentor` AS `status_mentor`,`b`.`nama_lengkap_ayah` AS `nama_lengkap_ayah`,`b`.`pekerjaan_ayah` AS `pekerjaan_ayah`,`b`.`penghasilan_rata_rata_ayah` AS `penghasilan_rata_rata_ayah`,`b`.`tanggal_kematian_ayah` AS `tanggal_kematian_ayah`,`b`.`penyebab_kematian_ayah` AS `penyebab_kematian_ayah`,`b`.`nama_lengkap_ibu` AS `nama_lengkap_ibu`,`b`.`pekerjaan_ibu` AS `pekerjaan_ibu`,`b`.`penghasilan_rata_rata_ibu` AS `penghasilan_rata_rata_ibu`,`b`.`tanggal_kematian_ibu` AS `tanggal_kematian_ibu`,`b`.`penyebab_kematian_ibu` AS `penyebab_kematian_ibu`,`b`.`nama_lengkap_wali` AS `nama_lengkap_wali`,`b`.`pekerjaan_wali` AS `pekerjaan_wali`,`b`.`penghasilan_rata_rata_wali` AS `penghasilan_rata_rata_wali`,`b`.`telp_yang_bisa_dihubungi` AS `telp_yang_bisa_dihubungi`,`b`.`atas_nama` AS `atas_nama`,`b`.`hubungan_kerabat` AS `hubungan_kerabat`,`b`.`aktif` AS `aktif`,`b`.`via_input` AS `via_input`,`b`.`asnaf` AS `asnaf`,`b`.`jenjang_pendidikan` AS `jenjang_pendidikan`,`b`.`kelas` AS `kelas`,`b`.`status_anak_juara` AS `status_aj`,`b`.`status_ortu` AS `status_ortu`,`a`.`id_donatur` AS `id_donatur`,`d`.`nama_lengkap` AS `nama_donatur`,`d`.`nia_rfo` AS `nia_rfo`,`d`.`nama_rfo` AS `nama_rfo`,`d`.`jcustid` AS `jcustid`,case when `d`.`jcustid` = '1' then 'retail' when `d`.`jcustid` = '2' then 'corporate' when `d`.`jcustid` = '3' then 'community' end AS `jenis_donatur`,`d`.`jenis_kelamin` AS `jenis_kelamin_donatur`,case when `d`.`jenis_kelamin` = 'l' then 'Pak' when `d`.`jenis_kelamin` = 'p' then 'Ibu' else '' end AS `sapaan`,`d`.`omid_donatur` AS `omid_donatur`,`d`.`oid_donatur` AS `oid_donatur`,`d`.`kantor_donatur` AS `kantor_donatur`,`d`.`telp` AS `telp`,`d`.`hp` AS `hp`,`d`.`email` AS `email`,`d`.`alamat_lengkap` AS `alamat_donatur`,`d`.`alamat_silaturahmi` AS `alamat_silaturahmi`,`d`.`nama_kontak` AS `nama_kontak`,`d`.`telp_kontak` AS `telp_kontak`,`d`.`email_kontak` AS `email_kontak`,`d`.`jabatan_kontak` AS `jabatan_kontak`,`d`.`tipe_pelayanan` AS `tipe_pelayanan`,`b`.`kantor_id` AS `id_kantor`,`b`.`nama_kantor` AS `nama_kantor`,`b`.`id_wilayah_pembinaan` AS `id_wilayah_pembinaan`,`b`.`nama_wilayah` AS `nama_wilayah`,`a`.`program_donasi` AS `program_donasi`,`a`.`id_program` AS `id_program`,`a`.`harga_program` AS `harga_program`,`a`.`harga_penyaluran` AS `harga_penyaluran`,`c`.`nama_lengkap` AS `nama_mentor`,`a`.`status_pasangan` AS `status_pasangan`,`a`.`tgl_pemasangan` AS `tgl_pemasangan`,`a`.`tgl_pemberhentian_pemasangan` AS `tgl_pemberhentian_pemasangan`,`a`.`keterangan_pemberhentian` AS `keterangan_pemberhentian`,`b`.`no_rekening` AS `no_rekening`,`b`.`pemilik_rekening` AS `pemilik_rekening`,`b`.`desaid` AS `desaid`,`a`.`tunda_penyaluran` AS `tunda_penyaluran`,`a`.`id_naik_jenjang` AS `id_naik_jenjang`,`a`.`tahun` AS `tahun`,`a`.`history` AS `history`,`a`.`via_input` AS `via_input_pemasangan`,`a`.`user_insert` AS `user_insert_pemasangan`,`a`.`date_insert` AS `date_insert_pemasangan`,`a`.`user_stop` AS `user_stop`,`a`.`via_stop` AS `via_stop`,`a`.`alasan_aktif` AS `alasan_aktif`,`a`.`id_zisco_resuser_erpwh` AS `id_zisco_resuser_erpwh`,`a`.`id_kantor_erpwh` AS `id_kantor_erpwh`,`a`.`id_donatur_erpwh` AS `id_donatur_erpwh`,`a`.`id_program_postgree` AS `id_program_postgree`,`a`.`id_peminjaman_erpwh` AS `id_peminjaman_erpwh` from (((`ajis_pemasangan` `a` left join `ajis_anak` `b` on(`b`.`id_anak` = `a`.`id_anak`)) left join `ajis_sdm_wilayah` `c` on(`c`.`id_sdm` = `b`.`id_sdm`)) left join `donatur` `d` on(`a`.`id_donatur` = `d`.`did`)) where 1 order by `b`.`nama_lengkap`;

DROP VIEW IF EXISTS `ajis_view_profile2`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_profile2` AS select `a`.`id_pemasangan_baru` AS `id_pemasangan_baru`,`b`.`id_anak` AS `id_anak`,`b`.`nik` AS `nik`,`b`.`nama_lengkap` AS `nama_anak`,`b`.`nama_panggilan` AS `nama_panggilan`,`b`.`jns_kel` AS `jns_kel`,`b`.`tempat_lahir` AS `tempat_lahir`,`b`.`tgl_lahir` AS `tgl_lahir`,`b`.`anak_ke` AS `anak_ke`,`b`.`dari_saudara` AS `dari_saudara`,`b`.`alamat` AS `alamat`,`b`.`nama_propinsi` AS `nama_propinsi`,`b`.`nama_kabupaten` AS `nama_kabupaten`,`b`.`nama_kecamatan` AS `nama_kecamatan`,`b`.`nama_desa` AS `nama_desa`,`b`.`nama_sekolah` AS `nama_sekolah`,`b`.`alamat_sekolah` AS `alamat_sekolah`,`b`.`jurusan` AS `jurusan`,`b`.`semester` AS `semester`,`b`.`nama_pt` AS `nama_pt`,`b`.`alamat_pt` AS `alamat_pt`,`b`.`agama` AS `agama`,`b`.`foto` AS `foto`,`b`.`nilai` AS `nilai`,`b`.`pelajaran_favorit` AS `pelajaran_favorit`,`b`.`jarak_rumah` AS `jarak_rumah`,`b`.`alat_transportasi` AS `alat_transportasi`,`b`.`hobi` AS `hobi`,`b`.`prestasi` AS `prestasi`,`b`.`no_kartu_keluarga` AS `no_kartu_keluarga`,`b`.`status_survey` AS `status_survey`,`b`.`status_kelayakan` AS `status_kelayakan`,`b`.`status_tersantuni` AS `status_tersantuni`,`b`.`status_pinjam` AS `status_pinjam`,`b`.`status_mentor` AS `status_mentor`,`b`.`nama_lengkap_ayah` AS `nama_lengkap_ayah`,`b`.`pekerjaan_ayah` AS `pekerjaan_ayah`,`b`.`penghasilan_rata_rata_ayah` AS `penghasilan_rata_rata_ayah`,`b`.`tanggal_kematian_ayah` AS `tanggal_kematian_ayah`,`b`.`penyebab_kematian_ayah` AS `penyebab_kematian_ayah`,`b`.`nama_lengkap_ibu` AS `nama_lengkap_ibu`,`b`.`pekerjaan_ibu` AS `pekerjaan_ibu`,`b`.`penghasilan_rata_rata_ibu` AS `penghasilan_rata_rata_ibu`,`b`.`tanggal_kematian_ibu` AS `tanggal_kematian_ibu`,`b`.`penyebab_kematian_ibu` AS `penyebab_kematian_ibu`,`b`.`nama_lengkap_wali` AS `nama_lengkap_wali`,`b`.`pekerjaan_wali` AS `pekerjaan_wali`,`b`.`penghasilan_rata_rata_wali` AS `penghasilan_rata_rata_wali`,`b`.`telp_yang_bisa_dihubungi` AS `telp_yang_bisa_dihubungi`,`b`.`atas_nama` AS `atas_nama`,`b`.`hubungan_kerabat` AS `hubungan_kerabat`,`b`.`aktif` AS `aktif`,`b`.`via_input` AS `via_input`,`b`.`asnaf` AS `asnaf`,`b`.`jenjang_pendidikan` AS `jenjang_pendidikan`,`b`.`kelas` AS `kelas`,`b`.`status_anak_juara` AS `status_aj`,`b`.`status_ortu` AS `status_ortu`,`a`.`id_donatur` AS `id_donatur`,`d`.`nama_lengkap` AS `nama_donatur`,`d`.`nia_rfo` AS `nia_rfo`,`d`.`nama_rfo` AS `nama_rfo`,`d`.`jcustid` AS `jcustid`,case when `d`.`jcustid` = '1' then 'retail' when `d`.`jcustid` = '2' then 'corporate' when `d`.`jcustid` = '3' then 'community' end AS `jenis_donatur`,`d`.`jenis_kelamin` AS `jenis_kelamin_donatur`,case when `d`.`jenis_kelamin` = 'l' then 'Pak' when `d`.`jenis_kelamin` = 'p' then 'Ibu' else '' end AS `sapaan`,`d`.`omid_donatur` AS `omid_donatur`,`d`.`oid_donatur` AS `oid_donatur`,`d`.`kantor_donatur` AS `kantor_donatur`,`d`.`telp` AS `telp`,`d`.`hp` AS `hp`,`d`.`email` AS `email`,`d`.`alamat_lengkap` AS `alamat_donatur`,`d`.`alamat_silaturahmi` AS `alamat_silaturahmi`,`d`.`nama_kontak` AS `nama_kontak`,`d`.`telp_kontak` AS `telp_kontak`,`d`.`email_kontak` AS `email_kontak`,`d`.`jabatan_kontak` AS `jabatan_kontak`,`d`.`tipe_pelayanan` AS `tipe_pelayanan`,`b`.`kantor_id` AS `id_kantor`,`b`.`nama_kantor` AS `nama_kantor`,`b`.`id_wilayah_pembinaan` AS `id_wilayah_pembinaan`,`b`.`nama_wilayah` AS `nama_wilayah`,`a`.`program_donasi` AS `program_donasi`,`a`.`id_program` AS `id_program`,`a`.`harga_program` AS `harga_program`,`a`.`harga_penyaluran` AS `harga_penyaluran`,`c`.`nama_lengkap` AS `nama_mentor`,`a`.`status_pasangan` AS `status_pasangan`,`a`.`tgl_pemasangan` AS `tgl_pemasangan`,`a`.`tgl_pemberhentian_pemasangan` AS `tgl_pemberhentian_pemasangan`,`a`.`keterangan_pemberhentian` AS `keterangan_pemberhentian`,`b`.`no_rekening` AS `no_rekening`,`b`.`pemilik_rekening` AS `pemilik_rekening`,`b`.`desaid` AS `desaid`,`a`.`tunda_penyaluran` AS `tunda_penyaluran`,`a`.`id_naik_jenjang` AS `id_naik_jenjang`,`a`.`tahun` AS `tahun`,`a`.`history` AS `history`,`a`.`via_input` AS `via_input_pemasangan`,`a`.`user_insert` AS `user_insert_pemasangan`,`a`.`date_insert` AS `date_insert_pemasangan`,`a`.`user_stop` AS `user_stop`,`a`.`via_stop` AS `via_stop`,`a`.`alasan_aktif` AS `alasan_aktif`,`a`.`id_zisco_resuser_erpwh` AS `id_zisco_resuser_erpwh`,`a`.`id_kantor_erpwh` AS `id_kantor_erpwh`,`a`.`id_donatur_erpwh` AS `id_donatur_erpwh`,`a`.`id_program_postgree` AS `id_program_postgree`,`a`.`id_peminjaman_erpwh` AS `id_peminjaman_erpwh` from (((`ajis_pemasangan` `a` left join `ajis_anak` `b` on(`b`.`id_anak` = `a`.`id_anak`)) left join `ajis_sdm_wilayah` `c` on(`c`.`id_sdm` = `b`.`id_sdm`)) left join `donatur` `d` on(`a`.`id_donatur` = `d`.`did`)) order by `b`.`nama_lengkap`;

DROP VIEW IF EXISTS `ajis_view_profile_bb`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_profile_bb` AS select `a`.`id_pemasangan_baru` AS `id_pemasangan_baru`,`b`.`id_anak` AS `id_anak`,`b`.`nik` AS `nik`,`b`.`nama_lengkap` AS `nama_anak`,`b`.`nama_panggilan` AS `nama_panggilan`,`b`.`jns_kel` AS `jns_kel`,`b`.`tempat_lahir` AS `tempat_lahir`,`b`.`tgl_lahir` AS `tgl_lahir`,`b`.`anak_ke` AS `anak_ke`,`b`.`dari_saudara` AS `dari_saudara`,`b`.`alamat` AS `alamat`,`b`.`nama_propinsi` AS `nama_propinsi`,`b`.`nama_kabupaten` AS `nama_kabupaten`,`b`.`nama_kecamatan` AS `nama_kecamatan`,`b`.`nama_desa` AS `nama_desa`,`b`.`nama_sekolah` AS `nama_sekolah`,`b`.`alamat_sekolah` AS `alamat_sekolah`,`b`.`jurusan` AS `jurusan`,`b`.`semester` AS `semester`,`b`.`nama_pt` AS `nama_pt`,`b`.`alamat_pt` AS `alamat_pt`,`b`.`agama` AS `agama`,`b`.`foto` AS `foto`,`b`.`nilai` AS `nilai`,`b`.`pelajaran_favorit` AS `pelajaran_favorit`,`b`.`jarak_rumah` AS `jarak_rumah`,`b`.`alat_transportasi` AS `alat_transportasi`,`b`.`hobi` AS `hobi`,`b`.`prestasi` AS `prestasi`,`b`.`no_kartu_keluarga` AS `no_kartu_keluarga`,`b`.`status_survey` AS `status_survey`,`b`.`status_kelayakan` AS `status_kelayakan`,`b`.`status_tersantuni` AS `status_tersantuni`,`b`.`status_pinjam` AS `status_pinjam`,`b`.`status_mentor` AS `status_mentor`,`b`.`nama_lengkap_ayah` AS `nama_lengkap_ayah`,`b`.`pekerjaan_ayah` AS `pekerjaan_ayah`,`b`.`penghasilan_rata_rata_ayah` AS `penghasilan_rata_rata_ayah`,`b`.`tanggal_kematian_ayah` AS `tanggal_kematian_ayah`,`b`.`penyebab_kematian_ayah` AS `penyebab_kematian_ayah`,`b`.`nama_lengkap_ibu` AS `nama_lengkap_ibu`,`b`.`pekerjaan_ibu` AS `pekerjaan_ibu`,`b`.`penghasilan_rata_rata_ibu` AS `penghasilan_rata_rata_ibu`,`b`.`tanggal_kematian_ibu` AS `tanggal_kematian_ibu`,`b`.`penyebab_kematian_ibu` AS `penyebab_kematian_ibu`,`b`.`nama_lengkap_wali` AS `nama_lengkap_wali`,`b`.`pekerjaan_wali` AS `pekerjaan_wali`,`b`.`penghasilan_rata_rata_wali` AS `penghasilan_rata_rata_wali`,`b`.`telp_yang_bisa_dihubungi` AS `telp_yang_bisa_dihubungi`,`b`.`atas_nama` AS `atas_nama`,`b`.`hubungan_kerabat` AS `hubungan_kerabat`,`b`.`aktif` AS `aktif`,`b`.`via_input` AS `via_input`,`b`.`asnaf` AS `asnaf`,`b`.`jenjang_pendidikan` AS `jenjang_pendidikan`,`b`.`kelas` AS `kelas`,`b`.`status_anak_juara` AS `status_aj`,`b`.`status_ortu` AS `status_ortu`,`a`.`id_donatur` AS `id_donatur`,`b`.`kantor_id` AS `id_kantor`,`b`.`nama_kantor` AS `nama_kantor`,`b`.`id_wilayah_pembinaan` AS `id_wilayah_pembinaan`,`b`.`nama_wilayah` AS `nama_wilayah`,`a`.`program_donasi` AS `program_donasi`,`a`.`id_program` AS `id_program`,`a`.`harga_program` AS `harga_program`,`a`.`harga_penyaluran` AS `harga_penyaluran`,`c`.`nama_lengkap` AS `nama_mentor`,`a`.`status_pasangan` AS `status_pasangan`,`a`.`tgl_pemasangan` AS `tgl_pemasangan`,`a`.`tgl_pemberhentian_pemasangan` AS `tgl_pemberhentian_pemasangan`,`a`.`keterangan_pemberhentian` AS `keterangan_pemberhentian`,`b`.`no_rekening` AS `no_rekening`,`b`.`pemilik_rekening` AS `pemilik_rekening`,`b`.`desaid` AS `desaid`,`a`.`tunda_penyaluran` AS `tunda_penyaluran`,`a`.`id_naik_jenjang` AS `id_naik_jenjang`,`a`.`tahun` AS `tahun`,`a`.`history` AS `history`,`a`.`via_input` AS `via_input_pemasangan`,`a`.`user_insert` AS `user_insert_pemasangan`,`a`.`date_insert` AS `date_insert_pemasangan`,`a`.`user_stop` AS `user_stop`,`a`.`via_stop` AS `via_stop`,`a`.`alasan_aktif` AS `alasan_aktif`,`a`.`id_zisco_resuser_erpwh` AS `id_zisco_resuser_erpwh`,`a`.`id_kantor_erpwh` AS `id_kantor_erpwh`,`a`.`id_donatur_erpwh` AS `id_donatur_erpwh`,`a`.`id_program_postgree` AS `id_program_postgree`,`a`.`id_peminjaman_erpwh` AS `id_peminjaman_erpwh` from ((`ajis_pemasangan_bb` `a` left join `ajis_anak` `b` on(`b`.`id_anak` = `a`.`id_anak`)) left join `ajis_sdm_wilayah` `c` on(`c`.`id_sdm` = `b`.`id_sdm`)) group by `a`.`id_pemasangan_baru` order by `b`.`nama_lengkap`;

DROP VIEW IF EXISTS `ajis_view_rekap_penilaian`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_rekap_penilaian` AS select `ajis_view_penilaian`.`id_anak` AS `id_anak`,`ajis_view_penilaian`.`semesterid` AS `semesterid`,`ajis_view_penilaian`.`semester` AS `semester`,`ajis_view_penilaian`.`nama_lengkap` AS `nama_lengkap`,`ajis_view_penilaian`.`kantor_id` AS `kantor_id`,`ajis_view_penilaian`.`id_wilayah_pembinaan` AS `id_wilayah_pembinaan`,`ajis_view_penilaian`.`kantor` AS `kantor`,`ajis_view_penilaian`.`jenis` AS `jenis`,`ajis_view_penilaian`.`nama_wilayah` AS `nama_wilayah`,`ajis_view_penilaian`.`kemampuan_membaca_quran` AS `kemampuan_membaca_quran`,`ajis_view_penilaian`.`hafalan_quran` AS `hafalan_quran`,`ajis_view_penilaian`.`hafalan_bacaan_sholat` AS `hafalan_bacaan_sholat`,`ajis_view_penilaian`.`hafalan_doa_pilihan` AS `hafalan_doa_pilihan`,`ajis_view_penilaian`.`kehadiran_pembinaan` AS `kehadiran_pembinaan`,`ajis_view_penilaian`.`pembiasaan_shalat_wajib` AS `pembiasaan_shalat_wajib`,`ajis_view_penilaian`.`pembiasaan_sedekah` AS `pembiasaan_sedekah`,`ajis_view_penilaian`.`pembiasaan_tilawah` AS `pembiasaan_tilawah`,`ajis_view_penilaian`.`membantu_ortu` AS `membantu_ortu`,`ajis_view_penilaian`.`pai` AS `pai`,`ajis_view_penilaian`.`pkn` AS `pkn`,`ajis_view_penilaian`.`b_indo` AS `b_indo`,`ajis_view_penilaian`.`matematika` AS `matematika`,`ajis_view_penilaian`.`ipa` AS `ipa`,`ajis_view_penilaian`.`ips` AS `ips`,`ajis_view_penilaian`.`seni_budaya` AS `seni_budaya`,`ajis_view_penilaian`.`penjaskes` AS `penjaskes`,`ajis_view_penilaian`.`b_inggris` AS `b_inggris`,`ajis_view_penilaian`.`prestasi_siswa` AS `prestasi_siswa`,`ajis_view_penilaian`.`baca_quran_siswa` AS `baca_quran_siswa`,`ajis_view_penilaian`.`tahfidz_siswa` AS `tahfidz_siswa`,`ajis_view_penilaian`.`bantu_ortu_siswa` AS `bantu_ortu_siswa`,`ajis_view_penilaian`.`shalat_wajib_siswa` AS `shalat_wajib_siswa`,`ajis_view_penilaian`.`total_skor_mandiri` AS `total_skor_mandiri`,`ajis_view_penilaian`.`rata_rata_skor_mandiri` AS `rata_rata_skor_mandiri`,case when (`ajis_view_penilaian`.`kemampuan_membaca_quran` > 0 and `ajis_view_penilaian`.`hafalan_quran` > 0 and `ajis_view_penilaian`.`hafalan_bacaan_sholat` > 0 and `ajis_view_penilaian`.`hafalan_doa_pilihan` > 0 and `ajis_view_penilaian`.`kehadiran_pembinaan` > 0 and `ajis_view_penilaian`.`pembiasaan_shalat_wajib` > 0 and `ajis_view_penilaian`.`pembiasaan_sedekah` > 0 and `ajis_view_penilaian`.`pembiasaan_tilawah` > 0 and `ajis_view_penilaian`.`membantu_ortu` > 0) then '1' else '0' end AS `layak_juara`,case when (`ajis_view_penilaian`.`pai` > 0 and `ajis_view_penilaian`.`pkn` > 0 and `ajis_view_penilaian`.`b_indo` > 0 and `ajis_view_penilaian`.`matematika` > 0 and `ajis_view_penilaian`.`ipa` > 0 and `ajis_view_penilaian`.`ips` > 0 and `ajis_view_penilaian`.`seni_budaya` > 0 and `ajis_view_penilaian`.`penjaskes` > 0 and `ajis_view_penilaian`.`b_inggris` > 0 and `ajis_view_penilaian`.`prestasi_siswa` > 0 and `ajis_view_penilaian`.`baca_quran_siswa` > 0 and `ajis_view_penilaian`.`tahfidz_siswa` > 0 and `ajis_view_penilaian`.`bantu_ortu_siswa` > 0 and `ajis_view_penilaian`.`shalat_wajib_siswa` > 0) then '1' else '0' end AS `layak_siswa` from `ajis_view_penilaian`;

DROP VIEW IF EXISTS `ajis_view_rekap_zams`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`localhost` SQL SECURITY DEFINER VIEW `ajis_view_rekap_zams` AS select `a`.`nia_rfo` AS `nia_rfo`,`a`.`nama_rfo` AS `nama_rfo`,`a`.`kantor_donatur` AS `kantor_donatur`,`a`.`oid_donatur` AS `oid_donatur`,`a`.`omid_donatur` AS `omid_donatur`,`a`.`total_donatur` AS `total_donatur`,ifnull(`b`.`total_donatur_beasiswa`,0) AS `total_donatur_beasiswa`,ifnull(`a`.`total_donatur` - `b`.`total_donatur_beasiswa`,0) AS `total_belum_beasiswa`,ifnull(`c`.`total_unlink`,0) AS `total_unlink`,ifnull(`d`.`total_saldo_habis`,0) AS `total_saldo_habis`,ifnull(`e`.`total_urgent`,0) AS `total_saldo_urgent`,ifnull(`f`.`total_book`,0) AS `total_book`,ifnull(`g`.`total_antrian_approval`,0) AS `total_antrian_approval` from ((((((`ajis_view_rfo` `a` left join `ajis_view_donatur_beasiswa_by_rfo` `b` on(`a`.`nia_rfo` = `b`.`nia_rfo`)) left join `ajis_view_donatur_unlink_by_rfo` `c` on(`a`.`nia_rfo` = `c`.`nia_rfo`)) left join `ajis_view_saldo_anak_habis_by_rfo` `d` on(`a`.`nia_rfo` = `d`.`nia_rfo`)) left join `ajis_view_saldo_anak_urgent_by_rfo` `e` on(`a`.`nia_rfo` = `e`.`nia_rfo`)) left join `ajis_view_book_anak_by_rfo` `f` on(`a`.`nia_rfo` = `f`.`nia_rfo`)) left join `ajis_view_antrian_approval_by_rfo` `g` on(`a`.`nia_rfo` = `g`.`nia_rfo`)) where 1 group by `a`.`nia_rfo`;

DROP VIEW IF EXISTS `ajis_view_resume_penilaian`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_resume_penilaian` AS select `ajis_view_rekap_penilaian`.`id_anak` AS `id_anak`,`ajis_view_rekap_penilaian`.`semesterid` AS `semesterid`,`ajis_view_rekap_penilaian`.`semester` AS `semester`,`ajis_view_rekap_penilaian`.`nama_lengkap` AS `nama_lengkap`,`ajis_view_rekap_penilaian`.`kantor_id` AS `kantor_id`,`ajis_view_rekap_penilaian`.`id_wilayah_pembinaan` AS `id_wilayah_pembinaan`,`ajis_view_rekap_penilaian`.`kantor` AS `kantor`,`ajis_view_rekap_penilaian`.`jenis` AS `jenis`,`ajis_view_rekap_penilaian`.`nama_wilayah` AS `nama_wilayah`,`ajis_view_rekap_penilaian`.`kemampuan_membaca_quran` AS `kemampuan_membaca_quran`,`ajis_view_rekap_penilaian`.`hafalan_quran` AS `hafalan_quran`,`ajis_view_rekap_penilaian`.`hafalan_bacaan_sholat` AS `hafalan_bacaan_sholat`,`ajis_view_rekap_penilaian`.`hafalan_doa_pilihan` AS `hafalan_doa_pilihan`,`ajis_view_rekap_penilaian`.`kehadiran_pembinaan` AS `kehadiran_pembinaan`,`ajis_view_rekap_penilaian`.`pembiasaan_shalat_wajib` AS `pembiasaan_shalat_wajib`,`ajis_view_rekap_penilaian`.`pembiasaan_sedekah` AS `pembiasaan_sedekah`,`ajis_view_rekap_penilaian`.`pembiasaan_tilawah` AS `pembiasaan_tilawah`,`ajis_view_rekap_penilaian`.`membantu_ortu` AS `membantu_ortu`,`ajis_view_rekap_penilaian`.`pai` AS `pai`,`ajis_view_rekap_penilaian`.`pkn` AS `pkn`,`ajis_view_rekap_penilaian`.`b_indo` AS `b_indo`,`ajis_view_rekap_penilaian`.`matematika` AS `matematika`,`ajis_view_rekap_penilaian`.`ipa` AS `ipa`,`ajis_view_rekap_penilaian`.`ips` AS `ips`,`ajis_view_rekap_penilaian`.`seni_budaya` AS `seni_budaya`,`ajis_view_rekap_penilaian`.`penjaskes` AS `penjaskes`,`ajis_view_rekap_penilaian`.`b_inggris` AS `b_inggris`,`ajis_view_rekap_penilaian`.`prestasi_siswa` AS `prestasi_siswa`,`ajis_view_rekap_penilaian`.`baca_quran_siswa` AS `baca_quran_siswa`,`ajis_view_rekap_penilaian`.`tahfidz_siswa` AS `tahfidz_siswa`,`ajis_view_rekap_penilaian`.`bantu_ortu_siswa` AS `bantu_ortu_siswa`,`ajis_view_rekap_penilaian`.`shalat_wajib_siswa` AS `shalat_wajib_siswa`,`ajis_view_rekap_penilaian`.`layak_juara` AS `layak_juara`,`ajis_view_rekap_penilaian`.`layak_siswa` AS `layak_siswa` from `ajis_view_rekap_penilaian`;

DROP VIEW IF EXISTS `ajis_view_rfo`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`localhost` SQL SECURITY DEFINER VIEW `ajis_view_rfo` AS select `donatur`.`nia_rfo` AS `nia_rfo`,`donatur`.`nama_rfo` AS `nama_rfo`,`donatur`.`kantor_donatur` AS `kantor_donatur`,`donatur`.`oid_donatur` AS `oid_donatur`,`donatur`.`omid_donatur` AS `omid_donatur`,count(distinct `donatur`.`did`) AS `total_donatur` from `donatur` where 1 and `donatur`.`status` <> 'p' and `donatur`.`nia_rfo` <> '' group by `donatur`.`nia_rfo` order by `donatur`.`nama_rfo`;

DROP VIEW IF EXISTS `ajis_view_saldo_anak_habis_by_rfo`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`localhost` SQL SECURITY DEFINER VIEW `ajis_view_saldo_anak_habis_by_rfo` AS select `ajis_view_anak_juara`.`nia_rfo` AS `nia_rfo`,`ajis_view_anak_juara`.`nama_rfo` AS `nama_rfo`,count(0) AS `total_saldo_habis` from `ajis_view_anak_juara` where `ajis_view_anak_juara`.`saldo_akhir` = '0' and `ajis_view_anak_juara`.`tahun` = year(current_timestamp()) and `ajis_view_anak_juara`.`status_pasangan` = 'y' group by `ajis_view_anak_juara`.`nia_rfo`;

DROP VIEW IF EXISTS `ajis_view_saldo_anak_urgent_by_rfo`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`localhost` SQL SECURITY DEFINER VIEW `ajis_view_saldo_anak_urgent_by_rfo` AS select `ajis_view_anak_juara`.`nia_rfo` AS `nia_rfo`,`ajis_view_anak_juara`.`nama_rfo` AS `nama_rfo`,count(0) AS `total_urgent` from `ajis_view_anak_juara` where 1 and `ajis_view_anak_juara`.`saldo_akhir` = `ajis_view_anak_juara`.`harga_program` and `ajis_view_anak_juara`.`status_pasangan` = 'y' and `ajis_view_anak_juara`.`tahun` = year(current_timestamp()) group by `ajis_view_anak_juara`.`nia_rfo`;

DROP VIEW IF EXISTS `ajis_view_selisih_tgl_donasi`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_selisih_tgl_donasi` AS select `a`.`id_pemasangan_baru` AS `id_pemasangan_baru`,`a`.`id_anak` AS `id_anak`,`a`.`id_donatur` AS `id_donatur`,`a`.`program_donasi` AS `program_donasi`,max(`a`.`tgl_transaksi`) AS `tgl_donasi_terakhir`,min(`a`.`tgl_transaksi`) AS `tgl_donasi_awal`,timestampdiff(MONTH,min(`a`.`tgl_transaksi`),max(`a`.`tgl_transaksi`)) AS `selisih_bulan`,timestampdiff(MONTH,max(`a`.`tgl_transaksi`),curdate()) AS `selisih_transaksi_terakhir_hingga_sekarang` from `ajis_input_donasi` `a` where 1 group by `a`.`id_anak`,`a`.`id_donatur`,`a`.`program_donasi`;

DROP VIEW IF EXISTS `ajis_view_selisih_transaksi_donasi`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_selisih_transaksi_donasi` AS select `ajis_view_perbandingan_transaksi_donasi`.`id_donatur` AS `id_donatur`,`ajis_view_perbandingan_transaksi_donasi`.`nama_donatur` AS `nama_donatur`,`ajis_view_perbandingan_transaksi_donasi`.`transaksi` AS `transaksi`,`ajis_view_perbandingan_transaksi_donasi`.`bulan_salur` AS `bulan_salur`,`ajis_view_perbandingan_transaksi_donasi`.`tahun_salur` AS `tahun_salur`,`ajis_view_perbandingan_transaksi_donasi`.`id_donatur_donasi` AS `id_donatur_donasi`,`ajis_view_perbandingan_transaksi_donasi`.`nama_donatur_donasi` AS `nama_donatur_donasi`,`ajis_view_perbandingan_transaksi_donasi`.`donasi` AS `donasi`,`ajis_view_perbandingan_transaksi_donasi`.`bulan` AS `bulan`,`ajis_view_perbandingan_transaksi_donasi`.`tahun` AS `tahun` from `ajis_view_perbandingan_transaksi_donasi` where `ajis_view_perbandingan_transaksi_donasi`.`transaksi` <> `ajis_view_perbandingan_transaksi_donasi`.`donasi` order by `ajis_view_perbandingan_transaksi_donasi`.`tahun` desc,`ajis_view_perbandingan_transaksi_donasi`.`bulan` desc,`ajis_view_perbandingan_transaksi_donasi`.`nama_donatur`;

DROP VIEW IF EXISTS `ajis_view_transaksi_by_donatur_inserted`;
CREATE ALGORITHM=UNDEFINED DEFINER=`irvan_vtect`@`%` SQL SECURITY DEFINER VIEW `ajis_view_transaksi_by_donatur_inserted` AS select `transaksi`.`did` AS `id_donatur`,`transaksi`.`nama_donatur` AS `nama_donatur`,format(sum(`transaksi`.`perkiraan_rp`),0,'de_DE') AS `transaksi`,`transaksi`.`bulan_salur` AS `bulan_salur`,`transaksi`.`tahun_salur` AS `tahun_salur` from `transaksi` where 1 and `transaksi`.`approve_salur` = 'y' and `transaksi`.`status_pasang` = 'y' and `transaksi`.`perkiraan_rp` > 0 group by `transaksi`.`did`,`transaksi`.`bulan_salur`,`transaksi`.`tahun_salur` order by `transaksi`.`tahun_salur` desc,`transaksi`.`bulan_salur` desc,`transaksi`.`nama_donatur`;

-- ============================================================
-- SAMPLE DATA (5 rows per table)
-- ============================================================

-- Table: ajis_anak (ordered by `tgl_terdaftar` DESC) — 5 row(s)
INSERT INTO `ajis_anak` (`id_anak`, `nik`, `nama_lengkap`, `nama_panggilan`, `agama`, `jns_kel`, `tempat_lahir`, `tgl_lahir`, `anak_ke`, `dari_saudara`, `alamat`, `propid`, `nama_propinsi`, `kabid`, `nama_kabupaten`, `camatid`, `nama_kecamatan`, `desaid`, `nama_desa`, `jenjang_pendidikan`, `kelas`, `nama_sekolah`, `alamat_sekolah`, `jurusan`, `semester`, `nama_pt`, `alamat_pt`, `no_rekening`, `foto`, `nilai`, `pelajaran_favorit`, `jarak_rumah`, `alat_transportasi`, `hobi`, `prestasi`, `no_kartu_keluarga`, `asnaf`, `status_ortu`, `status_survey`, `status_kelayakan`, `status_anak_juara`, `status_tersantuni`, `status_pinjam`, `status_mentor`, `id_wilayah_pembinaan`, `kantor_id`, `nama_wilayah`, `nama_kantor`, `tgl_terdaftar`, `tgl_pengajuan`, `nama_lengkap_ayah`, `alamat_ayah`, `propid_ayah`, `nama_propinsi_ayah`, `kabid_ayah`, `nama_kabupaten_ayah`, `camatid_ayah`, `nama_kecamatan_ayah`, `desaid_ayah`, `nama_desa_ayah`, `pekerjaan_ayah`, `penghasilan_rata_rata_ayah`, `tanggal_kematian_ayah`, `penyebab_kematian_ayah`, `nama_lengkap_ibu`, `alamat_ibu`, `propid_ibu`, `nama_propinsi_ibu`, `kabid_ibu`, `nama_kabupaten_ibu`, `camatid_ibu`, `nama_kecamatan_ibu`, `desaid_ibu`, `nama_desa_ibu`, `pekerjaan_ibu`, `penghasilan_rata_rata_ibu`, `tanggal_kematian_ibu`, `penyebab_kematian_ibu`, `nama_lengkap_wali`, `alamat_wali`, `propid_wali`, `nama_propinsi_wali`, `kabid_wali`, `nama_kabupaten_wali`, `camatid_wali`, `nama_kecamatan_wali`, `desaid_wali`, `nama_desa_wali`, `pekerjaan_wali`, `penghasilan_rata_rata_wali`, `telp_yang_bisa_dihubungi`, `atas_nama`, `hubungan_kerabat`, `id_sdm`, `nama_mentor`, `aktif`, `via_input`, `approval_ijf`, `oid_rz`, `nia_rfo_book`, `nama_rfo_book`, `tgl_peminjaman`, `tgl_expired`, `book_via`, `user_book`, `alumni_juara`, `juara`, `tinggal_bersama`, `nama_tinggal`, `ket_tinggal`, `penghasilan_tinggal`, `pekerjaan_tinggal`, `tidak_serumah_ortu`, `id_kantor_postgree`, `id_ijgs_anak`, `upload_gdrive`, `pemilik_rekening`, `nama_bank`) VALUES
('09194200033', '3273202610000006', 'Deza Adika', 'Deza', 'Islam', 'l', 'Bandung', '2010-10-25 17:00:00', 4, 4, 'Jl. Babakan Serang RT 04 RW 03', '3200', 'Jawa Barat', '3273', 'Kota Bandung', '327320', 'Antapani', '3273201004', 'Kel. Antapani Tengah', 'SMA', '10', 'SMKN 6 kota bandung ', 'jln Sukarno Hatta ', '', 0, '', '', '7219975702', '09194200033_Deza-crop.jpg', '85,47', 'seni rupa ', '2 km', 'sepeda', 'olahraga', '', '3273201402150007', 'Miskin', 'Yatim', 'y', '', 'caj', '', 'n', 'n', 23, '09-194', 'Antapani_Antapani Kulon', 'RZ - Bandung', '2026-06-26 17:00:00', '2020-02-23 17:00:00', '(Alm) Nandang Rasmana', 'Jl. Babakan Serang RT 04 RW 03', '3200', 'Jawa Barat', '3273', 'Kota Bandung', '327320', 'Antapani', '', 'Kel. Antapani Tengah', '-', 0, '2014-12-13 17:00:00', 'sakit', 'Eti Nurhayati', 'Jl. Babakan Serang RT 04 RW 03', '3200', 'Jawa Barat', '3273', 'Kota Bandung', '327320', 'Antapani', '3273201004', 'Kel. Antapani Tengah', 'Buruh', 1500000, '1899-11-29 16:52:48', '', '', 'Jl. Babakan Serang RT 04 RW 03', '3200', 'Jawa Barat', '3273', 'Kota Bandung', '327320', 'Antapani', '3273201004', 'Kel. Antapani Tengah', '', 0, '088218019760', 'Eti Nurhayati', '', '', '', 'y', 'desktop', '', '002001,022001,024001,025001,034001,244001,254001', '1012012002064', 'Angga Soma Wiguna', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '', '', '', 'anak', 'Ibu', '', '', '', '', '', '51', '26929', 'done', 'ETI NURHAYATI QQ DEZA ADIKA', ''),
('09194200057', '3205245503120005', 'Eka Sri Maryati', 'Eka', 'Islam', 'p', 'Bandung', '2012-03-14 17:00:00', 1, 2, 'Jl. Tarumasari Rt. 003/005', '3200', 'Jawa Barat', '3273', 'Kota Bandung', '327320', 'Antapani', '3273201001', 'Kel. Antapani', 'SMP', '8', 'SMPN 49 BANDUNG', 'jl antapani no 58,cicaheum (kecamatan antapani),kota Bandung,jawa barat', '', 0, '', '', '', '09194200057_Eka Sri Maryati.jpg', '80', 'seni budaya', '26 menit', 'Jalan Kaki', 'Bernyanyi', '', '3273202509102268', 'Miskin', 'Lengkap', 'y', 'y', 'caj', '', 'n', 'n', 23, '09-194', 'Antapani_Antapani Kulon', 'RZ - Bandung', '2026-06-26 17:00:00', '2020-03-18 17:00:00', 'Iin Taryana', 'Jl. Tarumasari Rt. 003/005', '3200', 'Jawa Barat', '3273', 'Kota Bandung', '327320', 'Antapani', '3273201001', 'Kel. Antapani', 'Buruh', 600000, '1899-11-29 16:52:48', '', 'Imas iim', 'Jl. Tarumasari Rt. 003/005', '3200', 'Jawa Barat', '3273', 'Kota Bandung', '327320', 'Antapani', '3273201001', 'Kel. Antapani', 'Ibu Rumah Tangga', 0, '1899-11-29 16:52:48', '', '', 'Jl. Tarumasari Rt. 003/005', '3200', 'Jawa Barat', '3273', 'Kota Bandung', '327320', 'Antapani', '3273201001', 'Kel. Antapani', '', 0, '083188134758', 'Iim Taryana', '', '', '', 'y', 'desktop', '', '002001,022001,024001,025001,034001,244001,254001', '1052019001004', 'Moh Ilham', '2020-04-05 17:00:00', '2020-04-12 17:00:00', 'ijis', 'spmd.bandung', '', 'anak', 'Ayah dan Ibu', '', '', '', '', '', '51', '27120', 'done', '', ''),
('09194260033', '3273101309160002', 'Rafa Raditya Arkan', 'Rafa', 'islam', 'l', 'Bandung', '2016-09-12 17:00:00', 1, 2, 'jl. Moch toha gg ciseureuh x rt 10 / rw 03', '3200', 'Jawa Barat', '', '', '', '', '', '', 'SD', '4', 'SDN 040 Pasawahan', 'Jl. Mochamad Toha No 383', '', 0, '', '', '', '09194260033_Rafa Raditya Arkan.jpeg', '79.6', 'olahraga', '', 'Jalan kaki dan Angkot', 'bermain bola', '', '3273102204160007', 'miskin', 'Dhuafa', 'y', '', 'caj', '', 'n', 'n', 3, '09-194', 'Astana Anyar_Karasak', 'RZ - Bandung', '2026-06-26 17:00:00', '2026-06-26 17:00:00', 'Agung Kurniawan', 'jl. Moch toha gg ciseureuh x rt 10 / rw 03', '', '', '', '', '', '', '', '', 'Buruh', 3000000, '1899-11-29 16:52:48', '', 'Imas Wati', 'jl. Moch toha gg ciseureuh x rt 10 / rw 03', '', '', '', '', '', '', '', '', 'Ibu Rumah Tangga', 0, '1899-11-29 16:52:48', '', '', '', '', '', '', '', '', '', '', '', '', 0, '08976405153', '', '', '', '', 'y', 'desktop', '', '002001,022001,024001,025001,034001,244001,254001', '', '', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '', '', '', 'anak', 'Ayah dan Ibu', '', '', '', '', '', NULL, NULL, NULL, '', ''),
('15298220007', '1471106308100003', 'Hayfa Lubna', 'Lulu', 'Islam', 'p', 'Pekanbaru', '2010-08-22 17:00:00', 2, 2, 'Jl. Kempas No. 493 / 10 Perumnas Utama Rejosari RT 003 RW 12 Kel Rejosari ', '1400', 'Riau', '1471', 'Kota Pekanbaru', '147110', 'Tenayan Raya', '1471101004', 'Kel. Rejo Sari', 'SMA', '10', 'SMAN 8 Pekanbaru', 'Jalan Abdul Muis No. 14\r\nKelurahan Cinta Raja\r\nKecamatan Sail\r\nKota Pekanbaru, Riau ', '', 0, '', '', '-', '15298220007_hayfa lubna.jpg', '2444', 'Matematika', '6 KM ', 'Sepeda Motor', 'Menggambar', 'Juara 2 Olimpiade Matematika Tingkat Nasional ', '1471106308100003', 'Miskin', 'Dhuafa', 'y', '', 'caj', '', 'n', 'n', 330, '15-298', 'SMPJ Pekanbaru', 'SMP Juara Pekanbaru', '2026-06-25 17:00:00', '2022-08-28 17:00:00', 'Syafridon', 'Jl. Kempas No. 493 / 10 Perumnas Utama Rejosari RT 003 RW 12 Kel Rejosari K', '1400', 'Riau', '1471', 'Kota Pekanbaru', '147110', 'Tenayan Raya', '', 'Kel. Rejo Sari', 'Tidak menafkahi ( Cerai )', 0, '1899-11-29 16:52:48', '', 'Heldefita', 'Jl. Kempas No. 493 / 10 Perumnas Utama Rejosari RT 003 RW 12 Kel Rejosari K', '1400', 'Riau', '1471', 'Kota Pekanbaru', '147110', 'Tenayan Raya', '1471101004', 'Kel. Rejo Sari', 'Guru', 700000, '1899-11-29 16:52:48', '', 'Hendra yandhi', 'Jl. Kempas No. 493 / 10 Perumnas Utama Rejosari RT 003 RW 12 Kel Rejosari K', '1400', 'Riau', '1471', 'Kota Pekanbaru', '147110', 'Tenayan Raya', '1471101004', 'Kel. Rejo Sari', 'bengkel las', 0, '085295237958', 'heldefita', 'paman pihak ibu', '', '', 'y', 'desktop', '', '007002,264001', '1122015143002', 'Neli', '2022-10-15 17:00:00', '2022-10-22 17:00:00', 'ijis', 'smdh', '', 'sekolah', 'Ibu', '', '', '', '', '', '97', '31953', 'done', '', ''),
('09194250001', '32042844611110003', 'Nengaini Rayati Umami Putri Effendi', 'Aini', 'Islam', 'p', 'Bandung, 06-11-2011', '2011-11-05 17:00:00', 4, 4, 'kp.pintu RT 03 RW 21 Desa Rancaekek Wetan', '3200', 'Jawa Barat', '3204', 'Kab. Bandung', '320428', 'Rancaekek', '3204282001', 'Desa Rancaekek Wetan', 'SMP', '8', 'Smp Negeri 03 Rancaekek', 'perumahan kencana blok 12', '', 0, '', '', '7329444427', '09194250001_WhatsApp Image 2025-01-09 at 16.46.26_141e174c.jpg', '90,22', 'IPA', '1 KM', 'Angkot/Umum', 'Menggambar', 'Pramuka', '3204282006120027', 'fakir', 'Dhuafa', 'y', '', 'caj', '', 'n', 'n', 649, '09-194', 'Rancaekek_Rancaekek Wetan', 'RZ - Bandung', '2026-06-25 17:00:00', '2025-01-08 17:00:00', 'Apim Bibing Effendi', 'kp.pintu RT 03 RW 21 Desa Rancaekek Wetan', '3200', 'Jawa Barat', '3204', 'Kab. Bandung', '320428', 'Rancaekek', '3204282001', 'Desa Rancaekek Wetan', '-', 0, '2022-08-23 17:00:00', 'Meninggal dunia', 'Emi Suratmi', 'kp.pintu RT 03 RW 21 Desa Rancaekek Wetan\r\n', '3200', 'Jawa Barat', '3204', 'Kab. Bandung', '320428', 'Rancaekek', '3204282001', 'Desa Rancaekek Wetan', 'Ibu Rumah Tangga', 400000, '1899-11-29 16:52:48', '', '', '', '', '', '', '', '', '', '', '', '', 0, '+6283841700649', 'Emi Suratmi', '', '', '', 'y', 'desktop', '', '002001,022001,024001,025001,034001,244001,254001', '1102015249001', 'Dwi Indriani', '2025-01-08 17:00:00', '2025-01-15 17:00:00', 'ijis', 'spmd.bandung', '', 'anak', 'Ibu', '', '', '', '', '', NULL, NULL, NULL, 'Neng Aini rayati umami putri effendi ', 'BSI');

-- Table: ajis_batas_expired_peminjaman (ordered by `jml_hari` DESC) — 1 row(s)
INSERT INTO `ajis_batas_expired_peminjaman` (`jml_hari`) VALUES
(7);

-- Table: ajis_data_prestasi (ordered by `id` DESC) — 5 row(s)
INSERT INTO `ajis_data_prestasi` (`id`, `id_anak`, `event_lomba`, `tgl`, `lokasi`, `skala_prestasi_tingkat`, `capaian_prestasi`, `jenis_bidang`, `publikasi_media`, `semesterid`, `laporanid`, `bulan`, `tahun`, `show`) VALUES
(81, '09207220007', 'ASOSIASI OLIMPIADE NUSANTARA', '2026-02-12 17:00:00', 'ONLINE', 'Nasional', 'JUARA 3', 'BHS INGGRIS', 'PIAGAM', '25', '', '2', '2026', 0),
(80, '09214220056', 'Olah raga ', '2025-10-25 17:00:00', 'Curug kulon ', 'Kecamatan', 'Juara 1 ', 'Paskibraka ', 'WhatsApp ', '24', '', '10', '2025', 1),
(79, '09214210094', 'Futsal antar Sekolah ', '2025-12-10 17:00:00', 'Curug', 'Kecamatan', 'Juara 1', 'Olahraga ', 'WhatsApp ', '', '', '12', '2025', 0),
(77, '09231170070', '', '2024-01-03 17:00:00', '', 'Sekolah', 'Wisuda tahfiz 3 juz', '', '', '', '', '1', '2024', 0),
(76, '09198190088', 'MBQ As Suryaniyah', '2023-10-20 17:00:00', 'Kampus As Suryaniyah Kota Bekasi', 'Kecamatan', 'Juara 3 Lomba MHQ dan Hafal 8 Juz ', 'Agama Islam', '', '2023', '', '10', '2023', 1);

-- Table: ajis_dokumentasi_pembinaan (ordered by `semesterid` DESC) — 5 row(s)
INSERT INTO `ajis_dokumentasi_pembinaan` (`semesterid`, `kantor_id`, `image`, `nama`, `id_kantor_postgree`, `id_ijgs_dokumentasi`, `upload_gdrive`, `id_wilayah_pembinaan`) VALUES
('juli-desem', '15-292', '2023_12_08_07_28_41__Dok.Pembinaan_SMT2_SD-JUARA-JAKARTA-UTARA.jpg', 'Rahmanto', NULL, NULL, NULL, '331'),
('Juli - Des', '15-295', '2023_12_14_07_51_53__Dok_Pembinaan_SMT2_SD_Juara_Surabaya_JulDes.jpg', 'Suradin, S.Si, S.Pd', NULL, NULL, NULL, '319'),
('Januari - ', '15-294', '2024_06_18_02_57_56__Dok.Pembinaan_SMT2_Yogyakarta.jpeg', 'Lilik Siswati', NULL, NULL, NULL, '316'),
('Januari - ', '09-231', '2024_06_07_06_57_36__Dok.Pembinaan_SMT1_jakbar_cilandak timur.jpg', '', NULL, NULL, NULL, '208'),
('januari - ', '09-214', '2026_06_17_13_19_52__Benda_Belendung.jpg', 'Azzahra Mauliaunnisa', NULL, NULL, NULL, '19');

-- Table: ajis_fungsi_struktur (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_fungsi_struktur` (`id_fungsi_struktur`, `kode_fungsi`, `nama_fungsi_struktur`, `aktif`, `user_insert`, `date_insert`, `user_update`, `date_update`) VALUES
(24, '', 'Tutor', '', '', '2017-08-14 17:00:00', '', '2019-08-27 17:00:00'),
(22, '', 'Tentor', 'y', '', '2017-03-14 17:00:00', '', '1899-11-29 16:52:48'),
(23, '', 'Guru Kelas', 'y', '', '2017-03-14 17:00:00', '', '1899-11-29 16:52:48'),
(21, '', 'Asisten Guru TPA', 'y', '', '2016-12-05 17:00:00', '', '1899-11-29 16:52:48'),
(18, '', 'Bendahara', 'y', '', '2013-12-04 17:00:00', '', '2016-11-01 17:00:00');

-- Table: ajis_group_user (ordered by `id_group_user` DESC) — 5 row(s)
INSERT INTO `ajis_group_user` (`id_group_user`, `group_user`, `keterangan`, `aktif`) VALUES
(11, 'RZ', 'RZ', 'y'),
(10, 'Zisco Leader', 'Zisco Leader RZ', 'y'),
(9, 'Wilayah Binaan', 'Mentor', 'y'),
(8, 'PMD Cabang', 'PMD Cabang', 'y'),
(7, 'PMD', 'Pusat', 'y');

-- Table: ajis_hafalan (ordered by `tgl_insert` DESC) — 5 row(s)
INSERT INTO `ajis_hafalan` (`id_anak`, `jenis`, `konten_uji`, `tgl_pengujian`, `tgl_insert`, `keterangan`, `semesterid`, `id_hafalan`, `id_anak_postgree`, `id_item_hafalan`) VALUES
('10232250002', '2', 'Al-Fatihah', '2026-06-25 17:00:00', '2026-06-26 07:47:16', '', '25', NULL, NULL, NULL),
('09226240068', '4', 'Masuk Rumah', '2026-05-09 17:00:00', '2026-06-24 07:00:05', '', '25', NULL, NULL, NULL),
('09226240068', '4', 'Akan Tidur', '2026-04-18 17:00:00', '2026-06-24 06:59:47', '', '25', NULL, NULL, NULL),
('09226240068', '4', 'Bangun Tidur', '2026-03-14 17:00:00', '2026-06-24 06:59:27', '', '25', NULL, NULL, NULL),
('09226240068', '4', 'Untuk Orang tua', '2026-02-07 17:00:00', '2026-06-24 06:59:07', '', '25', NULL, NULL, NULL);

-- Table: ajis_hafalan_temp (ordered by `tgl_insert` DESC) — 5 row(s)
INSERT INTO `ajis_hafalan_temp` (`id_hafalan_temp`, `id_anak`, `jenis`, `konten_uji`, `tgl_pengujian`, `tgl_insert`, `keterangan`, `semesterid`, `nama_anak`) VALUES
('20220527155109214', '', '', '', '1899-11-29 16:52:48', '0000-00-00 00:00:00', '', '', ''),
('20220527161509214', '', '', '', '1899-11-29 16:52:48', '0000-00-00 00:00:00', '', '', ''),
('20220527161609214', '', '', '', '1899-11-29 16:52:48', '0000-00-00 00:00:00', '', '', ''),
('20220527161809214', '', '', '', '1899-11-29 16:52:48', '0000-00-00 00:00:00', '', '', ''),
('20220531130709208', '', '', '', '1899-11-29 16:52:48', '0000-00-00 00:00:00', '', '', '');

-- Table: ajis_harga (ordered by `id_harga` DESC) — 5 row(s)
INSERT INTO `ajis_harga` (`id_harga`, `program_donasi`, `program`, `harga_program`, `harga_penyaluran`, `beasiswa`, `transport`, `frekuensi`, `ceria`, `progid`) VALUES
(29, '\'Beasiswa Khusus Sekolah Juara SMK\'', 'Beasiswa Khusus Sekolah Juara SMK', 0, 0, 0, 0, 0, '', ''),
(28, '\'Beasiswa Khusus Sekolah Juara SMP\'', 'Beasiswa Khusus Sekolah Juara SMP', 0, 0, 0, 0, 0, '', ''),
(27, '\'Beasiswa Khusus Sekolah Juara SD\'', 'Beasiswa Khusus Sekolah Juara SD', 0, 0, 0, 0, 0, '', ''),
(26, '\'Beasiswa Khusus Sekolah Juara\'', 'Beasiswa Khusus Sekolah Juara', 0, 0, 0, 0, 0, '', ''),
(25, '\'Beasiswa Khusus Anak Juara Mahasiswa\'', 'Beasiswa Khusus Anak Juara Mahasiswa', 0, 0, 0, 0, 0, '', '');

-- Table: ajis_input_donasi (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_input_donasi` (`id_input_donasi`, `id_pemasangan_baru`, `tgl_transaksi`, `id_anak`, `id_donatur`, `program_donasi`, `qty`, `pilihan_donasi`, `nominal_donasi`, `bulan`, `tahun`, `user_insert`, `date_insert`, `user_update`, `date_update`, `transid`, `detailid`, `kantor_id`, `id_wilayah_pembinaan`, `jenis`, `jenjang_pendidikan`, `jns_kel`, `asnaf`, `id_pemasangan`, `nik`, `nama_anak`, `nama_donatur`, `nama_wilayah`, `nama_kantor`, `periode`, `id_program`, `via_input`, `jcustid`, `id_pemasangan_new`, `id_transaksi_postgree`, `id_pemasangan_postgree`, `id_anak_postgree`, `id_donatur_postgree`, `id_program_postgree`) VALUES
(523748, '0919421009410241000001422026', '2026-04-07 17:00:00', '09194210094', '1024100000142', 'Infak Pendidikan Siswa SMA', 1, 205000, 205000, '6', '2026', 'spmd.admin', '2026-06-22 01:42:26', '', '1899-11-29 16:52:48', '0342604080010002', 1, '', '', 'trans', 'SMA', 'p', 'Miskin', '', '3273144610080001', 'Fani Afnan Jinaan Fahrudin', 'Yuanshah Deyanan, St', 'Antapani_Antapani Kulon', 'RZ - Bandung', 'ganjil', '2363', 'reguler', NULL, '', NULL, NULL, NULL, NULL, NULL),
(523747, '1023023009212491200004212026', '2026-02-26 17:00:00', '10230230092', '1249120000421', 'Program Infak Pendidikan Siswa SD', 1, 185000, 185000, '4', '2026', 'spmd.jakartatimur', '2026-06-17 03:43:32', '', '1899-11-29 16:52:48', '90012702265894770', 1, '10-230', '181', 'trans', 'SD', 'p', 'miskin', '', '3175035206131010', 'Naila Fitria', 'Aulia Fahmi Maulana', 'Jatinegara_Kampung Melayu', 'RZ - Jakarta Timur', 'ganjil', '2354', 'reguler', NULL, '', NULL, NULL, NULL, NULL, NULL),
(523746, '1528522002612491200004142026', '2026-03-31 17:00:00', '15285220026', '1249120000414', 'Infak Pendidikan Siswa SD Juara', 1, 375000, 375000, '5', '2026', 'spmd.admin', '2026-06-14 04:10:46', '', '1899-11-29 16:52:48', '90010104268493283', 2, '15-285', '324', 'trans', 'SD', 'p', 'Fii Sabilillah', '', '3273305811140001', 'Pelita Tsuraya', 'Mirza Trilaksono', 'SDJ Bandung', 'SD Juara Bandung', 'ganjil', '2358', 'reguler', NULL, '', NULL, NULL, NULL, NULL, NULL),
(523745, '1528522002612491200004142026', '2026-05-01 17:00:00', '15285220026', '1249120000414', 'Infak Pendidikan Siswa SD Juara', 1, 375000, 375000, '6', '2026', 'spmd.admin', '2026-06-14 04:09:49', '', '1899-11-29 16:52:48', '90010205262221173', 1, '15-285', '324', 'trans', 'SD', 'p', 'Fii Sabilillah', '', '3273305811140001', 'Pelita Tsuraya', 'Mirza Trilaksono', 'SDJ Bandung', 'SD Juara Bandung', 'ganjil', '2358', 'reguler', NULL, '', NULL, NULL, NULL, NULL, NULL),
(523744, '0919522001810381300000872026', '2026-04-25 17:00:00', '09195220018', '1038130000087', 'Program Infak Pendidikan Siswa SD', 1, 185000, 185000, '6', '2026', 'spmd.admin', '2026-06-14 04:08:54', '', '1899-11-29 16:52:48', '90012604262395962', 1, '09-195', '338', 'trans', 'SMP', 'p', 'Miskin', '', '6203075511090001', 'Yasmin', 'Muhammad Arief Munadi', 'Banjarmasin Barat_Kuin Selatan', 'RZ - Banjarmasin', 'ganjil', '2354', 'reguler', NULL, '', NULL, NULL, NULL, NULL, NULL);

-- Table: ajis_input_donasi_bb (ordered by `date_insert` DESC) — 0 row(s)
-- (empty table)

-- Table: ajis_item_hafalan (ordered by `id` DESC) — 5 row(s)
INSERT INTO `ajis_item_hafalan` (`id`, `jenis`, `konten`) VALUES
(138, 4, 'Akhir Majelis'),
(137, 4, 'Meminta Ilmu'),
(136, 4, 'Keluar Masjid'),
(135, 4, 'Masuk Masjid'),
(134, 4, 'Keluar Toilet');

-- Table: ajis_item_penilaian (ordered by `id` DESC) — 5 row(s)
INSERT INTO `ajis_item_penilaian` (`id`, `item_penilaian`, `parent_id`, `is_parent`, `jenis`, `target`) VALUES
(30, 'Catatan Pembinaan', '30', '0', 'sekolahjuara', ''),
(29, 'Suara Anak Juara', '29', '0', 'sekolahjuara', ''),
(28, 'Catatan Pembinaan', '28', '0', 'anakjuara', ''),
(27, 'Suara Anak Juara', '27', '0', 'anakjuara', ''),
(26, 'Terbiasa Melaksanakan Shalat 5 Waktu', '11', '0', 'sekolahjuara', '');

-- Table: ajis_jabatan_sdm (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_jabatan_sdm` (`id_wilayah_pembinaan`, `kantor_id`, `id_jabatan_sdm`, `id_sdm`, `keaktifan_edukasi`, `id_fungsi_struktur`, `user_insert`, `date_insert`, `user_update`, `date_update`) VALUES
('651', '', 5285, '2462', 'y', '2', '', '1899-11-29 16:52:48', '', '1899-11-29 16:52:48'),
('1', '09-218', 1522, '6', 'y', '15', '', '1899-11-29 16:52:48', '', '1899-11-29 16:52:48'),
('185', '10-230', 2014, '142', 'y', '1', '', '1899-11-29 16:52:48', '', '1899-11-29 16:52:48'),
('1', '09-218', 1521, '6', 'y', '', '', '1899-11-29 16:52:48', '', '1899-11-29 16:52:48'),
('1', '', 4837, '7', 'y', '1', '', '1899-11-29 16:52:48', '', '1899-11-29 16:52:48');

-- Table: ajis_kantor (ordered by `id` DESC) — 5 row(s)
INSERT INTO `ajis_kantor` (`id`, `oid`, `kantor`, `alamat`, `no_telp`, `oid_parent`, `oid_parent_second`, `oid_rz`, `jenis`, `id_kantor_postgree`) VALUES
(92, '17-312', 'RZ - Bintaro', '', '', '09-219', '17-312', NULL, 'anakjuara', 0),
(91, '17-311', 'PMD - Aceh - Bireuen', '', '', '17-305', '17-303', '', 'anakjuara', 105),
(90, '17-310', 'PMD - Aceh - Aceh Jaya', '', '', '17-305', '17-303', '', 'anakjuara', 104),
(89, '17-309', 'PMD - Aceh - Aceh Besar', '', '', '17-305', '17-303', '', 'anakjuara', 103),
(88, '17-308', 'PMD - Aceh - Banda Aceh', '', '', '17-305', '17-303', '', 'anakjuara', 102);

-- Table: ajis_opname (ordered by `date_opname_ganjil` DESC) — 5 row(s)
INSERT INTO `ajis_opname` (`tahun`, `id_anak`, `id_donatur`, `program_donasi`, `id_program`, `id_pemasangan_baru`, `saldo_awal_ganjil`, `tupo_jan_jun`, `date_opname_ganjil`, `user_opname_ganjil`, `saldo_akhir_ganjil`, `saldo_awal_genap`, `tupo_jul_des`, `date_opname_genap`, `user_opname_genap`, `saldo_akhir_genap`, `user_input`, `id_kantor`, `updated`, `keterangan`, `user_update`, `jcustid`, `id_pemasangan_new`) VALUES
(2018, '', '', '', '0', '2018000', 0, '', '0000-00-00 00:00:00', '', 0, 0, '', '0000-00-00 00:00:00', '', 0, '', '', '0000-00-00 00:00:00', '', '', 0, ''),
(2018, '', '1001070000114', 'Beasiswa Anak Juara SD', '97', '10010700001142018097', 0, '', '0000-00-00 00:00:00', '', 0, 0, '', '0000-00-00 00:00:00', '', 0, '', '09-199', '0000-00-00 00:00:00', '', '', 1, ''),
(2018, '', '1006100000220', 'Beasiswa Anak Juara SD', '97', '10061000002202018097', 0, '', '0000-00-00 00:00:00', '', 0, 0, '', '0000-00-00 00:00:00', '', 0, '', '09-213', '0000-00-00 00:00:00', '', '', 1, ''),
(2018, '09194160003', '1001140001511', 'Beasiswa Anak Juara SD', '97', '0919416000310011400015112018097', 0, '', '0000-00-00 00:00:00', '', 0, 0, '', '0000-00-00 00:00:00', '', 0, '', '09-194', '0000-00-00 00:00:00', '', '', 1, ''),
(2018, '09194160004', '1024100000142', 'Beasiswa Anak Juara SMP', '100', '0919416000410241000001422018100', 180000, '', '0000-00-00 00:00:00', '', 0, 0, '', '0000-00-00 00:00:00', '', 0, '', '09-194', '0000-00-00 00:00:00', '', '', 1, '');

-- Table: ajis_opname_bb (ordered by `date_opname_ganjil` DESC) — 5 row(s)
INSERT INTO `ajis_opname_bb` (`tahun`, `id_anak`, `id_donatur`, `program_donasi`, `id_program`, `id_pemasangan_baru`, `saldo_awal_ganjil`, `tupo_jan_jun`, `date_opname_ganjil`, `user_opname_ganjil`, `saldo_akhir_ganjil`, `saldo_awal_genap`, `tupo_jul_des`, `date_opname_genap`, `user_opname_genap`, `saldo_akhir_genap`, `user_input`, `id_kantor`, `updated`, `keterangan`, `user_update`, `jcustid`, `id_pemasangan_new`) VALUES
(2023, '09194160069', '999999999999', 'Beasiswa Baik SMA', '2537', '0919416006999999999999920232537', 0, '', '0000-00-00 00:00:00', '', 0, 0, '', '0000-00-00 00:00:00', '', 0, '', '09-194', '2023-08-13 09:51:16', '', '', 0, ''),
(2023, '09194190270', '999999999999', 'Beasiswa Baik SMA', '2537', '0919419027099999999999920232537', 0, '', '0000-00-00 00:00:00', '', 0, 0, '', '0000-00-00 00:00:00', '', 0, '', '09-194', '2023-08-13 09:50:24', '', '', 0, ''),
(2023, '09194220016', '999999999999', 'Beasiswa Baik Mahasiswa', '2541', '0919422001699999999999920232541', 0, '', '0000-00-00 00:00:00', '', 0, 0, '', '0000-00-00 00:00:00', '', 0, '', '09-194', '2023-08-13 09:51:57', '', '', 0, ''),
(2023, '09194220082', '999999999999', 'Beasiswa Baik SMA', '2537', '0919422008299999999999920232537', 0, '', '0000-00-00 00:00:00', '', 0, 0, '', '0000-00-00 00:00:00', '', 0, '', '09-194', '2023-08-13 09:50:43', '', '', 0, ''),
(2023, '09194230055', '999999999999', 'Beasiswa Baik SMA', '2537', '0919423005599999999999920232537', 0, '', '0000-00-00 00:00:00', '', 0, 0, '', '0000-00-00 00:00:00', '', 0, '', '09-194', '2023-08-13 09:50:58', '', '', 0, '');

-- Table: ajis_opname_bbx (ordered by `date_opname_ganjil` DESC) — 0 row(s)
-- (empty table)

-- Table: ajis_pemasangan (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_pemasangan` (`id_pemasangan_baru`, `tahun`, `tgl_pemasangan`, `tgl_pemberhentian_pemasangan`, `id_donatur`, `id_anak`, `id_wilayah_pembinaan`, `kantor_id`, `program_donasi`, `id_program`, `harga_program`, `harga_penyaluran`, `keterangan_pemberhentian`, `status_pasangan`, `saldo_awal`, `status_saldo`, `program_sebelumnya`, `user_insert`, `date_insert`, `user_update`, `date_update`, `jns_kel`, `nama_anak`, `kelas`, `nama_donatur`, `nama_wilayah`, `nama_kantor`, `jenjang_pendidikan`, `asnaf`, `status_ortu`, `status_aj`, `id_sdm`, `nama_mentor`, `nik`, `status_mentor`, `no_rekening`, `cek`, `nia_rfo`, `nama_rfo`, `tunda_penyaluran`, `id_naik_jenjang`, `via_input`, `history`, `user_stop`, `via_stop`, `alasan_aktif`, `jcustid`, `id_pemasangan_new`, `id_anak_postgree`, `id_program_postgree`, `id_donatur_postgree`, `id_peminjaman_postgree`, `id_pinjam_postgree`, `pinjam`, `id_pemasangan_postgree`, `id_donatur_erpwh`, `id_zisco_resuser_erpwh`, `id_anak_erpwh`, `id_peminjaman_erpwh`, `id_kantor_erpwh`, `saldo_akhir`, `status_saldo_akhir`, `updated_saldo`) VALUES
('1529826000112491300030712026', '2026', '2026-06-23 17:00:00', '1899-11-29 16:52:48', '1249130003071', '15298260001', '330', '15-298', 'Infak Pendidikan Siswa SMP Juara', 2359, 450000, 355000, '', 'y', 0, 'n', '', 'spmd.admin', '2026-06-24 07:30:34', '', '0000-00-00 00:00:00', 'l', 'M. Rizky Ramadhan ', '7', '', 'SMPJ Pekanbaru', 'SMP Juara Pekanbaru', 'SMP', 'miskin', 'Yatim', '', '', NULL, '1305040206120001', '', '', '', '1012013249007', 'Yudhi Eko Putranto', '', '', 'desktop', '', '', '', NULL, 0, '', NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('1529826000212491300030712026', '2026', '2026-06-23 17:00:00', '1899-11-29 16:52:48', '1249130003071', '15298260002', '330', '15-298', 'Infak Pendidikan Siswa SMP Juara', 2359, 450000, 355000, '', 'y', 0, 'n', '', 'spmd.admin', '2026-06-24 07:29:27', '', '0000-00-00 00:00:00', 'l', 'Ghazawan Arshad', '7', '', 'SMPJ Pekanbaru', 'SMP Juara Pekanbaru', 'SMP', 'miskin', 'Dhuafa', '', '', NULL, '1471042511120001', '', '', '', '1012013249007', 'Yudhi Eko Putranto', '', '', 'desktop', '', '', '', NULL, 0, '', NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('091942400461620090300078872026', '2026', '2026-06-23 17:00:00', '1899-11-29 16:52:48', '162009030007887', '09194240046', '64', '09-194', 'Program Infak Pendidikan Siswa SD', 2354, 185000, 130000, '', 'y', 0, 'n', '', 'spmd.bandung', '2026-06-24 03:31:44', '', '0000-00-00 00:00:00', 'l', 'Alby Lucky Musyaffa ', '', 'Fitri Ayu Rachmawati', 'Bojongloa Kaler_Babakan Tarogong', 'RZ - Bandung', 'SD', 'miskin', 'Yatim', 'aj', '', NULL, '3273041800170004', 'n', '', '', '1042014001001', 'Wahyuni', '', '', 'desktop', '', '', '', 'AJ Baru', 0, '', NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('1529824000110071200003412026', '2026', '2026-06-21 17:00:00', '1899-11-29 16:52:48', '1007120000341', '15298240001', '330', '15-298', 'Infak Pendidikan Siswa SMP Juara', 2359, 450000, 355000, '', 'y', 0, 'n', '', 'spmd.admin', '2026-06-22 07:52:54', '', '0000-00-00 00:00:00', 'l', 'Abdul Afif Zulfahmi', '8', '', 'SMPJ Pekanbaru', 'SMP Juara Pekanbaru', 'SMP', 'miskin', 'Dhuafa', '', '', NULL, '1371032506100001', '', '', '', '1012012007069', 'Budi Agus Saputra', '', '', 'desktop', '', '', '', NULL, 0, '', NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('1023023009212491200004212026', '2026', '2026-06-16 17:00:00', '1899-11-29 16:52:48', '1249120000421', '10230230092', '181', '10-230', 'Program Infak Pendidikan Siswa SD', 2354, 185000, 130000, '', 'y', 0, 'n', '', 'spmd.jakartatimur', '2026-06-17 03:33:30', '', '0000-00-00 00:00:00', 'p', 'Naila Fitria', '', 'Aulia Fahmi Maulana', 'Jatinegara_Kampung Melayu', 'RZ - Jakarta Timur', 'SD', 'miskin', 'Yatim', 'aj', '', NULL, '3175035206131010', 'n', '7300445521', '', '1022023835226', 'Annisya Nurul Ashila', '', '', 'desktop', '', '', '', 'AJ Baru', 0, '', NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- Table: ajis_pemasangan_bb (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_pemasangan_bb` (`id_pemasangan_baru`, `tgl_pemasangan`, `tgl_pemberhentian_pemasangan`, `id_donatur`, `id_anak`, `id_wilayah_pembinaan`, `kantor_id`, `program_donasi`, `id_program`, `harga_program`, `harga_penyaluran`, `keterangan_pemberhentian`, `status_pasangan`, `saldo_awal`, `status_saldo`, `program_sebelumnya`, `user_insert`, `date_insert`, `user_update`, `date_update`, `jns_kel`, `nama_anak`, `kelas`, `nama_donatur`, `nama_wilayah`, `nama_kantor`, `jenjang_pendidikan`, `asnaf`, `status_ortu`, `status_aj`, `id_sdm`, `nama_mentor`, `nik`, `status_mentor`, `no_rekening`, `cek`, `nia_rfo`, `nama_rfo`, `tunda_penyaluran`, `id_naik_jenjang`, `tahun`, `via_input`, `history`, `user_stop`, `via_stop`, `alasan_aktif`, `jcustid`, `id_pemasangan_new`, `id_anak_postgree`, `id_program_postgree`, `id_donatur_postgree`, `id_peminjaman_postgree`, `id_pinjam_postgree`, `pinjam`, `id_pemasangan_postgree`, `id_donatur_erpwh`, `id_zisco_resuser_erpwh`, `id_anak_erpwh`, `id_peminjaman_erpwh`, `id_kantor_erpwh`, `saldo_akhir`, `status_saldo_akhir`, `updated_saldo`) VALUES
('0919422001699999999999920232541', '2023-08-12 17:00:00', '1899-11-29 16:52:48', '999999999999', '09194220016', '78', '09-194', 'Beasiswa Baik Mahasiswa', 2541, 796000, 533000, '', 'y', 0, 'n', '', 'deploy', '2023-08-13 09:51:56', '', '0000-00-00 00:00:00', 'p', 'Tia Sutiarsih', '', '', 'Cibiru_Cipadung', 'IJ - Bandung', 'PT', 'Miskin', 'Yatim', 'aj', '', NULL, '3204054410980007', 'n', '', '', '1', '', '', '', '2023', 'desktop', '', '', '', '', 0, '', NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('0919423005699999999999920232541', '2023-08-12 17:00:00', '1899-11-29 16:52:48', '999999999999', '09194230056', '86', '09-194', 'Beasiswa Baik Mahasiswa', 2541, 796000, 533000, '', 'y', 0, 'n', '', 'deploy', '2023-08-13 09:51:43', '', '0000-00-00 00:00:00', 'p', 'Pusvita Dewi Irawan', '', '', 'Cinambo_Sukamulya', 'IJ - Bandung', 'PT', 'miskin', 'Dhuafa', 'aj', '', NULL, '3204295407010004', 'n', '', '', '1', '', '', '', '2023', 'desktop', '', '', '', '', 0, '', NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('0919416006999999999999920232537', '2023-08-12 17:00:00', '1899-11-29 16:52:48', '999999999999', '09194160069', '57', '09-194', 'Beasiswa Baik SMA', 2537, 486000, 267000, '', 'y', 0, 'n', '', 'deploy', '2023-08-13 09:51:16', '', '0000-00-00 00:00:00', 'l', 'Daffa Haiza Ar-Rasyid', '', '', 'Banjaran_Banjaranwetan', 'IJ - Bandung', 'SMA', 'Miskin', 'Lengkap', 'aj', '', NULL, '3204131703070001', 'n', '', '', '1', '', '', '', '2023', 'desktop', '', '', '', '', 0, '', NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('0919423005599999999999920232537', '2023-08-12 17:00:00', '1899-11-29 16:52:48', '999999999999', '09194230055', '23', '09-194', 'Beasiswa Baik SMA', 2537, 486000, 267000, '', 'y', 0, 'n', '', 'deploy', '2023-08-13 09:50:58', '', '0000-00-00 00:00:00', 'p', 'Velsya Amelinda', '', '', 'Antapani_Antapani', 'IJ - Bandung', 'SMA', 'miskin', 'Dhuafa', 'aj', '', NULL, '3273205307080001', 'n', '', '', '1', '', '', '', '2023', 'desktop', '', '', '', '', 0, '', NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('0919422008299999999999920232537', '2023-08-12 17:00:00', '1899-11-29 16:52:48', '999999999999', '09194220082', '75', '09-194', 'Beasiswa Baik SMA', 2537, 486000, 267000, '', 'y', 0, 'n', '', 'deploy', '2023-08-13 09:50:42', '', '0000-00-00 00:00:00', 'p', 'Kirana Septa Dwi Iswandari', '', '', 'Cibeunying Kaler_Neglasari', 'IJ - Bandung', 'SMA', 'Miskin', 'Lengkap', 'aj', '', NULL, '3273184109060001', 'n', '', '', '1', '', '', '', '2023', 'desktop', '', '', '', '', 0, '', NULL, NULL, NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- Table: ajis_pemasangan_log (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_pemasangan_log` (`id_log`, `id_pemasangan`, `tgl_pemasangan`, `tgl_pemberhentian_pemasangan`, `id_donatur`, `id_anak`, `id_wilayah_pembinaan`, `kantor_id`, `program_donasi`, `id_program`, `harga_program`, `harga_penyaluran`, `keterangan_pemberhentian`, `status_pasangan`, `saldo_awal`, `status_saldo`, `program_sebelumnya`, `user_insert`, `date_insert`, `user_update`, `date_update`, `jns_kel`, `nama_anak`, `kelas`, `nama_donatur`, `nama_wilayah`, `nama_kantor`, `jenjang_pendidikan`, `asnaf`, `status_ortu`, `status_aj`, `id_sdm`, `nama_mentor`, `nik`, `status_mentor`, `no_rekening`, `cek`, `nia_rfo`, `nama_rfo`, `id_pemasangan_baru`, `updated`, `deleted`) VALUES
(32, 21462, '2018-11-12 17:00:00', '1899-11-29 16:52:48', '1019130000063', '09215180014', '122', '09-215', 'Beasiswa Anak Juara SMA', 288, 205000, 120000, '', 'y', 0, 'n', '', 'spmd.yogyakarta', '2018-11-13 08:09:38', '', '0000-00-00 00:00:00', 'l', 'Taufiq Hidayat', '', 'Machmud Ridho Makarim', 'Nanggulan_Girimulyo', 'IJ - Yogyakarta', 'SMP', 'Miskin', 'Dhuafa', 'aj', '', '', '3401091709010001', 'n', '', '', '2052012019111', 'muhammad taufiq akbar', '0921518001410191300000632018288', '2018-11-23 07:51:34', '0000-00-00 00:00:00'),
(63, 21410, '2018-11-12 17:00:00', '1899-11-29 16:52:48', '1047120000159', '09226170301', '101', '09-226', 'Beasiswa Anak Juara SMA', 288, 205000, 120000, '', 'y', 0, 'n', '', 'spmd.cilegon', '2018-11-13 06:09:05', '', '0000-00-00 00:00:00', 'p', 'Aprilia Hoirunnisa', '', 'Firjadi Putra/Sri Supiati', 'Jombang_Sukmajaya', 'IJ - Cilegon', 'SMP', '', 'Dhuafa', 'aj', '', '', '3672054204050001', 'n', '', '', '1122015047003', 'Saibani', '0922617030110471200001592018288', '2018-11-26 02:47:37', '0000-00-00 00:00:00'),
(71, 21407, '2018-11-12 17:00:00', '1899-11-29 16:52:48', '1047160000029', '09226170046', '101', '09-226', 'Beasiswa Anak Juara SMA', 288, 205000, 120000, '', 'y', 0, 'n', '', 'spmd.cilegon', '2018-11-13 06:04:39', '', '0000-00-00 00:00:00', 'l', 'Nurul Mustaqim', '', 'Isrofi', 'Jombang_Sukmajaya', 'IJ - Cilegon', 'SMP', '', 'Dhuafa', 'aj', '', '', '3672050710020001', 'n', '', '', '1122015047003', 'Saibani', '0922617004610471600000292018288', '2018-11-26 02:53:06', '0000-00-00 00:00:00'),
(80, 21402, '2018-11-12 17:00:00', '1899-11-29 16:52:48', '1047160000308', '09226160263', '101', '09-226', 'Beasiswa Anak Juara SMA', 288, 205000, 120000, '', 'y', 0, 'n', '', 'spmd.cilegon', '2018-11-13 05:53:39', '', '0000-00-00 00:00:00', 'p', 'Tuti Radisah', '', 'Andre', 'Jombang_Sukmajaya', 'IJ - Cilegon', 'SMA', '', 'Yatim', 'aj', '', '', '3604055004010004', 'n', '', '', '1082017047001', 'Zuhrotun Naqiyah', '0922616026310471600003082018288', '2018-11-26 03:01:24', '0000-00-00 00:00:00'),
(77, 21378, '2018-11-12 17:00:00', '1899-11-29 16:52:48', '1047080000307', '09226180008', '101', '09-226', 'Beasiswa Anak Juara SMP', 100, 180000, 100000, '', 'y', 0, 'n', '', 'spmd.cilegon', '2018-11-13 03:59:23', '', '0000-00-00 00:00:00', 'p', 'Sulastri', '', 'Maruf Amin', 'Jombang_Sukmajaya', 'IJ - Cilegon', 'SMP', 'Miskin', 'Dhuafa', 'aj', '', '', '3604075110040003', 'n', '', '', '1082017047001', 'Zuhrotun Naqiyah', '0922618000810470800003072018100', '2018-11-26 03:00:50', '0000-00-00 00:00:00');

-- Table: ajis_pembinaan_baru (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_pembinaan_baru` (`id_row`, `id_pembinaan`, `tgl_pembinaan`, `semesterid`, `bulan`, `tahun`, `jenis_pembinaan`, `p3a`, `judul_materi`, `id_anak`, `kehadiran`, `keterangan`, `id_wilayah_pembinaan`, `user_insert`, `date_insert`, `user_update`, `date_update`, `kantor_id`, `jns_kel`, `asnaf`, `nik`, `nama_lengkap`, `jenjang_pendidikan`, `status_ortu`, `nama_lengkap_ayah`, `nama_lengkap_ibu`, `nama_lengkap_wali`, `nama_kantor`, `nama_wilayah`, `pemateri`, `pemateri_personal`, `ortu_hadir`, `id_donatur`, `nama_donatur`, `program_donasi`, `tampil`, `via_input`, `capaian_tilawah`, `capaian_tahfidz`, `capaian_tahfidz_hal`, `pembiasaan_shalat_wajib`, `pembiasaan_tilawah`, `pembiasaan_sedekah`, `membantu_ortu`, `id_anak_postgree`, `id_pembinaan_postgree`, `id_kantor_postgree`) VALUES
(4479886, '', '2026-06-13 17:00:00', '25', '6', '2026', 'Pembinaan Reguler', '', 'Menyambut Muharram dengan semangat baru', '09200260001', 'y', '', '247', 'spmd.cimahi', '2026-06-29 06:53:12', '', '1899-11-29 16:52:48', '09-200', 'p', '', '3277026303180001', 'Tsalisa Solihatunnisa', 'SD', '', '', '', '', 'RZ - Cimahi', 'Cimahi Tengah_Padasuka', '', '', '', '1249130000761', 'Hera Nurherawati', 'Program Infak Pendidikan Siswa SD', 'y', 'ijis', '', '', '', 1, 1, 1, 1, NULL, NULL, NULL),
(4479885, '', '2026-06-13 17:00:00', '25', '6', '2026', 'Pembinaan Reguler', '', 'Menyambut Muharram dengan semangat baru', '09200230029', 'y', '', '247', 'spmd.cimahi', '2026-06-29 06:51:03', '', '1899-11-29 16:52:48', '09-200', 'p', '', '3277026311160003', 'Syifa Auliya Suci', 'SD', '', '', '', '', 'RZ - Cimahi', 'Cimahi Tengah_Padasuka', '', '', '', '1249150000033', 'Arya Yudhistira ', 'Program Infak Pendidikan Siswa SD', 'y', 'ijis', '', '', '', 1, 1, 1, 1, NULL, NULL, NULL),
(4479884, '', '2026-06-13 17:00:00', '25', '6', '2026', 'Pembinaan Reguler', '', 'Menyambut Muharram dengan semangat baru', '09200230027', 'y', '', '247', 'spmd.cimahi', '2026-06-29 06:49:52', '', '1899-11-29 16:52:48', '09-200', 'p', '', '3277036106100003', 'Syarah Salsabila', 'SMP', '', '', '', '', 'RZ - Cimahi', 'Cimahi Tengah_Padasuka', '', '', '', '1001130000204', 'Adi Sarwanto', 'Program Infak Pendidikan Siswa SD', 'y', 'ijis', '', '', '', 1, 1, 1, 1, NULL, NULL, NULL),
(4479883, '', '2026-06-13 17:00:00', '25', '6', '2026', 'Pembinaan Reguler', '', 'Menyambut Muharram dengan semangat baru', '09200230025', 'y', '', '247', 'spmd.cimahi', '2026-06-29 06:48:09', '', '1899-11-29 16:52:48', '09-200', 'p', '', '3217136809140002', 'Syakira Dwi Septiani', 'SD', '', '', '', '', 'RZ - Cimahi', 'Cimahi Tengah_Padasuka', '', '', '', '1249130000761', 'Hera Nurherawati', 'Program Infak Pendidikan Siswa SD', 'y', 'ijis', '', '', '', 1, 1, 1, 1, NULL, NULL, NULL),
(4479882, '', '2026-06-13 17:00:00', '25', '6', '2026', 'Pembinaan Reguler', '', 'Menyambut Muharram dengan semangat baru', '09200220062', 'y', '', '247', 'spmd.cimahi', '2026-06-29 06:46:48', '', '1899-11-29 16:52:48', '09-200', 'p', '', '3277026710150005', 'Siti Zahra', 'SD', '', '', '', '', 'RZ - Cimahi', 'Cimahi Tengah_Padasuka', '', '', '', '1001140000125', 'Vika Karinta Novienda', 'Program Infak Pendidikan Siswa SD', 'y', 'ijis', '', '', '', 1, 1, 1, 1, NULL, NULL, NULL);

-- Table: ajis_pembinaan_new (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_pembinaan_new` (`id_row`, `id_pembinaan`, `tgl_pembinaan`, `semesterid`, `bulan`, `tahun`, `jenis_pembinaan`, `p3a`, `judul_materi`, `id_anak`, `kehadiran`, `keterangan`, `id_wilayah_pembinaan`, `user_insert`, `date_insert`, `user_update`, `date_update`, `kantor_id`, `jns_kel`, `asnaf`, `nik`, `nama_lengkap`, `jenjang_pendidikan`, `status_ortu`, `nama_lengkap_ayah`, `nama_lengkap_ibu`, `nama_lengkap_wali`, `nama_kantor`, `nama_wilayah`, `pemateri`, `pemateri_personal`, `ortu_hadir`, `id_donatur`, `nama_donatur`, `program_donasi`, `tampil`, `via_input`, `capaian_tilawah`, `capaian_tahfidz`, `capaian_tahfidz_hal`, `pembiasaan_shalat_wajib`, `pembiasaan_tilawah`, `pembiasaan_sedekah`, `membantu_ortu`) VALUES
(108255, '20260610162209194', '2020-12-31 17:00:00', '', '', '', 'Pembinaan Reguler', '', 'Iman Kepada Allah', '09194220156', 'y', '', '152', 'spmd.bandung', '2026-06-10 09:22:53', '', '1899-11-29 16:52:48', '09-194', '', '', '', 'Muhammad Ghinan Al Afghani', 'PT', '', '', '', '', 'RZ - Bandung', 'Soreang_Kopo', 'Fulan', '', '', '', '', '', 'y', '', '', '', '', 0, 1, 1, 1),
(108256, '20260610162209194', '2020-12-31 17:00:00', '', '', '', 'Pembinaan Reguler', '', 'Iman Kepada Allah', '09194190136', 'y', '', '152', 'spmd.bandung', '2026-06-10 09:22:53', '', '1899-11-29 16:52:48', '09-194', '', '', '', 'Muhammad Syahrul Ramdhani', 'PT', '', '', '', '', 'RZ - Bandung', 'Soreang_Kopo', 'Fulan', '', '', '', '', '', 'y', '', '', '', '', 0, 1, 1, 1),
(108257, '20260610162209194', '2020-12-31 17:00:00', '', '', '', 'Pembinaan Reguler', '', 'Iman Kepada Allah', '09194240023', 'y', '', '152', 'spmd.bandung', '2026-06-10 09:22:53', '', '1899-11-29 16:52:48', '09-194', '', '', '', 'Najwa Thufail Zahrani', 'PT', '', '', '', '', 'RZ - Bandung', 'Soreang_Kopo', 'Fulan', '', '', '', '', '', 'y', '', '', '', '', 0, 1, 1, 1),
(108258, '20260610162209194', '2020-12-31 17:00:00', '', '', '', 'Pembinaan Reguler', '', 'Iman Kepada Allah', '09194230018', 'y', '', '152', 'spmd.bandung', '2026-06-10 09:22:53', '', '1899-11-29 16:52:48', '09-194', '', '', '', 'Alesha Zarafita', 'SD', '', '', '', '', 'RZ - Bandung', 'Soreang_Kopo', 'Fulan', '', '', '', '', '', 'y', '', '', '', '', 0, 1, 1, 1),
(108259, '20260610162209194', '2020-12-31 17:00:00', '', '', '', 'Pembinaan Reguler', '', 'Iman Kepada Allah', '09194240042', 'y', '', '152', 'spmd.bandung', '2026-06-10 09:22:53', '', '1899-11-29 16:52:48', '09-194', '', '', '', 'Almira Renata Nur Falisha', 'SD', '', '', '', '', 'RZ - Bandung', 'Soreang_Kopo', 'Fulan', '', '', '', '', '', 'y', '', '', '', '', 0, 1, 1, 1);

-- Table: ajis_peminjam (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_peminjam` (`id`, `id_peminjam`, `nama_lengkap`, `jabatan`, `kantor`, `hp`, `telp`, `email`, `user_insert`, `date_insert`, `user_update`, `date_update`, `id_user_erpwh`) VALUES
(250, '1122024836866', 'Angga Prayuda', 'Ziswaf Consultant', 'RZ - Medan', '62895614006804', '', 'angga.prayuda@rumahzakat.org', '', '2025-06-06 17:00:00', '', '1899-11-29 16:52:48', NULL),
(249, '1082023835416', 'Randy Yan Pahlepi', 'Program Implementator', 'RZ Medan', '081360777628', '', 'randy.yan@rumahzakat.org', '', '2024-09-09 17:00:00', '', '1899-11-29 16:52:48', NULL),
(248, '1062005025035', 'Ganjar Nugraha', '', '', '', '', '', '', '2020-07-08 17:00:00', '', '1899-11-29 16:52:48', 140),
(247, '87654321', 'khairani efendi s', 'TU dan Finance', 'SDJ Tangerang', '085261885352', '', '', '', '2020-02-06 17:00:00', '', '1899-11-29 16:52:48', NULL),
(242, '12345678', 'Ardiansyah Pratomo Saputra', 'Funding', '', '', '', '', '', '2019-02-14 17:00:00', '', '1899-11-29 16:52:48', NULL);

-- Table: ajis_peminjaman_anak (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_peminjaman_anak` (`id_peminjaman`, `id_wilayah_pembinaan`, `kantor_id`, `nama_kantor`, `nama_wilayah`, `nama_anak`, `jns_kel`, `jenjang_pendidikan`, `alamat`, `nama_propinsi`, `nama_kabupaten`, `nama_kecamatan`, `nama_desa`, `foto`, `nama_peminjam`, `tgl_awal_peminjaman`, `tgl_selesai_peminjaman`, `id_peminjam`, `id_anak`, `status_pinjam`, `status_terpasangkan`, `tgl_expired`, `cancel`, `alasan_cancel`, `user_insert`, `date_insert`) VALUES
(39335, '330', '15-298', 'SMP Juara Pekanbaru', 'SMPJ Pekanbaru', 'M. Rizky Ramadhan ', 'l', 'SMP', 'Jalan Kesadaran Perum Graha Fauzan Asri A. 12', 'Riau', '', '', '', '15298260001_Rizky Ramadhan.jpg', 'Sangkala', '1899-11-28 16:52:48', NULL, '', '15298260001', 'y', 'n', '1899-12-05 16:52:48', 'n', NULL, '', '2026-06-23 17:00:00'),
(39334, '181', '10-230', 'RZ - Jakarta Timur', 'Jatinegara_Kampung Melayu', 'Naila Fitria', 'p', 'SD', 'Jl Permata I Kampung Melayu Jatinegara', 'DKI Jakarta', 'Kota Jakarta Timur', 'Jatinegara', 'Kel. Kampung Melayu', '10230230092_Naila Fitri_Jatinegara.jpg', NULL, '2026-06-16 17:00:00', NULL, '1012025001853', '10230230092', 'y', 'n', '2026-06-23 17:00:00', 'n', NULL, '', '2026-06-16 17:00:00'),
(39332, '43', '09-212', 'RZ - Solo', 'Pasar Kliwon_Sangkrah', 'Abdullah', 'l', 'SD', 'jl. Cempaka 11 no.6 RT 01 RW 11', 'Jawa Tengah', 'Kota Surakarta', 'Pasar Kliwon', 'Kel. Semanggi', '09212250012_Abdullah (1).jpg', 'Yeni Herawati', '2026-04-23 17:00:00', NULL, '1122015019001', '09212250012', 'y', 'n', '2026-04-30 17:00:00', 'n', NULL, '', '2026-06-11 17:00:00'),
(39333, '10', '09-212', 'RZ - Solo', 'Jebres_Jebres', 'Astifani Ade Ferlisa', 'p', 'SD', 'Ngemplak Sutan rt 003 rw 037', 'Jawa Tengah', 'Kota Surakarta', 'Jebres', 'Kel. Mojosongo', '09212220043_Astifani Ade Ferlisa.jpeg', 'Yeni Herawati', '2026-04-23 17:00:00', NULL, '1122015019001', '09212220043', 'y', 'n', '2026-04-30 17:00:00', 'n', NULL, '', '2026-06-11 17:00:00'),
(39331, '87', '09-224', 'RZ - Palembang', 'Ilir Timur I_20 Ilir D IV', 'Fadillah Sabania', 'p', 'SMA', 'Jl Papera Lr Mutaqin Rt 034 Rw 012', 'Sumatera Selatan', 'Kota Palembang', 'Ilir Timur I', 'Kel. Sungai Pangeran', '09224210022_fadila.jpg', 'M. Syatria Amka', '2026-04-08 17:00:00', NULL, '1122015011002', '09224210022', 'y', 'n', '2026-04-15 17:00:00', 'n', NULL, '', '2026-06-09 17:00:00');

-- Table: ajis_penilaian (ordered by `tgl_insert` DESC) — 5 row(s)
INSERT INTO `ajis_penilaian` (`id_anak`, `nama_anak`, `nama_kantor`, `nama_wilayah`, `kantor_id`, `id_wilayah_pembinaan`, `tgl_insert`, `semesterid`, `kategori`, `aspek`, `target`, `kondisi_awal`, `nilai_capaian`, `perkembangan_capaian`, `skor`, `hasil_akhir`, `keterangan`, `via_input`, `tampil`, `id_item_penilaian`, `id_anak_postgree`, `id_kantor_postgree`, `id_penilaian_postgree`, `id_item_postgree`, `id_kategori_postgree`) VALUES
('15297250003', 'NURSYIFA  AZKIATUNNISA', 'SMP Juara Bandung', 'SMP Juara Bandung', '15-297', '332', '2026-06-29 05:58:15', '25', 'Aspek Mandiri', 'Tahfidz', '', '', 92, '', 0, '', '', 'import', 0, 24, NULL, NULL, NULL, NULL, NULL),
('15297250003', 'NURSYIFA  AZKIATUNNISA', 'SMP Juara Bandung', 'SMP Juara Bandung', '15-297', '332', '2026-06-29 05:58:15', '25', 'Aspek Kompetitif', 'Prestasi', '', '', 0, 'hafal An Naas s.d. Al Mulk', 0, '', '', 'import', 0, 22, NULL, NULL, NULL, NULL, NULL),
('15297250003', 'NURSYIFA  AZKIATUNNISA', 'SMP Juara Bandung', 'SMP Juara Bandung', '15-297', '332', '2026-06-29 05:58:15', '25', 'Suara Anak Juara', 'Suara Anak Juara', '', '', 0, '', 0, '', '', 'import', 0, 29, NULL, NULL, NULL, NULL, NULL),
('15297250003', 'NURSYIFA  AZKIATUNNISA', 'SMP Juara Bandung', 'SMP Juara Bandung', '15-297', '332', '2026-06-29 05:58:15', '25', 'Aspek Cerdas', 'Pendidikan Kewarganegaraan', '75', '', 93, '', 92, '', '', 'import', 0, 14, NULL, NULL, NULL, NULL, NULL),
('15297250003', 'NURSYIFA  AZKIATUNNISA', 'SMP Juara Bandung', 'SMP Juara Bandung', '15-297', '332', '2026-06-29 05:58:15', '25', 'Aspek Mandiri', 'Terbiasa Membantu Orangtua', '', '', 100, '', 0, '', '', 'import', 0, 25, NULL, NULL, NULL, NULL, NULL);

-- Table: ajis_penilaian_temp (ordered by `tgl_insert` DESC) — 5 row(s)
INSERT INTO `ajis_penilaian_temp` (`id_penilaian`, `id_anak`, `nama_anak`, `nama_kantor`, `nama_wilayah`, `kantor_id`, `id_wilayah_pembinaan`, `tgl_insert`, `semesterid`, `kategori`, `aspek`, `target`, `kondisi_awal`, `nilai_capaian`, `perkembangan_capaian`, `skor`, `hasil_akhir`, `keterangan`, `via_input`, `tampil`, `id_item_penilaian`) VALUES
('20260629125615297', '15297230004', 'Rizky Ersa Zhiaulhaq', 'SMP Juara Bandung', 'SMP Juara Bandung', '15-297', '332', '2026-06-29 05:56:55', '25', 'Aspek Mandiri', 'Tahfidz', '', '', 80, '', 0, '', '', 'import', 0, 24),
('20260629125615297', '15297230004', 'Rizky Ersa Zhiaulhaq', 'SMP Juara Bandung', 'SMP Juara Bandung', '15-297', '332', '2026-06-29 05:56:55', '25', 'Aspek Kompetitif', 'Prestasi', '', '', 0, 'Juz 28,29,30', 0, '', '', 'import', 0, 22),
('20260629125615297', '15297230004', 'Rizky Ersa Zhiaulhaq', 'SMP Juara Bandung', 'SMP Juara Bandung', '15-297', '332', '2026-06-29 05:56:55', '25', 'Aspek Cerdas', 'Matematika', '75', '', 79, '', 88, '', '', 'import', 0, 16),
('20260629125615297', '15297230004', 'Rizky Ersa Zhiaulhaq', 'SMP Juara Bandung', 'SMP Juara Bandung', '15-297', '332', '2026-06-29 05:56:55', '25', 'Aspek Cerdas', 'Bahasa Indonesia', '75', '', 90, '', 88, '', '', 'import', 0, 15),
('20260629125615297', '15297230004', 'Rizky Ersa Zhiaulhaq', 'SMP Juara Bandung', 'SMP Juara Bandung', '15-297', '332', '2026-06-29 05:56:55', '25', 'Suara Anak Juara', 'Suara Anak Juara', '', '', 0, '', 0, '', '', 'import', 0, 29);

-- Table: ajis_penyaluran (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_penyaluran` (`id_row`, `id_penyaluran`, `id_pemasangan_baru`, `tgl_penyaluran`, `id_pemasangan`, `id_anak`, `jenjang_pendidikan`, `kelas`, `id_donatur`, `id_sdm`, `id_wilayah_pembinaan`, `id_kantor`, `program_donasi`, `nominal_penyaluran`, `nominal_hpp`, `user_insert`, `date_insert`, `user_update`, `date_update`, `bulan`, `tahun`, `transid`, `detailid`, `id_input_donasi`, `jenis`, `status_akhir`, `jns_kel`, `asnaf`, `nama_anak`, `nama_donatur`, `nama_wilayah`, `nama_kantor`, `nama_sdm`, `no_rekening`, `saldo_akhir_ganjil`, `nik`, `periode`, `status_tersalurkan`, `id_program`, `via_input`, `alamat`, `jcustid`, `id_pemasangan_new`, `id_pemasangan_postgree`, `id_kantor_postgree`, `id_penyaluran_postgree`, `pemilik_rekening`, `tempat_lahir`, `no_kartu_keluarga`, `desaid`, `nama_desa`, `nama_kecamatan`, `nama_kabupaten`, `nama_propinsi`, `nama_bank`) VALUES
(16, '170620261529833014586', '1529826000212491300030712026', '2026-03-14 17:00:00', '', '15298260002', 'SMP', NULL, '1249130003071', '', '330', '15-298', 'Infak Pendidikan Siswa SMP Juara', 450000, 355000, 'smpj.pekanbaru', '2026-06-24 07:49:04', '', '1899-11-29 16:52:48', '3', '2026', NULL, '', NULL, '', 'n', 'l', 'miskin', 'Ghazawan Arshad', 'Runi Kusumaning Rusdi', 'SMPJ Pekanbaru', 'SMP Juara Pekanbaru', NULL, '', NULL, '1471042511120001', 'ganjil', 'n', NULL, 'single', 'Jalan TG. Batu Gg. TG. Batu III No. 4', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
(15, '170620261529833014586', '1529826000112491300030712026', '2026-03-14 17:00:00', '', '15298260001', 'SMP', NULL, '1249130003071', '', '330', '15-298', 'Infak Pendidikan Siswa SMP Juara', 450000, 355000, 'smpj.pekanbaru', '2026-06-24 07:48:01', '', '1899-11-29 16:52:48', '3', '2026', NULL, '', NULL, '', 'n', 'l', 'miskin', 'M. Rizky Ramadhan ', 'Runi Kusumaning Rusdi', 'SMPJ Pekanbaru', 'SMP Juara Pekanbaru', NULL, '', NULL, '1305040206120001', 'ganjil', 'n', NULL, 'single', 'Jalan Kesadaran Perum Graha Fauzan Asri A. 12', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
(10, '060220261529833013999', '1529826000212491300030712026', '2026-02-21 17:00:00', '', '15298260002', 'SMP', NULL, '1249130003071', '', '330', '15-298', 'Infak Pendidikan Siswa SMP Juara', 450000, 355000, 'smpj.pekanbaru', '2026-06-24 07:41:13', '', '1899-11-29 16:52:48', '2', '2026', NULL, '', NULL, '', 'n', 'l', 'miskin', 'Ghazawan Arshad', 'Runi Kusumaning Rusdi', 'SMPJ Pekanbaru', 'SMP Juara Pekanbaru', NULL, '', NULL, '1471042511120001', 'ganjil', 'n', NULL, 'single', 'Jalan TG. Batu Gg. TG. Batu III No. 4', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
(9, '060220261529833013999', '1529826000112491300030712026', '2026-02-21 17:00:00', '', '15298260001', 'SMP', NULL, '1249130003071', '', '330', '15-298', 'Infak Pendidikan Siswa SMP Juara', 450000, 355000, 'smpj.pekanbaru', '2026-06-24 07:39:23', '', '1899-11-29 16:52:48', '2', '2026', NULL, '', NULL, '', 'n', 'l', 'miskin', 'M. Rizky Ramadhan ', 'Runi Kusumaning Rusdi', 'SMPJ Pekanbaru', 'SMP Juara Pekanbaru', NULL, '', NULL, '1305040206120001', 'ganjil', 'n', NULL, 'single', 'Jalan Kesadaran Perum Graha Fauzan Asri A. 12', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, ''),
(25, '1301202609209516913', '1529824000110071200003412026', '2026-01-17 17:00:00', '', '15298240001', 'SMP', NULL, '1007120000341', '', '330', '15-298', 'Infak Pendidikan Siswa SMP Juara', 450000, 355000, 'smpj.pekanbaru', '2026-06-22 08:31:21', '', '1899-11-29 16:52:48', '1', '2026', NULL, '', NULL, '', 'n', 'l', 'miskin', 'Abdul Afif Zulfahmi', 'Nurhidayati Endah Puspita Sari', 'SMPJ Pekanbaru', 'SMP Juara Pekanbaru', NULL, '', NULL, '1371032506100001', 'ganjil', 'n', NULL, 'single', 'Jalan Garuda Sakti KM 9, Perumnas Griyasakti', NULL, '', NULL, NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- Table: ajis_penyaluran_temp (ordered by `date_insert` DESC) — 0 row(s)
-- (empty table)

-- Table: ajis_periode_penilaian (ordered by `tgl_awal` DESC) — 3 row(s)
INSERT INTO `ajis_periode_penilaian` (`id_periode_penilaian`, `periode_penilaian`, `tgl_awal`, `tgl_akhir`, `aktif`) VALUES
(1, '', '2013-06-30 17:00:00', '2013-12-30 17:00:00', 'y'),
(2, '', '2013-06-30 17:00:00', '2013-12-30 17:00:00', 'y'),
(3, '', '1899-11-29 16:52:48', '1899-11-29 16:52:48', 'y');

-- Table: ajis_propinsi (ordered by `propid` DESC) — 5 row(s)
INSERT INTO `ajis_propinsi` (`propid`, `propinsi`, `ibukota`, `aktif`) VALUES
('9400', '	Papua	', '	Jayapura	', 'y'),
('8200', '	Maluku Utara	', '	Sofifi/Ternate	', 'y'),
('8100', '	Maluku	', '	Ambon	', 'y'),
('7600', '	Sulawesi Barat	', '	Mamuju	', 'y'),
('7500', '	Gorontalo	', '	Gorontalo	', 'y');

-- Table: ajis_sdm_wilayah (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_sdm_wilayah` (`id_sdm`, `nik`, `nama_lengkap`, `jenis_kelamin`, `alamat`, `propid`, `nama_propinsi`, `kabid`, `nama_kabupaten`, `camatid`, `nama_kecamatan`, `desaid`, `nama_desa`, `jenjang_pendidikan`, `tgl_bergabung`, `tgl_keluar`, `telp`, `hp`, `email`, `keterangan`, `keaktifan_edukasi`, `foto`, `aktif`, `user_insert`, `date_insert`, `user_update`, `date_update`) VALUES
(2462, '3404012612930001', 'Nico Adi Nugroho', 'l', 'Perum. Nogotirto III Jl. Lawu 67, Trihanggo, Gampi', '3400', 'D.I. Yogyakarta', '3404', 'Kab. Sleman', '340401', 'Gamping', '3404012005', 'Desa Trihanggo', 'SMA', '2026-05-31 17:00:00', '1899-11-29 16:52:48', '089670236528', '', '', '', 'y', '', 'y', '', '2026-06-24 17:00:00', '', '1899-11-29 16:52:48'),
(2461, '6112096210040005000', 'Suciah Ningsih Suci', 'p', 'Jalan Raya Sungai Kakap, Gg. Bersama, RT.001, RW.0', '6100', 'Kalimantan Barat', '6104', 'Kab. Kubu Raya', '611209', 'Sungai Kakap', '6112092001', 'Desa Sungai Kakap', 'SMA', '2025-01-31 17:00:00', '2045-05-31 17:00:00', '085650906180', '', '', '', 'y', '', NULL, '', '2026-06-18 17:00:00', '', '1899-11-29 16:52:48'),
(2460, '5678901234', 'Syaiful Maarif', 'l', 'Pal Sembilan', '6100', 'Kalimantan Barat', '6104', 'Kab. Kubu Raya', '611209', 'Sungai Kakap', '6112092007', 'Desa Sungai Belidak', 'S1', '2026-05-31 17:00:00', '1899-11-29 16:52:48', '', '', '', '', 'y', '', NULL, '', '2026-06-14 17:00:00', '', '1899-11-29 16:52:48'),
(2459, '1671027103850005', 'Nur Afriani', 'p', 'Jl Bungaran I', '1600', 'Sumatera Selatan', '1671', 'Kota Palembang', '167117', 'Jakabaring', '', '', 'S1', '2024-06-15 17:00:00', '1899-11-29 16:52:48', '0895620555409', '', '', '', '', '', NULL, '', '2026-05-28 17:00:00', '', '1899-11-29 16:52:48'),
(2458, '3273042004850045', 'Indri', 'p', 'Rancaekek', '3200', 'Jawa Barat', '3204', 'Kab. Bandung', '320428', 'Rancaekek', '3204282001', 'Desa Rancaekek Wetan', 'S1', '2026-03-31 17:00:00', '1899-11-29 16:52:48', '', '', '', '', 'y', '', NULL, '', '2026-04-29 17:00:00', '', '1899-11-29 16:52:48');

-- Table: ajis_semester (ordered by `tgl_awal` DESC) — 5 row(s)
INSERT INTO `ajis_semester` (`id`, `semesterid`, `semester`, `tgl_awal`, `tgl_akhir`, `onprogress`, `cover`, `cover_siswa`, `kata_pengantar`, `profil`, `kotak_profil_ceria`, `kotak_pembinaan_ceria`, `kotak_profil_siswa`, `kotak_pembinaan_siswa`, `keuangan`, `surat`, `bawah`, `kata_pengantar_siswa`, `bawah_siswa`, `tgl_awal_donasi`, `tgl_akhir_donasi`, `tgl_awal_saldo`, `tgl_akhir_saldo`, `jenis`, `tahun`, `lapsem`) VALUES
(224, '224', 'Juli - Desember 2125', '2125-06-30 17:00:00', '2125-12-30 17:00:00', 'n', '1_photo_2020-02-21_15-01-48.jpg', '1_coversekolah_juldes19.jpg', '', '', '', '', '', '', '', '', '', '', '', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '1899-11-29 16:52:48', 'genap', '2125', '1'),
(124, '124', 'Januari - Juni 2125', '2124-12-31 17:00:00', '2125-06-29 17:00:00', 'n', '1_photo_2020-02-21_15-01-48.jpg', '1_coversekolah_juldes19.jpg', '', '', '', '', '', '', '', '', '', '', '', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '1899-11-29 16:52:48', 'ganjil', '2125', '6'),
(223, '223', 'Juli - Desember 2124', '2124-06-30 17:00:00', '2124-12-30 17:00:00', 'n', '1_photo_2020-02-21_15-01-48.jpg', '1_coversekolah_juldes19.jpg', '', '', '', '', '', '', '', '', '', '', '', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '1899-11-29 16:52:48', 'genap', '2124', '1'),
(123, '123', 'Januari - Juni 2124', '2123-12-31 17:00:00', '2124-06-29 17:00:00', 'n', '1_photo_2020-02-21_15-01-48.jpg', '1_coversekolah_juldes19.jpg', '', '', '', '', '', '', '', '', '', '', '', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '1899-11-29 16:52:48', 'ganjil', '2124', '6'),
(222, '222', 'Juli - Desember 2123', '2123-06-30 17:00:00', '2123-12-30 17:00:00', 'n', '1_photo_2020-02-21_15-01-48.jpg', '1_coversekolah_juldes19.jpg', '', '', '', '', '', '', '', '', '', '', '', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '1899-11-29 16:52:48', 'genap', '2123', '1');

-- Table: ajis_survey (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_survey` (`id_survey`, `tgl_survey`, `petugas_survey`, `id_anak`, `nama_lengkap`, `nama_lengkap_ayah`, `nama_lengkap_ibu`, `nama_lengkap_wali`, `nama_kantor`, `nama_wilayah`, `asnaf`, `alamat`, `kantor_id`, `id_wilayah_pembinaan`, `jns_kel`, `jenjang_pendidikan`, `tgl_pengajuan`, `status_anak`, `hasil_kesimpulan_survey`, `user_insert`, `date_insert`, `user_update`, `date_update`, `kepemilikan_tanah`, `kepemilikan_rumah`, `kondisi_dinding_rumah`, `kondisi_lantai_rumah`, `kepemilikan_kendaraan`, `kepemilikan_barang_elektronik`, `pekerjaan_kepala_keluarga`, `rata_rata_penghasilan_perbulan`, `kepemilikan_tabungan`, `makan_2x`, `nama_kepala_keluarga`, `pendidikan_terakhir_kepala_keluarga`, `jml_tanggungan_kepala_keluarga`, `sumber_air_bersih`, `jamban_dan_saluran_limbah`, `tempat_pembuangan_sampah`, `terdapat_perokok`, `terdapat_konsumen_miras`, `terdapat_persediaan_obat_p3k`, `makan_buah_dan_sayur_tiap_hari`, `shalat_5_waktu`, `membaca_alquran`, `majelis_taklim`, `membaca_koran`, `aktif_sebagai_pengurus_organisasi`, `asnaf_anak`, `biaya_pendidikan_spp_perbulan`, `bantuan_rutin_dari_lembaga_lain`, `jml_bantuan_rutin_dari_lembaga_lain`, `resume_deskriptif`, `nama_kecamatan`, `nama_desa`, `nama_propinsi`, `nama_kabupaten`, `id_anak_odoo`) VALUES
(62113, '2026-06-26 17:00:00', '', '09194260033', 'Rafa Raditya Arkan', 'Agung Kurniawan', 'Imas Wati', '', 'RZ - Bandung', 'Astana Anyar_Karasak', 'miskin', 'jl. Moch toha gg ciseureuh x rt 10 / rw 03', '09-194', '3', 'l', 'SD', '2026-06-26 17:00:00', '', 'Layak', 'spmd.bandung', '2026-06-26 17:00:00', NULL, NULL, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, '', 0, '', '', '', 'Jawa Barat', '', NULL),
(62114, '2026-06-26 17:00:00', '', '09194200033', 'Deza Adika', '(Alm) Nandang Rasmana', 'Eti Nurhayati', '', 'RZ - Bandung', 'Antapani_Antapani Kulon', 'Miskin', 'Jl. Babakan Serang RT 04 RW 03', '09-194', '23', 'l', 'SMA', '2020-02-23 17:00:00', '', 'Layak', 'spmd.bandung', '2026-06-26 17:00:00', NULL, NULL, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, '', 0, '', 'Antapani', 'Kel. Antapani Tengah', 'Jawa Barat', 'Kota Bandung', NULL),
(62115, '2026-06-26 17:00:00', '', '09194200033', 'Deza Adika', '(Alm) Nandang Rasmana', 'Eti Nurhayati', '', 'RZ - Bandung', 'Antapani_Antapani Kulon', 'Miskin', 'Jl. Babakan Serang RT 04 RW 03', '09-194', '23', 'l', 'SMA', '2020-02-23 17:00:00', '', 'Layak', 'spmd.bandung', '2026-06-26 17:00:00', NULL, NULL, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, '', 0, '', 'Antapani', 'Kel. Antapani Tengah', 'Jawa Barat', 'Kota Bandung', NULL),
(62116, '2026-06-26 17:00:00', '', '09194200057', 'Eka Sri Maryati', 'Iin Taryana', 'Imas iim', '', 'RZ - Bandung', 'Antapani_Antapani Kulon', 'Miskin', 'Jl. Tarumasari Rt. 003/005', '09-194', '23', 'p', 'SMP', '2020-03-18 17:00:00', '', 'Layak', 'spmd.bandung', '2026-06-26 17:00:00', NULL, NULL, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, '', 0, '', 'Antapani', 'Kel. Antapani', 'Jawa Barat', 'Kota Bandung', NULL),
(62106, '2026-06-25 17:00:00', '', '09194250001', 'Nengaini Rayati Umami Putri Effendi', 'Apim Bibing Effendi', 'Emi Suratmi', '', 'RZ - Bandung', 'Rancaekek_Rancaekek Wetan', 'fakir', 'kp.pintu RT 03 RW 21 Desa Rancaekek Wetan', '09-194', '649', 'p', 'SMP', '2025-01-08 17:00:00', '', 'Layak', 'spmd.bandung', '2026-06-25 17:00:00', NULL, NULL, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, '', 0, '', 'Rancaekek', 'Desa Rancaekek Wetan', 'Jawa Barat', 'Kab. Bandung', NULL);

-- Table: ajis_user (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_user` (`id_user`, `username`, `password`, `nik`, `id_kantor`, `nama_kantor`, `nama_wilayah`, `aktif`, `user_insert`, `date_insert`, `id_group_user`, `id_wilayah_pembinaan`) VALUES
(540, 'smk.koperasi', '96cfdf1de941f2fda72bf586f092f1ea', 0, '09-215', 'RZ - Yogyakarta', 'SMK Koperasi Yogyakarta', 'y', '', '2026-06-24 17:00:00', 9, '651'),
(538, 'cnt', '1ae31d795167c7e0f5db83919a8787fe', 0, '09-219', 'RZ - Pusat', '', 'y', '', '2025-10-29 17:00:00', 1, '626'),
(537, 'Sempaja_Utara', 'c36481e870586d900bf6dbaaa215d3d9', 0, '09-221', 'RZ - Samarinda', 'Samarinda Utara_Sempaja Utara', 'y', '', '2025-07-10 17:00:00', 9, '645'),
(536, 'Rumah_Literasi', '2ef6aa64cb1a303ed3f9fe20bde644b2', 0, '09-218', 'RZ - Makassar', 'Rumah Literasi', 'y', '', '2025-01-19 17:00:00', 9, '647'),
(535, 'irvantestos', '2a9d119df47ff993b662a8ef36f9ea20', 0, 'pusat', '', '', 'y', '', '2024-10-27 17:00:00', 1, 'pusat');

-- Table: ajis_user_akses (ordered by `userid` DESC) — 0 row(s)
-- (empty table)

-- Table: ajis_view_ajuan (ordered by `tgl_approve_funding` DESC) — 5 row(s)
INSERT INTO `ajis_view_ajuan` (`id_ajuan`, `tgl_ajuan`, `nama_kantor`, `id_wilayah_pembinaan`, `nama_wilayah`, `id_donatur`, `oid_donatur`, `kantor_donatur`, `id_kantor`, `nama_donatur`, `jenis_kelamin_donatur`, `program_donasi`, `nia_rfo`, `nama_rfo`, `id_anak`, `nama_anak_asal`, `jns_kelamin`, `alasan_pergantian`, `id_anak_pengganti`, `nama_anak_pengganti`, `keterangan`, `tipe_ganti`, `pindah_saldo`, `approve_funding`, `status_eksekusi`, `tgl_eksekusi`, `tgl_approve_funding`, `jcustid`, `jenis_donatur`, `hp`, `alasan_reject`, `id_pemasangan_baru`) VALUES
(10162, '2026-06-11 17:00:00', 'RZ - Yogyakarta', '142', 'Piyungan_Srimulyo', '1003070000097', '', '', '09-215', 'Basuki Setyo Wibowo, ST/ Chusnul Chatimah', 'l', 'Program Infak Pendidikan Siswa SMA', '1122015003004', 'Amin Yusup', '09215200059', 'Sefrizal Yusuf Ramadhan', '', 'lulus SMA< sdh kerja', '09215260044', 'Kayla Dwi Agustina', 'pengganti Sefrizal', 'pemasangan_baru', 705000, 'y', 'y', '2026-06-11 17:00:00', '2026-06-12 06:32:10', '1', 'retail', '628122773695', '', '0921520005910030700000972026'),
(10163, '2026-06-11 17:00:00', 'RZ - Yogyakarta', '159', 'Umbulharjo_Muja Muju', '1003070001717', '', '', '09-215', 'Cahyo Wibowo Nugroho', 'l', 'Program Infak Pendidikan Siswa SMA', '1092002003002', 'Tri Budiharsana', '09215180168', 'Rahmat Aji Satria', '', 'lulus SMA', '09215260051', 'Silvia ningsih', 'pengganti Rahmat Aji			', 'pemasangan_baru', 940000, 'y', 'y', '2026-06-11 17:00:00', '2026-06-12 06:30:25', '1', 'retail', '628156892122', '', '0921518016810030700017172026'),
(10160, '2026-06-11 17:00:00', 'RZ - Bandar Lampung', '65', 'Bumi Waras_Sukaraja', '1249130000059', '', '', '10-236', 'Ryan Hidayat', 'l', 'Program Infak Pendidikan Siswa SD', '1052019001004', 'Moh Ilham', '10236170039', 'One Esya Sefriyani', '', 'Sudah Lulus', '10236260004', 'Azka Andrian Ali Syahab', '				', 'pemasangan_baru', 1850000, 'y', 'y', '2026-06-11 17:00:00', '2026-06-12 02:02:43', '1', 'retail', '6282185629901', '', '1023617003912491300000592026'),
(10154, '2026-06-08 17:00:00', 'RZ - Medan', '47', 'Medan Denai_Tegal Sari Mandala III', '1019100000160', '', '', '09-207', 'Emy Ardiana', 'l', 'Program Infak Pendidikan Siswa SD', '1012013249006', 'Siti Maryam', '09207220066', 'Ikhbar Ahsan Daulay', '', 'Tidak aktif pembinaan', '09207260004', 'Kaina Hazira', 'Layak mendapatkan bantuan pendidikan			', 'pemasangan_baru', 0, 'y', 'y', '2026-06-11 17:00:00', '2026-06-11 06:31:07', '1', 'retail', '6285868076650', '', '0920722006610191000001602026'),
(10157, '2026-06-08 17:00:00', 'RZ - Medan', '21', 'Binjai Kota_Binjai', '1001169001802', '', '', '09-207', 'Nafi Achmad Sentausa', 'l', 'Program Infak Pendidikan Siswa SMA', '1012013249006', 'Siti Maryam', '09207210641', 'M. Aidil Fauzan', '', 'Sudah tamat sekolah', '09207200059', 'Ahmad Rafiqi Fauzan', 'Layak mendapatkan bantuan pendidikan', 'pemasangan_baru', 0, 'y', 'y', '2026-06-11 17:00:00', '2026-06-11 06:31:02', '1', 'retail', '6281514076610', '', '0920721064110011690018022026');

-- Table: ajis_wilayah_pembinaan (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_wilayah_pembinaan` (`id_wilayah_pembinaan`, `nama_wilayah`, `alamat_wilayah`, `kantor_id`, `nama_kantor`, `status_approve`, `propid`, `nama_propinsi`, `kabid`, `nama_kabupaten`, `camatid`, `nama_kecamatan`, `desaid`, `nama_desa`, `aktif`, `user_insert`, `date_insert`, `user_update`, `date_update`) VALUES
(651, 'SMK Koperasi Yogyakarta', 'Jl. Kapas I No.5, Semaki, Kec. Umbulharjo, Kota Yogyakarta', '09-215', 'RZ - Yogyakarta', '', 3400, 'D.I. Yogyakarta', 3471, 'Kota Yogyakarta', 347113, 'Umbulharjo', 2147483647, 'Kel. Semaki', 'y', '', '2026-06-10 17:00:00', '', '1899-11-29 16:52:48'),
(650, 'Bluto_Kapedi', 'Dusun Aeng Paak', '09-213', 'RZ - Surabaya', '', 3500, 'Jawa Timur', 3529, 'Kab. Sumenep', 352905, 'Bluto', 2147483647, 'Desa Kapedi', 'y', '', '2026-04-08 17:00:00', '', '1899-11-29 16:52:48'),
(649, 'Rancaekek_Rancaekek Wetan', 'Masjid BaitulHaq \r\nJl. Wijayakusuma 4 ', '09-194', 'RZ - Bandung', '', 3200, 'Jawa Barat', 3204, 'Kab. Bandung', 320428, 'Rancaekek', 2147483647, 'Desa Rancaekek Wetan', 'y', '', '2026-04-01 17:00:00', '', '2026-04-01 17:00:00'),
(648, 'Semampir_Ujung', 'Sawah Pulo, Kel. Ujung, Kec. Semampir, Kota Surabaya', '09-213', 'RZ - Surabaya', '', 3500, 'Jawa Timur', 3578, 'Kota Surabaya', 357816, 'Semampir', 2147483647, 'Kel. Ujung', 'y', '', '2025-07-10 17:00:00', '', '1899-11-29 16:52:48'),
(647, 'Rumah Literasi', 'Jl Dg Tantu', '09-218', 'RZ - Makassar', '', 7300, 'Sulawesi Selatan', 7371, 'Kota Makassar', 737107, 'Tallo', 2147483647, 'Kel. Rappokalling', 'y', '', '2024-07-25 17:00:00', '', '2024-07-25 17:00:00');

-- Table: ajis_wilayah_pembinaan_new (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `ajis_wilayah_pembinaan_new` (`id_wilayah_pembinaan`, `nama_wilayah`, `alamat_wilayah`, `kantor_id`, `nama_kantor`, `status_approve`, `propid`, `nama_propinsi`, `kabid`, `nama_kabupaten`, `camatid`, `nama_kecamatan`, `desaid`, `nama_desa`, `aktif`, `user_insert`, `date_insert`, `user_update`, `date_update`) VALUES
(504, 'Banjarmasin Selatan_Pemurus Baru', 'Kantor Grapari Telkomsel, Jl. A Yani KM> 5,2', '09-195', 'IJ - Banjarmasin', '', 63, 'Kalimantan Selatan', 6371, 'Kota Banjarmasin', 637101, 'Banjarmasin Selatan', 0, '', 'y', '', '2019-02-14 17:00:00', '', '2019-02-18 17:00:00'),
(486, 'Pindad_Astana Anyar', 'AStana Anyar, Karasak', '09-194', 'IJ - Bandung', '', 32, 'Jawa Barat', 3273, 'Kota Bandung', 327310, 'Astana Anyar', 2147483647, 'Kel. Karasak', 'y', '', '2019-01-20 17:00:00', '', '1899-11-29 16:52:48'),
(487, 'Pindad_Baleendah', 'Baleendah Kel. Andir', '09-194', 'IJ - Bandung', '', 32, 'Jawa Barat', 3204, 'Kab. Bandung', 320432, 'Baleendah', 2147483647, 'Kel. Andir', 'y', '', '2019-01-20 17:00:00', '', '1899-11-29 16:52:48'),
(488, 'Pindad_Banjaran', 'Banjaran Desa Banjaran Wetan', '09-194', 'IJ - Bandung', '', 32, 'Jawa Barat', 3204, 'Kab. Bandung', 320413, 'Banjaran', 2147483647, 'Desa Banjaranwetan', 'y', '', '2019-01-20 17:00:00', '', '1899-11-29 16:52:48'),
(489, 'Pindad_Batununggal', 'Batununggal,Kel Samoja', '09-194', 'IJ - Bandung', '', 32, 'Jawa Barat', 3273, 'Kota Bandung', 327312, 'Batununggal', 2147483647, 'Kel. Samoja', 'y', '', '2019-01-20 17:00:00', '', '1899-11-29 16:52:48');

-- Table: bank (ordered by `id` DESC) — 5 row(s)
INSERT INTO `bank` (`id`, `nama_bank`) VALUES
(6, 'Muamalat'),
(5, 'BJB'),
(4, 'BNI'),
(3, 'Mandiri'),
(2, 'BRI');

-- Table: corez_campaign (ordered by `dtu` DESC) — 5 row(s)
INSERT INTO `corez_campaign` (`id_campaign`, `campaign`, `id_program`, `program`, `nominal_default`, `nominal_min`, `nominal_max`, `nominal_editable`, `nominal_option`, `nominal_target`, `nominal_funded`, `id_campaign_parent`, `image`, `description`, `sort`, `top`, `show`, `quantity_option`, `note`, `dtu`, `mode`, `coa_privilege`, `expired_date`, `first_show`, `active`) VALUES
(21, 'Ramadhan Bebas Hutang', 241, 'Ramadhan Bebas Hutang ', 0, 1000, 0, 1, 0, 0, 0, 27, 'https://www.rumahzakat.org/wp-content/themes/rz2016/images/program/ramadhan-bebas-hutang.jpg', 'Memberikan bantuan pelunasan hutang bagi keluarga kurang mampu yang kesulitan melunasi hutang mereka. Kategori hutang yang dilunasi adalah untuk keperluan pokok dan sehari-hari.', 19, 0, 1, 0, '', '2020-04-24 01:49:18', '', '', '2020-12-30 17:00:00', '', 1),
(18, 'Syiar Quran', 127, 'Syiar Quran', 170000, 170000, 0, 0, 0, 0, 0, 27, 'https://www.rumahzakat.org/wp-content/themes/rz2016/images/program/syiar-quran.jpg', '', 18, 0, 1, 1, '', '2020-04-24 01:49:14', '', '', '2020-12-30 17:00:00', '', 1),
(20, 'Janda Berdaya', 240, 'Janda Berdaya ', 550000, 550000, 0, 0, 0, 0, 0, 27, 'https://www.rumahzakat.org/wp-content/themes/rz2016/images/program/janda-berdaya.jpg', 'Berdayakan masyarakat terutama para janda melalui program Janda Berdaya, yaitu penambahan modal untuk mengembangkan usaha mereka.', 17, 0, 1, 1, '', '2020-04-24 01:49:10', '', '', '2020-12-30 17:00:00', '', 1),
(17, 'Bingkisan Lebaran Keluarga', 126, 'Bingkisan Lebaran Keluarga (BLK)', 375000, 375000, 0, 0, 0, 0, 0, 27, 'https://www.rumahzakat.org/wp-content/themes/rz2016/images/program/bingkisan-lebaran-keluarga.jpg', 'Hadirkan senyum keluarga prasejahtera dengan Bingkisan Lebaran Keluarga. Bingkisan terdiri dari sarung, Lunch Box Minyak Goreng, Kue kalens, Sirup Botol, Beras, Kerupuk.', 16, 0, 1, 1, '', '2020-04-24 01:49:07', '', '', '2020-12-30 17:00:00', '', 1),
(11, 'Kado Lebaran Yatim', 77, 'Kado Lebaran Yatim', 325000, 325000, 0, 0, 0, 0, 0, 27, 'https://www.rumahzakat.org/wp-content/themes/rz2016/images/program/kado-lebaran-yatim.jpg', 'Kado Lebaran Yatim hadirkan keceriaan bagi snak yatim dan dhuafa. Paket tersebut terdiri Buku Tulis, Kue Kaleng, Tas Sekolah, Lunch Box, Susu.', 15, 0, 1, 1, '', '2020-04-24 01:49:05', '', '', '2020-12-30 17:00:00', '', 1);

-- Table: corez_payment (ordered by `dtu` DESC) — 5 row(s)
INSERT INTO `corez_payment` (`id`, `is_parent`, `payment_methods`, `account_number`, `account_name`, `account_alias`, `title`, `id_parent`, `image`, `url`, `show`, `active`, `dtu`, `coa`, `recurring`, `credential`, `sort`) VALUES
(16, 1, 'eWallet', '', '', '', '', 0, '', '', 0, 0, '2020-04-15 06:34:22', '', '', '', 9),
(15, 1, 'CreditCard', '', '', '', '', 0, '', '', 0, 0, '2020-04-15 06:34:11', '', '', '', 7),
(17, 1, 'BankTransfer', '', '', '', '', 0, '', '', 1, 1, '2020-04-15 06:34:11', '', '', '', 1),
(1, 0, 'Bank Mandiri', '1320000440447', 'Yayasan Rumah Zakat', '1320000440447', 'Transfer Mandiri', 17, 'https://infak.id/storage/uploads/190410_110126_mandiri.png', 'https://ib.bankmandiri.co.id/retail/Login.do?action=form&lang=in_ID', 1, 1, '2020-04-15 06:30:07', '101.02.001.090', '', '', 2),
(2, 0, 'Bank BRI', '114101000127304', 'Rumah Zakat Indonesia', '114101000127304', 'Transfer BRI', 17, 'https://infak.id/storage/uploads/190410_110923_bri.png', 'https://ib.bri.co.id/ib-bri/', 0, 0, '2020-04-15 06:30:07', '101.02.001.082', '', '', 3);

-- Table: distribution (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `distribution` (`id_row`, `id_penyaluran`, `tgl_penyaluran`, `id_pemasangan`, `id_anak`, `jenjang_pendidikan`, `kelas`, `id_donatur`, `id_sdm`, `id_wilayah_pembinaan`, `id_kantor`, `program_donasi`, `nominal_penyaluran`, `nominal_hpp`, `user_insert`, `date_insert`, `user_update`, `date_update`, `bulan`, `tahun`, `transid`, `detailid`, `id_input_donasi`, `jenis`, `status_akhir`, `jns_kel`, `asnaf`, `nama_anak`, `nama_donatur`, `nama_wilayah`, `nama_kantor`, `nama_sdm`, `no_rekening`, `saldo_akhir_ganjil`, `nik`, `periode`) VALUES
(51, '160820181528832113627', '1899-11-29 16:52:48', '19517', '15288170046', 'SD', '', '1007070000654', '', '321', '15-288', 'Beasiswa Sekolah Juara SD', 375000, 375000, 'smd.admin', '2018-08-20 06:48:10', '', '1899-11-29 16:52:48', '8', '2018', '', '', '', '', 'n', '', '', '', '', '', '', '', NULL, NULL, NULL, 'genap'),
(189024, '200720180919716000000284', '1899-11-29 16:52:48', '19517', '15288170046', 'SD', '', '1007070000654', '', '321', '15-288', 'Beasiswa Sekolah Juara SD', 375000, 375000, 'smd.admin', '2018-08-20 06:47:47', '', '1899-11-29 16:52:48', '7', '2018', '', '', '', '', 'n', '', '', '', '', '', '', '', NULL, NULL, NULL, 'genap'),
(50, '160820181528832113627', '1899-11-29 16:52:48', '19516', '15288170033', 'SD', '', '1007100000168', '', '321', '15-288', 'Beasiswa Sekolah Juara SD', 375000, 375000, 'smd.admin', '2018-08-20 06:32:41', '', '1899-11-29 16:52:48', '8', '2018', '', '', '', '', 'n', '', '', '', '', '', '', '', NULL, NULL, NULL, 'genap'),
(189023, '200720180919716000000284', '1899-11-29 16:52:48', '19516', '15288170033', 'SD', '', '1007100000168', '', '321', '15-288', 'Beasiswa Sekolah Juara SD', 375000, 375000, 'smd.admin', '2018-08-20 06:32:10', '', '1899-11-29 16:52:48', '7', '2018', '', '', '', '', 'n', '', '', '', '', '', '', '', NULL, NULL, NULL, 'genap'),
(49, '160820181528832113627', '1899-11-29 16:52:48', '19515', '15288170067', 'SD', '', '1007160000036', '', '321', '15-288', 'Beasiswa Sekolah Juara SD', 375000, 375000, 'smd.admin', '2018-08-20 06:21:50', '', '1899-11-29 16:52:48', '8', '2018', '', '', '', '', 'n', '', '', '', '', '', '', '', NULL, NULL, NULL, 'genap');

-- Table: donatur (ordered by `tgl_update` DESC) — 5 row(s)
INSERT INTO `donatur` (`did`, `nama_lengkap`, `nama_publikasi`, `tgl_lahir`, `alamat_lengkap`, `alamat_silaturahmi`, `camatid`, `kabid`, `propid`, `jcustid`, `status`, `tgl_registrasi`, `aktif`, `kirim_sms`, `telp`, `fax`, `hp`, `email`, `website`, `verifikasi1`, `verifikasi2`, `jenis_kelamin`, `kecamatan_domisili`, `camatid_silaturahmi`, `kecamatan_silaturahmi`, `nama_kontak`, `telp_kontak`, `email_kontak`, `jabatan_kontak`, `nama_bank`, `no_rek`, `omid_donatur`, `oid_donatur`, `kantor_donatur`, `nia_rfo`, `nama_rfo`, `user_name`, `tipe_pelayanan`, `user_insert`, `periode_rutinitas_transaksiid`, `sumber_informasi`, `jalur_komunikasi`, `user_update`, `tgl_update`, `tag`, `npwp`, `cat1`, `cat2`, `updated`, `id_donatur_postgree`, `id_erp_wh`) VALUES
('1260502593105', 'Ariyanti Arsyad', 'Ariyanti', '1899-11-29 16:52:48', 'Serua Indah, Ciputat', 'Serua Indah, Ciputat', '', '', '', 1, '', '2026-05-01 17:00:00', 'y', '', '', '', '6281241248009', '', '', 0, 0, 'p', '', '', '', '', '', '', '', '', '', '', '', '', '1122015015004', 'Ohan Yohana', '', '', '', 0, '', '', '', '2026-05-01 17:00:00', '', '', '', '', '0000-00-00 00:00:00', NULL, NULL),
('112260105000828', 'Andy Agus Santoso', 'Andy Agus Santoso ', '1997-08-03 17:00:00', 'Ds.Gilang RT/RW 003/001 No 1, Kec.Ngunut, Kab.Tulungagung', 'Ds.Gilang RT/RW 003/001 No 1, Kec.Ngunut, Kab.Tulungagung', '', '', '', 1, '', '2026-01-04 17:00:00', 'y', '', '', '', '6281216782531', 'tomlespaulgibson@gmail.com', '', 0, 0, 'l', '', '', '', '', '', '', '', '', '', '', '', '', '1012025001853', 'Digital Fundraising', '', '', '', 0, '', '', '', '2026-04-29 17:00:00', '', '509498218629000', '', '', '0000-00-00 00:00:00', NULL, NULL),
('152604120000791', 'Khairunnisa Rahmahdani Danang', 'Khairunnisa Rahmahdani Danang', '2005-11-01 17:00:00', '', '', '', '', '', 1, '', '2026-04-11 17:00:00', 'y', '', '', '', '6281381281992', 'khairunnisard211@gmail.com', '', 0, 0, 'p', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, '', '', '', '2026-04-11 17:00:00', '', '', '', '', '0000-00-00 00:00:00', NULL, NULL),
('152604020004612', 'Ayushita Ahmad', 'Ayushita Ahmad', '1969-12-31 17:00:00', '', '', '', '', '', 1, '', '2026-04-01 17:00:00', 'y', '', '', '', '6285799912000', 'ayuteata@gmail.com', '', 0, 0, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, '', '', '', '2026-04-01 17:00:00', '', '', '', '', '0000-00-00 00:00:00', NULL, NULL),
('152603200005401', 'Novayani', 'Novayani', '1969-12-31 17:00:00', '', '', '', '', '', 1, '', '2026-03-19 17:00:00', 'y', '', '', '', '6281293229949', 'nova.yani1979@gmail.com', '', 0, 0, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 0, '', '', '', '2026-03-19 17:00:00', '', '', '', '', '0000-00-00 00:00:00', NULL, NULL);

-- Table: donatur_20190326 (ordered by `tgl_update` DESC) — 5 row(s)
INSERT INTO `donatur_20190326` (`did`, `nama_lengkap`, `nama_publikasi`, `tgl_lahir`, `alamat_lengkap`, `alamat_silaturahmi`, `camatid`, `kabid`, `propid`, `jcustid`, `status`, `tgl_registrasi`, `aktif`, `kirim_sms`, `telp`, `fax`, `hp`, `email`, `website`, `verifikasi1`, `verifikasi2`, `jenis_kelamin`, `kecamatan_domisili`, `camatid_silaturahmi`, `kecamatan_silaturahmi`, `nama_kontak`, `telp_kontak`, `email_kontak`, `jabatan_kontak`, `nama_bank`, `no_rek`, `omid_donatur`, `oid_donatur`, `kantor_donatur`, `nia_rfo`, `nama_rfo`, `user_name`, `tipe_pelayanan`, `user_insert`, `periode_rutinitas_transaksiid`, `sumber_informasi`, `jalur_komunikasi`, `user_update`, `tgl_update`, `tag`, `npwp`, `cat1`, `cat2`, `updated`) VALUES
('111111111111', 'Hamba Allah', 'Hamba Allah', '1899-11-29 16:52:48', ' JL.Turangga No.12 RT.03 RW.03  40391', '', '', '', '', 1, 'd', '1899-11-29 16:52:48', 'y', 'y', '', '', '', '', '', 0, 0, '', '', '', '', '', '', '', '', '', '', '001001', '04-001', 'RZ - Pusat', '', '', '', '', '', 0, '', '', '', '1899-11-29 16:52:48', '', '', '', '', '2019-03-26 05:02:53'),
('999999999999', 'Hamba Allah Host to Host', 'Hamba Allah  Host to Host', '1899-11-29 16:52:48', ' JL.Turangga No.12 RT.03 RW.03  40391', '', '', '', '', 1, 'd', '1899-11-29 16:52:48', 'y', 'y', '', '', '62', '', '', 0, 0, '', '', '', '', '', '', '', '', '', '', '001001', '04-001', 'RZ - Pusat', '', '', '', '', '', 0, '', '', '', '1899-11-29 16:52:48', '', '', '', '', '2019-03-26 05:03:23'),
('1001070000006', 'Siswanto', 'Siswanto', '1899-11-29 16:52:48', ' JL.Reog D-45    Kota Bandung ', '', '', '', '', 1, 'd', '1899-11-29 16:52:48', 'y', 'y', '', '', '62817208583', '', '', 0, 0, '', '', '', '', '', '', '', '', '', '', '283001', '13-283', 'OFD - Tele Consultant', '1022013249003', 'Wina Latifah Makmur', '', '', '', 0, '', '', '', '1899-11-29 16:52:48', '', '', '', '', '2019-03-26 05:00:01'),
('1001070000007', 'Evita Baroto', 'Evita Baroto', '1899-11-29 16:52:48', ' JL.Ketintang Permai BB 15    Kota Surabaya ', '', '', '', '', 1, 'd', '1899-11-29 16:52:48', 'y', 'y', '318284103', '', '62811371042', '', '', 0, 0, '', '', '', '', '', '', '', '', '', '', '249001', '11-249', 'OFD - Online Consultant', '1042014001001', 'Wahyuni', '', '', '', 0, '', '', '', '1899-11-29 16:52:48', '', '', '', '', '2019-03-26 05:00:01'),
('1001070000009', 'Noviyanti Agustin', 'Noviyanti Agustin', '1899-11-29 16:52:48', 'Komp. Taman Kencana Sejahtera JL.Jodipati No.17   Kota Sleman ', '', '', '', '', 1, 'd', '1899-11-29 16:52:48', 'y', 'y', '62274889059', '', '62817277035', '', '', 0, 0, '', '', '', '', '', '', '', '', '', '', '003001', '99-003', 'RZ - Yogyakarta', '', '', '', '', '', 0, '', '', '', '1899-11-29 16:52:48', '', '', '', '', '2019-03-26 05:00:01');

-- Table: donatur_rfo_temp (ordered by `date_insert` DESC) — 0 row(s)
-- (empty table)

-- Table: hcm_kantor (ordered by `id_kantor` DESC) — 5 row(s)
INSERT INTO `hcm_kantor` (`id_kantor`, `kantor`, `alamat`, `kota`, `kode_pos`, `telpon`, `fax`, `aktif`, `id_kantor_parent`, `id_kantor_level`, `id_kantorold`, `coa`, `coa_outlet`, `kantorid`) VALUES
('311001', 'RZ - Palmerah', 'Jalan Palmerah Barat No.45D Kel Grogol Utara', 'Jakarta', '', '', '', 'y', '', 0, '18-311', '101.01.002.611', '', 359),
('306001', 'RZ - Regional Overseas', 'Overseas', '3172', '423342342', '', '', 'y', '', 0, '14-306', NULL, '', 102),
('305001', 'RZ - Online Fundraising', 'Jln. Sinom No 3', '3273', '40555', '', '', 'y', '', 0, '14-305', NULL, '', 101),
('304001', 'RZ - Strategic', 'Perumahan Elit', '3204', '9845899865', '', '', 'y', '', 0, '14-304', NULL, '', 100),
('303001', 'RZI - Kantor MTT', 'Jl. Matraman', '3172', '63454', '', '', 'y', '', 0, '14-303', 'NULL', '', 99);

-- Table: kantor (ordered by `oid` DESC) — 5 row(s)
INSERT INTO `kantor` (`oid`, `kantor`, `alamat`, `oid_parent`, `level`, `aktif`, `id_office`, `id_kantor`, `omid`, `id_kantor_postgree`) VALUES
('99-003', 'RZ - Yogyakarta', NULL, NULL, NULL, 'y', NULL, 3, '003001', 0),
('98-002', 'RZ - Bandung', NULL, NULL, NULL, 'y', NULL, 2, '002001', 0),
('98-001', 'Corporate Partnership', NULL, NULL, NULL, NULL, NULL, 253, '003002', 0),
('396', 'RZ - Digital Fundraising', NULL, NULL, NULL, NULL, NULL, 396, '396', 0),
('374', 'RZ - Priority', NULL, NULL, NULL, NULL, NULL, 374, '374', 0);

-- Table: manual_laporan (ordered by `tgl_insert` DESC) — 5 row(s)
INSERT INTO `manual_laporan` (`laporanid`, `donatur_id`, `donatur_nama`, `donatur_alamat`, `pm_nama_lengkap`, `jns_kel`, `pm_tempat_lahir`, `pm_tgl_lahir`, `pm_anak_ke`, `pm_saudara`, `pm_nama_orang_tua`, `pm_pekerjaan`, `pm_anak_nama_sekolah`, `pm_anak_alamat_sekolah`, `pm_anak_kelas`, `pm_anak_jenjang`, `pm_mhs_institusi`, `pm_mhs_prodi`, `pm_mhs_semester`, `pm_mhs_jurusan`, `pembinaan_wilayah`, `pembinaan_alamat`, `pembinaan_jml_anak`, `pembinaan_jenjang`, `pembinaan_perkembangan`, `pembinaan_prestasi`, `dana_saldo_awal`, `dana_penerimaan`, `dana_penyaluran`, `tgl_update_keuangan`, `programid`, `semesterid`, `jenis`, `tahun`, `id_pemasangan_baru`, `id_naik_jenjang`, `formatid`, `aktif`, `oid`, `foto`, `status_foto`, `keterangan_foto`, `foto_pembinaan`, `s_foto_pembinaan`, `keterangan_foto_pembinaan`, `surat_suara_hati`, `status_ssh`, `keterangan_ssh`, `raport_ceria`, `status_raport_ceria`, `keterangan_raport_ceria`, `raport_satu`, `status_raport_satu`, `keterangan_raport_satu`, `raport_dua`, `status_raport_dua`, `keterangan_raport_dua`, `status_terbuat`, `tgl_status_terbuat`, `status_terkirim_fundraising`, `tgl_status_terkirim_fundraising`, `status_terkirim_donatur`, `tgl_status_terkirim_donatur`, `tgl_insert`, `user_insert`, `nik`, `id_anak`, `id_wilayah_pembinaan`, `id_pemasangan`, `nama_kantor`, `nama_wilayah`, `nama_semester`, `wajib_materi`, `jml_materi`, `jml_materi_tampil`, `tgl_penyaluran`, `tgl_pembinaan`, `jml_prestasi`, `s_perkembangan_siswa`, `keterangan_perkembangan_siswa`, `hasil_qc`, `keterangan`, `jenis_laporan`, `asnaf`, `status_ortu`, `s_materi`, `keterangan_materi`, `wajib_materi_bulan`, `jml_materi_tampil_bulan`, `tgl_penyaluran_bulan`, `tgl_pembinaan_bulan`, `s_raport`, `id_anak_postgree`, `id_kantor_postgree`, `id_pemasangan_postgree`, `id_donatur_postgree`, `id_program_postgree`, `id_pemasangan_mutakhir`, `id_ijgs_foto_lapsem`, `upload_gdrive`, `suara_anak_juara`, `catatan_pembinaan`) VALUES
('260624000002', '1249130003071', 'Runi Kusumaning Rusdi', '', 'M. Rizky Ramadhan ', 'l', 'Bukit Tinggi', '2012-06-01 17:00:00', 1, 2, 'Almarhum Zulhendra / Zuwirta Devi', '- / Wiraswasta', 'SMP Talenta Juara Pekanbaru', 'Jalan Legasari RT 003 RW 003\r\nKelurahan Tangkerang Selatan\r\nKecamatan Bukit Raya\r\nPekanbaru, Riau', '7', 'SMP', '', '', 0, '', 'SMPJ Pekanbaru', 'Jalan Legasari RT 03, RW 03', '', '', '', '', 1350000, 2700000, 900000, '2026-06-25 09:49:17', 5, '25', 'ganjil', '2026', '1529826000112491300030712026', '', 5, 'y', '15-298', '2026_06_24_15_07_32__Rizky Ramadhan.jpg', NULL, '', '', NULL, '', '', NULL, '', '', NULL, '', '', NULL, '', '', NULL, '', 0, '1899-11-29 16:52:48', '', '1899-11-29 16:52:48', '', '1899-11-29 16:52:48', '2026-06-24 08:05:42', 'smpj.pekanbaru', '1305040206120001', '15298260001', '330', '', 'SMP Juara Pekanbaru', 'SMPJ Pekanbaru', 'Januari - Juni 2026', 0, NULL, NULL, '', '', NULL, NULL, '', '', NULL, '', '', '', NULL, '', 0, 0, '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Assalamu\'alaikum Warahmatullahi Wabarakatuh. Ibu donatur, saya adalah M. Rizky Ramadhan dan akrab disapa Rizky, saya adalah siswa kelas 7 SMP Talenta Juara Pekanbaru. Saya mau mengucapkan terima kasih atas bantuan pendidikan yang ibu berikan kepada saya dan juga teman-teman yang lain, bantuan Ibu sangat berarti bagi kami disini. Saya juga turut mendoakan Ibu donatur senantiasa sehat, bahagia serta lancar terus rezekinya ya Ibu. Sekali lagi terima kasih Ibu Donatur.', NULL),
('260624000001', '1249130003071', 'Runi Kusumaning Rusdi', '', 'Ghazawan Arshad', 'l', 'Pekanbaru', '2012-11-24 17:00:00', 2, 2, 'Anton Saputra / Widiyanti Ahmad', 'Wiraswasta / Karyawan Swasta', 'SMP Talenta Juara Pekanbaru', 'Jalan Legasari RT 003 RW 003 \r\nKelurahan Tangkerang Selatan\r\nKecamatan Bukit Raya\r\nPekanbaru\r\nRiau', '7', 'SMP', '', '', 0, '', 'SMPJ Pekanbaru', 'Jalan Legasari RT 03, RW 03', '', '', '', '', 2250000, 2700000, 900000, '2026-06-25 09:49:17', 5, '25', 'ganjil', '2026', '1529826000212491300030712026', '', 5, 'y', '15-298', '2026_06_24_15_07_49__Ghaza.JPG', NULL, '', '', NULL, '', '', NULL, '', '', NULL, '', '', NULL, '', '', NULL, '', 0, '1899-11-29 16:52:48', '', '1899-11-29 16:52:48', '', '1899-11-29 16:52:48', '2026-06-24 07:56:05', 'smpj.pekanbaru', '1471042511120001', '15298260002', '330', '', 'SMP Juara Pekanbaru', 'SMPJ Pekanbaru', 'Januari - Juni 2026', 0, NULL, NULL, '', '', NULL, NULL, '', '', NULL, '', '', '', NULL, '', 0, 0, '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Assalamu\'alaikum Ibu donatur, apa kabar Ibu? Semoga sehat selalu Ibu dan keluarga. Alhamdulillah, saya tahun ini naik ke kelas 8 SMP dan juga pada awal tahun 2026 lalu, saya lulus masuk ke kelas takhasus, kelasnya para penghafal Al Quran. Saya ingin mengucapkan terima kasih banyak kepada Ibu donatur, semoga Ibu donatur dan keluarga selalu dilancarkan rezeki, diberikan kesehatan dan kebahagiaan baik di dunia dan akhirat kelak. Aamiin ya Rabb.', NULL),
('260622000004', '162106280003236', 'Ary Mercyanto', '', 'Wan Akbar Rizki Wanggana', 'l', 'Pekanbaru', '2011-07-12 17:00:00', 1, 3, 'Wan Laras Wangga (Alm) / Nina Martini Permana', '- / Ibu Rumah Tangga', 'SMP Juara Pekan', 'Jalan Legasari RT 003 RW 003\r\nKelurahan Tangkerang Selatan\r\nKecamatan Bukit Raya\r\nKota Pekanbaru\r\nProvinsi Riau', '9', 'SMP', '', '', 0, '', 'SMPJ Pekanbaru', 'Jalan Legasari RT 03, RW 03', '', '', '', '', 900000, 2700000, 1350000, '2026-06-25 09:49:17', 5, '25', 'ganjil', '2026', '152982300041621062800032362026', '', 5, 'y', '15-298', '2026_06_22_15_51_36__Wan Akbar2.JPG', NULL, '', '', NULL, '', '', NULL, '', '', NULL, '', '', NULL, '', '', NULL, '', 0, '1899-11-29 16:52:48', '', '1899-11-29 16:52:48', '', '1899-11-29 16:52:48', '2026-06-22 08:48:44', 'smpj.pekanbaru', '1471021307110001', '15298230004', '330', '', 'SMP Juara Pekanbaru', 'SMPJ Pekanbaru', 'Januari - Juni 2026', 0, NULL, NULL, '', '', NULL, NULL, '', '', NULL, '', '', '', NULL, '', 0, 0, '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Assalamu\'alaikum Warahmatullahi Wabarakatuh Bapak Donatur, Bapak donatur apa kabar? Semoga sehat selalu pak, saya disini juga dalam keadaan sehat dan bahagia, karena tahun ini saya berhasil menyelesaikan pendidikan di tingkat SMP dan melanjutkan pendidikan ke jenjang yang lebih tinggi lagi. Saya ingin mengucapkan terima kasih kepada Bapak yang telah bersedia berdonasi untuk biaya pendidikan saya di SMP Talenta Juara Pekanbaru. Saya doakan semoga rezeki Bapak donatur lancar terus, Bapak sukses dan bahagia selalu, serta Bapak dan keluarga sehat-sehat selalu. Aamiin ya Rabbal Alamin.', NULL),
('260622000003', '1007120000341', 'Nurhidayati Endah Puspita Sari', '', 'Abdul Afif Zulfahmi', 'l', 'Padang', '2010-06-25 17:00:00', 3, 4, 'Zulherman / Ali Arianti', 'Supir / Ibu Rumah Tangga', 'SMP Juara Pekanbaru', 'Jalan Legasari RT 003 RW 003\r\nKelurahan Tangkerang Selatan\r\nKecamatan Bukit Raya\r\nPekanbaru, Riau', '8', 'SMP', '', '', 0, '', 'SMPJ Pekanbaru', 'Jalan Legasari RT 03, RW 03', '', '', '', '', 450000, 0, 900000, '2026-06-25 09:49:17', 5, '25', 'ganjil', '2026', '1529824000110071200003412026', '', 5, 'y', '15-298', '2026_06_22_15_51_47__Abdul Afif2.JPG', NULL, '', '', NULL, '', '', NULL, '', '', NULL, '', '', NULL, '', '', NULL, '', 0, '1899-11-29 16:52:48', '', '1899-11-29 16:52:48', '', '1899-11-29 16:52:48', '2026-06-22 08:45:59', 'smpj.pekanbaru', '1371032506100001', '15298240001', '330', '', 'SMP Juara Pekanbaru', 'SMPJ Pekanbaru', 'Januari - Juni 2026', 0, NULL, NULL, '', '', NULL, NULL, '', '', NULL, '', '', '', NULL, '', 0, 0, '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Assalamualaikum Warahmatullahi Wabarakatuh. Terima kasih saya sampaikan kepada Ibu Donatur atas donasi bantuan pendidikannya kepada saya sebagai siswa SMP Talenta Juara Pekanbaru. Alhamdulillah tahun ini saya menyelesaikan pendidikan di sekolah ini dan saya akan melanjutkan pendidikan di jenjang yang lebih tinggi yaitu SMA. Sekali lagi, saya ucapkan terima kasih yang sebesarnya kepada Ibu, saya do\'akan Ibu sehat dan bahagia selalu, dilancarkan urusan Ibu dan keluarga, serta terus berlimpahan rezeki agar anak-anak lain seperti saya juga bisa merasakan manfaat bantuan pendidikan ini. Aamiin ya Rabb.', NULL),
('260622000002', '1007160000036', 'dr. Achmad Marzuki, Sp.BTKV', '', 'Rizky Aditya Pratama Hasibuan', 'l', 'Padang Sidimpuan', '2010-12-26 17:00:00', 1, 3, 'Ali Rahmat Hasibuan / Irma Suryani Nst', 'Buruh / Ibu Rumah Tangga', 'SMP Juara Pekanbaru', 'Jln. Legasari RT 003 RW 003\r\nKelurahan Tangkerang Selatan\r\nKecamatan Bukit Raya\r\nPekanbaru, Riau', '9', 'SMP', '', '', 0, '', 'SMPJ Pekanbaru', 'Jalan Legasari RT 03, RW 03', '', '', '', '', 900000, 2250000, 450000, '2026-06-25 09:49:17', 5, '25', 'ganjil', '2026', '0920919017210071600000362026', '', 5, 'y', '15-298', '2026_06_22_10_22_56__Rizky2.JPG', NULL, '', '', NULL, '', '', NULL, '', '', NULL, '', '', NULL, '', '', NULL, '', 0, '1899-11-29 16:52:48', '', '1899-11-29 16:52:48', '', '1899-11-29 16:52:48', '2026-06-22 02:23:55', 'spmd.admin', '1277022712100003', '09209190172', '330', '', 'SMP Juara Pekanbaru', 'SMPJ Pekanbaru', 'Januari - Juni 2026', 0, NULL, NULL, '', '', NULL, NULL, '', '', NULL, '', '', '', NULL, '', 0, 0, '', '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Assalamualaikum Bapak donatur, saya adalah Rizky Aditya Pratama anak asuh Bapak selama di SMP Talenta Juara Pekanbaru. Tahun ini adalah tahun terakhir saya bersekolah di SMP Talenta Juara Pekanbaru, karena saya sudah dinyatakan lulus dari sini per bulan Juni 2026 dan akan melanjutkan pendidikan ke tingkat yang lebih tinggi lagi. Terima kasih banyak atas bantuan Bapak selama ini kepada saya, sehingga saya bisa menyelesaikan study di tingkat SMP ini dengan baik. Saya selalu mendo\'akan Bapak dan keluarga agar sehat-sehat selalu, lancar rezeki dan diberikan kebahagiaan di dunia dan akhirat. Aamiin ya Rabbal Alamin.', NULL);

-- Table: manual_laporan_lama (ordered by `tgl_insert` DESC) — 5 row(s)
INSERT INTO `manual_laporan_lama` (`laporanid`, `donatur_id`, `donatur_nama`, `donatur_alamat`, `pm_nama_lengkap`, `pm_tempat_lahir`, `pm_tgl_lahir`, `pm_anak_ke`, `pm_saudara`, `pm_nama_orang_tua`, `pm_pekerjaan`, `pm_anak_nama_sekolah`, `pm_anak_alamat_sekolah`, `pm_anak_kelas`, `pm_anak_jenjang`, `pm_mhs_institusi`, `pm_mhs_prodi`, `pm_mhs_semester`, `pm_mhs_jurusan`, `pembinaan_wilayah`, `pembinaan_alamat`, `pembinaan_jml_anak`, `pembinaan_jenjang`, `pembinaan_perkembangan`, `pembinaan_prestasi`, `dana_saldo_awal`, `dana_penerimaan`, `dana_penyaluran`, `programid`, `semesterid`, `formatid`, `aktif`, `oid`, `foto`, `surat_suara_hati`, `raport`, `raport_dua`, `status_terbuat`, `tgl_status_terbuat`, `status_terkirim_fundraising`, `tgl_status_terkirim_fundraising`, `status_terkirim_donatur`, `tgl_status_terkirim_donatur`, `tgl_insert`, `user_insert`) VALUES
('170914000016', '1019100000134', 'Novita Tjahyaningsih', '', 'Triyas Saputra', 'Surakarta', '2003-06-24 17:00:00', 2, 2, 'Dilar-Sarmi', 'Buruh', 'SMPN 14 Surakarta', 'Jl. Profesor WZ Yohannes No.54, Sudiroprajan, Jebres, Kota Surakarta\n', '8', 'SMP', '', '', 0, '', 'Jebres', 'Masjid Baiturrahman, Guwosari RT. 5 RW. 27 Kel.Jeb', 0, '', '', '', 0, 360000, 180000, 1, '07', 1, 'y', '09-212', 'upload/ajis/2017/09/15/cf40c574b833c27f6251b7103f7b5689.jpg', 'upload/ajis//2017/09/14/fe05233e46d6f2c1e4ca63323d228b6a.jpg', 'upload/ajis//2017/09/15/7da1c2d1ca949cc8ca3f376388375b56.jpg', '', 1, '2017-10-24 17:00:00', 0, '1899-11-29 16:52:48', 0, '1899-11-29 16:52:48', '2017-09-13 17:00:00', 'syamsulinar_syafri'),
('170914000009', '1019100000134', 'Novita Tjahyaningsih', '', 'Hanifah', 'Surakarta', '2003-01-16 17:00:00', 3, 3, 'Sunaryo-Sadinem', 'Buruh', 'SMPN 20 Surakarta', 'Jl. Surya No.155, Jagalan, Jebres, Kota Surakarta\n', '8', 'SMP', '', '', 0, '', 'Jebres', 'Masjid Baiturrahman, Guwosari RT. 5 RW. 27 Kel.Jeb', 0, '', '', '', 0, 360000, 360000, 1, '07', 1, 'y', '09-212', 'upload/ajis/2017/09/15/f341b63f6a5435d7be9936c82a361931.jpg', 'upload/ajis//2017/09/14/6fc77bba88db948b6454f927e08878b4.jpg', 'upload/ajis//2017/09/15/01ba5b7e69d2d4be5e2369bd3ce64b6b.jpg', '', 1, '2017-10-24 17:00:00', 0, '1899-11-29 16:52:48', 0, '1899-11-29 16:52:48', '2017-09-13 17:00:00', 'syamsulinar_syafri'),
('170914000011', '1019100000134', 'Novita Tjahyaningsih', '', 'Keysa Janu Riyanti', 'Surakarta', '2009-01-02 17:00:00', 1, 1, 'Sriyanto-Lina Budi Hartanti', 'Pegawai Swasta', 'SD Islam Sunan Kalijaga', 'Gambuhan RT01 Baluwarti, Pasar Kliwon\n', '2', 'SD', '', '', 0, '', 'Pasar Kliwon', 'Masjid Nur Soleh RW.13 Sangkrah, Pasar Kliwon, Sur', 0, '', '', '', 0, 310000, 310000, 1, '07', 1, 'y', '09-212', 'upload/ajis/2017/09/15/09641a8baafacaa7b173bdbe9615faac.jpg', 'upload/ajis//2017/09/14/b0a00ef4771a32c0cc8dc90c871e8be8.jpg', 'upload/ajis//2017/09/15/097bde6eff970bdad32668328dec1751.jpg', '', 1, '2017-10-24 17:00:00', 0, '1899-11-29 16:52:48', 0, '1899-11-29 16:52:48', '2017-09-13 17:00:00', 'syamsulinar_syafri'),
('170914000001', '1019100000134', 'Novita Tjahyaningsih', '', 'Adi Putra Harun', 'Surakarta', '2009-06-30 17:00:00', 2, 2, 'Sigit Harun Rosyid-Sri Marlina', 'Pegawai Swasta', 'SDN Kleco I', 'Jl. Slamet Riyadi No 554 Surakarta\n', '2', 'SD', '', '', 0, '', 'Laweyan', 'Komplek Kantor PLN Pusat, Jl.Slamet Riyadi, Suraka', 0, '', '', '', 0, 310000, 310000, 1, '07', 1, 'y', '09-212', 'upload/ajis/2017/09/15/e64d196f2d68cb17a26d4feb76ab401c.jpg', 'upload/ajis//2017/09/14/d079068cbdeb1569223997dc1cc9d086.jpg', 'upload/ajis//2017/09/15/7f2ca44f2327c33f09586a9675009fda.jpg', '', 1, '2017-10-24 17:00:00', 0, '1899-11-29 16:52:48', 0, '1899-11-29 16:52:48', '2017-09-13 17:00:00', 'syamsulinar_syafri'),
('170914000004', '1019100000134', 'Novita Tjahyaningsih', '', 'Dhony Wahyu Setiyawan', 'Surakarta', '2005-11-04 17:00:00', 2, 2, 'Joko Susilo-Wahyu Ningsih', 'Buruh', 'SDN Ngoresan No 80', '\n', '4', 'SD', '', '', 0, '', 'Jebres', 'Masjid Baiturrahman, Guwosari RT. 5 RW. 27 Kel.Jeb', 0, '', '', '', 0, 310000, 310000, 1, '07', 1, 'y', '09-212', 'upload/ajis/2017/09/14/981797794c977840fb8c69bca95cb645.jpg', 'upload/ajis//2017/09/14/41ec88556420169aa82c501466bd3c74.jpg', 'upload/ajis//2017/09/15/0b5da8f8391f5a1ec94f9d6aaf52f630.jpg', '', 1, '2017-10-24 17:00:00', 0, '1899-11-29 16:52:48', 0, '1899-11-29 16:52:48', '2017-09-13 17:00:00', 'syamsulinar_syafri');

-- Table: manual_laporan_pembinaan (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `manual_laporan_pembinaan` (`laporanid`, `detailid`, `id_anak`, `semesterid`, `tanggal`, `materi`, `date_insert`, `user_insert`, `aktif`) VALUES
('180404000107', 1, '09199170225', '09', '2017-07-15 17:00:00', 'Halal Bihalal dan Evaluasi Ramadhan', '2018-04-03 17:00:00', 'irvan', 'y'),
('180404000107', 5, '09199170225', '09', '2017-09-16 17:00:00', 'Keutamaan Birrul Walidain', '2018-04-03 17:00:00', 'irvan', 'y'),
('180404000107', 3, '09199170225', '09', '2017-08-12 17:00:00', 'Membangun Cita-cita dengan konsep Khoirun Nass Anf', '2018-04-03 17:00:00', 'irvan', 'y'),
('180404000107', 12, '09199170225', '09', '2017-12-16 17:00:00', 'Bahaya Perayaan Malam Tahun Baru Masehi', '2018-04-03 17:00:00', 'irvan', 'y'),
('180404000107', 2, '09199170225', '09', '2017-07-22 17:00:00', 'Bersahabat Dengan Lingkungan', '2018-04-03 17:00:00', 'irvan', 'y');

-- Table: manual_laporan_prestasi (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `manual_laporan_prestasi` (`id_prestasi`, `id_anak`, `nama_anak`, `jns_kel`, `kantor_id`, `id_wilayah_pembinaan`, `nama_kantor`, `nama_wilayah`, `jenjang_pendidikan`, `kelas`, `event`, `lokasi`, `bidang_prestasi`, `skala`, `prestasi`, `link_publikasi`, `waktu_awal`, `waktu_akhir`, `date_insert`, `user_insert`, `aktif`) VALUES
(383, '09215250040', 'Izzatul Hikmah Mardliya', 'p', '09-215', '', 'IJ - Yogyakarta', 'Prambanan_Madurejo', 'SMP', '8', '', '', '', '', 'Ziyadah 30juz, Juara 1 Lomba Tartil Al Quran tingkat kecamatan Prambanan', '', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '2025-08-06 17:00:00', 'deploy', 'y'),
(384, '10230230058', 'Aisyah Nur Rahma', 'p', '10-230', '', 'IJ - Jakarta Timur', 'Pademangan_Pademangan Timur', 'SMP', '7', 'tes', 'tes', '', '', 'hafal juz 30', '', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '2025-08-06 17:00:00', 'deploy', 'y'),
(381, '09208250004', 'Febria Tari Syafira', 'p', '09-208', '', 'IJ - Padang', 'Lubuk Kilangan_Indarung', 'PT', '', 'MTQ tingkat Kota Solok ', 'Solok', 'MHQ (Musabaqah Hifzhil Qurâ€™an)', 'Regional', 'Juara 1', '', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '2025-02-09 17:00:00', 'spmd.padang', 'y'),
(382, '09208250004', 'Febria Tari Syafira', 'p', '09-208', '', 'IJ - Padang', 'Lubuk Kilangan_Indarung', 'PT', '', 'MTQ tingkat Kota Solok tahun 2022', 'Solok', 'MHQ (Musabaqah Hifzhil Qurâ€™an)', 'Regional', 'Juara 2', '', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '2025-02-09 17:00:00', 'spmd.padang', 'y'),
(377, '13282220021', 'Raditiya Tamamulaisy', 'l', '13-282', '', 'SMK Peternakan Juara Subang', 'SMKPJ Subang', 'SMA', '10', '', '', 'Tahfizhul Quran', '', 'Terpilih menjadi Peserta Pengibar Bendera dalam Rangka 17 Agustus 2022  Se- Kecamatan Kasomalang, dan Hafidz Quran 3 Jun', '', '1899-11-29 16:52:48', '1899-11-29 16:52:48', '2022-09-12 17:00:00', 'smkpj.subang', 'y');

-- Table: manual_laporan_temp (ordered by `tgl_insert` DESC) — 0 row(s)
-- (empty table)

-- Table: materi (ordered by `id_materi` DESC) — 5 row(s)
INSERT INTO `materi` (`id_materi`, `detailid`, `materi`, `tanggal`, `jenjang`, `semesterid`, `oid`, `id_wilayah_pembinaan`) VALUES
(7194, '', 'Aku Cinta Islam dan Siap Jadi Muslim Hebat', '2025-12-20 17:00:00', '', '24', '09-198', ''),
(7193, '', 'Menjadi Pemuda Hebat di Zaman Sekarang', '2025-11-22 17:00:00', '', '24', '09-198', ''),
(7192, '', 'Menghindari Dosa Kecil dan Besar', '2025-10-18 17:00:00', '', '24', '09-198', ''),
(7191, '', 'Teman Baik, Teman Buruk', '2025-09-20 17:00:00', '', '24', '09-198', ''),
(7190, '', 'Bersikap Baik kepada Orang Tua dan Guru', '2025-08-23 17:00:00', '', '24', '09-198', '');

-- Table: materi_temp (ordered by `id_materi` DESC) — 0 row(s)
-- (empty table)

-- Table: pekerjaan (ordered by `kerjaid` DESC) — 5 row(s)
INSERT INTO `pekerjaan` (`kerjaid`, `pekerjaan`) VALUES
('wrg', 'Penjaga Warung'),
('TRS', 'Tukang Reparasi/ Tukang Servis'),
('TP', 'Tukang Pijat'),
('TKY', 'Tukang Kayu'),
('TKW', 'Tenaga Kerja Wanita');

-- Table: perkembangan_temp (ordered by `tgl_insert` DESC) — 1 row(s)
INSERT INTO `perkembangan_temp` (`laporanid`, `donatur_id`, `donatur_nama`, `pm_nama_lengkap`, `pembinaan_perkembangan`, `tgl_insert`) VALUES
('', '', '', '', '', '2021-01-06 00:57:25');

-- Table: program (ordered by `tgl_insert` DESC) — 5 row(s)
INSERT INTO `program` (`progid`, `parent_progid`, `nama_program`, `nama_inggris_program`, `jenis_program`, `coa_program`, `sifat_program`, `keterangan`, `tgl_digulirkan`, `aktif`, `tgl_inaktif`, `kprogid`, `tgl_insert`, `tgl_change_status`, `status`, `dana_pengelola`, `nama_alias`, `pdanaid`, `id_anggaran`, `harga_program`, `harga_penyaluran`, `nominal_dp`, `nominal_dss`, `persentase_dp`, `persentase_dss`, `id_program`, `kredit_account`, `id_program_postgree`) VALUES
('400008', '', 'Beasiswa Anak Juara SMK', '', 'ln', '', 't', '', '1899-11-29 16:52:48', 'y', '0000-00-00 00:00:00', '40', '2018-05-03 07:02:36', '0000-00-00 00:00:00', 'nm', 'n', '', 0, '', 0, 0, 0, 0, 0, 0, 0, '', NULL),
('030003', '', 'Sahabat Infaq', '', 'ln', '', 'tt', '', '1899-11-29 16:52:48', 'y', '0000-00-00 00:00:00', '03', '2014-06-05 09:26:29', '0000-00-00 00:00:00', 'nm', 'n', '', 20, '', 0, 0, 0, 0, 0, 0, 0, '', NULL),
('610005', '', 'Beasiswa Ceria Khusus', 'Special Schoolarship Happy', 'dn', '', 'tt', 'Beasiswa Ceria Khusus pengganti KSAB', '2014-04-21 17:00:00', 'n', '0000-00-00 00:00:00', '61', '2014-04-21 19:18:02', '0000-00-00 00:00:00', 'nm', 'n', '', 0, '', 0, 0, 0, 0, 0, 0, 0, '', NULL),
('030002', '', 'I-Card', '', 'dn', '', 'tt', 'Program Infak Card (I-Card)', '1899-11-29 16:52:48', 'y', '0000-00-00 00:00:00', '03', '2013-05-23 07:00:03', '0000-00-00 00:00:00', 'nm', 'n', '', 20, '', 0, 0, 0, 0, 0, 0, 0, '', NULL),
('710016', '', 'Dana Non Cash : Dana Non Halal', ' ', 'dn', '', 'tt', ' ', '1899-11-29 16:52:48', 'y', '0000-00-00 00:00:00', '71', '2010-08-20 19:00:08', '0000-00-00 00:00:00', 'nm', 'n', '', 0, '', 0, 0, 0, 0, 0, 0, 0, '', NULL);

-- Table: ref_desa (ordered by `desaid` DESC) — 5 row(s)
INSERT INTO `ref_desa` (`desaid`, `nama_desa`, `kelurahan`, `camatid`, `aktif`, `propid`, `kabid`, `nomor_induk_desa`) VALUES
('Depok01', 'Cikeduk', 'n', 'Depok', 'y', '', '', NULL),
('91710301', 'Asano', 'y', '917103', 'y', '', '', NULL),
('91710101', 'Bhayangkara', 'y', '917101', 'y', '', '', NULL),
('9113302006', 'Gidomen', 'n', '911330', 'y', '', '', NULL),
('9113302005', 'Sentul', 'n', '911330', 'y', '', '', NULL);

-- Table: ref_kabupaten (ordered by `updated` DESC) — 5 row(s)
INSERT INTO `ref_kabupaten` (`kabid`, `propid`, `kabupaten`, `kota`, `ibukota`, `oid`, `aktif`, `lat`, `lng`, `updated`) VALUES
('1278', '1200', 'Serdang Bedagai', '0', '', '', 'y', 0, 0, '0000-00-00 00:00:00'),
('1101', '1100', 'Kab. Simeulue', '0', 'Sinabung', '05-012', 'y', 2.583333, 96.083336, '0000-00-00 00:00:00'),
('1102', '1100', 'Kab. Aceh Singkil', '0', 'Singkil', '05-012', 'y', 2.371511, 97.770081, '0000-00-00 00:00:00'),
('1103', '1100', 'Kab. Aceh Selatan', '0', 'Tapakutan', '05-012', 'y', 3.266619, 97.183319, '0000-00-00 00:00:00'),
('1104', '1100', 'Kab. Aceh Tenggara', '0', 'Kutacane', '05-012', 'y', 3.480802, 97.807159, '0000-00-00 00:00:00');

-- Table: ref_kecamatan (ordered by `camatid` DESC) — 5 row(s)
INSERT INTO `ref_kecamatan` (`camatid`, `nama_kecamatan`, `kodepos`, `kabid`, `aktif`, `updated`) VALUES
('Kab Pale', 'Ilir Timur Tiga', '30111 - 30', 'Kab', 'y', '1899-11-29 16:52:48'),
('927105', 'Sorong Utara', '', '9271', 'y', '2011-04-20 17:00:00'),
('927104', 'Sorong Kepulauan', '', '9271', 'y', '2011-04-20 17:00:00'),
('927103', 'Sorong Barat', '', '9271', 'y', '2011-04-20 17:00:00'),
('927102', 'Sorong Timur', '', '9271', 'y', '2011-04-20 17:00:00');

-- Table: ref_propinsi (ordered by `propid` DESC) — 5 row(s)
INSERT INTO `ref_propinsi` (`propid`, `propinsi`, `ibukota`, `aktif`) VALUES
('9400', 'Papua', '	Jayapura	', 'y'),
('8200', 'Maluku Utara', '	Sofifi/Ternate	', 'y'),
('8100', 'Maluku', '	Ambon	', 'y'),
('7600', 'Sulawesi Barat', '	Mamuju	', 'y'),
('7500', 'Gorontalo', '	Gorontalo	', 'y');

-- Table: setting_campaign (ordered by `expired_date` DESC) — 5 row(s)
INSERT INTO `setting_campaign` (`id_campaign`, `campaign`, `id_program`, `program`, `nominal_default`, `nominal_min`, `nominal_max`, `nominal_target`, `nominal_funded`, `nominal_funded_show`, `nominal_editable`, `image`, `banner`, `description`, `sort`, `top`, `show`, `note`, `expired_date`, `active`, `nominal_target_show`, `slug`, `donors_funded`, `qty_funded`, `dtu`, `cdt`, `id_kantor_rz`, `nominal_funded_alltime`, `id_anak`, `id_campaign_parent`) VALUES
(731, 'Beasiswa Baik untuk Velsya Amelinda', 2537, 'Beasiswa Baik', 486000, 10000, 0, 0, 140000, 1, 1, 'https://storage.googleapis.com/www.rumahzakat.org/500-x-350-donol%20beasiswa%20velsya.jpg', '', '<!DOCTYPE html>\r\n<html>\r\n<head>\r\n</head>\r\n<body>\r\n<p>Sahabat, pendidikan anak Indonesia begitu penting untuk masa depan bangsa. Kemajuan Bangsa ini sangat ditentukan dengan kualitas generasi muda untuk memimpin masa depan. Namun kenyataannya tidak semua anak Indonesia bisa menempuh pendidikan yang layak, dan bersekolah di perguruan tinggi, bahkan kabar buruknya ada yang terpaksa putus sekolah karena kurangnya kemampuan ekonomi keluarga.</p><p>Inilah kesempatan terbesar untuk kita berkontribusi dalam membangun bangsa yang cerdas demi masa depan yang cerah, dengan bergabung bersama Rumah Zakat dalam program Beasiswa Baik untuk membantu biaya pendidikan anak Indonesia yang membutuhkan.</p><p>Salah satunya adalah&nbsp;Velsya Amelinda, anak ke 1 dari 4 bersaudara yang kini duduk di kelas 10 di salah satu SMK di Bandung, Jawa Barat. Ayahnya seorang buruh yang berpenghasilan perbulan kurang lebih Rp2.000.000.</p><p>Velsya anak yang rajin, dan memiliki semangat belajar yang tinggi. Baginya sekolah adalah hal yang penting untuk masa depannya. Ia selalu berusaha untuk meraih prestasi yang baik agar layak mendapatkan beasiswa dan meringankan beban orang tua.</p><p>\'Alhamdulillah saya sangat senang belajar disana karena kawan-kawan saya baik dan lingkungannya pun menyenangkan. Nilai Rapot terakhir saya sejak bersekolah disana adalah 85 dan pelajaran favorit saya adalah Matematika\'. Ungkapnya dengan semangat.</p><p>Beasiswa Baik yang merupakan Program pemberian bantuan beasiswa bagi siswa pada jenjang SMA sederajat dan Mahasiswa Perguruan Tinggi yang berfokus pada pendampingan dan pelibatan aktif penerima beasiswa dalam penyelesaian masalah sosial yang terjadi di masyarakat. dengan tujuan Mewujudkan generasi pemimpin masa depan yang berakhlak baik, amanah, inspiratif dan mampu menjadi kreator perubahan, untuk memberikan kontribusi nyata bagi masyarakat.&nbsp;</p><p>Sahabat bisa membantu anak-anak indonesia termasuk Velsya untuk dapat melanjutkan pendidikannya, sahabat bisa berpartisipasi menjadi orangtua asuh Velsya, sehingga Velsya dapat menerima beasiswa untuk 1 tahun pendidikan.</p>\r\n</body>\r\n</html>', 120, 0, 1, '<jenis>internal</jenis><suggestion>1</suggestion>\r\n<mitra><data>internalrz</data></mitra><flag_program>Tidak Terikat</flag_program>', '2024-01-31 14:00:40', 1, 0, 'beasiswabaik-velsyaamelinda', 5, 0, '2023-08-05 23:43:48', '2023-07-24 09:00:49', 1, 0, '09194230055', 727),
(730, 'Beasiswa Baik Untuk Kirana', 2537, 'Beasiswa Baik', 486000, 10000, 0, 0, 170000, 1, 1, 'https://storage.googleapis.com/www.rumahzakat.org/beasiswa%20baik%20kirana%20septa.jpg', '', '<!DOCTYPE html>\r\n<html>\r\n<head>\r\n</head>\r\n<body>\r\n<p><span style="font-size: 14px;" data-mce-style="font-size: 14px;">JADI ORANGTUA ASUH UNTUK KIRANA</span></p><p><span style="font-size: 14px;" data-mce-style="font-size: 14px;">Pendidikan merupakah hak dasar bagi setiap manusia, Terlepas dari hak atas pendidikan yang harus dipenuhi, pada kenyataan nya beragam permasalahan terkait akses terhadap layanan pendidikan masih menjadi tantangan besar</span></p><p><span style="font-size: 14px;" data-mce-style="font-size: 14px;">Khusus bagi Indonesia, meskipun Pemerintah telah memiliki program pendidikan gratis pada jenjang-jenjang tertentu, biaya pendidikan masih tergolong tinggi mengingat pengeluaran kebutuhan pendidikan bukan hanya menyangkut biaya pendaftaran, SPP, dan biaya administratif lainnya.&nbsp;</span></p><p><span style="font-size: 14px;" data-mce-style="font-size: 14px;"><img src="https://storage.googleapis.com/www.rumahzakat.org/Kirana%20Septa.jpeg" alt="" data-mce-src="https://storage.googleapis.com/www.rumahzakat.org/Kirana%20Septa.jpeg"></span></p><p><span style="font-size: 14px;" data-mce-style="font-size: 14px;">Salah satunya adalah Kirana, pelajar SMK kelas XI di SMK BSC. Kirana tinggal di Rumah Sederhana bersama orangtua dan 3 saudaranya di Bandung. Pekerjaan ayah Kirana adalah Buruh dengan penghasilan pas pasan, Ayah Kirana bekerja keras menafkahi Kirana sekeluarga dan membiayai Kirana bersekolah. Namun ada kalanya kebutuhan sekolah dan SPP yang berat dan harus dilunasi dan juga biaya transportasi pulang pergi ke sekolah yang gak murah.</span></p><p><span style="font-size: 14px;" data-mce-style="font-size: 14px;"><br></span></p><p><span style="font-size: 14px;" data-mce-style="font-size: 14px;">Dengan program dari Rumah Zakat dan kebaikan dari donatur, kirana berharap bisa mendapatkan beasiswa dari orangtua Asuh dan meringankan tanggungan kedua orangtuanya.</span></p><p><span style="font-size: 14px;" data-mce-style="font-size: 14px;"><br></span></p><p><span style="font-size: 14px;" data-mce-style="font-size: 14px;">Beasiswa Baik yang merupakan Program pemberian bantuan beasiswa bagi siswa pada jenjang SMA sederajat dan Mahasiswa Perguruan Tinggi yang berfokus pada pendampingan dan pelibatan aktif penerima beasiswa dalam penyelesaian masalah sosial yang terjadi di masyarakat. dengan tujuan Mewujudkan generasi pemimpin masa depan yang berakhlak baik, amanah, inspiratif dan mampu menjadi kreator perubahan, untuk memberikan kontribusi nyata bagi masyarakat.&nbsp;</span></p><p><span style="font-size: 14px;" data-mce-style="font-size: 14px;"><br></span></p><p><span style="font-size: 14px;" data-mce-style="font-size: 14px;">Sahabat bisa membantu anak-anak indonesia termasuk kirana untuk dapat melanjutkan pendidikannya, sahabat bisa berpartisipasi menjadi orangtua asuh Kirana, sehingga Kirana dapat menerima beasiswa untuk 1 tahun pendidikan.&nbsp;</span></p><p>*Jika kebutuhan anak dalam profile ini sudah terpenuhi maka beasiswa akan diberikan untuk anak lainnya</p>\r\n</body>\r\n</html>', 2, 0, 1, '<jenis>internal</jenis>\r\n<mitra><data>sociomile</data></mitra><mitra><data>tmrz</data></mitra><flag_program>Tidak Terikat</flag_program>', '2024-01-31 14:00:39', 1, 0, 'beasiswa-baik-untuk-kirana', 4, 0, '2023-08-05 23:43:21', '2023-07-24 08:22:05', 1, 0, '09194220082', 727),
(732, 'Beasiswa Baik untuk Tia Sutiarsih', 2537, 'Beasiswa Baik', 796000, 10000, 0, 0, 325000, 1, 1, '	https://storage.googleapis.com/www.rumahzakat.org/500-x-350-donol%20beasiswa%20tia.jpg', '', '<!DOCTYPE html>\r\n<html>\r\n<head>\r\n</head>\r\n<body>\r\n<p>Sahabat, pendidikan anak Indonesia begitu penting untuk masa depan bangsa. Kemajuan Bangsa ini sangat ditentukan dengan kualitas generasi muda untuk memimpin masa depan. Namun kenyataannya tidak semua anak Indonesia bisa menempuh pendidikan yang layak, dan bersekolah di perguruan tinggi, bahkan kabar buruknya ada yang terpaksa putus sekolah karena kurangnya kemampuan ekonomi keluarga.</p><p>Inilah kesempatan terbesar untuk kita berkontribusi dalam membangun bangsa yang cerdas demi masa depan yang cerah, dengan bergabung bersama Rumah Zakat dalam program Beasiswa Baik untuk membantu biaya pendidikan anak Indonesia yang membutuhkan.</p><p>Salah satunya adalah Tia Sutiarsih, Mahasiswa Universitas Islam Negeri Bandung yang kini sudah menginjak semester 4. Tia tinggal bersama Ibunya yang bekerja sebagai petani dengan penghasilan perbulan kurang lebih Rp450.000.Ayahnya sudah meninggal 8 tahun yang lalu. Ibunya bekerja keras menafkahi Tia dan sekeluarga juga berusaha bisa memenuhi membiayai sekolah walau sering kekurangan.</p><p>\'Alhamdulillah saya sangat senang belajar disana karena kawan-kawan saya baik dan lingkungannya pun menyenangkan. Nilai IPK terakhir saya sejak berkuliah disana adalah 4 dan mata kuliah favorit saya adalah PAI.\' Ungkapnya dengan semangat.</p><p>Beasiswa Baik yang merupakan Program pemberian bantuan beasiswa bagi siswa pada jenjang SMA sederajat dan Mahasiswa Perguruan Tinggi yang berfokus pada pendampingan dan pelibatan aktif penerima beasiswa dalam penyelesaian masalah sosial yang terjadi di masyarakat. dengan tujuan Mewujudkan generasi pemimpin masa depan yang berakhlak baik, amanah, inspiratif dan mampu menjadi kreator perubahan, untuk memberikan kontribusi nyata bagi masyarakat.&nbsp;</p><p>Sahabat bisa membantu anak-anak indonesia termasuk Tia untuk dapat melanjutkan pendidikannya, sahabat bisa berpartisipasi menjadi orangtua asuh Tia, sehingga Tia dapat menerima beasiswa untuk 1 tahun pendidikan.<br><br><span style="font-size: 14px;">*Jika kebutuhan anak dalam profile ini sudah terpenuhi maka beasiswa akan diberikan untuk anak lainnya</span><br></p>\r\n</body>\r\n</html>', 120, 0, 1, '<jenis>internal</jenis><suggestion>1</suggestion>\r\n<mitra><data>internalrz</data></mitra><flag_program>Tidak Terikat</flag_program>', '2024-01-01 14:00:58', 1, 0, 'beasiswabaik-tia', 5, 0, '2023-08-05 23:44:02', '2023-07-24 09:27:49', 1, 0, '09194220016', 727),
(726, 'Beasiswa Baik untuk Pusvita Dewi ', 2537, 'Beasiswa Baik', 796000, 10000, 0, 0, 285000, 1, 1, 'https://storage.googleapis.com/www.rumahzakat.org/500-x-350-donol%20beasiswa%20puspita%20%281%29.jpg', '', '<!DOCTYPE html>\r\n<html>\r\n<head>\r\n</head>\r\n<body>\r\n<p>Sahabat, pendidikan anak Indonesia begitu penting untuk masa depan bangsa. Kemajuan Bangsa ini sangat ditentukan dengan kualitas generasi muda untuk memimpin masa depan. Namun kenyataannya tidak semua anak Indonesia bisa menempuh pendidikan yang layak, dan bersekolah di perguruan tinggi, bahkan kabar buruknya ada yang terpaksa putus sekolah karena kurangnya kemampuan ekonomi keluarga.</p><p>Inilah kesempatan terbesar untuk kita berkontribusi dalam membangun bangsa yang cerdas demi masa depan yang cerah, dengan bergabung bersama Rumah Zakat dalam program Beasiswa Baik untuk membantu biaya pendidikan anak Indonesia yang membutuhkan.</p><p>Salah satunya adalah,&nbsp;Pusvita Dewi Irawan. Gadis kelahiran tahun&nbsp;2001 ini bertempat tinggal di Kec.&nbsp;Ciparay Kab. Bandung bersama ayahnya yang bekerja sebagai buruh. Penghasilan yang tidak besar, terkadang hanya cukup untuk memenuhi kebutuhan sehari-hari, namun Ayahnya selalu berusaha keras agar anaknya bisa tetap sekolah.</p><p>\'Ayah saya adalah Buruh dengan penghasilan perbulan kurang lebih Rp1.200.000 Ayah saya bekerja keras menafkahi kami sekeluarga dan membiayai saya bersekolah\' tutur Pusvita saat ditemui di rumahnya.</p><p>Pusvita adalah anak ke 1 dari 3 bersaudara. Saat ini Pusvita sedang menempuh pendidikan di Univeristas Terbuka jurusan Komunikasi Bisnis Dan Sitem In semester 4.</p><p>\'Alhamdulillah saya sangat senang belajar disana karena kawan-kawan saya baik&nbsp;dan lingkungannya pun menyenangkan. Nilai IPK terakhir saya sejak berkuliah disana adalah 4 dan&nbsp;mata kuliah favorit saya adalah Manajemen Bisnis\' Ungkap Pusvita dengan sangat antusias.</p><p>Jarak dari rumah menuju kampus, sejauh 14 KM yang tempuh dengan Kendaraan Umum dan ia mensyukuri hal tersebut. Semangat belajarnya begitu tinggi, namun kebutuhan pendidikannya semakin lama semakin meningkat membuat ayah Pusvita harus bekerja lebih keras untuk memenuhinya.</p><p>Sahabat, yuk kita bantu Pusvita dengan berbagi dalam Program Beasiswa baik untuk penuhi kebutuhan pendidikannya hingga lulus nanti.</p><p>\'Saya akan bersekolah dengan baik dan&nbsp;rajin sehingga bisa membuat orang tua saya dan Bapak/Ibu sebagai donatur saya bangga. Saya&nbsp;doakan semoga Bapak/Ibu mempunyai kehidupan yang indah, berkah dan penuh rahmat dari Allah&nbsp;SWT\'. Ungkap Pusvita kepada tim Rumah Zakat.</p><p>Beasiswa Baik yang merupakan Program pemberian bantuan beasiswa bagi siswa pada jenjang SMA sederajat dan Mahasiswa Perguruan Tinggi yang berfokus pada pendampingan dan pelibatan aktif penerima beasiswa dalam penyelesaian masalah sosial yang terjadi di masyarakat. dengan tujuan Mewujudkan generasi pemimpin masa depan yang berakhlak baik, amanah, inspiratif dan mampu menjadi kreator perubahan, untuk memberikan kontribusi nyata bagi masyarakat.&nbsp;</p><p>Sahabat bisa membantu anak-anak indonesia termasuk Pusvita untuk dapat melanjutkan pendidikannya, sahabat bisa berpartisipasi menjadi orangtua asuh Pusvita, sehingga Pusvita dapat menerima beasiswa untuk 1 tahun pendidikan.<br><br><span style="font-size: 14px;">*Jika kebutuhan anak dalam profile ini sudah terpenuhi maka beasiswa akan diberikan untuk anak lainnya</span><br></p>\r\n</body>\r\n</html>', 120, 0, 1, '<jenis>internal</jenis><suggestion>1</suggestion>\r\n<mitra><data>internalrz</data></mitra><flag_program>Tidak Terikat</flag_program>', '2024-01-01 14:00:24', 1, 0, 'beasiswabaik-pusvitadewi', 3, 0, '2023-08-05 23:43:36', '2023-07-24 07:03:06', 1, 0, '09194230056', 727),
(728, 'Beasiswa Baik Untuk Daffa ', 2537, 'Beasiswa Baik', 486000, 10000, 0, 0, 610000, 1, 1, 'https://storage.googleapis.com/www.rumahzakat.org/beasiswa%20baik%2C%20daffa%20haiza.jpg', '', '<!DOCTYPE html>\r\n<html>\r\n<head>\r\n</head>\r\n<body>\r\n<p>DAFFA INGIN RINGANKAN BEBAN ORANGTUA DENGAN BEASISWA</p><p><br><br>Pendidikan merupakah hak dasar bagi setiap manusia, Terlepas dari hak atas pendidikan yang harus dipenuhi, pada kenyataan nya beragam permasalahan terkait akses terhadap layanan pendidikan masih menjadi tantangan besar</p><p>Khusus bagi Indonesia, meskipun Pemerintah telah memiliki program pendidikan gratis pada jenjang-jenjang tertentu, biaya pendidikan masih tergolong tinggi mengingat pengeluaran kebutuhan pendidikan bukan hanya menyangkut biaya pendaftaran, SPP, dan biaya administratif lainnya.&nbsp;</p><p><img src="https://storage.googleapis.com/www.rumahzakat.org/Daffa%20Haiza.jpeg" alt="" data-mce-src="https://storage.googleapis.com/www.rumahzakat.org/Daffa%20Haiza.jpeg"><br></p><p>Salah satunya adalah Daffa, pelajar SMA kelas 11 di SMAN 1 Banjaran. Dengan penghasilan orangtua perbulan kurang lebih Rp1.500.000, Ayah daffa bekerja keras menafkahi sekeluarga dan membiayai daffa bersekolah. Daffa termasuk anak yang memiliki nilai yang baik dengan rata-rata nilainya 85&nbsp; pelajaran favoritnya adalah Pendidikan Agama.Dengan program dari Rumah Zakat, Daffa berharap bisa mendapatkan beasiswa dan meringankan tanggungan kedua orangtuanya.</p><p>Beasiswa Baik yang merupakan Program pemberian bantuan beasiswa bagi siswa pada jenjang SMA sederajat dan Mahasiswa Perguruan Tinggi yang berfokus pada pendampingan dan pelibatan aktif penerima beasiswa dalam penyelesaian masalah sosial yang terjadi di masyarakat. dengan tujuan Mewujudkan generasi pemimpin masa depan yang berakhlak baik, amanah, inspiratif dan mampu menjadi kreator perubahan, untuk memberikan kontribusi nyata bagi masyarakat.&nbsp;</p><p>Sahabat bisa membanbntu anak-anak indonesia termasuk daffa untuk dapat melanjutkan pendidikannya, sahabat bisa berpartisipasi menjadi orangtua asuh daffa, sehingga daffa dapat menerima beasiswa untuk 1 tahun pendidikan.</p><p>Disclaimer : Jika kebutuhan anak dalam profile ini sudah terpenuhi maka beasiswa akan diberikan untuk anak lainnya</p><p><br></p><p><br></p>\r\n</body>\r\n</html>', 2, 0, 1, '<jenis>internal</jenis>\r\n<mitra><data>sociomile</data></mitra><mitra><data>tmrz</data></mitra><flag_program>Tidak Terikat</flag_program>', '2024-01-01 14:00:24', 1, 0, 'beasiswa-baik-untuk-daffa', 6, 1, '2023-08-05 23:42:50', '2023-07-24 07:19:22', 1, 0, '09194160069', 727);

-- Table: setting_program (ordered by `tgl_insert` DESC) — 5 row(s)
INSERT INTO `setting_program` (`id_program`, `progid`, `parent_progid`, `nama_program`, `nama_inggris_program`, `jenis_program`, `coa_program`, `sifat_program`, `keterangan`, `tgl_digulirkan`, `aktif`, `tgl_inaktif`, `kprogid`, `tgl_insert`, `tgl_change_status`, `status`, `dana_pengelola`, `nama_alias`, `pdanaid`, `id_anggaran`, `harga_program`, `harga_penyaluran`, `nominal_dp`, `nominal_dss`, `persentase_dp`, `persentase_dss`, `jenjang_pendidikan`, `baru`, `id_program_postgree`) VALUES
(99, '400010', '', 'Beasiswa Anak Juara Mahasiswa', '', 'ln', '400.02.002.005', 't', '', '1899-11-29 16:52:48', 'y', '0000-00-00 00:00:00', '40', '2018-05-14 06:58:38', '0000-00-00 00:00:00', 'nm', 'n', '', 0, '', 500000, 380000, 100000, 400000, 0.2, 0.8, 'PT', '', '3'),
(100, '400009', '', 'Beasiswa Anak Juara SMP', '', 'ln', '', 't', '', '1899-11-29 16:52:48', 'y', '0000-00-00 00:00:00', '40', '2018-05-03 07:04:06', '0000-00-00 00:00:00', 'nm', 'n', '', 0, '', 180000, 125000, 36000, 144000, 0.2, 0.8, 'SMP', '', '4'),
(101, '400008', '', 'Beasiswa Anak Juara SMK', '', 'ln', '', 't', '', '1899-11-29 16:52:48', 'n', '0000-00-00 00:00:00', '40', '2018-05-03 07:02:36', '0000-00-00 00:00:00', 'nm', 'n', '', 0, '', 0, 0, 0, 0, 0, 0, '', '', NULL),
(97, '400007', '', 'Beasiswa Anak Juara SD', '', 'ln', '', 't', '', '1899-11-29 16:52:48', 'y', '0000-00-00 00:00:00', '40', '2018-05-03 07:01:44', '0000-00-00 00:00:00', 'nm', 'n', '', 0, '', 155000, 105000, 31000, 124000, 0.2, 0.8, 'SD', '', '2'),
(288, '400006', '', 'Beasiswa Anak Juara SMA', '', 'ln', '400.02.002.005', 't', '', '1899-11-29 16:52:48', 'y', '0000-00-00 00:00:00', '40', '2018-05-03 06:44:17', '0000-00-00 00:00:00', 'nm', 'n', '', 0, '', 205000, 145000, 41000, 164000, 0.2, 0.8, 'SMA', '', '5');

-- Table: setting_program_donol (ordered by `id` DESC) — 5 row(s)
INSERT INTO `setting_program_donol` (`id`, `id_program`, `program`, `nom`, `nom_editable`, `tombol_donasi`, `minimal_donasi`, `aktif`, `note`, `top`, `parent_donol`, `parent_program_donol`, `deskripsi`, `gambar`, `program_in`, `program_en`, `deskripsi_en`, `footer_in`, `footer_en`, `urutan_mobile`, `urutan_desktop`, `first_show`, `hewanid`, `sifat_qurbanid`, `periode_qurbanid`, `jml_hewan`, `jml_bagian`, `jml_kornet`, `jml_kornet_salur`, `olahan`) VALUES
(39, 124, 'Insidental Bencana Alam', 0, 'y', 0, 0, 'y', '', 0, 0, 30, 'Gerakan sejuta masker untuk semua merupakan inisiasi Rumah Zakat untuk mencegah penyebaran virus corona dengan memberdayakan UMKM untuk memproduksi masker kain non medis dan membagikan ke warga masyarakat yang membutuhkan.', 'https://www.rumahzakat.org/wp-content/themes/rz2016/images/pejuang_medis_corona.png', 'Donasi Untuk Masker', '', '', '', '', 33, 0, '', '', '', '', '', '', '', '', ''),
(38, 241, 'Ramadhan Bebas Hutang ', 0, 'y', 0, 0, 'y', '', 0, 0, 30, 'Pelunasan utang konsumsi dan kesehatan bagi keluarga kurang mampu yang terdampak Covid-19.', 'https://www.rumahzakat.org/wp-content/themes/rz2016/images/pejuang_medis_corona.png', 'Bebaskan Hutang Keluarga', '', '', '', '', 32, 0, '', '', '', '', '', '', '', '', ''),
(37, 126, 'Bingkisan Lebaran Keluarga (BLK)', 375000, 'n', 0, 0, 'y', '', 0, 0, 30, 'Paket bahan pangan bagi keluarga pra sejahtera yang perekonomiannya terdampak dari virus corona.', 'https://www.rumahzakat.org/wp-content/themes/rz2016/images/pejuang_medis_corona.png', 'Bingkisan Keluarga Prasejahtera', '', '', '', '', 31, 0, '', '', '', '', '', '', '', '', ''),
(36, 77, 'Kado Lebaran Yatim', 325000, 'n', 0, 0, 'y', '', 0, 0, 30, 'Paket peralatan tulis dan makanan untuk anak-anak yatim yang tidak dapat bermain dan berkumpul dengan teman-temannya karena harus berdiam diri di rumah', 'https://www.rumahzakat.org/wp-content/themes/rz2016/images/pejuang_medis_corona.png', 'Bingkisan Yatim Dhuafa', '', '', '', '', 30, 0, '', '', '', '', '', '', '', '', ''),
(35, 102, 'Berbagi Buka Puasa', 37500, 'n', 0, 0, 'y', '', 0, 0, 30, 'Paket makanan lengkap untuk keluarga kurang mampu yang terdampak secara ekonomi dari wabah corona', 'https://www.rumahzakat.org/wp-content/themes/rz2016/images/pejuang_medis_corona.png', 'Berbagi Makan Keluarga', '', '', '', '', 29, 0, '', '', '', '', '', '', '', '', '');

-- Table: transaksi (ordered by `date_insert` DESC) — 5 row(s)
INSERT INTO `transaksi` (`transid`, `jenis_transaksi`, `did`, `detailid`, `progid`, `perkiraan_rp`, `tgl_donasi`, `tgl_transaksi`, `oid_transaksi`, `oid_donatur`, `vbayarid`, `mbayarid`, `nik_rfo`, `valid4`, `nik_claim`, `jid_claim`, `approved_claim`, `approved_trans`, `atas_nama`, `date_generate`, `keterangan`, `jml_mustahik`, `bulan_disantuni`, `nama_rfo`, `nama_claim`, `status_pasang`, `user_insert_cf`, `user_update_cf`, `approve_salur`, `ket_approve_salur`, `user_approve_salur`, `date_approve_salur`, `deleted_trans`, `deleted_detail`, `review`, `bulan_salur`, `tahun_salur`, `selisih_donasi`, `total_input_donasi`, `nama_donatur`, `nama_program`, `kantor_transaksi`, `kantor_donatur`, `jml_anak_ijis`, `kantor_ijis`, `id_kantor_ijis`, `harga_program`, `id_review`, `cicilan`, `jcustid`, `id_program`, `id_donatur_postgree`, `id_program_postgree`, `id_kantor_postgree`, `id_kantor_zains`, `id_transaksi_postgree`, `id_donatur_erp_wh`, `id_program_erp_wh`, `user_insert`, `date_insert`) VALUES
('90010102261729293', 'bank', '1012100000008', 1, '0', 210000, '2026-05-24 17:00:00', '2026-01-31 17:00:00', '04-001', '05-012', 'Bank Aceh Syariah 61001990001175 Reknas Pusat', 'Mobile Banking', '1092018001002', '', '', '', 'y', 'n', 'an: dr. Hanah Juwita Eka Puteri | Program Infak Pendidikan Siswa SMP', '0000-00-00 00:00:00', 'an: dr. Hanah Juwita Eka Puteri | Program Infak Pendidikan Siswa SMP', '1', '6', '', '', 'y', '', 'spmd.aceh', 'y', '', '', '0000-00-00 00:00:00', 'n', 'n', 'y', '6', '2026', 0, 210000, 'dr. Hanah Juwita Eka Puteri', 'Program Infak Pendidikan Siswa SMP', 'RZ - Pusat', 'RZ - Aceh', 2, 'RZ - Aceh', '09-197', 210000, '900101022617292931', 'n', 0, 2355, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'spmd.admin', '2026-06-02 13:07:35'),
('90010104262384980', 'bank', '1025070000156', 1, '0', 185000, '2026-04-28 17:00:00', '2026-03-31 17:00:00', '04-001', '07-034', 'Mandiri 1320004819745 Reknas Pusat', 'Mobile Banking', '1082025837592', '', '', '', 'y', 'n', 'an: Muhammad Bahroni | Program Infak Pendidikan Siswa SD', '0000-00-00 00:00:00', 'an: Muhammad Bahroni | Program Infak Pendidikan Siswa SD', '1', '6', '', '', 'y', '', 'spmd.bandung', 'y', '', '', '0000-00-00 00:00:00', 'n', 'n', 'y', '6', '2026', 0, 185000, 'Muhammad Bahroni', 'Program Infak Pendidikan Siswa SD', 'RZ - Pusat', 'RZ - Bandung - Turangga', 2, 'RZ - Bandung', '09-194', 185000, '900101042623849801', 'n', 0, 2354, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'spmd.admin', '2026-06-02 13:07:35'),
('90010204262547897', 'bank', '1008090000246', 1, '0', 375000, '2026-04-28 17:00:00', '2026-04-01 17:00:00', '04-001', '04-008', 'BNI 1555155581  Reknas Pusat', 'Transfer via Bank', '1092018001002', '', '', '', 'y', 'n', 'an: Irda Wahyuni | Infak Pendidikan Siswa SD Juara', '0000-00-00 00:00:00', 'an: Irda Wahyuni | Infak Pendidikan Siswa SD Juara', '1', '6', '', '', 'y', '', 'smdh', 'y', '', '', '0000-00-00 00:00:00', 'n', 'n', 'y', '6', '2026', 0, 375000, 'Irda Wahyuni', 'Infak Pendidikan Siswa SD Juara', 'RZ - Pusat', 'RZ - Medan', 2, 'SD Juara Medan', '15-287', 375000, '900102042625478971', 'n', 0, 2358, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'spmd.admin', '2026-06-02 13:07:35'),
('90010301263670452', 'bank', '1012100000008', 1, '0', 210000, '2026-05-24 17:00:00', '2026-01-02 17:00:00', '04-001', '05-012', 'Bank Aceh Syariah 61001990001175 Reknas Pusat', 'Mobile Banking', '1092018001002', '', '', '', 'y', 'n', 'an: dr. Hanah Juwita Eka Puteri | Program Infak Pendidikan Siswa SMP', '0000-00-00 00:00:00', 'an: dr. Hanah Juwita Eka Puteri | Program Infak Pendidikan Siswa SMP', '1', '6', '', '', 'y', '', 'spmd.aceh', 'y', '', '', '0000-00-00 00:00:00', 'n', 'n', 'y', '6', '2026', 0, 210000, 'dr. Hanah Juwita Eka Puteri', 'Program Infak Pendidikan Siswa SMP', 'RZ - Pusat', 'RZ - Aceh', 2, 'RZ - Aceh', '09-197', 210000, '900103012636704521', 'n', 0, 2355, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'spmd.admin', '2026-06-02 13:07:35'),
('90010303260346943', 'bank', '1012100000008', 1, '0', 210000, '2026-05-24 17:00:00', '2026-03-02 17:00:00', '04-001', '05-012', 'Bank Aceh Syariah 61001990001175 Reknas Pusat', 'Mobile Banking', '1092018001002', '', '', '', 'y', 'n', 'an: dr. Hanah Juwita Eka Puteri | Program Infak Pendidikan Siswa SMP', '0000-00-00 00:00:00', 'an: dr. Hanah Juwita Eka Puteri | Program Infak Pendidikan Siswa SMP', '1', '6', '', '', 'y', '', 'spmd.aceh', 'y', '', '', '0000-00-00 00:00:00', 'n', 'n', 'y', '6', '2026', 0, 210000, 'dr. Hanah Juwita Eka Puteri', 'Program Infak Pendidikan Siswa SMP', 'RZ - Pusat', 'RZ - Aceh', 2, 'RZ - Aceh', '09-197', 210000, '900103032603469431', 'n', 0, 2355, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'spmd.admin', '2026-06-02 13:07:35');

-- Table: transaksi_baru (ordered by `date_generate` DESC) — 0 row(s)
-- (empty table)

-- Table: transaksi_temp (ordered by `date_insert` DESC) — 0 row(s)
-- (empty table)

-- Table: wh_anak_juara (ordered by `date_generated` DESC) — 5 row(s)
INSERT INTO `wh_anak_juara` (`id_wh`, `id_pemasangan`, `id_anak`, `nik`, `nama_anak`, `jns_kel`, `asnaf`, `jenjang_pendidikan`, `kelas`, `status_aj`, `status_ortu`, `id_donatur`, `nama_donatur`, `id_kantor`, `nama_kantor`, `id_wilayah_pembinaan`, `nama_wilayah`, `program_donasi`, `harga_program`, `harga_penyaluran`, `status_mentor`, `nama_mentor`, `status_pasangan`, `tgl_pemasangan`, `tgl_pemberhentian_pemasangan`, `keterangan_pemberhentian`, `no_rekening`, `saldo_awal_ganjil`, `donasi_jan`, `donasi_feb`, `donasi_mar`, `donasi_apr`, `donasi_mei`, `donasi_jun`, `jml_berdonasi_ganjil`, `donasi_plus_saldo_ganjil`, `penyaluran_jan`, `penyaluran_feb`, `penyaluran_mar`, `penyaluran_apr`, `penyaluran_mei`, `penyaluran_jun`, `jml_tersalurkan_ganjil`, `saldo_akhir_ganjil`, `wajib_ganjil`, `aktif_ganjil`, `jml_lapsem_ganjil`, `saldo_awal_genap`, `donasi_jul`, `donasi_aug`, `donasi_sep`, `donasi_okt`, `donasi_nov`, `donasi_des`, `jml_berdonasi_genap`, `donasi_plus_saldo_genap`, `penyaluran_jul`, `penyaluran_aug`, `penyaluran_sep`, `penyaluran_okt`, `penyaluran_nov`, `penyaluran_des`, `jml_tersalurkan_genap`, `saldo_akhir_genap`, `aktif_genap`, `wajib_genap`, `date_generated`, `user_generated`, `nia_rfo`, `nama_rfo`) VALUES
(12637, '16729', '17306180002', '9171035708100011', 'Ayu Andira Maharani', 'p', 'Miskin', 'SD', '1', 'aj', 'Yatim', '1058090000193', 'Eko budhiarto suryosudiono', '17-306', 'SD Juara Jayapura', '382', 'SD Juara Jayapura', 'Beasiswa Sekolah Juara SD', 375000, 375000, 'n', '', 'y', '2018-03-11 17:00:00', '1899-11-29 16:52:48', '', '', 0, 0, 0, 375000, 375000, 375000, 375000, 1500000, 1500000, 0, 0, 375000, 375000, 375000, 375000, 1500000, 0, 'Wajib Lapsem', 'Stop', 1, 0, 375000, 375000, 375000, 0, 0, -375000, 750000, 750000, 375000, 375000, 0, 0, 0, 0, 750000, 0, 'Stop', 'Wajib Lapsem', '2022-11-21 07:35:36', 'smdh', '1012013249006', 'Siti Maryam'),
(19101, '19523', '15296180010', '3327136310110003', 'Nur Afiyah', 'p', 'Miskin', 'SD', '1', 'aj', 'Dhuafa', '3047170000013', 'Uwais Hijab', '15-296', 'SD Juara Cilegon', '329', 'SD Juara Cilegon', 'Beasiswa Sekolah Juara SD', 375000, 375000, 'n', '', 'y', '2018-08-19 17:00:00', '1899-11-29 16:52:48', '', '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', 'Stop', 0, 0, 0, 0, 375000, 0, 0, 0, 375000, 375000, 0, 375000, 0, 0, 0, 0, 375000, 0, 'Stop', 'Wajib Lapsem', '2022-11-15 09:35:48', 'smdh', '1122015047003', 'Saibani'),
(7798, '9974', '09231170342', '3674054301080002', 'Charisma Larasati', 'p', '', 'SD', '3', 'aj', 'Dhuafa', '1058090000153', 'Tirta Nugraha Mursitama', '09-231', 'IJ - Jakarta Barat', '225', 'Ciputat Timur_Rempoa', 'Beasiswa Anak Juara SD', 155000, 80000, 'n', '', 'y', '2017-06-15 17:00:00', '1899-11-29 16:52:48', '', '', 930000, 155000, 155000, 310000, 155000, 155000, 0, 930000, 1860000, 155000, 155000, 155000, 155000, 155000, 0, 775000, 1085000, 'Wajib Lapsem', 'Aktif', 1, 1085000, 0, 155000, 155000, 0, -185000, 0, 125000, 1210000, 155000, 155000, 0, 0, 0, 0, 310000, 900000, 'Aktif', 'Wajib Lapsem', '2022-11-04 08:29:08', 'spmd.admin', '1122015058001', 'Hari Santoso'),
(18098, '19314', '09215180107', '3471132308070002', 'Atha Muhammad Askar', 'l', 'Miskin', 'SD', '4', 'aj', 'Dhuafa', '1003070001125', 'Melany Eva Margaretha', '09-215', 'IJ - Yogyakarta', '159', 'Umbulharjo_Muja Muju', 'Beasiswa Anak Juara SD', 155000, 80000, 'n', '', 'y', '2018-08-12 17:00:00', '1899-11-29 16:52:48', '', '', 0, 0, -180000, 0, 0, 0, 0, -180000, -180000, 0, 0, 0, 0, 0, 0, 0, -180000, 'Koq Bisa?', 'Stop', 1, 0, 0, 155000, 155000, 0, 0, 0, 310000, 310000, 0, 155000, 0, 0, 0, 0, 155000, 155000, 'Aktif', 'Wajib Lapsem', '2020-02-10 08:59:18', 'spmd.admin', '1092002003002', 'Tri Budiharsana'),
(7600, '9752', '09207170054', '1271211707090003', 'Selga Tasya Shafira', 'p', 'Miskin', 'SD', '1', 'aj', 'Yatim', '1045090001042', 'Yeni Rinawati', '09-207', 'IJ - Medan', '2', 'Medan Selayang_Tanjungsari', 'Beasiswa Anak Juara SD', 155000, 80000, 'n', '', 'y', '2017-06-14 17:00:00', '1899-11-29 16:52:48', '', '', 0, 155000, 155000, 155000, 155000, 155000, 155000, 930000, 930000, 155000, 155000, 155000, 155000, 155000, 155000, 930000, 0, 'Wajib Lapsem', 'Stop', 1, 0, 155000, 155000, 0, -155000, 0, 0, 155000, 155000, 155000, 155000, 0, 0, 0, 0, 310000, -155000, 'Stop', 'Wajib Lapsem', '2019-10-10 04:34:29', 'spmd.admin', '1022017249001', 'Rismawati');

SET FOREIGN_KEY_CHECKS = 1;
