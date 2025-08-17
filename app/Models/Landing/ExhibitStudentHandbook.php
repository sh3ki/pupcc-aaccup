<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExhibitStudentHandbook extends Model
{
    use HasFactory;

    protected $table = 'exhibit_student_handbook';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'section_title',
        'handbook_document',
        'footer_section_title',
        'footer_image',
    ];

    protected $casts = [
        'hero_subtitle' => 'string',
    ];

    /**
     * Get the first (and typically only) exhibit student handbook record
     */
    public static function getContent()
    {
        $handbook = static::first();
        
        if (!$handbook) {
            // Create default handbook if none exists
            $handbook = static::create([
                'hero_title' => 'Student Handbook',
                'hero_subtitle' => 'Essential guide for student life and academic success at PUP Calauan',
                'section_title' => 'Student Handbook Preview',
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'handbook_document' => null,
                'footer_image' => null,
            ]);
        }

        return $handbook;
    }

    /**
     * Update the handbook content
     */
    public static function updateContent(array $data)
    {
        $handbook = static::first();
        
        if (!$handbook) {
            return static::create($data);
        }
        
        $handbook->update($data);
        return $handbook;
    }
}
