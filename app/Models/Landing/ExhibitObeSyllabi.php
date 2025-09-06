<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExhibitObeSyllabi extends Model
{
    use HasFactory;

    protected $table = 'exhibit_obe_syllabi';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'section_title',
        'program1_image',
        'program1_title',
        'program1_documents',
        'program2_image',
        'program2_title',
        'program2_documents',
        'program3_image',
        'program3_title',
        'program3_documents',
        'footer_section_title',
        'footer_image',
    ];

    protected $casts = [
        'hero_subtitle' => 'string',
        'program1_documents' => 'array',
        'program2_documents' => 'array',
        'program3_documents' => 'array',
    ];

    /**
     * Get the first (and typically only) exhibit OBE syllabi record
     */
    public static function getContent()
    {
        $syllabi = static::first();
        
        if (!$syllabi) {
            // Create default syllabi if none exists
            $syllabi = static::create([
                'hero_title' => 'OBE Syllabi',
                'hero_subtitle' => 'Outcomes-Based Education syllabi for comprehensive learning at PUP Calauan',
                'section_title' => 'OBE Syllabi Preview',
                'program1_title' => 'Bachelor of Technology and Livelihood Education',
                'program2_title' => 'Bachelor of Science in Entrepreneurship',
                'program3_title' => 'Bachelor of Science in Information Technology',
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'program1_image' => null,
                'program1_documents' => [],
                'program2_image' => null,
                'program2_documents' => [],
                'program3_image' => null,
                'program3_documents' => [],
                'footer_image' => null,
            ]);
        }

        return $syllabi;
    }

    /**
     * Update the syllabi content
     */
    public static function updateContent(array $data)
    {
        $syllabi = static::first();
        
        if (!$syllabi) {
            return static::create($data);
        }
        
        $syllabi->update($data);
        return $syllabi;
    }
}
