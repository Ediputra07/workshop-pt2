# Product Requirement Document (PRD): Mini KRS Mahasiswa

> **Keperluan**: Demo Seminar AI-Assisted Fullstack Development  
> **Target Pengguna**: Single-user (1 profil mahasiswa demo tanpa autentikasi)  
> **Tech Stack**: React + Vite + Tailwind CSS (Frontend), Laravel 12 + SQLite (Backend)

---

## 1. Ringkasan & Tujuan Produk

Aplikasi **Mini KRS Mahasiswa** dirancang khusus untuk demonstrasi alur pengembangan aplikasi fullstack modern berbantuan AI (*AI-assisted fullstack development*). Sistem ini mensimulasikan proses pengisian Kartu Rencana Studi (KRS) mahasiswa dengan fokus pada:
- Kejelasan arsitektur fullstack dan pemisahan *concern* (Frontend React, Backend API Laravel, Database SQLite).
- Implementasi *business logic* yang ketat (beban studi 12 - 24 SKS & deteksi bentrok jadwal kuliah).
- Pengamanan REST API (*Rate Limiting Throttling*).
- Kelengkapan siklus akademik (pengisian draft -> pengajuan ke PA -> approval -> cetak slip KRS resmi).
- Kemudahan demonstrasi seminar (tersedia fitur simulasi approval dosen PA dan reset data demo).

---

## 2. Fitur Utama & Acceptance Criteria (AC)

### F1: Katalog & Daftar Mata Kuliah
* **Deskripsi**: Menampilkan daftar mata kuliah yang tersedia untuk diambil beserta kode, nama, bobot SKS, jadwal, dan dosen pengampu.
* **Acceptance Criteria**:
  - `[AC-1.1]` Menampilkan tabel/kartu mata kuliah dengan kolom: Kode, Nama MK, SKS, Jadwal (Hari, Jam Mulai - Jam Selesai), dan Dosen.
  - `[AC-1.2]` Memberikan indikator visual atau menonaktifkan tombol jika mata kuliah sudah masuk ke dalam daftar KRS yang dipilih.
  - `[AC-1.3]` Tersedia live search dan filter interaktif berdasarkan bobot SKS dan hari kuliah.

### F2: Tambah & Hapus Mata Kuliah ke/dari KRS
* **Deskripsi**: Mahasiswa dapat memilih mata kuliah untuk dimasukkan ke draft KRS atau membatalkannya.
* **Acceptance Criteria**:
  - `[AC-2.1]` Tombol **"Ambil"** menambahkan mata kuliah ke draft KRS.
  - `[AC-2.2]` Tombol **"Hapus/Batal"** mengeluarkan mata kuliah dari draft KRS.
  - `[AC-2.3]` Mata kuliah yang sama tidak dapat diambil dua kali (*duplicate check*).

### F3: Validasi Batas Rentang Beban Studi (Min 12 SKS, Maks 24 SKS)
* **Deskripsi**: Menghitung akumulasi total SKS secara real-time dan memastikan syarat beban studi terpenuhi.
* **Acceptance Criteria**:
  - `[AC-3.1]` Menampilkan counter total SKS terpilih (format: `X / 24 SKS`) dengan indikator progress bar dan penanda syarat minimum 12 SKS.
  - `[AC-3.2]` Di sisi Backend, request penambahan MK ditolak (`422`) jika total SKS melampaui 24 SKS.
  - `[AC-3.3]` Di sisi Backend, request pengajuan KRS (`POST /api/krs/ajukan`) ditolak (`422`) jika total SKS belum mencapai batas minimal 12 SKS.
  - `[AC-3.4]` Tombol "Ajukan KRS" di Frontend otomatis nonaktif dan menampilkan sisa SKS yang dibutuhkan bila total < 12 SKS.

### F4: Validasi Deteksi Bentrok Jadwal Kuliah (Schedule Conflict Detection)
* **Deskripsi**: Mencegah mahasiswa mengambil dua atau lebih mata kuliah yang jadwalnya saling tumpang tindih (*overlapping*).
* **Acceptance Criteria**:
  - `[AC-4.1]` Backend mengecek kesamaan hari dan bentrok rentang jam `(startA < endB && endA > startB)`.
  - `[AC-4.2]` Jika bentrok, backend mengembalikan respon `422` dengan detail nama mata kuliah dan jadwal yang bertabrakan.
  - `[AC-4.3]` Frontend menampilkan badge peringatan `Bentrok` dan menonaktifkan tombol "Ambil" untuk mata kuliah terkait.

