<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\KrsSubmission;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Default Single Mahasiswa Demo
        KrsSubmission::updateOrCreate(
            ['id' => 1],
            [
                'student_name' => 'Ahmad Fauzi (Mahasiswa Demo)',
                'nim' => '2110512048',
                'total_credits' => 0,
                'status' => 'DRAFT',
            ]
        );

        $courses = [
            [
                'code' => 'IF2101',
                'name' => 'Pemrograman Berorientasi Objek',
                'credits' => 3,
                'schedule' => 'Senin, 08:00 - 10:30',
                'day' => 'Senin',
                'start_time' => '08:00',
                'end_time' => '10:30',
                'lecturer' => 'Dr. Eng. Ir. Hendra Gunawan, M.T.'
            ],
            [
                'code' => 'IF2102',
                'name' => 'Struktur Data & Algoritma',
                'credits' => 4,
                'schedule' => 'Senin, 13:00 - 16:20',
                'day' => 'Senin',
                'start_time' => '13:00',
                'end_time' => '16:20',
                'lecturer' => 'Siti Nurhaliza, S.Kom., M.Cs.'
            ],
            // Mata kuliah yang sengaja bentrok dengan IF2101 (Senin 09:00 - 11:30) untuk bahan demo
            [
                'code' => 'IF2114',
                'name' => 'Pengolahan Citra Digital (Kelas B)',
                'credits' => 3,
                'schedule' => 'Senin, 09:00 - 11:30',
                'day' => 'Senin',
                'start_time' => '09:00',
                'end_time' => '11:30',
                'lecturer' => 'Dr. Ahmad Dahlan, S.Si., M.T.'
            ],
            [
                'code' => 'IF2103',
                'name' => 'Basis Data Lanjutan',
                'credits' => 3,
                'schedule' => 'Selasa, 09:30 - 12:00',
                'day' => 'Selasa',
                'start_time' => '09:30',
                'end_time' => '12:00',
                'lecturer' => 'Bambang Sudarsono, M.Kom.'
            ],
            [
                'code' => 'IF2104',
                'name' => 'Rekayasa Perangkat Lunak',
                'credits' => 3,
                'schedule' => 'Selasa, 13:30 - 16:00',
                'day' => 'Selasa',
                'start_time' => '13:30',
                'end_time' => '16:00',
                'lecturer' => 'Dewi Sartika, S.T., M.T.'
            ],
            [
                'code' => 'IF2105',
                'name' => 'Pemrograman Web Fullstack',
                'credits' => 4,
                'schedule' => 'Rabu, 08:00 - 11:20',
                'day' => 'Rabu',
                'start_time' => '08:00',
                'end_time' => '11:20',
                'lecturer' => 'Rian Pratama, M.Kom.'
            ],
            [
                'code' => 'IF2106',
                'name' => 'Jaringan Komputer',
                'credits' => 3,
                'schedule' => 'Rabu, 13:00 - 15:30',
                'day' => 'Rabu',
                'start_time' => '13:00',
                'end_time' => '15:30',
                'lecturer' => 'Agus Priyono, S.Kom., M.T.'
            ],
            [
                'code' => 'IF2107',
                'name' => 'Kecerdasan Buatan & Machine Learning',
                'credits' => 3,
                'schedule' => 'Kamis, 08:00 - 10:30',
                'day' => 'Kamis',
                'start_time' => '08:00',
                'end_time' => '10:30',
                'lecturer' => 'Prof. Dr. Ir. Wahyu Wibowo'
            ],
            [
                'code' => 'IF2108',
                'name' => 'Sistem Operasi Modern',
                'credits' => 3,
                'schedule' => 'Kamis, 10:45 - 13:15',
                'day' => 'Kamis',
                'start_time' => '10:45',
                'end_time' => '13:15',
                'lecturer' => 'Eko Prasetyo, M.T.'
            ],
            [
                'code' => 'IF2109',
                'name' => 'Keamanan Siber & Kriptografi',
                'credits' => 3,
                'schedule' => 'Kamis, 14:00 - 16:30',
                'day' => 'Kamis',
                'start_time' => '14:00',
                'end_time' => '16:30',
                'lecturer' => 'Rahmat Hidayat, M.Kom., CEH'
            ],
            [
                'code' => 'IF2110',
                'name' => 'Interaksi Manusia dan Komputer (UI/UX)',
                'credits' => 2,
                'schedule' => 'Jumat, 08:00 - 09:40',
                'day' => 'Jumat',
                'start_time' => '08:00',
                'end_time' => '09:40',
                'lecturer' => 'Annisa Permata, S.Ds., M.Sn.'
            ],
            [
                'code' => 'IF2111',
                'name' => 'Cloud Computing & DevOps',
                'credits' => 3,
                'schedule' => 'Jumat, 13:30 - 16:00',
                'day' => 'Jumat',
                'start_time' => '13:30',
                'end_time' => '16:00',
                'lecturer' => 'Dimas Wicaksono, S.Kom., AWS-CA'
            ],
            [
                'code' => 'IF2112',
                'name' => 'Etika Profesi & Kapita Selekta TI',
                'credits' => 2,
                'schedule' => 'Sabtu, 09:00 - 10:40',
                'day' => 'Sabtu',
                'start_time' => '09:00',
                'end_time' => '10:40',
                'lecturer' => 'Dr. H. Mulyadi, M.Hum.'
            ],
            [
                'code' => 'IF2113',
                'name' => 'Mobile Application Development',
                'credits' => 3,
                'schedule' => 'Sabtu, 11:00 - 13:30',
                'day' => 'Sabtu',
                'start_time' => '11:00',
                'end_time' => '13:30',
                'lecturer' => 'Fajar Nugraha, M.Kom.'
            ],
        ];

        foreach ($courses as $c) {
            Course::updateOrCreate(['code' => $c['code']], $c);
        }
    }
}
