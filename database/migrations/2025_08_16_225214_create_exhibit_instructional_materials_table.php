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
        Schema::create('exhibit_instructional_materials', function (Blueprint $table) {
            $table->id();
            
            // Hero Section
            $table->string('hero_image')->nullable();
            $table->string('hero_title')->nullable();
            $table->string('hero_subtitle')->nullable();
            
            // Materials Section
            $table->string('section_title')->nullable();
            $table->string('materials_document')->nullable(); // Can be image, docx, or pdf
            
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
        Schema::dropIfExists('exhibit_instructional_materials');
    }
};
