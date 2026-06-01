import React, { useState, useMemo } from "react";
import {
  Users, CheckCircle, BookOpen, BarChart2, Star, Home, BookMarked,
  ClipboardList, TrendingUp, Award, UserCheck, AlertCircle, MinusCircle,
  ChevronRight, Plus, Search, Edit2, Trash2, Eye, ArrowLeft, Save,
  Bell, ChevronDown, Activity, Target, Calendar, MapPin, Clock,
  Heart, X, Filter, SlidersHorizontal, FileText, CheckSquare, RefreshCw
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const T={
  primary:"#BF4E02",primaryDk:"#8F3A01",primaryLt:"#D96A1A",
  primaryPale:"#FBF0E8",primarySoft:"#F0C4A0",
  white:"#FFFFFF",bg:"#FFFFFF",charcoal:"#1A0A00",brown:"#5C2E00",
  gray:"#7A6055",grayLt:"#F2EAE3",grayMd:"#D9CFC8",
  green:"#1A7A45",greenPale:"#E5F5ED",blue:"#1A5FA8",bluePale:"#E5EEF8",
  red:"#B02020",redPale:"#FDEAEA",gold:"#B87800",goldPale:"#FDF4DC",
  font:"'Source Sans Pro',sans-serif",
};

/* item hafalan */
const ITEM_HAFALAN=[
  {id:1,jenis:2,konten:"Al-Fatihah"},{id:2,jenis:2,konten:"Al-Baqarah"},{id:3,jenis:2,konten:"Ali Imran"},
  {id:4,jenis:2,konten:"An-Nisa"},{id:5,jenis:2,konten:"Al-Maidah"},{id:6,jenis:2,konten:"Al-Anam"},
  {id:7,jenis:2,konten:"Al-Araf"},{id:8,jenis:2,konten:"Al-Anfal"},{id:9,jenis:2,konten:"At-Taubah"},
  {id:10,jenis:2,konten:"Yunus"},{id:11,jenis:2,konten:"Hud"},{id:12,jenis:2,konten:"Yusuf"},
  {id:67,jenis:2,konten:"Al-Mulk"},{id:68,jenis:2,konten:"Al-Qalam"},{id:69,jenis:2,konten:"Al-Haqqah"},
  {id:70,jenis:2,konten:"Al-Maarij"},{id:71,jenis:2,konten:"Nuh"},{id:72,jenis:2,konten:"Al-Jinn"},
  {id:73,jenis:2,konten:"Al-Muzzammil"},{id:74,jenis:2,konten:"Al-Muddatstsir"},{id:75,jenis:2,konten:"Al-Qiyamah"},
  {id:76,jenis:2,konten:"Al-Insan"},{id:77,jenis:2,konten:"Al-Mursalat"},{id:78,jenis:2,konten:"An-Naba"},
  {id:79,jenis:2,konten:"An-Naziat"},{id:80,jenis:2,konten:"Abasa"},{id:81,jenis:2,konten:"At-Takwir"},
  {id:82,jenis:2,konten:"Al-Infitar"},{id:83,jenis:2,konten:"Al-Muthaffifin"},{id:84,jenis:2,konten:"Al-Insyiqaq"},
  {id:85,jenis:2,konten:"Al-Buruj"},{id:86,jenis:2,konten:"At-Tariq"},{id:87,jenis:2,konten:"Al-Ala"},
  {id:88,jenis:2,konten:"Al-Gasyiyah"},{id:89,jenis:2,konten:"Al-Fajr"},{id:90,jenis:2,konten:"Al-Balad"},
  {id:91,jenis:2,konten:"Asy-Syams"},{id:92,jenis:2,konten:"Al-Lail"},{id:93,jenis:2,konten:"Ad-Duha"},
  {id:94,jenis:2,konten:"Asy-Syarh"},{id:95,jenis:2,konten:"At-Tin"},{id:96,jenis:2,konten:"Al-Alaq"},
  {id:97,jenis:2,konten:"Al-Qadr"},{id:98,jenis:2,konten:"Al-Bayyinah"},{id:99,jenis:2,konten:"Az-Zalzalah"},
  {id:100,jenis:2,konten:"Al-Adiyat"},{id:101,jenis:2,konten:"Al-Qariah"},{id:102,jenis:2,konten:"At-Takasur"},
  {id:103,jenis:2,konten:"Al-Asr"},{id:104,jenis:2,konten:"Al-Humazah"},{id:105,jenis:2,konten:"Al-Fil"},
  {id:106,jenis:2,konten:"Quraisy"},{id:107,jenis:2,konten:"Al-Maun"},{id:108,jenis:2,konten:"Al-Kausar"},
  {id:109,jenis:2,konten:"Al-Kafirun"},{id:110,jenis:2,konten:"An-Nasr"},{id:111,jenis:2,konten:"Al-Lahab"},
  {id:112,jenis:2,konten:"Al-Ikhlas"},{id:113,jenis:2,konten:"Al-Falaq"},{id:114,jenis:2,konten:"An-Nas"},
  {id:115,jenis:3,konten:"Doa sebelum dan sesudah wudhu"},{id:116,jenis:3,konten:"Doa Iftitah"},
  {id:117,jenis:3,konten:"Bacaan Al-Fatihah"},{id:118,jenis:3,konten:"Bacaan ruku"},
  {id:119,jenis:3,konten:"Bacaan Itidal"},{id:120,jenis:3,konten:"Bacaan Sujud"},
  {id:121,jenis:3,konten:"Bacaan duduk diantara dua sujud"},{id:122,jenis:3,konten:"Bacaan Tashyahud dan Shalawat Nabi"},
  {id:123,jenis:3,konten:"Doa istiadzah dan salam"},{id:124,jenis:3,konten:"Dzikir sesudah shalat"},
  {id:125,jenis:4,konten:"Kebaikan Dunia Akhirat"},{id:126,jenis:4,konten:"Untuk Orang tua"},
  {id:127,jenis:4,konten:"Bangun Tidur"},{id:128,jenis:4,konten:"Akan Tidur"},
  {id:129,jenis:4,konten:"Masuk Rumah"},{id:130,jenis:4,konten:"Keluar Rumah"},
  {id:131,jenis:4,konten:"Selesai Makan"},{id:132,jenis:4,konten:"Selesai Adzan"},
  {id:133,jenis:4,konten:"Masuk Toilet"},{id:134,jenis:4,konten:"Keluar Toilet"},
  {id:135,jenis:4,konten:"Masuk Masjid"},{id:136,jenis:4,konten:"Keluar Masjid"},
  {id:137,jenis:4,konten:"Meminta Ilmu"},{id:138,jenis:4,konten:"Akhir Majelis"},
];
const IH_QURAN=ITEM_HAFALAN.filter(i=>i.jenis===2);
const IH_SHALAT=ITEM_HAFALAN.filter(i=>i.jenis===3);
const IH_DOA=ITEM_HAFALAN.filter(i=>i.jenis===4);

/* aspek mandiri fields - juga diisi di form pembinaan per sesi */
const MANDIRI_FIELDS=[
  {id:"bantu_ortu",  label:"Membantu Orangtua"},
  {id:"sedekah",     label:"Pembiasaan Sedekah"},
  {id:"shalat_wajib",label:"Pembiasaan Shalat Wajib"},
  {id:"tilawah",     label:"Pembiasaan Tilawah"},
];

const ANAK_INIT=[
  {id:"09215180158",nama:"Yulianti",          nick:"Yuli",   kel:"p",kelas:"SMP",tingkat:"8", sekolah:"SMPN 2 Kalibawang", wilayah:"Kalibawang",status:"yatim",      hafalan:80,tgl_lahir:"2012-03-15",telp:"081234560001",status_ortu:"Yatim (Ayah meninggal)",asnaf:"Miskin",tgl_daftar:"2020-01-10"},
  {id:"09215210025",nama:"Zahrah Tiara Dewi", nick:"Zahrah", kel:"p",kelas:"SMA",tingkat:"11",sekolah:"SMAN 1 Sleman",     wilayah:"Sleman",    status:"yatim piatu",hafalan:60,tgl_lahir:"2008-07-22",telp:"081234560002",status_ortu:"Yatim Piatu",            asnaf:"Miskin",tgl_daftar:"2019-06-05"},
  {id:"09215170193",nama:"Zilvie Azalia",     nick:"Zilvie", kel:"p",kelas:"SD", tingkat:"5", sekolah:"SDN Prambanan 1",   wilayah:"Prambanan", status:"yatim",      hafalan:90,tgl_lahir:"2014-11-08",telp:"081234560003",status_ortu:"Yatim (Ayah meninggal)",asnaf:"Miskin",tgl_daftar:"2021-02-14"},
  {id:"09215170015",nama:"Zhahira Shahwa",    nick:"Zhahira",kel:"p",kelas:"SMP",tingkat:"9", sekolah:"SMPN 1 Sanden",     wilayah:"Sanden",    status:"dhuafa",     hafalan:45,tgl_lahir:"2011-04-30",telp:"081234560004",status_ortu:"Lengkap",               asnaf:"Fakir", tgl_daftar:"2020-09-20"},
  {id:"09215190079",nama:"Yosi Prima Sentosa",nick:"Yosi",   kel:"l",kelas:"SMA",tingkat:"12",sekolah:"SMAN 1 Sewon",      wilayah:"Sewon",     status:"yatim",      hafalan:70,tgl_lahir:"2007-12-01",telp:"081234560005",status_ortu:"Yatim (Ayah meninggal)",asnaf:"Miskin",tgl_daftar:"2018-08-11"},
  {id:"09215240048",nama:"Zahra Dhiya Ul Haq",nick:"Zahra",  kel:"p",kelas:"SD", tingkat:"6", sekolah:"SDN Piyungan 2",    wilayah:"Piyungan",  status:"yatim piatu",hafalan:55,tgl_lahir:"2013-06-17",telp:"081234560006",status_ortu:"Yatim Piatu",            asnaf:"Miskin",tgl_daftar:"2021-04-03"},
  {id:"09215001",   nama:"Ahmad Fauzi",       nick:"Fauzi",  kel:"l",kelas:"SMP",tingkat:"7", sekolah:"SMPN 3 Kalibawang", wilayah:"Kalibawang",status:"yatim",      hafalan:85,tgl_lahir:"2013-01-25",telp:"081234560007",status_ortu:"Yatim (Ayah meninggal)",asnaf:"Miskin",tgl_daftar:"2021-07-15"},
  {id:"09215002",   nama:"Nisa Rahmawati",    nick:"Nisa",   kel:"p",kelas:"SMA",tingkat:"10",sekolah:"SMAN 2 Kalibawang", wilayah:"Kalibawang",status:"dhuafa",     hafalan:65,tgl_lahir:"2009-09-03",telp:"081234560008",status_ortu:"Lengkap",               asnaf:"Fakir", tgl_daftar:"2022-01-20"},
];

const HAFALAN_INIT={
  "09215180158":new Set([112,113,114,111,110,109,108,107,106,105,104,103,102,101,100,99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138]),
  "09215210025":new Set([112,113,114,111,110,109,108,107,106,105,104,103,102,101,100,99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,115,116,117,118,119,120,121,122,125,126,127,128,129,130,131,132,133,134]),
  "09215170193":new Set([112,113,114,111,110,109,108,107,106,105,104,103,102,101,100,99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,10,11,12,7,8,9,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138]),
  "09215170015":new Set([112,113,114,111,110,109,108,107,106,105,104,103,102,101,100,99,98,97,96,95,94,93,115,116,117,125,126,127,128,129,130,131]),
  "09215190079":new Set([112,113,114,111,110,109,108,107,106,105,104,103,102,101,100,99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135]),
  "09215240048":new Set([112,113,114,111,110,109,108,107,106,105,104,103,102,101,100,99,98,97,96,95,94,93,92,91,90,89,88,87,115,116,117,118,119,120,121,122,125,126,127,128,129,130,131,132,133]),
  "09215001":   new Set([112,113,114,111,110,109,108,107,106,105,104,103,102,101,100,99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137]),
  "09215002":   new Set([112,113,114,111,110,109,108,107,106,105,104,103,102,101,100,99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,115,116,117,118,119,120,121,122,123,125,126,127,128,129,130,131,132,133,134]),
};

/* mandiri per sesi: { sesiId: { anakId: { bantu_ortu:bool, sedekah:bool, ... } } } */
const MANDIRI_INIT={
  "PB-001":{"09215180158":{bantu_ortu:true,sedekah:true,shalat_wajib:true,tilawah:true},"09215210025":{bantu_ortu:true,sedekah:false,shalat_wajib:true,tilawah:true},"09215170193":{bantu_ortu:true,sedekah:true,shalat_wajib:true,tilawah:true},"09215170015":{bantu_ortu:false,sedekah:false,shalat_wajib:true,tilawah:false},"09215190079":{bantu_ortu:true,sedekah:true,shalat_wajib:true,tilawah:false},"09215240048":{bantu_ortu:true,sedekah:true,shalat_wajib:true,tilawah:true},"09215001":{bantu_ortu:true,sedekah:true,shalat_wajib:true,tilawah:true},"09215002":{bantu_ortu:false,sedekah:true,shalat_wajib:false,tilawah:false}},
  "PB-002":{"09215180158":{bantu_ortu:true,sedekah:true,shalat_wajib:true,tilawah:true},"09215210025":{bantu_ortu:false,sedekah:false,shalat_wajib:true,tilawah:false},"09215170193":{bantu_ortu:true,sedekah:true,shalat_wajib:true,tilawah:true},"09215170015":{bantu_ortu:true,sedekah:true,shalat_wajib:true,tilawah:false},"09215190079":{bantu_ortu:true,sedekah:true,shalat_wajib:true,tilawah:true},"09215240048":{bantu_ortu:false,sedekah:false,shalat_wajib:false,tilawah:false},"09215001":{bantu_ortu:true,sedekah:true,shalat_wajib:true,tilawah:true},"09215002":{bantu_ortu:true,sedekah:true,shalat_wajib:true,tilawah:true}},
};

const NILAI_OPTIONS=["Excellent","Good","Average","Below Average","Poor"];
const NILAI_COLOR={Excellent:T.green,Good:"#2E8B57",Average:T.gold,"Below Average":T.red,Poor:"#7A0000"};
const scoreToNilai=s=>s>=90?"Excellent":s>=75?"Good":s>=55?"Average":s>=35?"Below Average":"Poor";

/* seed pembinaan — with mandiri per sesi built in */
const SEED_PEMBINAAN=[
  {id:"PB-001",tgl:"2026-05-04",pertemuan:"Pertemuan ke-18",jenis:"Kajian Islam",    tema:"Akhlak Mulia dalam Kehidupan Sehari-hari",pemateri:"Ust. Hendra Gunawan",lokasi:"Masjid Al-Barokah",  waktu:"08:00-10:00",semester:"25",jumlah_hadir:10,jumlah_izin:1,jumlah_alfa:1,kehadiran:{"09215180158":"hadir","09215210025":"hadir","09215170193":"hadir","09215170015":"izin","09215190079":"hadir","09215240048":"hadir","09215001":"hadir","09215002":"alfa"},catatan:"Peserta sangat antusias."},
  {id:"PB-002",tgl:"2026-04-27",pertemuan:"Pertemuan ke-17",jenis:"Hafalan Al-Quran",tema:"Setoran Juz 30 - Sesi Evaluasi",           pemateri:"Ust. Fadhil Rahman", lokasi:"Posko Pembinaan",   waktu:"09:00-11:30",semester:"25",jumlah_hadir:9, jumlah_izin:2,jumlah_alfa:1,kehadiran:{"09215180158":"hadir","09215210025":"izin","09215170193":"hadir","09215170015":"hadir","09215190079":"hadir","09215240048":"alfa","09215001":"hadir","09215002":"hadir"},catatan:"Beberapa anak perlu tambahan waktu."},
  {id:"PB-003",tgl:"2026-04-20",pertemuan:"Pertemuan ke-16",jenis:"Kajian Islam",    tema:"Fiqih Shalat Wajib Lima Waktu",           pemateri:"Ust. Hendra Gunawan",lokasi:"Masjid Al-Barokah",  waktu:"08:00-10:00",semester:"25",jumlah_hadir:11,jumlah_izin:0,jumlah_alfa:1,kehadiran:{"09215180158":"hadir","09215210025":"hadir","09215170193":"hadir","09215170015":"hadir","09215190079":"hadir","09215240048":"hadir","09215001":"alfa","09215002":"hadir"},catatan:"Materi diterima baik."},
  {id:"PB-004",tgl:"2026-04-13",pertemuan:"Pertemuan ke-15",jenis:"Pembiasaan",      tema:"Pembiasaan Sedekah dan Tilawah Harian",   pemateri:"Kak Yulianti",       lokasi:"Masjid Al-Barokah",  waktu:"08:00-09:30",semester:"25",jumlah_hadir:8, jumlah_izin:2,jumlah_alfa:2,kehadiran:{"09215180158":"hadir","09215210025":"izin","09215170193":"hadir","09215170015":"alfa","09215190079":"hadir","09215240048":"hadir","09215001":"alfa","09215002":"izin"},catatan:"Anak-anak membawa catatan tilawah."},
  {id:"PB-005",tgl:"2026-04-06",pertemuan:"Pertemuan ke-14",jenis:"Kajian Islam",    tema:"Mengenal Asmaul Husna",                   pemateri:"Ust. Fadhil Rahman", lokasi:"Masjid Al-Barokah",  waktu:"08:00-10:00",semester:"25",jumlah_hadir:12,jumlah_izin:0,jumlah_alfa:0,kehadiran:{"09215180158":"hadir","09215210025":"hadir","09215170193":"hadir","09215170015":"hadir","09215190079":"hadir","09215240048":"hadir","09215001":"hadir","09215002":"hadir"},catatan:"Kehadiran 100%!"},
  {id:"PB-006",tgl:"2026-03-30",pertemuan:"Pertemuan ke-13",jenis:"Evaluasi",        tema:"Evaluasi Mid-Semester 25",                pemateri:"Kak Yulianti",       lokasi:"Kantor RZ Yogyakarta",waktu:"13:00-16:00",semester:"25",jumlah_hadir:11,jumlah_izin:1,jumlah_alfa:0,kehadiran:{"09215180158":"hadir","09215210025":"hadir","09215170193":"hadir","09215170015":"hadir","09215190079":"hadir","09215240048":"hadir","09215001":"hadir","09215002":"izin"},catatan:"Evaluasi berjalan lancar."},
  {id:"PB-007",tgl:"2026-03-23",pertemuan:"Pertemuan ke-12",jenis:"Hafalan Al-Quran",tema:"Murojaah Juz 30 Bersama",                 pemateri:"Ust. Hendra Gunawan",lokasi:"Masjid Al-Barokah",  waktu:"08:00-10:30",semester:"25",jumlah_hadir:10,jumlah_izin:1,jumlah_alfa:1,kehadiran:{"09215180158":"hadir","09215210025":"hadir","09215170193":"hadir","09215170015":"alfa","09215190079":"izin","09215240048":"hadir","09215001":"hadir","09215002":"hadir"},catatan:"Murojaah lancar."},
  {id:"PB-008",tgl:"2026-03-16",pertemuan:"Pertemuan ke-11",jenis:"Pembiasaan",      tema:"Shalat Dhuha Berjamaah dan Tausiyah",    pemateri:"Kak Yulianti",       lokasi:"Masjid Al-Barokah",  waktu:"07:30-09:00",semester:"25",jumlah_hadir:9, jumlah_izin:2,jumlah_alfa:1,kehadiran:{"09215180158":"hadir","09215210025":"hadir","09215170193":"hadir","09215170015":"izin","09215190079":"hadir","09215240048":"alfa","09215001":"hadir","09215002":"izin"},catatan:"Shalat dhuha penuh khidmat."},
];

const CAPAIAN_AREA=[{sesi:"S-11",hafalan:58,kehadiran:75},{sesi:"S-12",hafalan:60,kehadiran:72},{sesi:"S-13",hafalan:63,kehadiran:80},{sesi:"S-14",hafalan:65,kehadiran:100},{sesi:"S-15",hafalan:66,kehadiran:67},{sesi:"S-16",hafalan:67,kehadiran:92},{sesi:"S-17",hafalan:68,kehadiran:75},{sesi:"S-18",hafalan:68,kehadiran:83}];
const STATUS_PIE=[{name:"Yatim",value:4,color:"#1A5FA8"},{name:"Yatim Piatu",value:2,color:"#B87800"},{name:"Dhuafa",value:2,color:"#7A6055"}];

const inits=n=>n.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
const fmtTgl=s=>{if(!s)return"";const d=new Date(s);return d.toLocaleDateString("id-ID",{day:"2-digit",month:"short",year:"numeric"});};
const calcAge=tgl=>{const d=new Date(tgl),now=new Date();let y=now.getFullYear()-d.getFullYear();if(now<new Date(now.getFullYear(),d.getMonth(),d.getDate()))y--;return y;};
const statusColor={yatim:[T.blue,T.bluePale],"yatim piatu":[T.gold,T.goldPale],dhuafa:[T.gray,T.grayLt]};
const hadirColor={hadir:[T.green,T.greenPale],izin:[T.gold,T.goldPale],alfa:[T.red,T.redPale]};
const jenisIconMap={"Kajian Islam":BookOpen,"Hafalan Al-Quran":BookMarked,"Pembiasaan":Heart,"Evaluasi":ClipboardList};
const GF={fontFamily:T.font};
const ttStyle={contentStyle:{fontFamily:T.font,fontSize:12,borderRadius:8,border:`1px solid ${T.primarySoft}`},labelStyle:{fontWeight:700,color:T.charcoal}};

/* ── UI components ── */
function Avatar({nama,gender,size=36}){const bg=gender==="p"?"#F5D5BE":"#C8D8F0",color=gender==="p"?T.primaryDk:T.blue;return <div style={{...GF,width:size,height:size,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.34,fontWeight:700,color,flexShrink:0}}>{inits(nama)}</div>;}
function Badge({label,color,bg}){return <span style={{...GF,fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,background:bg,color,display:"inline-flex",alignItems:"center",whiteSpace:"nowrap"}}>{label}</span>;}
function BarLine({value,color=T.primary,h=6}){return <div style={{height:h,background:T.grayLt,borderRadius:99,overflow:"hidden",width:"100%"}}><div style={{height:"100%",width:`${Math.min(100,Math.max(0,value))}%`,background:color,borderRadius:99,transition:"width .5s ease"}}/></div>;}
function Card({children,style={}}){return <div style={{background:T.white,borderRadius:16,border:`1.5px solid ${T.primarySoft}`,...style}}>{children}</div>;}
function CardHead({icon:Icon,title,right}){return <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.grayLt}`,display:"flex",alignItems:"center",gap:8}}>{Icon&&<Icon size={17} color={T.primary} strokeWidth={2}/>}<span style={{...GF,fontWeight:800,fontSize:15,color:T.charcoal,flex:1}}>{title}</span>{right}</div>;}
function StatCard({icon:Icon,label,value,color,sub}){return <div style={{background:T.white,border:`1.5px solid ${T.primarySoft}`,borderRadius:14,padding:"16px 18px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:-14,right:-14,width:68,height:68,borderRadius:"50%",background:T.primaryPale,opacity:.7}}/><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>{Icon&&<Icon size={15} color={color||T.primary} strokeWidth={2.5}/>}<span style={{...GF,fontSize:12,color:T.gray,fontWeight:600}}>{label}</span></div><div style={{...GF,fontSize:28,fontWeight:800,color:color||T.primary,lineHeight:1}}>{value}</div>{sub&&<div style={{...GF,fontSize:12,color:T.gray,marginTop:4}}>{sub}</div>}</div>;}
function NavItem({icon:Icon,label,active,badge,onClick,inverted=false}){const activeBg=inverted?"rgba(255,255,255,.22)":T.primaryPale,activeColor=inverted?T.white:T.primary,inactColor=inverted?"rgba(255,255,255,.78)":T.gray;return <button onClick={onClick} style={{...GF,display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,background:active?activeBg:"transparent",color:active?activeColor:inactColor,border:"none",fontSize:14,fontWeight:active?700:500,width:"100%",cursor:"pointer",textAlign:"left"}}><Icon size={17} strokeWidth={active?2.5:2} style={{flexShrink:0}}/><span style={{flex:1}}>{label}</span>{badge&&<span style={{background:inverted?"rgba(255,255,255,.28)":T.primary,color:T.white,fontSize:11,fontWeight:700,borderRadius:10,padding:"1px 7px"}}>{badge}</span>}{active&&<span style={{width:6,height:6,borderRadius:"50%",background:inverted?T.white:T.primary,flexShrink:0}}/>}</button>;}
function FLabel({children}){return <div style={{...GF,fontSize:11,fontWeight:700,color:T.gray,letterSpacing:.6,marginBottom:4,textTransform:"uppercase"}}>{children}</div>;}
function Input({value,onChange,placeholder,type="text"}){return <input type={type} value={value||""} onChange={onChange} placeholder={placeholder} style={{...GF,fontSize:13,padding:"8px 11px",border:`1.5px solid ${T.primarySoft}`,borderRadius:8,width:"100%",background:T.white,color:T.charcoal,outline:"none",boxSizing:"border-box"}}/>;}
function Sel({value,onChange,children}){return <select value={value} onChange={onChange} style={{...GF,fontSize:13,padding:"8px 11px",border:`1.5px solid ${T.primarySoft}`,borderRadius:8,width:"100%",background:T.white,color:T.charcoal,outline:"none",boxSizing:"border-box"}}>{children}</select>;}
function Textarea({value,onChange,placeholder}){return <textarea value={value||""} onChange={onChange} placeholder={placeholder} rows={3} style={{...GF,fontSize:13,padding:"8px 11px",border:`1.5px solid ${T.primarySoft}`,borderRadius:8,width:"100%",background:T.white,color:T.charcoal,outline:"none",resize:"vertical",boxSizing:"border-box",minHeight:72}}/>;}
function Btn({children,onClick,variant="outline",size="md"}){const sz=size==="sm"?{fontSize:12,padding:"6px 13px"}:{fontSize:13,padding:"9px 18px"};const v=variant==="primary"?{background:T.primary,color:T.white,border:"none"}:variant==="danger"?{background:T.redPale,color:T.red,border:`1.5px solid ${T.red}40`}:{background:"transparent",color:T.primary,border:`1.5px solid ${T.primary}`};return <button onClick={onClick} style={{...GF,cursor:"pointer",fontWeight:700,borderRadius:8,display:"inline-flex",alignItems:"center",gap:6,...sz,...v}}>{children}</button>;}
function Modal({title,onClose,children}){return <div style={{position:"fixed",inset:0,background:"rgba(26,10,0,.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}><div style={{background:T.white,borderRadius:18,width:"100%",maxWidth:680,maxHeight:"90vh",overflow:"auto",border:`1.5px solid ${T.primarySoft}`}}><div style={{padding:"16px 20px",borderBottom:`1px solid ${T.grayLt}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{...GF,fontWeight:800,fontSize:17,color:T.charcoal}}>{title}</span><button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:T.gray,lineHeight:1}}>x</button></div><div style={{padding:"20px"}}>{children}</div></div></div>;}
function NilaiBadge({nilai}){const c=NILAI_COLOR[nilai]||T.gray;return <span style={{...GF,fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:20,background:c+"22",color:c,border:`1px solid ${c}40`,whiteSpace:"nowrap"}}>{nilai||"-"}</span>;}
function TabBar({tabs,active,onChange}){return <div style={{display:"flex",borderBottom:`2px solid ${T.grayLt}`,marginBottom:18,overflowX:"auto",flexShrink:0}}>{tabs.map(t=><button key={t.id} onClick={()=>onChange(t.id)} style={{...GF,padding:"9px 18px",border:"none",background:"none",cursor:"pointer",fontWeight:700,fontSize:13,whiteSpace:"nowrap",color:active===t.id?T.primary:T.gray,borderBottom:`2.5px solid ${active===t.id?T.primary:"transparent"}`,marginBottom:-2}}>{t.label}</button>)}</div>;}
function Toggle({value,onChange,label}){return <button onClick={()=>onChange(!value)} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",padding:0}}><div style={{width:36,height:20,borderRadius:10,background:value?T.green:T.grayMd,transition:"background .2s",position:"relative",flexShrink:0}}><div style={{position:"absolute",top:2,left:value?16:2,width:16,height:16,borderRadius:"50%",background:T.white,transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/></div><span style={{...GF,fontSize:13,color:value?T.green:T.gray,fontWeight:value?700:400}}>{label}</span></button>;}

/* ── syncPenilaian ── */
function syncPenilaian(anakId,semester,pembinaan,hafalan,mandiriData){
  const sesiSem=pembinaan.filter(s=>s.semester===semester);
  const jmlSesi=sesiSem.length;
  const jmlHadir=sesiSem.filter(s=>s.kehadiran?.[anakId]==="hadir").length;
  const pctHadir=jmlSesi?Math.round(jmlHadir/jmlSesi*100):0;
  const haf=hafalan[anakId]||new Set();
  const quranCount=IH_QURAN.filter(i=>haf.has(i.id)).length;
  const shalatCount=IH_SHALAT.filter(i=>haf.has(i.id)).length;
  const doaCount=IH_DOA.filter(i=>haf.has(i.id)).length;
  const levelQ=quranCount>=50?"Juz 30+":quranCount>=37?"Juz 30 ("+quranCount+" surat)":quranCount>=20?"Level 3 ("+quranCount+" surat)":"Level 2 ("+quranCount+" surat)";
  const mc={bantu_ortu:0,sedekah:0,shalat_wajib:0,tilawah:0};
  sesiSem.forEach(s=>{const m=mandiriData[s.id]?.[anakId];if(m){MANDIRI_FIELDS.forEach(f=>{if(m[f.id])mc[f.id]++;});}});
  const toNilaiM=v=>scoreToNilai(jmlSesi?v/jmlSesi*100:0);
  return{
    anakId,semester,tgl_sync:new Date().toISOString().slice(0,10),
    aspek_cerdas:[
      {id:"c1",nama:"Hafalan Alquran",         target:"Level 4 (Juz 30)",   kondisi_awal:quranCount+" surat",  perkembangan:levelQ,                                              nilai:scoreToNilai(quranCount/IH_QURAN.length*100)},
      {id:"c2",nama:"Hafalan Bacaan Shalat",   target:"10 Bacaan",          kondisi_awal:shalatCount+" bacaan",perkembangan:shalatCount+"/"+IH_SHALAT.length+" bacaan",          nilai:scoreToNilai(shalatCount/IH_SHALAT.length*100)},
      {id:"c3",nama:"Hafalan Doa Pilihan",     target:"14 Doa",             kondisi_awal:doaCount+" doa",      perkembangan:doaCount+"/"+IH_DOA.length+" doa",                   nilai:scoreToNilai(doaCount/IH_DOA.length*100)},
      {id:"c4",nama:"Kemampuan Membaca Alquran",target:"Al Quran Lancar",   kondisi_awal:quranCount>10?"Al Quran Lancar":"Iqra",perkembangan:quranCount>10?"Al Quran Lancar":"Sedang belajar",nilai:scoreToNilai(quranCount>10?90:40)},
    ],
    aspek_mandiri:[
      {id:"m1",nama:"Kehadiran Pembinaan",    target:String(jmlSesi),capaian:String(jmlHadir),        nilai:scoreToNilai(pctHadir)},
      {id:"m2",nama:"Membantu Orangtua",      target:String(jmlSesi),capaian:String(mc.bantu_ortu),   nilai:toNilaiM(mc.bantu_ortu)},
      {id:"m3",nama:"Pembiasaan Sedekah",     target:String(jmlSesi),capaian:String(mc.sedekah),      nilai:toNilaiM(mc.sedekah)},
      {id:"m4",nama:"Pembiasaan Shalat Wajib",target:String(jmlSesi),capaian:String(mc.shalat_wajib), nilai:toNilaiM(mc.shalat_wajib)},
      {id:"m5",nama:"Pembiasaan Tilawah",     target:String(jmlSesi),capaian:String(mc.tilawah),      nilai:toNilaiM(mc.tilawah)},
    ],
    catatan:"",suara_anak:"",
  };
}

/* ── LaporanCard ── */
function LaporanCard({pen}){
  if(!pen)return <div style={{textAlign:"center",padding:40,color:T.gray,...GF}}>Belum ada data. Klik Sync untuk generate otomatis.</div>;
  return(
    <div>
      <div style={{background:T.primaryPale,borderRadius:14,padding:"12px 18px",marginBottom:14,border:`1.5px solid ${T.primarySoft}`,display:"flex",gap:20,flexWrap:"wrap"}}>
        <span style={{...GF,fontSize:12,color:T.primaryDk,fontWeight:700}}>Sem. {pen.semester}</span>
        <span style={{...GF,fontSize:12,color:T.gray}}>Sync: <strong style={{color:T.charcoal}}>{pen.tgl_sync||"-"}</strong></span>
        <span style={{...GF,fontSize:12,color:T.gray}}>Hadir: <strong style={{color:T.green}}>{pen.aspek_mandiri[0]?.capaian}/{pen.aspek_mandiri[0]?.target}</strong></span>
      </div>
      <div style={{borderRadius:12,overflow:"hidden",border:`1.5px solid ${T.primarySoft}`,marginBottom:14}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:T.primary}}>{["No","Aspek Cerdas","Target","Kondisi Awal","Perkembangan","Nilai"].map(h=><th key={h} style={{...GF,fontSize:12,fontWeight:700,color:T.white,padding:"10px 14px",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>{pen.aspek_cerdas.map((item,i)=><tr key={item.id} style={{background:i%2===0?T.white:"#FDFAF8"}}><td style={{...GF,fontSize:12,color:T.gray,padding:"11px 14px",fontWeight:700}}>{i+1}</td><td style={{...GF,fontSize:13,color:T.charcoal,padding:"11px 14px"}}>{item.nama}</td><td style={{...GF,fontSize:12,color:T.gray,padding:"11px 14px",whiteSpace:"nowrap"}}>{item.target}</td><td style={{...GF,fontSize:12,color:T.gray,padding:"11px 14px",whiteSpace:"nowrap"}}>{item.kondisi_awal}</td><td style={{...GF,fontSize:12,fontWeight:600,color:T.charcoal,padding:"11px 14px"}}>{item.perkembangan}</td><td style={{padding:"11px 14px"}}><NilaiBadge nilai={item.nilai}/></td></tr>)}</tbody>
        </table>
      </div>
      <div style={{borderRadius:12,overflow:"hidden",border:`1.5px solid ${T.primarySoft}`,marginBottom:14}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:T.primaryLt}}>{["No","Aspek Mandiri","Target","Capaian","Nilai"].map(h=><th key={h} style={{...GF,fontSize:12,fontWeight:700,color:T.white,padding:"10px 14px",textAlign:"left",whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
          <tbody>{pen.aspek_mandiri.map((item,i)=><tr key={item.id} style={{background:i%2===0?T.white:"#FDFAF8"}}><td style={{...GF,fontSize:12,color:T.gray,padding:"11px 14px",fontWeight:700}}>{i+1}</td><td style={{...GF,fontSize:13,color:T.charcoal,padding:"11px 14px"}}>{item.nama}</td><td style={{...GF,fontSize:12,color:T.gray,padding:"11px 14px"}}>{item.target}</td><td style={{...GF,fontSize:12,fontWeight:700,color:T.charcoal,padding:"11px 14px"}}>{item.capaian}</td><td style={{padding:"11px 14px"}}><NilaiBadge nilai={item.nilai}/></td></tr>)}</tbody>
          <tfoot><tr style={{background:T.primaryLt}}><td colSpan={4} style={{...GF,fontSize:13,fontWeight:800,color:T.white,padding:"11px 14px"}}>Rata-rata Skor (Mandiri)</td><td style={{padding:"11px 14px"}}><span style={{...GF,fontSize:13,fontWeight:800,color:T.white}}>({pen.aspek_mandiri[0]?.nilai||"-"})</span></td></tr></tfoot>
        </table>
      </div>
      {pen.catatan&&<Card style={{marginBottom:10}}><CardHead icon={ClipboardList} title="Catatan Pembina"/><div style={{padding:"12px 18px",...GF,fontSize:14,color:T.charcoal,lineHeight:1.7}}>{pen.catatan}</div></Card>}
      {pen.suara_anak&&<Card><CardHead icon={Heart} title="Suara Anak Juara"/><div style={{padding:"12px 18px",...GF,fontSize:14,color:T.charcoal,lineHeight:1.7,fontStyle:"italic"}}>"{pen.suara_anak}"</div></Card>}
    </div>
  );
}

/* ── BERANDA ── */
function Beranda({anak,pembinaan}){
  const HAFALAN_BAR=anak.map(a=>({nama:a.nick,hafalan:a.hafalan}));
  return(
    <div>
      <div style={{marginBottom:22}}><h1 style={{...GF,fontSize:23,fontWeight:800,color:T.charcoal,margin:0}}>Dasbor Statistik</h1><p style={{...GF,color:T.gray,fontSize:14,margin:"4px 0 0"}}>Kalibawang_Banjarasri · Semester 25</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:13,marginBottom:22}}>
        <StatCard icon={Users} label="Anak Asuh" value={anak.length} color={T.primary} sub="Aktif"/>
        <StatCard icon={CheckCircle} label="Kehadiran" value="87%" color={T.green} sub="Rata-rata"/>
        <StatCard icon={BookMarked} label="Hafalan" value="68%" color={T.gold} sub="Capaian"/>
        <StatCard icon={Activity} label="Total Sesi" value={pembinaan.length} color={T.blue} sub="Semester 25"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:16}}>
        <Card><CardHead icon={TrendingUp} title="Tren Capaian per Sesi"/>
          <div style={{padding:"16px 8px 12px"}}><ResponsiveContainer width="100%" height={200}><AreaChart data={CAPAIAN_AREA} margin={{top:4,right:16,left:-10,bottom:0}}><defs><linearGradient id="gH" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.primary} stopOpacity={0.25}/><stop offset="95%" stopColor={T.primary} stopOpacity={0.02}/></linearGradient><linearGradient id="gK" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.green} stopOpacity={0.25}/><stop offset="95%" stopColor={T.green} stopOpacity={0.02}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={T.grayLt}/><XAxis dataKey="sesi" tick={{...GF,fontSize:11}}/><YAxis domain={[40,100]} tick={{...GF,fontSize:11}} unit="%"/><Tooltip {...ttStyle} formatter={v=>v+"%"}/><Legend wrapperStyle={{...GF,fontSize:12}}/><Area type="monotone" dataKey="hafalan" name="Hafalan" stroke={T.primary} fill="url(#gH)" strokeWidth={2} dot={false}/><Area type="monotone" dataKey="kehadiran" name="Kehadiran" stroke={T.green} fill="url(#gK)" strokeWidth={2} dot={false}/></AreaChart></ResponsiveContainer></div>
        </Card>
        <Card><CardHead icon={Users} title="Status Anak"/>
          <div style={{padding:"12px 8px"}}><ResponsiveContainer width="100%" height={130}><PieChart><Pie data={STATUS_PIE} cx="50%" cy="50%" outerRadius={50} innerRadius={26} dataKey="value" label={false}>{STATUS_PIE.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip {...ttStyle}/></PieChart></ResponsiveContainer>
          <div style={{padding:"0 8px 8px"}}>{STATUS_PIE.map(s=><div key={s.name} style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}><span style={{width:10,height:10,borderRadius:3,background:s.color,flexShrink:0}}/><span style={{...GF,fontSize:12,color:T.charcoal,flex:1}}>{s.name}</span><span style={{...GF,fontSize:12,fontWeight:700,color:s.color}}>{s.value}</span></div>)}</div>
          </div>
        </Card>
      </div>
      <Card><CardHead icon={BookOpen} title="Capaian Hafalan per Anak"/>
        <div style={{padding:"12px 8px"}}><ResponsiveContainer width="100%" height={220}><BarChart data={HAFALAN_BAR} layout="vertical" margin={{top:4,right:24,left:10,bottom:0}}><CartesianGrid strokeDasharray="3 3" stroke={T.grayLt} horizontal={false}/><XAxis type="number" domain={[0,100]} tick={{...GF,fontSize:11}} unit="%"/><YAxis type="category" dataKey="nama" tick={{...GF,fontSize:12}} width={58}/><Tooltip {...ttStyle} formatter={v=>v+"%"}/><Bar dataKey="hafalan" name="Hafalan" radius={[0,4,4,0]}>{HAFALAN_BAR.map((e,i)=><Cell key={i} fill={e.hafalan>=80?T.green:e.hafalan>=60?T.primary:T.red}/>)}</Bar></BarChart></ResponsiveContainer></div>
      </Card>
    </div>
  );
}

/* ── DAFTAR ANAK (Excel table desktop, cards mobile, advanced filter, generate modal) ── */
function DaftarAnak({anak,hafalan,penilaian,setPenilaian,pembinaan,mandiriData}){
  const [selected,setSelected]=useState(null);
  const [tab,setTab]=useState("biodata");
  const [htab,setHtab]=useState("quran");
  const [showFilter,setShowFilter]=useState(false);
  const [showGenModal,setShowGenModal]=useState(false);
  const [genSem,setGenSem]=useState("25");
  /* filters */
  const [fQ,setFQ]=useState("");
  const [fStatus,setFStatus]=useState("Semua");
  const [fKelas,setFKelas]=useState("Semua");
  const [fWilayah,setFWilayah]=useState("Semua");
  const [fAsnaf,setFAsnaf]=useState("Semua");
  const [fHadir,setFHadir]=useState("Semua"); // >=80, 60-79, <60
  const wilayahOpts=[...new Set(anak.map(a=>a.wilayah))];
  const kelasOpts=[...new Set(anak.map(a=>a.kelas))];
  const activeF=[fStatus!=="Semua",fKelas!=="Semua",fWilayah!=="Semua",fAsnaf!=="Semua",fHadir!=="Semua"].filter(Boolean).length;
  const clearF=()=>{setFQ("");setFStatus("Semua");setFKelas("Semua");setFWilayah("Semua");setFAsnaf("Semua");setFHadir("Semua");};
  const filtered=useMemo(()=>anak.filter(a=>{
    if(fQ&&!a.nama.toLowerCase().includes(fQ.toLowerCase())&&!a.nick.toLowerCase().includes(fQ.toLowerCase()))return false;
    if(fStatus!=="Semua"&&a.status!==fStatus)return false;
    if(fKelas!=="Semua"&&a.kelas!==fKelas)return false;
    if(fWilayah!=="Semua"&&a.wilayah!==fWilayah)return false;
    if(fAsnaf!=="Semua"&&a.asnaf!==fAsnaf)return false;
    if(fHadir!=="Semua"){const h=pembinaan.filter(s=>s.kehadiran?.[a.id]==="hadir").length,pct=pembinaan.length?h/pembinaan.length*100:0;if(fHadir===">=80"&&pct<80)return false;if(fHadir==="60-79"&&(pct<60||pct>=80))return false;if(fHadir==="<60"&&pct>=60)return false;}
    return true;
  }),[anak,fQ,fStatus,fKelas,fWilayah,fAsnaf,fHadir,pembinaan]);

  function doGenerate(anakId,semester){
    const gen=syncPenilaian(anakId,semester,pembinaan,hafalan,mandiriData);
    setPenilaian(p=>({...p,[anakId+"_"+semester]:gen}));
  }
  function generateAll(){
    const updates={};
    anak.forEach(a=>{updates[a.id+"_"+genSem]=syncPenilaian(a.id,genSem,pembinaan,hafalan,mandiriData);});
    setPenilaian(p=>({...p,...updates}));
    setShowGenModal(false);
  }

  /* TABLE COLUMNS */
  const cols=[
    {key:"no",    label:"#",           w:36,  sticky:true,  left:0,   render:(a,i)=>i+1},
    {key:"id",    label:"ID",          w:110, sticky:true,  left:36,  sep:true, render:a=>a.id},
    {key:"nama",  label:"Nama",        w:180, sticky:true,  left:146, sep:true, render:a=><div style={{fontWeight:700}}>{a.nama}</div>},
    {key:"nick",  label:"Panggilan",   w:90,  render:a=>a.nick},
    {key:"kel",   label:"JK",          w:50,  render:a=>a.kel==="p"?"P":"L"},
    {key:"kelas", label:"Kelas",       w:60,  render:a=>a.kelas},
    {key:"tingkat",label:"Tingkat",    w:70,  render:a=>a.tingkat},
    {key:"sekolah",label:"Sekolah",    w:200, render:a=>a.sekolah},
    {key:"wilayah",label:"Wilayah",   w:110, render:a=>a.wilayah},
    {key:"status", label:"Status",     w:100, render:a=>{const [sc,sb]=statusColor[a.status]||[T.gray,T.grayLt];return <Badge label={a.status} color={sc} bg={sb}/>;} },
    {key:"asnaf",  label:"Asnaf",      w:70,  render:a=>a.asnaf},
    {key:"tgl_lahir",label:"Tgl Lahir",w:120,render:a=>fmtTgl(a.tgl_lahir)},
    {key:"usia",   label:"Usia",       w:50,  render:a=>calcAge(a.tgl_lahir)+"th"},
    {key:"telp",   label:"No. HP",     w:130, render:a=>a.telp},
    {key:"tgl_daftar",label:"Terdaftar",w:110,render:a=>fmtTgl(a.tgl_daftar)},
    {key:"hadir",  label:"% Hadir",    w:80,  render:a=>{const h=pembinaan.filter(s=>s.kehadiran?.[a.id]==="hadir").length,pct=Math.round(h/pembinaan.length*100);return <span style={{...GF,fontWeight:700,color:pct>=80?T.green:pct>=60?T.gold:T.red}}>{pct}%</span>;} },
    {key:"sesi",   label:"Sesi",       w:60,  render:a=>{const h=pembinaan.filter(s=>s.kehadiran?.[a.id]==="hadir").length;return h+"/"+pembinaan.length;} },
    {key:"quran",  label:"Quran",      w:70,  render:a=>{const haf=hafalan[a.id]||new Set();const n=IH_QURAN.filter(i=>haf.has(i.id)).length;return n+"/"+IH_QURAN.length;} },
    {key:"shalat", label:"Shalat",     w:70,  render:a=>{const haf=hafalan[a.id]||new Set();const n=IH_SHALAT.filter(i=>haf.has(i.id)).length;return n+"/"+IH_SHALAT.length;} },
    {key:"doa",    label:"Doa",        w:60,  render:a=>{const haf=hafalan[a.id]||new Set();const n=IH_DOA.filter(i=>haf.has(i.id)).length;return n+"/"+IH_DOA.length;} },
    {key:"aksi",   label:"Aksi",       w:80,  render:a=><div style={{display:"flex",gap:4}}><button onClick={e=>{e.stopPropagation();setSelected(a);setTab("biodata");}} style={{...GF,background:T.primaryPale,border:"none",borderRadius:6,fontSize:11,fontWeight:700,padding:"3px 8px",cursor:"pointer",color:T.primaryDk,display:"flex",alignItems:"center",gap:2}}><Eye size={11}/>Lihat</button></div>},
  ];

  /* DETAIL VIEW */
  if(selected){
    const a=selected, haf=hafalan[a.id]||new Set();
    const riwayat=pembinaan.map(s=>({...s,statusAnak:s.kehadiran?.[a.id]||null})).sort((x,y)=>y.tgl.localeCompare(x.tgl));
    const totalSesi=riwayat.length,jmlHadir=riwayat.filter(s=>s.statusAnak==="hadir").length;
    const jmlIzin=riwayat.filter(s=>s.statusAnak==="izin").length,jmlAlfa=totalSesi-jmlHadir-jmlIzin;
    const pctHadir=Math.round(jmlHadir/totalSesi*100);
    const hItems=htab==="quran"?IH_QURAN:htab==="shalat"?IH_SHALAT:IH_DOA;
    const pen=penilaian[a.id+"_25"];
    return(
      <div>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
          <button onClick={()=>setSelected(null)} style={{...GF,background:"none",border:"none",color:T.primary,fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><ArrowLeft size={16}/> Kembali</button>
          <div style={{marginLeft:"auto"}}><Btn size="sm" onClick={()=>{doGenerate(a.id,"25");}}><RefreshCw size={13}/> Generate/Sync Penilaian</Btn></div>
        </div>
        <div style={{background:`linear-gradient(135deg,${T.primary},${T.primaryLt})`,borderRadius:20,padding:"22px 24px",color:T.white,marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:"rgba(255,255,255,.25)",border:"2.5px solid rgba(255,255,255,.6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:T.white,flexShrink:0,...GF}}>{inits(a.nama)}</div>
            <div style={{flex:1}}><div style={{...GF,fontWeight:900,fontSize:20,lineHeight:1.1}}>{a.nama}</div><div style={{...GF,fontSize:13,opacity:.88,marginTop:3}}>{a.nick} · {a.kelas} {a.tingkat} · {a.wilayah}</div><div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>{[a.status,a.asnaf,"Aktif"].map(lbl=><span key={lbl} style={{background:"rgba(255,255,255,.2)",borderRadius:20,padding:"3px 11px",...GF,fontSize:12,fontWeight:700}}>{lbl}</span>)}</div></div>
            <div style={{textAlign:"right",flexShrink:0}}><div style={{...GF,fontSize:32,fontWeight:900,lineHeight:1}}>{pctHadir}%</div><div style={{...GF,fontSize:12,opacity:.85,marginTop:2}}>Kehadiran</div></div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:12,marginBottom:18}}>
          {[[Activity,"Sesi",totalSesi,T.primary],[CheckCircle,"Hadir",jmlHadir,T.green],[MinusCircle,"Izin",jmlIzin,T.gold],[AlertCircle,"Alfa",jmlAlfa,T.red],[BookMarked,"Quran",IH_QURAN.filter(i=>haf.has(i.id)).length+"/"+IH_QURAN.length,T.primaryDk],[BookOpen,"Shalat",IH_SHALAT.filter(i=>haf.has(i.id)).length+"/"+IH_SHALAT.length,T.blue],[Heart,"Doa",IH_DOA.filter(i=>haf.has(i.id)).length+"/"+IH_DOA.length,T.gold]].map(([Ic,lbl,val,color])=>(
            <div key={lbl} style={{background:T.white,border:`1.5px solid ${T.primarySoft}`,borderRadius:14,padding:"12px 12px",textAlign:"center"}}><Ic size={15} color={color} style={{display:"block",margin:"0 auto 3px"}}/><div style={{...GF,fontSize:17,fontWeight:800,color,lineHeight:1}}>{val}</div><div style={{...GF,fontSize:10,color:T.gray,marginTop:2}}>{lbl}</div></div>
          ))}
        </div>
        <TabBar tabs={[{id:"biodata",label:"Data Pribadi"},{id:"hafalan",label:"Hafalan"},{id:"kehadiran",label:"Kehadiran"},{id:"penilaian",label:"Laporan Penilaian"}]} active={tab} onChange={setTab}/>
        {tab==="biodata"&&<Card><CardHead icon={Users} title="Data Pribadi"/><div style={{padding:"14px 18px"}}>{[["Nama Lengkap",a.nama],["Nama Panggilan",a.nick],["Jenis Kelamin",a.kel==="p"?"Perempuan":"Laki-laki"],["Tanggal Lahir",fmtTgl(a.tgl_lahir)+" ("+calcAge(a.tgl_lahir)+" tahun)"],["Kelas",a.kelas+" "+a.tingkat],["Sekolah",a.sekolah],["Wilayah",a.wilayah],["Status Ortu",a.status_ortu],["Asnaf",a.asnaf],["No. HP",a.telp],["Terdaftar",fmtTgl(a.tgl_daftar)],["ID Anak",a.id]].map(([lbl,val])=><div key={lbl} style={{display:"flex",gap:10,paddingBottom:8,marginBottom:8,borderBottom:`1px solid ${T.grayLt}`}}><span style={{...GF,fontSize:12,color:T.gray,fontWeight:600,minWidth:130,flexShrink:0}}>{lbl}</span><span style={{...GF,fontSize:13,color:T.charcoal}}>{val}</span></div>)}</div></Card>}
        {tab==="hafalan"&&<div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
            {[[IH_QURAN,"Al-Quran",T.primary],[IH_SHALAT,"Bacaan Shalat",T.blue],[IH_DOA,"Doa Pilihan",T.gold]].map(([items,label,color])=>{const count=items.filter(i=>haf.has(i.id)).length;return(
              <div key={label} style={{background:T.white,border:`1.5px solid ${T.primarySoft}`,borderRadius:14,padding:"14px 16px"}}><div style={{...GF,fontSize:11,fontWeight:700,color:T.gray,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>{label}</div><div style={{...GF,fontSize:22,fontWeight:800,color}}>{count}<span style={{fontSize:13,fontWeight:500,color:T.gray}}>/{items.length}</span></div><div style={{marginTop:8}}><BarLine value={count/items.length*100} color={color} h={6}/></div></div>
            );})}
          </div>
          <TabBar tabs={[{id:"quran",label:"Al-Quran"},{id:"shalat",label:"Bacaan Shalat"},{id:"doa",label:"Doa Pilihan"}]} active={htab} onChange={setHtab}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:8}}>
            {hItems.map(item=>{const done=haf.has(item.id);return(<div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,border:`1.5px solid ${done?T.green+"50":T.grayLt}`,background:done?T.greenPale:"transparent"}}>
              <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${done?T.green:T.grayMd}`,background:done?T.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{done&&<CheckCircle size={12} color={T.white} strokeWidth={2.5}/>}</div>
              <span style={{...GF,fontSize:12,fontWeight:done?700:400,color:done?T.green:T.charcoal,flex:1}}>{item.konten}</span>
            </div>);})}
          </div>
        </div>}
        {tab==="kehadiran"&&<Card><CardHead icon={ClipboardList} title={`Rekap Kehadiran (${totalSesi} sesi)`}/>
          <div style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr 80px",gap:8,padding:"9px 18px",background:T.primaryPale,borderBottom:`1px solid ${T.primarySoft}`}}>{["#","Sesi","Tema","Status"].map((h,i)=><div key={i} style={{...GF,fontSize:11,fontWeight:800,color:T.primaryDk,textTransform:"uppercase",letterSpacing:.5}}>{h}</div>)}</div>
          {riwayat.map((s,i)=>{const st=s.statusAnak,[hc,hbg]=st?hadirColor[st]:[T.gray,T.grayLt];const HIcon=st==="hadir"?CheckCircle:st==="izin"?MinusCircle:AlertCircle;return(
            <div key={s.id} style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr 80px",gap:8,padding:"10px 18px",alignItems:"center",borderBottom:i<riwayat.length-1?`1px solid ${T.grayLt}`:"none"}}>
              <span style={{...GF,fontSize:11,fontWeight:700,color:T.gray,textAlign:"center"}}>{i+1}</span>
              <div><div style={{...GF,fontWeight:700,fontSize:13,color:T.charcoal}}>{s.pertemuan}</div><div style={{...GF,fontSize:11,color:T.gray,display:"flex",alignItems:"center",gap:4}}><Calendar size={11}/>{fmtTgl(s.tgl)}</div></div>
              <span style={{...GF,fontSize:12,color:T.charcoal}}>{s.tema}</span>
              <div style={{display:"flex",alignItems:"center",gap:4,background:hbg,borderRadius:20,padding:"4px 10px",width:"fit-content"}}><HIcon size={12} color={hc} strokeWidth={2.5}/><span style={{...GF,fontSize:11,fontWeight:700,color:hc}}>{st==="hadir"?"Hadir":st==="izin"?"Izin":"Alfa"}</span></div>
            </div>);})}
          <div style={{padding:"12px 18px",background:T.primaryPale,borderTop:`1px solid ${T.primarySoft}`,display:"flex",alignItems:"center",gap:16}}><div style={{flex:1}}><BarLine value={pctHadir} color={pctHadir>=80?T.green:pctHadir>=60?T.primary:T.red} h={7}/></div><span style={{...GF,fontSize:13,fontWeight:800,color:T.primary,flexShrink:0}}>{jmlHadir}/{totalSesi} hadir ({pctHadir}%)</span></div>
        </Card>}
        {tab==="penilaian"&&<LaporanCard pen={pen}/>}
      </div>
    );
  }

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div><h1 style={{...GF,fontSize:23,fontWeight:800,color:T.charcoal,margin:0}}>Daftar Anak Asuh</h1><p style={{...GF,color:T.gray,fontSize:14,margin:"4px 0 0"}}>{filtered.length} / {anak.length} anak</p></div>
        <div style={{display:"flex",gap:8}}><Btn size="sm" variant="primary" onClick={()=>setShowGenModal(true)}><RefreshCw size={13}/> Generate Massal</Btn><Btn variant="primary"><Plus size={15}/> Tambah Anak</Btn></div>
      </div>
      {/* Search + filter row */}
      <div style={{display:"flex",gap:8,marginBottom:showFilter?0:16,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:200,background:T.white,border:`1.5px solid ${T.primarySoft}`,borderRadius:10,padding:"9px 13px"}}>
          <Search size={15} color={T.gray}/><input value={fQ} onChange={e=>setFQ(e.target.value)} placeholder="Cari nama / panggilan..." style={{...GF,border:"none",background:"none",fontSize:13,color:T.charcoal,flex:1,outline:"none"}}/>
          {fQ&&<button onClick={()=>setFQ("")} style={{background:"none",border:"none",cursor:"pointer"}}><X size={13} color={T.gray}/></button>}
        </div>
        <button onClick={()=>setShowFilter(v=>!v)} style={{...GF,display:"flex",alignItems:"center",gap:6,padding:"9px 14px",borderRadius:10,background:showFilter||activeF>0?T.primaryPale:T.white,border:`1.5px solid ${T.primarySoft}`,color:T.primary,fontWeight:700,fontSize:13,cursor:"pointer"}}>
          <SlidersHorizontal size={15}/>Filter{activeF>0&&<span style={{background:T.primary,color:T.white,borderRadius:10,fontSize:11,padding:"0 6px",fontWeight:800}}>{activeF}</span>}
        </button>
        {activeF>0&&<button onClick={clearF} style={{...GF,display:"flex",alignItems:"center",gap:5,padding:"9px 14px",borderRadius:10,background:T.redPale,border:"none",color:T.red,fontWeight:700,fontSize:13,cursor:"pointer"}}><X size={14}/>Reset</button>}
      </div>
      {showFilter&&<div style={{background:T.primaryPale,border:`1.5px solid ${T.primarySoft}`,borderRadius:12,padding:"16px 18px",marginBottom:16}}>
        <div style={{...GF,fontSize:12,fontWeight:800,color:T.primaryDk,marginBottom:12}}>Filter Lanjutan</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
          <div><FLabel>Status</FLabel><Sel value={fStatus} onChange={e=>setFStatus(e.target.value)}><option>Semua</option><option value="yatim">Yatim</option><option value="yatim piatu">Yatim Piatu</option><option value="dhuafa">Dhuafa</option></Sel></div>
          <div><FLabel>Jenjang</FLabel><Sel value={fKelas} onChange={e=>setFKelas(e.target.value)}><option>Semua</option>{kelasOpts.map(k=><option key={k}>{k}</option>)}</Sel></div>
          <div><FLabel>Wilayah</FLabel><Sel value={fWilayah} onChange={e=>setFWilayah(e.target.value)}><option>Semua</option>{wilayahOpts.map(w=><option key={w}>{w}</option>)}</Sel></div>
          <div><FLabel>Asnaf</FLabel><Sel value={fAsnaf} onChange={e=>setFAsnaf(e.target.value)}><option>Semua</option><option value="Miskin">Miskin</option><option value="Fakir">Fakir</option></Sel></div>
          <div><FLabel>Kehadiran</FLabel><Sel value={fHadir} onChange={e=>setFHadir(e.target.value)}><option>Semua</option><option value=">=80">Baik (80%+)</option><option value="60-79">Cukup (60-79%)</option><option value="<60">Kurang (&lt;60%)</option></Sel></div>
        </div>
      </div>}
      <div style={{...GF,fontSize:13,color:T.gray,marginBottom:10}}>Menampilkan <strong style={{color:T.charcoal}}>{filtered.length}</strong> dari <strong style={{color:T.charcoal}}>{anak.length}</strong> anak</div>

      {/* DESKTOP TABLE */}
      <div className="datagrid-desktop"><div style={{background:T.white,borderRadius:16,border:`1.5px solid ${T.primarySoft}`,overflow:"hidden"}}><div style={{overflowX:"auto"}}>
        <table style={{borderCollapse:"collapse",width:"100%",minWidth:1400}}>
          <thead><tr style={{background:T.primaryPale}}>
            {cols.map((c,ci)=><th key={c.key} style={{...GF,fontSize:11,fontWeight:800,color:T.primaryDk,textTransform:"uppercase",letterSpacing:.5,padding:"10px 12px",whiteSpace:"nowrap",textAlign:"left",position:c.sticky?"sticky":"static",left:c.sticky?c.left:"auto",background:T.primaryPale,zIndex:c.sticky?2:1,borderRight:c.sep?`2px solid ${T.primarySoft}`:"none",borderBottom:`1.5px solid ${T.primarySoft}`,minWidth:c.w}}>{c.label}</th>)}
          </tr></thead>
          <tbody>{filtered.map((a,i)=>{const rowBg=i%2===0?T.white:"#FDFAF8";return(
            <tr key={a.id} style={{background:rowBg,cursor:"pointer"}} onClick={()=>{setSelected(a);setTab("biodata");}} onMouseEnter={e=>e.currentTarget.style.background=T.primaryPale} onMouseLeave={e=>e.currentTarget.style.background=rowBg}>
              {cols.map((c,ci)=><td key={c.key} style={{...GF,fontSize:12,color:T.charcoal,padding:"10px 12px",whiteSpace:"nowrap",position:c.sticky?"sticky":"static",left:c.sticky?c.left:"auto",background:rowBg,zIndex:c.sticky?1:0,borderRight:c.sep?`2px solid ${T.primarySoft}`:"none",minWidth:c.w}} onClick={c.key==="aksi"?e=>e.stopPropagation():undefined}>{c.render(a,i)}</td>)}
            </tr>);})}
          </tbody>
        </table>
      </div></div></div>

      {/* MOBILE CARDS */}
      <div className="datagrid-mobile" style={{display:"none",flexDirection:"column",gap:10}}>
        {filtered.map((a,i)=>{
          const [sc,sb]=statusColor[a.status]||[T.gray,T.grayLt];
          const hadirS=pembinaan.filter(s=>s.kehadiran?.[a.id]==="hadir").length,pct=Math.round(hadirS/pembinaan.length*100);
          const haf=hafalan[a.id]||new Set(),totalHaf=ITEM_HAFALAN.filter(it=>haf.has(it.id)).length;
          return(
            <div key={a.id} onClick={()=>{setSelected(a);setTab("biodata");}} style={{background:T.white,border:`1.5px solid ${T.primarySoft}`,borderRadius:14,padding:"14px 16px",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=T.primaryPale} onMouseLeave={e=>e.currentTarget.style.background=T.white}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <span style={{...GF,fontSize:11,fontWeight:700,color:T.gray,minWidth:18}}>#{i+1}</span>
                <Avatar nama={a.nama} gender={a.kel} size={40}/>
                <div style={{flex:1}}><div style={{...GF,fontWeight:700,fontSize:14,color:T.charcoal}}>{a.nama}</div><div style={{...GF,fontSize:12,color:T.gray}}>{a.kelas} {a.tingkat} · {a.wilayah}</div></div>
                <Badge label={a.status} color={sc} bg={sb}/>
              </div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                <span style={{...GF,fontSize:12,color:T.gray}}>Hafalan: <strong style={{color:T.primary}}>{totalHaf}/{ITEM_HAFALAN.length}</strong></span>
                <span style={{...GF,fontSize:12,fontWeight:700,color:pct>=80?T.green:pct>=60?T.gold:T.red}}>Hadir {pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Generate Massal Modal */}
      {showGenModal&&<Modal title="Generate Massal Penilaian" onClose={()=>setShowGenModal(false)}>
        <p style={{...GF,color:T.charcoal,marginBottom:16}}>Generate penilaian otomatis untuk semua anak berdasarkan data kehadiran, hafalan, dan aspek mandiri yang sudah diinput.</p>
        <div style={{marginBottom:20}}><FLabel>Semester</FLabel><Sel value={genSem} onChange={e=>setGenSem(e.target.value)}><option value="25">Semester 25 (2026)</option><option value="24">Semester 24</option></Sel></div>
        <div style={{display:"flex",gap:10}}><Btn variant="primary" onClick={generateAll}><RefreshCw size={14}/> Generate {anak.length} Anak</Btn><Btn onClick={()=>setShowGenModal(false)}>Batal</Btn></div>
      </Modal>}
    </div>
  );
}

/* ── PIVOT TABLE COMPONENT ── */
const ASPEK_COLS_DEF=[
  {key:"c1",label:"Hafalan Quran",   grup:"cerdas"},{key:"c2",label:"Bacaan Shalat",grup:"cerdas"},
  {key:"c3",label:"Doa Pilihan",     grup:"cerdas"},{key:"c4",label:"Kemampuan Baca",grup:"cerdas"},
  {key:"m1",label:"Kehadiran",       grup:"mandiri"},{key:"m2",label:"Bantu Ortu",  grup:"mandiri"},
  {key:"m3",label:"Sedekah",         grup:"mandiri"},{key:"m4",label:"Shalat Wajib",grup:"mandiri"},
  {key:"m5",label:"Tilawah",         grup:"mandiri"},
];
function getNilaiDef(pen,key){if(!pen)return null;const c=pen.aspek_cerdas?.find(x=>x.id===key);if(c)return c.nilai;const m=pen.aspek_mandiri?.find(x=>x.id===key);return m?m.nilai:null;}
function PivotTable({filteredList,penilaian,semFilter,pivotFilters,setPF,setPivotFilters}){
  const pivotFiltered=filteredList.filter(a=>{
    const pen=penilaian[a.id+"_"+semFilter];
    return ASPEK_COLS_DEF.every(c=>{
      const f=pivotFilters[c.key];if(!f||f==="Semua")return true;
      const nilai=getNilaiDef(pen,c.key);
      return f==="Belum"?!nilai:nilai===f;
    });
  });
  const hasActiveFilter=Object.values(pivotFilters).some(v=>v&&v!=="Semua");
  return(
    <div style={{background:T.white,borderRadius:16,border:`1.5px solid ${T.primarySoft}`,overflow:"hidden"}}>
      <div style={{overflowX:"auto"}}>
        <table style={{borderCollapse:"collapse",width:"100%",minWidth:960}}>
          <thead>
            <tr style={{background:T.primaryPale}}>
              <th style={{...GF,fontSize:11,fontWeight:800,color:T.primaryDk,padding:"10px 12px",position:"sticky",left:0,background:T.primaryPale,zIndex:3,minWidth:36,borderBottom:`1px solid ${T.primarySoft}`,textAlign:"left"}}>#</th>
              <th style={{...GF,fontSize:11,fontWeight:800,color:T.primaryDk,padding:"10px 14px",position:"sticky",left:36,background:T.primaryPale,zIndex:3,minWidth:160,borderRight:`2px solid ${T.primarySoft}`,borderBottom:`1px solid ${T.primarySoft}`,textAlign:"left",whiteSpace:"nowrap"}}>Nama Anak</th>
              {ASPEK_COLS_DEF.map(c=><th key={c.key} style={{...GF,fontSize:10,fontWeight:800,color:c.grup==="cerdas"?T.primaryDk:T.brown,padding:"8px 8px 4px",textAlign:"center",whiteSpace:"nowrap",minWidth:110,borderBottom:`1px solid ${T.primarySoft}`,background:c.grup==="cerdas"?T.primaryPale:"#FDF0E0"}}>{c.label}</th>)}
            </tr>
            <tr>
              <th style={{padding:"4px 8px",position:"sticky",left:0,background:"#F8F4F0",zIndex:3,borderBottom:`1.5px solid ${T.primarySoft}`}}/>
              <th style={{padding:"4px 10px",position:"sticky",left:36,background:"#F8F4F0",zIndex:3,borderRight:`2px solid ${T.primarySoft}`,borderBottom:`1.5px solid ${T.primarySoft}`}}>
                <div style={{display:"flex",alignItems:"center",gap:5,background:T.grayLt,borderRadius:7,padding:"4px 8px"}}><Search size={11} color={T.gray}/><span style={{...GF,fontSize:11,color:T.gray}}>{filteredList.length} anak</span></div>
              </th>
              {ASPEK_COLS_DEF.map(c=>{
                const cur=pivotFilters[c.key]||"Semua";
                return(
                  <th key={c.key} style={{padding:"4px 6px",background:c.grup==="cerdas"?"#FFFBF7":"#FDF5EC",borderBottom:`1.5px solid ${T.primarySoft}`}}>
                    <select value={cur} onChange={e=>setPF(c.key,e.target.value)}
                      style={{...GF,fontSize:11,padding:"4px 6px",border:`1.5px solid ${cur!=="Semua"?T.primary:T.grayMd}`,borderRadius:6,background:cur!=="Semua"?T.primaryPale:T.white,color:cur!=="Semua"?T.primary:T.charcoal,width:"100%",outline:"none",fontWeight:cur!=="Semua"?700:400,cursor:"pointer"}}>
                      <option value="Semua">— Semua —</option>
                      <option value="Belum">Belum</option>
                      {NILAI_OPTIONS.map(n=><option key={n} value={n}>{n}</option>)}
                    </select>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pivotFiltered.map((a,i)=>{
              const pen=penilaian[a.id+"_"+semFilter];
              const rowBg=i%2===0?T.white:"#FDFAF8";
              return(
                <tr key={a.id} style={{background:rowBg}}>
                  <td style={{...GF,fontSize:12,color:T.gray,fontWeight:700,padding:"10px 12px",position:"sticky",left:0,background:rowBg,zIndex:1,textAlign:"center"}}>{i+1}</td>
                  <td style={{padding:"10px 14px",position:"sticky",left:36,background:rowBg,zIndex:1,borderRight:`2px solid ${T.primarySoft}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}><Avatar nama={a.nama} gender={a.kel} size={28}/><div><div style={{...GF,fontWeight:700,fontSize:12,color:T.charcoal}}>{a.nama}</div><div style={{...GF,fontSize:10,color:T.gray}}>{a.kelas} {a.tingkat}</div></div></div>
                  </td>
                  {ASPEK_COLS_DEF.map(c=>{
                    const nilai=getNilaiDef(pen,c.key);
                    const f=pivotFilters[c.key];
                    const isActive=f&&f!=="Semua";
                    const match=!isActive||(f==="Belum"?!nilai:nilai===f);
                    return(
                      <td key={c.key} style={{padding:"10px 8px",textAlign:"center",background:isActive?(match?"rgba(26,122,69,.07)":"rgba(176,32,32,.05)"):"transparent"}}>
                        {nilai?<NilaiBadge nilai={nilai}/>:<span style={{...GF,fontSize:14,color:T.grayMd,fontWeight:700}}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {pivotFiltered.length===0&&<tr><td colSpan={2+ASPEK_COLS_DEF.length} style={{textAlign:"center",padding:"36px",...GF,color:T.gray,fontSize:13}}>Tidak ada data yang cocok dengan filter kolom.</td></tr>}
          </tbody>
        </table>
        {hasActiveFilter&&<div style={{padding:"10px 16px",background:T.primaryPale,borderTop:`1px solid ${T.primarySoft}`,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <span style={{...GF,fontSize:12,color:T.primaryDk,fontWeight:700}}>Filter aktif:</span>
          {ASPEK_COLS_DEF.filter(c=>pivotFilters[c.key]&&pivotFilters[c.key]!=="Semua").map(c=>(
            <span key={c.key} style={{...GF,fontSize:12,background:T.white,border:`1px solid ${T.primarySoft}`,borderRadius:20,padding:"2px 10px 2px 12px",color:T.primary,fontWeight:700,display:"inline-flex",alignItems:"center",gap:6}}>
              {c.label}: <strong>{pivotFilters[c.key]}</strong>
              <button onClick={()=>setPF(c.key,"Semua")} style={{background:"none",border:"none",cursor:"pointer",color:T.gray,fontWeight:900,fontSize:14,lineHeight:1,padding:"0 2px"}}>×</button>
            </span>
          ))}
          <span style={{...GF,fontSize:12,color:T.green,fontWeight:700}}>{pivotFiltered.length} anak cocok</span>
          <button onClick={()=>setPivotFilters({})} style={{...GF,background:"none",border:"none",cursor:"pointer",color:T.red,fontWeight:700,fontSize:12,marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}><X size={13}/>Bersihkan Semua</button>
        </div>}
      </div>
    </div>
  );
}

/* ── PENILAIAN ── */
function Penilaian({penilaian,setPenilaian,anak,pembinaan,hafalan,mandiriData}){
  const [view,setView]=useState("list"); // list | detail | edit
  const [selPen,setSelPen]=useState(null);
  const [semFilter,setSemFilter]=useState("25");
  const [tab,setTab]=useState("list"); // list | pivot
  const [editForm,setEditForm]=useState(null);
  const [showGenModal,setShowGenModal]=useState(false);
  const [genSem,setGenSem]=useState("25");
  /* advanced filter */
  const [showFilter,setShowFilter]=useState(false);
  const [fQ,setFQ]=useState("");
  const [fNilaiC,setFNilaiC]=useState("Semua");
  const [fNilaiM,setFNilaiM]=useState("Semua");
  const [fWilayah,setFWilayah]=useState("Semua");
  const [fKelas,setFKelas]=useState("Semua");
  const [fHadir,setFHadir]=useState("Semua");
  const wilayahOpts=[...new Set(anak.map(a=>a.wilayah))];
  const kelasOpts=[...new Set(anak.map(a=>a.kelas))];
  const activeF=[fNilaiC!=="Semua",fNilaiM!=="Semua",fWilayah!=="Semua",fKelas!=="Semua",fHadir!=="Semua"].filter(Boolean).length;
  const clearF=()=>{setFQ("");setFNilaiC("Semua");setFNilaiM("Semua");setFWilayah("Semua");setFKelas("Semua");setFHadir("Semua");};

  const [pivotFilters,setPivotFilters]=useState({});
  const setPF=(key,val)=>setPivotFilters(p=>({...p,[key]:val}));

  const anakMap=Object.fromEntries(anak.map(a=>[a.id,a]));

  const filteredList=useMemo(()=>{
    return anak.filter(a=>{
      const pen=penilaian[a.id+"_"+semFilter];
      if(fQ&&!a.nama.toLowerCase().includes(fQ.toLowerCase()))return false;
      if(fWilayah!=="Semua"&&a.wilayah!==fWilayah)return false;
      if(fKelas!=="Semua"&&a.kelas!==fKelas)return false;
      if(fNilaiC!=="Semua"&&pen?.aspek_cerdas[0]?.nilai!==fNilaiC)return false;
      if(fNilaiM!=="Semua"&&pen?.aspek_mandiri[0]?.nilai!==fNilaiM)return false;
      if(fHadir!=="Semua"){const sesiSem=pembinaan.filter(s=>s.semester===semFilter);const h=sesiSem.filter(s=>s.kehadiran?.[a.id]==="hadir").length;const pct=sesiSem.length?h/sesiSem.length*100:0;if(fHadir===">=80"&&pct<80)return false;if(fHadir==="60-79"&&(pct<60||pct>=80))return false;if(fHadir==="<60"&&pct>=60)return false;}
      return true;
    });
  },[anak,penilaian,semFilter,fQ,fNilaiC,fNilaiM,fWilayah,fKelas,fHadir,pembinaan]);

  function doSync(anakId,semester){
    const gen=syncPenilaian(anakId,semester,pembinaan,hafalan,mandiriData);
    setPenilaian(p=>({...p,[anakId+"_"+semester]:gen}));
    return gen;
  }
  function syncAll(){
    const updates={};
    anak.forEach(a=>{updates[a.id+"_"+semFilter]=syncPenilaian(a.id,semFilter,pembinaan,hafalan,mandiriData);});
    setPenilaian(p=>({...p,...updates}));
  }
  function generateMassal(){
    const updates={};
    anak.forEach(a=>{if(!penilaian[a.id+"_"+genSem])updates[a.id+"_"+genSem]=syncPenilaian(a.id,genSem,pembinaan,hafalan,mandiriData);});
    setPenilaian(p=>({...p,...updates}));
    setShowGenModal(false);
  }
  function openDetail(pen){setSelPen(pen);setView("detail");}
  function openEdit(pen){setEditForm(JSON.parse(JSON.stringify(pen)));setView("edit");}
  function saveEdit(){if(!editForm)return;setPenilaian(p=>({...p,[editForm.anakId+"_"+editForm.semester]:editForm}));setSelPen(editForm);setView("detail");}
  function deletePen(key){setPenilaian(p=>{const n={...p};delete n[key];return n;});setView("list");}
  function updCerdas(idx,f,v){setEditForm(p=>{const arr=[...p.aspek_cerdas];arr[idx]={...arr[idx],[f]:v};return{...p,aspek_cerdas:arr};});}
  function updMandiri(idx,f,v){setEditForm(p=>{const arr=[...p.aspek_mandiri];arr[idx]={...arr[idx],[f]:v};return{...p,aspek_mandiri:arr};});}

  /* EDIT VIEW */
  if(view==="edit"&&editForm){
    const a=anakMap[editForm.anakId];
    return(
      <div>
        <button onClick={()=>setView("detail")} style={{...GF,background:"none",border:"none",color:T.primary,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:6}}><ArrowLeft size={16}/> Kembali</button>
        <h1 style={{...GF,fontSize:20,fontWeight:800,color:T.charcoal,margin:"0 0 16px"}}>Edit Penilaian — {a?.nama} Sem. {editForm.semester}</h1>
        <Card style={{marginBottom:14}}><CardHead icon={BookOpen} title="Aspek Cerdas"/>
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}><thead><tr style={{background:T.primaryPale}}>{["No","Aspek","Target","Kondisi Awal","Perkembangan","Nilai"].map(h=><th key={h} style={{...GF,fontSize:11,fontWeight:800,color:T.primaryDk,padding:"10px 14px",textAlign:"left",whiteSpace:"nowrap",borderBottom:`1.5px solid ${T.primarySoft}`}}>{h}</th>)}</tr></thead>
          <tbody>{editForm.aspek_cerdas.map((item,i)=>(
            <tr key={item.id} style={{background:i%2===0?T.white:"#FDFAF8"}}>
              <td style={{...GF,fontSize:12,color:T.gray,padding:"10px 14px",fontWeight:700}}>{i+1}</td>
              <td style={{...GF,fontSize:13,color:T.charcoal,padding:"10px 14px",whiteSpace:"nowrap"}}>{item.nama}</td>
              <td style={{padding:"10px 14px",minWidth:140}}><Input value={item.target} onChange={e=>updCerdas(i,"target",e.target.value)}/></td>
              <td style={{padding:"10px 14px",minWidth:140}}><Input value={item.kondisi_awal} onChange={e=>updCerdas(i,"kondisi_awal",e.target.value)}/></td>
              <td style={{padding:"10px 14px",minWidth:160}}><Input value={item.perkembangan} onChange={e=>updCerdas(i,"perkembangan",e.target.value)}/></td>
              <td style={{padding:"10px 14px",minWidth:140}}><Sel value={item.nilai} onChange={e=>updCerdas(i,"nilai",e.target.value)}>{NILAI_OPTIONS.map(n=><option key={n}>{n}</option>)}</Sel></td>
            </tr>
          ))}</tbody></table></div>
        </Card>
        <Card style={{marginBottom:14}}><CardHead icon={Heart} title="Aspek Mandiri"/>
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}><thead><tr style={{background:T.primaryPale}}>{["No","Aspek","Target","Capaian","Nilai"].map(h=><th key={h} style={{...GF,fontSize:11,fontWeight:800,color:T.primaryDk,padding:"10px 14px",textAlign:"left",whiteSpace:"nowrap",borderBottom:`1.5px solid ${T.primarySoft}`}}>{h}</th>)}</tr></thead>
          <tbody>{editForm.aspek_mandiri.map((item,i)=>(
            <tr key={item.id} style={{background:i%2===0?T.white:"#FDFAF8"}}>
              <td style={{...GF,fontSize:12,color:T.gray,padding:"10px 14px",fontWeight:700}}>{i+1}</td>
              <td style={{...GF,fontSize:13,color:T.charcoal,padding:"10px 14px",whiteSpace:"nowrap"}}>{item.nama}</td>
              <td style={{padding:"10px 14px",minWidth:100}}><Input value={item.target} onChange={e=>updMandiri(i,"target",e.target.value)}/></td>
              <td style={{padding:"10px 14px",minWidth:80}}><Input value={item.capaian} onChange={e=>updMandiri(i,"capaian",e.target.value)}/></td>
              <td style={{padding:"10px 14px",minWidth:140}}><Sel value={item.nilai} onChange={e=>updMandiri(i,"nilai",e.target.value)}>{NILAI_OPTIONS.map(n=><option key={n}>{n}</option>)}</Sel></td>
            </tr>
          ))}</tbody></table></div>
        </Card>
        <Card style={{marginBottom:14,padding:"18px 20px"}}>
          <FLabel>Catatan Pembina</FLabel><Textarea value={editForm.catatan} onChange={e=>setEditForm(p=>({...p,catatan:e.target.value}))} placeholder="Catatan perkembangan..."/>
          <div style={{marginTop:12}}><FLabel>Suara Anak Juara</FLabel><Textarea value={editForm.suara_anak} onChange={e=>setEditForm(p=>({...p,suara_anak:e.target.value}))} placeholder="Aspirasi anak..."/></div>
        </Card>
        <div style={{display:"flex",gap:10}}><Btn variant="primary" onClick={saveEdit}><Save size={15}/> Simpan</Btn><Btn onClick={()=>setView("detail")}>Batal</Btn></div>
      </div>
    );
  }

  /* DETAIL VIEW */
  if(view==="detail"&&selPen){
    const a=anakMap[selPen.anakId];
    const key=selPen.anakId+"_"+selPen.semester;
    const penNow=penilaian[key]||selPen;
    return(
      <div>
        <button onClick={()=>setView("list")} style={{...GF,background:"none",border:"none",color:T.primary,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:6}}><ArrowLeft size={16}/> Kembali</button>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16,flexWrap:"wrap"}}>
          {a&&<Avatar nama={a.nama} gender={a.kel} size={44}/>}
          <div style={{flex:1}}><div style={{...GF,fontWeight:800,fontSize:18,color:T.charcoal}}>{a?.nama}</div><div style={{...GF,fontSize:13,color:T.gray}}>Semester {penNow.semester} · Sync: {penNow.tgl_sync||"belum"}</div></div>
          <div style={{display:"flex",gap:8}}>
            <Btn size="sm" onClick={()=>{const g=doSync(selPen.anakId,selPen.semester);setSelPen(g);}}><RefreshCw size={13}/> Sync</Btn>
            <Btn size="sm" onClick={()=>openEdit(penNow)}><Edit2 size={13}/> Edit</Btn>
            <Btn size="sm" variant="danger" onClick={()=>deletePen(key)}><Trash2 size={13}/> Hapus</Btn>
          </div>
        </div>
        <LaporanCard pen={penNow}/>
      </div>
    );
  }

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div><h1 style={{...GF,fontSize:23,fontWeight:800,color:T.charcoal,margin:0}}>Penilaian</h1><p style={{...GF,color:T.gray,fontSize:14,margin:"4px 0 0"}}>Daftar laporan penilaian per anak per semester</p></div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <Sel value={semFilter} onChange={e=>setSemFilter(e.target.value)}><option value="25">Semester 25</option><option value="24">Semester 24</option></Sel>
          <Btn size="sm" onClick={()=>setShowGenModal(true)}><RefreshCw size={13}/> Generate Massal</Btn>
          <Btn size="sm" onClick={syncAll}><RefreshCw size={13}/> Sync Semua</Btn>
        </div>
      </div>
      {/* Search + filter */}
      <div style={{display:"flex",gap:8,marginBottom:showFilter?0:12,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:200,background:T.white,border:`1.5px solid ${T.primarySoft}`,borderRadius:10,padding:"8px 13px"}}>
          <Search size={15} color={T.gray}/><input value={fQ} onChange={e=>setFQ(e.target.value)} placeholder="Cari nama anak..." style={{...GF,border:"none",background:"none",fontSize:13,color:T.charcoal,flex:1,outline:"none"}}/>
          {fQ&&<button onClick={()=>setFQ("")} style={{background:"none",border:"none",cursor:"pointer"}}><X size={13} color={T.gray}/></button>}
        </div>
        <button onClick={()=>setShowFilter(v=>!v)} style={{...GF,display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,background:showFilter||activeF>0?T.primaryPale:T.white,border:`1.5px solid ${T.primarySoft}`,color:T.primary,fontWeight:700,fontSize:13,cursor:"pointer"}}>
          <SlidersHorizontal size={15}/>Filter{activeF>0&&<span style={{background:T.primary,color:T.white,borderRadius:10,fontSize:11,padding:"0 6px",fontWeight:800}}>{activeF}</span>}
        </button>
        {activeF>0&&<button onClick={clearF} style={{...GF,display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:10,background:T.redPale,border:"none",color:T.red,fontWeight:700,fontSize:13,cursor:"pointer"}}><X size={14}/>Reset</button>}
      </div>
      {showFilter&&<div style={{background:T.primaryPale,border:`1.5px solid ${T.primarySoft}`,borderRadius:12,padding:"14px 18px",marginBottom:14}}>
        <div style={{...GF,fontSize:12,fontWeight:800,color:T.primaryDk,marginBottom:10}}>Filter Lanjutan</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>
          <div><FLabel>Nilai Aspek Cerdas</FLabel><Sel value={fNilaiC} onChange={e=>setFNilaiC(e.target.value)}><option>Semua</option>{NILAI_OPTIONS.map(n=><option key={n}>{n}</option>)}</Sel></div>
          <div><FLabel>Nilai Aspek Mandiri</FLabel><Sel value={fNilaiM} onChange={e=>setFNilaiM(e.target.value)}><option>Semua</option>{NILAI_OPTIONS.map(n=><option key={n}>{n}</option>)}</Sel></div>
          <div><FLabel>Wilayah</FLabel><Sel value={fWilayah} onChange={e=>setFWilayah(e.target.value)}><option>Semua</option>{wilayahOpts.map(w=><option key={w}>{w}</option>)}</Sel></div>
          <div><FLabel>Jenjang</FLabel><Sel value={fKelas} onChange={e=>setFKelas(e.target.value)}><option>Semua</option>{kelasOpts.map(k=><option key={k}>{k}</option>)}</Sel></div>
          <div><FLabel>Kehadiran</FLabel><Sel value={fHadir} onChange={e=>setFHadir(e.target.value)}><option>Semua</option><option value=">=80">Baik (80%+)</option><option value="60-79">Cukup (60-79%)</option><option value="<60">Kurang (&lt;60%)</option></Sel></div>
        </div>
      </div>}
      <div style={{...GF,fontSize:13,color:T.gray,marginBottom:10}}>Menampilkan <strong style={{color:T.charcoal}}>{filteredList.length}</strong> anak · Semester {semFilter}</div>

      <TabBar tabs={[{id:"list",label:"Daftar Penilaian"},{id:"pivot",label:"Pivot Aspek"}]} active={tab} onChange={setTab}/>

      {/* ── LIST TAB: table desktop, cards mobile ── */}
      {tab==="list"&&<>
        {/* DESKTOP TABLE */}
        <div className="datagrid-desktop">
          <div style={{background:T.white,borderRadius:16,border:`1.5px solid ${T.primarySoft}`,overflow:"hidden"}}>
            <div style={{overflowX:"auto"}}>
              <table style={{borderCollapse:"collapse",width:"100%",minWidth:900}}>
                <thead><tr style={{background:T.primaryPale}}>
                  {["#","Nama","Kelas","Wilayah","Status Data","Hadir","Cerdas","Mandiri","Sync","Aksi"].map((h,i)=>(
                    <th key={h} style={{...GF,fontSize:11,fontWeight:800,color:T.primaryDk,textTransform:"uppercase",letterSpacing:.5,padding:"10px 14px",whiteSpace:"nowrap",textAlign:"left",
                      position:i<2?"sticky":"static",left:i===0?0:i===1?40:"auto",
                      background:T.primaryPale,zIndex:i<2?2:1,
                      borderRight:i===1?`2px solid ${T.primarySoft}`:"none",
                      borderBottom:`1.5px solid ${T.primarySoft}`}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filteredList.map((a,i)=>{
                    const key=a.id+"_"+semFilter;
                    const pen=penilaian[key];
                    const sesiSem=pembinaan.filter(s=>s.semester===semFilter);
                    const jmlHadir=sesiSem.filter(s=>s.kehadiran?.[a.id]==="hadir").length;
                    const pct=sesiSem.length?Math.round(jmlHadir/sesiSem.length*100):0;
                    const rowBg=i%2===0?T.white:"#FDFAF8";
                    return(
                      <tr key={a.id} style={{background:rowBg}}>
                        <td style={{...GF,fontSize:12,color:T.gray,fontWeight:700,padding:"10px 14px",position:"sticky",left:0,background:rowBg,zIndex:1,textAlign:"center",whiteSpace:"nowrap"}}>{i+1}</td>
                        <td style={{padding:"10px 14px",position:"sticky",left:40,background:rowBg,zIndex:1,borderRight:`2px solid ${T.primarySoft}`,minWidth:160}}>
                          <div style={{display:"flex",alignItems:"center",gap:9}}>
                            <Avatar nama={a.nama} gender={a.kel} size={30}/>
                            <div><div style={{...GF,fontWeight:700,fontSize:13,color:T.charcoal}}>{a.nama}</div><div style={{...GF,fontSize:11,color:T.gray}}>{a.nick}</div></div>
                          </div>
                        </td>
                        <td style={{...GF,fontSize:12,color:T.charcoal,padding:"10px 14px",whiteSpace:"nowrap"}}>{a.kelas} {a.tingkat}</td>
                        <td style={{...GF,fontSize:12,color:T.charcoal,padding:"10px 14px",whiteSpace:"nowrap"}}>{a.wilayah}</td>
                        <td style={{padding:"10px 14px",whiteSpace:"nowrap"}}>
                          {pen
                            ?<span style={{...GF,fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,background:T.greenPale,color:T.green}}>Ada</span>
                            :<span style={{...GF,fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,background:T.grayLt,color:T.gray}}>Belum</span>}
                        </td>
                        <td style={{...GF,fontSize:12,padding:"10px 14px",whiteSpace:"nowrap"}}>
                          <span style={{fontWeight:700,color:pct>=80?T.green:pct>=60?T.gold:T.red}}>{jmlHadir}/{sesiSem.length}</span>
                          <span style={{color:T.gray,marginLeft:4}}>({pct}%)</span>
                        </td>
                        <td style={{padding:"10px 14px",whiteSpace:"nowrap"}}>{pen?<NilaiBadge nilai={pen.aspek_cerdas[0]?.nilai}/>:<span style={{...GF,fontSize:11,color:T.grayMd}}>—</span>}</td>
                        <td style={{padding:"10px 14px",whiteSpace:"nowrap"}}>{pen?<NilaiBadge nilai={pen.aspek_mandiri[0]?.nilai}/>:<span style={{...GF,fontSize:11,color:T.grayMd}}>—</span>}</td>
                        <td style={{...GF,fontSize:11,color:T.gray,padding:"10px 14px",whiteSpace:"nowrap"}}>{pen?.tgl_sync||"—"}</td>
                        <td style={{padding:"10px 14px",whiteSpace:"nowrap"}}>
                          <div style={{display:"flex",gap:5}}>
                            {pen&&<>
                              <button onClick={()=>openDetail(pen)} style={{...GF,background:T.primaryPale,border:"none",borderRadius:6,fontSize:11,fontWeight:700,padding:"4px 9px",cursor:"pointer",color:T.primaryDk,display:"flex",alignItems:"center",gap:3}}><Eye size={11}/>Detail</button>
                              <button onClick={()=>openEdit(pen)} style={{...GF,background:T.grayLt,border:"none",borderRadius:6,fontSize:11,fontWeight:700,padding:"4px 9px",cursor:"pointer",color:T.brown,display:"flex",alignItems:"center",gap:3}}><Edit2 size={11}/>Edit</button>
                            </>}
                            <button onClick={()=>doSync(a.id,semFilter)} style={{...GF,background:T.bluePale,border:"none",borderRadius:6,fontSize:11,fontWeight:700,padding:"4px 9px",cursor:"pointer",color:T.blue,display:"flex",alignItems:"center",gap:3}}><RefreshCw size={11}/>Sync</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* MOBILE CARDS */}
        <div className="datagrid-mobile" style={{display:"none",flexDirection:"column",gap:10}}>
          {filteredList.map((a,i)=>{
            const key=a.id+"_"+semFilter;
            const pen=penilaian[key];
            const sesiSem=pembinaan.filter(s=>s.semester===semFilter);
            const jmlHadir=sesiSem.filter(s=>s.kehadiran?.[a.id]==="hadir").length;
            const pct=sesiSem.length?Math.round(jmlHadir/sesiSem.length*100):0;
            return(
              <div key={a.id} style={{background:T.white,border:`1.5px solid ${pen?T.primarySoft:T.grayMd}`,borderRadius:14,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <span style={{...GF,fontSize:11,fontWeight:700,color:T.gray}}>#{i+1}</span>
                  <Avatar nama={a.nama} gender={a.kel} size={36}/>
                  <div style={{flex:1}}><div style={{...GF,fontWeight:700,fontSize:14,color:T.charcoal}}>{a.nama}</div><div style={{...GF,fontSize:12,color:T.gray}}>{a.kelas} {a.tingkat} · {a.wilayah}</div></div>
                  {pen?<span style={{...GF,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,background:T.greenPale,color:T.green}}>Ada</span>:<span style={{...GF,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20,background:T.grayLt,color:T.gray}}>Belum</span>}
                </div>
                {pen&&<div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap"}}>
                  <span style={{...GF,fontSize:12,color:T.gray}}>Hadir: <strong style={{color:pct>=80?T.green:T.red}}>{jmlHadir}/{sesiSem.length}</strong></span>
                  <NilaiBadge nilai={pen.aspek_cerdas[0]?.nilai}/>
                  <NilaiBadge nilai={pen.aspek_mandiri[0]?.nilai}/>
                </div>}
                <div style={{display:"flex",gap:6}}>
                  {pen&&<><Btn size="sm" onClick={()=>openDetail(pen)}><Eye size={12}/> Detail</Btn><Btn size="sm" onClick={()=>openEdit(pen)}><Edit2 size={12}/> Edit</Btn></>}
                  <Btn size="sm" onClick={()=>doSync(a.id,semFilter)}><RefreshCw size={12}/> Sync</Btn>
                </div>
              </div>
            );
          })}
        </div>
      </>}

      {/* ── PIVOT TAB ── */}
      {tab==="pivot"&&<PivotTable filteredList={filteredList} penilaian={penilaian} semFilter={semFilter} pivotFilters={pivotFilters} setPF={setPF} setPivotFilters={setPivotFilters}/>}

      {showGenModal&&<Modal title="Generate Massal Penilaian" onClose={()=>setShowGenModal(false)}>
        <p style={{...GF,color:T.charcoal,marginBottom:4}}>Generate penilaian otomatis untuk anak yang <strong>belum punya data</strong> pada semester yang dipilih.</p>
        <p style={{...GF,fontSize:13,color:T.gray,marginBottom:16}}>Data yang sudah ada tidak akan ditimpa. Gunakan "Sync Semua" untuk refresh data yang sudah ada.</p>
        <div style={{marginBottom:20}}><FLabel>Semester</FLabel><Sel value={genSem} onChange={e=>setGenSem(e.target.value)}><option value="25">Semester 25 (2026)</option><option value="24">Semester 24</option></Sel></div>
        <div style={{display:"flex",gap:10}}><Btn variant="primary" onClick={generateMassal}><RefreshCw size={14}/> Generate {anak.filter(a=>!penilaian[a.id+"_"+genSem]).length} Anak (Belum Ada)</Btn><Btn onClick={()=>setShowGenModal(false)}>Batal</Btn></div>
      </Modal>}
    </div>
  );
}

/* ── PEMBINAAN ── */
function Pembinaan({pembinaan,setPembinaan,mandiriData,setMandiriData}){
  const [view,setView]=useState("list");
  const [selected,setSelected]=useState(null);
  const [delConfirm,setDelConfirm]=useState(null);
  const [showFilter,setShowFilter]=useState(false);
  const [fTeks,setFTeks]=useState(""),[fJenis,setFJenis]=useState("Semua"),[fSemester,setFSemester]=useState("Semua");
  const [fPemateri,setFPemateri]=useState("Semua"),[fLokasi,setFLokasi]=useState("Semua");
  const [fTglFrom,setFTglFrom]=useState(""),[fTglTo,setFTglTo]=useState(""),[fHadir,setFHadir]=useState("Semua");
  const jenisOpts=["Kajian Islam","Hafalan Al-Quran","Pembiasaan","Evaluasi"];
  const pemateriOpts=[...new Set(pembinaan.map(s=>s.pemateri))];
  const lokasiOpts=[...new Set(pembinaan.map(s=>s.lokasi))];
  const activeFilters=[fJenis!=="Semua",fSemester!=="Semua",fPemateri!=="Semua",fLokasi!=="Semua",fTglFrom,fTglTo,fHadir!=="Semua"].filter(Boolean).length;
  const filtered=useMemo(()=>pembinaan.filter(s=>{
    const t=fTeks.toLowerCase();
    if(t&&!s.tema.toLowerCase().includes(t)&&!s.pemateri.toLowerCase().includes(t)&&!s.lokasi.toLowerCase().includes(t)&&!s.pertemuan.toLowerCase().includes(t))return false;
    if(fJenis!=="Semua"&&s.jenis!==fJenis)return false;
    if(fSemester!=="Semua"&&s.semester!==fSemester)return false;
    if(fPemateri!=="Semua"&&s.pemateri!==fPemateri)return false;
    if(fLokasi!=="Semua"&&s.lokasi!==fLokasi)return false;
    if(fTglFrom&&s.tgl<fTglFrom)return false;
    if(fTglTo&&s.tgl>fTglTo)return false;
    const pct=s.jumlah_hadir/ANAK_INIT.length*100;
    if(fHadir===">=80"&&pct<80)return false;
    if(fHadir==="60-79"&&(pct<60||pct>=80))return false;
    if(fHadir==="<60"&&pct>=60)return false;
    return true;
  }).sort((a,b)=>b.tgl.localeCompare(a.tgl)),[pembinaan,fTeks,fJenis,fSemester,fPemateri,fLokasi,fTglFrom,fTglTo,fHadir]);
  const clearFilters=()=>{setFTeks("");setFJenis("Semua");setFSemester("Semua");setFPemateri("Semua");setFLokasi("Semua");setFTglFrom("");setFTglTo("");setFHadir("Semua");};
  const emptyForm={tgl:"",jenis:"Kajian Islam",tema:"",pemateri:"",lokasi:"",waktu:"",semester:"25",catatan:"",kehadiran:{}};
  const [form,setForm]=useState(emptyForm);
  const [formMandiri,setFormMandiri]=useState({});
  const [isEdit,setIsEdit]=useState(false);
  const setKh=(id,val)=>setForm(p=>({...p,kehadiran:{...p.kehadiran,[id]:val}}));
  const toggleMandiri=(anakId,field)=>setFormMandiri(p=>({...p,[anakId]:{...p[anakId],[field]:!(p[anakId]?.[field]||false)}}));
  const setAllHadir=()=>{const k={};ANAK_INIT.forEach(a=>k[a.id]="hadir");setForm(p=>({...p,kehadiran:k}));};
  const openNew=()=>{setForm({...emptyForm,pertemuan:`Pertemuan ke-${pembinaan.length+1}`});setFormMandiri({});setIsEdit(false);setView("form");};
  const openEdit=s=>{setForm({...s});setFormMandiri(JSON.parse(JSON.stringify(mandiriData[s.id]||{})));setIsEdit(true);setView("form");};
  const openDetail=s=>{setSelected(s);setView("detail");};
  function saveForm(){
    if(!form.tgl||!form.tema||!form.pemateri||!form.lokasi){alert("Isi field wajib.");return;}
    const kh=form.kehadiran||{};
    const sesiId=isEdit?form.id:"PB-"+String(pembinaan.length+1).padStart(3,"0");
    const data={...form,id:sesiId,jumlah_hadir:ANAK_INIT.filter(a=>kh[a.id]==="hadir").length,jumlah_izin:ANAK_INIT.filter(a=>kh[a.id]==="izin").length,jumlah_alfa:ANAK_INIT.filter(a=>kh[a.id]==="alfa").length};
    if(isEdit)setPembinaan(p=>p.map(s=>s.id===form.id?data:s));else setPembinaan(p=>[data,...p]);
    setMandiriData(p=>({...p,[sesiId]:formMandiri}));
    setView("list");
  }
  const delSession=id=>{setPembinaan(p=>p.filter(s=>s.id!==id));setMandiriData(p=>{const n={...p};delete n[id];return n;});setDelConfirm(null);setView("list");};

  if(view==="detail"&&selected){
    const kh=selected.kehadiran||{},mandiri=mandiriData[selected.id]||{};
    const JIcon=jenisIconMap[selected.jenis]||ClipboardList;
    return(
      <div>
        <button onClick={()=>setView("list")} style={{...GF,background:"none",border:"none",color:T.primary,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:6}}><ArrowLeft size={16}/> Kembali</button>
        <div style={{background:`linear-gradient(135deg,${T.primary},${T.primaryLt})`,borderRadius:16,padding:"20px 22px",color:T.white,marginBottom:18}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:14,flexWrap:"wrap"}}>
            <div style={{width:48,height:48,borderRadius:12,background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><JIcon size={24} color={T.white}/></div>
            <div style={{flex:1}}><div style={{...GF,fontWeight:800,fontSize:18}}>{selected.tema}</div><div style={{...GF,fontSize:13,opacity:.9,marginTop:3}}>{selected.pertemuan} · {fmtTgl(selected.tgl)} · Sem. {selected.semester}</div><div style={{display:"flex",gap:16,marginTop:8,flexWrap:"wrap"}}><span style={{...GF,fontSize:12,opacity:.9,display:"flex",alignItems:"center",gap:5}}><Users size={13}/>{selected.pemateri}</span><span style={{...GF,fontSize:12,opacity:.9,display:"flex",alignItems:"center",gap:5}}><MapPin size={13}/>{selected.lokasi}</span><span style={{...GF,fontSize:12,opacity:.9,display:"flex",alignItems:"center",gap:5}}><Clock size={13}/>{selected.waktu}</span></div></div>
            <button onClick={()=>openEdit(selected)} style={{...GF,background:"rgba(255,255,255,.2)",border:"none",borderRadius:8,color:T.white,fontWeight:700,fontSize:13,padding:"7px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><Edit2 size={14}/> Edit</button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>{[[T.green,T.greenPale,CheckCircle,"Hadir",selected.jumlah_hadir],[T.gold,T.goldPale,MinusCircle,"Izin",selected.jumlah_izin],[T.red,T.redPale,AlertCircle,"Alfa",selected.jumlah_alfa]].map(([c,bg,Ic,lbl,val])=><div key={lbl} style={{background:bg,borderRadius:12,padding:"14px 16px",textAlign:"center"}}><Ic size={20} color={c} style={{display:"block",margin:"0 auto 4px"}}/><div style={{...GF,fontSize:26,fontWeight:800,color:c,lineHeight:1}}>{val}</div><div style={{...GF,fontSize:13,fontWeight:700,color:c,marginTop:2}}>{lbl}</div></div>)}</div>
        <Card style={{marginBottom:14}}><CardHead icon={Users} title="Kehadiran & Aspek Mandiri"/>
          <div style={{display:"grid",gridTemplateColumns:"28px 1fr 60px 80px 80px 80px 80px",gap:0,padding:"8px 16px",background:T.primaryPale,borderBottom:`1px solid ${T.primarySoft}`}}>{["#","Nama","Hadir","Bantu Ortu","Sedekah","Shalat","Tilawah"].map((h,i)=><div key={i} style={{...GF,fontSize:10,fontWeight:800,color:T.primaryDk,textTransform:"uppercase",letterSpacing:.4,padding:"0 4px"}}>{h}</div>)}</div>
          {ANAK_INIT.map((a,i)=>{const st=kh[a.id]||"alfa",[sc,sb]=hadirColor[st];const HIcon=st==="hadir"?CheckCircle:st==="izin"?MinusCircle:AlertCircle;const m=mandiri[a.id]||{};return(
            <div key={a.id} style={{display:"grid",gridTemplateColumns:"28px 1fr 60px 80px 80px 80px 80px",gap:0,padding:"9px 16px",borderBottom:i<ANAK_INIT.length-1?`1px solid ${T.grayLt}`:"none",alignItems:"center"}}>
              <span style={{...GF,fontSize:11,fontWeight:700,color:T.gray,textAlign:"center"}}>{i+1}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}><Avatar nama={a.nama} gender={a.kel} size={28}/><div><div style={{...GF,fontWeight:700,fontSize:12,color:T.charcoal}}>{a.nick}</div><div style={{...GF,fontSize:10,color:T.gray}}>{a.kelas} {a.tingkat}</div></div></div>
              <div style={{display:"flex",alignItems:"center",gap:4,padding:"0 4px"}}><HIcon size={14} color={sc}/><span style={{...GF,fontSize:11,fontWeight:700,color:sc}}>{st==="hadir"?"H":st==="izin"?"I":"A"}</span></div>
              {MANDIRI_FIELDS.map(f=><div key={f.id} style={{padding:"0 16px"}}>{m[f.id]?<CheckCircle size={16} color={T.green}/>:<div style={{width:16,height:16,borderRadius:4,border:`2px solid ${T.grayMd}`,display:"inline-block"}}/>}</div>)}
            </div>);})}
        </Card>
        {selected.catatan&&<Card><CardHead icon={ClipboardList} title="Catatan"/><div style={{padding:"12px 18px",...GF,fontSize:14,color:T.charcoal,lineHeight:1.7}}>{selected.catatan}</div></Card>}
      </div>
    );
  }

  if(view==="form") return(
    <div>
      <button onClick={()=>setView("list")} style={{...GF,background:"none",border:"none",color:T.primary,fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:16,display:"flex",alignItems:"center",gap:6}}><ArrowLeft size={16}/> Kembali</button>
      <h1 style={{...GF,fontSize:22,fontWeight:800,color:T.charcoal,margin:"0 0 18px"}}>{isEdit?"Edit Sesi":"Tambah Sesi Pembinaan"}</h1>
      <Card style={{marginBottom:14}}><CardHead icon={ClipboardList} title="Informasi Sesi"/>
        <div style={{padding:"18px 20px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,marginBottom:14}}>
            <div><FLabel>Tanggal *</FLabel><Input type="date" value={form.tgl} onChange={e=>setForm(p=>({...p,tgl:e.target.value}))}/></div>
            <div><FLabel>Pertemuan</FLabel><Input value={form.pertemuan||""} onChange={e=>setForm(p=>({...p,pertemuan:e.target.value}))} placeholder="Pertemuan ke-..."/></div>
            <div><FLabel>Jenis *</FLabel><Sel value={form.jenis} onChange={e=>setForm(p=>({...p,jenis:e.target.value}))}>{jenisOpts.map(j=><option key={j}>{j}</option>)}</Sel></div>
            <div><FLabel>Semester</FLabel><Sel value={form.semester} onChange={e=>setForm(p=>({...p,semester:e.target.value}))}><option>25</option><option>24</option></Sel></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14,marginBottom:14}}>
            <div style={{gridColumn:"1/-1"}}><FLabel>Tema *</FLabel><Input value={form.tema||""} onChange={e=>setForm(p=>({...p,tema:e.target.value}))} placeholder="Judul materi..."/></div>
            <div><FLabel>Pemateri *</FLabel><Input value={form.pemateri||""} onChange={e=>setForm(p=>({...p,pemateri:e.target.value}))} placeholder="Nama pemateri"/></div>
            <div><FLabel>Lokasi *</FLabel><Input value={form.lokasi||""} onChange={e=>setForm(p=>({...p,lokasi:e.target.value}))} placeholder="Masjid Al-Barokah"/></div>
            <div><FLabel>Waktu</FLabel><Input value={form.waktu||""} onChange={e=>setForm(p=>({...p,waktu:e.target.value}))} placeholder="08:00-10:00"/></div>
          </div>
          <FLabel>Catatan</FLabel><Textarea value={form.catatan} onChange={e=>setForm(p=>({...p,catatan:e.target.value}))} placeholder="Evaluasi, perkembangan..."/>
        </div>
      </Card>
      <Card style={{marginBottom:20}}>
        <CardHead icon={Users} title={`Kehadiran & Aspek Mandiri · ${ANAK_INIT.filter(a=>form.kehadiran?.[a.id]==="hadir").length} hadir`}
          right={<div style={{display:"flex",gap:6}}><Btn size="sm" onClick={setAllHadir}><CheckCircle size={13}/> Semua Hadir</Btn><Btn size="sm" onClick={()=>setForm(p=>({...p,kehadiran:{}}))}>Reset</Btn></div>}/>
        <div style={{display:"grid",gridTemplateColumns:"24px 1fr 200px 1fr",gap:0,padding:"9px 18px",background:T.primaryPale,borderBottom:`1px solid ${T.primarySoft}`}}>
          {["#","Anak","Kehadiran","Aspek Mandiri"].map((h,i)=><div key={i} style={{...GF,fontSize:10,fontWeight:800,color:T.primaryDk,textTransform:"uppercase",letterSpacing:.4}}>{h}</div>)}
        </div>
        {ANAK_INIT.map((a,i)=>{
          const st=form.kehadiran?.[a.id]||"";
          const m=formMandiri[a.id]||{};
          return(
            <div key={a.id} style={{display:"grid",gridTemplateColumns:"24px 1fr 200px 1fr",gap:0,padding:"10px 18px",borderBottom:i<ANAK_INIT.length-1?`1px solid ${T.grayLt}`:"none",alignItems:"center"}}>
              <span style={{...GF,fontSize:11,fontWeight:700,color:T.gray}}>{i+1}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}><Avatar nama={a.nama} gender={a.kel} size={30}/><div><div style={{...GF,fontWeight:700,fontSize:13,color:T.charcoal}}>{a.nama}</div><div style={{...GF,fontSize:11,color:T.gray}}>{a.kelas} {a.tingkat}</div></div></div>
              <div style={{display:"flex",gap:4}}>
                {[["H","hadir",T.green,T.greenPale,CheckCircle],["I","izin",T.gold,T.goldPale,MinusCircle],["A","alfa",T.red,T.redPale,AlertCircle]].map(([lbl,val,c,bg,Ic])=>(
                  <button key={val} onClick={()=>setKh(a.id,val)} style={{...GF,border:`1.5px solid ${st===val?c:T.grayLt}`,background:st===val?bg:"transparent",borderRadius:6,fontSize:11,fontWeight:700,padding:"4px 8px",cursor:"pointer",color:st===val?c:T.gray,display:"flex",alignItems:"center",gap:2}}><Ic size={11}/>{lbl}</button>
                ))}
              </div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                {MANDIRI_FIELDS.map(f=>(
                  <Toggle key={f.id} value={!!m[f.id]} onChange={()=>toggleMandiri(a.id,f.id)} label={f.label.split(" ").pop()}/>
                ))}
              </div>
            </div>
          );
        })}
      </Card>
      <div style={{display:"flex",gap:10}}><Btn variant="primary" onClick={saveForm}><Save size={15}/> {isEdit?"Simpan Perubahan":"Simpan Sesi"}</Btn><Btn onClick={()=>setView("list")}>Batal</Btn></div>
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div><h1 style={{...GF,fontSize:23,fontWeight:800,color:T.charcoal,margin:0}}>Pembinaan</h1><p style={{...GF,color:T.gray,fontSize:14,margin:"4px 0 0"}}>Sesi kajian dan kehadiran · Kalibawang_Banjarasri</p></div>
        <Btn variant="primary" onClick={openNew}><Plus size={15}/> Tambah Sesi</Btn>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,marginBottom:20}}>
        <StatCard icon={ClipboardList} label="Total Sesi" value={pembinaan.length} color={T.primary}/>
        <StatCard icon={UserCheck} label="Rata-rata Hadir" value={pembinaan.length?Math.round(pembinaan.reduce((s,x)=>s+x.jumlah_hadir,0)/pembinaan.length):0} color={T.green}/>
        <StatCard icon={Activity} label="Kehadiran" value="87%" color={T.blue}/>
        <StatCard icon={BookOpen} label="Kajian Islam" value={pembinaan.filter(s=>s.jenis==="Kajian Islam").length} color={T.gold}/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:showFilter?0:16,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:200,background:T.white,border:`1.5px solid ${T.primarySoft}`,borderRadius:10,padding:"9px 13px"}}>
          <Search size={15} color={T.gray}/><input value={fTeks} onChange={e=>setFTeks(e.target.value)} placeholder="Cari tema, pemateri, lokasi..." style={{...GF,border:"none",background:"none",fontSize:13,color:T.charcoal,flex:1,outline:"none"}}/>
          {fTeks&&<button onClick={()=>setFTeks("")} style={{background:"none",border:"none",cursor:"pointer"}}><X size={13} color={T.gray}/></button>}
        </div>
        <button onClick={()=>setShowFilter(v=>!v)} style={{...GF,display:"flex",alignItems:"center",gap:6,padding:"9px 14px",borderRadius:10,background:showFilter||activeFilters>0?T.primaryPale:T.white,border:`1.5px solid ${T.primarySoft}`,color:T.primary,fontWeight:700,fontSize:13,cursor:"pointer"}}>
          <SlidersHorizontal size={15}/>Saring{activeFilters>0&&<span style={{background:T.primary,color:T.white,borderRadius:10,fontSize:11,padding:"0 6px",fontWeight:800}}>{activeFilters}</span>}
        </button>
        {activeFilters>0&&<button onClick={clearFilters} style={{...GF,display:"flex",alignItems:"center",gap:5,padding:"9px 14px",borderRadius:10,background:T.redPale,border:"none",color:T.red,fontWeight:700,fontSize:13,cursor:"pointer"}}><X size={14}/>Reset</button>}
      </div>
      {showFilter&&<div style={{background:T.primaryPale,border:`1.5px solid ${T.primarySoft}`,borderRadius:12,padding:"16px 18px",marginBottom:16}}>
        <div style={{...GF,fontSize:12,fontWeight:800,color:T.primaryDk,marginBottom:12}}>Filter Lanjutan</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12}}>
          <div><FLabel>Jenis</FLabel><Sel value={fJenis} onChange={e=>setFJenis(e.target.value)}><option>Semua</option>{jenisOpts.map(j=><option key={j}>{j}</option>)}</Sel></div>
          <div><FLabel>Semester</FLabel><Sel value={fSemester} onChange={e=>setFSemester(e.target.value)}><option>Semua</option><option value="25">Semester 25</option><option value="24">Semester 24</option></Sel></div>
          <div><FLabel>Pemateri</FLabel><Sel value={fPemateri} onChange={e=>setFPemateri(e.target.value)}><option>Semua</option>{pemateriOpts.map(p=><option key={p}>{p}</option>)}</Sel></div>
          <div><FLabel>Lokasi</FLabel><Sel value={fLokasi} onChange={e=>setFLokasi(e.target.value)}><option>Semua</option>{lokasiOpts.map(l=><option key={l}>{l}</option>)}</Sel></div>
          <div><FLabel>Tgl Mulai</FLabel><Input type="date" value={fTglFrom} onChange={e=>setFTglFrom(e.target.value)}/></div>
          <div><FLabel>Tgl Akhir</FLabel><Input type="date" value={fTglTo} onChange={e=>setFTglTo(e.target.value)}/></div>
          <div><FLabel>Kehadiran</FLabel><Sel value={fHadir} onChange={e=>setFHadir(e.target.value)}><option>Semua</option><option value=">=80">Baik (80%+)</option><option value="60-79">Cukup (60-79%)</option><option value="<60">Kurang (&lt;60%)</option></Sel></div>
        </div>
      </div>}
      <div style={{...GF,fontSize:13,color:T.gray,marginBottom:10}}>Menampilkan <strong style={{color:T.charcoal}}>{filtered.length}</strong> dari <strong style={{color:T.charcoal}}>{pembinaan.length}</strong> sesi</div>
      {filtered.length===0&&<Card><div style={{padding:"36px",textAlign:"center",color:T.gray}}><AlertCircle size={36} color={T.primarySoft} style={{display:"block",margin:"0 auto 8px"}}/><span style={{...GF}}>Tidak ada sesi cocok.</span></div></Card>}
      <div className="datagrid-desktop"><div style={{background:T.white,borderRadius:16,border:`1.5px solid ${T.primarySoft}`,overflow:"hidden"}}><div style={{overflowX:"auto"}}>
        <table style={{borderCollapse:"collapse",width:"100%",minWidth:900}}><thead><tr style={{background:T.primaryPale}}>
          {["#","ID","Pertemuan","Tanggal","Jenis","Tema","Pemateri","Lokasi","Waktu","Sem.","Hadir","Izin","Alfa","Aksi"].map((h,i)=><th key={h} style={{...GF,fontSize:11,fontWeight:800,color:T.primaryDk,textTransform:"uppercase",letterSpacing:.5,padding:"10px 14px",whiteSpace:"nowrap",textAlign:"left",position:i<2?"sticky":"static",left:i===0?0:i===1?36:"auto",background:T.primaryPale,zIndex:i<2?2:1,borderRight:i===1?`2px solid ${T.primarySoft}`:"none",borderBottom:`1.5px solid ${T.primarySoft}`}}>{h}</th>)}
        </tr></thead><tbody>
          {filtered.map((s,i)=>{const rowBg=i%2===0?T.white:"#FDFAF8";return(
            <tr key={s.id} style={{background:rowBg}}>
              <td style={{...GF,fontSize:12,color:T.gray,fontWeight:700,padding:"11px 14px",position:"sticky",left:0,background:rowBg,zIndex:1,minWidth:36,textAlign:"center",whiteSpace:"nowrap"}}>{i+1}</td>
              <td style={{...GF,fontSize:11,color:T.gray,padding:"11px 14px",position:"sticky",left:36,background:rowBg,zIndex:1,borderRight:`2px solid ${T.primarySoft}`,minWidth:90,whiteSpace:"nowrap"}}>{s.id}</td>
              <td style={{...GF,fontSize:13,fontWeight:700,color:T.charcoal,padding:"11px 14px",whiteSpace:"nowrap"}}>{s.pertemuan}</td>
              <td style={{...GF,fontSize:12,color:T.charcoal,padding:"11px 14px",whiteSpace:"nowrap"}}>{fmtTgl(s.tgl)}</td>
              <td style={{padding:"11px 14px",whiteSpace:"nowrap"}}><Badge label={s.jenis} color={T.primaryDk} bg={T.primaryPale}/></td>
              <td style={{...GF,fontSize:12,color:T.charcoal,padding:"11px 14px",minWidth:220,maxWidth:300}}>{s.tema}</td>
              <td style={{...GF,fontSize:12,color:T.charcoal,padding:"11px 14px",whiteSpace:"nowrap"}}>{s.pemateri}</td>
              <td style={{...GF,fontSize:12,color:T.charcoal,padding:"11px 14px",whiteSpace:"nowrap"}}>{s.lokasi}</td>
              <td style={{...GF,fontSize:12,color:T.charcoal,padding:"11px 14px",whiteSpace:"nowrap"}}>{s.waktu}</td>
              <td style={{...GF,fontSize:12,color:T.charcoal,padding:"11px 14px",whiteSpace:"nowrap",textAlign:"center"}}>{s.semester}</td>
              <td style={{...GF,fontSize:12,fontWeight:800,color:T.green,padding:"11px 14px",whiteSpace:"nowrap",textAlign:"center"}}>{s.jumlah_hadir}</td>
              <td style={{...GF,fontSize:12,fontWeight:800,color:T.gold,padding:"11px 14px",whiteSpace:"nowrap",textAlign:"center"}}>{s.jumlah_izin}</td>
              <td style={{...GF,fontSize:12,fontWeight:800,color:T.red,padding:"11px 14px",whiteSpace:"nowrap",textAlign:"center"}}>{s.jumlah_alfa}</td>
              <td style={{padding:"11px 14px",whiteSpace:"nowrap"}}><div style={{display:"flex",gap:5}}>
                <button onClick={()=>openDetail(s)} style={{...GF,background:T.primaryPale,border:"none",borderRadius:6,fontSize:11,fontWeight:700,padding:"4px 9px",cursor:"pointer",color:T.primaryDk,display:"flex",alignItems:"center",gap:3}}><Eye size={12}/>Detail</button>
                <button onClick={()=>openEdit(s)} style={{...GF,background:T.grayLt,border:"none",borderRadius:6,fontSize:11,fontWeight:700,padding:"4px 9px",cursor:"pointer",color:T.brown,display:"flex",alignItems:"center",gap:3}}><Edit2 size={12}/>Edit</button>
                <button onClick={()=>setDelConfirm(s.id)} style={{...GF,background:T.redPale,border:"none",borderRadius:6,fontSize:11,fontWeight:700,padding:"4px 9px",cursor:"pointer",color:T.red,display:"flex",alignItems:"center",gap:3}}><Trash2 size={12}/>Hapus</button>
              </div></td>
            </tr>);})}
        </tbody></table>
      </div></div></div>
      <div className="datagrid-mobile" style={{display:"none",flexDirection:"column",gap:10}}>
        {filtered.map((s,i)=>{const pct=Math.round(s.jumlah_hadir/ANAK_INIT.length*100);const JIcon=jenisIconMap[s.jenis]||ClipboardList;return(
          <div key={s.id} style={{background:T.white,borderRadius:14,border:`1.5px solid ${T.primarySoft}`,overflow:"hidden"}}>
            <div style={{background:T.primaryPale,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${T.primarySoft}`}}><span style={{...GF,fontSize:12,fontWeight:800,color:T.gray}}>#{i+1}</span><div style={{width:30,height:30,borderRadius:8,background:T.white,border:`1px solid ${T.primarySoft}`,display:"flex",alignItems:"center",justifyContent:"center"}}><JIcon size={15} color={T.primary}/></div><div style={{flex:1}}><div style={{...GF,fontWeight:800,fontSize:13,color:T.charcoal}}>{s.pertemuan}</div><div style={{...GF,fontSize:11,color:T.gray}}>{fmtTgl(s.tgl)}</div></div><Badge label={s.jenis} color={T.primaryDk} bg={T.white}/></div>
            <div style={{padding:"12px 14px"}}><div style={{...GF,fontSize:14,fontWeight:700,color:T.charcoal,marginBottom:8}}>{s.tema}</div>
              {[[Users,s.pemateri,"Pemateri"],[MapPin,s.lokasi,"Lokasi"],[Clock,s.waktu,"Waktu"]].map(([Ic,val,lbl])=><div key={lbl} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}><Ic size={13} color={T.gray}/><span style={{...GF,fontSize:12,color:T.gray,minWidth:60}}>{lbl}</span><span style={{...GF,fontSize:12,color:T.charcoal,fontWeight:600}}>{val}</span></div>)}
              <div style={{marginTop:8,display:"flex",gap:12}}><span style={{...GF,fontSize:12,fontWeight:700,color:T.green}}>{s.jumlah_hadir} H</span><span style={{...GF,fontSize:12,fontWeight:700,color:T.gold}}>{s.jumlah_izin} I</span><span style={{...GF,fontSize:12,fontWeight:700,color:T.red}}>{s.jumlah_alfa} A</span></div>
              <div style={{marginTop:8,display:"flex",gap:6}}>
                <button onClick={()=>openDetail(s)} style={{...GF,background:T.primaryPale,border:"none",borderRadius:7,fontSize:12,fontWeight:700,padding:"6px 12px",cursor:"pointer",color:T.primaryDk,display:"flex",alignItems:"center",gap:4,flex:1,justifyContent:"center"}}><Eye size={13}/>Detail</button>
                <button onClick={()=>openEdit(s)} style={{...GF,background:T.grayLt,border:"none",borderRadius:7,fontSize:12,fontWeight:700,padding:"6px 12px",cursor:"pointer",color:T.brown,display:"flex",alignItems:"center",gap:4,flex:1,justifyContent:"center"}}><Edit2 size={13}/>Edit</button>
                <button onClick={()=>setDelConfirm(s.id)} style={{...GF,background:T.redPale,border:"none",borderRadius:7,fontSize:12,fontWeight:700,padding:"6px 10px",cursor:"pointer",color:T.red,display:"flex",alignItems:"center"}}><Trash2 size={13}/></button>
              </div>
            </div>
          </div>);})}
      </div>
      {delConfirm&&<Modal title="Hapus Sesi?" onClose={()=>setDelConfirm(null)}><p style={{...GF,color:T.charcoal,marginBottom:20}}>Sesi akan dihapus permanen.</p><div style={{display:"flex",gap:10}}><Btn variant="danger" onClick={()=>delSession(delConfirm)}><Trash2 size={14}/> Ya, Hapus</Btn><Btn onClick={()=>setDelConfirm(null)}>Batal</Btn></div></Modal>}
    </div>
  );
}

/* ── LOGIN PAGE ── */
const DEMO_USERS=[
  {username:"yulianti",  password:"juara123",  nama:"Yulianti",           role:"Korwil",   wilayah:"IJ Yogyakarta", kel:"p"},
  {username:"admin",     password:"admin",      nama:"Administrator",      role:"Admin",    wilayah:"Pusat",         kel:"l"},
  {username:"hendra",    password:"hendra123",  nama:"Ust. Hendra Gunawan",role:"Pembina",  wilayah:"Kalibawang",    kel:"l"},
  {username:"fadhil",    password:"fadhil123",  nama:"Ust. Fadhil Rahman", role:"Pembina",  wilayah:"Sleman",        kel:"l"},
];

function LoginPage({onLogin}){
  const [username,setUsername]=useState("");
  const [password,setPassword]=useState("");
  const [showPass,setShowPass]=useState(false);
  const [error,setError]=useState("");

  function doLogin(){
    setError("");
    if(!username.trim()||!password.trim()){setError("Username dan password harus diisi.");return;}
    const found=DEMO_USERS.find(u=>u.username===username.trim().toLowerCase()&&u.password===password.trim());
    if(found){onLogin(found);}
    else{setError("Username atau password salah. Coba lagi.");}
  }

  return(
    <div style={{minHeight:"100vh",background:`linear-gradient(145deg,${T.primaryPale} 0%,#fff 50%,${T.primaryPale} 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,...GF}}>

      {/* Logo / Brand */}
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{width:72,height:72,borderRadius:20,background:T.primary,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:`0 8px 32px ${T.primary}50`}}>
          <Star size={36} color={T.white} fill={T.white} strokeWidth={1.5}/>
        </div>
        <h1 style={{...GF,fontSize:26,fontWeight:900,color:T.charcoal,margin:"0 0 4px"}}>Anak Juara</h1>
        <p style={{...GF,fontSize:14,color:T.gray,margin:0}}>Sistem Informasi Pembinaan · Rumah Zakat</p>
      </div>

      {/* Login card */}
      <div style={{background:T.white,borderRadius:20,padding:"32px 36px",width:"100%",maxWidth:400,boxShadow:"0 4px 40px rgba(191,78,2,.10)",border:`1.5px solid ${T.primarySoft}`}}>
        <h2 style={{...GF,fontSize:18,fontWeight:800,color:T.charcoal,margin:"0 0 24px",textAlign:"center"}}>Masuk ke Sistem</h2>

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Username */}
          <div>
            <div style={{...GF,fontSize:11,fontWeight:700,color:T.gray,letterSpacing:.6,marginBottom:6,textTransform:"uppercase"}}>Username</div>
            <div style={{position:"relative"}}>
              <div style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
                <Users size={15} color={T.gray}/>
              </div>
              <input
                type="text" value={username}
                onChange={e=>{setUsername(e.target.value);setError("");}}
                onKeyDown={e=>{if(e.key==="Enter")doLogin();}}
                placeholder="Masukkan username"
                style={{...GF,fontSize:14,padding:"10px 12px 10px 36px",border:`1.5px solid ${error?T.red:T.primarySoft}`,borderRadius:10,width:"100%",background:T.white,color:T.charcoal,outline:"none",boxSizing:"border-box"}}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div style={{...GF,fontSize:11,fontWeight:700,color:T.gray,letterSpacing:.6,marginBottom:6,textTransform:"uppercase"}}>Password</div>
            <div style={{position:"relative"}}>
              <div style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
                <Star size={15} color={T.gray} fill="none"/>
              </div>
              <input
                type={showPass?"text":"password"} value={password}
                onChange={e=>{setPassword(e.target.value);setError("");}}
                onKeyDown={e=>{if(e.key==="Enter")doLogin();}}
                placeholder="Masukkan password"
                style={{...GF,fontSize:14,padding:"10px 36px 10px 36px",border:`1.5px solid ${error?T.red:T.primarySoft}`,borderRadius:10,width:"100%",background:T.white,color:T.charcoal,outline:"none",boxSizing:"border-box"}}
              />
              <button onClick={()=>setShowPass(v=>!v)}
                style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.gray,padding:4,fontSize:16}}>
                {showPass?"🙈":"👁"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error&&<div style={{...GF,fontSize:13,color:T.red,background:T.redPale,border:`1px solid ${T.red}30`,borderRadius:8,padding:"9px 12px",display:"flex",alignItems:"center",gap:8}}>
            <AlertCircle size={14} color={T.red}/>{error}
          </div>}

          {/* Submit button — plain onClick, no form */}
          <button onClick={doLogin}
            style={{...GF,background:T.primary,color:T.white,border:"none",borderRadius:10,padding:"12px",fontSize:15,fontWeight:800,cursor:"pointer",marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            Masuk
          </button>
        </div>

        {/* Demo accounts */}
        <div style={{marginTop:20,padding:"12px 14px",background:T.primaryPale,borderRadius:10,border:`1px solid ${T.primarySoft}`}}>
          <div style={{...GF,fontSize:11,fontWeight:700,color:T.primaryDk,marginBottom:8,display:"flex",alignItems:"center",gap:5}}><Star size={11} color={T.primaryDk} fill={T.primaryDk}/>Akun Simulasi — klik untuk isi otomatis</div>
          {DEMO_USERS.map(u=>(
            <div key={u.username} onClick={()=>{setUsername(u.username);setPassword(u.password);setError("");}}
              style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,cursor:"pointer",padding:"6px 8px",borderRadius:8,transition:"background .12s",background:"transparent"}}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(191,78,2,.1)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <Avatar nama={u.nama} gender={u.kel} size={26}/>
              <span style={{...GF,fontSize:12,color:T.charcoal,fontWeight:600,flex:1}}>{u.nama}</span>
              <span style={{...GF,fontSize:11,color:T.gray,marginRight:4}}>{u.role}</span>
              <code style={{...GF,fontSize:11,color:T.primaryDk,background:"rgba(191,78,2,.12)",borderRadius:4,padding:"2px 6px"}}>{u.username}</code>
            </div>
          ))}
        </div>
      </div>

      <p style={{...GF,fontSize:12,color:T.gray,marginTop:24,textAlign:"center"}}>© 2026 Rumah Zakat · Sistem Informasi Anak Juara</p>
    </div>
  );
}

/* ── APP SHELL ── */
const NAV=[
  {id:"beranda",   icon:Home,       label:"Beranda"},
  {id:"anak",      icon:Users,      label:"Daftar Anak"},
  {id:"pembinaan", icon:BookMarked, label:"Pembinaan"},
  {id:"penilaian", icon:Star,       label:"Penilaian"},
];

export default function App(){
  const [page,setPage]=useState("beranda");
  const [anak]=useState(ANAK_INIT);
  const [hafalan,setHafalan]=useState(HAFALAN_INIT);
  const [penilaian,setPenilaian]=useState({});
  const [pembinaan,setPembinaan]=useState(SEED_PEMBINAAN);
  const [mandiriData,setMandiriData]=useState(MANDIRI_INIT);
  const [user,setUser]=useState(null); // null = belum login
  const [showLogoutConfirm,setShowLogoutConfirm]=useState(false);

  function handleLogin(u){setUser(u);}
  function handleLogout(){setShowLogoutConfirm(false);setUser(null);setPage("beranda");}

  /* ── RENDER ── */
  if(!user) return(
    <React.Fragment>
      <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700;900&display=swap" rel="stylesheet"/>
      <style>{`*{font-family:'Source Sans Pro',sans-serif!important;box-sizing:border-box;}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <LoginPage onLogin={handleLogin}/>
    </React.Fragment>
  );

  const pages={
    beranda:<Beranda anak={anak} pembinaan={pembinaan}/>,
    anak:<DaftarAnak anak={anak} hafalan={hafalan} penilaian={penilaian} setPenilaian={setPenilaian} pembinaan={pembinaan} mandiriData={mandiriData}/>,
    pembinaan:<Pembinaan pembinaan={pembinaan} setPembinaan={setPembinaan} mandiriData={mandiriData} setMandiriData={setMandiriData}/>,
    penilaian:<Penilaian penilaian={penilaian} setPenilaian={setPenilaian} anak={anak} pembinaan={pembinaan} hafalan={hafalan} mandiriData={mandiriData}/>,
  };

  return(
    <div style={{...GF,background:T.bg,minHeight:"100vh"}}>
      {/* TOPBAR */}
      <div style={{height:56,background:T.white,borderBottom:`1.5px solid ${T.primarySoft}`,display:"flex",alignItems:"center",padding:"0 20px",gap:12,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 16px rgba(191,78,2,.07)"}}>
        <div style={{width:34,height:34,borderRadius:10,background:T.primary,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Star size={18} color={T.white} fill={T.white} strokeWidth={1.5}/></div>
        <span style={{...GF,fontWeight:900,fontSize:16,color:T.charcoal}}>Anak Juara</span>
        <span style={{...GF,fontWeight:400,fontSize:14,color:T.gray}}> · Rumah Zakat</span>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
          <button style={{background:T.primaryPale,border:"none",borderRadius:8,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Bell size={16} color={T.primary}/></button>
          {/* User info + logout */}
          <div style={{display:"flex",alignItems:"center",gap:8,background:T.primaryPale,border:`1.5px solid ${T.primarySoft}`,borderRadius:10,padding:"4px 12px 4px 6px"}}>
            <Avatar nama={user.nama} gender={user.kel} size={28}/>
            <div style={{lineHeight:1}}>
              <div style={{...GF,fontSize:13,fontWeight:700,color:T.brown}}>{user.nama.split(" ")[0]}</div>
              <div style={{...GF,fontSize:10,color:T.gray}}>{user.role}</div>
            </div>
          </div>
          <button onClick={()=>setShowLogoutConfirm(true)}
            style={{...GF,background:T.redPale,border:`1.5px solid ${T.red}40`,borderRadius:8,padding:"6px 13px",cursor:"pointer",color:T.red,fontWeight:700,fontSize:12,display:"flex",alignItems:"center",gap:5}}>
            <ArrowLeft size={13}/>Logout
          </button>
        </div>
      </div>

      <div style={{display:"flex",maxWidth:1200,margin:"0 auto"}}>
        {/* SIDEBAR */}
        <nav className="sidebar-nav" style={{width:220,background:T.primary,flexShrink:0,padding:"16px 10px",minHeight:"calc(100vh - 56px)",position:"sticky",top:56,alignSelf:"flex-start",display:"flex",flexDirection:"column",gap:2}}>
          <div style={{...GF,fontSize:10,fontWeight:700,color:"rgba(255,255,255,.5)",letterSpacing:1.2,padding:"4px 12px 6px",textTransform:"uppercase"}}>Menu</div>
          {NAV.map(n=><NavItem key={n.id} {...n} inverted active={page===n.id} onClick={()=>setPage(n.id)}/>)}
          <div style={{marginTop:"auto",paddingTop:16}}>
            <div style={{background:"rgba(255,255,255,.15)",borderRadius:12,padding:"12px 14px",border:"1px solid rgba(255,255,255,.25)",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <Avatar nama={user.nama} gender={user.kel} size={38}/>
                <div><div style={{...GF,fontSize:13,fontWeight:800,color:T.white}}>{user.nama.split(" ")[0]}</div><div style={{...GF,fontSize:11,color:"rgba(255,255,255,.75)"}}>{user.role} · {user.wilayah}</div></div>
              </div>
              <button onClick={()=>setShowLogoutConfirm(true)}
                style={{...GF,width:"100%",background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)",borderRadius:8,padding:"7px 12px",cursor:"pointer",color:T.white,fontWeight:700,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <ArrowLeft size={13}/>Logout
              </button>
            </div>
          </div>
        </nav>
        <main style={{flex:1,padding:"24px 20px",minWidth:0}}>{pages[page]||<Beranda anak={anak} pembinaan={pembinaan}/>}</main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="mobile-nav" style={{display:"none",position:"fixed",bottom:0,left:0,right:0,background:T.primary,padding:"6px 4px",zIndex:200}}>
        {NAV.map(n=><button key={n.id} onClick={()=>setPage(n.id)} style={{...GF,flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 4px",borderRadius:8,border:"none",background:page===n.id?"rgba(255,255,255,.2)":"transparent",color:T.white,fontWeight:page===n.id?800:600,fontSize:10,cursor:"pointer"}}><n.icon size={20} strokeWidth={page===n.id?2.5:1.8}/>{n.label.split(" ")[0]}</button>)}
        <button onClick={()=>setShowLogoutConfirm(true)} style={{...GF,flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"6px 4px",borderRadius:8,border:"none",background:"transparent",color:"rgba(255,255,255,.7)",fontWeight:600,fontSize:10,cursor:"pointer"}}>
          <ArrowLeft size={20} strokeWidth={1.8}/>Keluar
        </button>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(26,10,0,.55)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:T.white,borderRadius:20,padding:"28px 32px",maxWidth:380,width:"100%",textAlign:"center",border:`1.5px solid ${T.primarySoft}`,boxShadow:"0 8px 48px rgba(0,0,0,.15)"}}>
            <div style={{width:56,height:56,borderRadius:"50%",background:T.redPale,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
              <ArrowLeft size={26} color={T.red}/>
            </div>
            <h2 style={{...GF,fontSize:18,fontWeight:800,color:T.charcoal,margin:"0 0 8px"}}>Konfirmasi Logout</h2>
            <p style={{...GF,fontSize:14,color:T.gray,margin:"0 0 24px",lineHeight:1.6}}>Anda akan keluar dari sistem. Data yang belum disimpan akan hilang.</p>
            <div style={{...GF,fontSize:13,color:T.gray,background:T.primaryPale,borderRadius:10,padding:"10px 14px",marginBottom:22,display:"flex",alignItems:"center",gap:8}}>
              <Avatar nama={user.nama} gender={user.kel} size={28}/>
              <div style={{textAlign:"left"}}>
                <div style={{fontWeight:700,color:T.charcoal}}>{user.nama}</div>
                <div style={{fontSize:12}}>{user.role} · {user.wilayah}</div>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowLogoutConfirm(false)}
                style={{...GF,flex:1,background:T.white,border:`1.5px solid ${T.primarySoft}`,borderRadius:10,padding:"10px",fontSize:14,fontWeight:700,cursor:"pointer",color:T.primary}}>
                Batal
              </button>
              <button onClick={handleLogout}
                style={{...GF,flex:1,background:T.red,border:"none",borderRadius:10,padding:"10px",fontSize:14,fontWeight:800,cursor:"pointer",color:T.white}}>
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700;900&display=swap');
        *{font-family:'Source Sans Pro',sans-serif!important;box-sizing:border-box;}
        .datagrid-desktop{display:block}
        .datagrid-mobile{display:none!important}
        @media(max-width:700px){
          .sidebar-nav{display:none!important}
          .mobile-nav{display:flex!important}
          main{padding:16px 12px 80px!important}
          .datagrid-desktop{display:none!important}
          .datagrid-mobile{display:flex!important}
        }
      `}</style>
    </div>
  );
}
