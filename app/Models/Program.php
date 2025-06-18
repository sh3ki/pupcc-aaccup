<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
    ];

    // Optionally, add assignments relationship if needed
    // public function assignments()
    // {
    //     return $this->hasMany(UserAssign::class, 'program_id');
    // }
}
