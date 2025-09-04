<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ExhibitCopc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExhibitCopcController extends Controller
{
    /**
     * Display the admin exhibit COPC management page
     */
    public function index()
    {
        $content = ExhibitCopc::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform COPC document
        if (isset($transformedContent['copc_document']) && $transformedContent['copc_document'] && !str_starts_with($transformedContent['copc_document'], 'http')) {
            $transformedContent['copc_document'] = Storage::url($transformedContent['copc_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('admin/layout/ExhibitCopc', [
            'copcContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Update COPC content
     */
    public function update(Request $request)
    {
        $request->validate([
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'required|string',
            'section_title' => 'required|string|max:255',
            'footer_section_title' => 'required|string|max:255',
            'hero_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'copc_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:10240',
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
            $oldContent = ExhibitCopc::getContent();
            if ($oldContent && $oldContent->hero_image) {
                Storage::delete($oldContent->hero_image);
            }
            
            $heroImagePath = $request->file('hero_image')->store('exhibit/copc/hero', 'public');
            $data['hero_image'] = $heroImagePath;
        }

        // Handle COPC document upload
        if ($request->hasFile('copc_document')) {
            // Delete old document if exists
            $oldContent = ExhibitCopc::getContent();
            if ($oldContent && $oldContent->copc_document) {
                Storage::delete($oldContent->copc_document);
            }
            
            $documentPath = $request->file('copc_document')->store('exhibit/copc/documents', 'public');
            $data['copc_document'] = $documentPath;
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            // Delete old image if exists
            $oldContent = ExhibitCopc::getContent();
            if ($oldContent && $oldContent->footer_image) {
                Storage::delete($oldContent->footer_image);
            }
            
            $footerImagePath = $request->file('footer_image')->store('exhibit/copc/footer', 'public');
            $data['footer_image'] = $footerImagePath;
        }

        ExhibitCopc::updateContent($data);

        return redirect()->back()->with('success', 'COPC content updated successfully!');
    }

    /**
     * Display the public COPC page
     */
    public function show()
    {
        $content = ExhibitCopc::getContent();
        
        // Transform paths for frontend
        $transformedContent = $content->toArray();
        
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        if (isset($transformedContent['copc_document']) && $transformedContent['copc_document'] && !str_starts_with($transformedContent['copc_document'], 'http')) {
            $transformedContent['copc_document'] = Storage::url($transformedContent['copc_document']);
        }
        
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('landing/exhibit/copc', [
            'copcContent' => (object) $transformedContent,
        ]);
    }
}
