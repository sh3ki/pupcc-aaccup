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
        Schema::create('about_content', function (Blueprint $table) {
            $table->id();
            
            // Hero Section
            $table->string('hero_image')->nullable();
            $table->string('hero_title')->default('About PUP Calauan');
            $table->string('hero_subtitle')->default('Excellence in Education and Community Service');
            
            // Our Story Section
            $table->string('story_title')->default('Our Story');
            $table->text('story_content')->nullable();
            
            // Mission Section
            $table->string('mission_title')->default('Our Mission');
            $table->text('mission_content')->nullable();
            
            // Vision Section
            $table->string('vision_title')->default('Our Vision');
            $table->text('vision_content')->nullable();
            
            // Faculty Section
            $table->string('faculty_title')->default('Our Faculty');
            $table->json('faculty_data')->nullable(); // Array of {image, name, description}
            
            // Mula Sayo Section
            $table->string('mula_sayo_title')->default('Mula Sayo, Para sa Bayan');
            $table->string('mula_sayo_image')->nullable();
            
            $table->timestamps();
        });
        
        // Insert default data
        DB::table('about_content')->insert([
            'hero_title' => 'About PUP Calauan',
            'hero_subtitle' => 'Excellence in Education and Community Service',
            'story_title' => 'Our Story',
            'story_content' => 'The Polytechnic University of the Philippines - Calauan Campus was established to provide accessible and quality education to the youth of Calauan and nearby towns. Since its founding, PUP Calauan has been committed to academic excellence, community service, and nation-building. The campus continues to grow, offering innovative programs and fostering a culture of learning and inclusivity.',
            'mission_title' => 'Our Mission',
            'mission_content' => 'To provide quality and inclusive education that empowers students to become competent professionals and responsible citizens.',
            'vision_title' => 'Our Vision',
            'vision_content' => 'A leading polytechnic university recognized for excellence in education, research, and community service.',
            'faculty_title' => 'Our Faculty',
            'faculty_data' => json_encode([
                ['image' => '', 'name' => 'Accreditation Task Force', 'description' => 'Leading the accreditation process and ensuring quality standards across all programs.'],
                ['image' => '', 'name' => 'BTLED Faculty', 'description' => 'Bachelor of Technology and Livelihood Education program faculty and staff.'],
                ['image' => '', 'name' => 'BSENT Faculty', 'description' => 'Bachelor of Science in Entrepreneurship program faculty and staff.'],
                ['image' => '', 'name' => 'BSIT Faculty', 'description' => 'Bachelor of Science in Information Technology program faculty and staff.']
            ]),
            'mula_sayo_title' => 'Mula Sayo, Para sa Bayan',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('about_content');
    }
};