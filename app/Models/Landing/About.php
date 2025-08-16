<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class About extends Model
{
    use HasFactory;

    protected $table = 'about_content';

    protected $fillable = [
        'hero_image',
        'hero_title',
        'hero_subtitle',
        'story_title',
        'story_content',
        'mission_title',
        'mission_content',
        'vision_title',
        'vision_content',
        'faculty_title',
        'faculty_data',
        'mula_sayo_title',
        'mula_sayo_image'
    ];

    protected $casts = [
        'faculty_data' => 'array'
    ];

    /**
     * Get the single about content record or create one if it doesn't exist
     */
    public static function getContent()
    {
        $content = self::first();
        
        if (!$content) {
            $content = self::create([
                'hero_title' => 'About PUP Calauan',
                'hero_subtitle' => 'Excellence in Education and Community Service',
                'story_title' => 'Our Story',
                'story_content' => 'The Polytechnic University of the Philippines - Calauan Campus was established to provide accessible and quality education to the youth of Calauan and nearby towns. Since its founding, PUP Calauan has been committed to academic excellence, community service, and nation-building. The campus continues to grow, offering innovative programs and fostering a culture of learning and inclusivity.',
                'mission_title' => 'Our Mission',
                'mission_content' => 'To provide quality and inclusive education that empowers students to become competent professionals and responsible citizens.',
                'vision_title' => 'Our Vision',
                'vision_content' => 'A leading polytechnic university recognized for excellence in education, research, and community service.',
                'faculty_title' => 'Our Faculty',
                'faculty_data' => [
                    ['image' => '', 'name' => 'Accreditation Task Force', 'description' => 'Leading the accreditation process and ensuring quality standards across all programs.'],
                    ['image' => '', 'name' => 'BTLED Faculty', 'description' => 'Bachelor of Technology and Livelihood Education program faculty and staff.'],
                    ['image' => '', 'name' => 'BSENT Faculty', 'description' => 'Bachelor of Science in Entrepreneurship program faculty and staff.'],
                    ['image' => '', 'name' => 'BSIT Faculty', 'description' => 'Bachelor of Science in Information Technology program faculty and staff.']
                ],
                'mula_sayo_title' => 'Mula Sayo, Para sa Bayan'
            ]);
        }
        
        return $content;
    }
}
