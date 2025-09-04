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
        'copc_document',
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
                'hero_subtitle' => 'Official certification documents validating program compliance with educational standards',
                'section_title' => 'COPC Documents',
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'copc_document' => null,
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
