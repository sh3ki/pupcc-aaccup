<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class About extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'subtitle',
        'description',
        'background_image',
        'history_title',
        'history_content',
        'mission_title',
        'mission_content',
        'vision_title',
        'vision_content',
        'accreditation_title',
        'accreditation_content',
        'leadership_image',
        'leadership_name',
        'leadership_position',
        'leadership_message',
    ];
}
