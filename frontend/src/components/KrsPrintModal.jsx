import React from 'react';
import { Printer, X, Award, CheckCircle2 } from 'lucide-react';

export default function KrsPrintModal({ krsData, onClose }) {
  if (!krsData) return null;

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Container Modal Screen (Sembunyi saat dicetak) */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden no-print">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Preview Dokumen Kartu Rencana Studi (KRS) Resmi</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-100 transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Preview Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto bg-slate-100/50">
          {/* Kertas Lembar KRS */}
          <div className="bg-white p-8 rounded-xl shadow-xs border border-slate-200 max-w-3xl mx-auto text-slate-900">
            {/* Kop Kampus */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
              <h2 className="text-lg font-black uppercase tracking-wider">Kementerian Pendidikan Tinggi, Sains, dan Teknologi</h2>
              <h1 className="text-xl font-black uppercase tracking-wide text-indigo-900 mt-0.5">Universitas Teknologi Indonesia</h1>
              <p className="text-xs text-slate-600 mt-1">Fakultas Ilmu Komputer &bull; Program Studi S1 Informatika</p>
              <p className="text-[11px] text-slate-500">Jl. Kampus Merdeka No. 45, Jakarta Selatan &bull; Laman: https://krs.uti.ac.id</p>
            </div>

            {/* Judul Dokumen */}
            <div className="text-center mb-6">
              <h3 className="text-sm font-bold uppercase underline tracking-wider">KARTU RENCANA STUDI (KRS)</h3>
              <p className="text-xs text-slate-600 mt-0.5">Tahun Akademik 2026/2027 - Semester Ganjil</p>
            </div>

            {/* Informasi Mahasiswa */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Nama Mahasiswa</span>
                <span className="font-bold text-slate-800">: {krsData.student_name}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Program Studi</span>
                <span className="font-bold text-slate-800">: S1 Informatika</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">NIM</span>
                <span className="font-bold text-slate-800">: {krsData.nim}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 font-medium">Status Pengajuan</span>
                <span className="font-bold text-emerald-700">: {krsData.status} (Disetujui)</span>
              </div>
            </div>

            {/* Tabel Mata Kuliah */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-center w-10">No</th>
                    <th className="border border-slate-300 p-2 w-20">Kode</th>
                    <th className="border border-slate-300 p-2">Mata Kuliah</th>
                    <th className="border border-slate-300 p-2 text-center w-14">SKS</th>
                    <th className="border border-slate-300 p-2">Jadwal Kuliah</th>
                    <th className="border border-slate-300 p-2">Dosen Pengampu</th>
                  </tr>
                </thead>
                <tbody>
                  {(krsData.items || []).map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-2 text-center font-medium">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-mono font-bold text-slate-700">{item.code}</td>
                      <td className="border border-slate-300 p-2 font-medium">{item.name}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold">{item.credits}</td>
                      <td className="border border-slate-300 p-2 text-slate-600">{item.schedule}</td>
                      <td className="border border-slate-300 p-2 text-slate-600">{item.lecturer || '-'}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan="3" className="border border-slate-300 p-2 text-right">Total SKS Diambil:</td>
                    <td className="border border-slate-300 p-2 text-center font-black text-indigo-900">{krsData.total_credits} SKS</td>
                    <td colSpan="2" className="border border-slate-300 p-2 text-slate-500 text-[11px]">(Maksimal 24 SKS)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Kolom Tanda Tangan */}
            <div className="grid grid-cols-2 text-xs pt-4 text-center">
              <div>
                <p className="text-slate-500">Mengetahui,</p>
                <p className="font-bold text-slate-700 mb-14">Dosen Pembimbing Akademik (PA)</p>
                <p className="font-bold underline text-slate-800">Prof. Dr. Ir. Wahyu Wibowo</p>
                <p className="text-[11px] text-slate-500">NIP. 19780512 200312 1 002</p>
              </div>
              <div>
                <p className="text-slate-500">Jakarta, {today}</p>
                <p className="font-bold text-slate-700 mb-14">Mahasiswa Yang Bersangkutan</p>
                <p className="font-bold underline text-slate-800">{krsData.student_name}</p>
                <p className="text-[11px] text-slate-500">NIM. {krsData.nim}</p>
              </div>
            </div>

            {/* Stempel & Barcode Info */}
            <div className="mt-8 pt-4 border-t border-dashed border-slate-300 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Terverifikasi Secara Digital oleh Sistem Akademik Kampus
              </span>
              <span>Dokumen ID: KRS-20261-00{krsData.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dokumen yang Hanya Muncul Saat Di-Print (print-only) */}
      <div className="print-only w-full bg-white text-black p-4">
        {/* Kop Kampus */}
        <div className="text-center border-b-2 border-black pb-3 mb-4">
          <h2 className="text-sm font-black uppercase">Kementerian Pendidikan Tinggi, Sains, dan Teknologi</h2>
          <h1 className="text-base font-black uppercase tracking-wide">Universitas Teknologi Indonesia</h1>
          <p className="text-[10px] text-gray-700">Fakultas Ilmu Komputer &bull; Program Studi S1 Informatika</p>
        </div>

        {/* Judul Dokumen */}
        <div className="text-center mb-4">
          <h3 className="text-xs font-bold uppercase underline">KARTU RENCANA STUDI (KRS)</h3>
          <p className="text-[10px] text-gray-700">Tahun Akademik 2026/2027 - Semester Ganjil</p>
        </div>

        {/* Info Mahasiswa */}
        <div className="grid grid-cols-2 text-[10px] mb-4 gap-y-1">
          <div>Nama: <strong>{krsData.student_name}</strong></div>
          <div>Prodi: <strong>S1 Informatika</strong></div>
          <div>NIM: <strong>{krsData.nim}</strong></div>
          <div>Status: <strong>{krsData.status} (Disetujui Dosen PA)</strong></div>
        </div>

        {/* Tabel */}
        <table className="w-full text-[10px] border-collapse border border-black mb-4">
          <thead>
            <tr className="bg-gray-100 font-bold border border-black">
              <th className="border border-black p-1 text-center w-8">No</th>
              <th className="border border-black p-1 text-left w-16">Kode</th>
              <th className="border border-black p-1 text-left">Mata Kuliah</th>
              <th className="border border-black p-1 text-center w-10">SKS</th>
              <th className="border border-black p-1 text-left">Jadwal</th>
              <th className="border border-black p-1 text-left">Dosen Pengampu</th>
            </tr>
          </thead>
          <tbody>
            {(krsData.items || []).map((item, idx) => (
              <tr key={item.id} className="border border-black">
                <td className="border border-black p-1 text-center">{idx + 1}</td>
                <td className="border border-black p-1 font-mono">{item.code}</td>
                <td className="border border-black p-1 font-medium">{item.name}</td>
                <td className="border border-black p-1 text-center font-bold">{item.credits}</td>
                <td className="border border-black p-1">{item.schedule}</td>
                <td className="border border-black p-1">{item.lecturer || '-'}</td>
              </tr>
            ))}
            <tr className="font-bold border border-black">
              <td colSpan="3" className="border border-black p-1 text-right">Total SKS:</td>
              <td className="border border-black p-1 text-center">{krsData.total_credits} SKS</td>
              <td colSpan="2" className="border border-black p-1 text-[9px]">(Maksimal 24 SKS)</td>
            </tr>
          </tbody>
        </table>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-2 text-[10px] pt-6 text-center">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold mb-12">Dosen Pembimbing Akademik</p>
            <p className="font-bold underline">Prof. Dr. Ir. Wahyu Wibowo</p>
            <p className="text-[9px]">NIP. 19780512 200312 1 002</p>
          </div>
          <div>
            <p>Jakarta, {today}</p>
            <p className="font-bold mb-12">Mahasiswa Yang Bersangkutan</p>
            <p className="font-bold underline">{krsData.student_name}</p>
            <p className="text-[9px]">NIM. {krsData.nim}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