### F5: Simpan & Status Pengajuan KRS
* **Deskripsi**: Menyimpan draft KRS ke database dan mengajukannya untuk disetujui Dosen Pembimbing Akademik (PA).
* **Acceptance Criteria**:
  - `[AC-5.1]` Terdapat tombol aksi **"Ajukan KRS ke Dosen PA"** (aktif jika SKS >= 12).
  - `[AC-5.2]` Status pengajuan memiliki 3 kondisi:
    - `DRAFT`: Mahasiswa bebas menambah dan menghapus mata kuliah.
    - `SUBMITTED`: Menunggu persetujuan Dosen PA; daftar KRS terkunci (*read-only*).
    - `APPROVED`: Disetujui Dosen PA; daftar KRS terkunci resmi.
  - `[AC-5.3]` Terdapat kontrol demo seminar:
    - **"Simulasi Setujui PA"**: Mengubah status dari `SUBMITTED` menjadi `APPROVED`.
    - **"Reset Demo Data"**: Mengembalikan kondisi KRS mahasiswa ke draft kosong/awal untuk pengujian berulang di panggung seminar.

### F6: Cetak / Export Lembar KRS Resmi (Print to PDF)
* **Deskripsi**: Mahasiswa dapat melihat preview dan mencetak dokumen sah Kartu Rencana Studi lengkap dengan kop universitas, tabel matakuliah, nomor registrasi dokumen, dan kolom tanda tangan Dosen PA.
* **Acceptance Criteria**:
  - `[AC-6.1]` Terdapat tombol **"Cetak Lembar KRS Resmi (PDF)"** yang aktif saat mata kuliah telah terisi/disetujui.
  - `[AC-6.2]` Menampilkan modal dokumen siap cetak berformat A4 dengan kop resmi kampus dan tanda tangan Dosen PA.
  - `[AC-6.3]` Menggunakan print stylesheet (`@media print`) sehingga browser mencetak dokumen bersih tanpa navbar atau kontrol dashboard.

### F7: Keamanan API & Throttling
* **Deskripsi**: Mencegah serangan spam / brute-force pada endpoint mutasi KRS.
* **Acceptance Criteria**:
  - `[AC-7.1]` Menerapkan middleware Laravel `throttle:60,1` (maksimal 60 request per menit per client) pada endpoint mutasi data.

---

## 3. Struktur Data (SQLite Schema)

### 3.1. Tabel `courses` (Master Mata Kuliah)
```sql
CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  schedule TEXT NOT NULL,
  day TEXT,
  start_time TEXT,
  end_time TEXT,
  lecturer TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 3.2. Tabel `krs_submissions` (Header Pengajuan Mahasiswa Demo)
```sql
CREATE TABLE krs_submissions (
  id INTEGER PRIMARY KEY DEFAULT 1,
  student_name TEXT NOT NULL,
  nim TEXT NOT NULL,
  total_credits INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK(status IN ('DRAFT', 'SUBMITTED', 'APPROVED')) DEFAULT 'DRAFT',
  submitted_at TIMESTAMP NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 3.3. Tabel `krs_items` (Detail Mata Kuliah Terpilih)
```sql
CREATE TABLE krs_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  krs_submission_id INTEGER NOT NULL DEFAULT 1,
  course_id INTEGER NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (krs_submission_id) REFERENCES krs_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(krs_submission_id, course_id)
);
```

---

## 4. Spesifikasi REST API

Base URL: `/api`

| Method | Endpoint | Deskripsi | Status Sukses | Proteksi / Validasi Bisnis |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/mata-kuliah` | Ambil katalog mata kuliah lengkap | `200 OK` | Cached / Public read |
| `GET` | `/krs` | Ambil data KRS aktif, total SKS & batas min/max | `200 OK` | Otomatis sinkronisasi beban studi |
| `POST` | `/krs` | Tambah MK ke draft KRS | `201 Created` | Throttle (60/min), Kunci Draft, Anti-Duplikat, Maks 24 SKS, Anti-Bentrok |
| `DELETE` | `/krs/{id}` | Hapus MK dari draft KRS | `200 OK` | Throttle (60/min), Kunci Draft |
| `POST` | `/krs/ajukan` | Ajukan KRS ke Dosen PA | `200 OK` | Throttle (60/min), **Wajib Minimal 12 SKS**, Ubah status ke `SUBMITTED` |
| `POST` | `/krs/reset` | Reset demo data atau simulasi approval | `200 OK` | Throttle (60/min), Reset draft |
