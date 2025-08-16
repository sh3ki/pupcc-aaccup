<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    use HasFactory;

    protected $table = 'certificate';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'section_title',
        'certificate_document',
        'footer_section_title',
        'footer_image',
    ];

    protected $casts = [
        'hero_subtitle' => 'string',
    ];

    /**
     * Get the first (and typically only) certificate record
     */
    public static function getContent()
    {
        $certificate = static::first();
        
        if (!$certificate) {
            // Create default certificate if none exists
            $certificate = static::create([
                'hero_title' => 'Certificate of Authenticity',
                'hero_subtitle' => 'Official proof of authenticity for PUP Calauan documentation',
                'section_title' => 'Certificate Preview',
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'certificate_document' => null,
                'footer_image' => null,
            ]);
        }

        return $certificate;
    }

    /**
     * Update the certificate content
     */
    public static function updateContent(array $data)
    {
        $certificate = static::first();
        
        if (!$certificate) {
            return static::create($data);
        }
        
        $certificate->update($data);
        return $certificate;
    }
}
