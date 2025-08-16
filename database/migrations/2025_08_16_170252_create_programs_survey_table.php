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
        Schema::create('programs_survey', function (Blueprint $table) {
            $table->id();
            $table->string('hero_image')->nullable();
            $table->string('hero_title')->default('Programs Under Survey');
            $table->string('hero_subtitle')->default('Comprehensive programs designed to meet industry standards and educational excellence.');
            $table->string('programs_section_title')->default('Our Programs');
            $table->json('programs_data')->nullable();
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
        Schema::dropIfExists('programs_survey');
    }
};
