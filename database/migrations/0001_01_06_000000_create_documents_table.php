<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->foreignId('area_id')->constrained()->onDelete('cascade');
            $table->foreignId('parameter_id')->constrained()->onDelete('cascade');
            $table->enum('category', ['system', 'implementation', 'outcomes']);
            $table->string('doc_filename');
            $table->enum('status', ['approved', 'pending', 'disapproved'])->default('pending');
            $table->foreignId('checked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->longText('comment')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('documents');
    }
};
