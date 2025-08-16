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
        Schema::create('about_accreditation_content', function (Blueprint $table) {
            $table->id();
            $table->string('hero_image')->nullable();
            $table->string('hero_title')->default('Accreditation Task Force');
            $table->string('hero_subtitle', 500)->default('Leading excellence in quality assurance and institutional development');
            $table->string('faculty_section_title')->default('Faculty Members');
            $table->json('faculty_data')->nullable();
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
        Schema::dropIfExists('about_accreditation_content');
    }
};
