# Mini KRS Mahasiswa (Demo AI-Assisted Fullstack Development)

Aplikasi demonstrasi seminar pengisian Kartu Rencana Studi (KRS) mahasiswa menggunakan arsitektur fullstack terpisah (**React + Vite + Tailwind CSS** di frontend dan **Laravel 12 + SQLite** di backend).

---

## 🚀 Fitur Utama & Validasi Bisnis

1. **Katalog Mata Kuliah**:
   - Memuat 13 mata kuliah awal dari database SQLite via seeder.
   - Fitur pencarian real-time dan filter berdasarkan bobot SKS.
2. **Validasi Bisnis Ketat di Backend**:
   - **Maksimal 24 SKS**: Sistem otomatis menolak penambahan jika akumulasi SKS melebihi 24.
   - **Anti Duplikasi**: Mata kuliah yang sama tidak dapat diambil dua kali.
   - **Kunci KRS**: Setelah diajukan (*SUBMITTED* / *APPROVED*), KRS terkunci dan tidak dapat diubah (mutasi ditolak backend).
   - **Database Transaction (`DB::transaction`)**: Menjamin konsistensi data saat penambahan, penghapusan, dan pengajuan KRS.
3. **Fitur Demo Seminar**:
   - **Simulasi Setujui PA**: Mengubah status pengajuan menjadi `APPROVED` secara instan untuk kebutuhan presentasi.
   - **Reset Demo Data**: Mengosongkan draft kembali ke kondisi awal kapan saja.
   - **Loading state & toast notification**: Feedback interaktif saat aksi berhasil maupun gagal.

---

## 📂 Struktur Direktori Proyek

```text
workshop-pt2/
├── backend/                  # Laravel 12 API + SQLite
│   ├── app/
│   │   ├── Http/Controllers/Api/KrsController.php  # Logic & Validasi Bisnis
│   │   └── Models/                                 # Course, KrsSubmission, KrsItem
│   ├── database/
│   │   ├── database.sqlite                         # File SQLite Database
│   │   ├── migrations/                             # Skema tabel
│   │   └── seeders/DatabaseSeeder.php              # 13 Mata Kuliah & 1 Mahasiswa Demo
│   ├── routes/api.php                              # REST API endpoints
│   └── tests/Feature/KrsApiTest.php                # Automated business rule tests
├── frontend/                 # React 19 + Vite + Tailwind CSS v4
│   ├── src/
│   │   ├── services/api.js                         # Axios API Client
│   │   ├── App.jsx                                 # Dashboard KRS & Katalog Split View
│   │   └── index.css                               # Tailwind CSS Entry
│   └── vite.config.js                              # Proxy ke Laravel Backend
├── package.json              # Helper script root
├── prd.md                    # PRD Dokumen Spesifikasi
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

Buka terminal pertama di root folder proyek:

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

Buka terminal kedua di root folder proyek:

```bash
cd frontend
npm install
npm run dev
```
Buka browser Anda di `http://localhost:5173`. Frontend sudah dilengkapi proxy otomatis ke backend Laravel (`http://127.0.0.1:8000/api`).

---

## 🧪 Menjalankan Automated Test (Backend)

Untuk memverifikasi semua aturan bisnis bekerja dengan benar:

```bash
cd backend
php artisan test --filter=KrsApiTest
```

**Semua skenario pengujian**:
- `can get mata kuliah catalog`
- `can get krs status`
- `cannot take duplicate course`
- `cannot exceed 24 credits`
- `cannot modify krs after submitted`

---

## 🌐 Daftar Endpoint REST API

| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/mata-kuliah` | Mengambil seluruh katalog mata kuliah |
| `GET` | `/api/krs` | Mengambil data mahasiswa, daftar MK terpilih, dan total SKS |
| `POST` | `/api/krs` | Menambahkan mata kuliah ke KRS (`{ "course_id": 1 }`) |
| `DELETE` | `/api/krs/{id}` | Menghapus mata kuliah dari KRS |
| `POST` | `/api/krs/ajukan` | Mengajukan KRS ke Dosen PA (mengunci KRS) |
| `POST` | `/api/krs/reset` | Mereset KRS demo atau simulasi approval Dosen PA |
