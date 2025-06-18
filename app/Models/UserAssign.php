<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAssign extends Model
{
    use HasFactory;

    protected $table = 'user_assign';

    protected $fillable = [
        'user_id',
        'program_id',
        'area_id',
    ];

    public function program()
    {
        return $this->belongsTo(Program::class, 'program_id');
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function parameter()
    {
        return $this->belongsTo(Parameter::class, 'parameter_id');
    }
}
