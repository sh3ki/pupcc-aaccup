<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExhibitCopc extends Model
{
    use HasFactory;

    protected $table = 'exhibit_copc';

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
     * Get the first (and typically only) exhibit COPC record
     */
    public static function getContent()
    {
        $copc = static::first();
        
        if (!$copc) {
            // Create default COPC if none exists
            $copc = static::create([
                'hero_title' => 'Certificate of Program Compliance',
                'hero_subtitle' => 'Official COPC certifications and compliance documents for PUP Calauan academic programs',
                'section_title' => 'Certificate of Program Compliance Preview',
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

        return $copc;
    }

    /**
     * Update the COPC content
     */
    public static function updateContent(array $data)
    {
        $copc = static::first();
        
        if (!$copc) {
            return static::create($data);
        }
        
        $copc->update($data);
        return $copc;
    }
}
