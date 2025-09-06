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
        
        // Transform program 1 images and documents
        if (isset($transformedContent['program1_image']) && $transformedContent['program1_image'] && !str_starts_with($transformedContent['program1_image'], 'http')) {
            $transformedContent['program1_image'] = Storage::url($transformedContent['program1_image']);
        }
        if (isset($transformedContent['program1_document']) && $transformedContent['program1_document'] && !str_starts_with($transformedContent['program1_document'], 'http')) {
            $transformedContent['program1_document'] = Storage::url($transformedContent['program1_document']);
        }
        
        // Transform program 2 images and documents
        if (isset($transformedContent['program2_image']) && $transformedContent['program2_image'] && !str_starts_with($transformedContent['program2_image'], 'http')) {
            $transformedContent['program2_image'] = Storage::url($transformedContent['program2_image']);
        }
        if (isset($transformedContent['program2_document']) && $transformedContent['program2_document'] && !str_starts_with($transformedContent['program2_document'], 'http')) {
            $transformedContent['program2_document'] = Storage::url($transformedContent['program2_document']);
        }
        
        // Transform program 3 images and documents
        if (isset($transformedContent['program3_image']) && $transformedContent['program3_image'] && !str_starts_with($transformedContent['program3_image'], 'http')) {
            $transformedContent['program3_image'] = Storage::url($transformedContent['program3_image']);
        }
        if (isset($transformedContent['program3_document']) && $transformedContent['program3_document'] && !str_starts_with($transformedContent['program3_document'], 'http')) {
            $transformedContent['program3_document'] = Storage::url($transformedContent['program3_document']);
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
            'program1_title' => 'required|string|max:255',
            'program2_title' => 'required|string|max:255',
            'program3_title' => 'required|string|max:255',
            'footer_section_title' => 'required|string|max:255',
            'hero_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'program1_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'program1_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:10240',
            'program2_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'program2_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:10240',
            'program3_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'program3_document' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp,pdf,doc,docx|max:10240',
            'footer_image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $data = $request->only([
            'hero_title',
            'hero_subtitle',
            'section_title',
            'program1_title',
            'program2_title',
            'program3_title',
            'footer_section_title'
        ]);

        $oldContent = ExhibitCopc::getContent();

        // Handle hero image upload
        if ($request->hasFile('hero_image')) {
            if ($oldContent->hero_image && Storage::exists($oldContent->hero_image)) {
                Storage::delete($oldContent->hero_image);
            }
            $data['hero_image'] = $request->file('hero_image')->store('exhibit/copc/hero', 'public');
        }

        // Handle program 1 uploads
        if ($request->hasFile('program1_image')) {
            if ($oldContent->program1_image && Storage::exists($oldContent->program1_image)) {
                Storage::delete($oldContent->program1_image);
            }
            $data['program1_image'] = $request->file('program1_image')->store('exhibit/copc/program1', 'public');
        }

        if ($request->hasFile('program1_document')) {
            if ($oldContent->program1_document && Storage::exists($oldContent->program1_document)) {
                Storage::delete($oldContent->program1_document);
            }
            $data['program1_document'] = $request->file('program1_document')->store('exhibit/copc/program1', 'public');
        }

        // Handle program 2 uploads
        if ($request->hasFile('program2_image')) {
            if ($oldContent->program2_image && Storage::exists($oldContent->program2_image)) {
                Storage::delete($oldContent->program2_image);
            }
            $data['program2_image'] = $request->file('program2_image')->store('exhibit/copc/program2', 'public');
        }

        if ($request->hasFile('program2_document')) {
            if ($oldContent->program2_document && Storage::exists($oldContent->program2_document)) {
                Storage::delete($oldContent->program2_document);
            }
            $data['program2_document'] = $request->file('program2_document')->store('exhibit/copc/program2', 'public');
        }

        // Handle program 3 uploads
        if ($request->hasFile('program3_image')) {
            if ($oldContent->program3_image && Storage::exists($oldContent->program3_image)) {
                Storage::delete($oldContent->program3_image);
            }
            $data['program3_image'] = $request->file('program3_image')->store('exhibit/copc/program3', 'public');
        }

        if ($request->hasFile('program3_document')) {
            if ($oldContent->program3_document && Storage::exists($oldContent->program3_document)) {
                Storage::delete($oldContent->program3_document);
            }
            $data['program3_document'] = $request->file('program3_document')->store('exhibit/copc/program3', 'public');
        }

        // Handle footer image upload
        if ($request->hasFile('footer_image')) {
            if ($oldContent->footer_image && Storage::exists($oldContent->footer_image)) {
                Storage::delete($oldContent->footer_image);
            }
            $data['footer_image'] = $request->file('footer_image')->store('exhibit/copc/footer', 'public');
        }

        ExhibitCopc::updateContent($data);

        return back()->with('message', "COPC content updated successfully!");
    }

    /**
     * Get COPC content for public display
     */
    public function show()
    {
        $content = ExhibitCopc::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform program 1 images and documents
        if (isset($transformedContent['program1_image']) && $transformedContent['program1_image'] && !str_starts_with($transformedContent['program1_image'], 'http')) {
            $transformedContent['program1_image'] = Storage::url($transformedContent['program1_image']);
        }
        if (isset($transformedContent['program1_document']) && $transformedContent['program1_document'] && !str_starts_with($transformedContent['program1_document'], 'http')) {
            $transformedContent['program1_document'] = Storage::url($transformedContent['program1_document']);
        }
        
        // Transform program 2 images and documents
        if (isset($transformedContent['program2_image']) && $transformedContent['program2_image'] && !str_starts_with($transformedContent['program2_image'], 'http')) {
            $transformedContent['program2_image'] = Storage::url($transformedContent['program2_image']);
        }
        if (isset($transformedContent['program2_document']) && $transformedContent['program2_document'] && !str_starts_with($transformedContent['program2_document'], 'http')) {
            $transformedContent['program2_document'] = Storage::url($transformedContent['program2_document']);
        }
        
        // Transform program 3 images and documents
        if (isset($transformedContent['program3_image']) && $transformedContent['program3_image'] && !str_starts_with($transformedContent['program3_image'], 'http')) {
            $transformedContent['program3_image'] = Storage::url($transformedContent['program3_image']);
        }
        if (isset($transformedContent['program3_document']) && $transformedContent['program3_document'] && !str_starts_with($transformedContent['program3_document'], 'http')) {
            $transformedContent['program3_document'] = Storage::url($transformedContent['program3_document']);
        }
        
        // Transform footer image
        if (isset($transformedContent['footer_image']) && $transformedContent['footer_image'] && !str_starts_with($transformedContent['footer_image'], 'http')) {
            $transformedContent['footer_image'] = Storage::url($transformedContent['footer_image']);
        }
        
        return Inertia::render('landing/exhibit/copc', [
            'copcContent' => (object) $transformedContent,
        ]);
    }

    /**
     * Get COPC content as API response
     */
    public function getContent()
    {
        $content = ExhibitCopc::getContent();
        
        // Transform image paths for frontend
        $transformedContent = (array) $content;
        
        // Transform hero image
        if (isset($transformedContent['hero_image']) && $transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform program 1 images and documents
        if (isset($transformedContent['program1_image']) && $transformedContent['program1_image'] && !str_starts_with($transformedContent['program1_image'], 'http')) {
            $transformedContent['program1_image'] = Storage::url($transformedContent['program1_image']);
        }
        if (isset($transformedContent['program1_document']) && $transformedContent['program1_document'] && !str_starts_with($transformedContent['program1_document'], 'http')) {
            $transformedContent['program1_document'] = Storage::url($transformedContent['program1_document']);
        }
        
        // Transform program 2 images and documents
        if (isset($transformedContent['program2_image']) && $transformedContent['program2_image'] && !str_starts_with($transformedContent['program2_image'], 'http')) {
            $transformedContent['program2_image'] = Storage::url($transformedContent['program2_image']);
        }
        if (isset($transformedContent['program2_document']) && $transformedContent['program2_document'] && !str_starts_with($transformedContent['program2_document'], 'http')) {
            $transformedContent['program2_document'] = Storage::url($transformedContent['program2_document']);
        }
        
        // Transform program 3 images and documents
        if (isset($transformedContent['program3_image']) && $transformedContent['program3_image'] && !str_starts_with($transformedContent['program3_image'], 'http')) {
            $transformedContent['program3_image'] = Storage::url($transformedContent['program3_image']);
        }
        if (isset($transformedContent['program3_document']) && $transformedContent['program3_document'] && !str_starts_with($transformedContent['program3_document'], 'http')) {
            $transformedContent['program3_document'] = Storage::url($transformedContent['program3_document']);
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
        $copc = ExhibitCopc::first();
        $content = ExhibitCopc::getContent();
        
        return response()->json([
            'raw_record' => $copc,
            'processed_content' => $content,
            'storage_url_sample' => Storage::url('test.pdf'),
        ]);
    }
}
