<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Area;
use App\Models\Program;

class AreaSeeder extends Seeder
{
    public function run(): void
    {
        $areas = [
            ['code' => 'I', 'name' => 'Vision, Mission, Goals and Objectives'],
            ['code' => 'II', 'name' => 'Faculty'],
            ['code' => 'III', 'name' => 'Curriculum and Instruction'],
            ['code' => 'IV', 'name' => 'Support to Students'],
            ['code' => 'V', 'name' => 'Research'],
            ['code' => 'VI', 'name' => 'Extension and Community Involvement'],
            ['code' => 'VII', 'name' => 'Library'],
            ['code' => 'VIII', 'name' => 'Physical Plant and Facilities'],
            ['code' => 'IX', 'name' => 'Laboratories'],
            ['code' => 'X', 'name' => 'Administration'],
        ];

        $programs = Program::all();
        foreach ($programs as $program) {
            foreach ($areas as $area) {
                Area::create([
                    'program_id' => $program->id,
                    'code' => $area['code'],
                    'name' => $area['name'],
                ]);
            }
        }
    }
}
