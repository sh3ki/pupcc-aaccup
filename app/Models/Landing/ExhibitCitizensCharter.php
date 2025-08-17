<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExhibitCitizensCharter extends Model
{
    use HasFactory;

    protected $table = 'exhibit_citizens_charter';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'section_title',
        'charter_document',
        'footer_section_title',
        'footer_image',
    ];

    protected $casts = [
        'hero_subtitle' => 'string',
    ];

    /**
     * Get the first (and typically only) exhibit citizens charter record
     */
    public static function getContent()
    {
        $charter = static::first();
        
        if (!$charter) {
            // Create default charter if none exists
            $charter = static::create([
                'hero_title' => "Citizen's Charter",
                'hero_subtitle' => 'Official guidelines and procedures for citizens accessing PUP Calauan services',
                'section_title' => "Citizen's Charter Preview",
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'charter_document' => null,
                'footer_image' => null,
            ]);
        }

        return $charter;
    }

    /**
     * Update the charter content
     */
    public static function updateContent(array $data)
    {
        $charter = static::first();
        
        if (!$charter) {
            return static::create($data);
        }
        
        $charter->update($data);
        return $charter;
    }
}