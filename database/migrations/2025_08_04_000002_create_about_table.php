<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('about', function (Blueprint $table) {
            $table->id();
            // Main About Section
            $table->string('title')->nullable();
            $table->text('subtitle')->nullable();
            $table->text('description')->nullable();
            $table->string('background_image')->nullable();
            // Optional: Add more sections as needed, similar to home table
            // Example: History Section
            $table->string('history_title')->nullable();
            $table->text('history_content')->nullable();
            // Example: Mission & Vision
            $table->string('mission_title')->nullable();
            $table->text('mission_content')->nullable();
            $table->string('vision_title')->nullable();
            $table->text('vision_content')->nullable();
            // Example: Accreditation Section
            $table->string('accreditation_title')->nullable();
            $table->text('accreditation_content')->nullable();
            // Example: Leadership Section
            $table->string('leadership_image')->nullable();
            $table->string('leadership_name')->nullable();
            $table->string('leadership_position')->nullable();
            $table->text('leadership_message')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('about');
    }
};
