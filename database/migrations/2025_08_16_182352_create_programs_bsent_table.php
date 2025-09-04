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
        Schema::create('programs_bsent', function (Blueprint $table) {
            $table->id();
            $table->string('hero_image')->nullable();
            $table->string('hero_title')->nullable();
            $table->text('hero_subtitle')->nullable();
            $table->string('overview_section_title')->nullable();
            $table->text('program_description')->nullable();
            $table->string('program_image')->nullable();
            $table->string('objectives_section_title')->nullable();
            $table->json('objectives_data')->nullable();
            $table->string('avp_section_title')->nullable();
            $table->string('program_video')->nullable();
            $table->string('program_video_type')->default('youtube'); // youtube or upload
            $table->string('action_section_title')->nullable();
            $table->json('action_images')->nullable();
            $table->string('graduates_section_title')->nullable();
            $table->json('graduates_data')->nullable();
            $table->string('accreditation_section_title')->nullable();
            $table->json('accreditation_areas')->nullable();
            $table->string('mula_sayo_title')->nullable();
            $table->string('mula_sayo_image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programs_bsent');
    }
};
