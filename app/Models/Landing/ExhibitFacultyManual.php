<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExhibitFacultyManual extends Model
{
    use HasFactory;

    protected $table = 'exhibit_faculty_manual';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'section_title',
        'manual_document',
        'footer_section_title',
        'footer_image',
    ];

    protected $casts = [
        'hero_subtitle' => 'string',
    ];

    /**
     * Get the first (and typically only) exhibit faculty manual record
     */
    public static function getContent()
    {
        $manual = static::first();
        
        if (!$manual) {
            // Create default manual if none exists
            $manual = static::create([
                'hero_title' => 'Faculty Manual',
                'hero_subtitle' => 'Essential guidelines and procedures for PUP Calauan faculty members',
                'section_title' => 'Faculty Manual Preview',
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'manual_document' => null,
                'footer_image' => null,
            ]);
        }

        return $manual;
    }

    /**
     * Update the manual content
     */
    public static function updateContent(array $data)
    {
        $manual = static::first();
        
        if (!$manual) {
            return static::create($data);
        }
        
        $manual->update($data);
        return $manual;
    }
}
