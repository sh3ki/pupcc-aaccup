<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Landing\Certificate;

class CertificateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Certificate::updateOrCreate(
            ['id' => 1],
            [
                'hero_title' => 'Certificate of Authenticity',
                'hero_subtitle' => 'Official proof of authenticity for PUP Calauan documentation',
                'section_title' => 'Certificate Preview',
                'footer_section_title' => 'Mula Sayo, Para Sa Bayan',
                'hero_image' => null,
                'certificate_document' => null,
                'footer_image' => null,
            ]
        );
    }
}
