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
        'memorandum_document',
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
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'memorandum_document' => null,
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
