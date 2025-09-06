<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExhibitBor extends Model
{
    use HasFactory;

    protected $table = 'exhibit_bor';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'section_title',
        'program1_image',
        'program1_title',
        'program1_document',
        'program2_image',
        'program2_title',
        'program2_document',
        'program3_image',
        'program3_title',
        'program3_document',
        'footer_section_title',
        'footer_image',
    ];

    protected $casts = [
        'hero_subtitle' => 'string',
    ];

    /**
     * Get the first (and typically only) exhibit BOR record
     */
    public static function getContent()
    {
        $bor = static::first();
        
        if (!$bor) {
            // Create default BOR if none exists
            $bor = static::create([
                'hero_title' => 'Board of Regents',
                'hero_subtitle' => 'Official BOR resolutions and decisions affecting PUP Calauan academic programs',
                'section_title' => 'Board of Regents Preview',
                'program1_title' => 'Bachelor of Technology and Livelihood Education',
                'program2_title' => 'Bachelor of Science in Entrepreneurship',
                'program3_title' => 'Bachelor of Science in Information Technology',
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'program1_image' => null,
                'program1_document' => null,
                'program2_image' => null,
                'program2_document' => null,
                'program3_image' => null,
                'program3_document' => null,
                'footer_image' => null,
            ]);
        }

        return $bor;
    }

    /**
     * Update the BOR content
     */
    public static function updateContent(array $data)
    {
        $bor = static::first();
        
        if (!$bor) {
            return static::create($data);
        }
        
        $bor->update($data);
        return $bor;
    }
}
