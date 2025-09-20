<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ExhibitStudentHandbook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExhibitStudentHandbookController extends Controller
{
    /**
     * Display the admin exhibit student handbook management page
     */
    public function index()
    {
        $content = ExhibitStudentHandbook::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform handbook document
        if (isset($transformedContent['handbook_document']) && $transformedContent['handbook_document'] && !str_starts_with($transformedContent['handbook_document'], 'http')) {
            $transformedContent['handbook_document'] = Storage::url($transformedContent['handbook_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('admin/layout/ExhibitStudentHandbook', [
            'studentHandbookContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Update handbook content
     */
    public function update(Request $request)
    {
        $request->validate([
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'required|string',
            'section_title' => 'required|string|max:255',
            'footer_section_title' => 'required|string|max:255',
            'hero_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:51200',
            'handbook_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:51200',
            'footer_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:51200',
        ]);

        $data = $request->only([
            'hero_title',
            'hero_subtitle',
            'section_title',
            'footer_section_title'
        ]);

        // Handle hero image upload
        if ($request->hasFile('hero_image')) {
            // Delete old hero image if it exists
            $oldContent = ExhibitStudentHandbook::getContent();
            if ($oldContent->hero_image && Storage::exists($oldContent->hero_image)) {
                Storage::delete($oldContent->hero_image);
            }
            
            $data['hero_image'] = $request->file('hero_image')->store('exhibit/student-handbook/hero', 'public');
        }

        // Handle handbook document upload
        if ($request->hasFile('handbook_document')) {
            // Delete old handbook document if it exists
            $oldContent = ExhibitStudentHandbook::getContent();
            if ($oldContent->handbook_document && Storage::exists($oldContent->handbook_document)) {
                Storage::delete($oldContent->handbook_document);
            }
            
            $data['handbook_document'] = $request->file('handbook_document')->store('exhibit/student-handbook/documents', 'public');
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            // Delete old footer image if it exists
            $oldContent = ExhibitStudentHandbook::getContent();
            if ($oldContent->footer_image && Storage::exists($oldContent->footer_image)) {
                Storage::delete($oldContent->footer_image);
            }
            
            $data['footer_image'] = $request->file('footer_image')->store('exhibit/student-handbook/footer', 'public');
        }

        ExhibitStudentHandbook::updateContent($data);

        return back()->with('message', "Student Handbook content updated successfully!");
    }

    /**
     * Get handbook content for public display
     */
    public function show()
    {
        $content = ExhibitStudentHandbook::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform handbook document
        if (isset($transformedContent['handbook_document']) && $transformedContent['handbook_document'] && !str_starts_with($transformedContent['handbook_document'], 'http')) {
            $transformedContent['handbook_document'] = Storage::url($transformedContent['handbook_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('landing/exhibit/studenthandbook', [
            'studentHandbookContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Get handbook content as API response
     */
    public function getContent()
    {
        $content = ExhibitStudentHandbook::getContent();
        
        // Transform image paths for frontend
        $transformedContent = (array) $content;
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform handbook document
        if (isset($transformedContent['handbook_document']) && $transformedContent['handbook_document'] && !str_starts_with($transformedContent['handbook_document'], 'http')) {
            $transformedContent['handbook_document'] = Storage::url($transformedContent['handbook_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return response()->json($transformedContent);
    }

    /**
     * Debug endpoint to check database content
     */
    public function debug()
    {
        $handbook = ExhibitStudentHandbook::first();
        $content = ExhibitStudentHandbook::getContent();
        
        return response()->json([
            'raw_record' => $handbook,
            'processed_content' => $content,
            'storage_url_sample' => Storage::url('test.pdf'),
        ]);
    }
}
