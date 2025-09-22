# INSTRUCTIONAL MATERIALS - DOCUMENT POPULATION FIX

## Run this in Laravel Tinker:

```bash
php artisan tinker
```

## Then execute these commands:

```php
# Check current instructional materials data
$content = App\Models\Landing\ExhibitInstructionalMaterials::getContent();
dump($content->toArray());

# Add sample documents for all programs
$program1Documents = [
    [
        'title' => 'BTLE Teaching Materials - Basic Education',
        'file' => 'exhibit/instructional-materials/program1/btle-basic-education-materials.pdf'
    ],
    [
        'title' => 'BTLE Practical Worksheets', 
        'file' => 'exhibit/instructional-materials/program1/btle-practical-worksheets.pdf'
    ],
    [
        'title' => 'BTLE Assessment Tools',
        'file' => 'exhibit/instructional-materials/program1/btle-assessment-tools.pdf'
    ]
];

$program2Documents = [
    [
        'title' => 'Entrepreneurship Case Studies',
        'file' => 'exhibit/instructional-materials/program2/entrepreneurship-case-studies.pdf'
    ],
    [
        'title' => 'Business Plan Templates', 
        'file' => 'exhibit/instructional-materials/program2/business-plan-templates.pdf'
    ],
    [
        'title' => 'Market Research Guidelines',
        'file' => 'exhibit/instructional-materials/program2/market-research-guidelines.pdf'
    ]
];

$program3Documents = [
    [
        'title' => 'Programming Fundamentals Materials',
        'file' => 'exhibit/instructional-materials/program3/programming-fundamentals.pdf'
    ],
    [
        'title' => 'Database Design Worksheets', 
        'file' => 'exhibit/instructional-materials/program3/database-design-worksheets.pdf'
    ],
    [
        'title' => 'System Analysis Documentation',
        'file' => 'exhibit/instructional-materials/program3/system-analysis-docs.pdf'
    ],
    [
        'title' => 'Web Development Resources',
        'file' => 'exhibit/instructional-materials/program3/web-development-resources.pdf'
    ]
];

# Update all programs with documents
App\Models\Landing\ExhibitInstructionalMaterials::updateContent([
    'program1_documents' => $program1Documents,
    'program2_documents' => $program2Documents,
    'program3_documents' => $program3Documents
]);

echo "All instructional materials documents updated successfully!";

# Verify the update
$updated = App\Models\Landing\ExhibitInstructionalMaterials::getContent();
echo "Program 1 documents: " . count($updated->program1_documents);
echo "Program 2 documents: " . count($updated->program2_documents);
echo "Program 3 documents: " . count($updated->program3_documents);
```