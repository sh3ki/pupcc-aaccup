<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Area;
use App\Models\Parameter;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Remove any existing PPP and Self-Survey areas
        Area::whereIn('name', ['PPP', 'Self-Survey'])->delete();
        
        // Add PPP and Self-Survey as parameters for all existing areas
        $areas = Area::all();
        
        foreach ($areas as $area) {
            // Add PPP parameter
            Parameter::create([
                'program_id' => $area->program_id,
                'area_id' => $area->id,
                'code' => 'PPP',
                'name' => 'PPP',
            ]);
            
            // Add Self-Survey parameter
            Parameter::create([
                'program_id' => $area->program_id,
                'area_id' => $area->id,
                'code' => 'SS',
                'name' => 'Self-Survey',
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove PPP and Self-Survey parameters
        Parameter::whereIn('name', ['PPP', 'Self-Survey'])->delete();
        
        // Optionally, we could recreate PPP and Self-Survey areas here
        // but since they weren't in the original structure, we'll skip this
    }
};
