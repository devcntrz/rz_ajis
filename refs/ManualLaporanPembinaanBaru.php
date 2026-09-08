<?php
// Mulai output buffering di awal untuk menangkap semua output
ob_start();

//ini_set('allow_url_fopen',1);
// ini_set('display_errors',1);
// ini_set('display_startup_errors',1);
// error_reporting(-1);
extract($_GET);
extract($_POST);

require_once("mpdf/vendor/autoload.php"); //memanggil file dompdf_config.inc.php

require_once "class/LaporanPembinaanBaruClass.php";
$o_CLaporanPembinaanBaru = new CLaporanPembinaanBaru();
$sendVariable = null;
foreach (array_merge($_GET, $_POST) as $key => $value) {
    $o_CLaporanPembinaanBaru->$key = $value;
    $sendVariable .= $key . '=>' . $value;
}
$data = $o_CLaporanPembinaanBaru->DetailAnakJuara();
$data_prestasi = $o_CLaporanPembinaanBaru->PrestasiAnakJuara();
$data_pembinaan = $o_CLaporanPembinaanBaru->PembinaanAnakJuara();
$data_raport = $o_CLaporanPembinaanBaru->RaportAnakJuaraCerdas();
$data_raport_mandiri = $o_CLaporanPembinaanBaru->RaportAnakJuaraMandiri();
$data_raport_kompetitif = $o_CLaporanPembinaanBaru->RaportAnakJuaraKompetitif();
$data_raport_prestasi = $o_CLaporanPembinaanBaru->RaportAnakJuaraPrestasi();
$data_skor_mandiri = $o_CLaporanPembinaanBaru->getTotalSkorMandiri();
$suara_anak_juara = $o_CLaporanPembinaanBaru->getSuaraAnakJuara();
$suara_anak_juara_v2 = $o_CLaporanPembinaanBaru->getSuaraAnakJuarav2();
$catatan_pembinaan = $o_CLaporanPembinaanBaru->getCatatanPembinaan();


/*
<tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                  <td style='padding: 6px 7px 3px 7px; vertical-align: center; ' valign='center'>Jumlah Anak Yang Dibina</td>
                 <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;' valign='center'>:</td>
                 <td style='padding: 6px 7px 3px 7px; vertical-align: center; ' valign='center'>".$data['laporan']['pembinaan_jml_anak']."</td>
            </tr>
           <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                  <td style='padding: 6px 7px 3px 7px; vertical-align: center; ' valign='center'>Jenjang Anak Yang Dibina</td>
                <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;' valign='center'>:</td>
                 <td style='padding: 6px 7px 3px 7px; vertical-align: center; ' valign='center'>".$data['laporan']['pembinaan_jenjang']."</td>
            </tr>
*/

// Matikan debug mode untuk menghindari output yang tidak diinginkan
$mpdf = new mPDF(['debug' => false]);
echo "
<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.0 Transitional//EN'>
		<HTML dir=ltr>
		<HEAD>
			<TITLE>.: Laporan Beasiswa :.</TITLE>
<!DOCTYPE HTML PUBLIC '-//W3C//DTD HTML 4.01 Transitional//EN'
'http://www.w3.org/TR/html4/loose.dtd'><html>
<head>
<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />
<script src='scripts/js/cufon-yui.js' type='text/javascript'></script>
<script src='scripts/js/Gotham_Book_325-Gotham_Bold_400.font.js' type='text/javascript'></script>
<script type='text/javascript'>
    Cufon.replace('h4', {fontFamily: 'dejavusanscondensed'});
    Cufon.replace('h5', {fontFamily: 'dejavusanscondensed'});
    Cufon.replace('h6', {fontFamily: 'dejavusanscondensed'});
    Cufon.replace('h3', {fontFamily: 'dejavusanscondensed'});
    Cufon.replace('body', {fontFamily: 'dejavusanscondensed'});
</script>
<style type='text/css'>
@page { margin: 0px; }
@font-face {
    font-family: 'dejavusanscondensed';
    font-weight:lighter;
    src: url(fonts/MuseoSansRounded-500.otf);

}
body {
    margin: 0px;
	font-family: 'dejavusanscondensed';
    font: 0.9em/0.7em 'dejavusanscondensed';
    color: #404040;
    font-weight: normal;
}

