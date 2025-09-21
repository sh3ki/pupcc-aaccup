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
        Schema::create('special_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->foreignId('area_id')->constrained()->onDelete('cascade');
            $table->enum('category', ['ppp', 'self-survey']); // PPP or Self-Survey
            $table->string('doc_filename');
            $table->string('video_filename')->nullable(); // For video files
            $table->enum('status', ['approved', 'pending', 'disapproved'])->default('pending');
            $table->foreignId('checked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->longText('comment')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('special_documents');
    }
};
