<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ExhibitUniversityPolicies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExhibitUniversityPoliciesController extends Controller
{
    /**
     * Display the admin exhibit university policies management page
     */
    public function index()
    {
        $content = ExhibitUniversityPolicies::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform policies document
        if (isset($transformedContent['policies_document']) && $transformedContent['policies_document'] && !str_starts_with($transformedContent['policies_document'], 'http')) {
            $transformedContent['policies_document'] = Storage::url($transformedContent['policies_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('admin/layout/ExhibitUniversityPolicies', [
            'universityPoliciesContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Update policies content
     */
    public function update(Request $request)
    {
        $request->validate([
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'required|string',
            'section_title' => 'required|string|max:255',
            'footer_section_title' => 'required|string|max:255',
            'hero_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'policies_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:10240',
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
            $oldContent = ExhibitUniversityPolicies::getContent();
            if ($oldContent->hero_image && Storage::exists($oldContent->hero_image)) {
                Storage::delete($oldContent->hero_image);
            }
            
            $data['hero_image'] = $request->file('hero_image')->store('exhibit/university-policies/hero', 'public');
        }

        // Handle policies document upload
        if ($request->hasFile('policies_document')) {
            // Delete old policies document if it exists
            $oldContent = ExhibitUniversityPolicies::getContent();
            if ($oldContent->policies_document && Storage::exists($oldContent->policies_document)) {
                Storage::delete($oldContent->policies_document);
            }
            
            $data['policies_document'] = $request->file('policies_document')->store('exhibit/university-policies/documents', 'public');
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            // Delete old footer image if it exists
            $oldContent = ExhibitUniversityPolicies::getContent();
            if ($oldContent->footer_image && Storage::exists($oldContent->footer_image)) {
                Storage::delete($oldContent->footer_image);
            }
            
            $data['footer_image'] = $request->file('footer_image')->store('exhibit/university-policies/footer', 'public');
        }

        ExhibitUniversityPolicies::updateContent($data);

        return back()->with('message', "University Policies content updated successfully!");
    }

    /**
     * Get policies content for public display
     */
    public function show()
    {
        $content = ExhibitUniversityPolicies::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform policies document
        if (isset($transformedContent['policies_document']) && $transformedContent['policies_document'] && !str_starts_with($transformedContent['policies_document'], 'http')) {
            $transformedContent['policies_document'] = Storage::url($transformedContent['policies_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('landing/exhibit/universitypolicies', [
            'universityPoliciesContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Get policies content as API response
     */
    public function getContent()
    {
        $content = ExhibitUniversityPolicies::getContent();
        
        // Transform image paths for frontend
        $transformedContent = (array) $content;
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform policies document
        if (isset($transformedContent['policies_document']) && $transformedContent['policies_document'] && !str_starts_with($transformedContent['policies_document'], 'http')) {
            $transformedContent['policies_document'] = Storage::url($transformedContent['policies_document']);
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
        $policies = ExhibitUniversityPolicies::first();
        $content = ExhibitUniversityPolicies::getContent();
        
        return response()->json([
            'raw_record' => $policies,
            'processed_content' => $content,
            'storage_url_sample' => Storage::url('test.pdf'),
        ]);
    }
}
