<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ExhibitLicensure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExhibitLicensureController extends Controller
{
    /**
     * Display the admin exhibit licensure management page
     */
    public function index()
    {
        $content = ExhibitLicensure::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform licensure document
        if (isset($transformedContent['licensure_document']) && $transformedContent['licensure_document'] && !str_starts_with($transformedContent['licensure_document'], 'http')) {
            $transformedContent['licensure_document'] = Storage::url($transformedContent['licensure_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('admin/layout/ExhibitLicensure', [
            'licensureContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Update licensure content
     */
    public function update(Request $request)
    {
        $request->validate([
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'required|string',
            'section_title' => 'required|string|max:255',
            'footer_section_title' => 'required|string|max:255',
            'hero_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'licensure_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:10240',
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
            $oldContent = ExhibitLicensure::getContent();
            if ($oldContent->hero_image && Storage::exists($oldContent->hero_image)) {
                Storage::delete($oldContent->hero_image);
            }
            
            $data['hero_image'] = $request->file('hero_image')->store('exhibit/licensure/hero', 'public');
        }

        // Handle licensure document upload
        if ($request->hasFile('licensure_document')) {
            // Delete old licensure document if it exists
            $oldContent = ExhibitLicensure::getContent();
            if ($oldContent->licensure_document && Storage::exists($oldContent->licensure_document)) {
                Storage::delete($oldContent->licensure_document);
            }
            
            $data['licensure_document'] = $request->file('licensure_document')->store('exhibit/licensure/documents', 'public');
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            // Delete old footer image if it exists
            $oldContent = ExhibitLicensure::getContent();
            if ($oldContent->footer_image && Storage::exists($oldContent->footer_image)) {
                Storage::delete($oldContent->footer_image);
            }
            
            $data['footer_image'] = $request->file('footer_image')->store('exhibit/licensure/footer', 'public');
        }

        ExhibitLicensure::updateContent($data);

        return back()->with('message', "Licensure content updated successfully!");
    }

    /**
     * Get licensure content for public display
     */
    public function show()
    {
        $content = ExhibitLicensure::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform licensure document
        if (isset($transformedContent['licensure_document']) && $transformedContent['licensure_document'] && !str_starts_with($transformedContent['licensure_document'], 'http')) {
            $transformedContent['licensure_document'] = Storage::url($transformedContent['licensure_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('landing/exhibit/licensure', [
            'licensureContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Get licensure content as API response
     */
    public function getContent()
    {
        $content = ExhibitLicensure::getContent();
        
        // Transform image paths for frontend
        $transformedContent = (array) $content;
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform licensure document
        if (isset($transformedContent['licensure_document']) && $transformedContent['licensure_document'] && !str_starts_with($transformedContent['licensure_document'], 'http')) {
            $transformedContent['licensure_document'] = Storage::url($transformedContent['licensure_document']);
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
        $licensure = ExhibitLicensure::first();
        $content = ExhibitLicensure::getContent();
        
        return response()->json([
            'raw_record' => $licensure,
            'processed_content' => $content,
            'storage_url_sample' => Storage::url('test.pdf'),
        ]);
    }
}
