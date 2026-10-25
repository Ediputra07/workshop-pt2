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
                    '*' => ['id', 'code', 'name', 'credits', 'schedule'],
                ],
            ]);

        $this->assertGreaterThanOrEqual(12, count($response->json('data')));
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

    public function test_cannot_exceed_24_credits()
    {
        $courses = Course::all();
        $total = 0;

        foreach ($courses as $c) {
            if ($total + $c->credits <= 24) {
                $res = $this->postJson('/api/krs', ['course_id' => $c->id]);
                $res->assertStatus(201);
                $total += $c->credits;
            } else {
                // Course yang membuat total > 24 wajib ditolak backend
                $res = $this->postJson('/api/krs', ['course_id' => $c->id]);
                $res->assertStatus(422)
                    ->assertJson([
                        'success' => false,
                    ]);
                break;
            }
        }
    }

    public function test_cannot_modify_krs_after_submitted()
    {
        $course = Course::first();
        $this->postJson('/api/krs', ['course_id' => $course->id]);

        // Ajukan KRS
        $submitRes = $this->postJson('/api/krs/ajukan');
        $submitRes->assertStatus(200);

        // Coba tambah mata kuliah lain
        $otherCourse = Course::where('id', '!=', $course->id)->first();
        $addRes = $this->postJson('/api/krs', ['course_id' => $otherCourse->id]);
        $addRes->assertStatus(422);

        // Coba hapus mata kuliah
        $deleteRes = $this->deleteJson('/api/krs/' . $course->id);
        $deleteRes->assertStatus(422);
    }
}
