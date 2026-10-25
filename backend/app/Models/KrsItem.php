<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KrsItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'krs_submission_id',
        'course_id',
    ];

    public function submission()
    {
        return $this->belongsTo(KrsSubmission::class, 'krs_submission_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id');
    }
}
