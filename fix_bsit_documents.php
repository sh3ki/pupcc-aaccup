<?php
require_once 'bootstrap/app.php';

use App\Models\Landing\ExhibitObeSyllabi;

echo "Checking current OBE Syllabi data...\n";

$content = ExhibitObeSyllabi::getContent();

echo "Current program3_documents (BSIT): ";
var_dump($content->program3_documents);

echo "\nUpdating BSIT documents...\n";

// Sample documents for BSIT program
$bsitDocuments = [
    [
        'title' => 'BSIT Course Syllabi - First Year',
        'file' => 'exhibit/obe-syllabi/program3/bsit-first-year-syllabi.pdf'
    ],
    [
        'title' => 'BSIT Course Syllabi - Second Year', 
        'file' => 'exhibit/obe-syllabi/program3/bsit-second-year-syllabi.pdf'
    ],
    [
        'title' => 'BSIT Course Syllabi - Third Year',
        'file' => 'exhibit/obe-syllabi/program3/bsit-third-year-syllabi.pdf'
    ],
    [
        'title' => 'BSIT Course Syllabi - Fourth Year',
        'file' => 'exhibit/obe-syllabi/program3/bsit-fourth-year-syllabi.pdf'
    ]
];

ExhibitObeSyllabi::updateContent([
    'program3_documents' => $bsitDocuments
]);

echo "BSIT documents updated successfully!\n";

$updatedContent = ExhibitObeSyllabi::getContent();
echo "Updated program3_documents (BSIT): ";
var_dump($updatedContent->program3_documents);