<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExhibitUniversityPolicies extends Model
{
    use HasFactory;

    protected $table = 'exhibit_university_policies';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'section_title',
        'policies_document',
        'footer_section_title',
        'footer_image',
    ];

    protected $casts = [
        'hero_subtitle' => 'string',
    ];

    /**
     * Get the first (and typically only) exhibit university policies record
     */
    public static function getContent()
    {
        $policies = static::first();
        
        if (!$policies) {
            // Create default policies if none exists
            $policies = static::create([
                'hero_title' => 'University Policies & Guidelines',
                'hero_subtitle' => 'Comprehensive policies and guidelines governing PUP Calauan operations',
                'section_title' => 'University Policies Preview',
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'policies_document' => null,
                'footer_image' => null,
            ]);
        }

        return $policies;
    }

    /**
     * Update the policies content
     */
    public static function updateContent(array $data)
    {
        $policies = static::first();
        
        if (!$policies) {
            return static::create($data);
        }
        
        $policies->update($data);
        return $policies;
    }
}
