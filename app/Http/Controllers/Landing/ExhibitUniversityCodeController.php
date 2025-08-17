<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ExhibitUniversityCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExhibitUniversityCodeController extends Controller
{
    /**
     * Display the admin exhibit university code management page
     */
    public function index()
    {
        $content = ExhibitUniversityCode::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform code document
        if (isset($transformedContent['code_document']) && $transformedContent['code_document'] && !str_starts_with($transformedContent['code_document'], 'http')) {
            $transformedContent['code_document'] = Storage::url($transformedContent['code_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('admin/layout/ExhibitUniversityCode', [
            'universityCodeContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Update code content
     */
    public function update(Request $request)
    {
        $request->validate([
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'required|string',
            'section_title' => 'required|string|max:255',
            'footer_section_title' => 'required|string|max:255',
            'hero_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'code_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:10240',
            'footer_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
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
            $oldContent = ExhibitUniversityCode::getContent();
            if ($oldContent->hero_image && Storage::exists($oldContent->hero_image)) {
                Storage::delete($oldContent->hero_image);
            }
            
            $data['hero_image'] = $request->file('hero_image')->store('exhibit/university-code/hero', 'public');
        }

        // Handle code document upload
        if ($request->hasFile('code_document')) {
            // Delete old code document if it exists
            $oldContent = ExhibitUniversityCode::getContent();
            if ($oldContent->code_document && Storage::exists($oldContent->code_document)) {
                Storage::delete($oldContent->code_document);
            }
            
            $data['code_document'] = $request->file('code_document')->store('exhibit/university-code/documents', 'public');
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            // Delete old footer image if it exists
            $oldContent = ExhibitUniversityCode::getContent();
            if ($oldContent->footer_image && Storage::exists($oldContent->footer_image)) {
                Storage::delete($oldContent->footer_image);
            }
            
            $data['footer_image'] = $request->file('footer_image')->store('exhibit/university-code/footer', 'public');
        }

        ExhibitUniversityCode::updateContent($data);

        return back()->with('message', "University Code content updated successfully!");
    }

    /**
     * Get code content for public display
     */
    public function show()
    {
        $content = ExhibitUniversityCode::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform code document
        if (isset($transformedContent['code_document']) && $transformedContent['code_document'] && !str_starts_with($transformedContent['code_document'], 'http')) {
            $transformedContent['code_document'] = Storage::url($transformedContent['code_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('landing/exhibit/universitycode', [
            'universityCodeContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Get code content as API response
     */
    public function getContent()
    {
        $content = ExhibitUniversityCode::getContent();
        
        // Transform image paths for frontend
        $transformedContent = (array) $content;
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform code document
        if (isset($transformedContent['code_document']) && $transformedContent['code_document'] && !str_starts_with($transformedContent['code_document'], 'http')) {
            $transformedContent['code_document'] = Storage::url($transformedContent['code_document']);
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
        $code = ExhibitUniversityCode::first();
        $content = ExhibitUniversityCode::getContent();
        
        return response()->json([
            'raw_record' => $code,
            'processed_content' => $content,
            'storage_url_sample' => Storage::url('test.pdf'),
        ]);
    }
}
