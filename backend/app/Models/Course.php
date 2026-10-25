<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'credits',
        'schedule',
        'lecturer',
    ];

    public function krsItems()
    {
        return $this->hasMany(KrsItem::class);
    }
}
