<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ExhibitObeSyllabi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExhibitObeSyllabiController extends Controller
{
    /**
     * Display the admin exhibit OBE syllabi management page
     */
    public function index()
    {
        $content = ExhibitObeSyllabi::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform syllabi document
        if (isset($transformedContent['syllabi_document']) && $transformedContent['syllabi_document'] && !str_starts_with($transformedContent['syllabi_document'], 'http')) {
            $transformedContent['syllabi_document'] = Storage::url($transformedContent['syllabi_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('admin/layout/ExhibitObeSyllabi', [
            'obeSyllabiContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Update syllabi content
     */
    public function update(Request $request)
    {
        $request->validate([
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'required|string',
            'section_title' => 'required|string|max:255',
            'footer_section_title' => 'required|string|max:255',
            'hero_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'syllabi_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:10240',
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
            $oldContent = ExhibitObeSyllabi::getContent();
            if ($oldContent->hero_image && Storage::exists($oldContent->hero_image)) {
                Storage::delete($oldContent->hero_image);
            }
            
            $data['hero_image'] = $request->file('hero_image')->store('exhibit/obe-syllabi/hero', 'public');
        }

        // Handle syllabi document upload
        if ($request->hasFile('syllabi_document')) {
            // Delete old syllabi document if it exists
            $oldContent = ExhibitObeSyllabi::getContent();
            if ($oldContent->syllabi_document && Storage::exists($oldContent->syllabi_document)) {
                Storage::delete($oldContent->syllabi_document);
            }
            
            $data['syllabi_document'] = $request->file('syllabi_document')->store('exhibit/obe-syllabi/documents', 'public');
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            // Delete old footer image if it exists
            $oldContent = ExhibitObeSyllabi::getContent();
            if ($oldContent->footer_image && Storage::exists($oldContent->footer_image)) {
                Storage::delete($oldContent->footer_image);
            }
            
            $data['footer_image'] = $request->file('footer_image')->store('exhibit/obe-syllabi/footer', 'public');
        }

        ExhibitObeSyllabi::updateContent($data);

        return back()->with('message', "OBE Syllabi content updated successfully!");
    }

    /**
     * Get syllabi content for public display
     */
    public function show()
    {
        $content = ExhibitObeSyllabi::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform syllabi document
        if (isset($transformedContent['syllabi_document']) && $transformedContent['syllabi_document'] && !str_starts_with($transformedContent['syllabi_document'], 'http')) {
            $transformedContent['syllabi_document'] = Storage::url($transformedContent['syllabi_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('landing/exhibit/obesyllabi', [
            'obeSyllabiContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Get syllabi content as API response
     */
    public function getContent()
    {
        $content = ExhibitObeSyllabi::getContent();
        
        // Transform image paths for frontend
        $transformedContent = (array) $content;
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform syllabi document
        if (isset($transformedContent['syllabi_document']) && $transformedContent['syllabi_document'] && !str_starts_with($transformedContent['syllabi_document'], 'http')) {
            $transformedContent['syllabi_document'] = Storage::url($transformedContent['syllabi_document']);
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
        $syllabi = ExhibitObeSyllabi::first();
        $content = ExhibitObeSyllabi::getContent();
        
        return response()->json([
            'raw_record' => $syllabi,
            'processed_content' => $content,
            'storage_url_sample' => Storage::url('test.pdf'),
        ]);
    }
}
