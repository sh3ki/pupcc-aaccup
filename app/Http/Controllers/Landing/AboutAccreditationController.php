<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Models\Landing\AboutAccreditation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AboutAccreditationController extends Controller
{
    /**
     * Display the admin layout accreditation page
     */
    public function index()
    {
        $content = AboutAccreditation::getContent();
        
        return Inertia::render('admin/layout/AboutAccreditation', [
            'accreditationContent' => $content
        ]);
    }

    /**
     * Get accreditation content for API
     */
    public function getContent()
    {
        $content = AboutAccreditation::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if ($transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform faculty images
        if ($transformedContent['faculty_data']) {
            foreach ($transformedContent['faculty_data'] as &$item) {
                if ($item['image'] && !str_starts_with($item['image'], 'http')) {
                    $item['image'] = Storage::url($item['image']);
                }
            }
        }
        
        // Transform mula sayo image
        if ($transformedContent['mula_sayo_image'] && !str_starts_with($transformedContent['mula_sayo_image'], 'http')) {
            $transformedContent['mula_sayo_image'] = Storage::url($transformedContent['mula_sayo_image']);
        }
        
        return response()->json($transformedContent);
    }

    /**
     * Update accreditation content
     */
    public function update(Request $request)
    {
        try {
            $content = AboutAccreditation::getContent();
            
            $data = [];
            
            // Handle hero section
            if ($request->has('hero_title')) {
                $data['hero_title'] = $request->input('hero_title');
            }
            
            if ($request->has('hero_subtitle')) {
                $data['hero_subtitle'] = $request->input('hero_subtitle');
            }
            
            // Handle hero image upload
            if ($request->hasFile('hero_image')) {
                $file = $request->file('hero_image');
                $path = $file->store('landing/accreditation/hero', 'public');
                $data['hero_image'] = $path;
            }
            
            // Handle faculty section
            if ($request->has('faculty_section_title')) {
                $data['faculty_section_title'] = $request->input('faculty_section_title');
            }
            
            // Handle faculty data
            if ($request->has('faculty_data')) {
                $facultyData = [];
                $facultyItems = json_decode($request->input('faculty_data'), true) ?? [];
                foreach ($facultyItems as $index => $item) {
                    $facultyItem = [
                        'name' => $item['name'] ?? '',
                        'image' => $item['image'] ?? ''
                    ];
                    
                    // Handle file upload for faculty image
                    if ($request->hasFile("faculty_image_{$index}")) {
                        $file = $request->file("faculty_image_{$index}");
                        $path = $file->store('landing/accreditation/faculty', 'public');
                        $facultyItem['image'] = $path;
                    }
                    
                    $facultyData[] = $facultyItem;
                }
                $data['faculty_data'] = $facultyData;
            }
            
            // Handle mula sayo section
            if ($request->has('mula_sayo_title')) {
                $data['mula_sayo_title'] = $request->input('mula_sayo_title');
            }
            
            // Handle mula sayo image upload
            if ($request->hasFile('mula_sayo_image')) {
                $file = $request->file('mula_sayo_image');
                $path = $file->store('landing/accreditation/mula_sayo', 'public');
                $data['mula_sayo_image'] = $path;
            }
            
            $content->update($data);
            
            return response()->json([
                'success' => true,
                'message' => 'Content updated successfully',
                'data' => $content->fresh()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to update accreditation content: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update content: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the landing accreditation page with dynamic content
     */
    public function show()
    {
        $content = AboutAccreditation::getContent();
        
        // Transform image paths for frontend
        $transformedContent = $content->toArray();
        
        // Transform hero image
        if ($transformedContent['hero_image'] && !str_starts_with($transformedContent['hero_image'], 'http')) {
            $transformedContent['hero_image'] = Storage::url($transformedContent['hero_image']);
        }
        
        // Transform faculty images
        if ($transformedContent['faculty_data']) {
            foreach ($transformedContent['faculty_data'] as &$item) {
                if ($item['image'] && !str_starts_with($item['image'], 'http')) {
                    $item['image'] = Storage::url($item['image']);
                }
            }
        }
        
        // Transform mula sayo image
        if ($transformedContent['mula_sayo_image'] && !str_starts_with($transformedContent['mula_sayo_image'], 'http')) {
            $transformedContent['mula_sayo_image'] = Storage::url($transformedContent['mula_sayo_image']);
        }
        
        return Inertia::render('landing/about/accreditation', [
            'accreditationContent' => $transformedContent
        ]);
    }
}
