import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  Search, 
  User, 
  ShieldAlert, 
  Award,
  Layers,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { 
  getMataKuliah, 
  getKrs, 
  addKrsItem, 
  deleteKrsItem, 
  ajukanKrs, 
  resetDemoKrs 
} from './services/api';

export default function App() {
  const [courses, setCourses] = useState([]);
  const [krsData, setKrsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSks, setFilterSks] = useState('ALL');
  const [filterDay, setFilterDay] = useState('ALL');

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, krsRes] = await Promise.all([
        getMataKuliah(),
        getKrs()
      ]);
      if (coursesRes.success) setCourses(coursesRes.data);
      if (krsRes.success) setKrsData(krsRes.data);
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message || 'Gagal memuat data dari server backend Laravel.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Set IDs mata kuliah yang sudah diambil
  const takenCourseIds = new Set((krsData?.items || []).map(item => item.course_id));
  const currentTotalCredits = krsData?.total_credits || 0;
  const isLocked = krsData?.status && krsData.status !== 'DRAFT';

  // Helper fungsi untuk mengecek apakah mata kuliah bentrok jadwal dengan yang sudah diambil
  const getConflictCourse = (course) => {
    if (takenCourseIds.has(course.id)) return null;
    if (!course.day || !course.start_time || !course.end_time) return null;

    const items = krsData?.items || [];
    for (const item of items) {
      if (item.day && item.day === course.day && item.start_time && item.end_time) {
        const isOverlap = (course.start_time < item.end_time) && (course.end_time > item.start_time);
        if (isOverlap) {
          return item; // Mengembalikan item yang bentrok
        }
      }
    }
    return null;
  };

  // Handler Tambah Mata Kuliah
  const handleAddCourse = async (course) => {
    if (isLocked) {
      showToast('KRS sudah diajukan dan terkunci. Tidak dapat menambah mata kuliah.', 'error');
      return;
    }

    const conflict = getConflictCourse(course);
    if (conflict) {
      showToast(`Jadwal bentrok dengan mata kuliah ${conflict.name} pada ${conflict.schedule}!`, 'error');
      return;
    }

    if (currentTotalCredits + course.credits > 24) {
      showToast(`Total SKS akan menjadi ${currentTotalCredits + course.credits}. Maksimal adalah 24 SKS!`, 'error');
      return;
    }

    try {
      setActionLoadingId(course.id);
      const res = await addKrsItem(course.id);
      if (res.success) {
        showToast(res.message, 'success');
        const updatedKrs = await getKrs();
        if (updatedKrs.success) setKrsData(updatedKrs.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menambahkan mata kuliah.';
      showToast(msg, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handler Hapus Mata Kuliah
  const handleDeleteCourse = async (courseId, courseName) => {
    if (isLocked) {
      showToast('KRS sudah diajukan dan terkunci. Tidak dapat menghapus mata kuliah.', 'error');
      return;
    }

    try {
      setActionLoadingId(courseId);
      const res = await deleteKrsItem(courseId);
      if (res.success) {
        showToast(res.message || `Mata kuliah ${courseName} dihapus.`, 'success');
        const updatedKrs = await getKrs();
        if (updatedKrs.success) setKrsData(updatedKrs.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal menghapus mata kuliah.';
      showToast(msg, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handler Ajukan KRS
  const handleAjukanKrs = async () => {
    if ((krsData?.items || []).length === 0) {
      showToast('Silakan pilih minimal 1 mata kuliah sebelum mengajukan KRS.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await ajukanKrs();
      if (res.success) {
        showToast(res.message, 'success');
        const updatedKrs = await getKrs();
        if (updatedKrs.success) setKrsData(updatedKrs.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal mengajukan KRS.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler Reset Demo Seminar
  const handleDemoAction = async (action) => {
    try {
      setIsResetting(true);
      const res = await resetDemoKrs(action);
      if (res.success) {
        showToast(res.message, 'success');
        const updatedKrs = await getKrs();
        if (updatedKrs.success) setKrsData(updatedKrs.data);
      }
    } catch (err) {
      showToast('Gagal memproses aksi demo.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Filter Courses
  const filteredCourses = courses.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.lecturer && c.lecturer.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCredits = filterSks === 'ALL' || c.credits.toString() === filterSks;
    const matchesDay = filterDay === 'ALL' || c.day === filterDay;

    return matchesSearch && matchesCredits && matchesDay;
  });

  // Status Badge Colors & Info
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> DISETUJUI DOSEN PA
          </span>
        );
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> MENUNGGU PERSETUJUAN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Layers className="w-3.5 h-3.5" /> DRAFT
          </span>
        );
    }
  };

  const percentage = Math.min(100, Math.round((currentTotalCredits / 24) * 100));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 transition-all transform animate-bounce">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">Portal Mini KRS</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
                  AI-Assisted Demo
                </span>
              </div>
              <p className="text-xs text-slate-500">Seminar Fullstack Development • Laravel 12 + React Vite + SQLite</p>
            </div>
          </div>

          {/* Student Profile Quick View & Demo Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left text-xs leading-tight">
                <p className="font-semibold text-slate-800">{krsData?.student_name || 'Loading...'}</p>
                <p className="text-slate-500">NIM: {krsData?.nim || '-'}</p>
              </div>
            </div>

            {/* Demo Bar Controls */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => handleDemoAction('reset')}
                disabled={isResetting}
                title="Reset KRS ke Draft Kosong"
                className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-white hover:shadow-xs rounded-md transition flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
                Reset Demo
              </button>

              {krsData?.status === 'SUBMITTED' && (
                <button
                  onClick={() => handleDemoAction('approve')}
                  disabled={isResetting}
                  title="Simulasi Persetujuan Dosen PA"
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition flex items-center gap-1"
                >
                  <Award className="w-3 h-3" />
                  Simulasi Setujui PA
                </button>
              )}

              {krsData?.status === 'APPROVED' && (
                <button
                  onClick={() => handleDemoAction('unsubmit')}
                  disabled={isResetting}
                  title="Kembalikan ke Draft"
                  className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition flex items-center gap-1"
                >
                  Buka Kunci (Draft)
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-medium text-slate-600">Menghubungkan ke API Laravel & Database SQLite...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* SISI KIRI: Katalog Mata Kuliah (7 Kolom) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      Katalog Mata Kuliah Tersedia
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pilih mata kuliah yang akan diambil pada semester ini
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
                    {filteredCourses.length} Mata Kuliah
                  </span>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col gap-2.5 mb-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari kode, nama MK, jadwal, atau dosen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50/50"
                    />
                  </div>
                  
                  {/* Pills Filter SKS & Hari */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1">SKS:</span>
                      {['ALL', '2', '3', '4'].map((sks) => (
                        <button
                          key={sks}
                          onClick={() => setFilterSks(sks)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                            filterSks === sks
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {sks === 'ALL' ? 'Semua' : `${sks} SKS`}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1">Hari:</span>
                      {['ALL', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => (
                        <button
                          key={day}
                          onClick={() => setFilterDay(day)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                            filterDay === day
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {day === 'ALL' ? 'Semua' : day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* List Courses */}
                <div className="flex flex-col gap-2.5 max-h-[620px] overflow-y-auto pr-1">
                  {filteredCourses.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500">Mata kuliah tidak ditemukan dengan kata kunci ini.</p>
                    </div>
                  ) : (
                    filteredCourses.map((course) => {
                      const isTaken = takenCourseIds.has(course.id);
                      const conflict = getConflictCourse(course);
                      const wouldExceedLimit = currentTotalCredits + course.credits > 24;
                      const isDisabled = isLocked || isTaken || (wouldExceedLimit && !isTaken) || Boolean(conflict);

                      return (
                        <div
                          key={course.id}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isTaken
                              ? 'bg-indigo-50/40 border-indigo-200/80'
                              : conflict
                              ? 'bg-rose-50/30 border-rose-200'
                              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="grow">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                {course.code}
                              </span>
                              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                {course.credits} SKS
                              </span>
                              {conflict && (
                                <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-rose-500" />
                                  Bentrok: {conflict.code}
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                              {course.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {course.schedule}
                              </span>
                              {course.lecturer && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  {course.lecturer}
                                </span>
                              )}
                            </div>
                            {conflict && (
                              <p className="text-[11px] text-rose-600 mt-1 font-medium">
                                Jadwal bertabrakan dengan {conflict.name} ({conflict.schedule})
                              </p>
                            )}
                          </div>

                          <div className="sm:self-center shrink-0">
                            {isTaken ? (
                              <button
                                disabled
                                className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1 cursor-default"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Terpilih
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAddCourse(course)}
                                disabled={isDisabled || actionLoadingId === course.id}
                                className={`w-full sm:w-auto px-3.5 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1 shadow-xs ${
                                  isDisabled
                                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 active:scale-95'
                                }`}
                                title={
                                  isLocked
                                    ? 'KRS sudah dikunci'
                                    : conflict
                                    ? `Bentrok dengan ${conflict.name}`
                                    : wouldExceedLimit
                                    ? 'Akan melebihi batas 24 SKS'
                                    : 'Tambahkan ke KRS'
                                }
                              >
                                {actionLoadingId === course.id ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Plus className="w-3.5 h-3.5" />
                                )}
                                Ambil
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* SISI KANAN: Kartu Rencana Studi (KRS) (5 Kolom) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                
                {/* Header Status & Total */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Kartu Rencana Studi</h2>
                    <p className="text-xs text-slate-500">Semester Ganjil 2026/2027</p>
                  </div>
                  <div>{getStatusBadge(krsData?.status)}</div>
                </div>

                {/* SKS Counter & Progress Bar */}
                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200 mb-4">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-xs font-medium text-slate-500">Beban Studi Dipilih</span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-extrabold ${
                          currentTotalCredits === 24 
                            ? 'text-emerald-600' 
                            : currentTotalCredits > 20 
                            ? 'text-amber-600' 
                            : 'text-slate-900'
                        }`}>
                          {currentTotalCredits}
                        </span>
                        <span className="text-sm font-semibold text-slate-400">/ 24 SKS</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-600">
                        Sisa Kuota: {24 - currentTotalCredits} SKS
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar with Color Thresholds */}
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        currentTotalCredits === 24
                          ? 'bg-emerald-500'
                          : currentTotalCredits >= 20
                          ? 'bg-indigo-600'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {currentTotalCredits >= 24 && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2 mt-2.5 border border-amber-200 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Kapasitas maksimal 24 SKS telah terpenuhi.
                    </p>
                  )}
                </div>

                {/* Selected Items List */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Daftar Terpilih ({(krsData?.items || []).length} MK)
                    </span>
                    {isLocked && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-slate-400" /> Mode Terkunci
                      </span>
                    )}
                  </div>

                  {(krsData?.items || []).length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-medium text-slate-500">Belum ada mata kuliah yang diambil.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Pilih dari katalog di sisi kiri untuk memulai.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
                      {krsData.items.map((item, idx) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs group transition"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="text-xs font-bold text-slate-400 mt-0.5">
                              {idx + 1}.
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                                  {item.code}
                                </span>
                                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                                  {item.credits} SKS
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-0.5">{item.schedule}</p>
                            </div>
                          </div>

                          {!isLocked && (
                            <button
                              onClick={() => handleDeleteCourse(item.course_id, item.name)}
                              disabled={actionLoadingId === item.course_id}
                              className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition"
                              title="Hapus dari KRS"
                            >
                              {actionLoadingId === item.course_id ? (
                                <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submission Action */}
                <div className="border-t border-slate-100 pt-4">
                  {krsData?.status === 'DRAFT' ? (
                    <button
                      onClick={handleAjukanKrs}
                      disabled={isSubmitting || (krsData?.items || []).length === 0}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md ${
                        (krsData?.items || []).length === 0
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 active:scale-98'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Memproses Pengajuan...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Ajukan KRS ke Dosen PA
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center">
                      <p className="text-xs font-medium text-slate-600">
                        {krsData?.status === 'APPROVED' ? (
                          <span className="text-emerald-700 font-semibold flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            KRS Anda telah resmi disetujui Dosen PA.
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold flex items-center justify-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-600" />
                            KRS sedang dalam antrean verifikasi Dosen PA.
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Gunakan tombol panel di pojok kanan atas untuk mensimulasikan alur demo.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          Aplikasi Demo Seminar AI-Assisted Fullstack Development &bull; Validasi SKS, Anti-Bentrok Jadwal, & Transaksi Database SQLite
        </div>
      </footer>
    </div>
  );
}
