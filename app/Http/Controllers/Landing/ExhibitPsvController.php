<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ExhibitPsv;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExhibitPsvController extends Controller
{
    /**
     * Display the admin exhibit PSV management page
     */
    public function index()
    {
        $content = ExhibitPsv::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform PSV document
        if (isset($transformedContent['psv_document']) && $transformedContent['psv_document'] && !str_starts_with($transformedContent['psv_document'], 'http')) {
            $transformedContent['psv_document'] = Storage::url($transformedContent['psv_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('admin/layout/ExhibitPsv', [
            'psvContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Update PSV content
     */
    public function update(Request $request)
    {
        $request->validate([
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'required|string',
            'section_title' => 'required|string|max:255',
            'footer_section_title' => 'required|string|max:255',
            'hero_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'psv_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:10240',
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
            $oldContent = ExhibitPsv::getContent();
            if ($oldContent && $oldContent->hero_image) {
                Storage::delete($oldContent->hero_image);
            }
            
            $heroImagePath = $request->file('hero_image')->store('exhibit/psv/hero', 'public');
            $data['hero_image'] = $heroImagePath;
        }

        // Handle PSV document upload
        if ($request->hasFile('psv_document')) {
            // Delete old document if exists
            $oldContent = ExhibitPsv::getContent();
            if ($oldContent && $oldContent->psv_document) {
                Storage::delete($oldContent->psv_document);
            }
            
            $documentPath = $request->file('psv_document')->store('exhibit/psv/documents', 'public');
            $data['psv_document'] = $documentPath;
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            // Delete old image if exists
            $oldContent = ExhibitPsv::getContent();
            if ($oldContent && $oldContent->footer_image) {
                Storage::delete($oldContent->footer_image);
            }
            
            $footerImagePath = $request->file('footer_image')->store('exhibit/psv/footer', 'public');
            $data['footer_image'] = $footerImagePath;
        }

        ExhibitPsv::updateContent($data);

        return redirect()->back()->with('success', 'PSV content updated successfully!');
    }

    /**
     * Display the public PSV page
     */
    public function show()
    {
        $content = ExhibitPsv::getContent();
        
        // Transform paths for frontend
        $transformedContent = $content->toArray();
        
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        if (isset($transformedContent['psv_document']) && $transformedContent['psv_document'] && !str_starts_with($transformedContent['psv_document'], 'http')) {
            $transformedContent['psv_document'] = Storage::url($transformedContent['psv_document']);
        }
        
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('landing/exhibit/psv', [
            'psvContent' => (object) $transformedContent,
        ]);
    }
}
