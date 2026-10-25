# Mini KRS Mahasiswa (Demo AI-Assisted Fullstack Development)

Aplikasi demonstrasi seminar pengisian Kartu Rencana Studi (KRS) mahasiswa menggunakan arsitektur fullstack terpisah (**React + Vite + Tailwind CSS** di frontend dan **Laravel 12 + SQLite** di backend).

---

## 🚀 Fitur Utama & Validasi Bisnis

1. **Katalog Mata Kuliah**:
   - Memuat 14 mata kuliah awal dari database SQLite via seeder.
   - Fitur pencarian real-time dan multi-filter berdasarkan bobot SKS serta Hari Kuliah (Senin - Sabtu).
2. **Validasi Bisnis Ketat di Backend**:
   - **Maksimal 24 SKS**: Sistem otomatis menolak penambahan jika akumulasi SKS melebihi 24.
   - **Anti Duplikasi**: Mata kuliah yang sama tidak dapat diambil dua kali.
   - **Deteksi Bentrok Jadwal (Schedule Conflict Detection)**: Menolak pengambilan mata kuliah bila hari dan rentang jamnya saling bertabrakan dengan mata kuliah yang sudah ada di KRS.
   - **Kunci KRS**: Setelah diajukan (*SUBMITTED* / *APPROVED*), KRS terkunci dan tidak dapat diubah (mutasi ditolak backend).
   - **Database Transaction (`DB::transaction`)**: Menjamin konsistensi data secara atomik saat penambahan, penghapusan, dan pengajuan KRS.
3. **Cetak / Export Lembar KRS Resmi (Print to PDF)**:
   - Preview lembar KRS berstandar akademik lengkap dengan kop resmi universitas, data mahasiswa, tabel mata kuliah, stempel digital, dan kolom tanda tangan Dosen PA.
   - Desain cetak responsif menggunakan *print stylesheet* (`@media print`) sehingga langsung siap cetak atau simpan sebagai file PDF tanpa gangguan elemen dashboard.
4. **Fitur Demo Seminar**:
   - **Simulasi Setujui PA**: Mengubah status pengajuan menjadi `APPROVED` secara instan untuk kebutuhan presentasi.
   - **Reset Demo Data**: Mengosongkan draft kembali ke kondisi awal kapan saja.
   - **Loading state & toast notification**: Feedback visual interaktif saat aksi berhasil maupun gagal.

---

## 📂 Struktur Direktori Proyek

```text
workshop-pt2/
├── backend/                  # Laravel 12 API + SQLite
│   ├── app/
│   │   ├── Http/Controllers/Api/KrsController.php  # Logic & Validasi Bisnis (24 SKS & Bentrok)
│   │   └── Models/                                 # Course, KrsSubmission, KrsItem
│   ├── database/
│   │   ├── database.sqlite                         # File SQLite Database
│   │   ├── migrations/                             # Skema tabel (termasuk day, start_time, end_time)
│   │   └── seeders/DatabaseSeeder.php              # 14 Mata Kuliah & 1 Mahasiswa Demo
│   ├── routes/api.php                              # REST API endpoints
│   └── tests/Feature/KrsApiTest.php                # Automated business rule tests (6 passed)
├── frontend/                 # React 19 + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── components/
│   │   │   └── KrsPrintModal.jsx                   # Dokumen Lembar KRS Resmi (Siap Cetak PDF)
│   │   ├── services/api.js                         # Axios API Client
│   │   ├── App.jsx                                 # Dashboard KRS & Katalog Split View
│   │   └── index.css                               # Tailwind CSS Entry & Print Stylesheet
│   └── vite.config.js                              # Proxy ke Laravel Backend
├── package.json              # Helper script root
├── prd.md                    # PRD Dokumen Spesifikasi Terkini
└── README.md
```

---

## 🛠️ Prasyarat Sistem

- **PHP** >= 8.2 (dengan ekstensi `pdo_sqlite` aktif)
- **Composer**
- **Node.js** >= 18.x & **NPM**

---

## ⚡ Langkah Instalasi & Menjalankan Aplikasi

### 1. Backend Setup (Laravel 12 + SQLite)

Buka terminal di folder backend:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Inisialisasi tabel dan seed data mata kuliah ke SQLite:
```bash
php artisan migrate:fresh --seed
```

Jalankan server backend (port 8000):
```bash
php artisan serve --port=8000
```
Backend API akan aktif di `http://127.0.0.1:8000`.

---

### 2. Frontend Setup (React + Vite + Tailwind)

Buka terminal di folder frontend:

```bash
cd frontend
npm install
npm run dev
```
Buka browser Anda di `http://localhost:5173` (atau port yang tampil di terminal).

---

## 🧪 Menjalankan Automated Test (Backend)

Untuk memverifikasi semua aturan bisnis bekerja dengan benar:

```bash
cd backend
php artisan test --filter=KrsApiTest
```

**Semua 6 skenario pengujian**:
- `can get mata kuliah catalog`
- `can get krs status`
- `cannot take duplicate course`
- `cannot take overlapping schedule courses`
- `cannot exceed 24 credits`
- `cannot modify krs after submitted`

---

## 🌐 Daftar Endpoint REST API

| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/mata-kuliah` | Mengambil seluruh katalog mata kuliah beserta hari dan jam |
| `GET` | `/api/krs` | Mengambil data mahasiswa, daftar MK terpilih, dan total SKS |
| `POST` | `/api/krs` | Menambahkan mata kuliah ke KRS (`{ "course_id": 1 }`) |
| `DELETE` | `/api/krs/{id}` | Menghapus mata kuliah dari KRS |
| `POST` | `/api/krs/ajukan` | Mengajukan KRS ke Dosen PA (mengunci KRS) |
| `POST` | `/api/krs/reset` | Mereset KRS demo atau simulasi approval Dosen PA |
