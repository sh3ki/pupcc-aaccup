<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ExhibitBor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExhibitBorController extends Controller
{
    /**
     * Display the admin exhibit BOR management page
     */
    public function index()
    {
        $content = ExhibitBor::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform BOR document
        if (isset($transformedContent['bor_document']) && $transformedContent['bor_document'] && !str_starts_with($transformedContent['bor_document'], 'http')) {
            $transformedContent['bor_document'] = Storage::url($transformedContent['bor_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('admin/layout/ExhibitBor', [
            'borContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Update BOR content
     */
    public function update(Request $request)
    {
        $request->validate([
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'required|string',
            'section_title' => 'required|string|max:255',
            'footer_section_title' => 'required|string|max:255',
            'hero_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'bor_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:10240',
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
            $oldContent = ExhibitBor::getContent();
            if ($oldContent->hero_image && Storage::exists($oldContent->hero_image)) {
                Storage::delete($oldContent->hero_image);
            }
            
            $data['hero_image'] = $request->file('hero_image')->store('exhibit/bor/hero', 'public');
        }

        // Handle BOR document upload
        if ($request->hasFile('bor_document')) {
            // Delete old BOR document if it exists
            $oldContent = ExhibitBor::getContent();
            if ($oldContent->bor_document && Storage::exists($oldContent->bor_document)) {
                Storage::delete($oldContent->bor_document);
            }
            
            $data['bor_document'] = $request->file('bor_document')->store('exhibit/bor/documents', 'public');
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            // Delete old footer image if it exists
            $oldContent = ExhibitBor::getContent();
            if ($oldContent->footer_image && Storage::exists($oldContent->footer_image)) {
                Storage::delete($oldContent->footer_image);
            }
            
            $data['footer_image'] = $request->file('footer_image')->store('exhibit/bor/footer', 'public');
        }

        ExhibitBor::updateContent($data);

        return back()->with('message', "BOR content updated successfully!");
    }

    /**
     * Get BOR content for public display
     */
    public function show()
    {
        $content = ExhibitBor::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform BOR document
        if (isset($transformedContent['bor_document']) && $transformedContent['bor_document'] && !str_starts_with($transformedContent['bor_document'], 'http')) {
            $transformedContent['bor_document'] = Storage::url($transformedContent['bor_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('landing/exhibit/bor', [
            'borContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Get BOR content as API response
     */
    public function getContent()
    {
        $content = ExhibitBor::getContent();
        
        // Transform image paths for frontend
        $transformedContent = (array) $content;
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform BOR document
        if (isset($transformedContent['bor_document']) && $transformedContent['bor_document'] && !str_starts_with($transformedContent['bor_document'], 'http')) {
            $transformedContent['bor_document'] = Storage::url($transformedContent['bor_document']);
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
        $bor = ExhibitBor::first();
        $content = ExhibitBor::getContent();
        
        return response()->json([
            'raw_record' => $bor,
            'processed_content' => $content,
            'storage_url_sample' => Storage::url('test.pdf'),
        ]);
    }
}
