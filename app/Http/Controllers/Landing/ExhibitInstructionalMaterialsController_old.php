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
        
        // Transform materials document
        if (isset($transformedContent['materials_document']) && $transformedContent['materials_document'] && !str_starts_with($transformedContent['materials_document'], 'http')) {
            $transformedContent['materials_document'] = Storage::url($transformedContent['materials_document']);
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
            'footer_section_title' => 'required|string|max:255',
            'hero_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'materials_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:10240',
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
            $oldContent = ExhibitInstructionalMaterials::getContent();
            if ($oldContent->hero_image && Storage::exists($oldContent->hero_image)) {
                Storage::delete($oldContent->hero_image);
            }
            
            $data['hero_image'] = $request->file('hero_image')->store('exhibit/instructional-materials/hero', 'public');
        }

        // Handle materials document upload
        if ($request->hasFile('materials_document')) {
            // Delete old materials document if it exists
            $oldContent = ExhibitInstructionalMaterials::getContent();
            if ($oldContent->materials_document && Storage::exists($oldContent->materials_document)) {
                Storage::delete($oldContent->materials_document);
            }
            
            $data['materials_document'] = $request->file('materials_document')->store('exhibit/instructional-materials/documents', 'public');
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            // Delete old footer image if it exists
            $oldContent = ExhibitInstructionalMaterials::getContent();
            if ($oldContent->footer_image && Storage::exists($oldContent->footer_image)) {
                Storage::delete($oldContent->footer_image);
            }
            
            $data['footer_image'] = $request->file('footer_image')->store('exhibit/instructional-materials/footer', 'public');
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
        
        // Transform materials document
        if (isset($transformedContent['materials_document']) && $transformedContent['materials_document'] && !str_starts_with($transformedContent['materials_document'], 'http')) {
            $transformedContent['materials_document'] = Storage::url($transformedContent['materials_document']);
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
        
        // Transform materials document
        if (isset($transformedContent['materials_document']) && $transformedContent['materials_document'] && !str_starts_with($transformedContent['materials_document'], 'http')) {
            $transformedContent['materials_document'] = Storage::url($transformedContent['materials_document']);
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
        $materials = ExhibitInstructionalMaterials::first();
        $content = ExhibitInstructionalMaterials::getContent();
        
        return response()->json([
            'raw_record' => $materials,
            'processed_content' => $content,
            'storage_url_sample' => Storage::url('test.pdf'),
        ]);
    }
}
