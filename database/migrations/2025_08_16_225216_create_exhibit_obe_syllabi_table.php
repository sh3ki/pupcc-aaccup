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
        Schema::create('exhibit_obe_syllabi', function (Blueprint $table) {
            $table->id();
            
            // Hero Section
            $table->string('hero_image')->nullable();
            $table->string('hero_title')->default("OBE Syllabi");
            $table->string('hero_subtitle')->default('Outcome-based education syllabi and curriculum documents');
            
            // Syllabi Section
            $table->string('section_title')->default("OBE Syllabi Preview");
            $table->string('syllabi_document')->nullable(); // Can be image, docx, or pdf
            
            // Mula Sayo Para Sa Bayan Section
            $table->string('footer_section_title')->default('Mula Sayo, Para Sa Bayan');
            $table->string('footer_image')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exhibit_obe_syllabi');
    }
};
