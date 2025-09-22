# If you want to update directly in the database:

# First check if the record exists:
SELECT * FROM exhibit_obe_syllabi;

# If it exists but program3_documents is null/empty, update it:
UPDATE exhibit_obe_syllabi 
SET program3_documents = '[
    {
        "title": "BSIT First Year Syllabi",
        "file": "exhibit/obe-syllabi/program3/bsit-first-year.pdf"
    },
    {
        "title": "BSIT Second Year Syllabi", 
        "file": "exhibit/obe-syllabi/program3/bsit-second-year.pdf"
    },
    {
        "title": "BSIT Third Year Syllabi",
        "file": "exhibit/obe-syllabi/program3/bsit-third-year.pdf"
    },
    {
        "title": "BSIT Fourth Year Syllabi",
        "file": "exhibit/obe-syllabi/program3/bsit-fourth-year.pdf"
    }
]'
WHERE id = 1;