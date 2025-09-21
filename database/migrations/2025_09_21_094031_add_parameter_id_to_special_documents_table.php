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
        Schema::table('special_documents', function (Blueprint $table) {
            $table->foreignId('parameter_id')->nullable()->after('area_id')->constrained('parameters')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('special_documents', function (Blueprint $table) {
            $table->dropForeign(['parameter_id']);
            $table->dropColumn('parameter_id');
        });
    }
};
