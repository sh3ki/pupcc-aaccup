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
        Schema::create('certificate', function (Blueprint $table) {
            $table->id();
            
            // Hero Section
            $table->string('hero_image')->nullable();
            $table->string('hero_title')->nullable();
            $table->string('hero_subtitle')->nullable();
            
            // Certificate Section
            $table->string('section_title')->nullable();
            $table->string('certificate_document')->nullable(); // Can be image, docx, or pdf
            
            // Mula Sayo Para Sa Bayan Section
            $table->string('footer_section_title')->nullable();
            $table->string('footer_image')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('certificate');
    }
};
