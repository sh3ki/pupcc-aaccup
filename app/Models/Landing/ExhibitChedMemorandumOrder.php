<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExhibitChedMemorandumOrder extends Model
{
    use HasFactory;

    protected $table = 'exhibit_ched_memorandum_order';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'section_title',
        'program1_image',
        'program1_title',
        'program1_document',
        'program2_image',
        'program2_title',
        'program2_document',
        'program3_image',
        'program3_title',
        'program3_document',
        'footer_section_title',
        'footer_image',
    ];

    protected $casts = [
        'hero_subtitle' => 'string',
    ];

    /**
     * Get the first (and typically only) exhibit CHED memorandum order record
     */
    public static function getContent()
    {
        $memorandum = static::first();
        
        if (!$memorandum) {
            // Create default memorandum if none exists
            $memorandum = static::create([
                'hero_title' => 'CHED Memorandum Order',
                'hero_subtitle' => 'Official CHED memoranda and orders affecting PUP Calauan academic programs',
                'section_title' => 'CHED Memorandum Order Preview',
                'program1_title' => 'Bachelor of Technology and Livelihood Education',
                'program2_title' => 'Bachelor of Science in Entrepreneurship',
                'program3_title' => 'Bachelor of Science in Information Technology',
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'program1_image' => null,
                'program1_document' => null,
                'program2_image' => null,
                'program2_document' => null,
                'program3_image' => null,
                'program3_document' => null,
                'footer_image' => null,
            ]);
        }

        return $memorandum;
    }

    /**
     * Update the memorandum content
     */
    public static function updateContent(array $data)
    {
        $memorandum = static::first();
        
        if (!$memorandum) {
            return static::create($data);
        }
        
        $memorandum->update($data);
        return $memorandum;
    }
}
