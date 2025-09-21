<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Program;
use App\Models\Area;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all existing programs
        $programs = Program::all();
        
        // Areas to add
        $newAreas = [
            ['code' => '', 'name' => 'PPP'],
            ['code' => '', 'name' => 'Self-Survey'],
        ];
        
        // Add new areas for each program
        foreach ($programs as $program) {
            foreach ($newAreas as $area) {
                Area::create([
                    'program_id' => $program->id,
                    'code' => $area['code'],
                    'name' => $area['name'],
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove the added areas
        Area::where('name', 'PPP')->delete();
        Area::where('name', 'Self-Survey')->delete();
    }
};
