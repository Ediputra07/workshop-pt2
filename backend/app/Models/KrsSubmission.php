<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KrsSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_name',
        'nim',
        'total_credits',
        'status',
        'submitted_at',
    ];

    public function items()
    {
        return $this->hasMany(KrsItem::class);
    }
}
