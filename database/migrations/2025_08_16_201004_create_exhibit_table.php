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
        Schema::create('exhibit', function (Blueprint $table) {
            $table->id();
            $table->string('hero_image')->nullable();
            $table->string('hero_title')->default('Exhibit');
            $table->string('hero_subtitle')->default('Comprehensive exhibit of university resources and documentation for academic excellence.');
            $table->string('exhibit_section_title')->default('University Exhibit Resources');
            $table->json('exhibit_data')->nullable();
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
        Schema::dropIfExists('exhibit');
    }
};
