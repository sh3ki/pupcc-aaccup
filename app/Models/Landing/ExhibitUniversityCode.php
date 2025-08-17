<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExhibitUniversityCode extends Model
{
    use HasFactory;

    protected $table = 'exhibit_university_code';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'section_title',
        'code_document',
        'footer_section_title',
        'footer_image',
    ];

    protected $casts = [
        'hero_subtitle' => 'string',
    ];

    /**
     * Get the first (and typically only) exhibit university code record
     */
    public static function getContent()
    {
        $code = static::first();
        
        if (!$code) {
            // Create default code if none exists
            $code = static::create([
                'hero_title' => 'University Code',
                'hero_subtitle' => 'Official university code of conduct and policies for the PUP Calauan community',
                'section_title' => 'University Code Preview',
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'code_document' => null,
                'footer_image' => null,
            ]);
        }

        return $code;
    }

    /**
     * Update the code content
     */
    public static function updateContent(array $data)
    {
        $code = static::first();
        
        if (!$code) {
            return static::create($data);
        }
        
        $code->update($data);
        return $code;
    }
}
