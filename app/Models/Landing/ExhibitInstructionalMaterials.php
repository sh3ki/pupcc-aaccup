<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExhibitInstructionalMaterials extends Model
{
    use HasFactory;

    protected $table = 'exhibit_instructional_materials';

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
     * Get the first (and typically only) exhibit instructional materials record
     */
    public static function getContent()
    {
        $materials = static::first();
        
        if (!$materials) {
            // Create default materials if none exists
            $materials = static::create([
                'hero_title' => 'Instructional Materials',
                'hero_subtitle' => 'Educational resources and materials for effective learning at PUP Calauan',
                'section_title' => 'Instructional Materials Preview',
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

        return $materials;
    }

    /**
     * Update the materials content
     */
    public static function updateContent(array $data)
    {
        $materials = static::first();
        
        if (!$materials) {
            return static::create($data);
        }
        
        $materials->update($data);
        return $materials;
    }
}
