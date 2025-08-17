<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExhibitLicensure extends Model
{
    use HasFactory;

    protected $table = 'exhibit_licensure';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'section_title',
        'licensure_document',
        'footer_section_title',
        'footer_image',
    ];

    protected $casts = [
        'hero_subtitle' => 'string',
    ];

    /**
     * Get the first (and typically only) exhibit licensure record
     */
    public static function getContent()
    {
        $licensure = static::first();
        
        if (!$licensure) {
            // Create default licensure if none exists
            $licensure = static::create([
                'hero_title' => 'Licensure',
                'hero_subtitle' => 'Professional licensure examination results and achievements of PUP Calauan graduates',
                'section_title' => 'Licensure Preview',
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'licensure_document' => null,
                'footer_image' => null,
            ]);
        }

        return $licensure;
    }

    /**
     * Update the licensure content
     */
    public static function updateContent(array $data)
    {
        $licensure = static::first();
        
        if (!$licensure) {
            return static::create($data);
        }
        
        $licensure->update($data);
        return $licensure;
    }
}
