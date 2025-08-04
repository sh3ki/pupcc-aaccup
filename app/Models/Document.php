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
        'parameter_id', // added
        'doc_filename', 
        'category',        
        'video_filename',  
        'status',
    ];

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
}
