<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Program;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        Program::insert([
            ['code' => 'BTLED', 'name' => 'Bachelor of Technology and Livelihood Education', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'BSENT', 'name' => 'Bachelor of Science in Entrepreneurship', 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'BSIT', 'name' => 'Bachelor of Science in Information Technology', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
