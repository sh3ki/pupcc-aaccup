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
        'bor_document',
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
                'hero_subtitle' => 'Official documents and resolutions from the university Board of Regents',
                'section_title' => 'BOR Documents',
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'bor_document' => null,
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
