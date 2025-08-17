<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('home_content', function (Blueprint $table) {
            $table->id();
            
            // Hero Carousel Section
            $table->json('carousel_data')->nullable(); // Array of {image, title, subtitle}
            
            // Accreditors Section
            $table->string('accreditors_title')->default('Welcome PUP Calauan Accreditors');
            $table->json('accreditors_data')->nullable(); // Array of {image, name, position}
            
            // Director Message Section
            $table->string('director_section_title')->default('Message from the Director');
            $table->text('director_message')->nullable();
            $table->string('director_image')->nullable();
            $table->string('director_name')->nullable();
            $table->string('director_position')->nullable();
            
            // Campus Videos Section
            $table->string('videos_section_title')->default('Campus Videos');
            $table->json('videos_data')->nullable(); // Array of {youtube_id, title, thumbnail}
            
            // Programs Section
            $table->string('programs_section_title')->default('Programs under Survey');
            $table->json('programs_data')->nullable(); // Array of {image, name, description}
            
            // Quick Links Section
            $table->string('quick_links_title')->default('Quick Links');
            $table->json('quick_links_data')->nullable(); // Array of {url, title}
            
            // Mula Sayo Section
            $table->string('mula_sayo_title')->default('Mula Sayo, Para sa Bayan');
            $table->string('mula_sayo_image')->nullable();
            
            $table->timestamps();
        });
        
        // Insert default data
        DB::table('home_content')->insert([
            'carousel_data' => json_encode([
                ['image' => '', 'title' => 'Welcome to PUP Calauan', 'subtitle' => 'Excellence in Education'],
                ['image' => '', 'title' => 'Academic Excellence', 'subtitle' => 'Nurturing Future Leaders'],
                ['image' => '', 'title' => 'Student Life', 'subtitle' => 'Building Character and Skills'],
                ['image' => '', 'title' => 'Campus Facilities', 'subtitle' => 'Modern Learning Environment']
            ]),
            'accreditors_data' => json_encode([
                ['image' => '', 'name' => 'Dr. Maria Santos', 'position' => 'Lead Accreditor'],
                ['image' => '', 'name' => 'Prof. Juan Dela Cruz', 'position' => 'Program Evaluator'],
                ['image' => '', 'name' => 'Dr. Ana Rodriguez', 'position' => 'Quality Assessor'],
                ['image' => '', 'name' => 'Prof. Carlos Mendoza', 'position' => 'Standards Reviewer']
            ]),
            'director_message' => 'Welcome to PUP Calauan Campus. We are committed to providing quality education and fostering excellence in our students.',
            'director_name' => 'Dr. Campus Director',
            'director_position' => 'Campus Director',
            'videos_data' => json_encode([
                ['title' => 'Campus Overview', 'video' => 'dQw4w9WgXcQ', 'video_type' => 'youtube', 'thumbnail' => ''],
                ['title' => 'Student Life', 'video' => 'dQw4w9WgXcQ', 'video_type' => 'youtube', 'thumbnail' => ''],
                ['title' => 'Academic Excellence', 'video' => 'dQw4w9WgXcQ', 'video_type' => 'youtube', 'thumbnail' => '']
            ]),
            'programs_data' => json_encode([
                ['image' => '', 'name' => 'Bachelor of Technology and Livelihood Education', 'description' => 'A program designed to develop competent teachers in technology and livelihood education.'],
                ['image' => '', 'name' => 'Bachelor of Science in Entrepreneurship', 'description' => 'A program that nurtures innovative and entrepreneurial mindsets.'],
                ['image' => '', 'name' => 'Bachelor of Science in Information Technology', 'description' => 'A comprehensive IT program focusing on software development and networking.']
            ]),
            'quick_links_data' => json_encode([
                ['url' => 'https://pup.edu.ph', 'title' => 'PUP Website'],
                ['url' => 'https://sis.pup.edu.ph', 'title' => 'PUP SIS'],
                ['url' => 'https://facebook.com/PUPOfficial', 'title' => 'PUP Facebook']
            ]),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('home_content');
    }
};