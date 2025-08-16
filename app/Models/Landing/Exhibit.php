<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exhibit extends Model
{
    use HasFactory;

    protected $table = 'exhibit';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'exhibit_section_title',
        'exhibit_data',
        'mula_sayo_title',
        'mula_sayo_image'
    ];

    protected $casts = [
        'exhibit_data' => 'array'
    ];

    /**
     * Get the single Exhibit content record or create one if it doesn't exist
     */
    public static function getContent()
    {
        $content = self::first();
        
        if (!$content) {
            $content = self::create([
                'hero_title' => 'Exhibit',
                'hero_subtitle' => 'Comprehensive exhibit of university resources and documentation for academic excellence.',
                'exhibit_section_title' => 'University Exhibit Resources',
                'exhibit_data' => [
                    [
                        'image' => '',
                        'title' => "Citizen's Charter",
                        'subtitle' => "View the Citizen's Charter."
                    ],
                    [
                        'image' => '',
                        'title' => 'Student Handbook',
                        'subtitle' => 'Access the Student Handbook.'
                    ],
                    [
                        'image' => '',
                        'title' => 'University Code',
                        'subtitle' => 'Read the University Code.'
                    ],
                    [
                        'image' => '',
                        'title' => 'University Policies & Guidelines',
                        'subtitle' => 'Policies and guidelines for the university.'
                    ],
                    [
                        'image' => '',
                        'title' => 'OBE Syllabi',
                        'subtitle' => 'Outcomes-Based Education syllabi.'
                    ],
                    [
                        'image' => '',
                        'title' => 'Instructional Materials',
                        'subtitle' => 'Instructional materials for faculty and students.'
                    ],
                    [
                        'image' => '',
                        'title' => 'Faculty Manual',
                        'subtitle' => 'Manual for faculty members.'
                    ],
                    [
                        'image' => '',
                        'title' => 'Administrative Manual',
                        'subtitle' => 'Manual for administrative staff.'
                    ],
                    [
                        'image' => '',
                        'title' => 'CHED Memorandum Order',
                        'subtitle' => 'CHED orders and memoranda.'
                    ],
                    [
                        'image' => '',
                        'title' => 'Licensure',
                        'subtitle' => 'Licensure exam information and results.'
                    ]
                ],
                'mula_sayo_title' => 'Mula Sayo, Para Sa Bayan'
            ]);
        }
        
        return $content;
    }
}
