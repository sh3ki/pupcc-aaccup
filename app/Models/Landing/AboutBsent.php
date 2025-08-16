<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AboutBsent extends Model
{
    use HasFactory;

    protected $table = 'about_bsent_content';

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
     * Get the single BSENT content record or create one if it doesn't exist
     */
    public static function getContent()
    {
        $content = self::first();
        
        if (!$content) {
            $content = self::create([
                'hero_title' => 'BSENT Faculty',
                'hero_subtitle' => 'Bachelor of Science in Entrepreneurship',
                'faculty_section_title' => 'Faculty Members',
                'faculty_data' => [
                    ['image' => '', 'name' => 'Prof. Carla Mendoza'],
                    ['image' => '', 'name' => 'Prof. Leo Garcia'],
                    ['image' => '', 'name' => 'Dr. Patricia Lopez'],
                    ['image' => '', 'name' => 'Prof. Ricardo Perez'],
                    ['image' => '', 'name' => 'Prof. Isabella Cruz'],
                    ['image' => '', 'name' => 'Dr. Fernando Reyes'],
                    ['image' => '', 'name' => 'Prof. Sophia Delgado'],
                    ['image' => '', 'name' => 'Prof. Gabriel Torres'],
                    ['image' => '', 'name' => 'Prof. Alejandra Vega'],
                    ['image' => '', 'name' => 'Prof. Andres Flores']
                ],
                'mula_sayo_title' => 'Mula Sayo, Para Sa Bayan'
            ]);
        }
        
        return $content;
    }
}