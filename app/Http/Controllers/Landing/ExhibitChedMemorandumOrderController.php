<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\ExhibitChedMemorandumOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ExhibitChedMemorandumOrderController extends Controller
{
    /**
     * Display the admin exhibit CHED memorandum order management page
     */
    public function index()
    {
        $content = ExhibitChedMemorandumOrder::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform memorandum document
        if (isset($transformedContent['memorandum_document']) && $transformedContent['memorandum_document'] && !str_starts_with($transformedContent['memorandum_document'], 'http')) {
            $transformedContent['memorandum_document'] = Storage::url($transformedContent['memorandum_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('admin/layout/ExhibitChedMemorandumOrder', [
            'chedMemorandumOrderContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Update memorandum content
     */
    public function update(Request $request)
    {
        $request->validate([
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'required|string',
            'section_title' => 'required|string|max:255',
            'footer_section_title' => 'required|string|max:255',
            'hero_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'memorandum_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:10240',
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
            $oldContent = ExhibitChedMemorandumOrder::getContent();
            if ($oldContent->hero_image && Storage::exists($oldContent->hero_image)) {
                Storage::delete($oldContent->hero_image);
            }
            
            $data['hero_image'] = $request->file('hero_image')->store('exhibit/ched-memorandum-order/hero', 'public');
        }

        // Handle memorandum document upload
        if ($request->hasFile('memorandum_document')) {
            // Delete old memorandum document if it exists
            $oldContent = ExhibitChedMemorandumOrder::getContent();
            if ($oldContent->memorandum_document && Storage::exists($oldContent->memorandum_document)) {
                Storage::delete($oldContent->memorandum_document);
            }
            
            $data['memorandum_document'] = $request->file('memorandum_document')->store('exhibit/ched-memorandum-order/documents', 'public');
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            // Delete old footer image if it exists
            $oldContent = ExhibitChedMemorandumOrder::getContent();
            if ($oldContent->footer_image && Storage::exists($oldContent->footer_image)) {
                Storage::delete($oldContent->footer_image);
            }
            
            $data['footer_image'] = $request->file('footer_image')->store('exhibit/ched-memorandum-order/footer', 'public');
        }

        ExhibitChedMemorandumOrder::updateContent($data);

        return back()->with('message', "CHED Memorandum Order content updated successfully!");
    }

    /**
     * Get memorandum content for public display
     */
    public function show()
    {
        $content = ExhibitChedMemorandumOrder::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform memorandum document
        if (isset($transformedContent['memorandum_document']) && $transformedContent['memorandum_document'] && !str_starts_with($transformedContent['memorandum_document'], 'http')) {
            $transformedContent['memorandum_document'] = Storage::url($transformedContent['memorandum_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('landing/exhibit/chedmemorandumorder', [
            'chedMemorandumOrderContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Get memorandum content as API response
     */
    public function getContent()
    {
        $content = ExhibitChedMemorandumOrder::getContent();
        
        // Transform image paths for frontend
        $transformedContent = (array) $content;
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform memorandum document
        if (isset($transformedContent['memorandum_document']) && $transformedContent['memorandum_document'] && !str_starts_with($transformedContent['memorandum_document'], 'http')) {
            $transformedContent['memorandum_document'] = Storage::url($transformedContent['memorandum_document']);
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
        $memorandum = ExhibitChedMemorandumOrder::first();
        $content = ExhibitChedMemorandumOrder::getContent();
        
        return response()->json([
            'raw_record' => $memorandum,
            'processed_content' => $content,
            'storage_url_sample' => Storage::url('test.pdf'),
        ]);
    }
}
