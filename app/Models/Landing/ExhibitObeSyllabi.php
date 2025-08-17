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
        'syllabi_document',
        'footer_section_title',
        'footer_image',
    ];

    protected $casts = [
        'hero_subtitle' => 'string',
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
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'syllabi_document' => null,
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
