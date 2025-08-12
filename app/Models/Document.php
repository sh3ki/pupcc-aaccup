<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'program_id',
        'area_id',
        'parameter_id',
        'category',
        'doc_filename',
        'video_filename',
        'status',
        'checked_by',
        'comment',
    ];

    // Accessor for type (file extension from doc_filename)
    public function getTypeAttribute()
    {
        return pathinfo($this->doc_filename, PATHINFO_EXTENSION);
    }

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

    public function parameter()
    {
        return $this->belongsTo(Parameter::class);
    }

    // The reviewer who approved/disapproved the document
    public function checker()
    {
        return $this->belongsTo(User::class, 'checked_by');
    }
}
