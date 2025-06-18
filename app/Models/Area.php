<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;

    protected $fillable = [
        'program_id',
        'code',
        'name',
    ];

    // Optionally, add assignments relationship if needed
    // public function assignments()
    // {
    //     return $this->hasMany(UserAssign::class, 'area_id');
    // }
}
