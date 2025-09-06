<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExhibitPsv extends Model
{
    use HasFactory;

    protected $table = 'exhibit_psv';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'section_title',
        'psv_document',
        'footer_section_title',
        'footer_image',
    ];

    protected $casts = [
        'hero_subtitle' => 'string',
    ];

    /**
     * Get the first (and typically only) exhibit PSV record
     */
    public static function getContent()
    {
        $psv = static::first();
        
        if (!$psv) {
            // Create default PSV if none exists
            $psv = static::create([
                'hero_title' => 'Primary Source Verification',
                'hero_subtitle' => 'Official PSV documents and verifications for PUP Calauan academic programs',
                'section_title' => 'Primary Source Verification Preview',
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'psv_document' => null,
                'footer_image' => null,
            ]);
        }

        return $psv;
    }

    /**
     * Update the PSV content
     */
    public static function updateContent(array $data)
    {
        $psv = static::first();
        
        if (!$psv) {
            return static::create($data);
        }
        
        $psv->update($data);
        return $psv;
    }
}
