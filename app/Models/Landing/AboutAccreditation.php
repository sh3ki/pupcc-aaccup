<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AboutAccreditation extends Model
{
    use HasFactory;

    protected $table = 'about_accreditation_content';

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
     * Get the single accreditation content record or create one if it doesn't exist
     */
    public static function getContent()
    {
        $content = self::first();
        
        if (!$content) {
            $content = self::create([
                'hero_title' => 'Accreditation Task Force',
                'hero_subtitle' => 'Leading excellence in quality assurance and institutional development',
                'faculty_section_title' => 'Faculty Members',
                'faculty_data' => [
                    ['image' => '', 'name' => 'Dr. Maria Santos'],
                    ['image' => '', 'name' => 'Prof. Juan Dela Cruz'],
                    ['image' => '', 'name' => 'Dr. Ana Rodriguez'],
                    ['image' => '', 'name' => 'Prof. Carlos Mendoza'],
                    ['image' => '', 'name' => 'Prof. Elena Garcia'],
                    ['image' => '', 'name' => 'Dr. Robert Kim'],
                    ['image' => '', 'name' => 'Prof. Lisa Tan'],
                    ['image' => '', 'name' => 'Prof. Michael Wong']
                ],
                'mula_sayo_title' => 'Mula Sayo, Para Sa Bayan'
            ]);
        }
        
        return $content;
    }
}
