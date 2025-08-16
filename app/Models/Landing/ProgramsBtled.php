<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramsBtled extends Model
{
    use HasFactory;

    protected $table = 'programs_btled';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'overview_section_title',
        'program_description',
        'program_image',
        'objectives_section_title',
        'objectives_data',
        'avp_section_title',
        'program_video',
        'program_video_type',
        'action_section_title',
        'action_images',
        'graduates_section_title',
        'graduates_data',
        'accreditation_section_title',
        'accreditation_areas',
        'mula_sayo_title',
        'mula_sayo_image'
    ];

    protected $casts = [
        'objectives_data' => 'array',
        'action_images' => 'array',
        'graduates_data' => 'array',
        'accreditation_areas' => 'array'
    ];

    /**
     * Get the single BTLED content record or create one if it doesn't exist
     */
    public static function getContent()
    {
        $content = self::first();
        
        if (!$content) {
            $content = self::create([
                'hero_title' => 'Bachelor of Technology and Livelihood Education (BTLED)',
                'hero_subtitle' => 'Developing competent teachers in technology and livelihood education for the modern classroom.',
                'overview_section_title' => 'Program Overview',
                'program_description' => 'The BTLED program develops competent teachers in technology and livelihood education, combining practical and theoretical skills to prepare graduates for the modern classroom.',
                'objectives_section_title' => 'Program Objectives',
                'objectives_data' => [
                    'Develop professional teachers with strong pedagogical and technical skills.',
                    'Promote innovative teaching strategies in technology and livelihood education.',
                    'Foster lifelong learning and adaptability among graduates.',
                    'Encourage community involvement and extension services.',
                    'Prepare graduates for licensure and advanced studies.'
                ],
                'avp_section_title' => 'Program AVP',
                'program_video' => 'dQw4w9WgXcQ',
                'program_video_type' => 'youtube',
                'action_section_title' => 'Program in Action',
                'action_images' => ['', '', '', ''],
                'graduates_section_title' => 'Notable Graduates',
                'graduates_data' => [
                    [
                        'name' => 'Prof. Maria Dela Cruz',
                        'video' => '',
                        'video_type' => 'youtube'
                    ]
                ],
                'accreditation_section_title' => 'Accreditation Areas',
                'accreditation_areas' => [
                    ['title' => 'Area I: Vision, Mission, Goals and Objectives', 'image' => ''],
                    ['title' => 'Area II: Faculty', 'image' => ''],
                    ['title' => 'Area III: Curriculum and Instruction', 'image' => ''],
                    ['title' => 'Area IV: Support to Students', 'image' => ''],
                    ['title' => 'Area V: Research', 'image' => ''],
                    ['title' => 'Area VI: Extension and Community Involvement', 'image' => ''],
                    ['title' => 'Area VII: Library', 'image' => ''],
                    ['title' => 'Area VIII: Physical Plant and Facilities', 'image' => ''],
                    ['title' => 'Area IX: Laboratories', 'image' => ''],
                    ['title' => 'Area X: Administration', 'image' => '']
                ],
                'mula_sayo_title' => 'Mula Sayo, Para Sa Bayan'
            ]);
        }
        
        return $content;
    }
}