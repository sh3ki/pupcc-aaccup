<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AboutBsit extends Model
{
    use HasFactory;

    protected $table = 'about_bsit_content';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'faculty_section_title',
        'faculty_data',
        'mula_sayo_title',
        'mula_sayo_image'
    ];

    protected $casts = [
        'faculty_data' => 'array'
    ];

    /**
     * Get the single BSIT content record or create one if it doesn't exist
     */
    public static function getContent()
    {
        $content = self::first();
        
        if (!$content) {
            $content = self::create([
                'hero_title' => 'BSIT Faculty',
                'hero_subtitle' => 'Bachelor of Science in Information Technology',
                'faculty_section_title' => 'Faculty Members',
                'faculty_data' => [
                    ['image' => '', 'name' => 'Prof. Jenny Lim'],
                    ['image' => '', 'name' => 'Prof. Eric Tan'],
                    ['image' => '', 'name' => 'Dr. Alexandra Chen'],
                    ['image' => '', 'name' => 'Prof. Daniel Kim'],
                    ['image' => '', 'name' => 'Prof. Melissa Wong'],
                    ['image' => '', 'name' => 'Dr. Kevin Martinez'],
                    ['image' => '', 'name' => 'Prof. Amanda Rodriguez'],
                    ['image' => '', 'name' => 'Prof. Brian Thompson'],
                    ['image' => '', 'name' => 'Prof. Rachel Park'],
                    ['image' => '', 'name' => 'Prof. Steven Lee'],
                    ['image' => '', 'name' => 'Prof. Nicole Johnson'],
                    ['image' => '', 'name' => 'Prof. Christopher Davis'],
                    ['image' => '', 'name' => 'Prof. Jessica Brown'],
                    ['image' => '', 'name' => 'Prof. Ryan Wilson'],
                    ['image' => '', 'name' => 'Prof. Michelle Garcia']
                ],
                'mula_sayo_title' => 'Mula Sayo, Para Sa Bayan'
            ]);
        }
        
        return $content;
    }
}