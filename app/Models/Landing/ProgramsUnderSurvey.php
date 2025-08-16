<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramsUnderSurvey extends Model
{
    use HasFactory;

    protected $table = 'programs_survey';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'programs_section_title',
        'programs_data',
        'mula_sayo_title',
        'mula_sayo_image'
    ];

    protected $casts = [
        'programs_data' => 'array'
    ];

    /**
     * Get the single Programs content record or create one if it doesn't exist
     */
    public static function getContent()
    {
        $content = self::first();
        
        if (!$content) {
            $content = self::create([
                'hero_title' => 'Programs Under Survey',
                'hero_subtitle' => 'Comprehensive programs designed to meet industry standards and educational excellence.',
                'programs_section_title' => 'Our Programs',
                'programs_data' => [
                    [
                        'image' => '',
                        'title' => 'Bachelor of Technology and Livelihood Education',
                        'short' => 'BTLED',
                        'description' => 'Developing competent teachers in technology and livelihood education for the modern classroom.',
                        'href' => '/programs/btled'
                    ],
                    [
                        'image' => '',
                        'title' => 'Bachelor of Science in Entrepreneurship',
                        'short' => 'BSENT',
                        'description' => 'Nurturing entrepreneurial mindsets to launch and manage successful ventures.',
                        'href' => '/programs/bsent'
                    ],
                    [
                        'image' => '',
                        'title' => 'Bachelor of Science in Information Technology',
                        'short' => 'BSIT',
                        'description' => 'Comprehensive IT program focusing on software, networking, and system administration.',
                        'href' => '/programs/bsit'
                    ]
                ],
                'mula_sayo_title' => 'Mula Sayo, Para Sa Bayan'
            ]);
        }
        
        return $content;
    }
}