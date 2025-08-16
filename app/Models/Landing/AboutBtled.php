<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AboutBtled extends Model
{
    use HasFactory;

    protected $table = 'about_btled_content';

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
     * Get the single BTLED content record or create one if it doesn't exist
     */
    public static function getContent()
    {
        $content = self::first();
        
        if (!$content) {
            $content = self::create([
                'hero_title' => 'BTLED Faculty',
                'hero_subtitle' => 'Bachelor of Technology and Livelihood Education',
                'faculty_section_title' => 'Faculty Members',
                'faculty_data' => [
                    ['image' => '', 'name' => 'Prof. Ana Reyes'],
                    ['image' => '', 'name' => 'Prof. Mark Villanueva'],
                    ['image' => '', 'name' => 'Dr. Sarah Martinez'],
                    ['image' => '', 'name' => 'Prof. James Torres'],
                    ['image' => '', 'name' => 'Prof. Linda Cruz'],
                    ['image' => '', 'name' => 'Dr. Michael Santos'],
                    ['image' => '', 'name' => 'Prof. Rosa Fernandez'],
                    ['image' => '', 'name' => 'Prof. David Gonzales'],
                    ['image' => '', 'name' => 'Prof. Carmen Valdez'],
                    ['image' => '', 'name' => 'Prof. Antonio Rivera'],
                    ['image' => '', 'name' => 'Prof. Gloria Morales'],
                    ['image' => '', 'name' => 'Prof. Eduardo Ramos']
                ],
                'mula_sayo_title' => 'Mula Sayo, Para Sa Bayan'
            ]);
        }
        
        return $content;
    }
}
