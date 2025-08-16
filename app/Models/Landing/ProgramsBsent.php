<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramsBsent extends Model
{
    use HasFactory;

    protected $table = 'programs_bsent';

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
     * Get the single BSENT content record or create one if it doesn't exist
     */
    public static function getContent()
    {
        $content = self::first();
        
        if (!$content) {
            $content = self::create([
                'hero_title' => 'Bachelor of Science in Entrepreneurship (BSENT)',
                'hero_subtitle' => 'Nurturing innovative and entrepreneurial mindsets, preparing students to launch and manage successful business ventures.',
                'overview_section_title' => 'Program Overview',
                'program_description' => 'The BSENT program nurtures innovative and entrepreneurial mindsets, preparing students to launch and manage successful business ventures.',
                'objectives_section_title' => 'Program Objectives',
                'objectives_data' => [
                    'Develop entrepreneurial leaders with ethical values.',
                    'Equip students with practical business planning and management skills.',
                    'Foster innovation and creativity in business solutions.',
                    'Promote research and extension in entrepreneurship.',
                    'Prepare graduates for self-employment and enterprise creation.'
                ],
                'avp_section_title' => 'Program AVP',
                'program_video' => 'dQw4w9WgXcQ',
                'program_video_type' => 'youtube',
                'action_section_title' => 'Program in Action',
                'action_images' => ['', '', '', ''],
                'graduates_section_title' => 'Notable Graduates',
                'graduates_data' => [
                    [
                        'name' => 'Mr. Juan Entrepreneur',
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
