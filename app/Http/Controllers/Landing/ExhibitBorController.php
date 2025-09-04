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
            'footer_section_title',
        ]);

        // Handle hero image upload
        if ($request->hasFile('hero_image')) {
            // Delete old image if exists
            $oldContent = ExhibitBor::getContent();
            if ($oldContent && $oldContent->hero_image) {
                Storage::delete($oldContent->hero_image);
            }
            
            $heroImagePath = $request->file('hero_image')->store('exhibit/bor/hero', 'public');
            $data['hero_image'] = $heroImagePath;
        }

        // Handle BOR document upload
        if ($request->hasFile('bor_document')) {
            // Delete old document if exists
            $oldContent = ExhibitBor::getContent();
            if ($oldContent && $oldContent->bor_document) {
                Storage::delete($oldContent->bor_document);
            }
            
            $documentPath = $request->file('bor_document')->store('exhibit/bor/documents', 'public');
            $data['bor_document'] = $documentPath;
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            // Delete old image if exists
            $oldContent = ExhibitBor::getContent();
            if ($oldContent && $oldContent->footer_image) {
                Storage::delete($oldContent->footer_image);
            }
            
            $footerImagePath = $request->file('footer_image')->store('exhibit/bor/footer', 'public');
            $data['footer_image'] = $footerImagePath;
        }

        ExhibitBor::updateContent($data);

        return redirect()->back()->with('success', 'BOR content updated successfully!');
    }

    /**
     * Display the public BOR page
     */
    public function show()
    {
        $content = ExhibitBor::getContent();
        
        // Transform paths for frontend
        $transformedContent = $content->toArray();
        
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        if (isset($transformedContent['bor_document']) && $transformedContent['bor_document'] && !str_starts_with($transformedContent['bor_document'], 'http')) {
            $transformedContent['bor_document'] = Storage::url($transformedContent['bor_document']);
        }
        
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('landing/exhibit/bor', [
            'borContent' => (object) $transformedContent,
        ]);
    }
}
