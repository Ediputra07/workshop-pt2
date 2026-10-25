<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\KrsItem;
use App\Models\KrsSubmission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KrsApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_can_get_mata_kuliah_catalog()
    {
        $response = $this->getJson('/api/mata-kuliah');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'code', 'name', 'credits', 'schedule', 'day', 'start_time', 'end_time'],
                ],
            ]);

        $this->assertGreaterThanOrEqual(13, count($response->json('data')));
    }

    public function test_can_get_krs_status()
    {
        $response = $this->getJson('/api/krs');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'student_name' => 'Ahmad Fauzi (Mahasiswa Demo)',
                    'status' => 'DRAFT',
                    'total_credits' => 0,
                    'min_credits' => 12,
                    'max_credits' => 24,
                ],
            ]);
    }

    public function test_cannot_take_duplicate_course()
    {
        $course = Course::first();

        // Ambil pertama kali
        $first = $this->postJson('/api/krs', ['course_id' => $course->id]);
        $first->assertStatus(201);

        // Ambil kedua kali (duplikat)
        $second = $this->postJson('/api/krs', ['course_id' => $course->id]);
        $second->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Mata kuliah ini sudah ada di dalam daftar KRS Anda.',
            ]);
    }

    public function test_cannot_take_overlapping_schedule_courses()
    {
        // IF2101: Senin, 08:00 - 10:30
        $course1 = Course::where('code', 'IF2101')->first();
        // IF2114: Senin, 09:00 - 11:30 (overlap)
        $conflictCourse = Course::where('code', 'IF2114')->first();

        $this->assertNotNull($course1);
        $this->assertNotNull($conflictCourse);

        // Ambil MK pertama
        $res1 = $this->postJson('/api/krs', ['course_id' => $course1->id]);
        $res1->assertStatus(201);

        // Ambil MK kedua yang jadwalnya overlap
        $res2 = $this->postJson('/api/krs', ['course_id' => $conflictCourse->id]);
        $res2->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);

        $this->assertStringContainsString('Jadwal bentrok', $res2->json('message'));
    }

    public function test_cannot_exceed_24_credits()
    {
        $courses = Course::all();
        $total = 0;

        foreach ($courses as $c) {
            $res = $this->postJson('/api/krs', ['course_id' => $c->id]);
            if ($res->status() === 201) {
                $total += $c->credits;
            } elseif ($res->status() === 422) {
                $this->assertFalse($res->json('success'));
            }
        }
        $this->assertLessThanOrEqual(24, $total);
    }

    public function test_cannot_submit_krs_below_12_credits()
    {
        // Ambil hanya 1 mata kuliah (3 SKS)
        $course = Course::where('code', 'IF2101')->first();
        $this->postJson('/api/krs', ['course_id' => $course->id]);

        // Coba ajukan saat baru 3 SKS (wajib ditolak)
        $submitRes = $this->postJson('/api/krs/ajukan');
        $submitRes->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);

        $this->assertStringContainsString('minimal 12 SKS', $submitRes->json('message'));
    }

    public function test_can_submit_krs_when_credits_at_least_12()
    {
        // Ambil mata kuliah non-bentrok sampai >= 12 SKS
        // IF2101 (3 SKS, Senin), IF2102 (4 SKS, Senin siang), IF2103 (3 SKS, Selasa), IF2104 (3 SKS, Selasa siang) -> Total 13 SKS
        $codes = ['IF2101', 'IF2102', 'IF2103', 'IF2104'];
        foreach ($codes as $code) {
            $c = Course::where('code', $code)->first();
            $this->postJson('/api/krs', ['course_id' => $c->id])->assertStatus(201);
        }

        // Sekarang ajukan KRS
        $submitRes = $this->postJson('/api/krs/ajukan');
        $submitRes->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'status' => 'SUBMITTED',
                ],
            ]);
    }

    public function test_cannot_modify_krs_after_submitted()
    {
        // Ambil >= 12 SKS agar bisa diajukan
        $codes = ['IF2101', 'IF2102', 'IF2103', 'IF2104'];
        foreach ($codes as $code) {
            $c = Course::where('code', $code)->first();
            $this->postJson('/api/krs', ['course_id' => $c->id]);
        }

        // Ajukan KRS
        $submitRes = $this->postJson('/api/krs/ajukan');
        $submitRes->assertStatus(200);

        // Coba tambah mata kuliah lain
        $otherCourse = Course::where('code', 'IF2105')->first();
        $addRes = $this->postJson('/api/krs', ['course_id' => $otherCourse->id]);
        $addRes->assertStatus(422);

        // Coba hapus salah satu mata kuliah
        $courseToDelete = Course::where('code', 'IF2101')->first();
        $deleteRes = $this->deleteJson('/api/krs/' . $courseToDelete->id);
        $deleteRes->assertStatus(422);
    }
}
