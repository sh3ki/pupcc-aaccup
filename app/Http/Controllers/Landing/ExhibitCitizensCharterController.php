<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ExhibitCitizensCharter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExhibitCitizensCharterController extends Controller
{
    /**
     * Display the admin exhibit citizens charter management page
     */
    public function index()
    {
        $content = ExhibitCitizensCharter::getContent();
        
        // Transform image paths for frontend (same as CertificateController)
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform charter document
        if (isset($transformedContent['charter_document']) && $transformedContent['charter_document'] && !str_starts_with($transformedContent['charter_document'], 'http')) {
            $transformedContent['charter_document'] = Storage::url($transformedContent['charter_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('admin/layout/ExhibitCitizensCharter', [
            'charterContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Update charter content
     */
    public function update(Request $request)
    {
        $request->validate([
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'required|string',
            'section_title' => 'required|string|max:255',
            'footer_section_title' => 'required|string|max:255',
            'hero_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:51200',
            'charter_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:51200',
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
            $oldContent = ExhibitCitizensCharter::getContent();
            if ($oldContent->hero_image && Storage::exists($oldContent->hero_image)) {
                Storage::delete($oldContent->hero_image);
            }
            
            $data['hero_image'] = $request->file('hero_image')->store('exhibit/citizens-charter/hero', 'public');
        }

        // Handle charter document upload
        if ($request->hasFile('charter_document')) {
            // Delete old charter document if it exists
            $oldContent = ExhibitCitizensCharter::getContent();
            if ($oldContent->charter_document && Storage::exists($oldContent->charter_document)) {
                Storage::delete($oldContent->charter_document);
            }
            
            $data['charter_document'] = $request->file('charter_document')->store('exhibit/citizens-charter/documents', 'public');
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            // Delete old footer image if it exists
            $oldContent = ExhibitCitizensCharter::getContent();
            if ($oldContent->footer_image && Storage::exists($oldContent->footer_image)) {
                Storage::delete($oldContent->footer_image);
            }
            
            $data['footer_image'] = $request->file('footer_image')->store('exhibit/citizens-charter/footer', 'public');
        }

        ExhibitCitizensCharter::updateContent($data);

        return back()->with('message', "Citizen's Charter content updated successfully!");
    }

    /**
     * Get charter content for public display
     */
    public function show()
    {
        $content = ExhibitCitizensCharter::getContent();
        
        // Transform image paths for frontend (same as CertificateController)
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform charter document
        if (isset($transformedContent['charter_document']) && $transformedContent['charter_document'] && !str_starts_with($transformedContent['charter_document'], 'http')) {
            $transformedContent['charter_document'] = Storage::url($transformedContent['charter_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('landing/exhibit/citizenscharter', [
            'charterContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Get charter content as API response
     */
    public function getContent()
    {
        $content = ExhibitCitizensCharter::getContent();
        
        // Transform image paths for frontend (same as CertificateController)
        $transformedContent = (array) $content;
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform charter document
        if (isset($transformedContent['charter_document']) && $transformedContent['charter_document'] && !str_starts_with($transformedContent['charter_document'], 'http')) {
            $transformedContent['charter_document'] = Storage::url($transformedContent['charter_document']);
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
        $charter = ExhibitCitizensCharter::first();
        $content = ExhibitCitizensCharter::getContent();
        
        return response()->json([
            'raw_record' => $charter,
            'processed_content' => $content,
            'storage_url_sample' => Storage::url('test.pdf'),
        ]);
    }
}