td,th {

    font: 0.9em/0.7em 'dejavusanscondensed';
    color: #404040;
    font-weight: normal;
}
h3 { font-weight:normal; font-size: 13px;}
h4 { font-weight:normal; font-size: 13px;}
h5 { font-weight:normal; font-size: 13px;}
h6 { font-weight:normal; font-size: 13px;}
body { margin:0; padding:0;color:#000; }
p { margin:0; padding:0; line-height:20px; }
br { clear:both; }
li { margin-bottom:10px; }
th { background:#f60; color:#fff; text-align:center; }
table { /*background:#000;*/ }
td { background:#fff; height:10px; }
h1 { font-size:14px; font-weight:bold; margin:20px 0 4px 0; color:#f60; }
h2 { font-size:16px; font-weight:bold; margin:0 0 4px 0; color:#f60; }
.logo { float:left; width:200px;}
.jdl { text-align:right; clear:both; margin-bottom:10px; margin-top:10px;}
.lf { float:left; width:200px; padding:4px 0;}
.rg { float:left; width:300px; padding:4px 0;}

header { height:110px;}
.left { float:left; width:300px; text-align:center }
.right { float:right; width:300px; text-align:center }
.clear {
    clear: both;
}
.CSSTableGenerator tr:nth-child(odd){ background-color:#ffd256; }
.CSSTableGenerator tr:nth-child(even)    { background-color:#ffffff; }

.zebra td, .zebra th {
padding: 10px;
border-bottom: 1px solid #eee;
}
.zebra tbody tr:nth-child(even) {
background: #000;
color: #fff;
-webkit-box-shadow: 0 1px 0 rgba(255,255,255,.5) inset;
-moz-box-shadow: 0 1px 0 rgba(255,255,255,.5) inset;
box-shadow: 0 1px 0 rgba(255,255,255,.5) inset;
}
.zebra th {
text-align: left;
color:#fff;
text-shadow: 0 1px 0 rgba(255,255,255,.5);
border-bottom: 1px solid #eee;
background-color: #000;
background-image: -webkit-gradient(linear, left top, left bottom, from(#000), to(#aaa));
background-image: -webkit-linear-gradient(top, #000, #aaa);
background-image: -moz-linear-gradient(top, #000, #aaa);
background-image: -ms-linear-gradient(top, #000, #aaa);
background-image: -o-linear-gradient(top, #000, #aaa);
background-image: linear-gradient(top, #000, #aaa);
}
.zebra th:first-child {
-moz-border-radius: 6px 0 0 0;
-webkit-border-radius: 6px 0 0 0;
border-radius: 6px 0 0 0;
}
.zebra thast-child {
-moz-border-radius: 0 6px 0 0;
-webkit-border-radius: 0 6px 0 0;
border-radius: 0 6px 0 0;
}
.zebra tfoot td {
border-bottom: 0;
border-top: 1px solid #fff;
background-color: #f1f1f1;
}
.zebra tfoot td:first-child {
-moz-border-radius: 0 0 0 6px;
-webkit-border-radius: 0 0 0 6px;
border-radius: 0 0 0 6px;
}
.zebra tfoot tdast-child {
-moz-border-radius: 0 0 6px 0;
-webkit-border-radius: 0 0 6px 0;
border-radius: 0 0 6px 0;
}

#belang tbody tr:nth-child(odd) td {
    background: none repeat scroll 0 0 #FFFFFF;
}

#belang tbody tr:nth-child(odd) td {
    background: none repeat scroll 0 0 #eee;
}

#belang .odd { background:#FFFFFF; }
#belang .even { background:#eee; }

#belang td:odd { background:#FFFFFF; }
#belang td:even { background:#eee; }

tr:nth-child(even) {
  background-color: #FFFFFF;
}


tr:nth-child(odd) {
  background-color: #eee;
}
.tabel_donasi {
	font-size:14px;
}
.tabel_donasi th, td{
	padding: 15px;
}
.tabel_donasi tr:nth-child(odd) td {
    background-color: #fbfbfb
} /*odd*/
.tabel_donasi tr:nth-child(even) td {
    background-color: #e8ecee
} /* even*/
.tabel_donasi tr:hover td {
    background-color: #fffbae;
} /* hovering */

.tabel_donasi th:first-child {
    border-radius: 6px 0 0 0;
}

.tabel_donasi th:last-child {
    border-radius: 0 6px 0 0;
}

.tabel_donasi th:only-child{
    border-radius: 6px 6px 0 0;
}
</style>
</head>
<body style='font-size:12px;font-family: 'dejavusanscondensed';' >
";



if ($data['laporan']['programid'] == 5) {
    echo "<div style='border:1px solid #fff;width:793px;height:1120px;background-image:url(modules/ajis/lapsem/cover_siswa/" . $data['laporan']['cover_siswa'] . ");margin: 0px auto;'>
</div>
";
} else {
    echo "<div style='border:1px solid #fff;width:793px;height:1120px;background-image:url(modules/ajis/lapsem/cover/" . $data['laporan']['cover'] . ");margin: 0px auto;'>
</div>
";
}
/**if($data['laporan']['programid'] ==5) {
echo "<div style='border:1px solid #fff;width:793px;height:1120px;background-image:url(modules/ajis/lapsem/cover_siswa/".$data['laporan']['cover_siswa'].");margin: 0px auto;'>
</div><div style='border:1px solid #fff;width:793px;height:1120px;background-image:url(modules/ajis/lapsem/kata_pengantar_siswa/".$data['laporan']['kata_pengantar_siswa'].");margin: 0px auto;'>
    <div id='headSurat' style='border:0px solid #fff;width:400px;height:100px;margin: 260px 0 0 105px; position:absolute; '>
    Bapak/Ibu  : <strong>".$data['laporan']['donatur_nama']."<br><br></strong>
    ID Donatur : <strong>".$data['laporan']['donatur_id']."<br><br><br></strong>

    </div>
</div>
"; } else {
echo "<div style='border:1px solid #fff;width:793px;height:1120px;background-image:url(modules/ajis/lapsem/cover/".$data['laporan']['cover'].");margin: 0px auto;'>
</div><div style='border:1px solid #fff;width:793px;height:1120px;background-image:url(modules/ajis/lapsem/kata_pengantar/".$data['laporan']['kata_pengantar'].");margin: 0px auto;'>
 <div id='headSurat' style='border:0px solid #fff;width:400px;height:100px;margin: 260px 0 0 105px; position:absolute;'>
    Bapak/Ibu  : <strong>".$data['laporan']['donatur_nama']."<br><br></strong>
    ID Donatur : <strong>".$data['laporan']['donatur_id']."<br><br><br></strong>

    </div>
</div>
"; } */
if ($data['laporan']['semesterid'] < 16) {
    echo "
<div class='clear'></div>

	<div style='width:793px;height:1119px;background-image:url(modules/ajis/lapsem/profil/" . $data['laporan']['profil'] . ") ;  margin: 5px auto;'>
    <br>";
    if ($data['laporan']['programid'] == 5) {
        echo "<div style='width:699px;height:415px;margin: 0px auto;background-image:url(modules/ajis/lapsem/kotak_profil_siswa/" . $data['laporan']['kotak_profil_siswa'] . "); margin: 40px 0px 0px 60px;border: 0px solid #f60;'>
   <div style='width:auto;height:auto;margin:10px 0px 0px 484px;'>
<img style='height:168px; border-top-left-radius: 5em;border-top-right-radius: 5em;border-bottom-right-radius: 5em;border-bottom-left-radius:  25px;border: 5px solid #f60;' src='modules/ajis/lapsem_foto/foto_anak/" . $data['laporan']['foto'] . "'>
</div><br>
   <table width='567' align='center' cellpadding='20' cellspacing='0'   style='border:0px;margin: 0px 0px 0px -27px;' border='0'>
             <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;'>
                <td style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px; ' valign='center'>Nama Lengkap</td>
                <td align='center' style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>" . $data['laporan']['pm_nama_lengkap'] . "</td>
            </tr>
            <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                <td style='padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>Tempat, Tanggal Lahir</td>
                <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style='padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>" . $data['laporan']['pm_tempat_lahir'] . ", " . $data['laporan']['pm_tgl_lahir'] . "</td>
            </tr>
            <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                <td style='background-color:#eee;padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>Anak Ke</td>
                <td align='center' style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>:</td>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_anak_ke'] . " dari " . $data['laporan']['pm_saudara'] . " bersaudara</td>
            </tr>
	";
    } else {
        echo " <div style='width:694px;height:410px;margin: 0px auto;background-image:url(modules/ajis/lapsem/kotak_profil_ceria/" . $data['laporan']['kotak_profil_ceria'] . "); margin: 40px auto;border: 0px solid #f60;'>
    <div style='width:auto;height:auto;margin:10px 0px 0px 484px;'>
<img style='height:168px;  border-top-left-radius: 5em;border-top-right-radius: 5em;border-bottom-right-radius: 5em;border-bottom-left-radius:  5em;border: 5px solid #f60;' src='modules/ajis/lapsem_foto/foto_anak/" . $data['laporan']['foto'] . "'>
</div><br>

   <table width='587' align='center' cellpadding='20' cellspacing='0'   style='border:0px;margin: 0px auto;' border='0'>
             <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;'>
                <td style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px; ' valign='center'>Nama Lengkap</td>
                <td align='center' style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>" . $data['laporan']['pm_nama_lengkap'] . "</td>
            </tr>
            <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                <td style='padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>Tempat, Tanggal Lahir</td>
                <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style='padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>" . $data['laporan']['pm_tempat_lahir'] . ", " . $data['laporan']['pm_tgl_lahir'] . "</td>
            </tr>
            <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                <td style='background-color:#eee;padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>Anak Ke</td>
                <td align='center' style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>:</td>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_anak_ke'] . " dari " . $data['laporan']['pm_saudara'] . " bersaudara</td>
            </tr>
   ";
    }
    if ($data['laporan']['programid'] == 3) {
        echo "    <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                <td style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Nama Perguruan Tinggi</td>
                <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_mhs_institusi'] . "</td>
            </tr>
            <tr>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Program Studi / Semester</td>
                <td align='center' style='background-color:#eee;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_mhs_prodi'] . " / " . $data['laporan']['pm_mhs_semester'] . "</td>
            </tr>
            <tr>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Jurusan</td>
                <td align='center' style='background-color:#eee;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_mhs_jurusan'] . "</td>
            </tr>";
    } else if (($data['laporan']['programid'] == 1) || ($data['laporan']['programid'] == 5)) {
        echo "    <tr>
                <td style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Nama Sekolah - Alamat</td>
                <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td  width='264' style=' padding: 6px 7px 3px 7px; vertical-align: center; line-height: 110%;height: 25px;' valign='center'>" . $data['laporan']['pm_anak_nama_sekolah'] . ", " . $data['laporan']['pm_anak_alamat_sekolah'] . "</td>
            </tr>
            <tr>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Kelas - Jenjang Sekolah</td>
                 <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px; ' align='center' valign='center'>:</td>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_anak_kelas'] . ",  " . $data['laporan']['pm_anak_jenjang'] . "</td>
            </tr>
";
    }
    echo " <tr>
                <td style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Nama Orang Tua</td>
                <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_nama_orang_tua'] . "</td>
            </tr>
            <tr>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Pekerjaan Orang Tua</td>
                 <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' align='center' valign='center'>:</td>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_pekerjaan'] . "</td>
            </tr>

        </table>

        </div>";
    if ($data['laporan']['programid'] == 5) {
        echo "<div style='width:650px;height:500px;background-image:url(modules/ajis/lapsem/kotak_pembinaan_siswa/" . $data['laporan']['kotak_pembinaan_siswa'] . "); margin:0px 0px 0px 80px; border: 0px solid #f60;'>
	   <div style='text-align: justify;
    text-justify: inter-word;margin: 77px 80px 0px 40px; '>
       <p>" . $data['laporan']['pembinaan_perkembangan'] . "</p>
       </div>
	   </div>
	   </div>
       ";
    } else if ($data['laporan']['programid'] == 3) {
        echo "<div style='width:650px;height:500px;background-image:url(modules/ajis/lapsem/kotak_pembinaan_ceria/" . $data['laporan']['kotak_pembinaan_ceria'] . "); background-repeat: no-repeat;  margin-top:-47px; margin-left: 80px;border: 0px solid #f60;'>
<br><br><br><br><br><br><br>
        
            
            <table width='587'  cellpadding='20' cellspacing='0' style='margin-top: 7px; margin-left: 30px;'>
<tbody>
<tr style='padding: 6px 7px 3px 7px; vertical-align: center;'>
<td style='padding: 6px 7px 3px; width: 162px;' valign='center'>Wilayah Pembinaan</td>
<td align='center' style='padding: 6px 7px 3px; width: 10px;' valign='center'>:</td>
<td style='padding: 6px 7px 3px 1px; width: 413px;' valign='center'>" . $data['laporan']['pembinaan_wilayah'] . "</td>
</tr>
<tr style='padding: 6px 7px 3px 7px; vertical-align: center;'>
<td style='width: 162px; padding: 6px 7px 3px;' valign='center'>Alamat Pembinaan</td>
<td align='center' style='padding: 6px 7px 3px; width: 10px;' valign='center'>:</td>
<td style='width: 413px; padding: 6px 7px 3px; line-height: 110%;' valign='center'>" . $data['laporan']['pembinaan_alamat'] . "</td>
</tr>
</tbody>
</table>

";
        echo "<div style='margin-left:50px;margin-right:10px;'>
        <table style='width:588px; height:100px; border-collapse: collapse;margin: 0px 0px 0px -22px;' cellpadding='20' border='0'  class='tabel_donasi'>
        <tr >

            <th style='width:20%;  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; ' valign='center' >Tgl</th>
            <th style='width:80%;   border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; ' valign='center'>Materi</th>
        </tr>";
        for ($i = 0; $i < count($data_pembinaan['pembinaan']); $i++) {
            echo "<tr>
            <td style='width:20%;  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'  >" . $data_pembinaan['pembinaan'][$i]['tgl_pembinaan'] . "
</td>
            <td style='width:80%;   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'>" . $data_pembinaan['pembinaan'][$i]['judul_materi'] . "</td>
        </tr>";
        }
        echo "
		</table>
         </div>
		</div>
		</div>
        ";
    } else if ($data['laporan']['programid'] == 1) {
        echo "<div style='width:650px;height:500px;background-image:url(modules/ajis/lapsem/kotak_pembinaan_ceria/" . $data['laporan']['kotak_pembinaan_ceria'] . ");  margin-top:-47px; margin-left: 80px;border: 0px solid #f60;'>
<br><br><br><br><br><br>
        
<table width='587'  cellpadding='20' cellspacing='0' style='margin-top: 9px; margin-left: 30px;'>
<tbody>
<tr style='padding: 6px 7px 3px 7px; vertical-align: center;'>
<td style='padding: 6px 7px 3px; width: 162px;' valign='center'>Wilayah Pembinaan</td>
<td align='center' style='padding: 6px 7px 3px; width: 10px;' valign='center'>:</td>
<td style='padding: 6px 7px 3px 1px; width: 413px;' valign='center'>" . $data['laporan']['pembinaan_wilayah'] . "</td>
</tr>
<tr style='padding: 6px 7px 3px 7px; vertical-align: center;'>
<td style='width: 162px; padding: 6px 7px 3px;' valign='center'>Alamat Pembinaan</td>
<td align='center' style='padding: 6px 7px 3px; width: 10px;' valign='center'>:</td>
<td style='width: 413px; padding: 6px 7px 3px; line-height: 110%;' valign='center'>" . $data['laporan']['pembinaan_alamat'] . "</td>
</tr>
</tbody>
</table>
        ";
        echo "<div style='margin-left:50px;margin-right:10px;'>
        <table style='width:588px; height:100px; border-collapse: collapse;margin: 0px 0px 0px -22px;' cellpadding='20' border='0'  class='tabel_donasi'>
        <tr >

            <th style='width:20%;  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; ' valign='center' >Tgl</th>
            <th style='width:80%;   border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; ' valign='center'>Materi</th>
        </tr>";
        for ($i = 0; $i < count($data_pembinaan['pembinaan']); $i++) {
            echo "<tr>
            <td style='width:20%;  border-collapse: collapse;padding: 8px 7px 8px 7px; vertical-align: center; line-height: 90%;' valign='center'  >" . $data_pembinaan['pembinaan'][$i]['tgl_pembinaan'] . "
</td>
            <td style='width:80%;   border-collapse: collapse;padding: 8px 7px 8px 7px; vertical-align: center; line-height: 90%;' valign='center'>" . $data_pembinaan['pembinaan'][$i]['judul_materi'] . "</td>
        </tr>";
        }
        echo "
		</table>
        </div>
		</div>
		</div>
        ";
    }


    echo "
<br />
<div style='width:793px;height:1130px;background-image:url(modules/ajis/lapsem/keuangan/" . $data['laporan']['keuangan'] . ");  margin: 0px auto;'>
<br>
<div style='margin-left:116px;width:900px;margin-top:105px;'>
<table cellspacing='0' cellpadding='12' style='border:0px;line-height:110%;'>
<tr><td colspan='4' style='text-align:center;background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;line-height:120%;'>

    <strong>LAPORAN SUMBER & PENGGUNAAN DANA<br />
    " . $data['laporan']['nama_program'] . "<br />
    Bapak/Ibu  : " . $data['laporan']['donatur_nama'] . "<br />
    Periode " . $data['laporan']['semester'] . "<br />
    (Rupiah)
    </strong>
    </td></tr>
    <tr>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td style='width:20px;background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>I.</strong></td>
        <td style='width:350px;background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Penerimaan </strong></td>
        <td style='width:30px;background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
    </tr>
    <tr>
        <td></td>
        <td style='font-size: 14px;padding-top:5px;padding-bottom:5px;'>Saldo Beasiswa</td>
        <td style='font-size: 14px;font-size: 14px;padding-top:5px;padding-bottom:5px;'>Rp.</td>
        <td style='text-align:right;font-size: 14px;padding-top:5px;padding-bottom:5px;'>" . $data['laporan']['dana_saldo_awal'] . "</td>
    </tr>
    <tr>
        <td></td>
        <td style='font-size: 14px;padding-top:5px;padding-bottom:5px;'>Penerimaan Beasiswa</td>
        <td style='font-size: 14px;padding-top:5px;padding-bottom:5px;'>Rp.</td>
        <td style='text-align:right;font-size: 14px;padding-top:5px;padding-bottom:5px;'>" . $data['laporan']['dana_penerimaan'] . "</td>
    </tr>
    <tr>
        <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
        <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Total Penerimaan</strong></td>
        <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Rp.</strong></td>
        <td style='text-align:right;background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>" . $data['laporan']['jml_penerimaan'] . "</strong></td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>II.</strong></td>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Penyaluran </strong></td>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
    </tr>
    <tr>
        <td></td>
        <td style='font-size: 14px;padding-top:5px;padding-bottom:5px;'>Penyaluran Beasiswa</td>
        <td style='font-size: 14px;padding-top:5px;padding-bottom:5px;'>Rp. </td>
        <td style='text-align:right;font-size: 14px;padding-top:5px;padding-bottom:5px;'>" . $data['laporan']['dana_penyaluran'] . "</td>
    </tr>
    <tr>
        <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
        <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Total Penyaluran</strong></td>
        <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Rp. </strong></td>
        <td style='text-align:right;background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>" . $data['laporan']['dana_penyaluran'] . "</strong></td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>III.</strong></td>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Saldo Akhir (I-II) </strong></td>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Rp.</strong></td>
        <td style='text-align:right;background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>" . $data['laporan']['saldo_akhir'] . "</strong></td>
    </tr>
</table>
</div>
<br />";

    echo "
<div style='width:auto;height:auto;margin:110px 0px 0px 120px;'>
<img style='width:550px;height:368px;' src='modules/ajis/lapsem_foto/foto_pembinaan/" . $data['laporan']['foto_pembinaan'] . "'>
</div>
</div>
";

    /*echo "
<div style='width:793px;height:1119px;background-image:url(modules/ajis/lapsem/surat/".$data['laporan']['surat'].");  margin: 5px auto;'>
    <br><br><br>
     <div style='width:auto;height:auto;margin: 110px auto;' align='center'>
      <img style='width:590px;height:884px;' src='modules/ajis/lapsem_foto/surat_suara_hati/".$data['laporan']['surat_suara_hati']."'>
			<br>
			<br>

			"; */
    /*if(count($data_prestasi['prestasi']) > 0){
			echo "<div style='margin-left:120px;'>
        <table style='width:588px; height:100px; border-collapse: collapse;margin: 0px 0px 0px -22px;' cellpadding='20' border='0'  class='tabel_donasi'>
        <tr >

            <th style='width:40%;  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; ' valign='center' >Prestasi</th>
            <th style='width:30%;   border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; ' valign='center'>Event</th>
						<th style='width:30%;   border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; ' valign='center'>Skala</th>
        </tr>";
        for ($i=0;$i<count($data_prestasi['prestasi']);$i++){
        echo "<tr>
            <td style='width:40%;  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center; ' valign='center'  >".$data_prestasi['prestasi'][$i]['prestasi']."
</td>
            <td style='width:30%;   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center; ' valign='center'>".$data_prestasi['prestasi'][$i]['event']."</td>
						<td style='width:30%;   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center; ' valign='center'>".$data_prestasi['prestasi'][$i]['skala']."</td>
        </tr>";
		}
		echo"
		</table>
         </div>
				 ";
			 }*/
    /*				 echo "
    </div>
</div>  ";

*/


    if ($data['laporan']['programid'] == 5) {
        echo "<div style='width:793px;height:1115px;background-image:url(modules/ajis/lapsem_foto/raport_sekolah_satu/" . $data['laporan']['raport_satu'] . "); background-repeat: no-repeat; background-image-resize: 6;margin: 0px auto;'>
    </div> ";
        echo "<div style='width:793px;height:1105px;background-image:url(modules/ajis/lapsem_foto/raport_sekolah_dua/" . $data['laporan']['raport_dua'] . "); background-repeat: no-repeat; background-image-resize: 6; margin: 0px auto;'>
      </div>
<div style='width:791px;height:1119px;background-image:url(modules/ajis/lapsem/bawah_siswa/" . $data['laporan']['bawah_siswa'] . "); background-repeat: no-repeat;background-image-resize: 6;margin: 0px auto;'>";
    } else {
        echo "<div style='width:793px;height:1115px;background-image:url(modules/ajis/lapsem_foto/raport_ceria/" . $data['laporan']['raport_ceria'] . "); background-repeat: no-repeat; background-image-resize: 6;margin: 0px auto;'>
    </div> ";

        echo "<div style='width:791px;height:1119px;background-image:url(modules/ajis/lapsem/bawah/" . $data['laporan']['bawah'] . "); background-repeat: no-repeat; background-image-resize: 6; margin: 0px auto;'>";
    }
    echo "
</div>";
} else if (($data['laporan']['semesterid'] == 16) || ($data['laporan']['semesterid'] == 17) || ($data['laporan']['semesterid'] == 18) || ($data['laporan']['semesterid'] == 19)) {

    echo "
<div class='clear'></div>

	<div style='width:793px;height:1119px;background-image:url(modules/ajis/lapsem/profil/" . $data['laporan']['profil'] . ") ;  margin: 5px auto;'>
    <br>";
    if ($data['laporan']['programid'] == 5) {
        echo "<div style='width:699px;height:415px;margin: 0px auto;background-image:url(modules/ajis/lapsem/kotak_profil_siswa/" . $data['laporan']['kotak_profil_siswa'] . "); margin: 40px auto;border: 0px solid #f60;'>
   <div style='width:auto;height:auto;margin:10px 0px 0px 484px;'>
<img style='height:168px; border-top-left-radius: 5em;border-top-right-radius: 5em;border-bottom-right-radius: 5em;border-bottom-left-radius:  25px;border: 5px solid #f60;' src='modules/ajis/lapsem_foto/foto_anak/" . $data['laporan']['foto'] . "'>
</div><br>
   <table width='567' align='center' cellpadding='20' cellspacing='0'   style='border:0px;margin: 0px 0px 0px -27px;' border='0'>
             <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;'>
                <td style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px; ' valign='center'>Nama Lengkap</td>
                <td align='center' style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>" . $data['laporan']['pm_nama_lengkap'] . "</td>
            </tr>
            <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                <td style='padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>Tempat, Tanggal Lahir</td>
                <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style='padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>" . $data['laporan']['pm_tempat_lahir'] . ", " . $data['laporan']['pm_tgl_lahir'] . "</td>
            </tr>
            <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                <td style='background-color:#eee;padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>Anak Ke</td>
                <td align='center' style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>:</td>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_anak_ke'] . " dari " . $data['laporan']['pm_saudara'] . " bersaudara</td>
            </tr>
	";
    } else {
        echo " <div style='width:694px;height:410px;margin: 0px auto;background-image:url(modules/ajis/lapsem/kotak_profil_ceria/" . $data['laporan']['kotak_profil_ceria'] . "); margin: 40px auto;border: 0px solid #f60;'>
    <div style='width:auto;height:auto;margin:10px 0px 0px 484px;'>
<img style='height:168px;  border-top-left-radius: 5em;border-top-right-radius: 5em;border-bottom-right-radius: 5em;border-bottom-left-radius:  5em;border: 5px solid #f60;' src='modules/ajis/lapsem_foto/foto_anak/" . $data['laporan']['foto'] . "'>
</div><br>

   <table width='587' align='center' cellpadding='20' cellspacing='0'   style='border:0px;margin: 0px auto;' border='0'>
             <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;'>
                <td style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px; ' valign='center'>Nama Lengkap</td>
                <td align='center' style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>" . $data['laporan']['pm_nama_lengkap'] . "</td>
            </tr>
            <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                <td style='padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>Tempat, Tanggal Lahir</td>
                <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style='padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>" . $data['laporan']['pm_tempat_lahir'] . ", " . $data['laporan']['pm_tgl_lahir'] . "</td>
            </tr>
            <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                <td style='background-color:#eee;padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>Anak Ke</td>
                <td align='center' style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>:</td>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_anak_ke'] . " dari " . $data['laporan']['pm_saudara'] . " bersaudara</td>
            </tr>
   ";
    }
    if ($data['laporan']['programid'] == 3) {
        echo "    <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                <td style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Nama Perguruan Tinggi</td>
                <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_mhs_institusi'] . "</td>
            </tr>
            <tr>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Program Studi / Semester</td>
                <td align='center' style='background-color:#eee;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_mhs_prodi'] . " / " . $data['laporan']['pm_mhs_semester'] . "</td>
            </tr>
            <tr>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Jurusan</td>
                <td align='center' style='background-color:#eee;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_mhs_jurusan'] . "</td>
            </tr>";
    } else if (($data['laporan']['programid'] == 1) || ($data['laporan']['programid'] == 5)) {
        echo "    <tr>
                <td style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Nama Sekolah - Alamat</td>
                <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td  width='264' style=' padding: 6px 7px 3px 7px; vertical-align: center; line-height: 110%;height: 25px;' valign='center'>" . $data['laporan']['pm_anak_nama_sekolah'] . ", " . $data['laporan']['pm_anak_alamat_sekolah'] . "</td>
            </tr>
            <tr>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Kelas - Jenjang Sekolah</td>
                 <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px; ' align='center' valign='center'>:</td>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_anak_kelas'] . ",  " . $data['laporan']['pm_anak_jenjang'] . "</td>
            </tr>
";
    }
    echo " <tr>
                <td style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Nama Orang Tua</td>
                <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                <td style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_nama_orang_tua'] . "</td>
            </tr>
            <tr>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Pekerjaan Orang Tua</td>
                 <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' align='center' valign='center'>:</td>
                <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_pekerjaan'] . "</td>
            </tr>

        </table>

        </div>";

    echo "
<div style='width:650px;height:500px;background-image:url(modules/ajis/lapsem/kotak_pembinaan_ceria/" . $data['laporan']['kotak_pembinaan_ceria'] . "); background-repeat: no-repeat;  margin-top:-47px; margin-left: 80px;border: 0px solid #f60;'>
<div style='margin-left:40px;width:900px;margin-top:70px;'>
<table cellspacing='0' cellpadding='12' style='border:0px;line-height:110%;'>
<tr><td colspan='4' style='text-align:center;background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;line-height:120%;'>

    <strong>LAPORAN SUMBER & PENGGUNAAN DANA<br />
    " . $data['laporan']['nama_program'] . "<br />
    Bapak/Ibu  : " . $data['laporan']['donatur_nama'] . "<br />
    Periode " . $data['laporan']['semester'] . "<br />
    (Rupiah)
    </strong>
    </td></tr>
    <tr>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td style='width:20px;background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>I.</strong></td>
        <td style='width:350px;background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Penerimaan </strong></td>
        <td style='width:30px;background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
    </tr>
    <tr>
        <td></td>
        <td style='font-size: 14px;padding-top:5px;padding-bottom:5px;'>Saldo Beasiswa</td>
        <td style='font-size: 14px;font-size: 14px;padding-top:5px;padding-bottom:5px;'>Rp.</td>
        <td style='text-align:right;font-size: 14px;padding-top:5px;padding-bottom:5px;'>" . $data['laporan']['dana_saldo_awal'] . "</td>
    </tr>
    <tr>
        <td></td>
        <td style='font-size: 14px;padding-top:5px;padding-bottom:5px;'>Penerimaan Beasiswa</td>
        <td style='font-size: 14px;padding-top:5px;padding-bottom:5px;'>Rp.</td>
        <td style='text-align:right;font-size: 14px;padding-top:5px;padding-bottom:5px;'>" . $data['laporan']['dana_penerimaan'] . "</td>
    </tr>
    <tr>
        <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
        <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Total Penerimaan</strong></td>
        <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Rp.</strong></td>
        <td style='text-align:right;background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>" . $data['laporan']['jml_penerimaan'] . "</strong></td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>II.</strong></td>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Penyaluran </strong></td>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
    </tr>
    <tr>
        <td></td>
        <td style='font-size: 14px;padding-top:5px;padding-bottom:5px;'>Penyaluran Beasiswa</td>
        <td style='font-size: 14px;padding-top:5px;padding-bottom:5px;'>Rp. </td>
        <td style='text-align:right;font-size: 14px;padding-top:5px;padding-bottom:5px;'>" . $data['laporan']['dana_penyaluran'] . "</td>
    </tr>
    <tr>
        <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
        <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Total Penyaluran</strong></td>
        <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Rp. </strong></td>
        <td style='text-align:right;background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>" . $data['laporan']['dana_penyaluran'] . "</strong></td>
    </tr>
    <tr>
        <td>&nbsp;</td>
        <td></td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>III.</strong></td>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Saldo Akhir (I-II) </strong></td>
        <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Rp.</strong></td>
        <td style='text-align:right;background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>" . $data['laporan']['saldo_akhir'] . "</strong></td>
    </tr>
</table>
</div>
</div>
<br />";


    echo "</div>";
    /*----begin raport digital ----*/
    if ($data['laporan']['semesterid'] == 16) {

        if (($data['laporan']['programid'] == 1) || ($data['laporan']['programid'] == 3)) {

            echo "<div style='width:793px;height:1115px;background-image:url(modules/ajis/lapsem_foto/raport_ceria/" . $data['laporan']['raport_ceria'] . "); background-repeat: no-repeat; background-image-resize: 6;margin: 0px auto;'>
    </div> ";
        } else if ($data['laporan']['programid'] == 5) {
            echo "<div style='width:793px;height:1115px;background-image:url(modules/ajis/lapsem_foto/raport_sekolah_satu/" . $data['laporan']['raport_satu'] . "); background-repeat: no-repeat; background-image-resize: 6;margin: 0px auto;'>
    </div> ";
        }
    } else if (($data['laporan']['semesterid'] == 17) || ($data['laporan']['semesterid'] == 18) || ($data['laporan']['semesterid'] == 19)) {
        if (($data['laporan']['programid'] == 1) || ($data['laporan']['programid'] == 3)) {
            echo "<div style='width:791px;height:1119px;background-image:url(modules/ajis/lapsem/bawah/" . $data['laporan']['bawah'] . "); background-repeat: no-repeat; background-image-resize: 6; margin: 0px auto;'>";
            echo " <br>";

            echo "<div style='margin:120px 0px 0px 120px;'>
    <h1>LAPORAN PEMBINAAN ANAK JUARA</h1><br><br><br>
    Periode " . $data['laporan']['semester'] . "<br><br><br>
    <center>“Goals Pembinaan Anak Juara: mencetak generasi cerdas, mandiri, & kompetitif” </center></div>";
        } else if ($data['laporan']['programid'] == 5) {

            echo "<div style='width:791px;height:1119px;background-image:url(modules/ajis/lapsem/bawah_siswa/" . $data['laporan']['bawah_siswa'] . "); background-repeat: no-repeat;background-image-resize: 6;margin: 0px auto;'>";
            echo " <br>";

            echo "<div style='margin:120px 0px 0px 120px;'>
    <h1>LAPORAN PEMBINAAN SISWA JUARA</h1><br><br><br>
    Periode " . $data['laporan']['semester'] . "<br><br><br>
    <center>“Goals Pembinaan Siswa Juara: mencetak generasi cerdas, mandiri, & kompetitif” </center></div>";
        }

        if (($data['laporan']['programid'] == 1) || ($data['laporan']['programid'] == 3)) {

            echo "<div style='margin-left:118px;margin-top:40px;'>
        <table style='width:590px;  border-collapse: collapse;margin: 0px 0px 0px -22px;' cellpadding='20' border='0'  class='tabel_donasi'>
        <tr >

            <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' >No</th>
            <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' >Aspek Cerdas</th>
            <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Target</th>
            <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Kondisi Awal</th>
            <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Perkembangan</th>
            <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Nilai</th>
        </tr>";
            for ($i = 0; $i < count($data_raport['raport']); $i++) {
                echo "<tr>
        <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >" . $data_raport['raport'][$i]['no'] . "</td>
        <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'  >" . $data_raport['raport'][$i]['aspek'] . "</td>
        <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'>" . $data_raport['raport'][$i]['target'] . "</td>
        <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'>" . $data_raport['raport'][$i]['kondisi_awal'] . "</td>
        <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'>" . $data_raport['raport'][$i]['perkembangan_capaian'] . "</td>
        <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'>" . $data_raport['raport'][$i]['hasil_akhir'] . "</td>
        </tr>";
            }
            echo "
		</table>
         </div>
         <br><br><br>";


            echo "<div style='margin-left:118px;margin-right:10px;'>
        <table style='width:590px;  border-collapse: collapse;margin: 0px 0px 0px -22px;' cellpadding='20' border='0'  class='tabel_donasi'>
        <tr >

            <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' >No</th>
            <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Aspek Mandiri</th>
            <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Target</th>
            <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Capaian</th>
            <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Skor</th>
            
        </tr>";
            for ($i = 0; $i < count($data_raport_mandiri['raport_mandiri']); $i++) {
                echo "<tr>
        <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >" . $data_raport_mandiri['raport_mandiri'][$i]['no'] . "</td>
        <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'  >" . $data_raport_mandiri['raport_mandiri'][$i]['aspek'] . "</td>
        <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center' >" . $data_raport_mandiri['raport_mandiri'][$i]['target'] . "</td>
        <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'>" . $data_raport_mandiri['raport_mandiri'][$i]['nilai_capaian'] . "</td>
        <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'>" . $data_raport_mandiri['raport_mandiri'][$i]['kategori_skor'] . "</td>
       
        </tr>";
            }
        /*    echo "
        <tr>
        <td colspan='4' style='  background-color:#ff884d;font-weight:bold;border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >
        Total Skor (Mandiri)
        </td>
        <td style='  background-color:#ff884d;font-weight:bold;border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >";
            echo $data_skor_mandiri;
            echo "
        </tr>*/
       echo " <tr>
        <td colspan='4' style='  background-color:#ff884d;font-weight:bold;border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >
        Rata-rata Skor (Mandiri)
        </td>
        <td style='  background-color:#ff884d;font-weight:bold;border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >";
            $pembagi = count($data_raport_mandiri['raport_mandiri']);
            $total = $data_skor_mandiri / $pembagi;
            //echo $total;
            
            // Menentukan kategori berdasarkan skor
            $kategori_skor = '';
            if ($total >= 90) {
                $kategori_skor = 'Excellent';
            } elseif ($total >= 70 && $total < 90) {
                $kategori_skor = 'Good';
            } else {
                $kategori_skor = 'Average';
            }
            echo " (" . $kategori_skor . ")";
            echo "
        </td></tr>
		</table>
         </div> <br><br><br>";


            if (count($data_raport_prestasi['raport_prestasi']) > 0) {

                echo "<div style='margin-left:118px;margin-right:10px;'>
            <table style='width:590px;  border-collapse: collapse;margin: 0px 0px 0px -22px;' cellpadding='20' border='0'  class='tabel_donasi'>
            <tr >
    
                <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' >No</th>
                <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Prestasi</th>
                
            </tr>";
                for ($i = 0; $i < count($data_raport_prestasi['raport_prestasi']); $i++) {
                    echo "<tr>
            <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >" . $data_raport_prestasi['raport_prestasi'][$i]['no'] . "</td>
            <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'  >" . $data_raport_prestasi['raport_prestasi'][$i]['prestasi'] . "</td>
             
            </tr>";
                }
                echo "
            </table>
             </div> <br><br><br>";
            }
        } else if ($data['laporan']['programid'] == 5) {

            echo "<div style='margin-left:118px;margin-top:40px;'>
        <table style='width:590px;  border-collapse: collapse;margin: 0px 0px 0px -22px;' cellpadding='20' border='0'  class='tabel_donasi'>
        <tr >
        
            <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' align='center' >No</th>
            <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' align='center' >Mata Pelajaran</th>
            <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' align='center'>KKM</th>
            <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' align='center'>Nilai</th>
            <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' align='center'>Rata-rata kelas</th>
        </tr>";
            for ($i = 0; $i < count($data_raport['raport']); $i++) {
                echo "<tr>
        <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >" . $data_raport['raport'][$i]['no'] . "</td>
        <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'  align='left'>" . $data_raport['raport'][$i]['aspek'] . "</td>
        <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'>" . $data_raport['raport'][$i]['target'] . "</td>
        <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'>" . $data_raport['raport'][$i]['nilai_capaian'] . "</td>
        <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'>" . $data_raport['raport'][$i]['skor'] . "</td>
        </tr>";
            }
            echo "
        </table>
         </div>
         <br><br><br>";

            echo "<div style='margin-left:118px;margin-right:10px;'>
         <table style='width:590px;  border-collapse: collapse;margin: 0px 0px 0px -22px;' cellpadding='20' border='0'  class='tabel_donasi'>
         <tr >
 
             <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' >No</th>
             <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Aspek Mandiri</th>
             <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Nilai</th>
             
         </tr>";
            for ($i = 0; $i < count($data_raport_mandiri['raport_mandiri']); $i++) {
                echo "<tr>
         <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >" . $data_raport_mandiri['raport_mandiri'][$i]['no'] . "</td>
         <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'  >" . $data_raport_mandiri['raport_mandiri'][$i]['aspek'] . "</td>
         <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center' >" . $data_raport_mandiri['raport_mandiri'][$i]['nilai_capaian'] . "</td>
         
        
         </tr>";
            }
            echo "
         </table>
          </div> <br><br><br>";


            echo "<div style='margin-left:118px;margin-right:10px;'>
          <table style='width:590px;  border-collapse: collapse;margin: 0px 0px 0px -22px;' cellpadding='20' border='0'  class='tabel_donasi'>
          <tr >
  
              <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' >No</th>
              <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Aspek Kompetitif</th>
              <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Nilai</th>
              
          </tr>";
            for ($i = 0; $i < count($data_raport_kompetitif['raport_kompetitif']); $i++) {
                echo "<tr>
          <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >" . $data_raport_kompetitif['raport_kompetitif'][$i]['no'] . "</td>
          <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'  >" . $data_raport_kompetitif['raport_kompetitif'][$i]['aspek'] . "</td>
          <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center' >" . $data_raport_kompetitif['raport_kompetitif'][$i]['perkembangan_capaian'] . "</td>
          
         
          </tr>";
            }
            echo "
          </table>
           </div> <br><br><br>";
        }

        /*echo "<div style='margin:-25px 0px 0px 110px;line-height:20px;' width='580px'><h1>Kesimpulan:</h1>
        Dengan memperhatikan hasil-hasil perkembangan penerima manfaat program di atas selama 1 (satu) semester, maka anak juara ini dinyatakan <b>Lanjutkan</b></div>";*/

        echo "<div style='margin:10px 100px 0px 0px;text-align:right;line-height:20px;'>" . $data['laporan']['kota'] . ", " . $data['laporan']['tgl_hari_ini'] . "</div>";
        if (($data['laporan']['programid'] == 1) || ($data['laporan']['programid'] == 3)) {
            echo "<div style='margin:10px 100px 0px 0px;text-align:right;line-height:20px;'>Scholarship Management Cabang " . $data['laporan']['kota'] . "<br></div>";
            echo "<div style='margin:10px 100px 0px 0px;text-align:right;line-height:20px;'>" . $data['laporan']['nama_spm'] . "</div>";
        } else if ($data['laporan']['programid'] == 5) {
            echo "<div style='margin:10px 100px 0px 0px;text-align:right;line-height:20px;'><b>" . $data['laporan']['nama_spm'] . "</b></div>";
            echo "<div style='margin:10px 100px 0px 0px;text-align:right;line-height:20px;'>Kepala Sekolah</div>";
        }



        echo "</div>";

        /*----end raport digital ----*/
    }

    echo "<div style='width:791px;height:1119px;background-image:url(upload/dokumentasi_pembinaan/" . $data['laporan']['gambar_dokumentasi'] . "); background-repeat: no-repeat; background-image-resize: 6; margin: 0px auto;'></div>";
} else if ($data['laporan']['semesterid'] >= 20) {

    echo "
 <div class='clear'></div>
 
     <div style='width:793px;height:1119px;background-image:url(modules/ajis/lapsem/profil/" . $data['laporan']['profil'] . ") ;  margin: 5px auto;'>
     <br>";
    if ($data['laporan']['programid'] == 5) {
        echo "<div style='width:699px;height:415px;margin: 0px auto;background-image:url(modules/ajis/lapsem/kotak_profil_siswa/" . $data['laporan']['kotak_profil_siswa'] . "); margin: 40px auto;border: 0px solid #f60;'>
    <div style='width:auto;height:auto;margin:10px 0px 0px 484px;'>
 <img style='height:168px; border-top-left-radius: 5em;border-top-right-radius: 5em;border-bottom-right-radius: 5em;border-bottom-left-radius:  25px;border: 5px solid #f60;' src='modules/ajis/lapsem_foto/foto_anak/" . $data['laporan']['foto'] . "'>
 </div><br>
    <table width='567' align='center' cellpadding='20' cellspacing='0'   style='border:0px;margin: 0px 0px 0px -27px;' border='0'>
              <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;'>
                 <td style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px; ' valign='center'>Nama Lengkap</td>
                 <td align='center' style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                 <td style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>" . $data['laporan']['pm_nama_lengkap'] . "</td>
             </tr>
             <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                 <td style='padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>Tempat, Tanggal Lahir</td>
                 <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                 <td style='padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>" . $data['laporan']['pm_tempat_lahir'] . ", " . $data['laporan']['pm_tgl_lahir'] . "</td>
             </tr>
             <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                 <td style='background-color:#eee;padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>Anak Ke</td>
                 <td align='center' style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>:</td>
                 <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_anak_ke'] . " dari " . $data['laporan']['pm_saudara'] . " bersaudara</td>
             </tr>
     ";
    } else {
        echo " <div style='width:694px;height:410px;margin: 0px auto;background-image:url(modules/ajis/lapsem/kotak_profil_ceria/" . $data['laporan']['kotak_profil_ceria'] . "); margin: 40px auto;border: 0px solid #f60;'>
     <div style='width:auto;height:auto;margin:10px 0px 0px 484px;'>
 <img style='height:168px;  border-top-left-radius: 5em;border-top-right-radius: 5em;border-bottom-right-radius: 5em;border-bottom-left-radius:  5em;border: 5px solid #f60;' src='modules/ajis/lapsem_foto/foto_anak/" . $data['laporan']['foto'] . "'>
 </div><br>
 
    <table width='587' align='center' cellpadding='20' cellspacing='0'   style='border:0px;margin: 0px auto;' border='0'>
              <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;'>
                 <td style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px; ' valign='center'>Nama Lengkap</td>
                 <td align='center' style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                 <td style='color:#ffffff;background-color:#f60;padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>" . $data['laporan']['pm_nama_lengkap'] . "</td>
             </tr>
             <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                 <td style='padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>Tempat, Tanggal Lahir</td>
                 <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                 <td style='padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>" . $data['laporan']['pm_tempat_lahir'] . ", " . $data['laporan']['pm_tgl_lahir'] . "</td>
             </tr>
             <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                 <td style='background-color:#eee;padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>Anak Ke</td>
                 <td align='center' style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' valign='center'>:</td>
                 <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_anak_ke'] . " dari " . $data['laporan']['pm_saudara'] . " bersaudara</td>
             </tr>
    ";
    }
    if ($data['laporan']['programid'] == 3) {
        echo "    <tr style=' padding: 6px 7px 3px 7px; vertical-align: center;'>
                 <td style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Nama Perguruan Tinggi</td>
                 <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                 <td style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_mhs_institusi'] . "</td>
             </tr>
             <tr>
                 <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Program Studi / Semester</td>
                 <td align='center' style='background-color:#eee;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                 <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_mhs_prodi'] . " / " . $data['laporan']['pm_mhs_semester'] . "</td>
             </tr>
             <tr>
                 <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Jurusan</td>
                 <td align='center' style='background-color:#eee;padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                 <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_mhs_jurusan'] . "</td>
             </tr>";
    } else if (($data['laporan']['programid'] == 1) || ($data['laporan']['programid'] == 5)) {
        echo "    <tr>
                 <td style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Nama Sekolah - Alamat</td>
                 <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                 <td  width='264' style=' padding: 6px 7px 3px 7px; vertical-align: center; line-height: 110%;height: 25px;' valign='center'>" . $data['laporan']['pm_anak_nama_sekolah'] . ", " . $data['laporan']['pm_anak_alamat_sekolah'] . "</td>
             </tr>
             <tr>
                 <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Kelas - Jenjang Sekolah</td>
                  <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px; ' align='center' valign='center'>:</td>
                 <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_anak_kelas'] . ",  " . $data['laporan']['pm_anak_jenjang'] . "</td>
             </tr>
 ";
    }
    echo " <tr>
                 <td style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Nama Orang Tua</td>
                 <td align='center' style='padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>:</td>
                 <td style=' padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_nama_orang_tua'] . "</td>
             </tr>
             <tr>
                 <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>Pekerjaan Orang Tua</td>
                  <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center; height: 25px;' align='center' valign='center'>:</td>
                 <td style='background-color:#eee; padding: 6px 7px 3px 7px; vertical-align: center;height: 25px;' valign='center'>" . $data['laporan']['pm_pekerjaan'] . "</td>
             </tr>
 
         </table>
 
         </div>";

    if (($data['laporan']['programid'] == 1) || ($data['laporan']['programid'] == 3)) {

        echo "
 <div style='width:650px;height:500px;background-image:url(modules/ajis/lapsem/kotak_pembinaan_ceria/" . $data['laporan']['kotak_pembinaan_ceria'] . "); background-repeat: no-repeat;  margin-top:-47px; margin-left: 80px;border: 0px solid #f60;'>
 <div style='margin-left:40px;width:900px;margin-top:70px;'><br>";
    } else if ($data['laporan']['programid'] == 5) {

        echo "
            <div style='width:650px;height:500px;background-image:url(modules/ajis/lapsem/kotak_pembinaan_siswa/" . $data['laporan']['kotak_pembinaan_siswa'] . "); background-repeat: no-repeat;  margin-top:-47px; margin-left: 80px;border: 0px solid #f60;'>
            <div style='margin-left:40px;width:900px;margin-top:70px;'><br>";
    }
    echo "<br><br><br><br><br><br><br><br>";
    echo "<div style='width:550px;line-height:1.5em;padding:10px;text-align: justify;'>";
    if ($data['laporan']['semesterid'] <= 20) {
        echo $suara_anak_juara;
    } elseif ($data['laporan']['semesterid'] >= 21) {
        echo $suara_anak_juara_v2;
    }
    echo "</div></div>
 </div>
 <br />";


    echo "</div>";
    /*----begin raport digital ----*/
    if ($data['laporan']['semesterid'] >= 20) {
        if (($data['laporan']['programid'] == 1) || ($data['laporan']['programid'] == 3)) {
            echo "<div style='width:791px;height:1119px;background-image:url(modules/ajis/lapsem/bawah/" . $data['laporan']['bawah'] . "); background-repeat: no-repeat; background-image-resize: 6; margin: 0px auto;'>";
            echo " <br>";

            echo "<div style='margin:130px 0px 0px 110px;'>
     <h1>LAPORAN PEMBINAAN ANAK JUARA</h1><br><br><br>
     Periode " . $data['laporan']['semester'] . "<br><br><br>
     <center>“Goals Pembinaan Anak Juara: mencetak generasi cerdas, mandiri, & kompetitif” </center></div>";
        } elseif ($data['laporan']['programid'] == 5) {

            echo "<div style='width:791px;height:1119px;background-image:url(modules/ajis/lapsem/bawah_siswa/" . $data['laporan']['bawah_siswa'] . "); background-repeat: no-repeat;background-image-resize: 6;margin: 0px auto;'>";
            echo " <br>";

            echo "<div style='margin:130px 0px 0px 110px;'>
     <h1>LAPORAN PEMBINAAN SISWA JUARA</h1><br><br><br>
     Periode " . $data['laporan']['semester'] . "<br><br><br>
     <center>“Goals Pembinaan Siswa Juara: mencetak generasi cerdas, mandiri, & kompetitif” </center></div>";
        }

        if (($data['laporan']['programid'] == 1) || ($data['laporan']['programid'] == 3)) {

            echo "<div style='margin-left:118px;margin-top:40px;'>
         <table style='width:590px;  border-collapse: collapse;margin: 0px 0px 0px -22px;' cellpadding='20' border='0'  class='tabel_donasi'>
         <tr >
 
             <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' >No</th>
             <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' >Aspek Cerdas</th>
             <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Target</th>
             <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Kondisi Awal</th>
             <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Perkembangan</th>
             <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Nilai</th>
         </tr>";
            for ($i = 0; $i < count($data_raport['raport']); $i++) {
                echo "<tr>
         <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >" . $data_raport['raport'][$i]['no'] . "</td>
         <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'  >" . $data_raport['raport'][$i]['aspek'] . "</td>
         <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'>" . $data_raport['raport'][$i]['target'] . "</td>
         <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'>" . $data_raport['raport'][$i]['kondisi_awal'] . "</td>
         <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'>" . $data_raport['raport'][$i]['perkembangan_capaian'] . "</td>
         <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'>" . $data_raport['raport'][$i]['hasil_akhir'] . "</td>
         </tr>";
            }
            echo "
         </table>
          </div>
          <br><br><br>";


            echo "<div style='margin-left:118px;margin-right:10px;'>
         <table style='width:590px;  border-collapse: collapse;margin: 0px 0px 0px -22px;' cellpadding='20' border='0'  class='tabel_donasi'>
         <tr >
 
             <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' >No</th>
             <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Aspek Mandiri</th>
             <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Target</th>
             <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Capaian</th>
             <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Skor</th>
             
         </tr>";
            for ($i = 0; $i < count($data_raport_mandiri['raport_mandiri']); $i++) {
                echo "<tr>
         <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >" . $data_raport_mandiri['raport_mandiri'][$i]['no'] . "</td>
         <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'  >" . $data_raport_mandiri['raport_mandiri'][$i]['aspek'] . "</td>
         <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center' >" . $data_raport_mandiri['raport_mandiri'][$i]['target'] . "</td>
         <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'>" . $data_raport_mandiri['raport_mandiri'][$i]['nilai_capaian'] . "</td>
         <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'>" . $data_raport_mandiri['raport_mandiri'][$i]['kategori_skor'] . "</td>
        
         </tr>";
            }
        /*    echo "
         <tr>
         <td colspan='4' style='  background-color:#ff884d;font-weight:bold;border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >
         Total Skor (Mandiri)
         </td>
         <td style='  background-color:#ff884d;font-weight:bold;border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >";
            echo $data_skor_mandiri;
            echo "
         </tr>*/
        echo " <tr>
         <td colspan='4' style='  background-color:#ff884d;font-weight:bold;border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >
         Rata-rata Skor (Mandiri)
         </td>
         <td style='  background-color:#ff884d;font-weight:bold;border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >";
            $pembagi = count($data_raport_mandiri['raport_mandiri']);
            $total = $data_skor_mandiri / $pembagi;
            //echo $total;
            
            // Menentukan kategori berdasarkan skor
            $kategori_skor = '';
            if ($total >= 90) {
                $kategori_skor = 'Excellent';
            } elseif ($total >= 70 && $total < 90) {
                $kategori_skor = 'Good';
            } else {
                $kategori_skor = 'Average';
            }
            echo " (" . $kategori_skor . ")";
            echo "
         </td></tr>
         </table>
          </div> <br><br><br>";


            if (count($data_raport_prestasi['raport_prestasi']) > 0) {

                echo "<div style='margin-left:118px;margin-right:10px;'>
             <table style='width:590px;  border-collapse: collapse;margin: 0px 0px 0px -22px;' cellpadding='20' border='0'  class='tabel_donasi'>
             <tr >
     
                 <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' >No</th>
                 <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Prestasi</th>
                 
             </tr>";
                for ($i = 0; $i < count($data_raport_prestasi['raport_prestasi']); $i++) {
                    echo "<tr>
             <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >" . $data_raport_prestasi['raport_prestasi'][$i]['no'] . "</td>
             <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'  >" . $data_raport_prestasi['raport_prestasi'][$i]['prestasi'] . "</td>
              
             </tr>";
                }
                echo "
             </table>
              </div> <br>";
            }
        } else if ($data['laporan']['programid'] == 5) {

            echo "<div style='margin-left:118px;margin-top:40px;'>
         <table style='width:590px;  border-collapse: collapse;margin: 0px 0px 0px -22px;' cellpadding='20' border='0'  class='tabel_donasi'>
         <tr >
         
             <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' align='center' >No</th>
             <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' align='center' >Mata Pelajaran</th>
             <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' align='center'>KKM</th>
             <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' align='center'>Nilai</th>
             <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' align='center'>Rata-rata kelas</th>
         </tr>";
            for ($i = 0; $i < count($data_raport['raport']); $i++) {
                echo "<tr>
         <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >" . $data_raport['raport'][$i]['no'] . "</td>
         <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'  align='left'>" . $data_raport['raport'][$i]['aspek'] . "</td>
         <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'>" . $data_raport['raport'][$i]['target'] . "</td>
         <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'>" . $data_raport['raport'][$i]['nilai_capaian'] . "</td>
         <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'>" . $data_raport['raport'][$i]['skor'] . "</td>
         </tr>";
            }
            echo "
         </table>
          </div>
          <br><br><br>";

            echo "<div style='margin-left:118px;margin-right:10px;'>
          <table style='width:590px;  border-collapse: collapse;margin: 0px 0px 0px -22px;' cellpadding='20' border='0'  class='tabel_donasi'>
          <tr >
  
              <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' >No</th>
              <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Aspek Mandiri</th>
              <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Nilai</th>
              
          </tr>";
            for ($i = 0; $i < count($data_raport_mandiri['raport_mandiri']); $i++) {
                echo "<tr>
          <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >" . $data_raport_mandiri['raport_mandiri'][$i]['no'] . "</td>
          <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'  >" . $data_raport_mandiri['raport_mandiri'][$i]['aspek'] . "</td>
          <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center' >" . $data_raport_mandiri['raport_mandiri'][$i]['nilai_capaian'] . "</td>
          
         
          </tr>";
            }
            echo "
          </table>
           </div> <br><br><br>";


            echo "<div style='margin-left:118px;margin-right:10px;'>
           <table style='width:590px;  border-collapse: collapse;margin: 0px 0px 0px -22px;' cellpadding='20' border='0'  class='tabel_donasi'>
           <tr >
   
               <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center' >No</th>
               <th style='  border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Aspek Kompetitif</th>
               <th style=' border-collapse: collapse; padding: 6px 7px 3px 7px; vertical-align: center; font-weight:bold;' valign='center'>Nilai</th>
               
           </tr>";
            for ($i = 0; $i < count($data_raport_kompetitif['raport_kompetitif']); $i++) {
                echo "<tr>
           <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center'  >" . $data_raport_kompetitif['raport_kompetitif'][$i]['no'] . "</td>
           <td style='  border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center'  >" . $data_raport_kompetitif['raport_kompetitif'][$i]['aspek'] . "</td>
           <td style='   border-collapse: collapse;padding: 9px 7px 9px 7px; vertical-align: center;line-height: 90%; ' valign='center' align='center' >" . $data_raport_kompetitif['raport_kompetitif'][$i]['perkembangan_capaian'] . "</td>
           
          
           </tr>";
            }
            echo "
           </table>
            </div> <br>";
        }

        echo "<div style='margin:15px 0px 0px 110px;color:#000;'><h1>Catatan Pembinaan</h1><br>";
        echo "<div style='width:550px;text-align: justify;line-height:1.5em;padding:10px;'>";
        echo $catatan_pembinaan;
        echo "</div></div><br>";

        /*echo "<div style='margin:-25px 0px 0px 110px;line-height:20px;' width='580px'><h1>Kesimpulan:</h1>
         Dengan memperhatikan hasil-hasil perkembangan penerima manfaat program di atas selama 1 (satu) semester, maka anak juara ini dinyatakan <b>Lanjutkan</b></div>";*/

        echo "<div style='margin:10px 100px 0px 0px;text-align:right;line-height:20px;'>" . $data['laporan']['kota'] . ", " . $data['laporan']['tgl_hari_ini'] . "</div>";
        if (($data['laporan']['programid'] == 1) || ($data['laporan']['programid'] == 3)) {
            echo "<div style='margin:10px 100px 0px 0px;text-align:right;line-height:20px;'>Scholarship Management Cabang " . $data['laporan']['kota'] . "<br></div>";
            echo "<div style='margin:10px 100px 0px 0px;text-align:right;line-height:20px;'>" . $data['laporan']['nama_spm'] . "</div>";
        } else if ($data['laporan']['programid'] == 5) {
            echo "<div style='margin:10px 100px 0px 0px;text-align:right;line-height:20px;'><b>" . $data['laporan']['nama_spm'] . "</b></div>";
            echo "<div style='margin:10px 100px 0px 0px;text-align:right;line-height:20px;'>Kepala Sekolah</div>";
        }
        echo "</div>";

        /*----end raport digital ----*/
    }

    echo "<div style='width:791px;height:1119px;background-image:url(upload/dokumentasi_pembinaan/" . $data['laporan']['gambar_dokumentasi_wilayah'] . "); background-repeat: no-repeat; background-image-resize: 6; margin: 0px auto;'></div>";


    echo "
 <div class='clear'></div>
 
     <div style='width:793px;height:1119px;background-image:url(modules/ajis/lapsem/kata_pengantar/" . $data['laporan']['kata_pengantar'] . ") ;  margin: 5px auto;'>
     <br>";

    echo "
 <div style='width:650px;height:500px;background-image:url(modules/ajis/lapsem/keuangan/" . $data['laporan']['keuangan'] . "); background-repeat: no-repeat;  margin-top:100px; margin-left: 80px;border: 0px solid #f60;'>
 <div style='margin-left:40px;width:900px;margin-top:80px;'>
 <table cellspacing='0' cellpadding='12' style='border:0px;line-height:110%;'>
 <tr><td colspan='4' style='text-align:center;background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;line-height:120%;'>
 
     <strong>LAPORAN SUMBER & PENGGUNAAN DANA<br />
     " . $data['laporan']['nama_program'] . "<br />
     Bapak/Ibu  : " . $data['laporan']['donatur_nama'] . "<br />
     Periode " . $data['laporan']['semester'] . "<br />
     (Rupiah)
     </strong>
     </td></tr>
     <tr>
         <td>&nbsp;</td>
         <td></td>
         <td></td>
         <td></td>
     </tr>
     <tr>
         <td style='width:20px;background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>I.</strong></td>
         <td style='width:350px;background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Penerimaan </strong></td>
         <td style='width:30px;background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
         <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
     </tr>
     <tr>
         <td></td>
         <td style='font-size: 14px;padding-top:5px;padding-bottom:5px;'>Saldo Beasiswa</td>
         <td style='font-size: 14px;font-size: 14px;padding-top:5px;padding-bottom:5px;'>Rp.</td>
         <td style='text-align:right;font-size: 14px;padding-top:5px;padding-bottom:5px;'>" . $data['laporan']['dana_saldo_awal'] . "</td>
     </tr>
     <tr>
         <td></td>
         <td style='font-size: 14px;padding-top:5px;padding-bottom:5px;'>Penerimaan Beasiswa</td>
         <td style='font-size: 14px;padding-top:5px;padding-bottom:5px;'>Rp.</td>
         <td style='text-align:right;font-size: 14px;padding-top:5px;padding-bottom:5px;'>" . $data['laporan']['dana_penerimaan'] . "</td>
     </tr>
     <tr>
         <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
         <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Total Penerimaan</strong></td>
         <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Rp.</strong></td>
         <td style='text-align:right;background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>" . $data['laporan']['jml_penerimaan'] . "</strong></td>
     </tr>
     <tr>
         <td>&nbsp;</td>
         <td></td>
         <td></td>
         <td></td>
     </tr>
     <tr>
         <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>II.</strong></td>
         <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Penyaluran </strong></td>
         <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
         <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
     </tr>
     <tr>
         <td></td>
         <td style='font-size: 14px;padding-top:5px;padding-bottom:5px;'>Penyaluran Beasiswa</td>
         <td style='font-size: 14px;padding-top:5px;padding-bottom:5px;'>Rp. </td>
         <td style='text-align:right;font-size: 14px;padding-top:5px;padding-bottom:5px;'>" . $data['laporan']['dana_penyaluran'] . "</td>
     </tr>
     <tr>
         <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'></td>
         <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Total Penyaluran</strong></td>
         <td style='background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Rp. </strong></td>
         <td style='text-align:right;background-color:#eee;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>" . $data['laporan']['dana_penyaluran'] . "</strong></td>
     </tr>
     <tr>
         <td>&nbsp;</td>
         <td></td>
         <td></td>
         <td></td>
     </tr>
     <tr>
         <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>III.</strong></td>
         <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Saldo Akhir (I-II) </strong></td>
         <td style='background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>Rp.</strong></td>
         <td style='text-align:right;background-color:#f60;color:#fff;font-size: 14px;padding-top:5px;padding-bottom:5px;'><strong>" . $data['laporan']['saldo_akhir'] . "</strong></td>
     </tr>
 </table>
 </div>
 </div>
 <br />";


    echo "</div>";
}
echo "
</body>
</html>";


$html = ob_get_contents();
ob_end_clean();

// Pastikan tidak ada output yang terkirim
while (ob_get_level()) {
    ob_end_clean();
}

// Set error handler untuk menangkap dan menekan warning
$old_error_handler = set_error_handler(function($errno, $errstr, $errfile, $errline) {
    // Hanya abaikan warning dari mPDF library
    if (strpos($errfile, 'mpdf') !== false && ($errno === E_WARNING || $errno === E_NOTICE)) {
        return true; // Menekan error
    }
    return false; // Biarkan error handler default menangani error lain
}, E_WARNING | E_NOTICE);

// Nonaktifkan display errors
$old_display_errors = ini_get('display_errors');
ini_set('display_errors', 0);

// Nonaktifkan error reporting untuk warning
$old_error_reporting = error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE);

try {
    // Mulai output buffering untuk menangkap semua output
    ob_start();
    
    $mpdf->WriteHTML($html);
    
    // Bersihkan semua output yang mungkin dihasilkan
    ob_end_clean();
    
    if(isset($_GET['approve']) && $_GET['approve'] == 'yes'){
        $filename = date('YmdHis') . ".pdf";
        try {
            ob_start();
            $mpdf->Output("lapsem/".$filename, "F");
            ob_end_clean();
            
            $updateLaporan = $o_CLaporanPembinaanBaru->updateManualLaporan($filename);
            
            // Kembalikan error reporting dan handler sebelum output JSON
            restore_error_handler();
            error_reporting($old_error_reporting);
            ini_set('display_errors', $old_display_errors);
            
            // Set header untuk JSON response
            header('Content-Type: application/json');
            echo json_encode($updateLaporan, true);
        } catch (MpdfException $e) {
            ob_end_clean();
            // Kembalikan error reporting
            restore_error_handler();
            error_reporting($old_error_reporting);
            ini_set('display_errors', $old_display_errors);
            // Set header untuk JSON error response
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['error' => 'Error creating PDF: ' . $e->getMessage()], true);
        }
    }else{
        // Kembalikan error reporting sebelum output PDF
        restore_error_handler();
        error_reporting($old_error_reporting);
        ini_set('display_errors', $old_display_errors);
        
        // Pastikan tidak ada output sebelum PDF
        $mpdf->Output();
    }
} catch (Exception $e) {
    // Bersihkan output buffer jika ada
    if (ob_get_level()) {
        ob_end_clean();
    }
    // Kembalikan error reporting jika terjadi error
    restore_error_handler();
    error_reporting($old_error_reporting);
    ini_set('display_errors', $old_display_errors);
    throw $e;
}

exit;
