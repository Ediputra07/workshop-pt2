<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\KrsItem;
use App\Models\KrsSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KrsController extends Controller
{
    /**
     * Mendapatkan single submission demo (ID = 1).
     */
    private function getDemoSubmission(): KrsSubmission
    {
        return KrsSubmission::firstOrCreate(
            ['id' => 1],
            [
                'student_name' => 'Ahmad Fauzi (Mahasiswa Demo)',
                'nim' => '2110512048',
                'total_credits' => 0,
                'status' => 'DRAFT',
            ]
        );
    }

    /**
     * GET /api/mata-kuliah
     * Daftar katalog mata kuliah yang tersedia (otomatis seed jika kosong).
     */
    public function getMataKuliah()
    {
        if (Course::count() === 0) {
            \Illuminate\Support\Facades\Artisan::call('db:seed');
        }

        $courses = Course::orderBy('code')->get();
        return response()->json([
            'success' => true,
            'data' => $courses,
        ]);
    }


    /**
     * GET /api/krs
     * Status KRS dan mata kuliah yang sudah diambil.
     */
    public function getKrs()
    {
        $submission = $this->getDemoSubmission();
        
        // Load items beserta relasi courses
        $items = KrsItem::where('krs_submission_id', $submission->id)
            ->with('course')
            ->orderBy('id', 'desc')
            ->get();

        $totalCredits = $items->sum(function ($item) {
            return $item->course ? $item->course->credits : 0;
        });

        // Pastikan total_credits sinkron
        if ($submission->total_credits !== $totalCredits) {
            $submission->total_credits = $totalCredits;
            $submission->save();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $submission->id,
                'student_name' => $submission->student_name,
                'nim' => $submission->nim,
                'status' => $submission->status,
                'total_credits' => $totalCredits,
                'min_credits' => 12,
                'max_credits' => 24,
                'submitted_at' => $submission->submitted_at,
                'items' => $items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'course_id' => $item->course_id,
                        'code' => $item->course->code,
                        'name' => $item->course->name,
                        'credits' => $item->course->credits,
                        'schedule' => $item->course->schedule,
                        'day' => $item->course->day,
                        'start_time' => $item->course->start_time,
                        'end_time' => $item->course->end_time,
                        'lecturer' => $item->course->lecturer,
                        'created_at' => $item->created_at,
                    ];
                }),
            ],
        ]);
    }

    /**
     * POST /api/krs
     * Tambah mata kuliah ke KRS (validasi bisnis ketat di backend).
     */
    public function storeKrs(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
        ], [
            'course_id.required' => 'Mata kuliah wajib dipilih.',
            'course_id.exists' => 'Mata kuliah tidak ditemukan dalam katalog.',
        ]);

        return DB::transaction(function () use ($validated) {
            $submission = $this->getDemoSubmission();

            // 1. Validasi: Tidak boleh mengubah KRS setelah diajukan
            if ($submission->status !== 'DRAFT') {
                return response()->json([
                    'success' => false,
                    'message' => 'KRS sudah diajukan (Status: ' . $submission->status . ') dan tidak dapat diubah.',
                ], 422);
            }

            // 2. Validasi: Tidak boleh duplikat mata kuliah
            $alreadyTaken = KrsItem::where('krs_submission_id', $submission->id)
                ->where('course_id', $validated['course_id'])
                ->exists();

            if ($alreadyTaken) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mata kuliah ini sudah ada di dalam daftar KRS Anda.',
                ], 422);
            }

            $targetCourse = Course::findOrFail($validated['course_id']);

            // 3. Validasi: Total SKS maksimal 24
            $currentCredits = KrsItem::where('krs_submission_id', $submission->id)
                ->join('courses', 'krs_items.course_id', '=', 'courses.id')
                ->sum('courses.credits');

            $newTotal = $currentCredits + $targetCourse->credits;

            if ($newTotal > 24) {
                return response()->json([
                    'success' => false,
                    'message' => "Gagal menambahkan mata kuliah. Total SKS akan menjadi {$newTotal} SKS (Batas maksimal adalah 24 SKS).",
                ], 422);
            }

            // 4. Validasi: Deteksi bentrok jadwal kuliah (Schedule Conflict Detection)
            if ($targetCourse->day && $targetCourse->start_time && $targetCourse->end_time) {
                $existingItems = KrsItem::where('krs_submission_id', $submission->id)
                    ->with('course')
                    ->get();

                foreach ($existingItems as $item) {
                    $c = $item->course;
                    if ($c && $c->day === $targetCourse->day && $c->start_time && $c->end_time) {
                        // Cek rentang waktu bertabrakan: (startA < endB) && (endA > startB)
                        $isOverlap = ($targetCourse->start_time < $c->end_time) && ($targetCourse->end_time > $c->start_time);
                        if ($isOverlap) {
                            return response()->json([
                                'success' => false,
                                'message' => "Jadwal bentrok dengan mata kuliah {$c->name} ({$c->code}) pada {$c->schedule}.",
                            ], 422);
                        }
                    }
                }
            }

            // Tambahkan item KRS
            KrsItem::create([
                'krs_submission_id' => $submission->id,
                'course_id' => $targetCourse->id,
            ]);

            // Update total credits
            $submission->total_credits = $newTotal;
            $submission->save();

            return response()->json([
                'success' => true,
                'message' => "Mata kuliah {$targetCourse->name} ({$targetCourse->credits} SKS) berhasil ditambahkan.",
                'data' => [
                    'total_credits' => $newTotal,
                ],
            ], 201);
        });
    }

    /**
     * DELETE /api/krs/:id
     * Hapus mata kuliah dari KRS (id parameter bisa course_id atau item_id).
     */
    public function destroyKrs($id)
    {
        return DB::transaction(function () use ($id) {
            $submission = $this->getDemoSubmission();

            // 1. Validasi: Tidak boleh mengubah KRS setelah diajukan
            if ($submission->status !== 'DRAFT') {
                return response()->json([
                    'success' => false,
                    'message' => 'KRS sudah diajukan (Status: ' . $submission->status . ') dan tidak dapat diubah.',
                ], 422);
            }

            // Cari item berdasarkan item ID atau course_id
            $item = KrsItem::where('krs_submission_id', $submission->id)
                ->where(function ($query) use ($id) {
                    $query->where('id', $id)->orWhere('course_id', $id);
                })
                ->first();

            if (!$item) {
                return response()->json([
                    'success' => false,
                    'message' => 'Mata kuliah tidak ditemukan dalam KRS Anda.',
                ], 404);
            }

            $courseName = $item->course ? $item->course->name : 'Mata Kuliah';
            $item->delete();

            // Recalculate total credits
            $newTotal = KrsItem::where('krs_submission_id', $submission->id)
                ->join('courses', 'krs_items.course_id', '=', 'courses.id')
                ->sum('courses.credits');

            $submission->total_credits = $newTotal;
            $submission->save();

            return response()->json([
                'success' => true,
                'message' => "Mata kuliah {$courseName} berhasil dihapus dari KRS.",
                'data' => [
                    'total_credits' => $newTotal,
                ],
            ]);
        });
    }

    /**
     * POST /api/krs/ajukan
     * Ajukan KRS ke dosen PA (wajib minimal 12 SKS).
     */
    public function ajukanKrs()
    {
        return DB::transaction(function () {
            $submission = $this->getDemoSubmission();

            if ($submission->status !== 'DRAFT') {
                return response()->json([
                    'success' => false,
                    'message' => 'KRS sudah pernah diajukan sebelumnya (Status: ' . $submission->status . ').',
                ], 422);
            }

            // Hitung total SKS terkini
            $currentCredits = KrsItem::where('krs_submission_id', $submission->id)
                ->join('courses', 'krs_items.course_id', '=', 'courses.id')
                ->sum('courses.credits');

            if ($currentCredits === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'KRS masih kosong. Silakan ambil mata kuliah terlebih dahulu.',
                ], 422);
            }

            // Validasi batas minimum 12 SKS
            if ($currentCredits < 12) {
                return response()->json([
                    'success' => false,
                    'message' => "Beban studi belum memenuhi syarat minimal 12 SKS (Saat ini: {$currentCredits} SKS). Silakan tambah mata kuliah lagi sebelum mengajukan.",
                ], 422);
            }

            $submission->total_credits = $currentCredits;
            $submission->status = 'SUBMITTED';
            $submission->submitted_at = now();
            $submission->save();

            return response()->json([
                'success' => true,
                'message' => 'KRS berhasil diajukan ke Dosen Pembimbing Akademik! Pengisian KRS sekarang terkunci.',
                'data' => [
                    'status' => $submission->status,
                    'total_credits' => $submission->total_credits,
                    'submitted_at' => $submission->submitted_at,
                ],
            ]);
        });
    }

    /**
     * POST /api/krs/reset
     * Fitur khusus demo seminar untuk mereset data ke draft kosong atau mensimulasikan status lain.
     */
    public function resetDemo(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $submission = $this->getDemoSubmission();

            $action = $request->input('action', 'reset');

            if ($action === 'approve') {
                $submission->status = 'APPROVED';
                $submission->save();
                return response()->json([
                    'success' => true,
                    'message' => 'Status KRS berhasil disetujui (APPROVED) oleh Dosen PA untuk simulasi demo.',
                    'data' => $submission,
                ]);
            }

            if ($action === 'unsubmit') {
                $submission->status = 'DRAFT';
                $submission->save();
                return response()->json([
                    'success' => true,
                    'message' => 'Status KRS dikembalikan ke DRAFT.',
                    'data' => $submission,
                ]);
            }

            // Default: reset total item & draft
            KrsItem::where('krs_submission_id', $submission->id)->delete();
            $submission->status = 'DRAFT';
            $submission->total_credits = 0;
            $submission->submitted_at = null;
            $submission->save();

            return response()->json([
                'success' => true,
                'message' => 'KRS demo berhasil direset ke kondisi awal (Draft kosong).',
                'data' => $submission,
            ]);
        });
    }
}
