# Run this in your terminal:

php artisan tinker

# Then execute these commands in tinker:

# Check current data
$content = App\Models\Landing\ExhibitObeSyllabi::getContent();
dump($content->program3_documents);

# Add sample documents for BSIT
$bsitDocuments = [
    [
        'title' => 'BSIT First Year Syllabi',
        'file' => 'exhibit/obe-syllabi/program3/bsit-first-year.pdf'
    ],
    [
        'title' => 'BSIT Second Year Syllabi', 
        'file' => 'exhibit/obe-syllabi/program3/bsit-second-year.pdf'
    ],
    [
        'title' => 'BSIT Third Year Syllabi',
        'file' => 'exhibit/obe-syllabi/program3/bsit-third-year.pdf'
    ],
    [
        'title' => 'BSIT Fourth Year Syllabi',
        'file' => 'exhibit/obe-syllabi/program3/bsit-fourth-year.pdf'
    ]
];

# Update the data
App\Models\Landing\ExhibitObeSyllabi::updateContent([
    'program3_documents' => $bsitDocuments
]);

echo "BSIT documents updated!";

# Verify the update
$updated = App\Models\Landing\ExhibitObeSyllabi::getContent();
dump($updated->program3_documents);