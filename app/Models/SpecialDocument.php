<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpecialDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'program_id',
        'area_id',
        'category',
        'doc_filename',
        'video_filename',
        'status',
        'checked_by',
        'comment',
    ];

    protected $casts = [
        'category' => 'string',
        'status' => 'string',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function checkedBy()
    {
        return $this->belongsTo(User::class, 'checked_by');
    }
}
