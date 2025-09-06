<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ExhibitInstructionalMaterials;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExhibitInstructionalMaterialsController extends Controller
{
    /**
     * Display the admin exhibit instructional materials management page
     */
    public function index()
    {
        $content = ExhibitInstructionalMaterials::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform program 1 images and documents
        if (isset($transformedContent['program1_image']) && $transformedContent['program1_image'] && !str_starts_with($transformedContent['program1_image'], 'http')) {
            $transformedContent['program1_image'] = Storage::url($transformedContent['program1_image']);
        }
        if (isset($transformedContent['program1_documents']) && is_array($transformedContent['program1_documents'])) {
            foreach ($transformedContent['program1_documents'] as &$document) {
                if (isset($document['file']) && !str_starts_with($document['file'], 'http')) {
                    $document['file'] = Storage::url($document['file']);
                }
            }
        }
        
        // Transform program 2 images and documents
        if (isset($transformedContent['program2_image']) && $transformedContent['program2_image'] && !str_starts_with($transformedContent['program2_image'], 'http')) {
            $transformedContent['program2_image'] = Storage::url($transformedContent['program2_image']);
        }
        if (isset($transformedContent['program2_documents']) && is_array($transformedContent['program2_documents'])) {
            foreach ($transformedContent['program2_documents'] as &$document) {
                if (isset($document['file']) && !str_starts_with($document['file'], 'http')) {
                    $document['file'] = Storage::url($document['file']);
                }
            }
        }
        
        // Transform program 3 images and documents
        if (isset($transformedContent['program3_image']) && $transformedContent['program3_image'] && !str_starts_with($transformedContent['program3_image'], 'http')) {
            $transformedContent['program3_image'] = Storage::url($transformedContent['program3_image']);
        }
        if (isset($transformedContent['program3_documents']) && is_array($transformedContent['program3_documents'])) {
            foreach ($transformedContent['program3_documents'] as &$document) {
                if (isset($document['file']) && !str_starts_with($document['file'], 'http')) {
                    $document['file'] = Storage::url($document['file']);
                }
            }
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('admin/layout/ExhibitInstructionalMaterials', [
            'instructionalMaterialsContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Update materials content
     */
    public function update(Request $request)
    {
        $request->validate([
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'required|string',
            'section_title' => 'required|string|max:255',
            'program1_title' => 'required|string|max:255',
            'program2_title' => 'required|string|max:255',
            'program3_title' => 'required|string|max:255',
            'footer_section_title' => 'required|string|max:255',
            'hero_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'program1_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'program2_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'program3_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'footer_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'program1_documents' => 'nullable|string',
            'program2_documents' => 'nullable|string',
            'program3_documents' => 'nullable|string',
        ]);

        $data = $request->only([
            'hero_title',
            'hero_subtitle',
            'section_title',
            'program1_title',
            'program2_title',
            'program3_title',
            'footer_section_title'
        ]);

        $oldContent = ExhibitInstructionalMaterials::getContent();

        // Handle hero image upload
        if ($request->hasFile('hero_image')) {
            if ($oldContent->hero_image && Storage::exists($oldContent->hero_image)) {
                Storage::delete($oldContent->hero_image);
            }
            $data['hero_image'] = $request->file('hero_image')->store('exhibit/instructional-materials/hero', 'public');
        }

        // Handle program 1 uploads
        if ($request->hasFile('program1_image')) {
            if ($oldContent->program1_image && Storage::exists($oldContent->program1_image)) {
                Storage::delete($oldContent->program1_image);
            }
            $data['program1_image'] = $request->file('program1_image')->store('exhibit/instructional-materials/program1', 'public');
        }

        // Handle program 2 uploads
        if ($request->hasFile('program2_image')) {
            if ($oldContent->program2_image && Storage::exists($oldContent->program2_image)) {
                Storage::delete($oldContent->program2_image);
            }
            $data['program2_image'] = $request->file('program2_image')->store('exhibit/instructional-materials/program2', 'public');
        }

        // Handle program 3 uploads
        if ($request->hasFile('program3_image')) {
            if ($oldContent->program3_image && Storage::exists($oldContent->program3_image)) {
                Storage::delete($oldContent->program3_image);
            }
            $data['program3_image'] = $request->file('program3_image')->store('exhibit/instructional-materials/program3', 'public');
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            if ($oldContent->footer_image && Storage::exists($oldContent->footer_image)) {
                Storage::delete($oldContent->footer_image);
            }
            $data['footer_image'] = $request->file('footer_image')->store('exhibit/instructional-materials/footer', 'public');
        }

        // Handle documents upload for each program
        foreach (['program1', 'program2', 'program3'] as $program) {
            $documentsKey = $program . '_documents';
            $documentsJson = $request->input($documentsKey);
            
            if ($documentsJson) {
                $documents = json_decode($documentsJson, true);
                $processedDocuments = [];
                
                // Get old documents to delete files that are no longer needed
                $oldDocuments = $oldContent->{$documentsKey} ?? [];
                $oldFiles = collect($oldDocuments)->pluck('file')->toArray();
                
                foreach ($documents as $index => $document) {
                    $processedDocument = [
                        'title' => $document['title']
                    ];
                    
                    // Check if there's a file upload for this document
                    $fileKey = $program . '_document_' . $index;
                    if ($request->hasFile($fileKey)) {
                        // Delete old file if it exists and is not being reused
                        if (isset($document['oldFile']) && Storage::exists($document['oldFile'])) {
                            Storage::delete($document['oldFile']);
                        }
                        
                        $processedDocument['file'] = $request->file($fileKey)->store('exhibit/instructional-materials/' . $program, 'public');
                    } elseif (isset($document['file']) && !str_starts_with($document['file'], 'http')) {
                        // Keep existing file
                        $processedDocument['file'] = $document['file'];
                    } elseif (isset($document['oldFile'])) {
                        // Keep old file
                        $processedDocument['file'] = $document['oldFile'];
                    }
                    
                    $processedDocuments[] = $processedDocument;
                }
                
                // Delete any old files that are no longer referenced
                $newFiles = collect($processedDocuments)->pluck('file')->toArray();
                foreach ($oldFiles as $oldFile) {
                    if (!in_array($oldFile, $newFiles) && Storage::exists($oldFile)) {
                        Storage::delete($oldFile);
                    }
                }
                
                $data[$documentsKey] = $processedDocuments;
            }
        }

        ExhibitInstructionalMaterials::updateContent($data);

        return back()->with('message', "Instructional Materials content updated successfully!");
    }

    /**
     * Get materials content for public display
     */
    public function show()
    {
        $content = ExhibitInstructionalMaterials::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform program 1 images and documents
        if (isset($transformedContent['program1_image']) && $transformedContent['program1_image'] && !str_starts_with($transformedContent['program1_image'], 'http')) {
            $transformedContent['program1_image'] = Storage::url($transformedContent['program1_image']);
        }
        if (isset($transformedContent['program1_documents']) && is_array($transformedContent['program1_documents'])) {
            foreach ($transformedContent['program1_documents'] as &$document) {
                if (isset($document['file']) && !str_starts_with($document['file'], 'http')) {
                    $document['file'] = Storage::url($document['file']);
                }
            }
        }
        
        // Transform program 2 images and documents
        if (isset($transformedContent['program2_image']) && $transformedContent['program2_image'] && !str_starts_with($transformedContent['program2_image'], 'http')) {
            $transformedContent['program2_image'] = Storage::url($transformedContent['program2_image']);
        }
        if (isset($transformedContent['program2_documents']) && is_array($transformedContent['program2_documents'])) {
            foreach ($transformedContent['program2_documents'] as &$document) {
                if (isset($document['file']) && !str_starts_with($document['file'], 'http')) {
                    $document['file'] = Storage::url($document['file']);
                }
            }
        }
        
        // Transform program 3 images and documents
        if (isset($transformedContent['program3_image']) && $transformedContent['program3_image'] && !str_starts_with($transformedContent['program3_image'], 'http')) {
            $transformedContent['program3_image'] = Storage::url($transformedContent['program3_image']);
        }
        if (isset($transformedContent['program3_documents']) && is_array($transformedContent['program3_documents'])) {
            foreach ($transformedContent['program3_documents'] as &$document) {
                if (isset($document['file']) && !str_starts_with($document['file'], 'http')) {
                    $document['file'] = Storage::url($document['file']);
                }
            }
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('landing/exhibit/instructionalmaterials', [
            'instructionalMaterialsContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Get materials content as API response
     */
    public function getContent()
    {
        $content = ExhibitInstructionalMaterials::getContent();
        
        // Transform image paths for frontend
        $transformedContent = (array) $content;
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform program images and documents
        foreach (['program1', 'program2', 'program3'] as $program) {
            $imageKey = $program . '_image';
            $documentsKey = $program . '_documents';
            
            if (isset($transformedContent[$imageKey]) && $transformedContent[$imageKey] && !str_starts_with($transformedContent[$imageKey], 'http')) {
                $transformedContent[$imageKey] = Storage::url($transformedContent[$imageKey]);
            }
            
            if (isset($transformedContent[$documentsKey]) && is_array($transformedContent[$documentsKey])) {
                foreach ($transformedContent[$documentsKey] as &$document) {
                    if (isset($document['file']) && !str_starts_with($document['file'], 'http')) {
                        $document['file'] = Storage::url($document['file']);
                    }
                }
            }
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return response()->json($transformedContent);
    }

    /**
     * Debug endpoint to check content
     */
    public function debug()
    {
        return response()->json([
            'content' => ExhibitInstructionalMaterials::getContent(),
            'table_exists' => \Schema::hasTable('exhibit_instructional_materials'),
            'all_records' => ExhibitInstructionalMaterials::all()
        ]);
    }
}
