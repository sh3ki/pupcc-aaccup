<?php

namespace App\Models\Landing;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Home extends Model
{
    use HasFactory;

    protected $table = 'home_content';

    protected $fillable = [
        'carousel_data',
        'accreditors_title',
        'accreditors_data',
        'director_section_title',
        'director_message',
        'director_image',
        'director_name',
        'director_position',
        'videos_section_title',
        'videos_data',
        'programs_section_title',
        'programs_data',
        'quick_links_title',
        'quick_links_data',
        'mula_sayo_title',
        'mula_sayo_image'
    ];

    protected $casts = [
        'carousel_data' => 'array',
        'accreditors_data' => 'array',
        'videos_data' => 'array',
        'programs_data' => 'array',
        'quick_links_data' => 'array'
    ];

    /**
     * Get the single landing content record or create one if it doesn't exist
     */
    public static function getContent()
    {
        $content = self::first();
        
        if (!$content) {
            $content = self::create([
                'carousel_data' => [
                    ['image' => '', 'title' => 'Welcome to PUP Calauan', 'subtitle' => 'Excellence in Education'],
                    ['image' => '', 'title' => 'Academic Excellence', 'subtitle' => 'Nurturing Future Leaders'],
                    ['image' => '', 'title' => 'Student Life', 'subtitle' => 'Building Character and Skills'],
                    ['image' => '', 'title' => 'Campus Facilities', 'subtitle' => 'Modern Learning Environment']
                ],
                'accreditors_title' => 'Welcome PUP Calauan Accreditors',
                'accreditors_data' => [
                    ['image' => '', 'name' => 'Dr. Maria Santos', 'position' => 'Lead Accreditor'],
                    ['image' => '', 'name' => 'Prof. Juan Dela Cruz', 'position' => 'Program Evaluator'],
                    ['image' => '', 'name' => 'Dr. Ana Rodriguez', 'position' => 'Quality Assessor'],
                    ['image' => '', 'name' => 'Prof. Carlos Mendoza', 'position' => 'Standards Reviewer']
                ],
                'director_section_title' => 'Message from the Director',
                'director_message' => 'Welcome to PUP Calauan Campus. We are committed to providing quality education and fostering excellence in our students.',
                'director_name' => 'Dr. Campus Director',
                'director_position' => 'Campus Director',
                'videos_section_title' => 'Campus Videos',
                'videos_data' => [
                    ['title' => 'Campus Overview', 'video' => 'dQw4w9WgXcQ', 'video_type' => 'youtube', 'thumbnail' => ''],
                    ['title' => 'Student Life', 'video' => 'dQw4w9WgXcQ', 'video_type' => 'youtube', 'thumbnail' => ''],
                    ['title' => 'Academic Excellence', 'video' => 'dQw4w9WgXcQ', 'video_type' => 'youtube', 'thumbnail' => '']
                ],
                'programs_section_title' => 'Programs under Survey',
                'programs_data' => [
                    ['image' => '', 'name' => 'Bachelor of Technology and Livelihood Education', 'description' => 'A program designed to develop competent teachers in technology and livelihood education.'],
                    ['image' => '', 'name' => 'Bachelor of Science in Entrepreneurship', 'description' => 'A program that nurtures innovative and entrepreneurial mindsets.'],
                    ['image' => '', 'name' => 'Bachelor of Science in Information Technology', 'description' => 'A comprehensive IT program focusing on software development and networking.']
                ],
                'quick_links_title' => 'Quick Links',
                'quick_links_data' => [
                    ['url' => 'https://pup.edu.ph', 'title' => 'PUP Website'],
                    ['url' => 'https://sis.pup.edu.ph', 'title' => 'PUP SIS'],
                    ['url' => 'https://facebook.com/PUPOfficial', 'title' => 'PUP Facebook']
                ],
                'mula_sayo_title' => 'Mula Sayo, Para sa Bayan'
            ]);
        }
        
        return $content;
    }
}
