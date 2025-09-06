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
            
            // Programs Section
            $table->string('section_title')->nullable();
            
            // Program 1
            $table->string('program1_image')->nullable();
            $table->string('program1_title')->nullable();
            $table->json('program1_documents')->nullable(); // JSON array of documents with titles
            
            // Program 2
            $table->string('program2_image')->nullable();
            $table->string('program2_title')->nullable();
            $table->json('program2_documents')->nullable(); // JSON array of documents with titles
            
            // Program 3
            $table->string('program3_image')->nullable();
            $table->string('program3_title')->nullable();
            $table->json('program3_documents')->nullable(); // JSON array of documents with titles
            
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
