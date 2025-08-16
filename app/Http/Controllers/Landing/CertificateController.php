<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CertificateController extends Controller
{
    /**
     * Display the admin certificate management page
     */
    public function index()
    {
        $content = Certificate::getContent();
        
        // Transform image paths for frontend (same as HomeController)
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform certificate document
        if (isset($transformedContent['certificate_document']) && $transformedContent['certificate_document'] && !str_starts_with($transformedContent['certificate_document'], 'http')) {
            $transformedContent['certificate_document'] = Storage::url($transformedContent['certificate_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('admin/layout/Certificate', [
            'certificateContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Update certificate content
     */
    public function update(Request $request)
    {
        $request->validate([
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'required|string',
            'section_title' => 'required|string|max:255',
            'footer_section_title' => 'required|string|max:255',
            'hero_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'certificate_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:10240',
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
            $heroImagePath = $request->file('hero_image')->store('certificate/hero', 'public');
            $data['hero_image'] = $heroImagePath;
        }

        // Handle certificate document upload
        if ($request->hasFile('certificate_document')) {
            $documentPath = $request->file('certificate_document')->store('certificate/documents', 'public');
            $data['certificate_document'] = $documentPath;
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            $footerImagePath = $request->file('footer_image')->store('certificate/footer', 'public');
            $data['footer_image'] = $footerImagePath;
        }

        Certificate::updateContent($data);

        return back()->with('message', 'Certificate content updated successfully!');
    }

    /**
     * Get certificate content for public display
     */
    public function show()
    {
        $content = Certificate::getContent();
        
        // Transform image paths for frontend (same as HomeController)
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform certificate document
        if (isset($transformedContent['certificate_document']) && $transformedContent['certificate_document'] && !str_starts_with($transformedContent['certificate_document'], 'http')) {
            $transformedContent['certificate_document'] = Storage::url($transformedContent['certificate_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('landing/certificate', [
            'certificateContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Get certificate content as API response
     */
    public function getContent()
    {
        $content = Certificate::getContent();
        
        // Transform image paths for frontend (same as HomeController)
        $transformedContent = (array) $content;
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform certificate document
        if (isset($transformedContent['certificate_document']) && $transformedContent['certificate_document'] && !str_starts_with($transformedContent['certificate_document'], 'http')) {
            $transformedContent['certificate_document'] = Storage::url($transformedContent['certificate_document']);
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
        $certificate = Certificate::first();
        $content = Certificate::getContent();
        
        return response()->json([
            'raw_database' => $certificate,
            'processed_content' => $content,
            'storage_url_sample' => Storage::url('test.pdf'),
        ]);
    }
}
