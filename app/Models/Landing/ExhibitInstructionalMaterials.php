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
        'materials_document',
        'footer_section_title',
        'footer_image',
    ];

    protected $casts = [
        'hero_subtitle' => 'string',
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
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'materials_document' => null,
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
