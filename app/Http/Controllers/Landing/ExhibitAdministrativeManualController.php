<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ExhibitAdministrativeManual;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExhibitAdministrativeManualController extends Controller
{
    /**
     * Display the admin exhibit administrative manual management page
     */
    public function index()
    {
        $content = ExhibitAdministrativeManual::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform manual document
        if (isset($transformedContent['manual_document']) && $transformedContent['manual_document'] && !str_starts_with($transformedContent['manual_document'], 'http')) {
            $transformedContent['manual_document'] = Storage::url($transformedContent['manual_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('admin/layout/ExhibitAdministrativeManual', [
            'administrativeManualContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Update manual content
     */
    public function update(Request $request)
    {
        $request->validate([
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'required|string',
            'section_title' => 'required|string|max:255',
            'footer_section_title' => 'required|string|max:255',
            'hero_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:51200',
            'manual_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:51200',
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
            $oldContent = ExhibitAdministrativeManual::getContent();
            if ($oldContent->hero_image && Storage::exists($oldContent->hero_image)) {
                Storage::delete($oldContent->hero_image);
            }
            
            $data['hero_image'] = $request->file('hero_image')->store('exhibit/administrative-manual/hero', 'public');
        }

        // Handle manual document upload
        if ($request->hasFile('manual_document')) {
            // Delete old manual document if it exists
            $oldContent = ExhibitAdministrativeManual::getContent();
            if ($oldContent->manual_document && Storage::exists($oldContent->manual_document)) {
                Storage::delete($oldContent->manual_document);
            }
            
            $data['manual_document'] = $request->file('manual_document')->store('exhibit/administrative-manual/documents', 'public');
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            // Delete old footer image if it exists
            $oldContent = ExhibitAdministrativeManual::getContent();
            if ($oldContent->footer_image && Storage::exists($oldContent->footer_image)) {
                Storage::delete($oldContent->footer_image);
            }
            
            $data['footer_image'] = $request->file('footer_image')->store('exhibit/administrative-manual/footer', 'public');
        }

        ExhibitAdministrativeManual::updateContent($data);

        return back()->with('message', "Administrative Manual content updated successfully!");
    }

    /**
     * Get manual content for public display
     */
    public function show()
    {
        $content = ExhibitAdministrativeManual::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform manual document
        if (isset($transformedContent['manual_document']) && $transformedContent['manual_document'] && !str_starts_with($transformedContent['manual_document'], 'http')) {
            $transformedContent['manual_document'] = Storage::url($transformedContent['manual_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('landing/exhibit/administrativemanual', [
            'administrativeManualContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Get manual content as API response
     */
    public function getContent()
    {
        $content = ExhibitAdministrativeManual::getContent();
        
        // Transform image paths for frontend
        $transformedContent = (array) $content;
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform manual document
        if (isset($transformedContent['manual_document']) && $transformedContent['manual_document'] && !str_starts_with($transformedContent['manual_document'], 'http')) {
            $transformedContent['manual_document'] = Storage::url($transformedContent['manual_document']);
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
        $manual = ExhibitAdministrativeManual::first();
        $content = ExhibitAdministrativeManual::getContent();
        
        return response()->json([
            'raw_record' => $manual,
            'processed_content' => $content,
            'storage_url_sample' => Storage::url('test.pdf'),
        ]);
    }
}
