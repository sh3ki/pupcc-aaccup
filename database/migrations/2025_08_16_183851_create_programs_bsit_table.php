<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('programs_bsit', function (Blueprint $table) {
            $table->id();
            $table->string('hero_image')->nullable();
            $table->string('hero_title')->default('Bachelor of Science in Information Technology (BSIT)');
            $table->text('hero_subtitle')->nullable();
            $table->string('overview_section_title')->default('Program Overview');
            $table->text('program_description')->nullable();
            $table->string('program_image')->nullable();
            $table->string('objectives_section_title')->default('Program Objectives');
            $table->json('objectives_data')->nullable();
            $table->string('avp_section_title')->default('Program AVP');
            $table->string('program_video')->nullable();
            $table->string('program_video_type')->default('youtube'); // youtube or upload
            $table->string('action_section_title')->default('Program in Action');
            $table->json('action_images')->nullable();
            $table->string('graduates_section_title')->default('Notable Graduates');
            $table->json('graduates_data')->nullable();
            $table->string('accreditation_section_title')->default('Accreditation Areas');
            $table->json('accreditation_areas')->nullable();
            $table->string('mula_sayo_title')->default('Mula Sayo, Para Sa Bayan');
            $table->string('mula_sayo_image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programs_bsit');
    }
};
