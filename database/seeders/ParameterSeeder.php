<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Parameter;
use App\Models\Area;
use App\Models\Program;

class ParameterSeeder extends Seeder
{
    public function run(): void
    {
        $parameters = [
            'I' => [
                ['code' => 'A', 'name' => 'Statement of Vision, Mission, Goals and Objectives'],
                ['code' => 'B', 'name' => 'Dissemination and Acceptability'],
            ],
            'II' => [
                ['code' => 'A', 'name' => 'Academic Qualifications and Professional Experience'],
                ['code' => 'B', 'name' => 'Recruitment, Selection and Orientation'],
                ['code' => 'C', 'name' => 'Faculty Adequacy and Loading'],
                ['code' => 'D', 'name' => 'Rank and Tenure'],
                ['code' => 'E', 'name' => 'Faculty Development'],
                ['code' => 'F', 'name' => 'Professional Performance and Scholarly Works'],
                ['code' => 'G', 'name' => 'Salaries, Fringe Benefits, and incentives'],
                ['code' => 'H', 'name' => 'Professionalism'],
            ],
            'III' => [
                ['code' => 'A', 'name' => 'Curriculum and Program of Studies'],
                ['code' => 'B', 'name' => 'instructional Process, Methodologies and Learning Opportunities'],
                ['code' => 'C', 'name' => 'Assessment of Academic Performance'],
                ['code' => 'D', 'name' => 'Management of Learning'],
                ['code' => 'E', 'name' => 'Graduation Requirements'],
                ['code' => 'F', 'name' => 'Administrative Support for Effective instruction'],
            ],
            'IV' => [
                ['code' => 'A', 'name' => 'Student Services Program (SSP)'],
                ['code' => 'B', 'name' => 'Student Welfare'],
                ['code' => 'C', 'name' => 'Student Development'],
                ['code' => 'D', 'name' => 'institutional Student and Programs and Services'],
                ['code' => 'E', 'name' => 'Research, Monitoring and Evaluation'],
            ],
            'V' => [
                ['code' => 'A', 'name' => 'Priorities and Relevance'],
                ['code' => 'B', 'name' => 'Funding and Other Resources'],
                ['code' => 'C', 'name' => 'Implementation, Monitoring, Evaluation and Utilization of Research Results/Outputs'],
                ['code' => 'D', 'name' => 'Publication and Dissemination'],
            ],
            'VI' => [
                ['code' => 'A', 'name' => 'Priorities and Relevance'],
                ['code' => 'B', 'name' => 'Planning, Implementation, Monitoring and Evaluation'],
                ['code' => 'C', 'name' => 'Funding and Other Resources'],
                ['code' => 'D', 'name' => "Community involvement and Participation in the institution's Activities"],
            ],
            'VII' => [
                ['code' => 'A', 'name' => 'Administration'],
                ['code' => 'B', 'name' => 'Administrative Staff'],
                ['code' => 'C', 'name' => 'Collection Development, Organization and Preservation'],
                ['code' => 'D', 'name' => 'Services and Utilization'],
                ['code' => 'E', 'name' => 'Physical Set-Up and Facilities'],
                ['code' => 'F', 'name' => 'Financial Support'],
                ['code' => 'G', 'name' => 'Linkages'],
            ],
            'VIII' => [
                ['code' => 'A', 'name' => 'Campus'],
                ['code' => 'B', 'name' => 'Buildings'],
                ['code' => 'C', 'name' => 'Classrooms'],
                ['code' => 'D', 'name' => 'offices and Staff Rooms'],
                ['code' => 'E', 'name' => 'Assembly, Athletic and Sports Facilities'],
                ['code' => 'F', 'name' => 'Medical and Dental Clinic'],
                ['code' => 'G', 'name' => 'Student Center'],
                ['code' => 'H', 'name' => 'Food Services / Canteen / Cafeteria'],
                ['code' => 'I', 'name' => 'Accreditation Center'],
                ['code' => 'J', 'name' => 'Housing'],
            ],
            'IX' => [
                ['code' => 'A', 'name' => 'Laboratories, Shops and Facilities'],
                ['code' => 'B', 'name' => 'Equipment, Supplies and Materials'],
                ['code' => 'C', 'name' => 'Maintenance'],
                ['code' => 'D', 'name' => 'Special Provisions'],
            ],
            'X' => [
                ['code' => 'A', 'name' => 'Organization'],
                ['code' => 'B', 'name' => 'Academic Administration'],
                ['code' => 'C', 'name' => 'Student Administration'],
                ['code' => 'D', 'name' => 'Financial Management'],
                ['code' => 'E', 'name' => 'Supply Management'],
                ['code' => 'F', 'name' => 'Records Management'],
                ['code' => 'G', 'name' => 'institutional Planning and Development'],
                ['code' => 'H', 'name' => 'Performance of Administrative Personnel'],
            ],
        ];

        $areas = Area::all();
        foreach ($areas as $area) {
            $areaParams = $parameters[$area->code] ?? [];
            foreach ($areaParams as $param) {
                Parameter::create([
                    'program_id' => $area->program_id,
                    'area_id' => $area->id,
                    'code' => $param['code'],
                    'name' => $param['name'],
                ]);
            }
        }
    }
}
